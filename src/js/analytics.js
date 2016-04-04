lanet_tv.Analytics = (function () {
    var instance;

    function init() {
        var body = document.getElementsByTagName('body')[0],
            ga_id = document.getElementsByName('google-analytics-id')[0],
            tm_id = document.getElementsByName('google-tag-manager-id')[0],
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
            sendEvent = function sendEvent() {
                if (!disabled) {
                    if (window.ga) {
                        window.ga.apply(this, ['send', 'event'].concat(arguments));
                    } else {
                        event_queue.push(arguments);
                    }
                }
            };

        if (ga_id) {
            google_id = ga_id.content;
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

        if (tm_id) {
            Helpers.addScript('https://www.googletagmanager.com/gtm.js?id=' + tm_id.content);
        } else {
            console.warn('Google Tag Manager meta tag not found, disabling');
        }

        return {
            setUser: setUserHash,
            sendEvent: sendEvent,
            getUid: function () {
                var result = document.cookie.match(/_ga=GA\d.\d.([^;]+)/);
                return result ? result[1].toString() : null;
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
