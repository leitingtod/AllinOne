storage.set('alldisabled', false);

var extlist = {
    init: function() {
        extlist.create();
    },

    isSelf: function(id) {
        return chrome.extension.getURL('').indexOf(id) != -1;
    },

    create: function(callback) {
        // $('#extlist').menu('destroy');
        chrome.management.getAll(function(ret) { 
            var html = '', onekey = '';
            var apps = [];
            var icons = {};
            for(var i=0, _i=ret.length; i<_i; i++) {
                if(ret[i].isApp) {
                    // apps.push(ret[i]);
                    continue;
                }
                
                var classname = ret[i].enabled ? 'enabled': 'disabled',
                    icon = ret[i].icons ? ret[i].icons[0].url : 'css/img/defaulticon.png',
                    title = ret[i].enabled ? '单击左键禁用该扩展，单击右键卸载该扩展' :
                        '单击左键启用该扩展，单击右键卸载该扩展';
                icons[ret[i].id] = icon;  
                
                if(extlist.isSelf(ret[i].id)) {
                    var name = storage.get('alldisabled') ? '启用原有扩展' : '禁用所有扩展';
                    onekey += '<li><a '
                        + ' class="' + classname + '"'
                        + ' id="' + ret[i].id + '"'
                        + ' style="background:url('+icon+') 62px 50% no-repeat; text-indent: 82px; -webkit-background-size: 20px 20px;">'
                        + name +'</a></li>';                
                } else {             
                    html += '<li><a '
                        + ' class="' + classname + '"'
                        + ' id="' + ret[i].id + '"'
                        + ' style="background:url('+ icon +') 8px 50% no-repeat; -webkit-background-size: 18px 18px;"'
                        + ' title="' + title + '">'
                        + ret[i].name+'</a></li>';
                }
            }
            document.getElementById('extlist').innerHTML = onekey + html;
            
            $('#extlist').menu();
            $('#extlist').menu('refresh');
            
            $('#extlist a').each(function(){ 
                var hovericon = $(this).hasClass('enabled') ? 'css/img/disabled.png' : 'css/img/enabled.png',
                    icon = icons[this.id];
                
                if($(this).hasClass('disabled')) $(this).css('background-color', '#ccc');
                
                $(this).mouseover(function(e) {
                    if(!extlist.isSelf(e.target.id)) {
                        $(this).css('background-image', 'url('+hovericon+')'); 
                    }
                    if($(this).hasClass('enabled')) 
                        $(this).css('background-color', '#ccc');
                    else 
                        $(this).css('background-color', 'transparent');
                    
                    // $(this).css('background-color', '-webkit-gradient(linear, 0 0, 100% 100%, color-stop(0, rgb(254,233,150)), color-stop(0.6, rgb(254,216,233)), color-stop(1, #ffdd57)'); 
                });
                
                $(this).mouseout(function() { 
                    $(this).css('background-image', 'url('+icon+')'); 
                    if($(this).hasClass('disabled')) $(this).css('background-color', '#ccc');
                    else $(this).css('background-color', 'transparent');
                });
                
                $(this).click(function(e) {
                    if(e.target.nodeName.toLowerCase() == 'a') {
                        if(extlist.isSelf(e.target.id)) {
                            if(storage.get('alldisabled')) {
                                extlist.enableAll();
                            } else {
                                extlist.disableAll();
                            }
                        } else {
                            extlist.enable(e.target.id);
                        }
                    }
                });
                
                this.addEventListener('contextmenu', function(e) {
                    if(e.target.nodeName.toLowerCase() == 'a' && !(extlist.isSelf(e.target.id))){
                        if(confirm('确定卸载扩展: '+e.srcElement.innerHTML+' ?'))
                            chrome.management.uninstall(e.srcElement.id);
                            extlist.create(function() {
                                storage.set('popupWindow', {w: 252, h: $('#extlist').height()+21, tab: 2, selector: '#extlistC'});
                                window.location.reload();
                            });
                    }
                    e.preventDefault();
                    return false;
                }, false);
            });
            if(callback) callback.call();
        });
    },
    
    enable: function(id) {
        chrome.management.get(id, function(ret) {
            chrome.management.setEnabled(ret.id, !ret.enabled);
            extlist.create();
        });        
    },
    
    enableAll: function() {
        storage.set('alldisabled', false);
        //console.log(storage.get('lastEnableList'));
        var list = storage.get('lastEnableList').split(',');
        for(var i=0, _i=list.length; i<_i; i++) {
            chrome.management.setEnabled(list[i], true);
        }
        extlist.create();
    },
    
    disableAll: function() {
        var lastEnableList = '';
        
        chrome.management.getAll(function(ret) {
             for(var i=0, _i=ret.length; i<_i; i++) {
                if(ret[i].isApp) continue;
                
                if(ret[i].enabled && !(extlist.isSelf(ret[i].id))) {
                    lastEnableList += ret[i].id + ',';
                    chrome.management.setEnabled(ret[i].id, false);
                }
             }
             lastEnableList = lastEnableList.substr(0, lastEnableList.length-1);
             storage.set('alldisabled', true);
             storage.set('lastEnableList', lastEnableList);
             extlist.create();
        });
    }
};

