lanet_tv.Auth = (function () {
    var instance;

    function init () {
        var body = document.getElementsByTagName('body')[0],
            container = document.createElement('div'),
            auth = document.createElement('div'),
            main = document.createElement('div'),
            welcome = document.createElement('div'),
            reset = document.createElement('button'),
            storage = lanet_tv.Storage.getInstance(),
            userpic = "", key = null, hash = null,
            requests = [], expire = 0, open = false, refresh_timeout = 0, initialized = false,
            popup,
            onAuthUpdate = function (userpic, key, hash) { },
            createElement = function () {
                container.id = 'auth';
                container.classList.add('hidden');
                auth.className = 'auth';
                main.className = 'main';
                reset.className = 'button reset';
                welcome.className = 'welcome';
                reset.innerHTML = 'Выйти';
                userpic = '';
                key = null;
                hash = null;
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
            refreshButton = function (id) {
                clearTimeout(refresh_timeout);
                requests.push(Helpers.getJSON("https://auth.lanet.tv/login/" + id, function (data) {
                    checkAuth(data['status']);
                    popup.location.href = data['login'];
                    refresh_timeout = setTimeout(function () {refreshButton(id)}, data['expire'] * 1000);
                }));
            },
            createButton = function (id, name) {
                var button = document.createElement('button'),
                    button_text = document.createElement('span');
                button.classList.add('button');
                button.classList.add('auth');
                button.classList.add(id);
                button_text.innerHTML = name;
                button.appendChild(button_text);
                button.addEventListener('touchend', function (event) {
                    event.preventDefault();
                    refreshButton(id);
                    popup = Helpers.openDialog("about:blank", "_blank", {width: 640, height: 480}, function () {
                        clearTimeout(refresh_timeout);
                        if (!key)
                            resetAuth();
                    });
                });
                button.addEventListener('click', function () {
                    refreshButton(id);
                    popup = Helpers.openDialog("about:blank", "_blank", {width: 640, height: 480}, function () {
                        clearTimeout(refresh_timeout);
                        if (!key)
                            resetAuth();
                    });
                });
                return button;
            },
            resetAuth = function () {
                var r;
                initialized = true;
                Helpers.hideNode(reset);
                storage.set('token', '');
                storage.set('key', '');
                userpic = '';
                key = null;
                hash = null;
                for (r in requests) {
                    if (requests.hasOwnProperty(r)) requests[r].abort();
                }
                requests = [];
                Helpers.removeChildren(main);
                main.appendChild(createButton('facebook', 'Facebook'));
                main.appendChild(createButton('google', 'Google'));
                main.appendChild(createButton('vk', 'Вконтакте'));
                main.appendChild(createButton('lanet', 'Ланет'));
                getAnonKey(function () {
                    onAuthUpdate(userpic, key, hash);
                });
            },
            getAnonKey = function (callback) {
                Helpers.getJSON('https://auth.lanet.tv/user_id', function (data) {
                    hash = data.user_id;
                    callback();
                });
            },
            saveAuth = function (data) {
                initialized = true;
                popup && !popup.closed && popup.close();
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
                hash = data['user_id'];
                onAuthUpdate(userpic, key, hash);
            },
            checkAuth = function (url) {
                requests.push(Helpers.getJSON(url, function (data) {
                    data['status'] == 'ok' ? saveAuth(data) : resetAuth();
                }, function (error) {
                    if (error.status !== 0 && open)
                        resetAuth();
                }));
            },
            checkToken = function (token) {
                requests.push(Helpers.getJSON('https://auth.lanet.tv/token/' + token, function (data) {
                    initialized = true;
                    data['status'] == 'ok' ? saveAuth(data) : resetAuth();
                }, function (error) {
                    if (error.status !== 0)
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
                container.classList.remove('hidden');
                container.classList.add('visible');
            },
            hide: function () {
                container.classList.remove('visible');
                open = false;
            },
            resetAuth: resetAuth,
            setAuthUpdateFunction: function (func) {
                onAuthUpdate = func;
                onAuthUpdate(userpic, key, hash);
            },
            getKey: function () { return key; },
            getHash: function () { return hash; },
            hasInit: function () { return initialized; }
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
