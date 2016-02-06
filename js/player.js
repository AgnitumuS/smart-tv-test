lanet_tv.Player = (function () {
    var instance;

    function init() {
        var body = document.getElementsByTagName('body')[0],
            overlay = document.createElement('div'),
            overlayFunction = function () {alert("")}, player, current;
        overlay.id = "overlay";
        overlay.addEventListener('click', function () { overlayFunction() });
        if (navigator.userAgent.match(/NetCast|DuneHD|SmartHub|Android|iPad|iPod|iPhone|Mac OS X/g)) {
            player = document.getElementById('player');
            //player.addEventListener("click", function () {
            //    player.play();
            //});
            player.setSource = function (src, ratio) {
                if (navigator.userAgent.match(/SmartHub/g))
                    src += '|COMPONENT=HLS';
                var resolution = Helpers.calcResolution(ratio);
                player.width = resolution[0];
                player.height = resolution[1];
                player.src = src;
            };
            /*
             } else if (Hls.isSupported()) {
             var hls = new Hls();
             player = document.getElementById('player');
             player.setSource = function (src, ratio) {
             var resolution = Helpers.calcResolution(ratio);
             player.width = resolution[0];
             player.height = resolution[1];
             hls.loadSource(src);
             hls.attachMedia(player);
             hls.on(Hls.Events.MANIFEST_PARSED, function () {
             player.play();
             });
             }
             */
        } else {
            document.getElementById('player').remove();
            var loaded = false, onload = function () {};
            window.onPlayerEvent = function (e) {
                if (e == 'ready') {
                    loaded = true;
                    onload();
                }
                if (e == 'error') {
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
            player.play = player.play || function () {};
            player.id = 'player';
            body.appendChild(player);
        }
        body.appendChild(overlay);
        return {
            play: function (channel) {
                channel && player.setSource(channel.data['url'], channel.data['ratio']);
                try {
                    player.play();
                } catch (e) {
                }
            },
            tintOverlay: function (state) {
                state ? overlay.classList.add('tint') : overlay.classList.remove('tint');
            },
            setOverlayHandler: function (overlayHandler) {
                overlayFunction = overlayHandler;
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
