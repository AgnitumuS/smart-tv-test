
var $apiURL = "http://tvapi.la.net.ua/";
var $staticURL = "http://static.la.net.ua/";
var $edge;



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
			for( i=0 ; i<data.list.length ; i++){
				var tabindex = 1;
			$(".left").append('<div class="chan" tabindex='+ tabindex++ + " data-id=\"" + data.list[i]._id  + '\"'  
				+  'style="background-image: url(\'' +$staticURL + 'tv/logo/'+ data.list[i]._id + '.png\');">' 
				+ '</div>');
		};});
});



/*  resize screen	*/
			 $("#iPlayer").attr({
			 	"width": document.documentElement.clientWidth, 
			 	"height":document.documentElement.clientHeight
			 });
/*   -- resize screen --*/

												//Event Listeners

		/*  -- On click event handler - change source videoplayer--*/
	$(".left").on("click",".chan",  function(){
		console.log("clicked");
		var playlist = $edge + $(this).attr('data-id') + '.m3u8';
		$play.load(playlist);
	});




		/* -- On click show/hide channel panel --*/
	$("#iPlayer").on('click',function(){
		var visible = $(".left").css("visibility");
		//$(".child").css("visibility","visible");
		if(visible=="hidden"){
			$(".left").css('visibility','visible');
		} else {
			$(".left").css('visibility','hidden');
		}
	})

	/* -- -react to the left/right key  to hide/show channel menu ---*/
	document.addEventListener("keydown", function(event){
		//           show / hide menu
		if(event.keyCode == "0x25") $(".left").css('visibility','hidden');
		if(event.keyCode == "0x27") $(".left").css('visibility', 'visible');
		//for keyboard down
		if(event.keyCode == "40") document.getElementsByClassName('chan')[0].focus();
		//for control panel
		if(event.keyCode == "0x28") document.getElementsByClassName('chan')[0].focus();
		//for control panel select\enter



	})
