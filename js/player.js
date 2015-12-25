lanet_tv.Player = (function () {
    var instance;

    function init() {
        var body = document.getElementsByTagName('body')[0], player, current;
        if (navigator.userAgent.match(/NetCast|DuneHD|SmartHub|Android/g)) {
            player = document.getElementById('player');
            player.setSource = function (src, ratio) {
                var resolution = Helpers.calcResolution(ratio);
                player.width = resolution[0];
                player.height = resolution[1];
                player.src = src + '|COMPONENT=HLS';
            };
        } else {
            document.getElementById('player').remove();
            var loaded = false, onload = function () {};
            window.onPlayerEvent = function (e, data) {
                if (e == 'ready') {
                    loaded = true;
                    onload();
                }
                if (e == 'error') {
                    console.error('player error', data);
                    onload();
                }
            };
            player = Helpers.createSwfObject('assets/live.swf', {}, {
                allowScriptAccess: 'always',
                bgcolor: '#000000',
                wmode: 'opaque'
            });
            player.className = 'flash';
            player.setSource = function (src, ratio) {
                if (current != src) {
                    var data = {
                        url: src,
                        scale: ratio.join(':'),
                        volume: 1
                    }, self = this;
                    if (loaded) {
                        this.set(data)
                    } else onload = function () {
                        self.set(data)
                    };
                    current = src;
                }
            };
            player.id = 'player';
            body.appendChild(player);
        }
        return {
            play: function (channel) {
                player.setSource(channel.data['url'], channel.data['ratio'])
            }
        };
    }

    return {
        getInstance: function () {
            if (!instance)
                instance = init();
            return instance;
        }
    }
})();
