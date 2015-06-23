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
}
/* Routing between controllers*/
var Router = {
	changeHash : function(hash){
		window.location.hash = '#' + hash;
		PubSub.publish("location.hash/changed");
	}
}
var App = {
	api : {
		main : "http://api.lanet.tv/",
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



/* Models contructor*/
function Model(title) {
	this.title = title;
	this.set = function(key, val, callback){
		this[key] = val;
		if(callback){
			callback.call(this);
		}
	};
	this.selectedIndex = -1;
	this.getSelectedIndex = function(){
		return this.selectedIndex;
	};
	this.hasElem = function(ind){
		return this.currentList[ind] ? true : false; 
	};
	this.setSelectedIndex = function(val){
		var _this = this;
		this.set('selectedIndex', val , function(){
			PubSub.publish(_this.title + "/changeSelectedIndex");
		});
	}
}

var Chans = new Model('Chans');
	Chans.title = 'Chans';
	Chans.elem = $('#chans');
	Chans.selectedIndex = -1;
	Chans.all = [];
	Chans.currentList = [];
	Chans.rating = [];
	Chans.cable = [];
	Chans.init = function(){
		var _this = this;
		$.getJSON(App.api.main + "list.json", function(res){
			Chans.all = res.list.slice();
			App.api.img = res.img;
			res.list.forEach(function(cur, indx){
				Chans.cable.push(cur.id);
			})
			Chans.currentList = Chans.all; 
			PubSub.publish(_this.title + '/init');
			PubSub.publish(_this.title + '/changed');
		})
		$.getJSON(App.api.main + App.api.rating, function(res){
			this.rating = res;
		})
	};

	Chans.sort = function(type){
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
 	
function RootMenuModel (argument){
	this.title = 'RootMenu';
	this.selectedIndex = 0;
	this.all = [
			'channels',
			'programs',
			'settings',
			'help'
		];
	this.currentList = this.all;
	this.init = function(){
		var _this = this;
		this.set('currentList', this.all, function(){
			PubSub.publish(_this.title + '/changeCurrentList');
		})
		this.set('selectedIndex', 0 , function(){
			PubSub.publish(_this.title + '/changeSelectedIndex');
		})
	}
	this.getSelectedTitle = function(){
		return this.currentList[this.selectedIndex];
	}
}
RootMenuModel.prototype = new Model();
var RootMenu = new RootMenuModel();

function RootSubMenuModel (){
	this.title = 'RootSubMenu';
	this.selectedIndex = 0;
	this.all = {
		//look like in all in root menu
		'0': ['all', 'selected', 'top' ],
		'1': ['bookmarks', 'top', 'tags', 'genres']
	};
	this.currentList = [],
	this.changeCurrentList = function(){
		this.set('currentList', this.all[RootMenu.getSelectedIndex()], function(){
			PubSub.publish(this.title + '/currentListChanged');
		this.set('selectedIndex', 0, function(){
			PubSub.publish(this.title + '/changeSelectedIndex');
		})
		console.log('rootSubMenu currentList = ' + this.currentList);
	})
	}
	this.handleEvent = function(topic){
		switch (topic){
			case RootMenu.title + '/changeCurrentList':
			case RootMenu.title + '/changeSelectedIndex':
				this.changeCurrentList();
			break;
			default:
				console.log("Observer " + this.title +" was subscribed for this topic, but there is no processing");
			break;
		}
	}
}

RootSubMenuModel.prototype = new Model();
var RootSubMenu = new RootSubMenuModel();

PubSub.subscribe(RootMenu.title + '/changeSelectedIndex', RootSubMenu);
PubSub.subscribe(RootMenu.title + '/changeCurrentList', RootSubMenu);


function BrowseLaneModel (argument) {
	this.title = 'BrowseLane';
	this.selectedIndex = 0;
	this.all = [];
	this.currentList = [];

	this.init = function(){
		// Genres.init();
		// var _this = this;
	}

	this.handleEvent = function(topic){
		switch (topic) {
			case Genres.title + '/init':
				this.set('all', Genres.all);
				this.set('currentList', this.all, function(){
				PubSub.publish(this.title + '/init');
				PubSub.publish(this.title + '/changed');
			});
			break;
			default:
				console.log("Observer " + BrowseLane.title +" was subscribed for this topic, but there is no processing");
			break;
		}
	}
}
BrowseLaneModel.prototype = new Model();
var BrowseLane = new BrowseLaneModel();

var Genres = new Model('Genres');
	Genres.selectedIndex = -1;
	Genres.all = [];
	Genres.init = function(){
		var _this = this;
		$.getJSON(App.api.main + "categories.json", function(res){
			Genres.set('all', res, function(){
				PubSub.publish(_this.title + '/init');
			})
		})
	};
	Genres.render = function(){
		var html = '';
		Genres.all.forEach(function(cur, ind){
			html += '<span class="genre cat">' + cur[0] +'</span>';
		})
		$("#browseLane").html(html);
	}

// var Epg = new Model('Epg');
// 	Epg.epgNowAll = {},
// 	Epg.getEpgNowAll = function(){
// 		$.getJSON(App.api.main + 'epg/now', function(res){
// 			this.epgNowAll = res;
// 			PubSub.publish(this.name + '/changed');
// 		})
// 	}


/* Observers (Views)*/
function Observer(){
	// this.grid = { x : 1, y : this._model.all.length }
}

function RootMenuView(){
	this._model = RootMenu;
	this.childElem = '.cat';
	this.grid = { x : 1, y : this._model.all.length }

	this.rebuildList = function(){
		var html = '';
		this._model.currentList.forEach(function(cur, ind){
			html += '<span class="cat"' + 'tabindex='+ ind +  '>' + cur +'</span>';
		})
		$('#rootMenu').html(html);
	}
	this.handleEvent = function(topic){
		switch (topic){
			case RootMenu.title + '/changeSelectedIndex':
				this.rebuildList();
			break;
			default:
				console.log("Observer " +this.title +" was subscribed for this topic, but there is no processing " + topic);
			break;
		}
	}
}
RootMenuView.prototype = new Observer();
var rootMenuView = new RootMenuView();
PubSub.subscribe(RootMenu.title + '/changeSelectedIndex', rootMenuView);

function RootSubMenuView(){
	this._model = RootSubMenu;
	this.childElem = '.subcat';
	this.grid = { x : 1, y : this._model.all.length }
	this.rebuildList = function(){
		var html = '';
			this._model.currentList.forEach(function(cur, ind){
				html += '<span class="subcat"' + 'tabindex='+ ind +  '>' + cur +'</span>';
			})
			$('#rootSubMenu').html(html);	
	}
	this.handleEvent = function(topic){
		switch (topic){
			case RootSubMenu.title + '/changeCurrentList':
			case RootSubMenu.title + '/changeSelectedIndex':
				this.rebuildList();
			break;
			default:
				console.log("Observer " +this.title +" was subscribed for this topic, but there is no processing " + topic);
			break;
		}
	}
}
RootSubMenu.prototype = new Observer();
var rootSubMenuView = new RootSubMenuView();
PubSub.subscribe(RootSubMenu.title + '/changeSelectedIndex', rootSubMenuView);

function ChansView (argument) {
	var _this = this;
	this.elem = $("#chans")[0];
	this.childElem = '.chan';

	this._model = Chans,
	this.grid = {x : 1, y : this._model.currentList.length},
	
	this.scrollDown = function(){
		var step = $(_this.elem).children(":first").width();
		var cur = $(_this.elem).scrollTop();
		$(_this.elem).scrollTop( cur + step);	 
	}
	this.scrollTop = function(){
		var step = $(_this.elem).children(":first").width();
		var cur = $(_this.elem).scrollTop();
		$(_this.elem).scrollTop( cur - step);	 
	}
	this.handleEvent = function(topic){
		switch (topic){
			case this._model.title + '/changeSelectedIndex' :
				$('.chan').removeClass("spotlight");
				$('.chan[tabindex=' + this._model.getSelectedIndex() + ']').addClass("spotlight");
			break;
			case this._model.title + '/init':
				this.rebuildList("-1");
			break;
			case this._model.title + '/changed' :
				this.rebuildList();
			break;
			default:
				console.log("Observer was subscribed for this topic, but there is no processing : " + topic);
			break;

		}
	}
	this.rebuildList = function(_cat){
		var html = '';
		this._model.currentList.forEach(function(current, index){
			// if ( ($epgNowAll[ current.id ] && $epgNowAll[ current.id ].cat.slice(0,1)  == _cat) || _cat === "-1" ){
				html += '<div class="chan" tabindex='+ index + " data-id=\"" + current.id  + '\"'  
				+ " data-position=\"" + index + "\"" 
				+ 'style="background-image: url(\'' + App.api.img + 'logo/'+ current.id + '.png\');">' 
				+ '</div>' ; 
			})
		// });
		$('#chans').html(html);

	}
}


function BrowseLaneView (argument) {
	var _this = this;
	this.elem = $('#browseLane')[0];
	this.childElem = '.cat';
	this._model = BrowseLane,
	// this.getSelectedIndex = function(){
	// 	return this._model.getSelectedIndex();
	// }
	//need current model list
	this.grid = { x : 1, y : this._model.all.length }
	this.scrollDown = function(){
		var step = $(_this.elem).children(":first").width();
		var cur = $(_this.elem).scrollTop();
		$(_this.elem).scrollTop( cur + step);	 
	}
	this.scrollTop = function(){
		var step = $(_this.elem).children(":first").width();
		var cur = $(_this.elem).scrollTop();
		$(_this.elem).scrollTop( cur - step);	 
	}
	this.rebuildList = function(){
		var list, html;

		list = this._model.all;
		// console.log(list);

		html = '';
		
		list.forEach(function(cur, ind){
			html += '<span class="cat"' + 'tabindex='+ ind +  '>' + cur[0] +'</span>';
		})
		$("#browseLane").html(html);
	}
	this.handleEvent = function(topic){
		switch (topic){
			case this._model.title + '/changed':
				this.rebuildList();
			break;
			case this._model.title + '/changeSelectedIndex':
				$('.cat').removeClass("spotlight");
				$('.cat[tabindex=' + this._model.getSelectedIndex() + ']').addClass("spotlight");
			break;
			default:
				console.log("Observer was subscribed for this topic, but there is no processing : " + topic);
			break;

		}
	}
}

var chansView = new ChansView();
var browseLaneView = new BrowseLaneView();


PubSub.subscribe(Chans.title + '/changeSelectedIndex', chansView);
PubSub.subscribe(Chans.title + '/changed', chansView);
PubSub.subscribe(Genres.title + '/init', BrowseLane);
PubSub.subscribe(BrowseLane.title + '/changed', browseLaneView);
PubSub.subscribe(BrowseLane.title + '/changeSelectedIndex', browseLaneView);

chansView.leftNeighbor = rootSubMenuView;
// browseLaneView.rightNeighbor = chansView;
rootSubMenuView.rightNeighbor = chansView;
rootSubMenuView.leftNeighbor = rootMenuView;
rootMenuView.rightNeighbor = rootSubMenuView;

	/*Controllers*/
function Controller (argument) {
	// body...
}
function LoadingController(){
	this.loaded = {
		chans : false,
		genres : false,
	}
	this.init = function(){
		$('#loading').show();
		RootMenu.init();
		Chans.init();
		Genres.init();
	}
	this.isReady = function(){
		return (this.loaded.chans && this.loaded.genres);
	}
	this.handleEvent = function(topic){
		switch (topic){
			case Chans.title + '/init':
				this.loaded.chans = true;
			break;
			case Genres.title + '/init':
				this.loaded.genres = true;
			break;
			default:
				console.log("Observer was subscribed for this topic, but there is no processing" + topic + ' blabl');
			break;
		}
		if( this.isReady ){
			$('#loading').hide();
			Router.changeHash('browse');
		}
	}
}

var loadingController = new LoadingController();
PubSub.subscribe(Chans.title + '/init', loadingController);
PubSub.subscribe(Genres.title + '/init', loadingController);


function BrowseViewController (argument) {
	this.focusedView = {},
	this._model = {};

	this.init = function(){
		this.focusedView = chansView;
		this._model = this.focusedView._model;
		this._model.setSelectedIndex(this._model.getSelectedIndex() === -1 ? 0 : this._model.getSelectedIndex());
		this.spotlight();
	}
	this.spotlight = function(){
		$(this.focusedView.childElem).removeClass('spotlight');
		var sel =  this.focusedView.childElem +  '[tabindex=' + this._model.getSelectedIndex() + ']' ;
		$( sel ).addClass("spotlight");
	}
	this.changeView = function(orient){
		// $( this.focusedView.childElem +  '[tabindex=' + this._model.getSelectedIndex() + ']').removeClass("spotlight");
		var witch = {};
		if (orient) {
			switch (orient){
				case 'UP':
					witch = this.focusedView.upNeighbor;
				break;
				case 'RIGHT':
					witch = this.focusedView.rightNeighbor;
				break;
				case 'DOWN':
					witch = this.focusedView.downNeighbor;
				break;
				case 'LEFT':
					witch = this.focusedView.leftNeighbor;
				break;
				default:
					throw new 'change view without appropriate orient';
				break;
			}
			if (witch) {
				this.focusedView = witch;
				this._model = this.focusedView._model;
				console.log('changeView to : ');
				console.log(witch);
				this.spotlight();
				return true;
			
			} else {
				return false;
			}
		}
		else {
			throw new 'Illegal changeView usage (without orient)';
		}
	}

	this.UP =  function(){
		console.log('UP evnt in BrowseViewController');

		if ( this._model.hasElem (this._model.getSelectedIndex() - this.focusedView.grid.x) )	{
			this._model.setSelectedIndex (  this._model.getSelectedIndex() - this.focusedView.grid.x );
			this.spotlight();
			if(this.focusedView.scrollTop){
				this.focusedView.scrollTop();
			}
		} else {
			// switch to upNeighbor
				this.changeView('UP');
		}
	},

	this.RIGHT = function(){
		if( (this._model.getSelectedIndex() +  1)  % this.focusedView.grid.x  === 0){
			// switch to rightNeighbor
				this.changeView('RIGHT');
		} else {
			if( this._model.hasElem(this.focusedView.getSelectedIndex() + 1) ){
				this._model.setSelectedIndex (this._model.getSelectedIndex() + 1);
			}
		}
	},

	this.DOWN = function(){
		
		if ( this._model.hasElem (this._model.getSelectedIndex() + this.focusedView.grid.x  ) )	{
				this._model.setSelectedIndex ( this._model.getSelectedIndex() + this.focusedView.grid.x);
				this.spotlight();
			if(this.focusedView.scrollDown){
				this.focusedView.scrollDown();
			}
		} else {
				this.changeView('DOWN');
		}

	},

	this.LEFT = function(){
		console.log((this._model.getSelectedIndex() -  1)  % this.focusedView.grid.x  === 0);
		if( ((this._model.getSelectedIndex() -  1)  % this.focusedView.grid.x)  === 0){
			this.changeView('LEFT');
		} else {
			//switch to left element in matrix
		}
		
	}
}
var bwController = new BrowseViewController();


App.controllers.MainMenuController = {
	title : "mainmenucontroller",
	UP: function(){
	},
	RIGHT: function(){
	},

	DOWN : function(){
	},
	LEFT : function(){
	}
} 

App.start();
































App.device = {
	keys : {
			'13': 'ENTER',
            '35': 'TOP_MENU', // favorites
            '46': 'BACK', // delete
            '33': 'PAGE_UP',
            '34': 'PAGE_DOWN',

            '37': 'LEFT',
            '38': 'UP',
            '39': 'RIGHT',
            '40': 'DOWN',
            '78': 'KEY_NEXT', //n
            '80': 'KEY_PREV', //p
            '189': 'VOLUME_DOWN', //minus
            '1187': 'VOLUME_UP', //plus

            '36': 'EXIT', // home
            '8': 'BACKSPACE',

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

            '112': 'RED',
            '71': 'GREEN', //g
            '89': 'YELLOW', //y
            '66': 'BLUE',
	}, 
	getKeyFunction: function(event){
		return App.device.keys[event.keyCode]
	}
}