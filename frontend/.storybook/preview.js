// The editor's global stylesheets, (src/styles). In production they come
// after the components' CSS Modules (js/app.css); Vite adds a module's styles when the component is imported, which
// happens after this file, so the sheets are appended on the first render instead.
import mainCss from '@gpui/styles/main.css?url';
import otherCss from '@gpui/styles/other.css?url';
// The components' CSS Modules read the design tokens; unlike the global sheets they are needed from the first render.
import '@gpui/styles/tokens.css';
import * as translations from '@gpui/locales/translations';
import { useScenario } from './shims/rpc.js';

let globalSheets = false;
function addGlobalSheets() {
    if (globalSheets) return;
    globalSheets = true;
    for (const href of [mainCss, otherCss])
        document.head.append(Object.assign(document.createElement('link'), { rel: 'stylesheet', href }));
}

export default {
    tags: ['autodocs'],
    decorators: [
        (story, context) => {
            addGlobalSheets();
            translations.setLanguage(context.globals.locale);
            // The behaviour of the fake server: `parameters.rpc.scenario` of the story, else the toolbar choice.
            useScenario((context.parameters.rpc && context.parameters.rpc.scenario) || context.globals.scenario);
            return story();
        }
    ],
    globalTypes: {
        locale: {
            description: 'Editor language',
            toolbar: { icon: 'globe', items: ['en', 'ru'], dynamicTitle: true }
        },
        scenario: {
            description: 'Behaviour of the fake server (screens)',
            toolbar: { icon: 'lightning', items: ['normal', 'error', 'slow', 'empty'], dynamicTitle: true }
        }
    },
    initialGlobals: { locale: 'en', scenario: 'normal' },
    parameters: {
        // Every story is also an accessibility check; `error` fails the story test on a violation.
        a11y: { test: 'error' }
    }
};
