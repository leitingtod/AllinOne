var gesture = {
    closeLastTabWhileCloseWindow : false,

    close : function (sender) {
        getCurrentWindow(function (window) {
            if (!gesture.closeLastTabWhileCloseWindow
                    && window.curWindow.tabs.length == 1)
                chrome.tabs.create({
                    url : "chrome://newtab/",
                    selected : false
                });
            chrome.tabs.remove(sender.tab.id);
        });
    },

    closeLeftTabs : function (sender) {
        getCurrentWindow(function (window) {
            for ( var i = 0 in window.curWindow.tabs) {
                if (window.curWindow.tabs[i].index
                    < window.curTab.index
                        && !window.curWindow.tabs[i].pinned)
                    chrome.tabs.remove(window.curWindow.tabs[i].id);
            }
        });
    },

    closeRightTabs : function (sender) {
        getCurrentWindow(function (window) {
            for ( var i = 0 in window.curWindow.tabs) {
                if (window.curWindow.tabs[i].index
                    > window.curTab.index)
                    chrome.tabs.remove(window.curWindow.tabs[i].id);
            }
        });
    },

    closeOthersTab : function () {
        getCurrentWindow(function (window) {
            for ( var i = 0 in window.curWindow.tabs) {
                if (!window.curWindow.tabs[i].highlighted
                        && !window.curWindow.tabs[i].pinned)
                    chrome.tabs.remove(window.curWindow.tabs[i].id);
            }
        });
    },

    togglePinTab : function (sender) {
        chrome.tabs.update({
            pinned : !sender.tab.pinned
        });
    },

    togglePinAllTab : function () {
        getCurrentWindow(function (window) {
            var tabsUnpinned = 0;
            for ( var i = 0 in window.curWindow.tabs) {
                if(!window.curWindow.tabs[i].pinned)
                    tabsUnpinned++;
            }
            for ( var i = 0 in window.curWindow.tabs) {
                chrome.tabs.update(window.curWindow.tabs[i].id, {pinned: tabsUnpinned>0?true:false});
            }
        });
    },

    reloadAllTab : function() {
        getCurrentWindow(function (window) {
            for ( var i = 0 in window.curWindow.tabs) {
                if (!window.curWindow.tabs[i].highlighted
                        && (window.curWindow.tabs[i].url.indexOf('chrome://extensions') < 0))
                    chrome.tabs.reload(window.curWindow.tabs[i].id);
            }
        });
    },

    reopenClosedTab : function (sender) {
        chrome.sessions.getRecentlyClosed({
            maxResults : 1
        }, function (entrys) {
            console.log(entrys);
            chrome.sessions.restore(entrys[0].id);
        });
    }

};

var drag = {
    copy : function (data, sender) {
        var t = document.createElement("textarea");
        t.id = "crxmousetextarea";
        document.body.appendChild(t);
        clipobj = document.getElementById("crxmousetextarea");
        clipobj.value = data;
        clipobj.select();
        document.execCommand('copy', false, null);
        clipobj.parentNode.removeChild(clipobj);
    },

    search : function (data, sender) {
        // 标签:{覆盖,新建:{标签chrome.tabs:{固定pinned,位置index,前后
        // 台:selected },窗口chrome.window:{常规,隐私incognito}}
        var search = "http://www.baidu.com/s?wd=" + data;
        getCurrentWindow(function (window) {
            chrome.tabs.create({
                url : search,
                selected : false,
                index : window.curTab.index + 1
            });
        });
    },

    google : function (data, sender) {
        var search = "http://www.google.com.hk/search?q=" + data;
        getCurrentWindow(function (window) {
            chrome.tabs.create({
                url : search,
                selected : false,
                index : window.curTab.index + 1
            });
        });
    },

    copyLinkText : function (data, sender) {
        var t = document.createElement("textarea");
        t.id = "crxmousetextarea";
        document.body.appendChild(t);
        clipobj = document.getElementById("crxmousetextarea");
        clipobj.value = data;
        clipobj.select();
        document.execCommand('copy', false, null);
        clipobj.parentNode.removeChild(clipobj);
    },

    openLink : function (data, sender) {
        // 在当前标签的右(左，首，尾)面，后台打开新的不固定的搜索标签
        getCurrentWindow(function (window) {
            chrome.tabs.create({
                url : data,
                selected : false,
                index : window.curTab.index + 1
            });
        });
    },

    // copyLinkAddr: function(request, sender) {},
    // copyLinkHtml: function(request, sender) {},
    // add2Bookmark: function(request, sender) {},

    saveImage : function (data, sender) {
        chrome.downloads.download({
            url : data /* saveAs:true */
        }, function (id) {
        });
    }
    // copyImgLinkAddr: function(request, sender) {},
    // openImgOnNewTab: function(request, sender) {},
    // searchImg: function(request, sender) {
    // 在当前标签的右(左，首，尾)面，后台打开新的不固定的搜索标签}
};

function getCurrentWindow (callback) {
    chrome.windows.getCurrent({
        populate : true
    }, function (window) {
        var WindowRC = {};
        WindowRC.curWindow = window;

        for ( var i in window.tabs) {
            if (window.tabs[i].highlighted) {
                WindowRC.curTab = window.tabs[i];
                break;
            }
        }
        callback.call(this, WindowRC);
    });
}