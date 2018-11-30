chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        //console.log(request);
        if (request && sender) {
            if (request.type && sender.tab) {
                switch (request.type) {
                    case 'float_video':
                        float_video(request, sender);
                        break;

                }
            }
        }
    }
);

function float_video(request, sender) {
    switch (request.action) {
        case 'open':
            chrome.tabs.update(sender.tab.id, {pinned: true});
            // chrome.tabs.query({pinned: false, active: false}, function (tabs) {
            //     for (let i in tabs) {
            //         chrome.tabs.update(tabs[i].id, {active: true});
            //         break;
            //     }
            // });
            break;
        case 'exit':
            chrome.tabs.update(sender.tab.id, {pinned: false});
            // chrome.tabs.update(sender.tab.id, {active: true});
            break;
    }
}
