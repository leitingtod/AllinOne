var gesture = {
    platform : window.navigator.userAgent.toLowerCase(),

    init : function () {
        window.addEventListener("mousedown",
            gesture.mousedown, false);
        window.addEventListener("mousemove",
            gesture.mousemove, false);
        window.addEventListener("mouseup",
            gesture.mouseup, false);
        window.addEventListener("contextmenu",
            gesture.contextmenu, false);
    },

    state : {
        start : false,
        path : [],
        last : {
            x : 0,
            y : 0
        },

        reset : function () {
            gesture.state.start = false;
            gesture.state.last.x = 0;
            gesture.state.last.y = 0;
            gesture.state.path = [];
        }
    },

    config : {
        scrollEfffect : false
    },

    mousedown : function (e) {
        // 鼠标右键作为手势键
        if (e.button === 2) {
            gesture.state.start = true;
            gesture.state.last.x = e.clientX;
            gesture.state.last.y = e.clientY;
            gesture.state.path = [];
        }
        return false;
    },

    mousemove : function (e) {
        if (gesture.state.start) {
            var x = e.clientX;
            var y = e.clientY;
            var dx = Math.abs(x - gesture.state.last.x);
            var dy = Math.abs(y - gesture.state.last.y);
            var dir = '';

            if (dx > 5 || dy > 5) {
                if (!canvas.exist()) {
                    canvas.add();
                }
                var p = canvas.svgtag.createSVGPoint();
                p.x = x;
                p.y = y;
                canvas.polyline.points.appendItem(p);
            }
            // 手势起效的最小长度10px
            if (dx < 10 && dy < 10)
                return false;

            if (dx > dy)
                dir = x < gesture.state.last.x ? 'L' : 'R';
            else
                dir = y < gesture.state.last.y ? 'U' : 'D';

            if (dir !==
                gesture.state.path[gesture.state.path.length - 1]) {
                gesture.state.path.push(dir);
            }
            gesture.state.last.x = x;
            gesture.state.last.y = y;
        }
        return false;
    },

    mouseup : function (e) {
        canvas.remove();

        if (gesture.state.path.length > 0) {
            gesture.cancelContextMenu = true;
            gesture.run(gesture.state.path.join(''));
        }

        gesture.state.reset();

        return false;
    },

    contextmenu : function (e) {
        if (gesture.cancelContextMenu) {
            e.preventDefault();
        }
        gesture.cancelContextMenu = false;

        // 在Linux平台下，右键双击显示右击菜单
        if (gesture.platform.indexOf('linux') !== -1
                && !gesture.disableContextMenu) {
            e.preventDefault();
            gesture.disableContextMenu = true;

            gesture.timer = window.setTimeout(function () {
                gesture.disableContextMenu = false;
                window.clearTimeout(gesture.timer);
            }, 600);
        } else {
            gesture.state.reset();
        }

        return false;
    },

    run : function (path) {
        var action = '';
        switch (path) {
            case 'L':// back
                window.history.go(-1);
                break;
            case 'R':// forward
                window.history.go(+1);
                break;
            case 'RU':// scroll to top
                gesture.scroll2top();
                break;
            case 'RD':// scroll to bottom
                gesture.scroll2bottom();
                break;
            case 'DR':// close
                // window.close();
                action = 'close';
                // 如果是最后一个标签，则打开新标签页
                break;
            case 'LDR':// 关闭右侧标签页
                action = 'closeRightTabs';
                break;
            case 'RDR':// 关闭左侧标签页
                action = 'closeLeftTabs';
                break;
            case 'LRDR':// 关闭其他标签页
                action = 'closeOthersTab';
                break;
            case 'LR':// 重新打开关闭的标签页
                action = 'reopenClosedTab';
                break;
            case 'D':// 固定标签页
                action = 'togglePinTab';
                break;
            case 'LRD':
                action = 'togglePinAllTab';
                break;
            case 'LDRU':
                action = 'reloadAllTab';
                break;
        }
        if (action !== '')
            chrome.extension.sendMessage({
                type : "gesture",
                action : action
            });
    },

    scroll2top : function () {
        var allLen = window.pageYOffset + 50;

        if (!gesture.config.scrollEfffect) {
            window.scrollBy(document.documentElement.offsetLeft,
                            -allLen);
            return;
        }
        // scrollEfffect
        var length = 0, N = parseInt(allLen / window.innerHeight);
        if (N > 2) {
            length = allLen - 2 * window.innerHeight;
            window.scrollBy(document.documentElement.offsetLeft,
                    -(allLen - 2 * window.innerHeight));
        }
        var timer = window.setInterval(function () {
            var scroll = (allLen - length) * 0.1;
            window.scrollBy(document.documentElement.offsetLeft,
                            -scroll);
            length += scroll;
            if (length > allLen)
                window.clearInterval(timer);
        }, 5);
    },

    scroll2bottom : function () {
        var allLen = Math.max(document.body.offsetHeight,
                document.body.clientHeight,
                document.body.scrollHeight,
                document.documentElement.offsetHeight,
                document.documentElement.clientHeight,
                document.documentElement.scrollHeight)
                - window.innerHeight - window.pageYOffset + 50;
        if (!gesture.config.scrollEfffect) {
            window.scrollBy(document.documentElement.offsetHeight,
                            allLen);
            return;
        }

        // scrollEfffect
        var length = 0, N = parseInt(allLen / window.innerHeight);
        if (N > 2) {
            length = allLen - 2 * window.innerHeight;
            window.scrollBy(document.documentElement.offsetLeft,
                    (allLen - 2 * window.innerHeight));
        }

        var timer = window.setInterval(function () {
            var scroll = (allLen - length) * 0.1;
            window.scrollBy(document.documentElement.offsetLeft,
                            scroll);
            length += scroll;

            if (length > allLen)
                window.clearInterval(timer);
        }, 5);
    }
};

gesture.init();

var drag = {
    init : function () {
        window.addEventListener('dragstart', drag.dragstart, false);
        window.addEventListener('dragover', drag.dragover, false);
        window.addEventListener('dragend', drag.dragend, false);
        // window.addEventListener('dragenter', drag.dragenter,
        // false); window.addEventListener('drag', drag.drag, false);
        window.addEventListener('drop', drag.drop, false);
    },

    state : {
        start : false,
        path : [],
        last : {
            x : 0,
            y : 0
        },

        reset : function () {
            drag.state.start = false;
            drag.state.last.x = 0;
            drag.state.last.y = 0;
            drag.state.path = [];
        }
    },

    config : {
        scrollEfffect : false
    },

    drop : function (e) {
        e.preventDefault();
    },

    dragstart : function (e) {
        drag.state.start = true;
        drag.state.last.x = e.clientX;
        drag.state.last.y = e.clientY;
        drag.path = [];

        // 使用系统鼠标样式
        e.dataTransfer.effectAllowed = "copy";
        e.dataTransfer.dropEffect = "copy";

        // 分析拖拽对象的类型
        var type = '';
        var imgNode = null;
        switch (e.target.nodeType) {
            case 3:
                type = 'text';
                break;
            case 1: {
                // 输入框中的文本
                if (e.target.value) {
                    type = 'text';

                } // 链接中的文本
                else if (e.target.href) {
                    // 当链接中的文字被选中时，应认为type为文本
                    var s1 = window.getSelection().toString()
                                 .replace(/(\r|\n|\r\n)*/gi, '');
                    if (s1 != '' &&
                        e.target.textContent.indexOf(s1) != -1) {
                        type = 'text';
                    } else {
                        type = 'link';
                    }
                } // 图片
                else if (e.target.src) {
                    imgNode = e.target;
                    if (e.target.parentNode.href
                            && e.target.parentNode.tagName === 'A') {
                        type = 'imagelink';
                        e = e.target.parentNode;
                    } else {
                        type = 'image';
                    }

                }
                break;
            }
        }

        if (!type) {
            drag.start = false;
            return false;
        }

        drag.seltext = window.getSelection().toString()
                           || e.target.innerHTML;
        drag.sellink = e.href || e.target.href;
        if (imgNode)
            drag.selimage = imgNode.src;
        drag.type = type;

        // 将一串文本为url时，识别为链接
        if (type == 'text') {
            if (drag.isURL(drag.seltext)
                || drag.isEmail(drag.seltext)) {
                drag.type = 'link';
                if (/([0-9]{1,3}\.){3}[0-9]{1,3}/.test(drag.seltext))
                    drag.seltext = 'http://' + drag.seltext;
                drag.sellink = drag.seltext;
            }
        }
        return false;
    },

    dragover : function (e) {
        // 使用系统鼠标样式
        e.preventDefault();
        e.dataTransfer.effectAllowed = "copy";
        e.dataTransfer.dropEffect = "copy";

        if (drag.state.start) {
            var x = e.clientX;
            var y = e.clientY;
            var dx = Math.abs(x - drag.state.last.x);
            var dy = Math.abs(y - drag.state.last.y);
            var dir = '';

            if (dx > 5 || dy > 5) {
                if (!canvas.exist()) {
                    canvas.add();
                }
                var p = canvas.svgtag.createSVGPoint();
                p.x = x;
                p.y = y;
                canvas.polyline.points.appendItem(p);
            }
            // 手势起效的最小长度10px
            if (dx < 10 && dy < 10)
                return false;

            if (dx > dy)
                dir = x < drag.state.last.x ? 'L' : 'R';
            else
                dir = y < drag.state.last.y ? 'U' : 'D';

            if (dir !== drag.state.path[drag.state.path.length - 1]) {
                drag.state.path.push(dir);
            }
            drag.state.last.x = x;
            drag.state.last.y = y;
        }
        return false;
    },

    dragend : function (e) {
        canvas.remove();

        if (drag.state.path.length > 0) {
            drag.run[drag.type](drag.state.path.join(''));
        }

        drag.state.reset();

        return false;
    },

    run : {
        text : function (path) {

            var action = '';
            switch (path) {
                case 'D': // search with google
                    action = 'google';
                    break;

                case 'DL': // copy
                case 'LD':
                case 'L':
                    action = 'copy';
                    break;

                case 'U':// scroll to top
                case 'R':
                case 'UR':
                case 'RU': // search with default search-engine
                    action = 'search';
                    break;
            }
            if (action !== '')
                chrome.extension.sendMessage({
                    type : "drag",
                    action : action,
                    data : drag.seltext
                });
        },

        link : function (path) {
            var action = '';
            switch (path) {
                case 'D':
                case 'L':
                case 'DL':
                case 'LD':
                    action = 'copyLinkText';
                    break;
                case 'U':
                case 'R':
                case 'UR':
                case 'RU':
                    action = 'openLink';
                    break;
            }
            if (action !== '')
                chrome.extension.sendMessage({
                    type : "drag",
                    action : action,
                    data : drag.sellink
                });
        },

        imagelink : function (path) {
            var action = '';
            var data = '';
            switch (path) {
                case 'D':
                case 'L':
                case 'DL':
                case 'LD':
                    action = 'saveImage';
                    data = drag.selimage;
                    break;
                case 'U':
                case 'R':
                case 'UR':
                case 'RU':
                    action = 'openLink';
                    data = drag.sellink;
                    break;
            }
            if (action !== '')
                chrome.extension.sendMessage({
                    type : "drag",
                    action : action,
                    data : data
                });
        },

        image : function (path) {
            var action = '';
            switch (path) {
                case 'D':
                case 'L':
                case 'DL':
                case 'LD':
                    action = 'saveImage';
                    break;
            }
            if (action !== '')
                chrome.extension.sendMessage({
                    type : "drag",
                    action : action,
                    data : drag.selimage
                });
        }
    },

    isURL : function (url) {// 验证url
        var re = /^((https|http|ftp|rtsp|mms|chrome):\/\/)?(([0-9a-z_!~*'().&=+$%-]+)(:[0-9a-z_!~*'().&=+$%-]+)?@)?(([0-9]{1,3}\.){3,3}[0-9]{1,3}|([0-9a-z_!~*'()-]+\.)*([0-9a-z][0-9a-z-]{0,61})?[0-9a-z]\.[a-z]{2,6})/gi;

        return re.test(url);
    },

    isEmail : function (str) {

        var re = /^([a-zA-Z0-9]+[_|\-|\.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[_|\-|\.]?)*[a-zA-Z0-9]+\.[a-zA-Z]{2,3}$/;

        return re.test(str);
    }
};

drag.init();

var canvas = {
    id: 'svgdivjlgkpaicikihijadgifklkbpdajbkhjo',
    exist : function () {
        return document.getElementById(canvas.id);
    },

    add : function () {
        var svgdiv = canvas.svgdiv = document.createElement("div");
        svgdiv.id = canvas.id;
        svgdiv.style.width = window.innerWidth + 'px';
        svgdiv.style.height = window.innerHeight + 'px';

        svgdiv.style.position = "fixed";
        svgdiv.style.left = "0px";
        svgdiv.style.top = "0px";
        svgdiv.style.display = "block";
        svgdiv.style.zIndex = 1000000;
        svgdiv.style.background = "transparent";
        svgdiv.style.border = "none";

        var SVG = 'http://www.w3.org/2000/svg';
        var svgtag = canvas.svgtag
                = document.createElementNS(SVG, "svg");
        var polyline = document.createElementNS(SVG, 'polyline');
        polyline.style.stroke = "rgb(18,89,199)";
        // cmg.valuestrokecolor//"rgb(18,89,199)";
        polyline.style.strokeOpacity = 0.9;
        polyline.style.strokeWidth = 5;
        polyline.style.fill = "none";
        // polyline.style.filter="url(#crxmousesvgfilter)"
        canvas.polyline = polyline;
        // svgtag.appendChild(defstag);
        svgtag.appendChild(polyline);
        svgdiv.appendChild(svgtag);
        (document.body || document.documentElement)
            .appendChild(svgdiv);
    },

    remove : function () {
        var node = this.exist();
        if (node) {
            node.parentNode.removeChild(node);
        }
    }
};
