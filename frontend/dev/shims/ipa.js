/**
 * Development shim for the FreeIPA `freeipa/ipa` module.
 *
 * Only the surface used by plugin/ui/grouppolicy/js is provided.
 */
function toast(message, type) {
    var host = document.getElementById('dev-notify');
    if (!host) return;
    var node = document.createElement('div');
    node.className = 'dev-notify__item dev-notify__item--' + (type || 'info');
    node.textContent = message;
    host.appendChild(node);
    setTimeout(function () {
        node.remove();
    }, 6000);
}

var IPA = {
    api_version: '2.254',
    notify: function (message, type) {
        console.log('[IPA.notify]', type || 'info', message);
        toast(message, type);
    },
    notify_success: function (message) {
        console.log('[IPA.notify_success]', message);
        toast(message, 'success');
    }
};

window.IPA = IPA;
export default IPA;
