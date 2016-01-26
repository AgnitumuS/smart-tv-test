lanet_tv.Social = (function () {
    var instance;

    function init() {
        var body = document.getElementsByTagName('body')[0],
            social = document.createElement('div'),
            auth = document.createElement('div'),
            main = document.createElement('div'),
            welcome = document.createElement('div'),
            hint = document.createElement('div'),
            reset = document.createElement('div'),
            storage = lanet_tv.Storage.getInstance(),
            welcome_words = ['Hello,', 'Howdy,', 'Welcome,', 'Bonjour,', 'Buenos dias,', 'Shalom,'],
            userpic, key, requests = [], pin, pin_timeout, pin_check_url, open = false,
            onAuthUpdate = function (userpic, key) { },
            createElement = function () {
                social.id = 'social';
                auth.className = 'auth';
                main.className = 'main';
                reset.className = 'reset';
                welcome.className = 'welcome';
                hint.innerHTML = '<a target="_blank" href="https://auth.lanet.tv/test">https://auth.lanet.tv/test</a>';
                hint.className = 'hint';
                reset.innerHTML = 'OK - Log out';
                userpic = '';
                key = null;
                auth.appendChild(main);
                social.appendChild(auth);
                social.appendChild(reset);
                reset.addEventListener('click', resetAuth);
                Helpers.hideNode(reset);
                return social;
            },
            resetAuth = function () {
                Helpers.hideNode(reset);
                storage.set('token', '');
                storage.set('key', '');
                pin = false;
                pin_check_url = false;
                userpic = '';
                key = null;
                onAuthUpdate(userpic, key);
                updateAuth();
            },
            saveAuth = function (data) {
                Helpers.showNode(reset);
                Helpers.removeChildren(main);
                storage.set('token', data['token']);
                storage.set('key', data['key']);
                welcome.innerHTML = welcome_words[Math.floor(Math.random() * welcome_words.length)];
                main.appendChild(welcome);
                main.innerHTML += data['name'];
                userpic = data['image'];
                key = data['key'];
                onAuthUpdate(userpic, key);
            },
            checkPin = function (url) {
                requests.push(Helpers.getJSON(url, function (data) {
                    data['status'] == 'ok' ? saveAuth(data) : resetAuth();
                }, function (error) {
                    if (error.status != 0 && open)
                        updateAuth();
                }));
            },
            refreshPin = function () {
                requests.push(Helpers.getJSON('https://auth.lanet.tv/login/pin', function (data) {
                    pin = data['code'];
                    pin_check_url = data['status'];
                    pin_timeout = setTimeout(function () {
                        pin = false;
                        pin_check_url = false;
                        updateAuth();
                    }, data['expire'] * 1000);
                    main.innerHTML = data['code'];
                    main.appendChild(hint);
                    updateAuth();
                }));
            },
            checkToken = function (token) {
                requests.push(Helpers.getJSON('https://auth.lanet.tv/token/' + token, function (data) {
                    data['status'] == 'ok' ? saveAuth(data) : resetAuth();
                }, function (error) {
                    if (error.status != 0)
                        resetAuth()
                }));
            },
            updateAuth = function () {
                for (var r in requests) { if (requests.hasOwnProperty(r)) requests[r].abort(); }
                requests = [];
                if (storage.get('key').length == 0) {
                    if (storage.get('token').length > 0) {
                        checkToken(storage.get('token'));
                    } else if (open) {
                        pin_check_url ? checkPin(pin_check_url) : refreshPin();
                    }
                }
            };
        body.appendChild(createElement());
        storage.set('key', '');
        updateAuth();
        return {
            show: function () {
                open = true;
                Helpers.showNode(social);
                updateAuth();
            },
            hide: function () {
                Helpers.hideNode(social);
                open = false;
            },
            resetAuth: resetAuth,
            setAuthUpdateFunction: function (func) {
                onAuthUpdate = func;
                if (userpic && key) onAuthUpdate(userpic, key)
            },
            getKey: function() {
                return key;
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
