lanet_tv.Controller = (function () {
    var instance, last_keys = [];

    function init() {
        var functions = [], default_functions = [], keys = {}, debug = document.getElementById('debug'), last_event = 0,
            enabled = false;
        window.addEventListener('keydown', function (event) {
            last_event = new Date().getTime();
            last_keys.push(event.keyCode);
            if (last_keys.length > 6)
                last_keys.shift();
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
                        if (enabled)
                            func();
                        debug.innerHTML = String(new Date().getTime() - last_event) + "ms\n";
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
            },
            emulateKeyPress: function (key) {
                if (typeof functions[key] === 'function')
                    functions[key]();
                else if (typeof default_functions[key] === 'function')
                    default_functions[key]();
            },
            enableKeys: function () {
                enabled = true;
            },
            disableKeys: function () {
                enabled = false;
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
