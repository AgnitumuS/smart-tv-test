var api = lanet_tv.Api.getInstance(),
    storage = lanet_tv.Storage.getInstance(),
    controller = lanet_tv.Controller.getInstance(),
    player = lanet_tv.Player.getInstance(),
    app_bar = lanet_tv.AppBar.getInstance(),
    menu = lanet_tv.Menu.getInstance(),
    social = lanet_tv.Social.getInstance(),
    channels = lanet_tv.Channels.getInstance(),
    remote = lanet_tv.Remote.getInstance(),
    channel,
    updateTime = function () {
        Time.setTimestamp(api.getTimestamp());
        Time.setOffset(api.getOffset());
    },
    setChannels = function () {
        api.parseChannels().forEach(function (channel) {
            channel['favourite'] = storage.get('favourite').split(' ').indexOf(channel['id'].toString()) != -1;
            channels.setChannel(channel);
        });
    },
    toggleFavourite = function (channel) {
        var current = storage.get('favourite').split(' '),
            target = channel.data['id'].toString(),
            index = current.indexOf(target);
        storage.set('favourite', (index == -1 ? current.concat([target]) : current.spliced(index, 1)).join(' '));
        channel.data['favourite'] = storage.get('favourite').split(' ').indexOf(target) != -1;
        channels.setChannel(channel.data);
    },
    update = function () {
        api.update(function () {
            updateTime();
            setChannels();
            app_bar.setChannel(channels.getCurrent());
        });
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
                            menu.setChannels(channels.getFavourite());
                            break;
                        default:
                            menu.setChannels(channels.getChannels());
                    }
                    break;
                case 'genres':
                    menu.setChannels(channels.getByClass(id));
                    break;
                case 'tags':
                    menu.setChannels(channels.getByTag(id));
                    break;
                default:
                    console.warn('TODO: Unhandled item: ', [category, id])
            }
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
            'RED': function () {
                social.resetAuth()
            },
            'LEFT': function () {
                showPlayer()
            },
            'BLUE': function() {
                var enabled = remote.togglePolling();
                console.log("Remote " + enabled ? "enabled" : "disabled")
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
            'CH_UP': function () {
                playChannel(channels.getNext());
                app_bar.show(2000);
            },
            'CH_DOWN': function () {
                playChannel(channels.getPrevious());
                app_bar.show(2000);
            },
            'ENTER': function () {
                showMenu()
            }
        })
    };
api.getData(function () {
    app_bar.setTitle('/ONAIR');
    setChannels();
    setInterval(function () {
        update();
    }, 5000);
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
    social.setUserpicChangeFunction(function (userpic) {
        app_bar.setUserpic(userpic);
    });
    channel = storage.get('last_channel') ? channels.getChannelById(storage.get('last_channel')) : channels.getChannelByNumber();
    playChannel(channel);
    showPlayer();
    menu.setChannels(channels.getChannels());
    menu.setGenres(api.getGenres());
    menu.setTags(api.getTags());
    remote.setHandler(function (command) {
        switch (command.toUpperCase()) {
            case 'NEXT':
                playChannel(channels.getNext());
                app_bar.show(2000);
                break;
            case 'PREV':
                playChannel(channels.getPrevious());
                app_bar.show(2000);
                break;
        }
    });
});
Helpers.hideNode(document.getElementById('loading'));
if (document.readyState === 'complete') {
    Helpers.hideNode(document.getElementById('loading'));
} else {
    window.addEventListener('load', function () {
        Helpers.hideNode(document.getElementById('loading'));
    });
}
