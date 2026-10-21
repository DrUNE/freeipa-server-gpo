// The editor's global stylesheets, (src/styles). In production they come
// after the components' CSS Modules (js/app.css); Vite adds a module's styles when the component is imported, which
// happens after this file, so the sheets are appended on the first render instead.
import mainCss from '@gpui/styles/main.css?url';
import otherCss from '@gpui/styles/other.css?url';
// The components' CSS Modules read the design tokens; unlike the global sheets they are needed from the first render.
import '@gpui/styles/tokens.css';
import * as translations from '@gpui/locales/translations';

let globalSheets = false;
function addGlobalSheets() {
    if (globalSheets) return;
    globalSheets = true;
    for (const href of [mainCss, otherCss])
        document.head.append(Object.assign(document.createElement('link'), { rel: 'stylesheet', href }));
}

export default {
    decorators: [
        (story, context) => {
            addGlobalSheets();
            translations.setLanguage(context.globals.locale);
            return story();
        }
    ],
    globalTypes: {
        locale: {
            description: 'Editor language',
            toolbar: { icon: 'globe', items: ['en', 'ru'], dynamicTitle: true }
        }
    },
    initialGlobals: { locale: 'en' }
};
