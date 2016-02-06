lanet_tv.Auth = (function () {
    var instance;

    function init() {
        var body = document.getElementsByTagName('body')[0],
            container = document.createElement('div'),
            auth = document.createElement('div'),
            main = document.createElement('div'),
            welcome = document.createElement('div'),
            hint = document.createElement('div'),
            reset = document.createElement('button'),
            storage = lanet_tv.Storage.getInstance(),
            userpic, key, requests = [], expire = 0, open = false, refresh_timeout = 0,
            pin, pin_check_url, last_refresh = 0,
            onAuthUpdate = function (userpic, key) { },
            createElement = function () {
                container.id = 'auth';
                auth.className = 'auth';
                main.className = 'main';
                reset.className = 'button reset';
                welcome.className = 'welcome';
                hint.innerHTML = '<a target="_blank" href="https://auth.lanet.tv/test">https://auth.lanet.tv/test</a>';
                hint.className = 'hint';
                reset.innerHTML = 'Выйти';
                userpic = '';
                key = null;
                auth.appendChild(main);
                container.appendChild(auth);
                reset.addEventListener('click', resetAuth);
                Helpers.hideNode(reset);
                return container;
            },
            resetAuth = function () {
                Helpers.hideNode(reset);
                storage.set('token', '');
                storage.set('key', '');
                userpic = '';
                key = null;
                pin = false;
                pin_check_url = false;
                onAuthUpdate(userpic, key);
                refreshPin();
            },
            saveAuth = function (data) {
                clearTimeout(refresh_timeout);
                Helpers.removeChildren(main);
                storage.set('token', data['token']);
                storage.set('key', data['key']);
                welcome.innerHTML = 'Добро пожаловать,';
                main.appendChild(welcome);
                main.innerHTML += data['name'];
                main.appendChild(reset);
                Helpers.showNode(reset);
                userpic = data['image'];
                key = data['key'];
                onAuthUpdate(userpic, key);
            },
            checkPin = function (url) {
                requests.push(Helpers.getJSON(url, function (data) {
                    data['status'] == 'ok' ? saveAuth(data) : resetAuth();
                }, function (error) {
                    if (error.status != 0 && open)
                        checkPin(url);
                }));
            },
            refreshPin = function () {
                clearTimeout(refresh_timeout);
                last_refresh = new Date().getTime();
                requests.push(Helpers.getJSON('https://auth.lanet.tv/login/pin', function (data) {
                    pin = data['code'];
                    pin_check_url = data['status'];
                    expire = data['expire'] * 1000;
                    refresh_timeout = setTimeout(function () {
                        pin = false;
                        pin_check_url = false;
                        refreshPin();
                    }, expire);
                    main.innerHTML = pin;
                    main.appendChild(hint);
                    checkPin(pin_check_url);
                }));
            },
            checkToken = function (token) {
                requests.push(Helpers.getJSON('https://auth.lanet.tv/token/' + token, function (data) {
                    data['status'] == 'ok' ? saveAuth(data) : resetAuth();
                }, function (error) {
                    if (error.status != 0)
                        resetAuth();
                }));
            };
        body.appendChild(createElement());
        storage.set('key', '');
        if (storage.get('token').length > 0)
            checkToken(storage.get('token'));
        else
            resetAuth();
        return {
            show: function () {
                open = true;
                Helpers.showNode(container);
                if (!key && last_refresh > 0 && last_refresh + expire < new Date().getTime())
                    refreshPin();
            },
            hide: function () {
                Helpers.hideNode(container);
                open = false;
            },
            resetAuth: resetAuth,
            setAuthUpdateFunction: function (func) {
                onAuthUpdate = func;
                onAuthUpdate(userpic, key)
            },
            getKey: function () {
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
