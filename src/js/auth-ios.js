lanet_tv.Auth = (function () {
    var instance;

    function init() {
        var body = document.getElementsByTagName('body')[0],
            container = document.createElement('div'),
            auth = document.createElement('div'),
            main = document.createElement('div'),
            welcome = document.createElement('div'),
            reset = document.createElement('button'),
            storage = lanet_tv.Storage.getInstance(),
            userpic, key, requests = [], expire = 0, open = false, refresh_timeout = 0, init = false,
            last_refresh = 0,
            onAuthUpdate = function (userpic, key) { },
            createElement = function () {
                container.id = 'auth';
                auth.className = 'auth';
                main.className = 'main';
                reset.className = 'button reset';
                welcome.className = 'welcome';
                reset.innerHTML = 'Выйти';
                userpic = '';
                key = null;
                auth.appendChild(main);
                container.appendChild(auth);
                reset.addEventListener('touchend', function (event) {
                    event.preventDefault();
                    resetAuth();
                });
                reset.addEventListener('click', resetAuth);
                Helpers.hideNode(reset);
                return container;
            },
        /*
         createButton = function (id, name, url) {
         var button = document.createElement('a');
         button.classList.add('button');
         button.classList.add('auth');
         button.classList.add(id);
         //button.target = "_self";
         button.href = url + '?redirect=true';
         var button_text = document.createElement('span');
         button_text.innerHTML = name;
         button.appendChild(button_text);
         return button;
         },
         */
            createButton = function (id, name, url) {
                var button = document.createElement('button');
                button.classList.add('button');
                button.classList.add('auth');
                button.classList.add(id);
                var button_text = document.createElement('span');
                button_text.innerHTML = name;
                button.appendChild(button_text);
                button.addEventListener('touchend', function (event) {
                    event.preventDefault();
                    Helpers.openDialog(url + "?redirect=true", "_self", {width: 640, height: 480}, function () {
                        clearTimeout(refresh_timeout);
                        if (!key)
                            resetAuth();
                    });
                });
                button.addEventListener('click', function () {
                    Helpers.openDialog(url + "?redirect=true", "_self", {width: 640, height: 480}, function () {
                        clearTimeout(refresh_timeout);
                        if (!key)
                            resetAuth();
                    });
                });
                return button;
            },
            resetAuth = function () {
                console.log('resetauth');
                init = true;
                Helpers.hideNode(reset);
                storage.set('auth_status', '');
                storage.set('token', '');
                storage.set('key', '');
                userpic = '';
                key = null;
                onAuthUpdate(userpic, key);
                refreshAuth();
            },
            saveAuth = function (data) {
                console.log('saveauth');
                init = true;
                clearTimeout(refresh_timeout);
                Helpers.removeChildren(main);
                storage.set('auth_status', '');
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
            checkAuth = function (url) {
                var timeout = 0, request = Helpers.getJSON(url, function (data) {
                    data['status'] == 'ok' ? saveAuth(data) : resetAuth();
                    clearTimeout(timeout);
                }, function () {
                    resetAuth();
                });
                timeout = setTimeout(function () { request.abort(); }, 500);
            },
            refreshAuth = function () {
                clearTimeout(refresh_timeout);
                last_refresh = new Date().getTime();
                Helpers.getJSON('https://auth.lanet.tv/init', function (data) {
                    storage.set('auth_status', data['status']);
                    Helpers.removeChildren(main);
                    main.appendChild(createButton('facebook', 'Facebook', data['facebook']));
                    main.appendChild(createButton('google', 'Google', data['google']));
                    main.appendChild(createButton('vk', 'Вконтакте', data['vk']));
                    main.appendChild(createButton('lanet', 'Ланет', data['lanet']));
                    expire = 180 * 1000;
                    refresh_timeout = setTimeout(function () {open && refreshAuth()}, expire);
                });
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
        else if (storage.get('auth_status').length > 0)
            checkAuth(storage.get('auth_status'));
        else
            resetAuth();
        return {
            show: function () {
                open = true;
                container.classList.add('visible');
                if (!key && last_refresh > 0 && last_refresh + expire < new Date().getTime())
                    refreshAuth();
            },
            hide: function () {
                container.classList.remove('visible');
                open = false;
            },
            resetAuth: resetAuth,
            setAuthUpdateFunction: function (func) {
                onAuthUpdate = func;
                onAuthUpdate(userpic, key);
            },
            getKey: function () {
                return key;
            },
            hasInit: function () { return init; }
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
