// The editor's global stylesheets, as served by FreeIPA under /ipa/ui/js/plugins/chain/css/.
import '../../plugin/ui/grouppolicy/css/main.css';
import '../../plugin/ui/grouppolicy/css/other.css';
import * as translations from '../src/locales/translations';

export default {
    decorators: [
        (story, context) => {
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
