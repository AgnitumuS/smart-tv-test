/* Singleton Notify widgets about changing in models */
var PubSub = {
	topics : {},
	subscribe : function(topic, observer){
		if(!this.topics[topic]) {
			this.topics[topic] = [];
		}
		this.topics[topic].push(observer);
	},
	publish : function(topic, args){
		console.log("published topic : " + topic, 'with args:' , args || '{empty}');
		if(this.topics[topic]) {
			this.topics[topic].forEach(function(cur, ind){
			cur.handleEvent(topic, args);
			}) 
		}
	}
};


/**
* @namespace
*/

var App = {
	api : {
		main : "http://api.lanet.tv/", // old
		epg   : "http://api.lanet.tv/epg/",
		rating : "list/rating/all",
		img : '',
		ws : 'ws://data.lanet.tv',
		data : "https://data.lanet.tv/" // actual
	},
	pack : "",
	socket : {},
	controllers: {},
	widgets: {},
	currentController: null,
	initialize : function(){
		App.go("loading");
	}, 
	initializeEvents: function(){
		console.log('initializeEvents');

		var throttled = _.throttle(function(event){
			if( App.currentController[App.device.getKeyFunction(event)]) 
				App.currentController[App.device.getKeyFunction(event)]();
			}, 150);

		$(window).on("keydown", function(event){
			event.preventDefault();
			throttled(event);
		});
		
		
		window.onhashchange =  function(event){

			switch(location.hash){

				case '#loading':
					App.currentController = App.controllers.LoadingController;
					App.currentController.init();
				break;

				case '#login' :
					App.currentController = App.controllers.loginController;
					break;
				
				case '#fsplayer':
					App.currentController = App.controllers.FSPlayerController;
					App.currentController.init();
					break;
				
				case '#playlist':
					App.currentController = App.controllers.PlaylistController;
					App.currentController.init();
					break;
					/**
					*	@description make ChansList as active widget
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
			console.log(location.hash + ' changed App.currentController');
		};
	},
	start : function(){
		this.initializeEvents();
		this.initialize();
	},

	/* 
	* @description Routing between controllers
	*/
	go : function(hash) {
		window.location.hash = '#' + hash;
		PubSub.publish("location.hash/changed", hash);
	}
}



	/**
	* Persistent storage
	*/
App.db = {
	prefix : '_db_',
	get : function  (key) {
		return localStorage['' +  this.prefix + key] 
		? JSON.parse(localStorage['' +  this.prefix + key])
		: undefined;
	},
	set : function  (key, val) {
		localStorage.setItem(this.prefix + key, JSON.stringify(val));
	},

	/**
     * @param {Object} chan - новое значение для chan. Не обязателен. 
     * @description   Если указан, то lastChan(...) действует, как setter. 
     *    			  Если не указан, то lastChan() действует, как getter.
     */
	lastChan : function  (chan) {
		if (typeof chan != "undefined") {
			this.set('lastChan', chan);
		} else {
			return this.get('lastChan') || {};
		}
	}
}

App.helpers = {};
App.helpers.Clock = {
	initClock : function () {
		var updateClock = function () {
			var date = new Date(),
				html = '';
			html += date.getHours() + ' ' + '<span id="timeDivid">:</span> ' + this.getMinutes();
			$('#clockContainer').html(html);
		}
		updateClock.apply(this);
		setInterval(updateClock.bind(this), 60000);
	},
	/**
	*	@param {Number} - UTC time
	*	@describe Convert UTC time to redable {String} format hh:mm
	*/
	convertTime : function  (utcTime) {
		if( utcTime ){
			var date = new Date( utcTime * 1000 );
			return date.getHours() + ":" 
			+ this.getMinutes(utcTime) ;
		} else {
			return ''
		}
	},

	getMinutes : function (utcTime) {
		var date;
		if (!utcTime) {
			date = new Date();
		} else {
			date = new Date(utcTime * 1000);
		}
		return ( (date.getMinutes().toString().length) == 1 ? '0' + date.getMinutes() : date.getMinutes()) ;	
	}
}


	/** 
	 * @module Loading Controller
	 * 
	 */
App.controllers.LoadingController =  (function  () {
	function LoadingController(){
		this.loaded = {

			chans : false,
		}
		this.init = function(){
			$('#loading').show();

			App.api.img = 'http://static.lanet.ua/tv/';
			
			
			$.getJSON(App.api.data, function  (data) {
				App.components.Chans.init(data);
			});

			/*		WebSocket's (only for WebOs. Draft protocol in NetCast)	*/
				/*
				App.socket = new SocketAPI(App.api.ws, { key: 'test', lang: 'ru' });
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
			/*		WebSocket's 	*/
						
			
		};
		this.destroy = function () {
		}
		this.isReady = function(){
			return (this.loaded.chans && this.loaded.genres );
		}
		this.handleEvent = function(topic){
			switch (topic){
				case App.components.Chans.title + '/init':
					this.loaded.chans = true;
					App.player.changeList(App.components.Chans.getSelectedIndex());
				break;
				default:
					throw new "Observer was subscribed for this topic, but there is no processing" + topic + ' blabl';
				break;
			}
			if( this.isReady ){
				$('#loading').hide();
				App.go('fsplayer');
			}
		}
	}
	var controller  = new LoadingController();
	return controller;
})();



/**
* @constructor
* @description - Prototype for components
*/
function Model() {
	this.set = function(key, val, callback){
		this[key] = val;
		if(callback){
			callback.call(this);
		}
	};
	// this.selectedIndex = -1;
	this.getSelectedIndex = function(){
		return this.selectedIndex;
	};
	this.hasElem = function(ind){
		return this.currentList[ind] ? true : false; 
	};
	this.setSelectedIndex = function(val){

		var self = this,
		oldInd = this.selectedIndex  >= 0 
							? this.selectedIndex 
							: undefined;

		this.set('selectedIndex', val);
		var args = {
			"prev" : oldInd
		}; 

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

App.components.Menu = (function (){
	var menuModel = Object.create(new Model());
		
	if(typeof Object.create != 'function'){
		$('#debug').html('Object create != function');	
	}
	
	menuModel.title = 'Menu';
	menuModel.selectedIndex = 0;
	menuModel.all = [
		{
			id : 'playlists',
			childNodeType : 'playlist'
		},
		{
			id : 'genres',
			childNodeType: 'genre',
		},
		{
			id : 'settings',
			childNodeType: 'setting'
		}
	]
	menuModel.currentList = menuModel.all;
	menuModel.getIdElByChildType  = function (type) {
		for(var i = 0 ; i< this.currentList.length; i ++) { 
			if (this.currentList[i].childNodeType === type){
				return i;
			}
		}
	};
	return menuModel;
})()


App.components.Playlists = (function () {
	
	function PlaylistsModel () {
		this.selectedIndex = 0;
		this.title = 'Playlists';
		this.all = [
				{ id:'favorites', type:'playlist', title:'Избранные'}, 
				{ id:'rating', type:'playlist', title:'Рейтинг'},
				{ id:'all', type:'playlist', title : 'Все'} 
			];
		this.currentList = this.all;
	}

	PlaylistsModel.prototype = new Model ();
	var Playlists = new PlaylistsModel();
	return Playlists;
})();

App.components.Genres = (function() {
	function genres () {
		this.selectedIndex = 0;
		this.title = "Genres";
		this.all = [];
		this.currentList = [];
		this.changeList = function(arr) {
			//without "Без категории"
			var genres = [];
			arr.slice(1).forEach(function (cur, ind) {
				genres.push({
					id : cur,
					type : 'genre',
					title : cur,
					class : ind
				})
			})
			this.set('all', genres, function  () {
				this.currentList = this.all;
			});
		};
	}
	genres.prototype = new Model();
	return new genres();
})();

App.components.Catalog = (function(window, document, undefined) {
	function catalog() {
		this.selectedIndex = 1;
		this.title = "Catalog";
		this.all = [];
		this.currentList = [];
		this.init = function (res) {
			//take playlists
			//take genres
			App.components.Genres.changeList(res.classList);
			// create full list
			App.components.Playlists.all.forEach(function (cur, ind) {
				this.all.push(cur);
			}, this)

			App.components.Genres.all.forEach(function  (cur, ind) {
				this.all.push(cur);
			}, this);
			this.currentList = this.all;
		};
		this.getElementById = function (id) {
			return this.currentList[id] || {type:'default'};
		};
		this.getCurrent = function () {
			return this.getElementById(this.getSelectedIndex());
		};
		//switch according to player info
		this.resetChanges = function () {
			var ind = this.currentList.indexOf(App.player.chans.category);
			console.log('resetting category ')
			this.setSelectedIndex(ind);
		}
		//get first element in list with type
		this.getFirstIdByType = function (type) {
			var id = -1;
			for(var i =0; i<this.currentList.length ; i ++){
				if(this.currentList[i].type === type){
					id = i;
					return id;
				}
			}
			if(id === -1){
				return 0;
			}
		}
	}
	catalog.prototype = new Model();
	return new catalog();
})(window, document);

	/**
	 *	@class Chans
	 *	@extends Model
	 */
App.components.Chans = (function () {
	function ChansModel (){
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

		this.init = function(res){
			var self = this;
			self.all = res.list;
			//Init api refs
			App.pack = res.pack;
			App.api.edge = res.edge;
			self.order = res.sort.order.slice();
			self.rating = res.sort.rating.slice();
			self.favorites = App.db.get('favChans') || [];
			self.currentList = self.rating;
			self.setSelectedIndex(0);
			//init Catalog(take playlists , genres, tags alltogether)
			App.components.Catalog.init(res);
			App.helpers.Clock.initClock();
			PubSub.publish(self.title + '/init');
		};
		this.resetChanges = function () {
			this.currentList = App.player.chans.list.slice();
			this.setSelectedIndex(App.player.chans.selected);
		}

	}
	
	ChansModel.prototype = new Model();

 	ChansModel.prototype.getCurChanId = function  () {
 		return this.currentList[this.getSelectedIndex()];
 		}
 	ChansModel.prototype.getCurChan = function  () {
 		return this.all[this.getCurChanId()];
 	}
 	ChansModel.prototype.getCurList = function  () {
 		return this.currentList;
    	}
    ChansModel.prototype.getChanById = function  (id) {
    	return this.all[id] || undefined;
    }
    ChansModel.prototype.getChansByGenre = function  (id) {
    	var self = this;
    	return this.rating.filter(function  (el, ind) {
    		if (this.all[el].epg.length !== 0) {
    			// +1 avoiding "без жанра"
    			return this.all[el].epg[0].class === (id + 1);
    		} else {
    			return false;
    		}
    	}, this)
    }
	
	ChansModel.prototype.genListByCategory = function (ind) {
		var list = [];
		var category = App.components.Catalog.getElementById(ind);

		switch (category.type){
			case 'playlist':
				switch ( category.id ){
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
						throw 'Wrong list ind in genListByCategory'
						break;
				}
				break;
			
			case 'genre':
				list = this.getChansByGenre(category.class);
				break;
			
			default:
				throw 'Err'
				break;
		}
			console.log('genListByCategory returned list:', list);
			return list;
	}
	ChansModel.prototype.changeCurList = function (list) {
		this.currentList = list.slice(0);
	}
	//Event from ws
	ChansModel.prototype.updEpg = function  (data) {
		this.all[data.id].epg = data.epg;
		console.log('upd_epg event ws');
	}
	
	ChansModel.prototype.changeRating = function  (data) {
		this.rating = data;
		console.log("ws rating changed");
	}
	
	ChansModel.prototype.toggleFavChan = function  (id) {
		if 	(!id)	{
			throw 'Toggle without id Exception'
		}
		var fav = this.favorites;
		var db = App.db;
		var position = fav.indexOf(id);
		if( position === -1) {
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
	ChansModel.prototype.isFav = function  (id) {
		return (this.favorites.indexOf(id) !== -1) ? true: false;
	}
	var chans = new ChansModel();
	return chans;
})();


PubSub.subscribe(App.components.Chans.title + '/init', App.controllers.LoadingController);



App.components.Epg = {
	title : 'Epg',
	currentList : [],
	initUpdEpg : function  () {
		//for each chan witch has epg, set timout to upd epg next time 
		//to interval  == 
		var self = this;
		var order = App.components.Chans.order;
		var all = App.components.Chans.all;
		var timeNow = Math.floor( new Date().getTime() / 1000) ;

		if(order && all){
			order.forEach(function  (cur, ind) {
				if( all[cur].epg.length ){
					if( all[cur].epg[0].stop > timeNow){
						console.log('timeout = ', Math.floor( (all[cur].epg[0].stop - timeNow + 5) /60) , 'min, chan=', cur)
						setTimeout(
							function  () {
								self.nextUpdEpg(cur);
							}
							,  (all[cur].epg[0].stop - timeNow + 5)*1000);
					}
				};
			})
		}

	},
	nextUpdEpg : function (chanId) {
		var self = this;
		var all = App.components.Chans.all;
		var timeNow = Math.floor( new Date().getTime() / 1000) ;

		$.getJSON(App.api.epg + chanId + '/now?next=1', function  (res) {
			if(res.length){
				console.log('nextUpd for chan=', chanId, res[0].start !== all[chanId].epg[0].start);
				if( res[0].start !== all[chanId].epg[0].start ){
					all[chanId].epg = res;
					PubSub.publish(self.title + '/upd_epg', chanId);
					setTimeout(
						function  () {
							self.nextUpdEpg.apply(App.components.Epg, [chanId])
						}
						// self.nextUpdEpg
						// 5 - magic number
						, (all[chanId].epg[0].stop - timeNow + 5) * 1000);
				}
			}
		})
	},
	handleEvent : function  (topic) {
		switch(topic){
			case  App.components.Chans.title + '/init':
				this.initUpdEpg();
			break;
			default:
				throw  new 'Observer was subscribed but hasn\'t handling' 
			break;
		}
	}
}

PubSub.subscribe(App.components.Chans.title + '/init', App.components.Epg);

	/**
	 *   @module WIDGETS
	 */


//App.widgets //Menu, ChansCats, Chans, Progs, ExtendProgs
App.widgets = {}

	/**
	* 	@class widgets.Menu
	*/

App.widgets.Menu = {
	model : App.components.Menu,
	grid : {x : 1, y : 1},
	neighbors : {
		right : function () { return App.widgets.Catalog } 
	},
	active : false,
	init : function() {},
	up : function () {
		ListController.up.call(App.currentController);
	},
	down : function () {
		ListController.down.call(App.currentController);
	},
	left : function () {
		App.components.Chans.resetChanges();
		App.components.Catalog.resetChanges();
		App.go('fsplayer');
	},
	right : function () {
		ListController.right.call(App.currentController);
	},
	/**
	*	@description notify observer widgets about change active state
	*/
	notify : function  () {
		if(this.active){
			$('#chans').hide();
			$('#fullEpg').hide();
		} else {
			$('#chans').show();
			$('#fullEpg').show();
		}
	},
	render : function(){
		var html = '';
		this.model.all.forEach(function  (cur, ind) {
			html += '<div class=menuentity data-id='+ cur.id+' tabindex=' +ind
			+ ' style="background-image: url(./assets/icons/'+ cur.id +'.png);""></div>';
		})
		$('#menu').html(html);
	},

	highlight : function  (args) {
		var all = 'spotlight highlight';
		if(args && args.prev) {
			$('#menu .menuentity[tabindex=' + args.prev + ']').removeClass(all);
		} 
		else {
			$('#menu .menuentity').removeClass(all);
		}
		this.active 
			? $('.menuentity[tabindex=' + this.model.getSelectedIndex() +']').addClass(all)
			: $('.menuentity[tabindex=' + this.model.getSelectedIndex() +']').addClass('highlight');
	},
	enter : function  () {
			App.currentController.RIGHT();
	},
	identifyNearestNeighbor : function (prevWidget) {
		if(prevWidget === App.widgets.Catalog){
			var catItem = App.components.Catalog.getSelectedItem();
			var menuItem = App.components.Menu.getSelectedItem();
			if ( catItem.type !== menuItem.childNodeType ){
				// change menu selectedIndex according to type of catalog entity
				App.components.Menu.setSelectedIndex(App.components.Menu.getIdElByChildType(catItem.type));
				} 
		}
	}
	
}
	App.widgets.Menu.controller = (function  () {
		function controller (widget) {
			this.widget = widget;
		}
		return new controller (App.widgets.Menu);
	})();
	App.widgets.Menu.controller.handleEvent = function  (topic, args) {
			var self = this;
			var model = self.widget.model;
			switch (topic){
				case App.components.Menu.title + '/changeSelectedIndex' :
					self.widget.highlight(args);
					break;
				
				default:
					throw new 'Observer ' + this.title + ' was subscribed, but there are no realization';
				break;
			}
		}
	PubSub.subscribe(App.components.Menu.title + '/changeSelectedIndex', App.widgets.Menu.controller);
	

App.widgets.Catalog = {
	model : App.components.Catalog,
	grid : {x : 1, y : 1},
	neighbors : {
		right : function () {return App.widgets.ChansList },
		left : function () {return App.widgets.Menu },
	},
	//spotlight
	active : false,
	init : function() {},
	up : function () {
		ListController.up.call(App.currentController);
	},
	down : function () {
		ListController.down.call(App.currentController);
	},
	left : function () {
		ListController.left.call(App.currentController);
	},
	right : function () {
		var idCategory = this.model.getSelectedIndex();
		var newList = App.components.Chans.genListByCategory(idCategory);
		if(newList.length !== 0) {
			App.components.Chans.changeCurList(newList);
			// App.widgets.FullEpg.render()
			App.components.Chans.setSelectedIndex(0);
			ListController.right.call(App.currentController);
		} 
		
	},
	enter : function () {
		App.currentController.RIGHT();	
	},
	notify : function  () {
		if(this.active){
			// App.widgets.ChansList подвинуть
			$('#menu').addClass('open');
			this.render();
			this.highlightTitle();
			this.scrollToCur();
		} else {
			$('#menu').removeClass('open');
			//сбросить значение
			this.highlightTitle({});
			//hide all, show images
			App.widgets.Menu.render();
		}
	},
	render : function(){

		var html = '';
		html += '<div id="playlistsTitle" class="catalogTitles">Списки</div>';
		this.model.currentList.forEach(function  (cur, ind) {
			if (cur.type === 'playlist') {
				html += '<div class=catalogEntity tabindex=' +ind+ '>' + cur.title  + '</div>';		
			}
		})
		html += '<div id="genresTitle" class="catalogTitles">Жанры</div>';
		this.model.currentList.forEach(function  (cur, ind) {
			if (cur.type === 'genre') {
				html += '<div class=catalogEntity tabindex=' +ind+ '>' + cur.title  + '</div>';
			}
		})
		html += '<div id="settingsTitle" class="catalogTitles">Настройки</div>';
		$('#menu').html(html);
	},

	highlight : function  (args) {
		var all = 'spotlight highlight';
		if(args && args.prev) {
			$('#menu .catalogEntity[tabindex=' + args.prev + ']').removeClass(all);
		} 
		else {
			$('#menu .catalogEntity').removeClass(all);
		}
		this.active 
			? $('.catalogEntity[tabindex=' + this.model.getSelectedIndex() +']').addClass(all)
			: $('.catalogEntity[tabindex=' + this.model.getSelectedIndex() +']').addClass('highlight');

	},
	scrollToCur : function () {
		var ind = this.model.getSelectedIndex();
		var elem = $('.catalogEntity[tabindex='+ ind + ']');
		var height = elem.outerHeight();
		$('#menu').scrollTop(height * ind - 2 * height);
		console.log('scrollTOp:' , height * ind -2 * height)

	},

	enter : function  () {
		App.currentController.RIGHT();
	},
	notifyWithDelay : (function(window, document, undefined) {
		var dTimeout;
	
		function notifyWithDelay (delay) {
			var self = this;

			window.clearTimeout(dTimeout);
				dTimeout = window.setTimeout(function () {
					PubSub.publish(self.model.title + "/notifyWithDelay")
				}, delay);
		}
		return notifyWithDelay;

	})(window, document),

	identifyNearestNeighbor : function (prevWidget) {
		if(prevWidget === App.widgets.Menu){
			var menuItem = App.components.Menu.getSelectedItem();
			this.model.setSelectedIndex(this.model.getFirstIdByType(menuItem.childNodeType));
		}
	},
	highlightTitle : (function(window, document, undefined) {
		var curType ; // playlist, genre, setting

		function highlightTitle (type) {
			//сбросить текущий тип (ипользуем при закрытии вкладки)
			if(type  !== undefined){
				curType = type;
				return;
			}
			var item = App.components.Catalog.getSelectedItem();
			console.log(curType);
			if(item.type !== curType){
				switch (item.type){
					case 'playlist':
						curType = item.type;
						$('#genresTitle').removeClass('highlight');
						$('#playlistsTitle').addClass('highlight');
					break;
					case 'genre':
						curType = item.type;
						$('#playlistsTitle').removeClass('highlight');
						$('#genresTitle').addClass('highlight');
						break;
					default:
						throw 'There are no such title for this type'
						break;
				}		
			}
			
		}

		return highlightTitle;
	})(window, document)

}	
	App.widgets.Catalog.controller = (function  () {
		function controller (widget) {
			this.widget = widget;
		}
		var controller = new controller (App.widgets.Catalog);
		return controller;
	})();

	App.widgets.Catalog.controller.handleEvent = function(topic, args){
		var self = this;
		
			switch (topic){

				case App.components.Catalog.title + '/changeSelectedIndex' :
					if(self.widget.active){
						self.widget.highlight(args);
						self.widget.highlightTitle();
					}
					//notify dependecy widgets
					self.widget.notifyWithDelay(500);
					break;
				
				default:
					throw new 'Observer ' + this.title + ' was subscribed, but there are no realization';
				break;
			}
		}
	PubSub.subscribe(App.components.Catalog.title + '/changeSelectedIndex', App.widgets.Catalog.controller );
	
App.widgets.ChansList = {
	model : App.components.Chans,
	visibleItemCount: 5,
	grid : {x : 1, y : 1},
	list : [],
	neighbors : {
		// right : function () { return  App.widgets.ProgramsList } ,
		left  : function () { return App.widgets.Catalog } 
	},
	//spotlight
	active : false,
	up : function () {
		ListController.up.call(App.currentController);
	},
	down : function () {
		ListController.down.call(App.currentController);
	},
	left : function () {
		ListController.left.call(App.currentController);
	},
	right : function () {
		ListController.right.call(App.currentController);
	},
	notify : function  () {
		if(this.active){
			$('#menu').removeClass('open');
			$('#chans').css({'background-color': 'rgba(38, 50, 56, 1)'});
			this.scrollToCur();
			// App.widgets.Playlists.collapse(true);
			// App.widgets.Genres.collapse(true);
		} else {
			$('#chans').css({'background-color': 'rgba(38, 50, 56, .7)'});
			
		}
	},

	scrollToCur : function  () {

		var ind = this.model.getSelectedIndex();
		var elem = $('.chan[tabindex='+ ind + ']');
		var height = elem.outerHeight();
		$('#chans').scrollTop(height * ind - 2 * height);
		console.log('scrollTOp:' , height * ind -2 * height)
	},
	highlight : function  (args) {

		var all = 'spotlight highlight';

		if(args && args.prev){
			$('#chans .chan[tabindex='+ args.prev + ']').removeClass(all);
		}
		else {
			$('#chans .chan').removeClass(all);
		}

		this.active 
			? $('.chan[tabindex=' + this.model.getSelectedIndex() +']').addClass(all)
			: $('.chan[tabindex=' + this.model.getSelectedIndex() +']').addClass('highlight');

	},

	/** { id:id, 'position': id in array }*/
	renderChan : function  (id) {
		/** @type {App.components.Chans.all[0]} */
			console.log('rendered chan with id = ', id); 
			var chan = App.components.Chans.getChanById(id);
			/** @type {"start":1437040800,
				"stop":1437042000,
				"title":"Новости (с сурдопереводом).",
				"text":"Новости (с сурдопереводом).",
				"cat":"2:2","likes":0} */
			var epg = chan.epg[0] || { 
				start : '',
				title : 'Прямой эфир.',
				text : ''
			};
			var starttime='';
			if (epg.start){
				starttime = App.helpers.Clock.convertTime(epg.start);
			} 
			//tabindex - ??
			var html =
			 // '<div class="chan" tabindex='+ .position + " data-id="+ id  + '>' 
				// '<div class="logochan" style="background-image: url(\'' + App.api.img + 'logo/'+ id + '.png\');">';
				'<div class="logochan">'
						+ '<div style="width:100%; height:100%;">'
						+ '<div class="chanPic" style="background-image:url(' +  App.api.img + "logo/"+ id + ".png" +')"></div></div>'
				// for favorites
				if( this.model.isFav(id) ){
					html+= '<div class="favstar"></div>'
				}
				/** */
				html += '</div></div><div class="programcontent">'
				+ '<div class="timestart">'+ starttime +'</div>'
				+ '<div class="titleprog">'+epg.title +'</div>'
				+ '<div class="textprog">'+epg.text +'</div></div>'
				;
				// html+= ' </div>';
				console.log(html);
		$('.chan[data-id=' + id +']').html(html);
	},

	/**
	* @description - Change view of chans list 
	*/
	render : function(newList){
		var html = '';
		var self = this;
		var list = newList ? newList : this.model.currentList;
		// console.log('now model = ', model);

		list.forEach(function(curId, index){
				/** @type {App.components.Chans.all[0]} */
				var chan = App.components.Chans.getChanById(curId);
				/** @type {"start":1437040800,
					"stop":1437042000,
					"title":"Новости (с сурдопереводом).",
					"text":"Новости (с сурдопереводом).",
					"cat":"2:2","likes":0} */
				var epg = chan.epg[0] || { 
					start : '',
					title : 'Прямой эфир.',
					text : ''
				};
				var starttime='';
				if (epg.start){
					starttime = App.helpers.Clock.convertTime(epg.start);
				} 
				html += '<div class="chan" tabindex='+ index + " data-id= "+ curId  + '>' 
					+ '<div class="logochan">'
						+ '<div style="width:100%; height:100%;">'
						+ '<div class="chanPic" style="background-image:url(' +  App.api.img + "logo/"+ curId + ".png" +')"></div></div>'
					if( self.model.isFav(curId) ){
						html+= '<div class="favstar"></div>'
					};
					html += '</div><div class="programcontent">'
					+ '<div class="timestart">'+ starttime +'</div>'
					+ '<div class="titleprog">'+epg.title +'</div>'
					+ '<div class="textprog">'+epg.text +'</div>'
					;
					html+= ' </div></div>';
			})
		$('#chans').html(html);
		// App.widgets.FullEpg.render(list);
		this.highlight();
		this.scrollToCur();
	},

	enter : function  () {
		App.player.changeList(this.model.getSelectedIndex());
		$('#browseView').hide();
		App.go('fsplayer');
	},
	yellow : function  () {
		this.model.toggleFavChan(this.model.getCurChanId());
	}
}
	App.widgets.ChansList.controller = (function  () {
		function controller (widget) {
			this.widget = widget;
		}
		var controller = new controller (App.widgets.ChansList);
		return controller;
	})();
	App.widgets.ChansList.controller.handleEvent  = function  (	topic , args) {
		var self = this;
		var model = self.widget.model;
		switch (topic){

			case App.components.Chans.title + '/changeSelectedIndex':
				self.widget.highlight(args);
				break;
			
			case App.components.Chans.title + '/init':
				self.widget.render();
				break;

			case App.components.Catalog.title + '/notifyWithDelay':
				//only render, doesn't change currentList
				var list =  model.genListByCategory(App.components.Catalog.getSelectedIndex());
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
	}
	PubSub.subscribe(App.components.Chans.title + '/changeSelectedIndex', App.widgets.ChansList.controller);
	PubSub.subscribe(App.components.Chans.title + '/init', App.widgets.ChansList.controller);
	PubSub.subscribe(App.components.Catalog.title + '/notifyWithDelay', App.widgets.ChansList.controller);
	PubSub.subscribe(App.components.Chans.title + '/addFavChan', App.widgets.ChansList.controller);
	PubSub.subscribe(App.components.Chans.title + '/rmFavChan', App.widgets.ChansList.controller);
	PubSub.subscribe(App.components.Epg.title + '/upd_epg', App.widgets.ChansList.controller);

App.widgets.Appbar = {
	model : App.components.Chans,
	dTimeout: undefined
}

App.widgets.Appbar.render = function  () {
	var self = App.widgets.Appbar;
	$("#nav").show();
	var id = self.model.getCurChanId();
	var chan = self.model.getCurChan();
	var html =  '<div class="smallLogoChan" style="background-image: url(\'' 
		+ App.api.img + 'logo/'+ id + '.png\');"></div>';
	if (chan.epg[0] && chan.epg[1]){
		html += '<span class="epgnow">' 
		+ chan.title + '<br>'
		+ chan.epg[0].title +'</span>';
		html += '<span class="epgnext">' 
		+ 'Далее:' + '<br>'
		+ chan.epg[1].title +'</span>';

	} else {
		html += '<span class="epgnow">' 
		+ chan.title + '<br>'
		+ 'Прямой эфир' +'</span>';
	}
	$("#smallEpgContainer").html(html);
	clearTimeout(this.dTimeout);
	
	if (App.currentController !== App.controllers.FSPlayerController){
		return;
	}
	
	this.dTimeout = setTimeout(
		function  (){
			$('#nav').hide();
		},	3000 );
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
// 		App.go('fsplayer');
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

	player : $('#iPlayer'),

	chans : {
		list : [],
		category : {},
		selected : -1, 
		switchNext : function () {
			if( this.selected +1 < this.list.length ){
				this.selected++;
			} else {
				this.selected = 0;
			}
			return this.getCur();
		},
		switchPrev : function () {
			if( this.selected -1 > -1 ){
				this.selected--;
			} else {
				this.selected = this.list.length -1;
			}
			return this.getCur();
		},
		getCur : function () {
			return App.components.Chans.getChanById ( this.list[this.selected])
		}
	},

	init : function  () {},
	changeList : function (selected) {
		this.chans.list = App.components.Chans.currentList.slice();
		this.chans.category = App.components.Catalog.getCurrent();
		console.log('chans list in player changed to :' , this.chans.list);
		this.chans.selected = selected;
		this.load(this.chans.getCur());
	},
	//private
	load : function  (chan) {
		this.player.attr('src', chan.url);
		App.db.lastChan(chan);
	},
	next : function  () {
		this.load( this.chans.switchNext() );
		App.components.Chans.setSelectedIndex(this.chans.selected);
	},
	prev : function  () {
		this.load( this.chans.switchPrev());
		App.components.Chans.setSelectedIndex(this.chans.selected);
	}
	
}




App.widgets.FS = {

}

App.controllers.FSPlayerController = {
	init : function  () {
		App.widgets.Appbar.render();
	},
	destroy : function () {
	},
	PAGE_UP : function  () {
		App.player.next();
		App.widgets.Appbar.render();
	},
	PAGE_DOWN : function  () {
		App.player.prev();
		App.widgets.Appbar.render();

	},
	ENTER : function  () {
		//show quick menu
		App.go('quickMenu');
	},
	LEFT : function  () {
		
	},
	UP : function  () {
		
	},
	RIGHT : function  () {
		
	},
	DOWN : function  () {
		// body...
	}

}

App.controllers.QuickMenuController = {
	visible : false,
	init : function  () {
		//show quickMenu widget
		$('#quickMenuView').show();	
		App.widgets.Appbar.render();
		this.visible = true;	
	},
	destroy : function () {
	},
	ENTER : function  () {
		if (this.visible)  {
			$('#quickMenuView').hide(); 
			this.visible = false;
			App.go('fsplayer');
		} else { 
			$('#quickMenuView').show(); 
			this.visible = true;
		}
	},
	LEFT : function  () {
		$('#quickMenuView').hide();
		App.go('playlist?chan');		
	},
	UP : function (){},
	RIGHT : function (){},
	DOWN : function (){}
}

var  ListController = (function(window, document, undefined) {
	
	var up =  function(){
		if ( this.activeWidget.model.hasElem ( this.activeWidget.model.getSelectedIndex() - this.activeWidget.grid.x) )	{
			this.activeWidget.model.setSelectedIndex ( this.activeWidget.model.getSelectedIndex() - this.activeWidget.grid.x );
			// FIXME: change manual using to mediator in scrollTop
			if ( this.activeWidget.scrollToCur ){
				this.activeWidget.scrollToCur();
			}

		} else {
			// switch to upNeighbor
			changeWidgetByDirection.call(this, 'UP');
		}
	}

	var right = function(){
		if( ( this.activeWidget.model.getSelectedIndex() +  1)  %  this.activeWidget.grid.x  !== 0){			
			// selected next model.id
			if( this.activeWidget.model.hasElem( this.activeWidget.model.getSelectedIndex() + 1) ){
				this.activeWidget.model.setSelectedIndex ( this.activeWidget.model.getSelectedIndex() + 1);
			}
		} else {
				changeWidgetByDirection.call(this, 'RIGHT');
		}
	}

	var down = function(){
		if ( this.activeWidget.model.hasElem ( this.activeWidget.model.getSelectedIndex() + this.activeWidget.grid.x  ) )	{
			this.activeWidget.model.setSelectedIndex ( this.activeWidget.model.getSelectedIndex() + this.activeWidget.grid.x);
			// FIXME: change manual using to mediator in scrollTop
			if ( this.activeWidget.scrollToCur ){
				this.activeWidget.scrollToCur();
			}
		} else {
			changeWidgetByDirection.call(this, 'DOWN');
		}
	}

	var left = function(){
		if( (( this.activeWidget.model.getSelectedIndex() -  1)  % this.activeWidget.grid.x)  !== 0){
			//select prec model.id in matrix 
		} else {

			changeWidgetByDirection.call (this, 'LEFT');
		}
		
	}

	var changeWidgetByDirection = function(orient){
		var witch = {};
		if (orient) {

			switch (orient){
				case 'UP':
					if(typeof this.activeWidget.neighbors.up === 'function'){
						witch = this.activeWidget.neighbors.up();
					}
				break;
				case 'RIGHT':
					if(typeof this.activeWidget.neighbors.right === 'function'){
					witch = this.activeWidget.neighbors.right();
					}
				break;
				case 'DOWN':
					if(typeof this.activeWidget.neighbors.down === 'function'){
					witch = this.activeWidget.neighbors.down();
				}
				break;
				case 'LEFT':
					if(typeof this.activeWidget.neighbors.left === 'function'){
					witch = this.activeWidget.neighbors.left();
					}
				break;
				default:
					throw new 'change widget without appropriate orient';
				break;
			}
			if (Object.getOwnPropertyNames(witch).length !== 0 && witch.model.currentList.length ) {

				// identify nearest index, witch will be active
				if(typeof witch.identifyNearestNeighbor === 'function'){
					witch.identifyNearestNeighbor(this.activeWidget);
				}

				this.setActiveWidget (witch);
				console.log('changeWidgetByDirection to : ', witch);
				return true;
			} else {
				// 
				return false;
			}
		}
		else {
			throw new 'Illegal changeWidgetByDirection usage (without orient)';
		}
	};

	//facade
	return {
		up : up,
		down : down,
		left : left,
		right : right,
	}

})(window, document); 
	
function DefaultController() {
	this.UP = function () {
		if(typeof this.activeWidget.up === 'function'){
			this.activeWidget.up();
		}
	};
	this.DOWN = function () {
		if(typeof this.activeWidget.down === 'function'){
			this.activeWidget.down();
		}
	};
	this.LEFT = function () {
		if(typeof this.activeWidget.left === 'function'){
			this.activeWidget.left();
		}
	};
	this.RIGHT = function () {
		if(typeof this.activeWidget.right === 'function'){
			this.activeWidget.right();
		}
	};
	this.ENTER = function () {
		if(typeof this.activeWidget.enter === 'function'){
			this.activeWidget.enter();
		}
	};
	this.YELLOW = function () {
		if(typeof this.activeWidget.yellow === 'function'){
			this.activeWidget.yellow();
		}
	};
	this.setActiveWidget = function  (widget) {
		if (this.activeWidget){
			this.activeWidget.active = false;
			//FIXME: notify must present in all widgets

			if(this.activeWidget.notify){
				this.activeWidget.notify();
			}  
			if( this.activeWidget.highlight ) {
				this.activeWidget.highlight();
			}
		}
		this.activeWidget = widget;
		this.activeWidget.active = true;
		//FIXME: notify must present in all widgets
		if(this.activeWidget.notify){
				this.activeWidget.notify();
		} 
		this.activeWidget.highlight();
	};

		
}


App.controllers.PlaylistController = (function(window, document, undefined) {
	
	function PlaylistController () {
		this.activeWidget = {};
	}
	PlaylistController.prototype = new DefaultController();
	PlaylistController.prototype.init = function  () {
		App.widgets.Menu.render();
		App.widgets.ChansList.render();
		App.widgets.Appbar.render();
		
		$('#browseView').show();
		this.setActiveWidget.call (this, App.widgets.Menu);
		//FIXME: change from manual to mediator: scrollToCur in init PlaylistController
	};
	PlaylistController.prototype.initWithChan = function () {
		App.widgets.Menu.render();
		App.components.Chans.currentList = App.player.chans.list.slice()
		App.widgets.ChansList.render();
		App.widgets.Appbar.render();
		$('#browseView').show();
		this.setActiveWidget.call (this, App.widgets.ChansList);
	};
	PlaylistController.prototype.destroy = function () {
		$('#browseView').hide();
	};
	
	return new PlaylistController();

})(window, document);





App.device = {
	keys : {
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
            '404': 'GREEN', //g
            '405': 'YELLOW', //y
            '67': 'YELLOW', //"C" testing
            '406': 'BLUE',
	}, 
	getKeyFunction: function(event){
		return App.device.keys[event.keyCode]
	}
}


App.start();