var api = lanet_tv.Api.getInstance(),
    storage = lanet_tv.Storage.getInstance(),
    controller = lanet_tv.Controller.getInstance(),
    player = lanet_tv.Player.getInstance(),
    app_bar = lanet_tv.AppBar.getInstance(),
    menu = lanet_tv.Menu.getInstance(),
    social = lanet_tv.Social.getInstance(),
    channels = lanet_tv.Channels.getInstance(),
    remote = lanet_tv.Remote.getInstance(),
    channel, balloon_timeout = 0,
    touch = {last_y: 0, current_y: 0, last_x: 0, current_x: 0},
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
            menu.setGenres(api.getGenres());
            menu.setTags(api.getTags());
            callback();
        });
    },
    log = function (string) {
        var debug = document.getElementById('debug');
        debug.innerHTML += string + "\n";
        debug.scrollTop = debug.scrollHeight;
    },
    showBalloon = function (text) {
        var container = document.getElementById("balloon-container"),
            balloon = document.getElementById("balloon");
        Helpers.showNode(container);
        balloon.innerHTML = text;
        clearTimeout(balloon_timeout);
        balloon_timeout = setTimeout(function () {
            Helpers.hideNode(container);
        }, 2000)
    },
    showTint = function () {
        document.getElementById('overlay').classList.add('tinted');
    },
    hideTint = function () {
        document.getElementById('overlay').classList.remove('tinted');
    },
    playChannel = function (channel) {
        channels.setCurrent(channel);
        player.play(channel);
        app_bar.setChannel(channel);
        storage.set('last_channel', channel.data['id']);
        //showPlayer()
    },
    expandMenu = function () {
        menu.expand();
        app_bar.showTitle();
        menu.setItemSelectHandler(function (category, id) {
            switch (category) {
                case 'lists':
                    switch (id) {
                        case 'favourite':
                            getCurrentChannelList = function () {
                                return channels.getFavourite();
                            };
                            break;
                        default:
                            getCurrentChannelList = function () {
                                return channels.getChannels();
                            };
                    }
                    break;
                case 'genres':
                    getCurrentChannelList = function () {
                        return channels.getByClass(id);
                    };
                    break;
                case 'tags':
                    getCurrentChannelList = function () {
                        return channels.getByTag(id);
                    };
                    break;
                default:
                    console.warn('TODO: Unhandled item: ', [category, id]);
                    getCurrentChannelList = function () {
                        return channels.getChannels();
                    };
            }
            menu.setChannels(getCurrentChannelList());
        });
        controller.setKeyFunctions({
            'RIGHT': function () {
                collapseMenu()
            },
            'UP': function () {
                menu.selectPreviousRootItem();
            },
            'DOWN': function () {
                menu.selectNextRootItem();
            },
            'LEFT': function () {
                menu.collapseCurrentRootCategory();
            },
            'ENTER': function () {
                menu.mainRootAction();
            }
        })
    },
    collapseMenu = function () {
        menu.collapse();
        app_bar.hideTitle();
        controller.setKeyFunctions({
            'UP': function () {
                menu.selectPreviousChannel()
            },
            'DOWN': function () {
                menu.selectNextChannel()
            },
            'LEFT': function () {
                expandMenu()
            },
            'RIGHT': function () {
                showPlayer()
            },
            'ENTER': function () {
                playChannel(menu.getSelectedChannel())
            },
            'YELLOW': function () {
                toggleFavourite(menu.getSelectedChannel())
            }
        })
    },
    showMenu = function () {
        showTint();
        menu.show();
        app_bar.show();
        app_bar.setTransparentBackground(true);
        controller.setKeyFunctions({
            'UP': function () {
                menu.selectPreviousChannel()
            },
            'DOWN': function () {
                menu.selectNextChannel()
            },
            'LEFT': function () {
                expandMenu()
            },
            'RIGHT': function () {
                showPlayer()
            },
            'ENTER': function () {
                playChannel(menu.getSelectedChannel())
            },
            'YELLOW': function () {
                toggleFavourite(menu.getSelectedChannel())
            }
        })
    },
    showSocial = function () {
        showTint();
        social.show();
        app_bar.show();
        app_bar.setTransparentBackground(true);
        controller.setKeyFunctions({
            'ENTER': function () {
                social.resetAuth();
            },
            'LEFT': function () {
                showPlayer();
            }
        })
    },
    showPlayer = function () {
        social.hide();
        menu.hide();
        hideTint();
        app_bar.show(2000);
        app_bar.setTransparentBackground(false);
        controller.setKeyFunctions({
            'RIGHT': function () {
                showSocial()
            },
            'LEFT': function () {
                showMenu()
            },
            'UP': function () {
                playChannel(channels.getNext());
                app_bar.show(2000);
            },
            'DOWN': function () {
                playChannel(channels.getPrevious());
                app_bar.show(2000);
            },
            'YELLOW': function () {
                showBalloon("Удаленное управление " + (remote.togglePolling() ? "включено" : "выключено"));
            },
            'CH_UP': function () {
                playChannel(channels.getNext());
                app_bar.show(2000);
            },
            'CH_DOWN': function () {
                playChannel(channels.getPrevious());
                app_bar.show(2000);
            },
            'ENTER': function () {
                //showMenu()
            }
        })
    };

api.getData(function () {
    if (storage.get("token")) {
        social.setAuthUpdateFunction(function (userpic, key) {
            app_bar.setUserpic(userpic);
            api.setKey(key);
            update(function () {
                setInterval(function () {
                    update();
                }, 5000);
                channel = storage.get('last_channel') && channels.getChannelById(storage.get('last_channel')) ? channels.getChannelById(storage.get('last_channel')) : channels.getFirstChannel();
                playChannel(channel);
                showPlayer();
                if (!social.getKey()) {
                    showSocial();
                    controller.disableKeys();
                }
            });
            social.setAuthUpdateFunction(function (userpic, key) {
                app_bar.setUserpic(userpic);
                api.setKey(key);
                update();
                if (social.getKey()) {
                    showPlayer();
                    controller.enableKeys();
                }
            });
        });
    } else {
        setChannels();
        setInterval(function () {
            update();
        }, 5000);
        channel = storage.get('last_channel') && channels.getChannelById(storage.get('last_channel')) ? channels.getChannelById(storage.get('last_channel')) : channels.getFirstChannel();
        playChannel(channel);
        showPlayer();
        showSocial();
        social.setAuthUpdateFunction(function (userpic, key) {
            app_bar.setUserpic(userpic);
            api.setKey(key);
            update();
            if (social.getKey()) {
                showPlayer();
                controller.enableKeys();
            }
        });
    }

});
controller.setDefaultKeyFunctions({
    'RED': function () {
        Helpers.toggleNode(document.getElementById('grid'))
    },
    'GREEN': function () {
        window.location.reload()
    },
    'BLUE': function () {
        Helpers.toggleNode(document.getElementById('debug'))
    }
});
remote.setKey("default");
remote.setHandler(function (command) {
    controller.emulateKeyPress(command.toUpperCase());
});
//remote.togglePolling();
Helpers.hideNode(document.getElementById('loading'));
window.addEventListener("touchstart", function (event) {
    touch.last_y = event.touches[0].clientY;
    touch.last_x = event.touches[0].clientX;
    touch.current_y = touch.last_y;
    touch.current_x = touch.last_x;
    document.getElementById("player").play();
    log("touchstart " + touch.last_x + "x" + touch.last_y);
});
window.addEventListener("touchend", function (event) {
    touch.current_x = event.changedTouches[event.changedTouches.length - 1].clientX;
    touch.current_y = event.changedTouches[event.changedTouches.length - 1].clientY;
    var delta_y = touch.current_y - touch.last_y,
        delta_x = touch.current_x - touch.last_x;
    log("touchend " + touch.last_x + "x" + touch.last_y + " " + touch.current_x + "x" + touch.current_y + ' ' + delta_x + 'x' + delta_y);
    if (Math.abs(delta_y) > 100) {
        if (delta_y < 0)
            controller.emulateKeyPress("UP");
        else if (delta_y > 0)
            controller.emulateKeyPress("DOWN");
    }
    else if (Math.abs(delta_x) > 100) {
        if (delta_x < 0)
            controller.emulateKeyPress("RIGHT");
        else if (delta_x > 0)
            controller.emulateKeyPress("LEFT");
    } else if (Math.abs(delta_x) < 10 && Math.abs(delta_y) < 10) {
        controller.emulateKeyPress("ENTER");
    }
    touch.last_y = touch.current_y;
    touch.last_x = touch.current_x;
});
if (document.readyState === 'complete') {
    Helpers.hideNode(document.getElementById('loading'));
} else {
    window.addEventListener('load', function () {
        Helpers.hideNode(document.getElementById('loading'));
    });
}
