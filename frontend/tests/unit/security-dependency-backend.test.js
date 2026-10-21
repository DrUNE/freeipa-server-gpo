import assert from 'node:assert/strict';
import { test } from 'vitest';
import { loadModule } from './helpers/load-module.js';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

/*
 * End-to-end check that the dependency planner's output is accepted by the real libadmix.
 * Container-only: it runs /usr/bin/python3 with the admix package against the installed (or
 * SDMX_BASEALT_ROOT) policy definitions and is skipped when the SDMX schema is missing.
 *
 * Flow: Python dumps the real security catalog and snapshot; the JS side builds the model and,
 * for each case (policy id, new value), makes the same update request the UI would (initial
 * draft, planner changes appended as extra policies); a second Python run feeds every request
 * to w.security.update_definitions in a fresh workspace and reports the error text or null.
 * load() loads template modules with element-creator and translations mocked out.
 */
const catalogRoot = process.env.SDMX_BASEALT_ROOT || null;
const definitions = catalogRoot ? path.join(catalogRoot, 'definitions') : '/usr/share/PolicyDefinitions';
const schemas = catalogRoot ? path.join(catalogRoot, 'docs/schema') : '/usr/share/xml/sdmx/1.0';
const schema = path.join(schemas, 'sdmx-1.0.xsd');

const load = (name, mocks) => loadModule('components/templates/' + name, mocks);

// Every case (including boundary values such as 0 and 99999 and cross-dependent Kerberos ages) must
// be accepted atomically: if the planner's proposals ever contradict libadmix validation, the UI
// would build requests the backend rejects.
test(
    'dependency proposals are accepted as one atomic libadmix update',
    {
        skip: !fs.existsSync(schema) || !fs.existsSync(path.join(definitions, 'account-password.sdmx')),
        // It starts the real libadmix in Python (1 s alone); next to the browser projects of a full run that is not
        // enough for the default 5 s.
        timeout: 30000
    },
    async () => {
        const pythonSetup = [
            'import json,tempfile,pathlib',
            'from admix import SecurityDefinitionCatalog,Workspace',
            'catalog=SecurityDefinitionCatalog(' +
                JSON.stringify(definitions) +
                ',locale="en-US",sdmx_schema=' +
                JSON.stringify(schema) +
                ',sdml_schema=' +
                JSON.stringify(path.join(schemas, 'sdml-1.0.xsd')) +
                ')'
        ];
        const fixture = JSON.parse(
            execFileSync(
                '/usr/bin/python3',
                [
                    '-B',
                    '-c',
                    pythonSetup
                        .concat([
                            'with tempfile.TemporaryDirectory() as d:',
                            ' p=pathlib.Path(d); (p/"gpo").mkdir()',
                            ' w=Workspace.open(p/"gpo",security_catalog=catalog,load_preferences=False,state_directory=p/"state",state_key="dependency-catalog")',
                            ' print(json.dumps({"security_catalog":w.security.definition_catalog(),"security_snapshot":w.security.definition_snapshot()}))'
                        ])
                        .join('\n')
                ],
                { encoding: 'utf8', maxBuffer: 8 * 1024 * 1024 }
            )
        );
        const modelTools = await load('security/model.js');
        const model = modelTools.buildSecurityModel(fixture);
        const planner = await load('security/dependency-plan.js');
        const values = await load('security/value-editor.js', {
            '../../../util/element-creator': { createElement: undefined }
        });
        const template = await load('security-template.js', {
            '../../util/element-creator': { createElement: undefined },
            '../../locales/translations': { t: key => key },
            '@gpui/components/security/model': modelTools,
            '@gpui/components/security/value-editor': values
        });
        const cases = [
            ['account-password', 'account.password.maximum_password_age', 42],
            ['account-password', 'account.password.minimum_password_age', 998],
            ['account-lockout', 'account.lockout.lockout_bad_count', 5],
            ['account-lockout', 'account.lockout.lockout_bad_count', 0],
            ['account-lockout', 'account.lockout.reset_lockout_count', 99999],
            ['account-kerberos', 'account.kerberos.max_ticket_age', 7],
            ['account-kerberos', 'account.kerberos.max_service_age', 600],
            ['account-kerberos', 'account.kerberos.max_ticket_age', 0],
            ['account-kerberos', 'account.kerberos.max_service_age', 0],
            ['account-kerberos', 'account.kerberos.max_service_age', 10],
            ['account-kerberos', 'account.kerberos.max_service_age', 99999],
            ['event-log', 'event_log.security_log_retention_days', 7]
        ];
        const requests = cases.map(([part, id, value]) => {
            const namespace = 'urn:altlinux:sdmx:policies:' + part;
            const policy = modelTools.policy(model, { namespace, policy_id: id });
            assert.ok(policy, id);
            const baseline = template._test.initialDraft(policy);
            const draft = JSON.parse(JSON.stringify(baseline));
            const definition = policy.definition.elements.find(element => element.id === 'value');
            draft.defined = true;
            draft.elements.value = { state: 'set', value: { kind: definition.value_type, value } };
            const plan = planner.plan(model, policy, draft);
            const request = template._test.updateRequest(model, policy, baseline, draft);
            for (const change of (plan && plan.changes) || []) {
                assert.equal(template._test.validateDraft(change.policy, change.draft), null, change.policy.policyId);
                request.policies.push(
                    template._test.updateRequest(
                        model,
                        change.policy,
                        template._test.initialDraft(change.policy),
                        change.draft
                    ).policies[0]
                );
            }
            return request;
        });
        const outcomes = JSON.parse(
            execFileSync(
                '/usr/bin/python3',
                [
                    '-B',
                    '-c',
                    pythonSetup
                        .concat([
                            'import sys',
                            'requests=json.load(sys.stdin)',
                            'outcomes=[]',
                            'for index,request in enumerate(requests):',
                            ' with tempfile.TemporaryDirectory() as d:',
                            '  p=pathlib.Path(d); (p/"gpo").mkdir()',
                            '  w=Workspace.open(p/"gpo",security_catalog=catalog,load_preferences=False,state_directory=p/"state",state_key="dependency-"+str(index))',
                            '  try: w.security.update_definitions(request)',
                            '  except Exception as error: outcomes.append(str(error))',
                            '  else: outcomes.append(None)',
                            'print(json.dumps(outcomes))'
                        ])
                        .join('\n')
                ],
                { encoding: 'utf8', input: JSON.stringify(requests), maxBuffer: 8 * 1024 * 1024 }
            )
        );
        assert.deepEqual(
            outcomes,
            cases.map(() => null)
        );
    }
);
