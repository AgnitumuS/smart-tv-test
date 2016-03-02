lanet_tv.Clock = (function () {
    var instance;

    function init() {
        var body = document.getElementsByTagName('body')[0],
            element = document.createElement('div'),
            clock_update_interval = 0,
            setClock = function (time) { element.innerHTML = time; };
        element.id = "clock";
        body.appendChild(element);
        return {
            show: function () {
                setClock(Time.asObject().getHhMm());
                clock_update_interval = setInterval(function () {
                    setClock(Time.asObject().getHhMm());
                }, 1000);
                Helpers.showNode(element);
            },
            hide: function () {
                Helpers.hideNode(element);
                clearInterval(clock_update_interval);
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
