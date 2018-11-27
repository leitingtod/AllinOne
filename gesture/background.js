chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        //console.log(request);
        if (!request.type) return;

        switch (request.type) {
            case 'gesture':
                let type = request.action.split(':')[0];
                let action = request.action.split(':')[1];
                if (type && action) {
                    let callback = config.gesture[type][action];
                    if (typeof callback === 'function')
                        callback(request, sender);
                }
                break;
            case 'gesture_config':
                sendResponse(config);
                break;
        }
    }
);

let config = {
    gestureButton: 2, // 鼠标右键作为手势键
    lengthOfMoving: 10,  //手势起效的最小移动距离
    canvasEnabled: false, //是否启用手势轨迹显示
    scrollEffectEnabled: false, //是否开启页面滚动特效
    closeLastTabWhileCloseWindow: false, //关闭最后一个标签时是否关闭浏览器

    gesture: {
        // 手势定义
        'gesture_action': {
            // 浏览
            'L': function () {
                chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
                    chrome.tabs.sendMessage(tabs[0].id, {type: 'gesture', action: "back"});

                });
            },
            'R': function () {
                chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
                    chrome.tabs.sendMessage(tabs[0].id, {type: 'gesture', action: "forward"});
                });
            },
            'RU': function () {
                chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
                    chrome.tabs.sendMessage(tabs[0].id, {type: 'gesture', action: "scroll2top"});
                });
            },
            'RD': function () {
                chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
                    chrome.tabs.sendMessage(tabs[0].id, {type: 'gesture', action: "scroll2bottom"});
                });
            },
            // 固定标签
            'D': togglePinTab,
            'LRD': togglePinAllTab,
            // 关闭标签
            'DR': closeCurrentTab,
            'LDR': closeRightTabs,
            'RDR': closeLeftTabs,
            'LRDR': closeOtherTabs,
            // 重新打开关闭的标签页
            'LR': reopenClosedTab,
            // 重载所有标签
            'LDRU': reloadAllTabs,
            'DRUL': reloadAllTabs
        },
        'drag_text': {
            'D': google,
            'DL': copy,
            'LD': copy,
            'L': copy,
            // search with default search-engine
            'U': search,
            'R': search,
            'UR': search,
            'RU': search
        },
        'drag_link': {
            'D': copyLinkText,
            'L': copyLinkText,
            'DL': copyLinkText,
            'LD': copyLinkText,
            'U': openLink,
            'R': openLink,
            'UR': openLink,
            'RU': openLink
        },
        'drag_image': {
            'D': saveImage,
            'L': '',
            'DL': '',
            'LD': '',
            'U': '',
            'R': openLink,
            'UR': openLink,
            'RU': openLink
        }
    }
};

function togglePinTab(request, sender) {
    chrome.tabs.update({
        pinned: !sender.tab.pinned
    });
}

function togglePinAllTab() {
    getCurrentWindow(function (window) {
        var tabsUnpinned = 0;
        for (var i = 0 in window.tabs) {
            if (!window.tabs[i].pinned)
                tabsUnpinned++;
        }
        for (var i = 0 in window.tabs) {
            chrome.tabs.update(window.tabs[i].id, {pinned: tabsUnpinned > 0 ? true : false});
        }
    });
}

function closeCurrentTab(request, sender) {
    getCurrentWindow(function (window) {
        if (!config.closeLastTabWhileCloseWindow && window.tabs.length === 1)
            chrome.tabs.create({
                url: "chrome://newtab/",
                selected: false
            });
        chrome.tabs.remove(sender.tab.id);
    });
}

function closeLeftTabs() {
    getCurrentWindow(function (window) {
        for (var i = 0 in window.tabs) {
            if (window.tabs[i].index
                < window.currTab.index
                && !window.tabs[i].pinned)
                chrome.tabs.remove(window.tabs[i].id);
        }
    });
}

function closeRightTabs() {
    getCurrentWindow(function (window) {
        for (var i = 0 in window.tabs) {
            if (window.tabs[i].index
                > window.currTab.index)
                chrome.tabs.remove(window.tabs[i].id);
        }
    });
}

function closeOtherTabs() {
    getCurrentWindow(function (window) {
        for (var i = 0 in window.tabs) {
            if (!window.tabs[i].highlighted
                && !window.tabs[i].pinned)
                chrome.tabs.remove(window.tabs[i].id);
        }
    });
}

function reloadAllTabs() {
    getCurrentWindow(function (window) {
        for (var i = 0 in window.tabs) {
            if (!window.tabs[i].highlighted
                && (window.tabs[i].url.indexOf('chrome://extensions') < 0))
                chrome.tabs.reload(window.tabs[i].id);
        }
    });
}

function reopenClosedTab() {
    chrome.sessions.getRecentlyClosed({
        maxResults: 1
    }, function (entrys) {
        // console.log(entrys);
        chrome.sessions.restore(entrys[0].id);
    });
}

function copy(request, sender) {
    let t = document.createElement("textarea");
    t.id = "crxmousetextarea";
    document.body.appendChild(t);
    let clip_obj = document.getElementById("crxmousetextarea");
    clip_obj.value = request.data;
    clip_obj.select();
    document.execCommand('copy', false, null);
    clip_obj.parentNode.removeChild(clip_obj);
}

function search(request, sender) {
    // 标签:{覆盖,新建:{标签chrome.tabs:{固定pinned,位置index,前后
    // 台:selected },窗口chrome.window:{常规,隐私incognito}}
    let search = "http://www.baidu.com/s?wd=" + request.data;
    getCurrentWindow(function (window) {
        chrome.tabs.create({
            url: search,
            selected: false,
            index: window.currTab.index + 1
        });
    });
}

function google(request, sender) {
    let search = "http://www.google.com.hk/search?q=" + request.data;
    getCurrentWindow(function (window) {
        chrome.tabs.create({
            url: search,
            selected: false,
            index: window.currTab.index + 1
        });
    });
}

function copyLinkText(request, sender) {
    let t = document.createElement("textarea");
    t.id = "crxmousetextarea";
    document.body.appendChild(t);
    let clip_obj = document.getElementById("crxmousetextarea");
    clip_obj.value = request.data;
    clip_obj.select();
    document.execCommand('copy', false, null);
    clip_obj.parentNode.removeChild(clip_obj);
}

function openLink(request, sender) {
    // 在当前标签的右(左，首，尾)面，后台打开新的不固定的搜索标签
    getCurrentWindow(function (window) {
        chrome.tabs.create({
            url: request.data,
            selected: false,
            index: window.currTab.index + 1
        });
    });
}

// copyLinkAddr: function(request, sender) {},
// copyLinkHtml: function(request, sender) {},
// add2Bookmark: function(request, sender) {},

function saveImage(request, sender) {
    chrome.downloads.download({
        url: request.data /* saveAs:true */
    }, function (id) {
    });
}

// copyImgLinkAddr: function(request, sender) {},
// openImgOnNewTab: function(request, sender) {},
// searchImg: function(request, sender) {
// 在当前标签的右(左，首，尾)面，后台打开新的不固定的搜索标签}

function getCurrentWindow(callback) {
    chrome.windows.getCurrent({
        populate: true
    }, function (window) {
        for (let i in window.tabs) {
            if (window.tabs[i].highlighted) {
                window.currTab = window.tabs[i];
                break;
            }
        }
        callback.call(this, window);
    });
}
