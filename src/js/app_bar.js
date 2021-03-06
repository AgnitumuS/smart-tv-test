lanet_tv.AppBar = (function () {
    var instance;

    function init() {
        var body = document.getElementsByTagName('body')[0],
            app_bar = document.createElement('div'),
            logo = document.createElement('div'),
            channel_info_logo = document.createElement('div'),
            channel_info_now = document.createElement('div'),
            channel_info_now_title = document.createElement('div'),
            channel_info_now_number = document.createElement('span'),
            channel_info_now_channel = document.createElement('span'),
            channel_info_now_content = document.createElement('div'),
            channel_info_next = document.createElement('div'),
            channel_info_next_title = document.createElement('div'),
            channel_info_next_remaining = document.createElement('span'),
            channel_info_next_content = document.createElement('div'),
            userpic = document.createElement('img'),
            title = document.createElement('div'),
            title_secondary = document.createElement('span'),
            title_primary = document.createElement('span'),
            channel_info = document.createElement('div'),
            timeout = 0,
            logoClickFunction = function () { },
            userpicClickFunction = function () { },
            createElement = function () {
                app_bar.id = 'app_bar';
                app_bar.classList.add('hidden');
                logo.className = 'logo';
                logo.addEventListener('click', function () {
                    logoClickFunction();
                });
                title.className = 'title';
                title_secondary.className = 'secondary';
                channel_info.className = 'channel_info';
                channel_info_logo.className = 'channel_logo';
                channel_info_now.className = channel_info_next.className = 'column';
                channel_info_now_title.className = channel_info_next_title.className = 'title';
                channel_info_now_number.className = 'number';
                channel_info_now_channel.className = 'channel';
                channel_info_now_content.className = channel_info_next_content.className = 'content';
                userpic.className = 'userpic';
                userpic.addEventListener('click', function () {
                    userpicClickFunction();
                });
                title_secondary.innerHTML = 'Ланет.TV';
                title.appendChild(title_secondary);
                title.appendChild(title_primary);
                channel_info.appendChild(channel_info_logo);
                channel_info_now_title.appendChild(channel_info_now_number);
                channel_info_now_title.appendChild(channel_info_now_channel);
                channel_info_now.appendChild(channel_info_now_title);
                channel_info_now.appendChild(channel_info_now_content);
                channel_info.appendChild(channel_info_now);
                channel_info_next_title.appendChild(channel_info_next_remaining);
                channel_info_next.appendChild(channel_info_next_title);
                channel_info_next.appendChild(channel_info_next_content);
                channel_info.appendChild(channel_info_next);
                app_bar.appendChild(title);
                app_bar.appendChild(logo);
                app_bar.appendChild(channel_info);
                app_bar.appendChild(userpic);
                return app_bar;
            },
            setLogo = function (url) {
                channel_info_logo.style.backgroundImage = Helpers.cssUrl(url);
            },
            setNumber = function (number) {
                channel_info_now_number.innerHTML = number;
            },
            setChannelTitle = function (title) {
                channel_info_now_channel.innerHTML = title;
            },
            setNowContent = function (content) {
                channel_info_now_content.innerHTML = content;
            },
            setNextRemaining = function (title) {
                channel_info_next_remaining.innerHTML = title;
            },
            setNextContent = function (content) {
                channel_info_next_content.innerHTML = content;
            },
            displayNext = function (state) {
                Helpers.toggleNode(channel_info_next, state);
            };
        body.appendChild(createElement());
        return {
            show: function (delay) {
                app_bar.classList.remove('hidden');
                app_bar.classList.add('visible');
                clearTimeout(timeout);
                if (delay) {
                    var self = this;
                    timeout = setTimeout(function () {
                        self.hide();
                    }, delay);
                }
            },
            hide: function () {
                app_bar.classList.remove('visible');
            },
            setTransparentBackground: function (bool) {
                bool ? app_bar.classList.add('transparent') : app_bar.classList.remove('transparent')
            },
            setChannel: function (channel) {
                setLogo(channel.data['logo']);
                setNumber(channel.data['num'].toPaddedString(3));
                setChannelTitle(channel.data['title']);
                setNowContent(channel.data['epg']['now']['title']);
                if (channel.data['epg']['next']) {
                    setNextRemaining(Time.remainingTime(channel.data['epg']['next']['begin']) + ':');
                    setNextContent(channel.data['epg']['next']['title']);
                    displayNext(true)
                } else {
                    displayNext(false);
                }
            },
            setUserpic: function (src) {
                userpic.src = src;
            },
            setTitle: function (title) {
                title_primary.innerHTML = title;
            },
            hideTitle: function () {
                title.classList.remove('visible');
            },
            showTitle: function () {
                title.classList.add('visible');
            },
            setLogoClickHandler: function (func) {
                logoClickFunction = func;
            },
            setUserpicClickHandler: function (func) {
                userpicClickFunction = func;
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
