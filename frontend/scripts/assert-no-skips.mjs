// Fails when a test run skipped anything. The suite has optional prerequisites (libadmix, the SDMX
// catalog, FreeIPA's jQuery, Chromium); in CI and in the dev container they must all be present,
// otherwise a "green" run would hide tests that did not execute.
// Usage: vitest run ... --reporter=default --reporter=json --outputFile.json=test-results.json
//        node scripts/assert-no-skips.mjs [test-results.json]
import fs from 'node:fs';

const file = process.argv[2] || 'test-results.json';
if (!fs.existsSync(file)) {
    console.error(`${file} not found: run vitest with --reporter=json --outputFile.json=${file} first.`);
    process.exit(2);
}
const report = JSON.parse(fs.readFileSync(file, 'utf8'));
const skipped = [];
for (const suite of report.testResults) {
    for (const test of suite.assertionResults) {
        if (test.status === 'skipped' || test.status === 'pending') {
            skipped.push(`${suite.name.split('/frontend/')[1] || suite.name}: ${test.fullName}`);
        }
    }
}
if (skipped.length) {
    console.error(
        `${skipped.length} test(s) were skipped; every prerequisite must be installed:\n  ${skipped.join('\n  ')}`
    );
    process.exit(1);
}
console.log(`no skipped tests (${report.numTotalTests} run)`);
