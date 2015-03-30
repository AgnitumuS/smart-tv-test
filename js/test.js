var $ARROW_LEFT=37, $ARROW_TOP=38, $ARROW_RIGHT=39, $ARROW_DOWN=40;
var $apiURL = "http://tvapi.la.net.ua/";
var $staticURL = "http://static.la.net.ua/";
var $edge;
var $channels = [];

function getChannelById(_id){

	for(var i = 0; i < $channels.length; i++){
			if($channels[i]._id == _id) 
				channel = $channels[i];
		}
		return channel;
}

var $play = {
	init : function (){
		var playlist = 'http://kirito.la.net.ua/tv/9006.m3u8';
		$("#iPlayer").attr('src', playlist);
	},
	load : function (playlist){
		$('#iPlayer').attr('src', playlist);
	}
}


$(document).ready(function(){
	$.getJSON($apiURL + "list.json",function(data){
		$edge = data.edge;
		$channels = data.list.slice();
		for( i=0 ; i<data.list.length ; i++){
			var tabindex = 1;
			$(".left").append('<div class="chan" tabindex='+ tabindex++ + " data-id=\"" + data.list[i]._id  + '\"'  
				+ 'style="background-image: url(\'' +$staticURL + 'tv/logo/'+ data.list[i]._id + '.png\');">' 
				+ '</div>');
		};});
});


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
				epgEvents += '<div class="epgDayEvent">' + '<div class="epgEventTime">'  
				+  new Date(response[elem].start).getHours() + ":"
				+  new Date(response[elem].start).getMinutes() 
				+  '</div><span>' 
				+  response[elem].lang.ru.title + '</span></div>';
			}
			$(".epgEvents").html(epgEvents);
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
												/*  resize screen	*/
 $("#iPlayer").attr({
 	"width": document.documentElement.clientWidth, 
 	"height":document.documentElement.clientHeight
 });

												/* Event Listeners */

		/*  -- On click event handler - change source videoplayer--*/
$(".left").on("click",".chan",  function(){
	console.log("clicked");
	var playlist = $edge + $(this).attr('data-id') + '.m3u8';
	$play.load(playlist);
	$epg.fillingEpgNowNext($(this).attr('data-id'));
	$(".footer").css("visibility","visible");
});

$("#iPlayer").on('click',function(){
	var visible = $(".left").css("visibility");
	if(visible=="hidden"){
		$(".left").css('visibility','visible');
	} else {
		$(".left").css('visibility','hidden');
	}
})

window.addEventListener("keydown", function(event){
	// $(".logs").append(event.target.className + "\n");
	switch (event.target.className){
		case "chan":
			switch (event.keyCode){
				
				case $ARROW_DOWN: 								//switch to the next channel							
					console.log('switch next channel');
					var next = event.target.nextSibling;
					if(next == null) {
						next = document.querySelector(".left").firstChild;
					}
					var playlist = $edge + next.getAttribute('data-id') + '.m3u8';
					$play.load(playlist);
					$epg.createEpgWidget(next.getAttribute('data-id'));
					$epg.fillingEpgNowNext(next.getAttribute('data-id'));
					next.focus();	
				break;
				
				case $ARROW_TOP: 								//switch previous channel
					console.log('switch previous channel');
					 var prev = event.target.previousSibling;
					 if(prev == null){
					 	prev = document.querySelector(".left").lastChild;
					 }
					var playlist = $edge + prev.getAttribute('data-id') + '.m3u8';
					$play.load(playlist);
					$epg.createEpgWidget(prev.getAttribute('data-id'));
					$epg.fillingEpgNowNext(prev.getAttribute('data-id'));
					prev.focus();
				break;
				
				case $ARROW_RIGHT: 								//show channel info and epg
					console.log('show channel info ');
					//filling the div with content
					$epg.createEpgWidget(event.target.getAttribute('data-id'));
					var block = document.querySelector(".epgDay");
					block.style.visibility = 'visible';
				break;

				case $ARROW_LEFT: 								//hide epg or channel menu
					var targetToHide;
					if($(".epgDay").css("visibility") == 'visible') { 
						targetToHide = document.querySelector(".epgDay");
					} else if ($(".left").css("visibility") == 'visible' ) {
						targetToHide = document.querySelector("div.left");
					};
					if(targetToHide) targetToHide.style.visibility = 'hidden'; 
					document.querySelector(".body").focus();
					event.stopPropagation();
				break;
			}
		break;

		case "body":
			switch (event.keyCode){
				case $ARROW_RIGHT: 								// show channel menu
					$(".left").css('visibility', 'visible');
					$(".footer").css('visibility', 'visible');
					document.querySelector('.chan').focus();
				break;
				case $ARROW_LEFT: 								// hide channel menu
					$(".left").css('visibility','hidden');
					$(".footer").css('visibility', 'hidden');
				break;
			}
		break;
	
		default:
			console.log('this is default, keyCode = ' + event.keyCode);
		break;
	}
})
