lanet_tv.ControlBar = (function () {
    var instance;

    function init() {
        var body = document.getElementsByTagName('body')[0],
            control_bar = document.createElement('div'),
            play_button = document.createElement('div'),
            timeout = 0, playFunction = function () { },
            createElement = function () {
                control_bar.id = 'control_bar';
                play_button.className = 'play';
                play_button.addEventListener('click', function() { playFunction() });
                control_bar.appendChild(play_button);
                return control_bar;
            };
        body.appendChild(createElement());
        return {
            show: function (delay) {
                control_bar.classList.add('visible');
                clearTimeout(timeout);
                if (delay) {
                    var self = this;
                    timeout = setTimeout(function () {
                        self.hide();
                    }, delay)
                }
            },
            hide: function () {
                control_bar.classList.remove('visible');
            },
            setPlayHandler: function (playHandler) {
                playFunction = playHandler;
            }
        };
    }

    return {
        getInstance: function () {
            if (!instance)
                instance = init();
            return instance;
        }
    };
})();
