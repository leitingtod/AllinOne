var quickvisit = {
    init: function() {
        var extension = 'chrome://extensions/',
            history = 'chrome://history/',
            downloads = 'chrome://downloads/',
            bookmarks = 'chrome://bookmarks/';  
              
        $('#extension').click(function() { quickvisit.openTab(extension); return false; });	
        $('#history').click(function() { quickvisit.openTab(history); return false; });	
        $('#bookmarks').click(function() { quickvisit.openTab(bookmarks); return false; });	
        $('#downloads').click(function() { quickvisit.openTab(downloads); return false; });

        $('#quickvisit').menu();
    },

    openTab: function(prefixUrl) {
        chrome.tabs.getAllInWindow(null, function (tabs) {
            for (var i = 0; i < tabs.length; i++) {
                if (tabs[i].url.length >= prefixUrl.length && tabs[i].url.substr(0, prefixUrl.length) == prefixUrl) {
                    chrome.tabs.update(tabs[i].id, { selected: true });
                    window.close();
                    return;
                }
            }
            chrome.tabs.create({ url: prefixUrl, selected: true });
            window.close();
        });
    }
};

