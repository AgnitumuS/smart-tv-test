lanet_tv.Auth = (function () {
    var instance;

    function init() {
        var body = document.getElementsByTagName('body')[0],
            container = document.createElement('div'),
        //auth = document.createElement('div'),
            pin_block = document.createElement('div'),
        //welcome = document.createElement('div'),
            heading = document.createElement('div'),
            columns = document.createElement('div'),
            left = document.createElement('div'),
            right = document.createElement('div'),
            reset = document.createElement('button'),
            storage = lanet_tv.Storage.getInstance(),
            userpic, key, requests = [], expire = 0, open = false, refresh_timeout = 0, initialized = false,
            pin, pin_check_url, last_refresh = 0,
            onAuthUpdate = function (userpic, key) { },
            createElement = function () {
                container.id = 'auth';
                container.classList.add('hidden');
                //auth.className = 'auth';
                pin_block.className = 'pin';
                reset.className = 'button reset';
                //welcome.className = 'welcome';
                //hint.innerHTML = '<a target="_blank" href="https://auth.lanet.tv/test">https://auth.lanet.tv/test</a>';
                //hint.className = 'hint';
                heading.className = 'heading';
                heading.innerHTML = 'Войдите, чтобы гладко смотреть свое сочное телевидение<br>от Ланет ТВ';
                columns.className = 'columns';
                left.className = 'left';
                left.innerHTML = '<p><i class="circle">1</i>' +
                    'Перейдите на страницу<br>' +
                    '<a href="https://lanet.tv/activate">lanet.tv/activate</a><br>' +
                    'на мобильном устройстве<br>' +
                    'или компьютере' +
                    '</p>' +
                    '<p><i class="circle">2</i>' +
                    'На веб-сайте<br>' +
                    'введите код справа,<br>' +
                    'чтобы подключить своё<br>' +
                    'ТВ-устройство!' +
                    '</p>';
                right.className = 'right';
                reset.innerHTML = 'Выйти';
                userpic = '';
                key = null;
                right.appendChild(pin_block);
                container.appendChild(heading);
                columns.appendChild(left);
                columns.appendChild(right);
                container.appendChild(columns);
                reset.addEventListener('click', resetAuth);
                Helpers.hideNode(reset);
                return container;
            },
            resetAuth = function () {
                initialized = true;
                Helpers.hideNode(reset);
                storage.set('auth_status', '');
                storage.set('token', '');
                storage.set('key', '');
                userpic = '';
                key = null;
                pin = null;
                pin_check_url = null;
                onAuthUpdate(userpic, key);
                for (var r in requests) { if (requests.hasOwnProperty(r)) requests[r].abort(); }
                requests = [];
                refreshAuth();
            },
            saveAuth = function (data) {
                initialized = true;
                clearTimeout(refresh_timeout);
                //Helpers.removeChildren(main);
                storage.set('token', data['token']);
                storage.set('key', data['key']);
                //welcome.innerHTML = 'Добро пожаловать,';
                //main.appendChild(welcome);
                //main.innerHTML += data['name'];
                //main.appendChild(reset);
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
            refreshAuth = function () {
                clearTimeout(refresh_timeout);
                last_refresh = new Date().getTime();
                requests.push(Helpers.getJSON('https://auth.lanet.tv/login/pin', function (data) {
                    pin = data['code'];
                    pin_check_url = data['status'];
                    expire = data['expire'] * 1000;
                    refresh_timeout = setTimeout(function () {
                        pin = false;
                        pin_check_url = false;
                        refreshAuth();
                    }, expire);
                    pin_block.innerHTML = pin;
                    //main.innerHTML = pin;
                    //main.appendChild(hint);
                    checkAuth(pin_check_url);
                }));
            },
            checkToken = function (token) {
                requests.push(Helpers.getJSON('https://auth.lanet.tv/token/' + token, function (data) {
                    initialized = true;
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
                container.classList.remove('hidden');
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
