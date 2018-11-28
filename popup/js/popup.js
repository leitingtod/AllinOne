chrome.management.getAll(function (result) {
    let extensions = {};
    result.map(function (extension) {
        extension.name = extension.name.split('：')[0];
        extension.name = extension.name.split('-')[0];
        if (extension.name.indexOf('多合一扩展') === -1) {
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
                    'history': 'history',
                    'bookmarks': 'bookmark',
                    'downloads': 'vertical_align_bottom',
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
                        console.log(tabs[i].url.replace(prefix, '').replace('/', ''), target);
                        if (tabs[i].url.replace(prefix, '').replace('/', '') === target) {
                            chrome.tabs.update(tabs[i].id, {selected: true});
                            window.close();
                            return;
                        }
                    }
                    chrome.tabs.create({url: prefix + target, selected: true});
                    window.close();
                });
            },
            hover: function() {

            },
            status: function (item) {
                return {'status': item.enabled ? 'on' : 'off', 'badge': item.enabled ? 'success' : 'secondary'};
            }
        }
    });
});


