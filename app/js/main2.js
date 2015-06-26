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

var Chans = (function () {
	function M (){
		this.title = 'Chans';
		this.selectedIndex = -1;
		this.all = [];
		this.currentList = [];
		this.rating = [];
		this.cable = [];
		this.init = function(){
			var _this = this;
			$.getJSON(App.api.main + "list.json", function(res){
				this.all = res.list.slice();
				App.api.img = res.img;
				res.list.forEach(function(cur, indx){
					this.cable.push(cur.id);
				})
				this.currentList = this.all; 
				PubSub.publish(_this.title + '/init');
				PubSub.publish(_this.title + '/changed');
			})
			$.getJSON(App.api.main + App.api.rating, function(res){
				this.rating = res;
			})
		};

	/*
	* Sort channels by rating or by cable
	*/
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

 	Chans.handleEvent = function(topic){
 		var _this = this;
 		switch(topic){
 			case RootSubMenu.title + '/changeSelectedIndex':
 				var filter = function(ind){
 					console.log(ind);
 					switch (ind) {
 						case 0:
 							_this.set('currentList', _this.all, function(){
 								PubSub.publish(_this.title + '/changeCurrentList');
 							})
 						break;

 						case 1:
 							_this.set('currentList', [], function(){
 								PubSub.publish(_this.title + '/changeCurrentList');
 							}) 
 						break;
 						
 						case 2: 
 						break;
 						
 						default : 
 							console.log('default in filter');
 						break;
 					}
 				}

 				filter( RootSubMenu.getSelectedIndex() );

 			break;
 		}
 	}
 	Chans.getCur = function(){
 		return this.currentList[ this.getSelectedIndex() ];
 	}
	}

	M.prototype = new Model('Chans');
	var M = new M();

	function V () {
		// body...
	}

	function C (m,v,c) {

	}



})();


var Chans = new Model('Chans');
	// Chans.title = 'Chans';
	// Chans.elem = $('#chans');
	// Chans.selectedIndex = -1;
	// Chans.all = [];
	// Chans.currentList = [];
	// Chans.rating = [];
	// Chans.cable = [];
	// Chans.init = function(){
	// 	var _this = this;
	// 	$.getJSON(App.api.main + "list.json", function(res){
	// 		Chans.all = res.list.slice();
	// 		App.api.img = res.img;
	// 		res.list.forEach(function(cur, indx){
	// 			Chans.cable.push(cur.id);
	// 		})
	// 		Chans.currentList = Chans.all; 
	// 		PubSub.publish(_this.title + '/init');
	// 		PubSub.publish(_this.title + '/changed');
	// 	})
	// 	$.getJSON(App.api.main + App.api.rating, function(res){
	// 		this.rating = res;
	// 	})
	// };

	// /*
	// * Sort channels by rating or by cable
	// */
	// Chans.sort = function(type){
 // 		var arr;
 // 		if (type === "rating"){
 // 			arr = $channels.rating;
 // 		} else if (type == "cable"){
 // 			arr = $channels.cable;
 // 		}
 // 		this.chans.sort(function( a , b ){
 // 			if ( arr.indexOf(a) && arr.indexOf(b) ) {
 // 				return arr.indexOf(a.id) - arr.indexOf(b.id);
 // 			} else {
 // 				return 0;
 // 			}
 // 		})
 // 	}

 // 	Chans.handleEvent = function(topic){
 // 		var _this = this;
 // 		switch(topic){
 // 			case RootSubMenu.title + '/changeSelectedIndex':
 // 				var filter = function(ind){
 // 					console.log(ind);
 // 					switch (ind) {
 // 						case 0:
 // 							_this.set('currentList', _this.all, function(){
 // 								PubSub.publish(_this.title + '/changeCurrentList');
 // 							})
 // 						break;

 // 						case 1:
 // 							_this.set('currentList', [], function(){
 // 								PubSub.publish(_this.title + '/changeCurrentList');
 // 							}) 
 // 						break;
 						
 // 						case 2: 
 // 						break;
 						
 // 						default : 
 // 							console.log('default in filter');
 // 						break;
 // 					}
 // 				}

 // 				filter( RootSubMenu.getSelectedIndex() );

 // 			break;
 // 		}
 // 	}
 // 	Chans.getCur = function(){
 // 		return this.currentList[ this.getSelectedIndex() ];
 // 	}

 	
function RootMenuModel (argument){
	this.title = 'RootMenu';
	this.selectedIndex = 0;
	this.all = [
			'channels',
			'programs',
			'tags',
			'genres',
			'search',
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
		'1': ['bookmarks', 'top', 'tags', 'genres'],
		'2': ['language', 'smartCrop', 'sortChannels']
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

PubSub.subscribe(RootSubMenu.title + '/changeSelectedIndex', Chans);
PubSub.subscribe(RootMenu.title + '/changeSelectedIndex', RootSubMenu);
PubSub.subscribe(RootMenu.title + '/changeCurrentList', RootSubMenu);


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
		// $("#browseLane").html(html);
	}


		//NavigateController

function NavigateController (model, view, contr) {
	this.M = model;
	this.V = view;
	this.C = contr;
	this.spotlight = function(){
		this.V.spotlight(this.M.selectedIndex);
	}
	this.UP =  function(){
		if ( this.M.hasElem (this.M.getSelectedIndex() - this.grid.x) )	{
			this.M.setSelectedIndex ( this.M.getSelectedIndex() - this.grid.x );
		} else {
			// switch to upNeighbor
				bwController.changeView('UP');
		}
	},

	this.RIGHT = function(){
		if( (this.M.getSelectedIndex() +  1)  % this.grid.x  === 0){
			// switch to rightNeighbor
				bwController.changeView('RIGHT');
		} else {
			if( M.hasElem( M.getSelectedIndex() + 1) ){
				M.setSelectedIndex ( M.getSelectedIndex() + 1);
			}
		}
	},

	this.DOWN = function(){
		
		if ( this.M.hasElem ( this.M.getSelectedIndex() + this.grid.x  ) )	{
				this.M.setSelectedIndex ( this.M.getSelectedIndex() + this.grid.x);
				// this.spotlight();
			// if( this.focusedView.scrollDown ){
			// 	this.focusedView.scrollDown();
			// }
		} else {
				bwController.changeView('DOWN');
		}

	},

	this.LEFT = function(){
		if( (( M.getSelectedIndex() -  1)  % this.grid.x)  === 0){
			bwController.changeView('LEFT');
		} else {
			//switch to left element in matrix
		}
		
	}
}


var Epg = (function (argument) {
	function M (title) {
		this.title = title;
		this.epgNowAll = {};
		this.selectedIndex = 0;
		this.curDay = [];
		this.currentList = [];
		this.now = {};
		this.getEpgNowAll = function(){
			this._this = this;
			$.getJSON(App.api.main + 'epg/now', function(res){
				_this.epgNowAll = res;
				PubSub.publish(_this.name + '/changed');
			})
		};
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
		//must set selected index to now
		this.getCurDay = function(){
			var _this = this;
			return $.getJSON(App.api.main + 'epg/' + Chans.getCur().id + '/day', function(res){
				_this.curDay = res;
				_this.currentList= _this.curDay;
			})
		}
	}
	M.prototype = new Model('Epg');
	var M = new M('Epg');
	
	function V () {
		this.spotlight = function(ind){
			$('#fullepg .epgentity').removeClass("spotlight");
			$('.epgentity[tabindex=' + ind +']').addClass('spotlight');
		}
		this.render = function(arr, now){
			var html = '';
			arr.forEach(function(cur, ind){
				html += '<span class=epgentity tabindex=' +ind+ '>' + cur.title  + '</span>';
			})
			$('#fullepg').html(html);
		}
	}
	var V = new V();

	function C () {
		this.grid = { x : 1, y : 10 },
		this.title = 'EpgController';
		this.start = function(){
			var _this = this;
			M.getCurDay()
				.done(function(){
					M.findNow();
					V.render(M.curDay);
					_this.spotlight();
				})
		}
		this.handleEvent = function(topic){
			switch (topic){
				case Chans.title + '/changeSelectedIndex':
					this.start();
				break;
				case M.title + '/changeSelectedIndex':
					this.spotlight(M.getSelectedIndex());
				break;
				default:
					console.log('Observer ' + this.title + ' was subscribed, but there are no realization');
				break;
			}
		}	
	}

	// EpgController.prototype = bwController;
	C.prototype = new NavigateController(M, V, C);
	var C = new C();
	PubSub.subscribe(Chans.title + '/changeSelectedIndex', C);
	PubSub.subscribe(M.title + '/changeSelectedIndex', C);

	return {
		M : M,
		V : V,
		C : C
	}
})();


function ProgramInfoModel () {
	this.current = {}	
}

ProgramInfoModel.prototype = new Model();
var programInfoModel = new ProgramInfoModel();

function ProgramInfoView () {
	this.render = function(item){
		var html = '';
		html = '<span>' + item.text + '</span';
		$('#programinfo').html(html);
	}
}
var programInfoView = new ProgramInfoView();

function ProgramInfoController () {
	this.title = 'ProgramInfoController';
	this.handleEvent = function(topic){
		switch (topic){
			case Epg.M.title + '/changeSelectedIndex':
				programInfoView.render(Epg.M.now.obj)
			break;
			default:
				console.log('Observer ' + this.title + ' was subscribed, but there are no realization');
			break;
		}
	}
}

var programInfoController = new ProgramInfoController();
PubSub.subscribe(Epg.M.title + '/changeSelectedIndex', programInfoController);

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
		if(this._model.currentList){
			this._model.currentList.forEach(function(cur, ind){
				html += '<span class="subcat"' + 'tabindex='+ ind +  '>' + cur +'</span>';
			})
		}
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
			// case this._model.title + '/changeSelectedIndex' :
			// 	$('.chan').removeClass("spotlight");
			// 	$('.chan[tabindex=' + this._model.getSelectedIndex() + ']').addClass("spotlight");
			// break;
			case this._model.title + '/init':
				this.rebuildList("-1");
			break;
			case this._model.title + '/changeCurrentList':
			case this._model.title + '/changed' :
			//must be category
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

var chansView = new ChansView();
// var browseLaneView = new BrowseLaneView();


PubSub.subscribe(Chans.title + '/changeSelectedIndex', chansView);
PubSub.subscribe(Chans.title + '/changed', chansView);
// PubSub.subscribe(Genres.title + '/init', BrowseLane);
// PubSub.subscribe(BrowseLane.title + '/changed', browseLaneView);
// PubSub.subscribe(BrowseLane.title + '/changeSelectedIndex', browseLaneView);

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
	this.activeController = {};

	this.init = function(){
		// kostil
		Chans.setSelectedIndex(Chans.getSelectedIndex() === -1 ? 0 : Chans.getSelectedIndex());

		// this.focusedView = chansView;
		// this._model = this.focusedView._model;
		// this._model.setSelectedIndex(this._model.getSelectedIndex() === -1 ? 0 : this._model.getSelectedIndex());
		// this.spotlight();
		this.activeController = Epg.C;
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
				$(this.focusedView.childElem).removeClass('spotlight');
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
		// console.log('UP evnt in BrowseViewController');

		// if ( this._model.hasElem (this._model.getSelectedIndex() - this.focusedView.grid.x) )	{
		// 	this._model.setSelectedIndex (  this._model.getSelectedIndex() - this.focusedView.grid.x );
		// 	this.spotlight();
		// 	if(this.focusedView.scrollTop){
		// 		this.focusedView.scrollTop();
		// 	}
		// } else {
		// 	// switch to upNeighbor
		// 		this.changeView('UP');
		// }\
		this.activeController.UP();
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
		
		// if ( this._model.hasElem (this._model.getSelectedIndex() + this.focusedView.grid.x  ) )	{
		// 		this._model.setSelectedIndex ( this._model.getSelectedIndex() + this.focusedView.grid.x);
		// 		this.spotlight();
		// 	if(this.focusedView.scrollDown){
		// 		this.focusedView.scrollDown();
		// 	}
		// } else {
		// 		this.changeView('DOWN');
		// }
		this.activeController.DOWN();
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


























var Player = (function () {
	// body...
	function method(){

	}
	return {
		method : method
	}
})();

var Store = (function () {
	// body...
	var prefix = '_db';
	var store =  {};

	if(typeof(Storage) !== undefined){
		store = window.localStorage;
	} else {
		throw new 'LocalStorage doesn\'t support!'
	}

	function set(key , val){
		store.setItem(key, val);
	}
	function get(key){
		return store.getItem(key); 
	}
	function remove(key){
		return store.removeItem(key);
	}
	return {
		set : set,
		get : get
	}

})();



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