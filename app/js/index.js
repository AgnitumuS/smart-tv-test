/* Events controller*/
var PubSub = {
	topics : {},
	subscribe : function(topic, observer){
		if(!this.topics[topic]) {
			this.topics[topic] = [];
		}
		this.topics[topic].push(observer);
	},
	publish : function(topic, args){
		console.log("published topic : " + topic, 'with args:' , args || '[empty]');
		if(this.topics[topic]) {
			this.topics[topic].forEach(function(cur, ind){
			cur.handleEvent(topic, args);
			}) 
		}
	}
};

/* 
* dsssss
* @description Routing between controllers
*/
var Router = {
	changeHash : function(hash){
		window.location.hash = '#' + hash;
		PubSub.publish("location.hash/changed");
	}
}


/**
* @param {String} text - Text to output
* @description	Debug into <div id="debug"></div>
*/
	var debug = (function  () {
		var dTimeout;
		function debug (text) {
			$('#debug').show();
			$('#debug').append(text , '<br>');
			clearTimeout(dTimeout);
			dTimeout = setTimeout(
				function  (){
					$('#debug').hide();
				},	10000 );
		}
		return debug;
	})();
/**/

/**
* @namespace
*/

var App = {
	api : {
		main : "http://api.lanet.tv/",
		epg   : "http://api.lanet.tv/epg/",
		rating : "list/rating/all",
		img : '',
		ws : 'ws://data.lanet.tv',
		data : "https://data.lanet.tv/"
	},
	socket : {},
	controllers: {},
	widgets: {},
	currentController: null,
	initialize : function(){
		Router.changeHash("loading");
	}, 
	initializeEvents: function(){
		$(window).on("keydown", function(event){
			event.preventDefault();
			debug('keyCode : ' + event.keyCode);
			if( App.currentController[App.device.getKeyFunction(event)]) 
				App.currentController[App.device.getKeyFunction(event)]();
			
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
				
				case '#browse':
					App.currentController = bwController;
					App.currentController.init();
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
	}
}



	/**
	* Persistent storage
	*/
App.db = {
	//must save 
	//last chan
	//favorite chans
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
			App.api.edge = 'http://kirito.la.net.ua/tv/';
			
			$.getJSON(App.api.data, function  (data) {
				App.components.Chans.init(data);
			});

			/*		WebSocket's 	*/
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
						
			App.widgets.Menu.render();
			App.widgets.Catalog.render();
		}
		this.isReady = function(){
			return (this.loaded.chans && this.loaded.genres );
		}
		this.handleEvent = function(topic){
			switch (topic){
				case App.components.Chans.title + '/init':
					this.loaded.chans = true;
					//drawback - init current list of chans here
					App.player.list = App.components.Chans.currentList;
					App.player.loadCur();
				break;
				default:
					throw new "Observer was subscribed for this topic, but there is no processing" + topic + ' blabl';
				break;
			}
			if( this.isReady ){
				$('#loading').hide();
				Router.changeHash('fsplayer');
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
		var self = this;
		this.set('selectedIndex', val , function(){
			PubSub.publish(self.title + "/changeSelectedIndex");
		});
	}
}


/**
* @namespace Components
* 
*/
App.components = {};

/**
* 
*/
App.components.Menu = (function (){
	function MenuModel () {
			this.title = 'Menu',
			this.selectedIndex = 0;
			this.all = ['catalog', 'genres'];
			this.currentList = this.all
		}
	MenuModel.prototype = new Model();
	return new MenuModel();
	})();
	

App.components.Catalog = (function () {
	
	function CatalogModel () {
		this.selectedIndex = 0;
		this.title = 'Catalog';
		this.all = ['all', 'favorites', 'rating'];
		this.currentList = this.all;
	}

	CatalogModel.prototype = new Model ();
	var catalog = new CatalogModel();
	return catalog;
})();

App.components.Genres = (function() {
	function genres () {
		this.selectedIndex = 0;
		this.title = "Genres";
		this.all = [];
		this.currentList = [];
		this.changeList = function(arr) {
			this.set('all', arr, function  () {
				this.currentList = this.all;
				console.log('Changed list in genres. This in callback = ', this);

			});
		};
	}
	genres.prototype = new Model();
	return new genres();
})();

	/**
	 *	@class Chans
	 *	@extends Model
	 */
App.components.Chans = (function () {
	function ChansModel (){
		this.title = 'Chans';
		this.selectedIndex = -1;
		this.all = [];
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
			self.order = res.sort.order.slice();
			self.rating = res.sort.rating.slice();
			self.favorites = App.db.get('favChans') || [];
			self.currentList = self.order;
			self.setSelectedIndex(0);
			//init genres
			App.components.Genres.changeList(res.classList);
			PubSub.publish(self.title + '/init');
		};

		this.switchNext = function  () {
			if (this.currentList.length){
				if (this.getSelectedIndex() + 1 < this.currentList.length) {
					this.setSelectedIndex ( this.getSelectedIndex() + 1);
				} else {
					this.setSelectedIndex (0);
				}	
				return this.getCurChan();
			} else {
				//show last runned chan if currentList is empty
				return App.db.lastChan();
			}
		}
		this.switchPrev = function  () {
			if(this.currentList.length){
				if (this.getSelectedIndex() -1 > -1){
					this.setSelectedIndex ( this.getSelectedIndex() - 1);
				} else {
					this.setSelectedIndex (this.currentList.length - 1);
				}
			return this.getCurChan();		
			} else {
				//show last runned chan if currentList is empty
				return App.db.lastChan();
			}
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
	
	ChansModel.prototype.changeCurList = function (ind) {
		var list = [];
		switch ( ind ){
			case 0: 
				list = this.order || [];
			break;
			case 1:
				list = App.db.get('favChans') || [];
			break;
			case 2:
				list = this.rating || [];
			break;
			default :
				throw 'Wrong list ind in changeCurList'
			break;
		}
			console.log('current list changed to ', this.currentList);
			this.currentList = list;
			this.setSelectedIndex(0);
	}
	//Event from ws
	ChansModel.prototype.updEpg = function  (data) {
		this.all[data.id].epg = data.epg;
		console.log('upd_epg event ws');
	}
	// 
	ChansModel.prototype.changeRating = function  (data) {
		this.rating = data;
		console.log("ws rating changed");
	}
	//
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
	/**
	*	@param {Number} - UTC time
	*	@describe Convert UTC time to redable {String} format hh:mm
	*/
	convertTime : function  (utcTime) {
		if( utcTime ){
			var date = new Date( utcTime * 1000 );
			return date.getHours() + ":" 
			+ (	(date.getMinutes().toString().length) == 1 ? '0' + date.getMinutes() : date.getMinutes()	) ;
		} else {
			return ''
		}
	},
	initUpdEpg : function  () {
		//for each chan witch has epg, set timout to upd epg next time 
		//to interval  == 
		var self = this;
		console.log(self);
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
								self.nextUpdEpg.apply(App.components.Epg, [cur]);
							}
							// self.nextUpdEpg, (all[cur].epg[0].stop - timeNow + 5)*1000
							,  (all[cur].epg[0].stop - timeNow + 5)*1000 );
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
		//spotlight
		active : false,
		init : function() {},
		render : function(){
			var html = '';
			this.model.all.forEach(function  (cur, ind) {
				html += '<div class=menuentity data-id='+ cur+' tabindex=' +ind
				+ ' style="background-image: url(./assets/icons/'+ cur +'.png);""></div>';
			})
			$('#menu').html(html);
		},

		/**
		*	@description This method runs when changed active widget. 
		*/
		toggleActive : function  () {
			//	When we on menu, catalog must be visible
			if(this.active){
				$('#catalog').addClass('open');
			} else {
				$('#catalog').removeClass('open');
			}
		},
		highlight : function  () {
			var all = 'spotlight highlight';
			$('#menu .menuentity').removeClass(all);
			this.active 
				? $('.menuentity[tabindex=' + this.model.getSelectedIndex() +']').addClass(all)
				: $('.menuentity[tabindex=' + this.model.getSelectedIndex() +']').addClass('highlight');
		}
		
	}
	App.widgets.Menu.controller = (function  () {
		function controller (widget) {
			this.widget = widget;
		}
		return new controller (App.widgets.Menu);
	})();
	App.widgets.Menu.controller.handleEvent = function  (topic) {
			var self = this;
			switch (topic){
				case App.components.Menu.title + '/changeSelectedIndex' :
					self.widget.highlight();
				break;
				default:
					throw new 'Observer ' + this.title + ' was subscribed, but there are no realization';
				break;
			}
		}
	PubSub.subscribe(App.components.Menu.title + '/changeSelectedIndex', App.widgets.Menu.controller);


	/**
	*	@class	widgets.Catalog
	*/


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
	render : function(){
		var html = '';
		this.model.currentList.forEach(function  (cur, ind) {
			html += '<span class=catalogentity tabindex=' +ind+ '>' + cur  + '</span>';
		})
		$('#catalog').html(html);
		},
	highlight : function  () {
		var all = 'spotlight highlight';
		$('#catalog .catalogentity').removeClass(all);
		this.active 
			? $('.catalogentity[tabindex=' + this.model.getSelectedIndex() +']').addClass(all)
			: $('.catalogentity[tabindex=' + this.model.getSelectedIndex() +']').addClass('highlight');

	},
	toggleActive : function  () {
		if(this.active){
			$('#catalog').addClass('open');
		} else {
			$('#catalog').removeClass('open');
		}
	},
	enter : function  () {
		if( bwController.hasNeighbor('RIGHT')){
				bwController.changeWidgetByDirection ('RIGHT');
		}
	}
}	
	App.widgets.Catalog.controller = (function  () {
		function controller (widget) {
			this.widget = widget;
		}
		var controller = new controller (App.widgets.Catalog);
		return controller;
	})();
	App.widgets.Catalog.controller.handleEvent = function(topic){
		var self = this;
			switch (topic){
				case App.components.Catalog.title + '/changeSelectedIndex' :
					self.widget.render( App.components.Catalog.all);
					self.widget.highlight();
				break;
				case App.components.Menu.title + '/changeSelectedIndex':
					//proccesing according to menu entity
					self.widget.model.setSelectedIndex(0);
				break;
				default:
					throw new 'Observer ' + this.title + ' was subscribed, but there are no realization';
				break;
			}
		}
		PubSub.subscribe(App.components.Catalog.title + '/changeSelectedIndex', App.widgets.Catalog.controller );
		PubSub.subscribe(App.components.Menu.title + '/changeSelectedIndex', App.widgets.Catalog.controller );


	/**
	* 	Widgets.ChansList
	*/


App.widgets.ChansList = {
	model : App.components.Chans,
	spotlighted : false,
	grid : {x : 1, y : 1},
	neighbors : {
		// right : function () { return  App.widgets.ProgramsList } ,
		left  : function () { return App.widgets.Catalog } 
	},
	//spotlight
	active : false,
	init : function() {},
	show : function(){
		this.render(this.model.currentList);
	},

	// TODO: make scroll Valera - style
	scrollDown : function(){
		var step = $('#chans').children(":first").outerHeight();
		var cur = $('#chans').scrollTop();
		// 1 margin only
		$('#chans').scrollTop( cur + step );	 
	},
	scrollTop : function(){
		var step = $('#chans').children(":first").outerHeight();
		var cur = $('#chans').scrollTop();
		$('#chans').scrollTop( cur - step );	 
	},
	scrollToCur : function  () {
		var step = $('#chans').children(":first").outerHeight();
		var items = this.model.getSelectedIndex();
		$('#chans').scrollTop(step * items);		
	},
	highlight : function  () {
		var all = 'spotlight highlight';
		$('#chans .chan').removeClass(all);
		this.active 
			? $('.chan[tabindex=' + this.model.getSelectedIndex() +']').addClass(all)
			: $('.chan[tabindex=' + this.model.getSelectedIndex() +']').addClass('highlight');

	},
	toggleActive : function  () {
		if(this.active){
			$('#chans').removeClass('withCatalog');
		} else {
			$('#chans').addClass('withCatalog');
		}
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
				title : 'Нет программы телепередач',
				text : ''
			};
			var starttime='';
			if (epg.start){
				starttime = App.components.Epg.convertTime(epg.start);
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
	render : function(){
		var html = '';
		var self = this;
		this.model.currentList.forEach(function(curId, index){
			// if ( ($epgNowAll[ current.id ] && $epgNowAll[ current.id ].cat.slice(0,1)  == _cat) || _cat === "-1" ){
				// this.renderChan('id':curId, 'position':index);
				/** @type {App.components.Chans.all[0]} */
				var chan = App.components.Chans.getChanById(curId);
				/** @type {"start":1437040800,
					"stop":1437042000,
					"title":"Новости (с сурдопереводом).",
					"text":"Новости (с сурдопереводом).",
					"cat":"2:2","likes":0} */
				var epg = chan.epg[0] || { 
					start : '',
					title : 'Нет программы телепередач',
					text : ''
				};
				var starttime='';
				if (epg.start){
					starttime = App.components.Epg.convertTime(epg.start);
				} 
				html += '<div class="chan" tabindex='+ index + " data-id= "+ curId  + '>' 
					//+ '<div class="logochan" style="background-image: url(\'' + App.api.img + 'logo/'+ curId + '.png\');">';
					// + '<div style="width:100%; height:100%; background:rgba(0,0,0,0.24)">'
					+ '<div class="logochan">'
						+ '<div style="width:100%; height:100%;">'
						+ '<div class="chanPic" style="background-image:url(' +  App.api.img + "logo/"+ curId + ".png" +')"></div></div>'
						// + '<img src="' + App.api.img + 'logo/'+ curId + '.png" style="background-position:center; display:block;"/></div>';
					// for favorites
					/** */
					// + '<div class="favstar"></div>'
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
		this.highlight();
		this.scrollToCur();
	},

	enter : function  () {
		App.player.loadCur();
		$('#browseView').hide();
		Router.changeHash('fsplayer');
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
				self.widget.highlight();
			break;
			case App.components.Chans.title + '/init':
				self.widget.render();
			break;
			case App.components.Catalog.title + '/changeSelectedIndex':
				model.changeCurList( App.components.Catalog.getSelectedIndex() );
				self.widget.render();
			break;
			
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
	PubSub.subscribe(App.components.Catalog.title + '/changeSelectedIndex', App.widgets.ChansList.controller);
	PubSub.subscribe(App.components.Chans.title + '/addFavChan', App.widgets.ChansList.controller);
	PubSub.subscribe(App.components.Chans.title + '/rmFavChan', App.widgets.ChansList.controller);
	PubSub.subscribe(App.components.Epg.title + '/upd_epg', App.widgets.ChansList.controller);


	/**
	* @class
	*/

App.player = {
	chans : App.components.Chans,
	player : $('#iPlayer'),
	// list : [],
	init : function  () {

	},
	load : function  (chan) {
		this.player.attr('src', chan.url);
		App.db.lastChan(chan);
	},
	next : function  () {
		this.load( this.chans.switchNext() );
	},
	prev : function  () {
		this.load( this.chans.switchPrev());
	},
	loadCur : function  () {
		this.load( this.chans.getCurChan() );
	}
}


App.widgets.FSSmallEpg = {
	model : App.components.Chans
}
App.widgets.FSSmallEpg.render = (function  () {
	var self = App.widgets.FSSmallEpg;
	var dTimeout;
	function show () {
		$("#smallepg").show();
		//add text
		var id = self.model.getCurChanId();
		var html =  '<div class="logochan" style="background-image: url(\'' 
			+ App.api.img + 'logo/'+ id + '.png\');"></div>';
		if (self.model.all[id].epg[0]){
			html += '<span class="epgnow">' + self.model.all[id].epg[0].title +'</span>'
		}; 
		$("#smallepg").html(html);
		clearTimeout(dTimeout);
		dTimeout = setTimeout(
			function  (){
				$('#smallepg').hide();
			},	3000 );
	}
	return show; 
})();

App.controllers.FSPlayerController = {
	init : function  () {
		App.widgets.FSSmallEpg.render();
	},
	PAGE_UP : function  () {
		App.player.next();
		App.widgets.FSSmallEpg.render();
	},
	PAGE_DOWN : function  () {
		App.player.prev();
		App.widgets.FSSmallEpg.render();

	},
	ENTER : function  () {
		//show quick menu
		Router.changeHash('quickMenu');
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
		this.visible = true;	
	},
	ENTER : function  () {
		if (this.visible)  {
			$('#quickMenuView').hide(); 
			this.visible = false;
			Router.changeHash('fsplayer');
		} else { 
			$('#quickMenuView').show(); 
			this.visible = true;
		}
	},
	LEFT : function  () {
		$('#quickMenuView').hide();
		Router.changeHash('browse');		
	},
	UP : function  () {
		
	},
	RIGHT : function  () {
		
	},
	DOWN : function  () {
		// body...
	}
}





var navigateController =  {
	/**
	* Return true if returned elements from current widget, or false if switch widget 
	*
	*/
	up :  function(widget){
		if ( widget.model.hasElem ( widget.model.getSelectedIndex() - widget.grid.x) )	{
			widget.model.setSelectedIndex ( widget.model.getSelectedIndex() - widget.grid.x );
			return true;
		} else {
			// switch to upNeighbor
			// bwController.changeWidgetByDirection('UP');
			return false;
		}
	},

	right : function(widget){
		if( ( widget.model.getSelectedIndex() +  1)  %  widget.grid.x  === 0){
			// switch to rightNeighbor
				// bwController.changeWidgetByDirection('RIGHT');
				return false;
		} else {
			//goto the right elem
			if( widget.model.hasElem( widget.model.getSelectedIndex() + 1) ){
				widget.model.setSelectedIndex ( widget.model.getSelectedIndex() + 1);
			}
			return true;
		}
	},

	down : function(widget){
		if ( widget.model.hasElem ( widget.model.getSelectedIndex() + widget.grid.x  ) )	{
				widget.model.setSelectedIndex ( widget.model.getSelectedIndex() + widget.grid.x);
				return true;
		} else {
				// bwController.changeWidgetByDirection('DOWN');
				return false;
		}

	},

	left : function(widget){
		if( (( widget.model.getSelectedIndex() -  1)  % widget.grid.x)  === 0){
			// bwController.changeWidgetByDirection('LEFT');
			return false;
		} else {
			//switch to left element in matrix
			return true;
		}
		
	}
}
//Принимает управление и передает активному виджету комманду
function BrowseViewController (argument) {
	this.activeWidget = {},

	this.init = function(){
		//if there are no saved state, use first menu first catalog	s
		$('#browseView').show();
		this.setActiveWidget (App.widgets.ChansList);
		// App.widgets.Menu.show();
		this.activeWidget.scrollToCur();
	}
	this.setActiveWidget = function  (widget) {
		if (this.activeWidget){
			this.activeWidget.active = false;
			if( this.activeWidget.highlight ) {
				this.activeWidget.highlight();
			}
			if(this.activeWidget.toggleActive){
				this.activeWidget.toggleActive();
			}

		}
		this.activeWidget = widget;
		this.activeWidget.active = true;
		this.activeWidget.highlight();
		if(this.activeWidget.toggleActive){
			this.activeWidget.toggleActive();
		}
	}

	/**
	*	@description Return true if activeWidget has neighbors in direction and neighbor has active elements
	*	@param {String} ['UP','DOWN','LEFT','RIGHT']
	*
	*/
	this.hasNeighbor = function  (orient) {
		var witch = {};
		if (orient) {

			switch (orient){
				case 'UP':
					witch = this.activeWidget.neighbors.up;
				break;
				case 'RIGHT':
					witch = this.activeWidget.neighbors.right;
				break;
				case 'DOWN':
					witch = this.activeWidget.neighbors.down;
				break;
				case 'LEFT':
					witch = this.activeWidget.neighbors.left;
				break;
				default:
					throw new 'change widget without appropriate orient';
				break;
			}
			return witch && witch().model.currentList.length ? true :false;
		}
		else {
			throw new 'Illegal changeWidgetByDirection usage (without orient)';
		}
	}
	
	this.changeWidgetByDirection = function(orient){
		var witch = {};
		if (orient) {

			switch (orient){
				case 'UP':
					witch = this.activeWidget.neighbors.up;
				break;
				case 'RIGHT':
					witch = this.activeWidget.neighbors.right;
				break;
				case 'DOWN':
					witch = this.activeWidget.neighbors.down;
				break;
				case 'LEFT':
					witch = this.activeWidget.neighbors.left;
				break;
				default:
					throw new 'change widget without appropriate orient';
				break;
			}
			if (witch) {
				this.setActiveWidget (witch() );
				console.log('changeWidgetByDirection to : ', witch());
			} 
		}
		else {
			throw new 'Illegal changeWidgetByDirection usage (without orient)';
		}
	}

	this.UP =  function(){
		if ( navigateController.up(this.activeWidget) ) {
			//make scroll
			if ( this.activeWidget.scrollTop ){
				this.activeWidget.scrollTop();
			}
		} else {
			//move by direction
			this.changeWidgetByDirection('UP');
		}
	},

	this.RIGHT = function(){
		if ( navigateController.right(this.activeWidget) ){
			// selected next model.id
		} else {
			if( bwController.hasNeighbor('RIGHT')){
				bwController.changeWidgetByDirection ('RIGHT');
			}
		}
	},

	this.DOWN = function(){
		if( navigateController.down(this.activeWidget) ) {
			//make scroll
			if ( this.activeWidget.scrollDown ){
				this.activeWidget.scrollDown();
			}
		} else {
			//make move by direction
			this.changeWidgetByDirection('DOWN');
		}

		// navigateController.down(this.activeWidget);
	},

	this.LEFT = function(){
		if(  navigateController.left(this.activeWidget) ){
			//scroll or another 
		} else {
			if ( bwController.hasNeighbor ('LEFT') ){
				bwController.changeWidgetByDirection ('LEFT');
			}

			//switch to left element in matrix
		}
		
	},
	this.ENTER = function  () {
		if (this.activeWidget.enter){
			this.activeWidget.enter();
		}
	},
	//testted only . must be moved to FSController
	this.PAGE_UP = function  () {
		App.player.next();
	}
	this.PAGE_DOWN = function  () {
		App.player.prev();
	}
	this.YELLOW = function  () {
		if(this.activeWidget.yellow){
			this.activeWidget.yellow();
		}
	}
	
}
var bwController = new BrowseViewController();











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