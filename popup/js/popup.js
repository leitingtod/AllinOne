chrome.management.getAll(function (result) {
    let extensions = {};
    result.map(function (extension) {
        extension.name = extension.name.split('：')[0];
        extension.name = extension.name.substring(0, 11);

        if (byteLength(extension.name) > 11) {
            extension.name = extension.name.split('-')[0]
        }

        if ((extension.icons != null && extension.icons.length > 0) &&
            extension.name.indexOf('多合一扩展') === -1) {
            extensions[extension.id] = extension;
        }
    });

    enabled = result.filter(function (extension) {
        return extension.enabled;
    });

    new Vue({
        el: '#app',
        data() {
            return {
                extensions: extensions,
                statics: enabled.length + '/' + result.length,
                visits: {
                    'history': 'watch_later',
                    'bookmarks': 'bookmark',
                    'downloads': 'get_app',
                    'extensions': 'extension',
                    'settings': 'settings'
                }
            }
        },
        methods: {
            toggle: function (extension) {
                let enabled = extension.enabled;
                chrome.management.setEnabled(extension.id, !enabled);
                extensions[extension.id].enabled = !enabled;
            },
            open: function (target) {
                chrome.tabs.getAllInWindow(null, function (tabs) {
                    let prefix = 'chrome://';
                    for (var i = 0; i < tabs.length; i++) {
                        if (tabs[i].url.replace(prefix, '').replace('/', '') === target) {
                            chrome.tabs.update(tabs[i].id, {
                                selected: true
                            });
                            window.close();
                            return;
                        }
                    }
                    chrome.tabs.create({
                        url: prefix + target,
                        selected: true
                    });
                    window.close();
                });
            },
            hover: function () {

            },
            status: function (item) {
                return {
                    'status': item.enabled ? 'on' : 'off',
                    'badge': item.enabled ? 'success' : 'secondary'
                };
            }
        }
    });
});

// https://stackoverflow.com/questions/5515869/string-length-in-bytes-in-javascript
function byteLength(str) {
    // returns the byte length of an utf8 string
    var s = str.length;
    for (var i = str.length - 1; i >= 0; i--) {
        var code = str.charCodeAt(i);
        if (code > 0x7f && code <= 0x7ff) s++;
        else if (code > 0x7ff && code <= 0xffff) s += 2;
        if (code >= 0xDC00 && code <= 0xDFFF) i--; //trail surrogate
    }
    return s;
}
