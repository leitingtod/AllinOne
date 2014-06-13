chrome.extension.onMessage.addListener(
function (request, sender, sendResponse) {
    console.log(request);
    if (!request.type) return;

    switch (request.type) {
        case 'gesture':
            if (request.action)
                gesture[request.action](sender);
            break;

        case 'drag':
            if (request.action && request.data)
                drag[request.action](request.data, sender);
            break;

        case 'noadplayer':
            storage.set('noadplayer', 'authorized');
            break;
    }
});

var storage = {
    get: function(a) {
        try {
            return JSON.parse(localStorage[a]);
        } catch (e) {
            //debug && log.log('获取存储内容出错');
            return '';
        }
    },

    set: function(a, b) {
        try {
            return localStorage[a] = JSON.stringify(b);
        } catch (e) {
            return false;
        }
    }
};

var noadplayer = {
    check: function() {
        var flag = storage.get('noadplayer');
        if(flag  && flag === 'authorized')
            return;
        this.getauth();
    },
    getauth: function() {
        getCurrentWindow(function (window) {
            chrome.tabs.create({
                url : 'http://www.noadplayer.com/authorize',
                selected : false,
                pinned: true,
                index : window.curTab.index + 1
            });
        });
    }
};

window.setTimeout(function() {noadplayer.check(); }, 2000);