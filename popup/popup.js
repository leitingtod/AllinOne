$(function() {
    quickvisit.init();
    extlist.init();
    grabword.init();
    copyfree.init();
    capture.init();

    function tabswitch(selector, win) {
        var bh = 0, bw = 0, tab;
        switch(selector) {
            case '#extlistC':
                tab = 2;
                bh = $('#extlist').height()+21;
                bw = 252;
                $('#tools>ul>li>a').css('padding', '4px 40px');
                $('#tools').css('width', '244px');
                break;
            case '#captureC':
                tab = 1;
                bh = $('#capture').height()+21;
                bw = 144;
                $('#tools>ul>li>a').css('padding', '4px 22px');
                 $('#tools').css('width', '136px');
                break;
            case '#quickvisitC':
                tab = 0;
                bh = $('#quickvisit').height()+21;
                bw = 114;
                $('#tools>ul>li>a').css('padding', '4px 17px');
                $('#tools').css('width', '106px');
                break;                                        
        }
        if(win)
            $('body').css({'width': win.w+'px', 'height': win.h+'px'});
        else
            $('body').css({'width': bw+'px', 'height': bh+'px'});
        //window.resizeTo(win.bw, win.bh);
        return {w: bw, h: bh, tab: tab, selector: selector};
    }

    var win = storage.get('popupWindow');
    
    $('#tools').tabs({heightStyle: 'content', event: 'click', 
        active: win.tab,
        activate: function(e, ui) {
            var win = tabswitch(ui.newPanel.selector);
            storage.set('popupWindow', win);
            window.location.reload();
        }
    });
    if(!win) win = {w: 114, h: 198, tab: 0, selector: '#quickvisitC'};
    tabswitch(win.selector, win);
    
    $('#quickvisit a, #extlist a').each(function() {
        $(this).mouseover(function() {
            $(this).css('background-color', '-webkit-gradient(linear, 0 0, 100% 100%, color-stop(0, rgb(254,233,150)), color-stop(0.6, rgb(254,216,233)), color-stop(1, #ffdd57)'); 
        });

        $(this).mouseout(function() {
            $(this).css('background-color', 'transparent'); 
        });
    }); 
});

var grabword = {
    init: function() {
        storage.set('grabword', false);
        if(storage.get('grabword')) { 
            $('#grabword').css('background-image', 'url(../css/img/dict.png)');
            $('#grabword').text('关闭取词'); 
        } else {
            $('#grabword').css('background-image', 'url(../css/img/nodict.png)');
            $('#grabword').text('开启取词');
        }
        chrome.tabs.getSelected(null, function(tab) {
            if (tab.url.indexOf('chrome') == 0 || tab.url.indexOf('about') == 0) {
                $('#grabword').addClass('ui-disabled');
            } else {
                $('#grabword').click(function() {  grabword.toggle(); });	
            }             
        });
    },

    toggle: function() {
        if(storage.get('grabword')) {
            storage.set('grabword', false);
            $('#grabword').text('开启取词');
            $('#grabword').css('background-image', 'url(../css/img/nodict.png)');
        } else {
            storage.set('grabword', true);
            $('#grabword').css('background-image', 'url(../css/img/dict.png)');
            $('#grabword').text('关闭取词');
        }
        chrome.windows.getCurrent({populate: true}, function(window) {
            for (var i in window.tabs) {
                chrome.tabs.sendMessage(window.tabs[i].id, {
                    type: 'grabword', 
                    data: { setgrabstatus: storage.get('grabword')}
                });
            }
        }); 
    }
};

var copyfree = {
    init: function() {
        chrome.tabs.getSelected(null, function(tab) {
            if (tab.url.indexOf('chrome') == 0 || tab.url.indexOf('about') == 0) {
                $('#copyfree').addClass('ui-disabled');
            } else {
                $('#copyfree').click(function() {  
                    copyfree.unfreeze(); 
                    //chrome.windows.getCurrent({populate: true}, function(window) {
                    //    for (var i in window.tabs) {
                    //        chrome.tabs.sendMessage(window.tabs[i].id, {
                    //            type: 'copyfree', 
                    //            data: { grabword: storage.get('grabword')}
                    //        });
                    //    }
                    //});             
                    $(this).css('background-image', 'url(../css/img/copyfreeyes.png)');
                });	
            }   
        });     

    },
    
    unfreeze: function() {
        chrome.windows.getCurrent({populate: true}, function(window) {
            for (var i in window.tabs) {
                if (window.tabs[i].highlighted) {
                    chrome.tabs.executeScript(window.tabs[i].id, {
                        file: 'contenscripts/copyfree.js',
                        allFrames: true
                    });
                    break;
                }
            }
        });        
    }
};

var capture = {
    init: function() {
        function onClick() {
            $(this).click(function() {
                var id = this.id;
                switch(id) {
                    case 'screen':
                        chrome.extension.sendMessage({type: 'capture', data: {action: id}});
                        break;
                    default:
                        chrome.tabs.getSelected(null, function(tab) { 
                            chrome.tabs.sendMessage(tab.id, {type: 'capture', data: {action: id}});
                        });
                        break;
                }
            });
        }; 
        chrome.tabs.getSelected(null, function(tab) {
            if (tab.url.indexOf('chrome') == 0 || tab.url.indexOf('about') == 0) {
                $('#selarea, #viewport, #fullpage').addClass('ui-disabled');
                $('#screen').each(onClick);
            } else {
                $('#selarea, #viewport, #fullpage, #screen').each(onClick);
            }
        });
        $('#capture').menu();  
    }
};
        
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
