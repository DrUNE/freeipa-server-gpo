// The editor's global stylesheets, as served by FreeIPA under /ipa/ui/js/plugins/chain/css/. In production they come
// after the components' CSS Modules (js/app.css); Vite adds a module's styles when the component is imported, which
// happens after this file, so the sheets are appended on the first render instead.
import mainCss from '../../plugin/ui/grouppolicy/css/main.css?url';
import otherCss from '../../plugin/ui/grouppolicy/css/other.css?url';
import * as translations from '../src/locales/translations';

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
