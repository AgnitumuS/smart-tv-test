lanet_tv.Storage = (function () {
    var instance;

    function init() {
        function write(key, value) {
            document.cookie = [
                key, '=', value, '; ',
                'path=/; ',
                'domain=', document.domain, '; ',
                'expires=', new Date().addDays(365).toUTCString(), ';'
            ].join('');
        }

        function read(key) {
            var result = document.cookie.match(new RegExp(key + '=([^;]+)'));
            return result ? result[1].toString() : '';
        }

        return {
            get: function (key) {
                return read(key)
            },
            set: function (key, value) {
                if (typeof key !== "string")
                    return;
                if (typeof value !== "string") {
                    console.warn("Attempted to store non-string value for " + key);
                    return;
                }
                write(key, value);
            }
        }
    }

    return {
        getInstance: function () {
            if (!instance)
                instance = init();
            return instance;
        }
    };
})();
