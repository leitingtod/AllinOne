let float = {
    id: 'float_video',
    set: function (v) {
        let p = v.offset();
        let f = $('#' + this.id);
        let style = 'position: absolute; cursor: pointer; z-index: 1000; ' +
            'font-weight: 900; color: red; ';
        let offset = 'left: ' + Math.trunc(p.left + v.width() - f.width() + 1) + 'px; ' +
            'top: ' + Math.trunc(p.top + 1) + 'px; ';
        f.attr('style', style + offset);
    },
    get: function () {
        return $('#' + this.id);
    },
    insert: function () {
        if ($('#' + this.id).length === 0) {
            $('body').append('<i id="' + this.id + '" class="material-icons">open_in_new</i>');
        }
        return $('#' + this.id);
    },
    show: function () {
        if (!document.pictureInPictureEnabled) {
            float.get().hide();
        } else {
            float.get().show();
        }
    },
    hide: function () {
        float.get().hide();
    },
    bind: function (v) {
        let f = this.get();
        f.hover(function (e) {
            this.style.color = 'dodgerblue';
            return false;
        }, function () {
            this.style.color = 'red';
            return false;
        });

        f.click(function () {
            try {
                if (!document.pictureInPictureElement) {
                    v[0].requestPictureInPicture()
                        .catch(error => {
                            // 视频无法进入画中画模式
                        });
                } else {
                    document.exitPictureInPicture()
                        .catch(error => {
                            // 视频无法退出画中画模式
                        });
                }
            } catch {
                // console.trace();
            }
        });
    }
};

let video = {
    bind: function (v) {
        v.hover(function (e) {
            try {
                if (e.relatedTarget.id !== float.id) {
                    float.set(v);
                    float.show();
                }
            } catch {
                // console.trace();
            }
            return false;
        }, function (e) {
            try {
                if (e.relatedTarget.id !== float.id) {
                    float.hide();
                }
            } catch {
                // console.trace();
            }
            return false;
        });
        v.on('mousemove', function () {
            float.set(v);
            if (float.get().is(':visible')) {
                v.unbind('mousemove');
            }
        });
        v.one('leavepictureinpicture', function () {
            chrome.runtime.sendMessage({type: 'float_video', action: 'exit'});
            this.play();
            return false;
        });
        v.one('enterpictureinpicture', function () {
            chrome.runtime.sendMessage({type: 'float_video', action: 'open'});
            this.play();
            return false;
        });
    },
    grab: function () {
        try {
            // <video>
            // weibo 类网站需要点击才会存在 <video>，通过监听页面的 ready 事件触发$('video)
            // youku 类网站载入后存在 <video>，通过监听页面的 ready 事件触发$('video)
            // 通过监听 video 的 playing 事件自动添加 float icon
            let vs = $('video');
            vs.map(function (v) {
                v = $(vs[v]);
                video.bind(v);
                v.on('playing', function () {
                    float.insert();
                    float.bind(v);
                    // float.set(v);
                })
            });
            // non-hmtl5 类网站载入后存在 <embed>
            //float.timer = setInterval(function () {}, 1000);
            let es = $('embed');
            es.map(function (v) {
                v = $(es[v]).parent();
                video.bind(v);
                float.insert();
                float.bind(v);
                float.set(v);
            });
        } catch {
            console.trace();
        }
    }
};

window.addEventListener('load', function () {
    video.grab();
    $(document).click(function () {
        video.grab();
    });
});
