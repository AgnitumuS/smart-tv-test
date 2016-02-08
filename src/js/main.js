var api = lanet_tv.Api.getInstance(),
    storage = lanet_tv.Storage.getInstance(),
    input = lanet_tv.Input.getInstance(),
    player = lanet_tv.Player.getInstance(),
    app_bar = lanet_tv.AppBar.getInstance(),
    menu = lanet_tv.Menu.getInstance(),
    auth = lanet_tv.Auth.getInstance(),
    control_bar = lanet_tv.ControlBar.getInstance(),
    channels = lanet_tv.Channels.getInstance(),
    remote = lanet_tv.Remote.getInstance(),
    channel, balloon_timeout = 0,
    start_time = new Date().getTime(),
    updateTime = function () {
        Time.setTimestamp(api.getTimestamp());
        Time.setOffset(api.getOffset());
    },
    getCurrentChannelList = function () {
        return channels.getChannels();
    },
    setChannels = function () {
        var new_channels = api.parseChannels(),
            new_channel_ids = [];
        for (var c in new_channels) {
            if (new_channels.hasOwnProperty(c)) {
                var channel = new_channels[c];
                new_channel_ids.push(channel.id);
                channel['favourite'] = storage.get('favourite').split(' ').indexOf(channel['id'].toString()) != -1;
                channels.setChannel(channel);
            }
        }
        channels.leaveOnly(new_channel_ids);
        menu.setChannels(getCurrentChannelList());
    },
    toggleFavourite = function (channel) {
        var current = storage.get('favourite').split(' '),
            target = channel.data['id'].toString(),
            index = current.indexOf(target);
        storage.set('favourite', (index == -1 ? current.concat([target]) : current.spliced(index, 1)).join(' '));
        channel.data['favourite'] = storage.get('favourite').split(' ').indexOf(target) != -1;
        channels.setChannel(channel.data);
    },
    update = function (callback) {
        callback = callback || function (callback) { };
        api.update(function () {
            updateTime();
            setChannels();
            app_bar.setTitle(api.getPack());
            channels.getCurrent() && app_bar.setChannel(channels.getCurrent());
            menu.setGenres(api.getGenres());
            menu.setTags(api.getTags());
            callback();
        });
    },
    log = function (string) {
        var debug = document.getElementById('debug');
        debug.innerHTML += "[" + String(new Date().getTime() - start_time) + "] " + string + "\n";
        debug.scrollTop = debug.scrollHeight;
    },
    showLog = function () {
        Helpers.showNode(document.getElementById('debug'));
    },
    showBalloon = function (text) {
        var container = document.getElementById("balloon-container"),
            balloon = document.getElementById("balloon");
        Helpers.showNode(container);
        balloon.innerHTML = text;
        clearTimeout(balloon_timeout);
        balloon_timeout = setTimeout(function () { Helpers.hideNode(container); }, 2000)
    },
    showTint = function () { player.tintOverlay(true); },
    hideTint = function () { player.tintOverlay(false); },
    playChannel = function (channel) {
        channels.setCurrent(channel);
        player.play(channel);
        app_bar.setChannel(channel);
        storage.set('last_channel', String(channel.data['id']));
        //showPlayer()
    },
    expandMenu = function () {
        menu.expand();
        app_bar.showTitle();
        menu.setRootItemSelectHandler(function (category, id) {
            switch (category) {
                case 'lists':
                    switch (id) {
                        case 'favourite':
                            getCurrentChannelList = function () { return channels.getFavourite(); };
                            break;
                        default:
                            getCurrentChannelList = function () { return channels.getChannels(); };
                    }
                    break;
                case 'genres':
                    getCurrentChannelList = function () { return channels.getByClass(id); };
                    break;
                case 'tags':
                    getCurrentChannelList = function () { return channels.getByTag(id); };
                    break;
                default:
                    console.warn('TODO: Unhandled item: ', [category, id]);
                    getCurrentChannelList = function () { return channels.getChannels(); };
            }
            menu.setChannels(getCurrentChannelList());
        });
        input.setKeyFunctions({
            'RIGHT': function () { showMenu(); },
            'UP': function () { menu.selectPreviousRootItem(); },
            'DOWN': function () { menu.selectNextRootItem(); },
            'LEFT': function () { menu.collapseCurrentRootCategory(); },
            'ENTER': function () { menu.mainRootAction(); }
        });
        input.setGestureFunctions({
            'SWIPE_RIGHT': function () { showMenu(); },
            'SWIPE_LEFT': function () { menu.collapseCurrentRootCategory(); }
        });
    },
    showMenu = function () {
        showTint();
        menu.collapse();
        menu.show();
        app_bar.hideTitle();
        app_bar.setTransparentBackground(true);
        app_bar.show();
        control_bar.hide();
        menu.setChannelClickHandler(function (channel) {
            playChannel(channel);
            showPlayer();
        });
        input.setKeyFunctions({
            'UP': function () { menu.selectPreviousChannel(); },
            'DOWN': function () { menu.selectNextChannel(); },
            'LEFT': function () { expandMenu(); },
            'RIGHT': function () { showPlayer(); },
            'ENTER': function () { playChannel(menu.getSelectedChannel()); },
            'YELLOW': function () { toggleFavourite(menu.getSelectedChannel()); }
        });
        input.setGestureFunctions({
            'SWIPE_RIGHT': function () { showPlayer(); },
            'SWIPE_LEFT': function () { expandMenu(); }
        });
    },
    showAuth = function () {
        showTint();
        auth.show();
        app_bar.hideTitle();
        app_bar.setTransparentBackground(true);
        app_bar.show();
        control_bar.hide();
        input.setKeyFunctions({
            'ENTER': function () { auth.resetAuth(); },
            'LEFT': function () { showPlayer(); }
        });
        input.setGestureFunctions({
            'SWIPE_LEFT': function () { showPlayer(); }
        });
    },
    showPlayer = function () {
        auth.hide();
        menu.hide();
        hideTint();
        app_bar.hideTitle();
        app_bar.setTransparentBackground(false);
        app_bar.show(2000);
        //navigator.userAgent.match(/iPhone/g) && control_bar.show(2000);
        input.setKeyFunctions({
            'RIGHT': function () { showAuth(); },
            'LEFT': function () { showMenu(); },
            'UP': function () {
                playChannel(channels.getNext());
                app_bar.show(2000);
                //navigator.userAgent.match(/iPhone/g) && control_bar.show(2000);
            },
            'DOWN': function () {
                playChannel(channels.getPrevious());
                app_bar.show(2000);
                //navigator.userAgent.match(/iPhone/g) && control_bar.show(2000);
            },
            'YELLOW': function () {
                showBalloon("Удаленное управление " + (remote.togglePolling() ? "включено" : "выключено"));
            },
            'CH_UP': function () {
                playChannel(channels.getNext());
                app_bar.show(2000);
                //control_bar.show(2000);
            },
            'CH_DOWN': function () {
                playChannel(channels.getPrevious());
                app_bar.show(2000);
                //control_bar.show(2000);
            },
            'ENTER': function () { showMenu() }
        });
        input.setGestureFunctions({
            'SWIPE_RIGHT': function () { showAuth(); },
            'SWIPE_LEFT': function () { showMenu(); },
            'SWIPE_UP': function () {
                playChannel(channels.getNext());
                app_bar.show(2000);
                //navigator.userAgent.match(/iPhone/g) && control_bar.show(2000);
            },
            'SWIPE_DOWN': function () {
                playChannel(channels.getPrevious());
                app_bar.show(2000);
                //navigator.userAgent.match(/iPhone/g) && control_bar.show(2000);
            }
        });
    };

api.getData(function () {
    auth.setAuthUpdateFunction(function (userpic, key) {
        app_bar.setUserpic(userpic);
        api.setKey(key);
        var play = auth.hasInit();
        update(function () {
            if (play) {
                var channel = channels.getFirstChannel();
                if (storage.get('last_channel') && channels.getChannelById(storage.get('last_channel')))
                    channel = channels.getChannelById(storage.get('last_channel'));
                playChannel(channel);
            }
            if (auth.getKey())
                showPlayer();
            else
                showAuth();
        });
    });
    setInterval(function () { update(); }, 5000);
    input.setDefaultKeyFunctions({
        'RED': function () { Helpers.toggleNode(document.getElementById('grid')) },
        'GREEN': function () { window.location.reload(); },
        'BLUE': function () { Helpers.toggleNode(document.getElementById('debug')) }
    });
    remote.setKey("default");
    remote.setHandler(function (command) { input.emulateKeyPress(command.toUpperCase()); });
    player.setOverlayHandler(function () { showPlayer(); });
    control_bar.setPlayHandler(function () { player.play(); });
    //showLog();
    input.enableKeys();
    // Remove any hashes (after oauth login in some cases)
    //if (window.location.hash.length > 0) window.location.href = window.location.href.split('#')[0];
    Helpers.hideNode(document.getElementById('loading'));
    if (document.readyState === 'complete') {
        Helpers.hideNode(document.getElementById('loading'));
    } else {
        window.addEventListener('load', function () {
            Helpers.hideNode(document.getElementById('loading'));
        });
    }
});
