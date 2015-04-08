var $edge;
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
		console.log("returned channel = " + channel);
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
			this.element.firstElementChild.focus();
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
	this.customAction = function(evntTarget, bla, bla){
		
	}
	this.prepareContent = function(evntTarget, bla, bla){}
	this.select = function(evntTarget){}
}

var $epg = {
	createEpgWidget : function(_id){
		var channel = getChannelById(_id);
		var date = new Date().toISOString().substring(0,10);
		var logoDiv =  '<div class="epgChanImg" '+ 
			'style="background-image: url(\'' +$staticURL + 'tv/logo/'+ _id + '.png\'); "></div>';
		var title = '<div class="epgChanName">'+  channel.title  +'</div>';
		$(".epgTitle").html(logoDiv + title);
		$.getJSON($apiURL + "epg/day/"+ date +'/'+ channel.epg, function(response){
			if(response.length == 0){
				$(".epgEvents").html("<span> Нет программы телепередач</span>");
				return;
			}
			var epgEvents = "";
			for (var elem=0; elem < response.length; elem ++){
				epgEvents += '<div class="epgDayEvent"  tabindex=' + elem + '>' + '<div class="epgEventTime">'  
				+  new Date(response[elem].start).getHours() + ":"
				+  new Date(response[elem].start).getMinutes() 
				+  '</div><span>' 
				+  response[elem].lang.ru.title + '</span></div>';
			}
			$(".epgEvents").html(epgEvents);
			$(".epgDay").css("visibility", "visible");
		})
	},
	fillingEpgNowNext : function(_id){
		var channel = getChannelById(_id);
		var date = new Date();
		$.getJSON($apiURL + "epg/day/"+ date.toISOString().substring(0,10) +'/'+ channel.epg, function(response){
			if(response.length == 0){
				$(".epgNow").html("<span> Нет программы телепередач</span>");
				$(".epgNext").html("");
				return;
			}
			var telecast=0;
			for( ; telecast < response.length ; ){
				if( response[telecast].start < date.getTime() && response[telecast].stop > date.getTime()){
					break;
			} else {
				 telecast++;
			}
			};
			$(".epgNow").attr( {"data-start":response[telecast].start, "data-stop":response[telecast].stop} );
			// $(".epgNextContent").attr( {"data-stop":response[telecast].start, "data-stop":response[telecast].stop} );
			$(".epgNow").html("<span>" + response[telecast].lang.ru.title + "</span>");
			$(".epgNext").html("<span>" + response[++telecast].lang.ru.title + "</span>");
			$epg.drawTimeLine();	
		
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




var html = new Block($("html")[0],"row");
var header 	= new Block($(".header")[0], "row");
var left 	= new Block($(".left")[0], "column");
var genres 	= new Block($(".genres")[0], "column");
var footer 	= new Block($(".footer")[0], "row");
var epgDay = new Block($(".epgDay")[0],"column");

html.addChild(header);
header.addChild(genres);
genres.addChild(left);
left.addChild(footer);
footer.addChild(epgDay);

html.hideBlock = function(){}

html.displayChild = function(){
	console.log(this.child[0]);
	this.child[0].element.style.visibility = "visible"; 
	this.child[0].focusFirst();
}

html.focusPrev = function(){}

header.hideBlock = function(args){
	this.element.style.visibility = "hidden";
	$("body").focus();
}

header.displayChild = function(evntTarget){
	if(this.child[0] ){ 
			this.child[0].child[0].element.style.visibility = "visible"; 
			this.child[0].child[0].focusFirst();
			var _position = evntTarget.getAttribute("data-position");
			// console.log(_position);
			this.child[0].element.setAttribute("data-position",_position);
		}
}

left.customAction = function (evntTarget, bla, bla){
	if(this.father){
			console.log("has a father");
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


epgDay.prepareContent = function(evntTarget, bla, bla){
	var _elem = document.querySelector(".chan[data-position='" 
			+ $(".footer").attr("data-position")+ "']" )
	$epg.createEpgWidget(_elem.getAttribute("data-id"));
}

footer.prepareContent = function(evntTarget, bla, bla){
	var _elem = document.querySelector(".chan[data-position='" 
			+ $(".footer").attr("data-position")+ "']" )
	$epg.fillingEpgNowNext(_elem.getAttribute("data-id"));
}

