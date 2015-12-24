lanet_tv.Controller = (function () {
    var instance;

    function init() {
        var functions = [], default_functions = [], keys = {};
        window.addEventListener('keydown', function (event) {
            if (keys[event.keyCode]) {
                var func;
                if (typeof functions[keys[event.keyCode]] === 'function') {
                    func = functions[keys[event.keyCode]]
                } else if (typeof default_functions[keys[event.keyCode]] === 'function') {
                    func = default_functions[keys[event.keyCode]]
                }
                if (typeof func === 'function') {
                    event.preventDefault();
                    Helpers.throttle(function () {
                        func();
                    }, 50)();
                }
            }
        });
        return {
            addKeymap: function (keymap) {
                for (var code in keymap) if (keymap.hasOwnProperty(code)) keys[code] = keymap[code]
            },
            setKeyFunctions: function (keys) {
                functions = keys
            },
            setDefaultKeyFunctions: function (keys) {
                default_functions = keys
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