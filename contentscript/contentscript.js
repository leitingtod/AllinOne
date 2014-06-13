$(function() {
    if(window.location.href
        === 'http://www.noadplayer.com/authorize') {
        $.post( "http://noadplayer.sinaapp.com/checktoken.php",
            $('form[name="tokenForm"]' ).serialize(),
            function(status) {
                window.close();
                chrome.extension.sendMessage({
                    type : 'noadplayer'
                });
        });
    }
});