chrome.extension.onMessage.addListener(
function (request, sender, sendResponse) {
    //console.log(request);
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
            storage.set('noadplayer', new Date().getTime());
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
        var past = new Date();
        past.setTime(storage.get('noadplayer'));
        if(past) {
            var now = new Date();
            if(past.getYear() == now.getYear())
                if(past.getMonth() == now.getMonth())
                    if(past.getDate() == now.getDate())
                        return;
        }
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

window.setTimeout(function() {
    noadplayer.check();
    window.setInterval(function() {
        noadplayer.check();
    }, 1000*60*30);
}, 2000);
