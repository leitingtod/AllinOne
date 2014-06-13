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
    }
});