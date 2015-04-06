var $ARROW_LEFT=37, $ARROW_TOP=38, $ARROW_RIGHT=39, $ARROW_DOWN=40;

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
	// this.hide = function(evntTarget){
	// 	this.element.visibility = "hidden";
	// }

	this.hideBlock = function (args){
		var _position = this.element.getAttribute("data-position");
		if(_position && this.father.element.style.visibility == "visible"){
			this.father.element.querySelector("[data-position=\"" + _position + "\"]").focus();
			this.element.removeAttribute("data-position");
		} else {
			this.focusOnFather();
			// if(this.father.style.visibility == "hidden"){
			// 	this.father.hideBlock();
			// } else {
			// this.element.firstElementChild.focus();
			// }
			// this.father.focusFirst();
		}
		this.element.style.visibility = "hidden";
	}

	this.displayChild = function (evntTarget, indexChild, blabla, blablabla){
		if(this.child[0] ){
			this.child[0].prepareContent(evntTarget);
			this.child[0].element.style.visibility = "visible"; 
			this.child[0].focusFirst();
			var _position = evntTarget.getAttribute("data-position");
			this.child[0].element.setAttribute("data-position",_position);
		}
	}
	this.customAction = function(evntTarget, bla, bla){
		
	}
	this.prepareContent = function(evntTarget, bla, bla){}
	
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
			// console.log(_position);
			this.child[0].element.setAttribute("data-position",_position);
		}
}
var left 	= new Block($(".left")[0], "column");
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
var genres 	= new Block($(".genres")[0], "column");
// genres.displayChild = function(evntTarget, bla, bla, bla ){}
var footer 	= new Block($(".footer")[0], "row");
var epgDay = new Block($(".epgDay")[0],"column");
epgDay.prepareContent = function(evntTarget, bla, bla){
	var _elem = document.querySelector(".leftContent[data-position='" 
			+ $(".footer").attr("data-position")+ "']" )
	$epg.createEpgWidget(_elem.getAttribute("data-id"));
}
// epgDay.focusFirst = function(evntTarget, bla, bla){
// 	this.element.
// }

html.addChild(header);
header.addChild(genres);
genres.addChild(left);
left.addChild(footer);
footer.addChild(epgDay);


window.addEventListener("keydown", function(event){
	var _triggered ;
	console.log(event.target);
	switch (event.target.parentNode){
		case html.element:
			console.log("html.element");
			_triggered = html;
			break;
		case header.element:
			console.log("header.element");
			_triggered = header;
			break;
		case left.element:
			console.log("left.element");
			_triggered = left;
			break;
		case footer.element:
			console.log("footer.element");
			_triggered = footer;
			break;
		case genres.element:
			console.log("genres.element");
			_triggered = genres;
			break;
		case epgDay.element:
			console.log("epgDay.element");
			_triggered = epgDay;
			break;
		default:
			console.log(event.target);
			break;
	}

	
	if(_triggered){


		if( _triggered.direction == "column" ){
			switch (event.keyCode){
				case $ARROW_LEFT:
					// _triggered.hideBlock(event.target);
					// _triggered.displaySecondChild(event.target);					
					// display parent
					_triggered.customAction(event.target);
				break;

				case $ARROW_TOP:
					_triggered.focusPrev(event.target);
				break;
				case $ARROW_RIGHT:
					_triggered.displayChild(event.target);
				break;
				case $ARROW_DOWN:
					_triggered.focusNext(event.target);
				break;
				default:
				break;	
			};

		} else if (	_triggered.direction == "row" ) {
			switch (event.keyCode){
				case $ARROW_LEFT:
					_triggered.focusPrev(event.target);
				break;
				case $ARROW_TOP:
					_triggered.hideBlock(event.target);
				break;
				case $ARROW_RIGHT:
					_triggered.focusNext(event.target);
				break;
				case $ARROW_DOWN:
					_triggered.displayChild(event.target);
				break;
				default:
				break;	
			};

		};

	}

})


//make content
var $apiURL = "http://tvapi.la.net.ua/";
var $staticURL = "http://static.la.net.ua/";
var $edge;
var $channels = [];
var $classes = [
	{
		"id": 0,
		"caption": "my TV"
	},
	{
		"id": 1,
		"caption": "общее"
	},
	{
		"id": 2,
		"caption": "новости"
	},
	{
		"id": 3,
		"caption": "шоу"
	},
	{
		"id": 4,
		"caption": "Док. фильмы"
	},
	{
		"id": 5,
		"caption": "Фильмы"
	},
	{
		"id": 6,
		"caption": "Музыка"
	},
	{
		"id": 7,
		"caption": "Спорт"
	},
	{
		"id": 8,
		"caption": "Детям"
	}
];

for(var iter = 0; iter < $classes.length;iter++){
	$(".genres").append('<div class="genre" tabindex='+ iter + ' data-id='+ $classes[iter].id+  ' data-position=' + iter + '>'+$classes[iter].caption + '</div>')

}

function drawList(_class){
	var resHtml = '';
	var _position = 0;
	$channels.forEach(function(current, index, array){
		if(current.class == _class || _class == '0'){
			resHtml += '<div class="leftContent" tabindex='+ index + " data-id=\"" + current._id  + '\"'  
				+ " data-position=\"" + _position + "\"" 
				+ 'style="background-image: url(\'' +$staticURL + 'tv/logo/'+ current._id + '.png\');">' 
				+ '</div>' ; 
			_position++;
		}
	})
		$(".left").html(resHtml);
}

$(".genre").on("click", function(){
	drawList($(this).attr("data-id"));
})
$(".epgNext").on("click", function(){
	var _elem = document.querySelector(".leftContent[data-position='" 
			+ $(".footer").attr("data-position")+ "']" )
	$epg.createEpgWidget(_elem.getAttribute("data-id"));
})

$(document).ready(function(){
	$.getJSON($apiURL + "list.json",function(data){
		$edge = data.edge;
		$channels = data.list.slice();
		for( i=0 ; i<data.list.length ; i++){
			var tabindex = 1;
			$(".left").append('<div class="leftContent" tabindex='+ tabindex++ + " data-id=\"" + data.list[i]._id  + '\"'  
				+ " data-position=\"" + i + "\"" 
				+ 'style="background-image: url(\'' +$staticURL + 'tv/logo/'+ data.list[i]._id + '.png\');">' 
				+ '</div>');
		};});
});

/////////epg

function getChannelById(_id){
	var channel;
	for(var i = 0; i < $channels.length; i++){
			if($channels[i]._id == _id) 
				channel = $channels[i];
		}
		console.log("returned channel = " + channel);
		return channel;
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
				$(".epgNowContent").html("<span> Нет программы телепередач</span>");
				$(".epgNextContent").html("");
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
			$(".epgNowContent").attr( {"data-start":response[telecast].start, "data-stop":response[telecast].stop} );
			// $(".epgNextContent").attr( {"data-stop":response[telecast].start, "data-stop":response[telecast].stop} );
			$(".epgNowContent").html("<span>" + response[telecast].lang.ru.title + "</span>");
			$(".epgNextContent").html("<span>" + response[++telecast].lang.ru.title + "</span>");
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
///////epg