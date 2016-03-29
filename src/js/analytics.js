lanet_tv.Analytics = (function () {
    var instance;

    function init() {
        var body = document.getElementsByTagName('body')[0],
            meta_tags = document.getElementsByName('google-analytics-id'),
            disabled = false,
            google_id = "",
            user_hash = null,
            event_queue = [],
            setUserHash = function setUserId(new_user_hash) {
                if (!disabled) {
                    user_hash = new_user_hash;
                    if (window.ga) {
                        window.ga('set', '&uid', user_hash);
                        window.ga('set', 'dimension1', user_hash);
                    }
                }
            },
            sendEvent = function sendEvent(event) {
                if (!disabled) {
                    if (window.ga) {
                        window.ga('send', event);
                    } else {
                        event_queue.push(event);
                    }
                }
            };

        if (meta_tags[0]) {
            google_id = meta_tags[0].content;
            Helpers.addScript('https://www.google-analytics.com/analytics.js', function () {
                if (!window.ga) return;
                window.ga('create', google_id, 'auto');
                window.ga('require', 'displayfeatures');
                window.ga('require', 'linkid');
                window.ga('send', 'pageview');
                if (user_hash) {
                    setUserHash(user_hash);
                }
                while (event_queue.length > 0) {
                    sendEvent(event_queue.shift());
                }
            }, function () {
                disabled = true;
                console.warn('Google Analytics script failed to load, disabling');
            });
        } else {
            disabled = true;
            console.warn('Google Analytics meta tag not found, disabling');
        }
        return {
            setUser: setUserHash,
            sendEvent: sendEvent
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
