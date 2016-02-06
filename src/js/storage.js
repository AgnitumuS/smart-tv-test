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
                write(key, value)
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
