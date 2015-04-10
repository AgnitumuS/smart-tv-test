var $edge;
var $api = "http://api.lanet.tv/"
var $play = {
	init : function (){
		$("#iPlayer").attr('src', 'http://kirito.la.net.ua/tv/9006.m3u8');
	},
	load : function (playlist){
		$('#iPlayer').attr('src', playlist);
	}
}

function getChannelById(_id){
	var channel;
	for(var i = 0; i < $channels.length; i++){
			if($channels[i]._id == _id) 
				channel = $channels[i];
		}
		return channel;
}

function drawList(_class){
	var resHtml = '';
	var _position = 0;
	$channels.forEach(function(current, index, array){
		if(current.class == _class || _class == '0'){
			resHtml += '<div class="chan" tabindex='+ index + " data-id=\"" + current._id  + '\"'  
				+ " data-position=\"" + _position + "\"" 
				+ 'style="background-image: url(\'' +$staticURL + 'tv/logo/'+ current._id + '.png\');">' 
				+ '</div>' ; 
			_position++;
		}
	})
	if(resHtml){
		$(".left").html(resHtml);
	} 
}
var $epg = {
	fillEpgAfter : function(_id){
			var _html = '';
			var  res = JSON.parse(window.sessionStorage["epgDayFromNow"]);
			if(res.length !== 0 ){
				res.slice(1).forEach( function( current, index){
					_html += '<div class="epgNext" tabindex="50" ' + ' data-position='+ index +
					'><span class="epgNextTitle">' + current.title+'</span></div>';
				})
				$(".epgFromNow").css("top","-400px");
				$(".epgFromNow").css("height",'500px');
			} else {
				_html += '<div class="epgNext" tabindex="50" ' 
				+ ' data-position=0><span class="epgNextTitle"></span></div>';
			}
			$(".epgFromNow").html(_html);
	},
	fillingEpgNowNext : function(_id){
		$.getJSON($api + "epg/" + _id + "/dayfromnow", function(res){
			window.sessionStorage["epgDayFromNow"] = JSON.stringify(res);
			if(res.length !== 0){
		 		document.querySelector(".epgNow").querySelector(".epgNowTitle").innerHTML = res[0].title;
				document.querySelector(".epgNext").querySelector(".epgNextTitle").innerHTML = res[1].title;

			} else {
				document.querySelector(".epgNow").querySelector(".epgNowTitle").innerHTML = "Нет программы телепередач";
				document.querySelector(".epgNext").querySelector(".epgNextTitle").innerHTML = "";
			}

		})			
	},
	drawTimeLine : function(_id){
		if(!_id) {
			var duration = $(".epgNowContent").attr("data-stop") -  $(".epgNowContent").attr("data-start");
			var gone = new Date().getTime() -  $(".epgNowContent").attr("data-start");
			$(".epgTimeLine").css("width", gone / duration * 100 + "%" );
		}
	}
}

function Block( element, direction ){
	this.element = element;
	this.direction = direction;
	this.father	;
	this.child=[];
	
	this.addChild = function(block){
		block.father = this;
		this.child.push(block);
	}
	this.focusFirst = function(){
		if(this.element.firstElementChild){
			console.log(this.element.firstElementChild);
			this.element.firstElementChild.focus();
		} else {
		}
	}

	this.focusNext = function(evntTarget){
		if(! (evntTarget  == this.element.lastElementChild) ){
			var _position = 1 + parseInt(evntTarget.getAttribute("data-position"));
			this.element.querySelector("[data-position=\"" + _position + "\"]").focus();
		}
	}
	this.focusPrev = function(evntTarget){
		if(!(evntTarget == this.element.firstElementChild)){
			var _position = parseInt(evntTarget.getAttribute("data-position")) -1 ;
			this.element.querySelector("[data-position=\"" + _position + "\"]").focus();
		} else {
			this.hideBlock();
		}
	}
	this.focusOnFather = function(){
		if(this.father.element.style.visibility == "visible"){
			this.father.focusFirst();
		} else {
			this.father.focusOnFather();
		}
	}
	
	this.hideBlock = function (args){
		var _position = this.element.getAttribute("data-position");
		if(_position && this.father.element.style.visibility == "visible"){
			this.father.element.querySelector("[data-position=\"" + _position + "\"]").focus();
			this.element.removeAttribute("data-position");
		} else {
			this.focusOnFather();
			
		}
		this.element.style.visibility = "hidden";
	}

	this.displayChild = function (evntTarget, indexChild, blabla, blablabla){
		if(this.child[0] ){
			var _position = evntTarget.getAttribute("data-position");
			this.child[0].element.setAttribute("data-position",_position);
			this.child[0].prepareContent(evntTarget);
			this.child[0].element.style.visibility = "visible";
			this.child[0].focusFirst();
		}
	}
	this.customAction = function(evntTarget, bla, bla)	{}
	this.prepareContent = function(evntTarget, bla, bla)	{}
	this.select = function(evntTarget)	{}
}

var html = new Block($("html")[0],"row");
	html.hideBlock = function(){}
	html.displayChild = function(){
		this.child[0].element.style.visibility = "visible"; 
		this.child[0].focusFirst();
	}
	html.focusPrev = function(){}


var header 	= new Block($(".header")[0], "row");
	header.hideBlock = function(args){
		this.element.style.visibility = "hidden";
		$("body").focus();
	}
	header.displayChild = function(evntTarget){
		if(this.child[0] ){ 
				this.child[0].child[0].element.style.visibility = "visible"; 
				this.child[0].child[0].focusFirst();
				var _position = evntTarget.getAttribute("data-position");
				this.child[0].element.setAttribute("data-position",_position);
			}
	}

var left 	= new Block($(".left")[0], "column");
	left.customAction = function (evntTarget, bla, bla){
		if(this.father){
				var _position = this.element.getAttribute("data-position");
				this.father.element.style.visibility = "visible";
				if( _position ){
					this.father.element.querySelector("[data-position='"+ _position +"']").focus();
				} else {
				this.father.focusFirst();
			}
			}
	}
	left.prepareContent = function(evntTarget){
		var _class = evntTarget.getAttribute("data-id");
		drawList(_class);
	}
	left.select = function(_eventTarget){
		if(_eventTarget) {
			$play.load($edge + _eventTarget.getAttribute("data-id") + ".m3u8");
		}
	}

var genres 	= new Block($(".genres")[0], "column");
var footer 	= new Block($(".footer")[0], "row");
	footer.prepareContent = function(evntTarget, bla, bla){
		var _elem = document.querySelector(".chan[data-position='" 
				+ $(".footer").attr("data-position")+ "']" )
		$epg.fillingEpgNowNext(_elem.getAttribute("data-id"));
	}
var epgFromNow = new Block($(".epgFromNow")[0],"column");
	epgFromNow.prepareContent = function(evntTarget, bla, bla){
		var _elem = document.querySelector(".chan[data-position='" 
				+ $(".footer").attr("data-position")+ "']" )
		$epg.fillEpgAfter(_elem.getAttribute("data-id"));
	}
	epgFromNow.hideBlock = function(args){
		//сузить epgFromNow
		$(".epgFromNow").css("height","100%");
		$(".epgFromNow").css("top","0px");
		//убрать лишнее
		this.element.innerHTML = '<div class="epgNext" tabindex="21" data-position="2">' 
		+ '<span class="epgWhen"> Далее: </span>' 
		+ '<span class="epgNextTitle"></span></div>';
		var  res = JSON.parse(window.sessionStorage["epgDayFromNow"]);
		if(res.length !== 0){
			document.querySelector(".epgNext").querySelector(".epgNextTitle").innerHTML = res[1].title;			
		}
		//focus on epgAfter
		var _position = this.element.getAttribute("data-position");
			if(_position && this.father.element.style.visibility == "visible"){
				this.father.element.querySelector("[data-position=\"" + _position + "\"]").focus();
				this.element.removeAttribute("data-position");
			} else {
				this.focusOnFather();
			}
			this.element.style.visibility = "inherit";
	}

html.addChild(header);
header.addChild(genres);
genres.addChild(left);
left.addChild(footer);
footer.addChild(epgFromNow);






