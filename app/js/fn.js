var $edge;
var $api = "http://api.lanet.tv/";
var _icons = "assets/icons/";
var $play = {
		player : $("#iPlayer"),
		init : function (){
			drawList("-1");
			this.player.attr('src', $edge + $(".chan").first().attr("data-id") + '.m3u8');
		},
		load : function (_chan){
			this.player.attr('src', $edge + $(_chan).attr("data-id") + '.m3u8');

		}
}
// var sessionStorage = window.sessionStorage;
var $db = {
	prefix: '_db_',
	db: window.localStorage || {},
	get: function (k) { return this.db[this.prefix + k] },
	set: function (k, v) { this.db[this.prefix + k] = v }
};


function drawList(_cat){
	var resHtml = '';
	// var _position = 0;
	$channels.chans.forEach(function(current, index){
			if ( ($epgNowAll[ current.id ] && $epgNowAll[ current.id ].cat.slice(0,1)  == _cat) || _cat === "-1" ){
				console.log("chan is in category");
				resHtml += '<div class="chan" tabindex='+ index + " data-id=\"" + current.id  + '\"'  
				+ " data-position=\"" + index + "\"" 
				+ 'style="background-image: url(\'' +$staticURL + 'logo/'+ current.id + '.png\');">' 
				+ '</div>' ; 
			}
			
	})
	// if(resHtml){
		$(".left").html(resHtml);
	// } 
}
var $epg = {
	
	_addCardHTML : function(index, current){ 
		if (current){
			var date =  new Date(current.start * 1000);
			var minutes = date.getMinutes().toString(); 
			minutes = (minutes.length == 1) ? '0' + minutes : minutes;

			return '<div class="epgNext" tabindex="20" data-position=' + index +
				'><div class="epgTimeLine"> </div><span>' + current.title +'</span>' 
				// +  '<img src="'+ _icons + 'ic_favorite_grey600_24dp.png" class="ic_favorite">'
				// +  '<img src="' + _icons + 'ic_bookmark_grey600_24dp.png" class="ic_bookmark">'
				+' <div class="epgTime"> ' + date.getHours() + ':' +  minutes +' </div></div>' 
			} else {
				return '<div class="epgNext" tabindex="20" data-position=0' +
				'><div class="epgTimeLine"> </div><span>' + "Нет программы телепередач" +'</span>	</div>';
			}},

	// fillEpgAfter : function(_id){
	// 		var _html = '';
	// 		// var  res = JSON.parse(window.sessionStorage["epgDayFromNow"]);
	// 		var res = JSON.parse($db.get("epgDayFromNow"));
	// 		if(res.length !== 0 ){
	// 			res.slice(1).forEach( function( current, index){
	// 				_html += '<div class="epgNext" tabindex="50" ' + ' data-position='+ index +
	// 				'><span class="epgNextTitle">' + current.title+'</span></div>';
	// 			})
	// 			$(".epgFromNow").css("top","-600px");
	// 			$(".epgFromNow").css("height",'700px');
	// 		} else {
	// 			_html += '<div class="epgNext" tabindex="50" ' 
	// 			+ ' data-position=0><span class="epgNextTitle"></span></div>';
	// 		}
	// 		$(".epgFromNow").html(_html);
	// },
	showCards : function(_chan){
		$.getJSON($api + "epg/" + $(_chan).attr("data-id") + "/dayfromnow", function(res){
			// window.sessionStorage["epgDayFromNow"] = JSON.stringify(res);
			$db.set("epgDayFromNow", JSON.stringify(res));
			var innerHTML = '';
			// console.log(JSON.parse(res);
			if(res.length !== 0){
				res.forEach(function(current, index){
					innerHTML += $epg._addCardHTML( index, current);
				});	
			} else {
				innerHTML = $epg._addCardHTML();
			}
			$(".epgContainer").html(innerHTML);
			$(".epgContainer").css("width", res.length * 612);
			$(".footer").attr("data-position", $(_chan).attr("data-position"));
			$(".epgNext").first().focus();
			$(".epgTimeLine").first().prepend('<div class="epgTimeLineActive"></div>');
			$epg.drawTimeLine();
			// $(".epgTimeLine").first().addClass("epgTimeLineActive");


		})
	},
	drawTimeLine : function(){
		var _epgDayFromNow = JSON.parse($db.get("epgDayFromNow")); 
		if(_epgDayFromNow.length !== 0) {
			var _duration = _epgDayFromNow[0].stop - _epgDayFromNow[0]["start"];
			var _gone = new Date().getTime() / 1000 - _epgDayFromNow[0]["start"];
			// var activeElem = document.createElement('div');
			if( _gone / _duration < 1){
				$(".epgTimeLineActive").css("width", _gone / _duration * 100 + "%" );
			} else {
				$(".epgTimeLineActive").css("width", "100%" );
			}
		} 
	}
}

// function Block( element, direction ){
// 	this.element = element;
// 	this.direction = direction;
// 	this.father	;
// 	this.child=[];
	
// 	this.addChild = function(block){
// 		block.father = this;
// 		this.child.push(block);
// 	}
// 	this.focusFirst = function(){
// 		if(this.element.firstElementChild){
// 			console.log("im focus first");
// 			console.log(this.element.firstElementChild);
// 			this.element.firstElementChild.focus();
// 		} else {
// 		}
// 	}

// 	this.focusNext = function(evntTarget){
// 		if(! (evntTarget  == this.element.lastElementChild) ){
// 			var _position = 1 + parseInt(evntTarget.getAttribute("data-position"));
// 			this.element.querySelector("[data-position=\"" + _position + "\"]").focus();
// 		}
// 	}
// 	this.focusPrev = function(evntTarget){
// 		console.log("foucs prev");
// 		if(!(evntTarget == this.element.firstElementChild)){
// 			var _position = parseInt(evntTarget.getAttribute("data-position")) -1 ;
// 			this.element.querySelector("[data-position=\"" + _position + "\"]").focus();
// 		} else {
// 			this.hideBlock();
// 		}
// 	}
// 	this.focusOnFather = function(){
// 		if(this.father.element.style.visibility == "visible"){
// 			this.father.focusFirst();
// 		} else {
// 			this.father.focusOnFather();
// 		}
// 	}
	
// 	this.hideBlock = function (args){
// 		var _position = this.element.getAttribute("data-position");
// 		console.log("hiding block");
// 		if(_position && this.father.element.style.visibility == "visible"){
// 			console.log("first true");
// 			this.father.element.querySelector("[data-position=\"" + _position + "\"]").focus();
// 			this.element.removeAttribute("data-position");
// 		} else {
// 			this.focusOnFather();
			
// 		}
// 		this.element.style.visibility = "hidden";
// 	}

// 	this.displayChild = function (evntTarget, indexChild, blabla, blablabla){
// 		if(this.child[0] ){
// 			var _position = evntTarget.getAttribute("data-position");
// 			this.child[0].element.setAttribute("data-position",_position);
// 			this.child[0].prepareContent(evntTarget);
// 			this.child[0].element.style.visibility = "visible";
// 			this.child[0].focusFirst();
// 		}
// 	}
// 	this.customAction = function(evntTarget, bla, bla)	{}
// 	this.prepareContent = function(evntTarget, bla, bla)	{}
// 	this.select = function(evntTarget)	{}
// }

// var html = new Block($("html")[0],"row");
// 	html.hideBlock = function(){}
// 	html.displayChild = function(){
// 		this.child[0].element.style.visibility = "visible"; 
// 		$("#wrapper").css({"visibility":"visible"});
// 		this.child[0].focusFirst();
// 	}
// 	html.focusPrev = function(){}


// var header 	= new Block($(".header")[0], "row");
// 	header.hideBlock = function(args){
// 		this.element.style.visibility = "hidden";
// 		$("#wrapper").css({"visibility":"hidden"});
// 		$("body").focus();
// 	}
// 	header.displayChild = function(evntTarget){
// 		if(this.child[0] ){ 
// 				this.child[0].child[0].element.style.visibility = "visible"; 
// 				this.child[0].child[0].focusFirst();
// 				var _position = evntTarget.getAttribute("data-position");
// 				this.child[0].element.setAttribute("data-position",_position);
// 			}
// 	}

// var left 	= new Block($(".left")[0], "column");
// 	left.customAction = function (evntTarget, bla, bla){
// 		if(this.father){
// 				var _position = this.element.getAttribute("data-position");
// 				this.father.element.style.visibility = "visible";
// 				if( _position ){
// 					this.father.element.querySelector("[data-position='"+ _position +"']").focus();
// 				} else {
// 				this.father.focusFirst();
// 			}
// 			}
// 	}
// 	left.prepareContent = function(evntTarget){
// 		var _class = evntTarget.getAttribute("data-id");
// 		drawList(_class);
// 	}
// 	left.select = function(_eventTarget){
// 		if(_eventTarget) {
// 			$play.load($edge + _eventTarget.getAttribute("data-id") + ".m3u8");
// 		}
// 	}

// var genres 	= new Block($(".genres")[0], "column");
// var footer 	= new Block($(".footer")[0], "row");
// 	footer.prepareContent = function(evntTarget, bla, bla){
// 		var _elem = document.querySelector(".chan[data-position='" 
// 				+ $(".footer").attr("data-position")+ "']" );
// 		$epg.showCards(_elem.getAttribute("data-id"));
// 	};
// 	footer.displayChild = function(eventTarget){
// 		if(eventTarget == $(".epgNow")[0]){
// 			var _position = eventTarget.getAttribute("data-position");
// 			console.log(this.child[0]);
// 			this.child[0].element.setAttribute("data-position", _position);
// 			this.child[0].prepareContent(eventTarget);
// 			this.child[0].element.style.visibility = "visible";
// 			// this.child[0].focusFirst();
// 		} 
// 		// else 
// 		// if (eventTarget == $(".epgAfter")[0]){
// 		// 	var _position = eventTarget.getAttribute("data-position");
// 		// 	this.child[0].element.setAttribute("data-position",_position);
// 		// 	this.child[0].prepareContent(eventTarget);
// 		// 	this.child[0].element.style.visibility = "visible";
// 		// 	this.child[0].focusFirst();
// 		// }
// 	}

var $programInfo = {
	prepareContent : function(position){
		var _html = '';
		// var  res = JSON.parse(window.sessionStorage["epgDayFromNow"]);
		var res = JSON.parse($db.get("epgDayFromNow"));
		if(res.length !== 0) {
			_html += '<h2>' + res[position].title +'</h2>';
			_html += res[position].text;
		} else {
			_html = '';
		}
		$(".epgProgramContent").html(_html);

	}
}

// var epgProgramInfo = new Block($("#epgProgramInfo")[0],"column");
// 	epgProgramInfo.prepareContent = function(eventTarget){
// 		var _html = '';
// 		// var  res = JSON.parse(window.sessionStorage["epgDayFromNow"]);
// 		var res = JSON.parse($db.get("epgDayFromNow"));
// 		if(res.length !== 0) {
// 			_html += '<h2>' + res[0].title +'</h2>';
// 			_html += res[0].text;
// 		} else {
// 			_html = '';
// 		}
// 		$(".epgProgramContent").html(_html);

// 	}

// html.addChild(header);
// header.addChild(genres);
// genres.addChild(left);
// left.addChild(footer);
// // footer.addChild(epgFromNow);
// footer.addChild(epgProgramInfo);

