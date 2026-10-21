import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { test } from 'vitest';
import { fileURLToPath } from 'node:url';
import { PNG } from 'pngjs';

/*
 * Visual baseline of the preference form and its targeting modal (edit, readonly, nested, discard question).
 * It exists to make the dialog chrome refactoring (Dialog component, CSS modules) safe: the baselines are
 * the pre-refactoring look, so a refactoring step must leave them unchanged.
 *
 * Pixels depend on the fonts, so baselines are produced and compared only in a container
 * (`make test-ui-ipa`); elsewhere the test is skipped like the other tests with optional prerequisites.
 * `UPDATE_SNAPSHOTS=1` rewrites the baselines (review the diff of the PNGs before committing them).
 */

let chromium;
let requireJs;
try {
    chromium = (await import('playwright')).chromium;
    requireJs = fileURLToPath(import.meta.resolve('requirejs/require.js'));
} catch (_) {
    /* Optional browser dependencies. */
}

const root = path.resolve(import.meta.dirname, '../../.test-root');
const snapshotDir = path.join(import.meta.dirname, '__snapshots__', 'dialogs');
const stable = fs.existsSync('/run/.containerenv') || fs.existsSync('/.dockerenv') || process.env.GPO_VISUAL === '1';
const skip =
    !chromium || !requireJs
        ? 'Install playwright and requirejs (npm install in frontend/) for browser checks.'
        : !stable
          ? 'Visual baselines are produced in the dev container (fonts); run `make test-ui-ipa`.'
          : false;
// A pixel counts as different above this per-channel distance; a few anti-aliasing flickers are tolerated.
const CHANNEL_TOLERANCE = 24;
const MAX_DIFFERENT_PIXELS = 30;

const html = `<!doctype html><html><head><meta charset="utf-8">
<link rel="stylesheet" href="/css/main.css"><link rel="stylesheet" href="/css/other.css">
<style>body{font:12px Arial,sans-serif;color:#363636;margin:0}.gp__container{height:100vh;min-width:0}#header{padding:12px}#workspace{height:calc(100vh - 50px)}</style>
</head><body><div class="gp__container"><div id="header"></div><main id="workspace"></main></div>
<script src="/require.js"></script><script>
function field(id,label,kind,value,required=false){return {id,label,value:{kind,value},editable:true,required};}
function commonFields(){return [field('filter.bool','Operator','filter_combine','and'),field('filter.not','Not','boolean',false)];}
function fileFields(value){return commonFields().concat(field('filter.path','Path','text',value,true));}
function detail(){
 const item={identity:['files','opaque-item'],label:'Example file',has_filters:true};
 const fields=[field('properties.action','Action','action','update'),field('properties.fromPath','Source','text','source.txt'),field('metadata.desc','Description','text','Example')];
 const filter_kinds=[{kind:'collection',label:'Collection',supports_children:true,fields:commonFields()},{kind:'file',label:'File match',supports_children:false,fields:fileFields('')}];
 const filters=[
  {path:[0],kind:'collection',label:'Primary Collection',supports_children:true,child_count:1},
  {path:[0,0],kind:'file',label:'File match',detail:'alpha.cmd',supports_children:false,child_count:0},
  {path:[1],kind:'file',label:'File match',detail:'root.cmd',supports_children:false,child_count:0}];
 const filter_fields=[
  {path:[0],fields:commonFields(),available:true},
  {path:[0,0],fields:fileFields('alpha.cmd'),available:true},
  {path:[1],fields:fileFields('root.cmd'),available:true}];
 return {item,fields,new_item_fields:fields,filters,filter_fields,filter_kinds,parent_candidates:[{identity:null,label:'Root',depth:0}]};
}
define('util/API',[],()=>({
 preferenceItems:async()=>({items:[structuredClone(source.item)]}),
 preferenceShow:async(scope,kind,identity)=>{const result=structuredClone(source);if(identity==null)result.item=null;return result;},
 preferenceCreate:async()=>({item:source.item,publication:{changed:true}}),
 preferenceUpdate:async()=>({item:source.item,publication:{changed:true}}),
 reconcile:async()=>({})
}));
require.config({baseUrl:'/js'});
require(['util/element-creator','components/templates/preference/preferences-view-template','locales/translations'],(elements,template,translations)=>{
 const header=elements.createElement('div',{children:[elements.createElement('div',{className:'gp__control',children:[
  elements.createElement('button',{className:['button','preferences__btn-create'],attrs:{type:'button'},text:'Add'}),
  elements.createElement('button',{className:['button','preferences__btn-edit'],attrs:{type:'button'},text:'Edit'}),
  elements.createElement('button',{className:['button','preferences__btn-delete'],attrs:{type:'button'},text:'Remove'})]}),
  elements.createElement('div',{className:'gp__control-actions'})]});
 document.getElementById('header').append(header.getElement());
 window.render=async(options={})=>{
  if(window.view)view.cleanup();translations.setLanguage('en');
  window.source=detail();
  window.view=await template.renderPreferencesTemplate({item:{scope:'computer',preferenceKind:'files',document:{editable:!options.readonly,label:'Files'}},header,isCurrent:()=>true});
  document.getElementById('workspace').replaceChildren(view.getElement());
 };
 render().then(()=>window.ready=true);
});
</script></body></html>`;

async function fixture(run) {
    const server = http.createServer((request, response) => {
        if (request.url === '/') {
            response.setHeader('Content-Type', 'text/html; charset=utf-8');
            return response.end(html);
        }
        const filename = request.url === '/require.js' ? requireJs : path.join(root, request.url);
        try {
            response.setHeader(
                'Content-Type',
                filename.endsWith('.css')
                    ? 'text/css'
                    : filename.endsWith('.svg')
                      ? 'image/svg+xml'
                      : 'application/javascript'
            );
            response.end(fs.readFileSync(filename));
        } catch (_) {
            response.statusCode = 404;
            response.end('Missing');
        }
    });
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    let browser;
    try {
        browser = await chromium.launch({ headless: true });
        const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
        page.setDefaultTimeout(5000);
        const errors = [];
        page.on('pageerror', error => errors.push(error.message));
        await page.goto('http://127.0.0.1:' + server.address().port);
        await page.waitForFunction(() => window.ready, null, { timeout: 10000 });
        await run(page);
        assert.deepEqual(errors, []);
    } finally {
        if (browser) await browser.close();
        await new Promise(resolve => server.close(resolve));
    }
}

/** Compares the page with the stored baseline, or writes it (first run / UPDATE_SNAPSHOTS=1). */
async function expectSnapshot(page, name) {
    await page.mouse.move(0, 0);
    await page.waitForTimeout(800); // modal transitions are 0.5s
    const actual = await page.screenshot({ animations: 'disabled', caret: 'hide' });
    const file = path.join(snapshotDir, name + '.png');
    if (process.env.UPDATE_SNAPSHOTS || !fs.existsSync(file)) {
        if (!process.env.UPDATE_SNAPSHOTS && process.env.CI) assert.fail(`missing baseline ${name}.png`);
        fs.mkdirSync(snapshotDir, { recursive: true });
        fs.writeFileSync(file, actual);
        return;
    }
    const expected = PNG.sync.read(fs.readFileSync(file));
    const received = PNG.sync.read(actual);
    assert.deepEqual([received.width, received.height], [expected.width, expected.height], `${name}: size`);
    let different = 0;
    for (let i = 0; i < expected.data.length; i += 4) {
        for (let c = 0; c < 3; c++) {
            if (Math.abs(expected.data[i + c] - received.data[i + c]) > CHANNEL_TOLERANCE) {
                different++;
                break;
            }
        }
    }
    if (different > MAX_DIFFERENT_PIXELS) {
        fs.mkdirSync(path.join(root, 'visual-diff'), { recursive: true });
        fs.writeFileSync(path.join(root, 'visual-diff', name + '.actual.png'), actual);
    }
    assert.ok(
        different <= MAX_DIFFERENT_PIXELS,
        `${name}: ${different} pixels differ (actual saved to .test-root/visual-diff/${name}.actual.png)`
    );
}

const form = page => page.locator('.gpo-editor-preference-form.active');
const targeting = page => page.locator('.targetting__modal.active');

async function openForm(page) {
    await page.locator('.gpo-editor-preferences__table tbody tr').first().dblclick();
    await form(page).waitFor();
}
async function openTargeting(page) {
    await form(page).locator('.preference__tab-button[data-tab="tab-general"]').click();
    await form(page).locator('.preference__tab-targetting-btn').click();
    await targeting(page).waitFor();
}

test('Preference form, targeting and discard question keep their look', { skip }, async () =>
    fixture(async page => {
        await openForm(page);
        await expectSnapshot(page, 'form-edit');
        await form(page).locator('.preference__tab-button[data-tab="tab-general"]').click();
        await expectSnapshot(page, 'form-edit-general');
        await openTargeting(page);
        await expectSnapshot(page, 'targeting-over-form');
        await targeting(page).locator('.btn-cancel').click();
        await form(page).locator('[data-field-id="metadata.desc"] :is(input, textarea)').fill('changed');
        await form(page).locator('.btn-cancel').click();
        await page.locator('.policy-changed__modal--discard').waitFor();
        await expectSnapshot(page, 'form-discard-question');
    })
);

test('Readonly preference form and targeting keep their look', { skip }, async () =>
    fixture(async page => {
        await page.evaluate(() => render({ readonly: true }));
        await openForm(page);
        await expectSnapshot(page, 'form-readonly');
        await openTargeting(page);
        await expectSnapshot(page, 'targeting-readonly-over-form');
    })
);
