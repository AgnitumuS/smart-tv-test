lanet_tv.Remote = (function () {
    var instance;

    function init() {
        var running = false, request, timeout, onCommand = function (command) { };

        function poll() {
            request = Helpers.getJSON("http://tv.rmrf.co/remote/poll.php",
                function (data) {
                    onCommand(data['command']);
                    timeout = setTimeout(poll, 100);
                }, function () {
                    timeout = setTimeout(poll, 100);
                }
            )
        }

        return {
            startPolling: function () {
                running = true;
                poll();
            },
            stopPolling: function () {
                running = false;
                request.abort();
                clearTimeout(timeout);
            },
            togglePolling: function () {
                running ? this.stopPolling() : this.startPolling();
                return running;
            },
            setHandler: function (handler) {
                onCommand = handler;
            }
        }
    }

    return {
        getInstance: function () {
            if (!instance)
                instance = init();
            return instance;
        }
    }
})();
