let config = null;

function init() {
    window.addEventListener("mousedown", mouse_down, false);
    window.addEventListener("mousemove", mouse_move, false);
    window.addEventListener("mouseup", mouse_up, false);
    window.addEventListener("contextmenu", context_menu, false);

    window.addEventListener('dragstart', drag_start, false);
    window.addEventListener('dragover', drag_over, false);
    window.addEventListener('dragend', drag_end, false);
    // window.addEventListener('dragenter', drag.dragenter,false);
    // window.addEventListener('drag', drag.drag, false);
    window.addEventListener('drop', drag_drop, false);

    chrome.runtime.sendMessage({
        type: 'gesture_config'
    }, function (response) {
        console.log(response);
        config = response;
    });
}

function gesture_action_exec(path) {
    chrome.runtime.sendMessage({
        type: 'gesture',
        action: path,
        data: state.selected
    });
}


let gesture = {
    'back': function () {
        window.history.go(-1);
    },
    'forward': function () {
        window.history.go(1);
    },
    'scroll2top': scroll2top,
    'scroll2bottom': scroll2bottom
};

chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        //console.log(request);
        if (!request.type) return;

        switch (request.type) {
            case 'gesture':
                let action = request.action;
                if (action) {
                    let callback = gesture[action];
                    if (typeof callback === 'function')
                        callback();
                }
                break;
        }
    }
);

state = {
    start: false,
    path: [],
    last: {x: 0, y: 0},
    selected: '',
    dragType: '',
    stopContextMenuPopup: false,
    reset: function () {
        state.start = false;
        state.path = [];
    }
};

platform = window.navigator.userAgent.toLowerCase();

function mouse_down(e) {
    if (e.button === config.gestureButton) {
        state.start = true;
        state.last.x = e.clientX;
        state.last.y = e.clientY;
        state.path = [];
    }
    return false;
}

function mouse_move(e) {
    if (state.start) {
        let x = e.clientX;
        let y = e.clientY;
        let dx = Math.abs(x - state.last.x);
        let dy = Math.abs(y - state.last.y);
        let dir = '';

        if (dx < config.lengthOfMoving && dy < config.lengthOfMoving)
            return false;

        if (dx > dy)
            dir = x < state.last.x ? 'L' : 'R';
        else
            dir = y < state.last.y ? 'U' : 'D';

        if (dir !== state.path[state.path.length - 1]) {
            state.path.push(dir);
        }
        state.last.x = x;
        state.last.y = y;
    }
    return false;
}

function mouse_up(e) {
    if (e.button === config.gestureButton) {
        if (state.path.length > 0) {
            gesture_action_exec('gesture_action:' + state.path.join(''));
            // 阻止右键手势结束后弹出上下文菜单
            state.stopContextMenuPopup = true;
        }

        state.reset();
    }
    return false;
}

function context_menu(e) {
    // mouse_up 事件会先于 context_menu 事件出现
    // 当右键产生移动且达到手势识别条件时，阻止弹出上下文菜单
    if (state.stopContextMenuPopup) {
        e.preventDefault();
        state.stopContextMenuPopup = false;
    }

    state.reset();
    return false;
}

function drag_start(e) {
    state.start = true;
    state.last.x = e.clientX;
    state.last.y = e.clientY;
    state.path = [];

    // 使用系统鼠标样式
    e.dataTransfer.effectAllowed = "copy";
    e.dataTransfer.dropEffect = "copy";

    let type = get_element_type(e);

    if (!type) {
        state.start = false;
        return false;
    }

    switch (type) {
        case 'text':
            state.selected = window.getSelection().toString() || e.target.innerHTML;
            break;
        case 'link':
            state.selected = e.href || e.target.href || e.target.parentNode.href;
            break;
        case 'image':
            state.selected = e.target.src;
            break;

    }
    state.dragType = type;
    return false;
}

function drag_over(e) {
    // 使用系统鼠标样式
    e.preventDefault();
    e.dataTransfer.effectAllowed = "copy";
    e.dataTransfer.dropEffect = "copy";

    mouse_move(e);

    return false;
}

function drag_end() {
    if (state.path.length > 0) {
        gesture_action_exec('drag_' + state.dragType + ':' + state.path.join(''));
    }

    state.reset();
    return false;
}

function drag_drop(e) {
    e.preventDefault();
}

function get_element_type(e) {
    // 分析拖拽对象的类型
    let type = '';

    switch (e.target.nodeType) {
        case 1: // ELEMENT_NODE
            // 输入框
            if (e.target.value) {
                type = 'text';
            } // 链接
            else if (e.target.href) {
                // 当链接中的文字被选中时，应认为type为文本
                let selected = window.getSelection().toString().trim();
                if (selected !== '' && e.target.textContent.indexOf(selected) !== -1) {
                    type = 'text';
                } else {
                    type = 'link';
                }
            } // 图片
            else if (e.target.src) {
                if (e.target.parentNode.href && e.target.parentNode.tagName === 'A') {
                    type = 'link';
                } else {
                    type = 'image';
                }
            }
            break;
        case 3: // TEXT_NODE
            type = 'text';
            break;
    }

    return type;
}

function scroll2top() {
    let allLen = window.pageYOffset + 50;

    if (!config.scrollEffectEnabled) {
        window.scrollBy(document.documentElement.offsetLeft,
            -allLen);
        return;
    }
    // scrollEffect
    let length = 0, N = parseInt(allLen / window.innerHeight);
    if (N > 2) {
        length = allLen - 2 * window.innerHeight;
        window.scrollBy(document.documentElement.offsetLeft,
            -(allLen - 2 * window.innerHeight));
    }
    let timer = window.setInterval(function () {
        let scroll = (allLen - length) * 0.1;
        window.scrollBy(document.documentElement.offsetLeft,
            -scroll);
        length += scroll;
        if (length > allLen)
            window.clearInterval(timer);
    }, 5);
}

function scroll2bottom() {
    let allLen = Math.max(document.body.offsetHeight,
        document.body.clientHeight,
        document.body.scrollHeight,
        document.documentElement.offsetHeight,
        document.documentElement.clientHeight,
        document.documentElement.scrollHeight)
        - window.innerHeight - window.pageYOffset + 50;
    if (!config.scrollEffectEnabled) {
        window.scrollBy(document.documentElement.offsetHeight, allLen);
        return;
    }

    // scrollEffect
    let length = 0, N = parseInt(allLen / window.innerHeight);
    if (N > 2) {
        length = allLen - 2 * window.innerHeight;
        window.scrollBy(document.documentElement.offsetLeft,
            (allLen - 2 * window.innerHeight));
    }

    let timer = window.setInterval(function () {
        let scroll = (allLen - length) * 0.1;
        window.scrollBy(document.documentElement.offsetLeft, scroll);
        length += scroll;

        if (length > allLen)
            window.clearInterval(timer);
    }, 5);
}

init();