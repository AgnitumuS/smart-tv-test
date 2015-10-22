"use strict";
var debug = {
    el: document.getElementById('debug'),
    log: function (message) {
        if (this.el) {
            this.el.value += message + '\n';
            this.el.scrollTop = this.el.scrollHeight;
        } else {
            console.log(message);
        }
    },
    toggle: function (state) {
        toggleNode(this.el, state);
    }
};

/* Singleton Notify widgets about changing in models */
var PubSub = {
    topics: {},
    subscribe: function (topic, observer) {
        if (!this.topics[topic]) {
            this.topics[topic] = [];
        }
        this.topics[topic].push(observer);
    },
    publish: function (topic, args) {
        console.log("published topic : " + topic, 'with args:', args || '{empty}');
        if (this.topics[topic]) {
            this.topics[topic].forEach(function (cur) {
                cur.handleEvent(topic, args);
            })
        }
    }
};

var App = {
    api: {
        api: 'api.lanet.tv',
        static: 'static.lanet.ua',
        data: 'data.lanet.tv'
    },
    pack: '',
    socket: {},
    controllers: {},
    widgets: {},
    currentController: null,
    initialize: function () {
        var self = this;
        App.go("loading");
        Time.updateOffset(function () {
            self.updateClock();
        });
        setInterval(function () {Time.updateOffset()}, 3600000);
        setInterval(function () {self.updateClock()}, 10000);
    },
    initializeEvents: function () {
        var throttled = throttle(function (event) {
            App.currentController[App.device.getKeyFunction(event)]();
        }, 50);
        window.addEventListener('keydown', function (event) {
            if (App.currentController[App.device.getKeyFunction(event)]) {
                event.preventDefault();
                throttled(event);
            }
        });
        window.addEventListener('hashchange', function () {
            if (App.currentController) {
                App.currentController.destroy();
            }
            switch (location.hash) {
                case '#loading':
                    App.currentController = App.controllers.LoadingController;
                    App.currentController.init();
                    break;
                /*
                 case '#login' :
                 App.currentController = App.controllers.loginController;
                 break;
                 */
                case '#player':
                    App.currentController = App.controllers.PlayerController;
                    App.currentController.init();
                    break;

                case '#playlist':
                    App.currentController = App.controllers.PlaylistController;
                    App.currentController.init();
                    break;
            /**
             *    @description make ChansList as active widget
             */
                case '#playlist?chan':
                    App.currentController = App.controllers.PlaylistController;
                    App.currentController.initWithChan();
                    break;
                case '#quickMenu':
                    App.currentController = App.controllers.QuickMenuController;
                    App.currentController.init();
                    break;
                default:
                    console.log("default case controller");
                    break;
            }
        });
    },
    start: function () {
        this.initializeEvents();
        this.initialize();
    },
    go: function (hash) {
        window.location.hash = '#' + hash;
        PubSub.publish("location.hash/changed", hash);
    },
    updateClock: function () {
        var localTime = Time.getLocalTime();
        document.getElementById('clockContainer').innerHTML = pad(localTime.hours, 2) + ' : ' + pad(localTime.minutes, 2);
    }
};


/**
 * Persistent storage
 */
App.db = {
    prefix: '_db_',
    get: function (key) {
        return localStorage['' + this.prefix + key]
            ? JSON.parse(localStorage['' + this.prefix + key])
            : undefined;
    },
    set: function (key, val) {
        localStorage.setItem(this.prefix + key, JSON.stringify(val));
    },

    /**
     * @param {Object=} chan - новое значение для chan. Не обязателен.
     * @description Если указан, то lastChan(...) действует, как setter.
     *              Если не указан, то lastChan() действует, как getter.
     */
    lastChan: function (chan) {
        if (chan != undefined) {
            this.set('lastChan', chan);
        } else {
            return this.get('lastChan') || {};
        }
    }
};

/**
 * @module Loading Controller
 *
 */
App.controllers.LoadingController = (function () {
    function LoadingController() {
        this.loaded = {
            chans: false
        };
        this.init = function () {
            //showNode(document.getElementById('loading'));
            getJSON('//' + App.api.data, function (data) {
                App.components.Chans.init(data);
            });
            /* WebSockets (only for WebOs. Draft protocol in NetCast) */
            /*
             App.socket = new SocketAPI('ws://' + App.api.data, { key: 'test', lang: 'ru' });
             debug('created socket');
             App.socket.on('connect', function(data){
             App.components.Chans.init(data);
             debug('ws connected');
             })
             App.socket.on('upd_epg', function  (data) {
             App.components.Chans.updEpg(data);
             debug('ws upd_epg')
             })
             App.socket.on('rating', function  (data) {
             App.components.Chans.changeRating(data);
             })
             */
            /*	WebSockets */
        };
        this.destroy = function () {
        };
        this.isReady = function () {
            return (this.loaded.chans && this.loaded.genres );
        };
        this.handleEvent = function (topic) {
            switch (topic) {
                case App.components.Chans.title + '/init':
                    this.loaded.chans = true;
                    App.player.changeList(App.components.Chans.getSelectedIndex());
                    break;
                default:
                    throw 'Observer was subscribed for this topic, but there is no processing ' + topic;
                    break;
            }
            if (this.isReady) {
                //hideNode(document.getElementById('loading'));
                App.go('player');
            }
        }
    }

    return new LoadingController();
})();

/**
 * @constructor
 * @description - Prototype for components
 */
function Model() {
    this.set = function (key, val, callback) {
        this[key] = val;
        if (callback) {
            callback.call(this);
        }
    };
    this.currentList = [];
    // this.selectedIndex = -1;
    this.getSelectedIndex = function () {
        return this.selectedIndex;
    };
    this.hasElem = function (ind) {
        return this.currentList[ind] ? true : false;
    };
    this.setSelectedIndex = function (val) {
        var self = this,
            oldInd = this.selectedIndex >= 0
                ? this.selectedIndex
                : undefined,
            args = {
                "prev": oldInd
            };
        this.set('selectedIndex', val);
        PubSub.publish(self.title + "/changeSelectedIndex", args);
    };
    this.getSelectedItem = function () {
        return this.currentList[this.getSelectedIndex()];
    }
}

/**
 * @namespace Components
 *
 */
App.components = {};
App.components.Menu = (function () {
    var menuModel = Object.create(new Model());
    menuModel.title = 'Menu';
    menuModel.selectedIndex = 0;
    menuModel.all = [
        {
            id: 'playlists',
            childNodeType: 'playlist'
        },
        {
            id: 'genres',
            childNodeType: 'genre'
        },
        {
            id: 'settings',
            childNodeType: 'setting'
        }
    ];
    menuModel.currentList = menuModel.all;
    menuModel.getIdElByChildType = function (type) {
        for (var i = 0; i < this.currentList.length; i++) {
            if (this.currentList[i].childNodeType === type) {
                return i;
            }
        }
    };
    return menuModel;
})();

App.components.Playlists = (function () {
    function PlaylistsModel() {
        this.selectedIndex = 0;
        this.title = 'Playlists';
        this.all = [
            {id: 'favorites', type: 'playlist', title: 'Избранные'},
            {id: 'rating', type: 'playlist', title: 'Рейтинг'},
            {id: 'all', type: 'playlist', title: 'Все'}
        ];
        this.currentList = this.all;
    }

    PlaylistsModel.prototype = new Model();
    return new PlaylistsModel();
})();

App.components.Genres = (function () {
    function Genres() {
        this.selectedIndex = 0;
        this.title = "Genres";
        this.all = [];
        this.currentList = [];
        this.changeList = function (arr) {
            // исключить "Без категории"
            var genres = [];
            arr.slice(1).forEach(function (cur, ind) {
                genres.push({
                    id: cur,
                    type: 'genre',
                    title: cur,
                    class: ind
                })
            });
            this.set('all', genres, function () {
                this.currentList = this.all;
            });
        };
    }

    Genres.prototype = new Model();
    return new Genres();
})();

App.components.Catalog = (function () {
    function Catalog() {
        this.selectedIndex = 1;
        this.title = "Catalog";
        this.all = [];
        this.currentList = [];
        this.init = function (res) {
            //take playlists
            //take genres
            App.components.Genres.changeList(res.classList);
            // create full list
            App.components.Playlists.all.forEach(function (cur) {
                this.all.push(cur);
            }, this);

            App.components.Genres.all.forEach(function (cur) {
                this.all.push(cur);
            }, this);
            this.currentList = this.all;
        };
        this.getElementById = function (id) {
            return this.currentList[id] || {type: 'default'};
        };
        this.getCurrent = function () {
            return this.getElementById(this.getSelectedIndex());
        };
        //switch according to player info
        this.resetChanges = function () {
            var ind = this.currentList.indexOf(App.player.chans.category);
            console.log('resetting category ');
            this.setSelectedIndex(ind);
        };
        //get first element in list with type
        this.getFirstIdByType = function (type) {
            var id = -1;
            for (var i = 0; i < this.currentList.length; i++) {
                if (this.currentList[i].type === type) {
                    id = i;
                    return id;
                }
            }
            if (id === -1) {
                return 0;
            }
        }
    }

    Catalog.prototype = new Model();
    return new Catalog();
})(window, document);

/**
 *    @class Chans
 *    @extends Model
 */
App.components.Chans = (function () {
    function ChansModel() {
        this.title = 'Chans';
        this.selectedIndex = -1;
        this.all = {};
        this.favorites = [];
        //array with id's only
        this.currentList = [];
        //rating order
        this.rating = [];
        //cable order
        this.order = [];
        this.init = function (res) {
            var self = this;
            self.all = res.list;
            //Init api refs
            App.pack = res.pack;
            App.api.edge = res.edge;
            self.order = res.sort.order.slice();
            self.rating = res.sort.rating.slice();
            self.favorites = App.db.get('favChans') || [];
            self.currentList = self.rating;
            self.setSelectedIndex(this.getIndexById(App.db.lastChan()) || 0);
            App.components.Catalog.init(res);
            PubSub.publish(self.title + '/init');
        };
        this.resetChanges = function () {
            this.currentList = App.player.chans.list.slice();
            this.setSelectedIndex(App.player.chans.selected);
        }
    }

    ChansModel.prototype = new Model();
    ChansModel.prototype.getCurChanId = function () {
        return this.currentList[this.getSelectedIndex()];
    };
    ChansModel.prototype.getCurChan = function () {
        return this.all[this.getCurChanId()];
    };
    ChansModel.prototype.getCurList = function () {
        return this.currentList;
    };
    ChansModel.prototype.getChanById = function (id) {
        return this.all[id] || undefined;
    };
    ChansModel.prototype.getIndexById = function (id) {
        var index = this.currentList.indexOf(id);
        return index != -1 ? index : undefined;
    };
    ChansModel.prototype.getChansByGenre = function (id) {

        return this.rating.filter(function (el) {
            if (this.all[el] && this.all[el].epg.length !== 0) {
                // +1 avoiding "без жанра"
                return this.all[el].epg[0].class === (id + 1);
            } else {
                return false;
            }
        }, this)
    };

    ChansModel.prototype.genListByCategory = function (ind) {
        var list = [],
            category = App.components.Catalog.getElementById(ind);

        switch (category.type) {
            case 'playlist':
                switch (category.id) {
                    case "rating":
                        list = this.rating || [];
                        break;
                    case "favorites":
                        list = App.db.get('favChans') || [];
                        break;
                    case 'all':
                        list = this.order || [];
                        break;
                    default :
                        throw 'Wrong list ind in genListByCategory';
                        break;
                }
                break;

            case 'genre':
                list = this.getChansByGenre(category.class);
                break;

            default:
                throw 'Err';
                break;
        }
        console.log('genListByCategory returned list:', list);
        return list;
    };
    ChansModel.prototype.changeCurList = function (list) {
        this.currentList = list.slice(0);
    };
    //Event from ws
    ChansModel.prototype.updEpg = function (data) {
        this.all[data.id].epg = data.epg;
        console.log('upd_epg event ws');
    };

    ChansModel.prototype.changeRating = function (data) {
        this.rating = data;
        console.log("ws rating changed");
    };

    ChansModel.prototype.toggleFavChan = function (id) {
        if (!id) {
            throw 'Toggle without id Exception'
        }
        var fav = this.favorites,
            db = App.db,
            position = fav.indexOf(id);
        if (position === -1) {
            fav.push(id);
            this.favorites = fav;
            PubSub.publish(this.title + '/addFavChan', id);
        } else {
            fav.splice(position, 1);
            this.favorites = fav;
            PubSub.publish(this.title + '/rmFavChan', id);
        }
        db.set('favChans', fav);
    };
    ChansModel.prototype.isFav = function (id) {
        return this.favorites.indexOf(id) !== -1;
    };
    return new ChansModel();
})();

PubSub.subscribe(App.components.Chans.title + '/init', App.controllers.LoadingController);

App.components.Epg = {
    title: 'Epg',
    currentList: [],
    initUpdEpg: function () {
        //for each chan witch has epg, set timout to upd epg next time
        //to interval  ==
        var self = this,
            order = App.components.Chans.order,
            all = App.components.Chans.all,
            timeNow = Math.floor(new Date().getTime() / 1000);

        if (order && all) {
            order.forEach(function (cur) {
                if (all[cur].epg.length) {
                    if (all[cur].epg[0].stop > timeNow) {
                        //console.log('timeout = ', Math.floor((all[cur].epg[0].stop - timeNow + 5) / 60), 'min, chan=', cur);
                        setTimeout(
                            function () {
                                self.nextUpdEpg(cur);
                            }, (all[cur].epg[0].stop - timeNow + 5) * 1000
                        );
                    }
                }
            })
        }

    },
    nextUpdEpg: function (chanId) {
        var self = this,
            all = App.components.Chans.all,
            timeNow = Math.floor(new Date().getTime() / 1000);
        getJSON('//' + App.api.api + '/epg/' + chanId + '/now?next=1', function (res) {
            if (res.length) {
                console.log('nextUpd for chan=', chanId, res[0].start !== all[chanId].epg[0].start);
                if (res[0].start !== all[chanId].epg[0].start) {
                    all[chanId].epg = res;
                    PubSub.publish(self.title + '/upd_epg', chanId);
                    setTimeout(
                        function () {
                            self.nextUpdEpg.apply(App.components.Epg, [chanId])
                        }
                        // self.nextUpdEpg
                        // 5 - magic number
                        , (all[chanId].epg[0].stop - timeNow + 5) * 1000);
                }
            }
        })
    },
    handleEvent: function (topic) {
        switch (topic) {
            case  App.components.Chans.title + '/init':
                this.initUpdEpg();
                break;
            default:
                throw 'Observer was subscribed but has got no handling';
                break;
        }
    }
};

PubSub.subscribe(App.components.Chans.title + '/init', App.components.Epg);

/**
 *   @module WIDGETS
 */
//App.widgets //Menu, ChansCats, Chans, Progs, ExtendProgs
App.widgets = {};

/**
 *    @class widgets.Menu
 */
App.widgets.Menu = {
    model: App.components.Menu,
    grid: {x: 1, y: 1},
    neighbors: {
        right: function () {
            return App.widgets.Catalog
        }
    },
    active: false,
    menuEntities: [],
    init: function () {
    },
    up: function () {
        ListController.up.call(App.currentController);
    },
    down: function () {
        ListController.down.call(App.currentController);
    },
    left: function () {
        App.components.Chans.resetChanges();
        App.components.Catalog.resetChanges();
        App.go('player');
    },
    right: function () {
        ListController.right.call(App.currentController);
    },
    /**
     * @description notify observer widgets about change active state
     */
    notify: function () {
        var chans = document.getElementById('chans'),
            fullEpg = document.getElementById('fullEpg');
        if (this.active) {
            showNode(chans);
            showNode(fullEpg);
        } else {
            hideNode(chans);
            hideNode(fullEpg);
        }
    },
    render: function () {
        var menu = document.getElementById('menu'),
            menuEntities = this.menuEntities = [];
        removeChildren(menu);
        this.model.all.forEach(function (cur, ind) {
            var entity = document.createElement('div');
            entity.className = 'menuentity';
            entity.dataset.id = cur.id;
            entity.tabIndex = ind;
            entity.style.backgroundImage = cssUrl('./assets/icons/' + cur.id + '.png');
            menuEntities.push(entity);
            menu.appendChild(entity);
        });
    },
    highlight: function (args) {
        var self = this;
        this.menuEntities.forEach(function (entity) {
            if ((args && entity.tabIndex == args.prev) || !args) {
                removeClass(entity, ['highlight', 'spotlight']);
            }
            if (entity.tabIndex == self.model.getSelectedIndex()) {
                addClass(entity, 'highlight');
                if (self.active) {
                    addClass(entity, 'spotlight');
                }
            }
        });
    },
    enter: function () {
        App.currentController.RIGHT();
    },
    identifyNearestNeighbor: function (prevWidget) {
        if (prevWidget === App.widgets.Catalog) {
            var catItem = App.components.Catalog.getSelectedItem();
            var menuItem = App.components.Menu.getSelectedItem();
            if (catItem.type !== menuItem.childNodeType) {
                // change menu selectedIndex according to type of catalog entity
                App.components.Menu.setSelectedIndex(App.components.Menu.getIdElByChildType(catItem.type));
            }
        }
    }

};
App.widgets.Menu.controller = (function () {
    function Controller(widget) {
        this.widget = widget;
    }

    return new Controller(App.widgets.Menu);
})();
App.widgets.Menu.controller.handleEvent = function (topic, args) {
    var self = this;
    switch (topic) {
        case App.components.Menu.title + '/changeSelectedIndex' :
            self.widget.highlight(args);
            break;

        default:
            throw 'Observer ' + this.title + ' was subscribed, but there are no realization';
            break;
    }
};
PubSub.subscribe(App.components.Menu.title + '/changeSelectedIndex', App.widgets.Menu.controller);


App.widgets.Catalog = {
    model: App.components.Catalog,
    grid: {x: 1, y: 1},
    neighbors: {
        right: function () {
            return App.widgets.ChansList
        },
        left: function () {
            return App.widgets.Menu
        }
    },
    //spotlight
    active: false,
    catalogEntities: [],
    init: function () {
    },
    up: function () {
        ListController.up.call(App.currentController);
    },
    down: function () {
        ListController.down.call(App.currentController);
    },
    left: function () {
        ListController.left.call(App.currentController);
    },
    right: function () {
        var idCategory = this.model.getSelectedIndex(),
            newList = App.components.Chans.genListByCategory(idCategory);
        if (newList.length !== 0) {
            App.components.Chans.changeCurList(newList);
            // App.widgets.FullEpg.render()
            App.components.Chans.setSelectedIndex(0);
            ListController.right.call(App.currentController);
        }

    },
    enter: function () {
        App.currentController.RIGHT();
    },
    notify: function () {
        var menu = document.getElementById('menu');
        if (this.active) {
            // App.widgets.ChansList подвинуть
            addClass(menu, 'open');
            this.render();
            this.highlightTitle();
            this.scrollToCur();
        } else {
            removeClass(menu, 'open');
            //сбросить значение
            this.highlightTitle({});
            //hide all, show images
            App.widgets.Menu.render();
        }
    },
    render: function () {
        function createEntity(index, title) {
            var catalogEntity = document.createElement('div');
            catalogEntity.className = 'catalogEntity';
            catalogEntity.tabIndex = index;
            catalogEntity.innerHTML = title;
            return catalogEntity;
        }

        var self = this,
            menuEl = document.getElementById('menu'),
            playlistsTitleEl = document.createElement('div'),
            genresTitleEl = document.createElement('div'),
            settingsTitleEl = document.createElement('div'),
            playlists = [],
            genres = [],
            settings = [];

        playlistsTitleEl.id = 'playlistsTitle';
        genresTitleEl.id = 'genresTitle';
        settingsTitleEl.id = 'settingsTitle';
        playlistsTitleEl.className = genresTitleEl.className = settingsTitleEl.className = 'catalogTitles';
        playlistsTitleEl.innerHTML = 'Списки';
        genresTitleEl.innerHTML = 'Жанры';
        settingsTitleEl.innerHTML = 'Настройки';

        self.catalogEntities = [];

        this.model.currentList.forEach(function (cur, ind) {
            var entity = createEntity(ind, cur.title);
            self.catalogEntities.push(entity);
            switch (cur.type) {
                case 'playlist':
                    playlists.push(entity);
                    break;
                case 'genre':
                    genres.push(entity);
                    break;
                case 'setting':
                    settings.push(entity);
                    break;
            }
        });

        removeChildren(menuEl);

        menuEl.appendChild(playlistsTitleEl);
        playlists.forEach(function (catalogEntity) {
            menuEl.appendChild(catalogEntity);
        });

        menuEl.appendChild(genresTitleEl);
        genres.forEach(function (catalogEntity) {
            menuEl.appendChild(catalogEntity);
        });

        menuEl.appendChild(settingsTitleEl);
        settings.forEach(function (catalogEntity) {
            menuEl.appendChild(catalogEntity);
        });
    },
    highlight: function (args) {
        var self = this;
        this.catalogEntities.forEach(function (entity) {
            if ((args && entity.tabIndex == args.prev) || !args) {
                removeClass(entity, ['highlight', 'spotlight']);
            }
            if (entity.tabIndex == self.model.getSelectedIndex()) {
                addClass(entity, 'highlight');
                if (self.active) {
                    addClass(entity, 'spotlight');
                }
            }
        });
    },
    scrollToCur: function () {
        var ind = this.model.getSelectedIndex(),
            menu = document.getElementById('menu');
        this.catalogEntities.forEach(function (entity) {
            if (entity.tabIndex == ind) {
                var height = entity.offsetHeight;
                menu.scrollTop = height * ind - 2 * height;
            }
        });
    },
    notifyWithDelay: (function (window) {
        var dTimeout;

        function notifyWithDelay(delay) {
            var self = this;
            window.clearTimeout(dTimeout);
            dTimeout = window.setTimeout(function () {
                PubSub.publish(self.model.title + "/notifyWithDelay")
            }, delay);
        }

        return notifyWithDelay;
    })(window, document),
    identifyNearestNeighbor: function (prevWidget) {
        if (prevWidget === App.widgets.Menu) {
            var menuItem = App.components.Menu.getSelectedItem();
            this.model.setSelectedIndex(this.model.getFirstIdByType(menuItem.childNodeType));
        }
    },
    highlightTitle: (function (window, document, undefined) {
        var curType, // playlist, genre, setting
            playlistsTitle = document.getElementById('playlistsTitle'),
            genresTitle = document.getElementById('genresTitle');

        function highlightTitle(type) {
            //сбросить текущий тип (ипользуем при закрытии вкладки)
            if (type !== undefined) {
                curType = type;
                return;
            }
            var item = App.components.Catalog.getSelectedItem();
            console.log(curType);
            if (item.type !== curType) {
                switch (item.type) {
                    case 'playlist':
                        curType = item.type;
                        removeClass(genresTitle, 'highlight');
                        addClass(playlistsTitle, 'highlight');
                        break;
                    case 'genre':
                        curType = item.type;
                        removeClass(playlistsTitle, 'highlight');
                        addClass(genresTitle, 'highlight');
                        break;
                    default:
                        throw 'There are no such title for this type';
                        break;
                }
            }
        }

        return highlightTitle;
    })(window, document)

};
App.widgets.Catalog.controller = (function () {
    function Controller(widget) {
        this.widget = widget;
    }

    return new Controller(App.widgets.Catalog);
})();

App.widgets.Catalog.controller.handleEvent = function (topic, args) {
    var self = this;

    switch (topic) {

        case App.components.Catalog.title + '/changeSelectedIndex' :
            if (self.widget.active) {
                self.widget.highlight(args);
                self.widget.highlightTitle();
            }
            //notify dependency widgets
            self.widget.notifyWithDelay(500);
            break;

        default:
            throw 'Observer ' + this.title + ' was subscribed, but there are no realization';
            break;
    }
};
PubSub.subscribe(App.components.Catalog.title + '/changeSelectedIndex', App.widgets.Catalog.controller);

App.widgets.ChansList = {
    model: App.components.Chans,
    visibleItemCount: 5,
    grid: {x: 1, y: 1},
    list: [],
    neighbors: {
        // right : function () { return  App.widgets.ProgramsList } ,
        left: function () {
            return App.widgets.Catalog
        }
    },
    //spotlight
    active: false,
    chanEntities: [],
    up: function () {
        ListController.up.call(App.currentController);
    },
    down: function () {
        ListController.down.call(App.currentController);
    },
    left: function () {
        ListController.left.call(App.currentController);
    },
    right: function () {
        ListController.right.call(App.currentController);
    },
    notify: function () {
        var chans = document.getElementById('chans');
        if (this.active) {
            removeClass(document.getElementById('menu'), 'open');
            addClass(chans, 'active');
            this.scrollToCur();
            // App.widgets.Playlists.collapse(true);
            // App.widgets.Genres.collapse(true);
        } else {
            removeClass(chans, 'active');
        }
    },
    scrollToCur: function () {
        var ind = this.model.getSelectedIndex(),
            chans = document.getElementById('chans');
        this.chanEntities.forEach(function (entity) {
            if (entity.tabIndex == ind) {
                var height = entity.offsetHeight;
                chans.scrollTop = height * ind - 2 * height;
            }
        });
    },
    highlight: function (args) {
        var self = this;
        this.chanEntities.forEach(function (entity) {
            if ((args && entity.tabIndex == args.prev) || !args) {
                removeClass(entity, ['highlight', 'spotlight']);
            }
            if (entity.tabIndex == self.model.getSelectedIndex()) {
                addClass(entity, 'highlight');
                if (self.active) {
                    addClass(entity, 'spotlight');
                }
            }
        });
    },
    render: function (newList) {
        var self = this,
            chansEl = document.getElementById('chans'),
            list = newList ? newList : this.model.currentList;
        this.chanEntities = [];
        removeChildren(chansEl);
        list.forEach(function (curId, index) {
            var chan = App.components.Chans.getChanById(curId);
            if (!chan)
                return;
            var epg = chan.epg[0] || {
                        start: '',
                        title: 'Прямой эфир.',
                        text: ''
                    },
                startTimeObj = Time.getLocalTime(parseInt(epg.start) * 1000),
                startTime = epg.start ? pad(startTimeObj.hours, 2) + ' : ' + pad(startTimeObj.minutes, 2) : '',
                chanEntity = document.createElement('div'),
                logoChanEl = document.createElement('div'),
                chanPicEl = document.createElement('div'),
                programContentEl = document.createElement('div'),
                timeStartEl = document.createElement('div'),
                titleProgEl = document.createElement('div'),
                textProgEl = document.createElement('div'),
                previewChanEl = document.createElement('div'),
                chanPreviewEl = document.createElement('div'),
                favStarEl = document.createElement('div');

            chanEntity.className = 'chan';
            logoChanEl.className = 'logoChan';
            chanPicEl.className = 'chanPic';
            programContentEl.className = 'programContent';
            timeStartEl.className = 'timeStart';
            titleProgEl.className = 'titleProg';
            textProgEl.className = 'textProg';
            previewChanEl.className = 'previewChan';
            chanPreviewEl.className = 'chanPreview';
            favStarEl.className = 'favStar';

            chanEntity.tabIndex = index;
            chanEntity.dataset.id = curId;

            chanPicEl.style.backgroundImage = cssUrl('//' + App.api.static + '/tv/logo/' + curId + '.png');

            logoChanEl.appendChild(chanPicEl);
            if (self.model.isFav(curId))
                logoChanEl.appendChild(favStarEl);
            chanEntity.appendChild(logoChanEl);

            timeStartEl.innerHTML = startTime;
            titleProgEl.innerHTML = epg.title;
            textProgEl.innerHTML = epg.text;

            programContentEl.appendChild(timeStartEl);
            programContentEl.appendChild(titleProgEl);
            programContentEl.appendChild(textProgEl);
            chanEntity.appendChild(programContentEl);

            chanPreviewEl.style.backgroundImage = cssUrl('//' + App.api.edge + '/tv/_' + curId + '.jpg');
            previewChanEl.appendChild(chanPreviewEl);
            chanEntity.appendChild(previewChanEl);

            self.chanEntities.push(chanEntity);
            chansEl.appendChild(chanEntity);
        });
        this.highlight();
        this.scrollToCur();
    },
    renderChan: function (id) {
        var self = this,
            chan = App.components.Chans.getChanById(id);
        this.chanEntities.forEach(function (chanEntity, index) {
            if (chanEntity.dataset.id != id || !chan) {
                return;
            }
            removeChildren(chanEntity);
            var epg = chan.epg[0] || {
                        start: '',
                        title: 'Прямой эфир.',
                        text: ''
                    },
                startTimeObj = Time.getLocalTime(parseInt(epg.start) * 1000),
                startTime = epg.start ? pad(startTimeObj.hours, 2) + ' : ' + pad(startTimeObj.minutes, 2) : '',
                logoChanEl = document.createElement('div'),
                chanPicEl = document.createElement('div'),
                programContentEl = document.createElement('div'),
                timeStartEl = document.createElement('div'),
                titleProgEl = document.createElement('div'),
                textProgEl = document.createElement('div'),
                previewChanEl = document.createElement('div'),
                chanPreviewEl = document.createElement('div'),
                favStarEl = document.createElement('div');

            logoChanEl.className = 'logoChan';
            chanPicEl.className = 'chanPic';
            programContentEl.className = 'programContent';
            timeStartEl.className = 'timeStart';
            titleProgEl.className = 'titleProg';
            textProgEl.className = 'textProg';
            previewChanEl.className = 'previewChan';
            chanPreviewEl.className = 'chanPreview';
            favStarEl.className = 'favStar';

            chanPicEl.style.backgroundImage = cssUrl('//' + App.api.static + '/tv/logo/' + id + '.png');

            logoChanEl.appendChild(chanPicEl);
            if (self.model.isFav(id))
                logoChanEl.appendChild(favStarEl);
            chanEntity.appendChild(logoChanEl);

            timeStartEl.innerHTML = startTime;
            titleProgEl.innerHTML = epg.title;
            textProgEl.innerHTML = epg.text;

            programContentEl.appendChild(timeStartEl);
            programContentEl.appendChild(titleProgEl);
            programContentEl.appendChild(textProgEl);
            chanEntity.appendChild(programContentEl);

            chanPreviewEl.style.backgroundImage = cssUrl('//' + App.api.edge + '/tv/_' + id + '.jpg');
            previewChanEl.appendChild(chanPreviewEl);
            chanEntity.appendChild(previewChanEl);

            self.chanEntities[index] = chanEntity;
        });
    },
    enter: function () {
        App.player.changeList(this.model.getSelectedIndex());
        hideNode(document.getElementById('browseView'));
        App.go('player');
    },
    yellow: function () {
        this.model.toggleFavChan(this.model.getCurChanId());
    }
};
App.widgets.ChansList.controller = (function () {
    function Controller(widget) {
        this.widget = widget;
    }

    return new Controller(App.widgets.ChansList);
})();
App.widgets.ChansList.controller.handleEvent = function (topic, args) {
    var self = this;
    var model = self.widget.model;
    switch (topic) {

        case App.components.Chans.title + '/changeSelectedIndex':
            self.widget.highlight(args);
            break;

        case App.components.Chans.title + '/init':
            self.widget.render();
            break;

        case App.components.Catalog.title + '/notifyWithDelay':
            //only render, doesn't change currentList
            var list = model.genListByCategory(App.components.Catalog.getSelectedIndex());
            self.widget.render(list);
            break;
        // case App.components.Chans.title + '/changeCurList':
        // 	model.setSelectedIndex(0);
        // 	break;

        case App.components.Chans.title + '/addFavChan':
        case App.components.Chans.title + '/rmFavChan':
            self.widget.renderChan(args);
            break;

        case App.components.Epg.title + '/upd_epg':
            self.widget.renderChan(args);
            break;

        default:
            throw 'Observer was subscribed but there are no realization : ' + this;
            break;
    }
};
PubSub.subscribe(App.components.Chans.title + '/changeSelectedIndex', App.widgets.ChansList.controller);
PubSub.subscribe(App.components.Chans.title + '/init', App.widgets.ChansList.controller);
PubSub.subscribe(App.components.Catalog.title + '/notifyWithDelay', App.widgets.ChansList.controller);
PubSub.subscribe(App.components.Chans.title + '/addFavChan', App.widgets.ChansList.controller);
PubSub.subscribe(App.components.Chans.title + '/rmFavChan', App.widgets.ChansList.controller);
PubSub.subscribe(App.components.Epg.title + '/upd_epg', App.widgets.ChansList.controller);

App.widgets.AppBar = {
    model: App.components.Chans,
    dTimeout: undefined
};

App.widgets.AppBar.render = function () {
    var self = App.widgets.AppBar,
        id = self.model.getCurChanId(),
        chan = self.model.getCurChan(),
        currentChannelInfoEl = document.getElementById('currentChannelInfo'),
        currentChanLogoEl = document.createElement('img'),
        currentEpgColumnEl = document.createElement('div'),
        nextEpgColumnEl = document.createElement('div'),
        currentChanTitleEl = document.createElement('div'),
        epgNowEl = document.createElement('div'),
        epgNextTitleEl = document.createElement('div'),
        epgNextEl = document.createElement('div');

    removeChildren(currentChannelInfoEl);
    showNode(document.getElementById('appBar'));

    currentChanLogoEl.className = 'currentChanLogo';
    currentEpgColumnEl.className = 'epgColumn';
    currentChanTitleEl.className = 'bold';
    epgNowEl.className = 'epgNow';
    nextEpgColumnEl.className = 'epgColumn';
    epgNextTitleEl.className = 'bold';
    epgNextEl.className = 'epgNext';

    //currentChanLogoEl.style.backgroundImage = cssUrl('//' + App.api.static + '/tv/logo/' + id + '.png');
    currentChanLogoEl.src = '//' + App.api.static + '/tv/logo/' + id + '.png';
    currentChannelInfoEl.appendChild(currentChanLogoEl);

    currentChanTitleEl.innerHTML = chan.title;
    currentEpgColumnEl.appendChild(currentChanTitleEl);

    if (chan.epg[0] && chan.epg[1]) {
        epgNextTitleEl.innerHTML = Time.remainingTime(chan.epg[1].start) + ':';
        nextEpgColumnEl.appendChild(epgNextTitleEl);
        epgNowEl.innerHTML = chan.epg[0].title;
        currentEpgColumnEl.appendChild(epgNowEl);
        currentChannelInfoEl.appendChild(currentEpgColumnEl);

        epgNextEl.innerHTML = chan.epg[1].title;
        nextEpgColumnEl.appendChild(epgNextEl);
        currentChannelInfoEl.appendChild(nextEpgColumnEl);
    } else {
        epgNowEl.innerHTML = 'Прямой эфир';
        currentEpgColumnEl.appendChild(epgNowEl);
        currentChannelInfoEl.appendChild(currentEpgColumnEl);
    }
    clearTimeout(this.dTimeout);
    if (App.currentController !== App.controllers.PlayerController) {
        return;
    }
    this.dTimeout = setTimeout(
        function () {
            hideNode(document.getElementById('appBar'));
        }, 3000
    );
};

// App.widgets.FullEpg = {
// 	model : App.components.Chans,
// 	active : false,
// 	grid : {x : 1, y : 1},
// 	neighbors : {
// 		left  : function () { return App.widgets.Chans } 
// 	},
// 	up : function () {
// 		ListController.up.call(App.currentController);
// 	},
// 	down : function () {
// 		ListController.down.call(App.currentController);
// 	},
// 	left : function () {
// 		ListController.left.call(App.currentController);
// 	},
// 	right : function () {
// 		// ListController.right.call(App.currentController);
// 		App.go('player');
// 	},
// 	scrollToCur : function (args) {
// 		var ind = this.model.getSelectedIndex(),
// 			screen = $('.smallEpgSS[tabindex='+ ind + ']')[0],
// 			idChan = $(screen).data('id'),
// 			height = $(screen).outerHeight(true);

// 		$('#fullEpg').scrollTop(height * ind - 2 * height);

// 		$(screen).css('background-image','url(http://kirito.la.net.ua/tv/_' + idChan +'.jpg?'+ new Date().getTime() +')' )
// 		console.log('scrollTOp:' , height * ind -2 * height)
// 		if(args && (args.prev !== undefined )){
// 			//desaturate
// 			var prevScreen = $('.smallEpgSS[tabindex='+ args.prev + ']')[0],
// 				idChan = $(prevScreen).data('id');
// 			$(prevScreen).css('background-image', 'url(http://kirito.la.net.ua/tv/_' + idChan +'_gs.jpg?'+ new Date().getTime() +')');
// 		}

// 	},
// 	render : function (newList) {

// 		if(!this.active){
// 			//only screenshots
// 			var html = '',
// 				chansList = newList ? newList : App.components.Chans.currentList;
// 				// order = App.components.Chans.order;
// 				// resolution 128 * 72 
// 				// resolution = {
// 				// 	height : 72,
// 				// 	width : 128
// 				// }
// 			chansList.forEach(function  (cur, ind) {
// 				// var indexInSprite = order.indexOf(cur);
// 				// console.log('elem ', cur, 'has index in sprite:', indexInSprite);
// 				html += '<div class="smallEpgSS" tabindex= ' + ind 
// 				+' data-id=' + cur +' style="background-image:'
// 				+'url(http://kirito.la.net.ua/tv/_' + cur +'_gs.jpg?' + new Date().getTime() +')">'
// 								/*Sprite need more time to positioned pic*/
// 				// +'url(http://kirito.la.net.ua/tv/sprite_web_lanet.jpg?' + new Date().getTime() +');'
// 				// +' background-position:-' + (resolution.width * indexInSprite) + 'px 0px">'
// 				+'</div>'
// 			})
// 			$('#fullEpg').html(html);
// 		}
// 	},

// 	controller : {
// 		handleEvent : function (topic, args) {
// 			switch (topic){

// 				case App.components.Chans.title + '/changeSelectedIndex': 
// 					App.widgets.FullEpg.scrollToCur(args);
// 					break;

// 				default:
// 					throw 'Err in Observer'
// 					break;
// 			}
// 		}
// 	}
// }

// // PubSub.subscribe(App.components.Epg.title + '/changeSelectedIndex', App.widgets.FullEpg.controller);
// PubSub.subscribe(App.components.Chans.title + '/changeSelectedIndex', App.widgets.FullEpg.controller);
// // PubSub.subscribe(App.components.Chans.title + '/changeSelectedIndex', App.widgets.FullEpg.controller);


App.player = {
    player: document.getElementById('player'),
    chans: {
        list: [],
        category: {},
        selected: -1,
        switchNext: function () {
            if (this.selected + 1 < this.list.length) {
                this.selected++;
            } else {
                this.selected = 0;
            }
            return this.getCur();
        },
        switchPrev: function () {
            if (this.selected - 1 > -1) {
                this.selected--;
            } else {
                this.selected = this.list.length - 1;
            }
            return this.getCur();
        },
        getCur: function () {
            return App.components.Chans.getChanById(this.list[this.selected])
        }
    },
    init: function () {
        var self = this;
        this.player.addEventListener('ended', function () {
            self.player.play()
        });
        this.player.addEventListener('stalled', function () {
            self.player.play()
        });
    },
    changeList: function (selected) {
        this.chans.list = App.components.Chans.currentList.slice();
        this.chans.category = App.components.Catalog.getCurrent();
        this.chans.selected = selected;
        this.load(this.chans.getCur());
    },
    load: function (chan) {
        var ratio = mapArray(chan['ratio'].split(':'), function (value) {
            return parseInt(value, 10);
        });
        var real = window.innerWidth / window.innerHeight;
        var orig = ratio[0] / ratio[1];
        setPixelNodeWidth(this.player, (real > orig ? ratio[1] / ratio[0] : orig) * window.innerWidth);
        setPixelNodeHeight(this.player, window.innerHeight);
        this.player.src = chan.url;
        App.db.lastChan(App.components.Chans.getCurChanId());
    },
    next: function () {
        this.load(this.chans.switchNext());
        App.components.Chans.setSelectedIndex(this.chans.selected);
    },
    prev: function () {
        this.load(this.chans.switchPrev());
        App.components.Chans.setSelectedIndex(this.chans.selected);
    }
};

App.widgets.FS = {};

App.controllers.PlayerController = {
    init: function () {
        App.widgets.AppBar.render();
    },
    destroy: function () {
    },
    RED: function () {
        window.location.reload();
    },
    BLUE: function () {
        debug.toggle();
    },
    PAGE_UP: function () {
        App.player.next();
        App.widgets.AppBar.render();
    },
    PAGE_DOWN: function () {
        App.player.prev();
        App.widgets.AppBar.render();
    },
    ENTER: function () {
        App.go('quickMenu');
    },
    LEFT: function () {
    },
    UP: function () {

    },
    RIGHT: function () {

    },
    DOWN: function () {
        // body...
    }

};

App.controllers.QuickMenuController = {
    visible: false,
    init: function () {
        showNode(document.getElementById('quickMenuView'));
        App.widgets.AppBar.render();
        this.visible = true;
    },
    destroy: function () {
    },
    RED: function () {
        window.location.reload();
    },
    BLUE: function () {
        debug.toggle();
    },
    ENTER: function () {
        this.visible = getComputedStyle(toggleNode(document.getElementById('quickMenuView')))['display'] != 'none';
        App.go('player');
    },
    LEFT: function () {
        hideNode(document.getElementById('quickMenuView'));
        App.go('playlist?chan');
    },
    UP: function () {
    },
    RIGHT: function () {
    },
    DOWN: function () {
    }
};

var ListController = (function () {
    var up = function () {
        if (this.activeWidget.model.hasElem(this.activeWidget.model.getSelectedIndex() - this.activeWidget.grid.x)) {
            this.activeWidget.model.setSelectedIndex(this.activeWidget.model.getSelectedIndex() - this.activeWidget.grid.x);
            if (this.activeWidget.scrollToCur) {
                this.activeWidget.scrollToCur();
            }
        } else {
            // switch to upNeighbor
            changeWidgetByDirection.call(this, 'UP');
        }
    };

    var right = function () {
        if (( this.activeWidget.model.getSelectedIndex() + 1) % this.activeWidget.grid.x !== 0) {
            // selected next model.id
            if (this.activeWidget.model.hasElem(this.activeWidget.model.getSelectedIndex() + 1)) {
                this.activeWidget.model.setSelectedIndex(this.activeWidget.model.getSelectedIndex() + 1);
            }
        } else {
            changeWidgetByDirection.call(this, 'RIGHT');
        }
    };

    var down = function () {
        if (this.activeWidget.model.hasElem(this.activeWidget.model.getSelectedIndex() + this.activeWidget.grid.x)) {
            this.activeWidget.model.setSelectedIndex(this.activeWidget.model.getSelectedIndex() + this.activeWidget.grid.x);
            if (this.activeWidget.scrollToCur) {
                this.activeWidget.scrollToCur();
            }
        } else {
            changeWidgetByDirection.call(this, 'DOWN');
        }
    };

    var left = function () {
        if ((( this.activeWidget.model.getSelectedIndex() - 1) % this.activeWidget.grid.x) !== 0) {
            //select prec model.id in matrix
        } else {

            changeWidgetByDirection.call(this, 'LEFT');
        }

    };

    var changeWidgetByDirection = function (orient) {
        var witch = {};
        if (orient) {

            switch (orient) {
                case 'UP':
                    if (typeof this.activeWidget.neighbors.up === 'function') {
                        witch = this.activeWidget.neighbors.up();
                    }
                    break;
                case 'RIGHT':
                    if (typeof this.activeWidget.neighbors.right === 'function') {
                        witch = this.activeWidget.neighbors.right();
                    }
                    break;
                case 'DOWN':
                    if (typeof this.activeWidget.neighbors.down === 'function') {
                        witch = this.activeWidget.neighbors.down();
                    }
                    break;
                case 'LEFT':
                    if (typeof this.activeWidget.neighbors.left === 'function') {
                        witch = this.activeWidget.neighbors.left();
                    }
                    break;
                default:
                    throw 'change widget without appropriate orient';
                    break;
            }
            if (Object.getOwnPropertyNames(witch).length !== 0 && witch.model.currentList.length) {

                // identify nearest index, witch will be active
                if (typeof witch.identifyNearestNeighbor === 'function') {
                    witch.identifyNearestNeighbor(this.activeWidget);
                }

                this.setActiveWidget(witch);
                console.log('changeWidgetByDirection to : ', witch);
                return true;
            } else {
                //
                return false;
            }
        }
        else {
            throw 'Illegal changeWidgetByDirection usage (without orient)';
        }
    };

    //facade
    return {
        up: up,
        down: down,
        left: left,
        right: right
    }

})(window, document);

function DefaultController() {
    this.RED = function () {
        window.location.reload();
    };
    this.BLUE = function () {
        debug.toggle();
    };
    this.UP = function () {
        if (typeof this.activeWidget.up === 'function') {
            this.activeWidget.up();
        }
    };
    this.DOWN = function () {
        if (typeof this.activeWidget.down === 'function') {
            this.activeWidget.down();
        }
    };
    this.LEFT = function () {
        if (typeof this.activeWidget.left === 'function') {
            this.activeWidget.left();
        }
    };
    this.RIGHT = function () {
        if (typeof this.activeWidget.right === 'function') {
            this.activeWidget.right();
        }
    };
    this.ENTER = function () {
        if (typeof this.activeWidget.enter === 'function') {
            this.activeWidget.enter();
        }
    };
    this.YELLOW = function () {
        if (typeof this.activeWidget.yellow === 'function') {
            this.activeWidget.yellow();
        }
    };
    this.setActiveWidget = function (widget) {
        if (this.activeWidget) {
            this.activeWidget.active = false;

            if (this.activeWidget.notify) {
                this.activeWidget.notify();
            }
            if (this.activeWidget.highlight) {
                this.activeWidget.highlight();
            }
        }
        this.activeWidget = widget;
        this.activeWidget.active = true;
        if (this.activeWidget.notify) {
            this.activeWidget.notify();
        }
        this.activeWidget.highlight();
    };
}

App.controllers.PlaylistController = (function (window, document) {
    function PlaylistController() {
        this.activeWidget = {};
    }

    PlaylistController.prototype = new DefaultController();
    PlaylistController.prototype.init = function () {
        App.widgets.Menu.render();
        App.widgets.ChansList.render();
        App.widgets.AppBar.render();
        showNode(document.getElementById('browseView'));
        this.setActiveWidget.call(this, App.widgets.Menu);
    };
    PlaylistController.prototype.initWithChan = function () {
        App.widgets.Menu.render();
        App.components.Chans.currentList = App.player.chans.list.slice();
        App.widgets.ChansList.render();
        App.widgets.AppBar.render();
        document.getElementById('browseView').style.height = (window.innerHeight - 72 * 2).toString() + 'px';
        showNode(document.getElementById('browseView'));
        this.setActiveWidget.call(this, App.widgets.ChansList);
    };
    PlaylistController.prototype.destroy = function () {
        hideNode(document.getElementById('browseView'));
    };

    return new PlaylistController();

})(window, document);

App.device = {
    keys: {
        '13': 'ENTER',
        '461': 'BACK',
        '33': 'PAGE_UP',
        '34': 'PAGE_DOWN',
        '107': 'PAGE_UP',
        '109': 'PAGE_DOWN',

        '37': 'LEFT',
        '38': 'UP',
        '39': 'RIGHT',
        '40': 'DOWN',

        '48': 'NUM0',
        '49': 'NUM1',
        '50': 'NUM2',
        '51': 'NUM3',
        '52': 'NUM4',
        '53': 'NUM5',
        '54': 'NUM6',
        '55': 'NUM7',
        '56': 'NUM8',
        '57': 'NUM9',

        '403': 'RED',
        '193': 'RED',
        '82': 'RED', // R
        '404': 'GREEN',
        '194': 'GREEN',
        '71': 'GREEN', // G
        '405': 'YELLOW',
        '195': 'YELLOW',
        '89': 'YELLOW', // Y
        '406': 'BLUE',
        '196': 'BLUE',
        '66': 'BLUE'// B
    },
    getKeyFunction: function (event) {
        return App.device.keys[event.keyCode]
    }
};

App.start();