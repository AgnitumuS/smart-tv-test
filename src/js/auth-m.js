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
            userpic, key, requests = [], expire = 0, open = false, refresh_timeout = 0,
            popup,
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
                    resetAuth()
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
                var button = document.createElement('button');
                button.classList.add('button');
                button.classList.add('auth');
                button.classList.add(id);
                var button_text = document.createElement('span');
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
                Helpers.hideNode(reset);
                storage.set('token', '');
                storage.set('key', '');
                userpic = '';
                key = null;
                onAuthUpdate(userpic, key);
                for (var r in requests) { if (requests.hasOwnProperty(r)) requests[r].abort(); }
                requests = [];
                Helpers.removeChildren(main);
                main.appendChild(createButton('facebook', 'Facebook'));
                main.appendChild(createButton('google', 'Google'));
                main.appendChild(createButton('vk', 'Вконтакте'));
                main.appendChild(createButton('lanet', 'Ланет'));
            },
            saveAuth = function (data) {
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
                onAuthUpdate(userpic, key);
            },
            checkAuth = function (url) {
                requests.push(Helpers.getJSON(url, function (data) {
                    data['status'] == 'ok' ? saveAuth(data) : resetAuth();
                }, function (error) {
                    if (error.status != 0 && open)
                        resetAuth();
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
                container.classList.add('visible');
            },
            hide: function () {
                container.classList.remove('visible');
                open = false;
            },
            resetAuth: resetAuth,
            setAuthUpdateFunction: function (func) {
                onAuthUpdate = func;
                if (key) onAuthUpdate(userpic, key);
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
    };
})();
