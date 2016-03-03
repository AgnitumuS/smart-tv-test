lanet_tv.Input = (function () {
    var instance;

    function init() {
        var key_functions = {}, default_key_functions = {},
            gesture_functions = {}, default_gesture_functions = {},
            keys = {},
            enabled = false,
            numeric_enabled = false,
            numeric = ['NUM0', 'NUM1', 'NUM2', 'NUM3', 'NUM4', 'NUM5', 'NUM6', 'NUM7', 'NUM8', 'NUM9'],
            entered_number = "",
            number_timeout = 0,
            onNumber = function (number, final) {console.log(number, final)},
            touch = {last_y: 0, current_y: 0, last_x: 0, current_x: 0};
        window.addEventListener('keydown', function (event) {
            if (keys[event.keyCode]) {
                if (numeric_enabled && numeric.indexOf(keys[event.keyCode]) > -1) {
                    var digit = "", final = false;
                    clearTimeout(number_timeout);
                    switch (keys[event.keyCode]) {
                        case "NUM0":
                            digit = "0";
                            break;
                        case "NUM1":
                            digit = "1";
                            break;
                        case "NUM2":
                            digit = "2";
                            break;
                        case "NUM3":
                            digit = "3";
                            break;
                        case "NUM4":
                            digit = "4";
                            break;
                        case "NUM5":
                            digit = "5";
                            break;
                        case "NUM6":
                            digit = "6";
                            break;
                        case "NUM7":
                            digit = "7";
                            break;
                        case "NUM8":
                            digit = "8";
                            break;
                        case "NUM9":
                            digit = "9";
                            break;

                    }
                    entered_number += digit;
                    if (entered_number.length > 2) {
                        final = true;
                    }
                    onNumber(entered_number, final);
                    number_timeout = setTimeout(function () {
                        final = true;
                        onNumber(entered_number, final);
                        entered_number = "";
                    }, 1000);
                    if (final) {
                        clearTimeout(number_timeout);
                        entered_number = "";
                    }
                }
                var func;
                if (typeof key_functions[keys[event.keyCode]] === 'function')
                    func = key_functions[keys[event.keyCode]];
                else if (typeof default_key_functions[keys[event.keyCode]] === 'function')
                    func = default_key_functions[keys[event.keyCode]];
                if (typeof func === 'function') {
                    event.preventDefault();
                    Helpers.throttle(function () { enabled && func(); }, 50)();
                }
            }
        });
        window.addEventListener("touchstart", function (event) {
            touch.last_y = event.touches[0].clientY;
            touch.last_x = event.touches[0].clientX;
            touch.current_y = touch.last_y;
            touch.current_x = touch.last_x;
        });
        window.addEventListener("touchend", function (event) {
            touch.current_x = event.changedTouches[event.changedTouches.length - 1].clientX;
            touch.current_y = event.changedTouches[event.changedTouches.length - 1].clientY;
            var delta_y = touch.current_y - touch.last_y,
                delta_x = touch.current_x - touch.last_x,
                gesture;
            if (Math.abs(delta_x) > 10 || Math.abs(delta_y) > 10) {
                if (Math.abs(delta_y) > Math.abs(delta_x)) {
                    if (delta_y < 0)
                        gesture = "SWIPE_UP";
                    else if (delta_y > 0)
                        gesture = "SWIPE_DOWN";
                } else if (Math.abs(delta_x) > Math.abs(delta_y)) {
                    if (delta_x < 0)
                        gesture = "SWIPE_RIGHT";
                    else if (delta_x > 0)
                        gesture = "SWIPE_LEFT";
                }
            }
            if (gesture) {
                var func;
                if (typeof gesture_functions[gesture] === 'function')
                    func = gesture_functions[gesture];
                else if (typeof default_gesture_functions[gesture] === 'function')
                    func = default_gesture_functions[gesture];
                if (typeof func === 'function') {
                    //event.preventDefault();
                    enabled && func();
                }
            }
            touch.last_y = touch.current_y;
            touch.last_x = touch.current_x;
        });
        //window.addEventListener('touchmove', function (event) {
        //event.stopPropagation();
        //if (!document.querySelector("#menu").contains(event.target))
        //    event.preventDefault();
        //}, false);
        return {
            addKeymap: function (keymap) {
                for (var code in keymap) if (keymap.hasOwnProperty(code)) keys[code] = keymap[code]
            },
            setKeyFunctions: function (keys) {
                key_functions = keys
            },
            setDefaultKeyFunctions: function (keys) {
                default_key_functions = keys
            },
            setGestureFunctions: function (gestures) {
                gesture_functions = gestures
            },
            setDefaultGestureFunctions: function (gestures) {
                default_gesture_functions = gestures
            },
            emulateGesture: function (gesture) {
                if (typeof gesture_functions[gesture] === 'function')
                    gesture_functions[gesture]();
                else if (typeof default_gesture_functions[gesture] === 'function')
                    default_gesture_functions[gesture]();
            },
            emulateKeyPress: function (key) {
                if (typeof key_functions[key] === 'function')
                    key_functions[key]();
                else if (typeof default_key_functions[key] === 'function')
                    default_key_functions[key]();
            },
            enableKeys: function () {
                enabled = true;
            },
            disableKeys: function () {
                enabled = false;
            },
            enableNumeric: function () {
                numeric_enabled = true;
            },
            disableNumeric: function () {
                numeric_enabled = false;
            },
            setNumericHandler: function (func) {
                onNumber = func;
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
