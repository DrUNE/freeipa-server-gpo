/**
 * Helpers of the screen stories: a screen is rendered the way the editor does it (into the editor's root class, after the
 * policy has been opened through `util/API`, which talks to the fake server of the current scenario).
 */
import * as API from '@gpui/util/API';
import { renderError } from '@gpui/components/editor-status';

/**
 * Mounts a screen: `build()` is called once the policy is open and returns the screen (an element, an ElementCreator, or a
 * promise of either). While it loads the host says so; when it fails the host shows what the editor would show.
 * @param {() => any} build
 * @returns {HTMLElement}
 */
export function mountScreen(build) {
    const host = document.createElement('div');
    host.className = 'gp__container';
    host.style.cssText = 'min-height: 320px; max-width: 900px;';
    host.setAttribute('data-screen', 'loading');
    API.initialize('Dev GPO')
        .then(() => build())
        .then(view => {
            if (!view) return;
            host.replaceChildren(view.getElement ? view.getElement() : view);
            host.setAttribute('data-screen', 'ready');
        })
        .catch(error => {
            host.replaceChildren(renderError(error).getElement());
            host.setAttribute('data-screen', 'error');
        });
    return host;
}
