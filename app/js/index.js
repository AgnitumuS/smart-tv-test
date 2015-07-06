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
		console.log("published topic : " + topic);
		if(this.topics[topic]) {
			this.topics[topic].forEach(function(cur, ind){
			cur.handleEvent(topic, args);
			}) 
			}
	}
};

/* Routing between controllers*/
var Router = {
	changeHash : function(hash){
		window.location.hash = '#' + hash;
		PubSub.publish("location.hash/changed");
	}
}

/**
* 	Debug
*/
	var debug = function  () {
		var dTimeout;
		function debug (text) {
			$('#debug').show();
			$('#debug').html(text);
			clearTimeout(dTimeout);
			dTimeout = setTimeout(
				function  (){
					$('#debug').hide();
				},	10000 );
		}
		return debug;
	}();

/**/

var App = {
	api : {
		main : "http://api.lanet.tv/",
		epg   : "http://api.lanet.tv/epg/",
		rating : "list/rating/all",
		img : ''
	},
	controllers: {},
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
					App.currentController = loadingController;
					App.currentController.init();
				break;

				case '#login' :
					App.currentController = App.controllers.loginController;
					break;
				
				case '#fsplayer':
					App.currentController = App.controllers.FSPlayerController;
					break;
				
				case '#browse':
					App.currentController = bwController;
					// $("#browseView").show();
					App.currentController.init();
					//update epgAllNow
					//render current list
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
App.start();


		/**
		* Player
 		*
		*/


	/**
	* Persistent storage
	*/
App.db = {
	prefix : '_db_',
	get : function  (key) {
		return localStorage['' +  this.prefix + key];
	},
	set : function  (key, val) {
		localStorage.setItem(this.prefix + key, val);
	}
}
	/** 
	 * @module Loading Controller
	 * 
	 */
function LoadingController(){
	this.loaded = {
		chans : false,
		//костыль для теста
		genres : true,
	}
	this.init = function(){
		$('#loading').show();
		// RootMenu.M.init();
		// Chans.M.init();
		// Genres.init();
		App.components.Chans.init();
	}
	this.isReady = function(){
		return (this.loaded.chans && this.loaded.genres);
	}
	this.handleEvent = function(topic){
		switch (topic){
			case App.components.Chans.title + '/init':
				this.loaded.chans = true;
			break;
			case App.components.Genres.title + '/init':
				this.loaded.genres = true;
			break;
			default:
				throw new "Observer was subscribed for this topic, but there is no processing" + topic + ' blabl';
			break;
		}
		if( this.isReady ){
			$('#loading').hide();
			Router.changeHash('browse');
		}
	}
}




/* Models contructor*/
function Model(title) {
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



//App.components // Chans, Progs, Menu, ChansCats, ProgCats,  
App.components = {};
App.components.Menu = (function (){
	function MenuModel () {
			this.title = 'Menu',
			this.selectedIndex = -1;
			this.all = ['catalog', 'genres'];
			this.currentList = this.all
		}
	MenuModel.prototype = new Model();
	return new MenuModel();
	})();
	

App.components.Catalog = (function () {
	
	function CatalogModel () {
		this.selectedIndex = -1;
		this.title = 'Catalog';
		this.all = ['all', 'favorites', 'rating'];
		this.currentList = this.all;
	}

	CatalogModel.prototype = new Model ();
	var catalog = new CatalogModel();
	return catalog;
})();

	/**
	 *	@module Chans
	 */
App.components.Chans = (function () {
	function ChansModel (){
		this.title = 'Chans';
		this.selectedIndex = -1;
		this.all = [];
		this.favorites = [{
      "id": 9001,
      "title": "Первый национальный",
      "ratio": "4:3",
      "rec": 0
    },
    {
      "id": 9002,
      "title": "1+1",
      "ratio": "4:3",
      "rec": 1
    }];
		this.recommended = [{
      "id": 9003,
      "title": "Киев",
      "ratio": "4:3",
      "rec": 0
    },
    {
      "id": 9004,
      "title": "ICTV",
      "ratio": "16:9",
      "rec": 1
    },];
		this.currentList = [];
		this.rating = [];
		this.cable = [];
		this.init = function(){
			var self = this;
			$.getJSON(App.api.main + "list.json", function(res){
				self.all = res.list.slice();
				//Init api refs
				App.api.img = res.img;
				App.api.edge = res.edge;

				res.list.forEach(function(cur, indx){
					self.cable.push(cur.id);
				})
				self.currentList = self.all; 
				PubSub.publish(self.title + '/init');
			})
			$.getJSON(App.api.main + App.api.rating, function(res){
				self.rating = res;
			})
		};
					//Increment \ decrement selected index
		this.incSelectedIndex = function  () {
			if( this.getSelectedIndex()+1 < this.currentList.length ) {
				this.setSelectedIndex ( this.getSelectedIndex() + 1);
			} 
		};
		this.decSelectedIndex = function  () {
			if(this.getSelectedIndex() -1 > -1) {
				this.setSelectedIndex ( this.getSelectedIndex() - 1);
			}
		}
	}
	
	ChansModel.prototype = new Model();
	/*
	* Sort channels by rating or by cable. need refactor
	*/
	ChansModel.prototype.sort = function(type){
 		var arr;
 		if (type === "rating"){
 			arr = $channels.rating;
 		} else if (type == "cable"){
 			arr = $channels.cable;
 		}
 		this.chans.sort(function( a , b ){
 			if ( arr.indexOf(a) && arr.indexOf(b) ) {
 				return arr.indexOf(a.id) - arr.indexOf(b.id);
 			} else {
 				return 0;
 			}
 		})
 	}
 	ChansModel.prototype.getCurChan = function  () {
 		return this.currentList[this.getSelectedIndex()];
 		}
 	ChansModel.prototype.getCurList = function  () {
 		return this.currentList;
    	}
	
	ChansModel.prototype.changeCurList = function (ind) {
		// body...
		//get current list
		switch ( ind ){
			case 0: 
				this.currentList = this.all;
			break;
			case 1:
				this.currentList = this.favorites;
			break;
			case 2:
				this.currentList = this.recommended;
			break;
			default :
				console.log('current list changed to all');
				this.currentList = this.all; 
			break;
		}
		// !!!!! Change current list for Player
		App.player.list = this.currentList;
		this.setSelectedIndex(0);
	}
	var chans = new ChansModel();
	return chans;
})();

var loadingController = new LoadingController();
PubSub.subscribe(App.components.Chans.title + '/init', loadingController);
// PubSub.subscribe(Genres.title + '/init', loadingController);
	/**
	 *	@module Programs
	 */
App.components.Programs = (function  () {
	function ProgramsModel (argument) {
		// this.
		this.title = 'Programs';
		this.selectedIndex = -1;
		this.curDay = [];
		this.now = {},
		this.getCurDay = function(){
			var _this = this;
			return $.getJSON(App.api.main + 'epg/' + App.components.Chans.getCurChan().id + '/day', function(res){
				_this.curDay = res;
				_this.currentList= _this.curDay;
			})
		},
		this.getSelectedEl = function (){
			return this.curDay[this.getSelectedIndex ()];
		}
		this.findNow = function(){
			var now = Math.floor(new Date().getTime() / 1000);
			for (var entity = 0; this.curDay.length ; entity ++ ){
				if( this.curDay[entity].stop > now ){
					this.now.obj = this.curDay[entity];
					this.now.ind = entity;
					this.set('selectedIndex', entity, function(){
						PubSub.publish(this.title + '/changeSelectedIndex');
					})
					break;
				}
			}
			return this.now.ind;
		}
	}
	ProgramsModel.prototype = new Model();
	var programs = new ProgramsModel();
	return programs;
})();

App.components.ProgramDetailInfo = (function  () {
	function ProgramDetailInfoModel () {
			// body...
			this.title = 'ProgramDetailInfo',
			// this.content = {}
			this.get = function () {
				return App.components.Programs.getSelectedEl();
			}
		}

	var programDetailInfo = new ProgramDetailInfoModel();
	return programDetailInfo;		
})();

	/**
	 *   WIDGETS
	 */


//App.widgets //Menu, ChansCats, Chans, Progs, ExtendProgs
App.widgets = {}

	/**
	* 	Widgets.Menu
	*/

App.widgets.Menu = {
		model : App.components.Menu,
		grid : {x : 1, y : 1},
		neighbors : {
			right : function () { return App.widgets.Catalog } 
		},
		//spotlight
		active : false,
		show : function  () {
			this.render(this.model.currentList);
			this.highlight();
		},
		init : function() {},
		render : function(arr){
			var html = '';
			arr.forEach(function  (cur, ind) {
				html += '<span class=menuentity tabindex=' +ind+ '>' + cur  + '</span>';
			})
			$('#menu').html(html);
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
	* 	Widgets.Catalog
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
	render : function(arr){
		var html = '';
		arr.forEach(function  (cur, ind) {
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
		right : function () { return  App.widgets.ProgramsList } ,
		left  : function () { return App.widgets.Catalog } 
	},
	//spotlight
	active : false,
	init : function() {},
	show : function(){
		this.render(this.model.currentList);
	},
	scrollDown : function(){
			var step = $('#chans').children(":first").width();
			var cur = $('#chans').scrollTop();
			$('#chans').scrollTop( cur + step);	 
	},
	scrollTop : function(){
			var step = $('#chans').children(":first").width();
			var cur = $('#chans').scrollTop();
			$('#chans').scrollTop( cur - step);	 
	},
	highlight : function  () {
		var all = 'spotlight highlight';
		$('#chans .chan').removeClass(all);
		this.active 
			? $('.chan[tabindex=' + this.model.getSelectedIndex() +']').addClass(all)
			: $('.chan[tabindex=' + this.model.getSelectedIndex() +']').addClass('highlight');

	},
	render : function(arr){
			var html = '';
			arr.forEach(function(current, index){
				// if ( ($epgNowAll[ current.id ] && $epgNowAll[ current.id ].cat.slice(0,1)  == _cat) || _cat === "-1" ){
					html += '<div class="chan" tabindex='+ index + " data-id=\"" + current.id  + '\"'  
					+ " data-position=\"" + index + "\"" 
					+ 'style="background-image: url(\'' + App.api.img + 'logo/'+ current.id + '.png\');">' 
					+ '</div>' ; 
				})
			$('#chans').html(html);
			this.highlight();
			},
	enter : function  () {
		App.player.load( this.model.getCurChan().id); 
	}
}
	App.widgets.ChansList.controller = (function  () {
		function controller (widget) {
			this.widget = widget;
		}
		var controller = new controller (App.widgets.ChansList);
		return controller;
	})();
	App.widgets.ChansList.controller.handleEvent  = function  (	topic ) {
		var self = this;
		var model = self.widget.model;
		switch (topic){
			case App.components.Chans.title + '/changeSelectedIndex':
				self.widget.highlight();
			break;
			case App.components.Catalog.title + '/changeSelectedIndex':
				model.changeCurList( App.components.Catalog.getSelectedIndex() );
				self.widget.render( model.getCurList() );
			break;
			default: 
				throw 'Observer was subscribed but there are no realization : ' + this;
			break;
		}
	}
	PubSub.subscribe(App.components.Chans.title + '/changeSelectedIndex', App.widgets.ChansList.controller);
	PubSub.subscribe(App.components.Catalog.title + '/changeSelectedIndex', App.widgets.ChansList.controller);



	/**
	* 	Widgets.ProgramsList
	*/

App.widgets.ProgramsList = {
	model : App.components.Programs,
	grid : {x : 1, y : 1},
	neighbors : {
		// right : function () { return App.widgets.ProgramDetailInfo } ,
		left : function () {return  App.widgets.ChansList },
	},
	//spotlight
	active: false,
	init : function() {},
	render : function(arr){
		var html = '';
			arr.forEach(function(cur, ind){
				html += '<span class=epgentity tabindex=' +ind+ '>' + cur.title  + '</span>';
			})
			$('#fullepg').html(html);
	},
	highlight : function  () {
		var all = 'spotlight highlight';
		$('#fullepg .epgentity').removeClass(all);
		this.active 
			? $('.epgentity[tabindex=' + this.model.getSelectedIndex() +']').addClass(all)
			: $('.epgentity[tabindex=' + this.model.getSelectedIndex() +']').addClass('highlight');

	}
}
	App.widgets.ProgramsList.controller = (function  () {
		function controller (widget) {
			this.widget = widget;
		}
		var controller = new controller (App.widgets.ProgramsList);
		return controller;
	})();
	App.widgets.ProgramsList.controller.handleEvent = function(topic){
		var self = this;
			switch (topic){
				case App.components.Chans.title + '/changeSelectedIndex':

				self.widget.model.getCurDay()
					.done(function(){
						self.widget.model.findNow();
						self.widget.render(self.widget.model.curDay);
						self.widget.highlight();
					})
				break;
				case self.widget.model.title + '/changeSelectedIndex':
					self.widget.highlight();
				break;
				default:
					throw new 'Observer ' + this.title + ' was subscribed, but there are no realization';
				break;
			}
		}
		PubSub.subscribe(App.components.Chans.title + '/changeSelectedIndex',App.widgets.ProgramsList.controller );
		PubSub.subscribe(App.components.Programs.title + '/changeSelectedIndex',App.widgets.ProgramsList.controller );


	/**
	* 	Widgets.ProgramDetailInfo
	*/

App.widgets.ProgramDetailInfo = {
	model : App.components.ProgramDetailInfo,
	grid : {x : 1, y : 1},
	neighbors : {
		left : function () {return  App.widgets.ProgramsList },
	},
	//spotlight
	active: false,
	render : function  (obj) {
		var html = '';
		html += '<span  class="programinfotext" tabindex=' + '0' + '>' + obj.text  + '</span>';
		$('#programinfo').html(html);
	}
}
App.widgets.ProgramDetailInfo.controller = (function  () {
		function controller (widget) {
			this.widget = widget;
		}
		var controller = new controller (App.widgets.ProgramDetailInfo);
		return controller;
	})();
App.widgets.ProgramDetailInfo.controller.handleEvent = function  (topic) {
	var self = this;
	switch (topic){
		case  App.components.Programs.title + '/changeSelectedIndex':
			self.widget.render (self.widget.model.get());
		break;
		default :
			throw 'Illegal using controller handleEvent'
		break;
	}
}
PubSub.subscribe (App.components.Programs.title + '/changeSelectedIndex', App.widgets.ProgramDetailInfo.controller);




App.player = {
	chans : App.components.Chans,
	player : $('#iPlayer'),
	list : [],
	init : function  () {
	},
	load : function  (id) {
		this.player.attr('src', App.api.edge + id  + '.m3u8');
	},
	next : function  () {
		this.chans.incSelectedIndex();
		this.load( this.chans.getCurChan().id );
	},
	prev : function  () {
		this.chans.decSelectedIndex();
		this.load( this.chans.getCurChan().id);
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
		//if there are no saved state, use first menu first catalog	
		this.setActiveWidget (App.widgets.Menu);
		this.activeWidget.show();
		App.components.Menu.setSelectedIndex(0);			
	}
	this.setActiveWidget = function  (widget) {
		if (this.activeWidget){
			this.activeWidget.active = false;
			if( this.activeWidget.highlight ) {
				this.activeWidget.highlight();
			}
		}
		this.activeWidget = widget;
		this.activeWidget.active = true;
		this.activeWidget.highlight();
	}

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
			return witch ? true :false;
		}
		else {
			throw new 'Illegal changeWidgetByDirection usage (without orient)';
		}
	}
	this.changeWidgetByDirection = function(orient){
		// $( this.focusedView.childElem +  '[tabindex=' + this._model.getSelectedIndex() + ']').removeClass("spotlight");
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
				console.log('changeWidgetByDirection to : ');
				console.log(witch());
				// this.spotlight();
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
            '406': 'BLUE',
	}, 
	getKeyFunction: function(event){
		return App.device.keys[event.keyCode]
	}
}