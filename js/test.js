
var $apiURL = "http://tvapi.la.net.ua/";
var $staticURL = "http://static.la.net.ua/";
var $edge;

function handler(){
	var response = JSON.parse(this.responseText);
	var inner;
	inner = response.list[0]["_id"];
	for(i =0 ; i<response.list.length; i++){
		inner += response.list[i]._id + "<br>";
	}
	//url(//static.lanet.ua/tv/logo/9032.png)
}

function getTVAPI(url) {
	var xmlHttp = new XMLHttpRequest();
	xmlHttp.open("GET", url, true);
	xmlHttp.onload = handler;			//callback
	xmlHttp.send(null);

}

var $play = {
	init : function (){

	},
	load : function (){

	}
}


$(document).ready(function(){
	$.getJSON($apiURL + "list.json",function(data){
			$edge = data.edge;
			for( i=0 ; i<data.list.length ; i++){
				var tabindex = 1;
			$(".child").append('<div class="chan" tabindex='+ tabindex++ + " data-id=\"" + data.list[i]._id  + '\"'  
				+  'style="background-image: url(\'' +$staticURL + 'tv/logo/'+ data.list[i]._id + '.png\');">' 
				+ '</div>');
		};});
});

//getTVAPI($apiURL + "list.json");
//
// $(document).ready(function(){
// 	var elems = document.getElementsByClassName("flex-item");
// 	for(i=0; i<elems.length;i++){
// 		elems[i].addEventListener("click", function(){
// 			alert("event Listener")
// 		});
// }
// })

/*  resize screen	*/
			// alert($(document).width()) + "\n ";
			// $("#iPlayer").attr({
			// 	"width": document.documentElement.clientWidth, 
			// 	"height":document.documentElement.clientHeight
			// });
/*   -- resize screen --*/

												//Event Listeners

		/*  -- On click event handler - change source videoplayer--*/
	$(".child").on("click",".chan",  function(){
		console.log("clicked");
		var playlist = $edge + $(this).attr('data-id') + '.m3u8';
		$("#iPlayer").attr("src", playlist);
	});

	$(".child").on("focus",".chan", function(){
		this.addEventListener("keydown", function(event){
			if(event.keyCode == "0x0D") alert ("49 is pressed when on focus");
		})
	})

//	-- increase switch channel speed
// $(document).ready(function(){
// 	var chanels = document.getElementsByClassName('chan');
// 	console.log("channels.length:" + chanels.length);
// 	for (i = 0 ; i < chanels.length ; i ++){
// 		chanels[i].addEventListener("click", function(){
// 			var playlist = $edge + $(this).attr('data-id') + '.m3u8';
// 			console.log($edge + $(this).attr('data-id') + '.m3u8');
// 			// document.getElementById('playlist').src = playlist;
// 			$("#iPlayer").attr("src", playlist);
// 		}) 	
// 	}
// })
		/* -- On click show/hide channel panel --*/
	$("#iPlayer").on('click',function(){
		var visible = $(".child").css("visibility");
		//$(".child").css("visibility","visible");
		if(visible=="hidden"){
			$(".child").css('visibility','visible');
		} else {
			$(".child").css('visibility','hidden');
		}
	})

	/* -- -react to the left/right key  to hide/show channel menu ---*/
	document.addEventListener("keydown", function(event){
		//           show / hide menu
		if(event.keyCode == "0x25") $(".child").css('visibility','hidden');
		if(event.keyCode == "0x27") $(".child").css('visibility', 'visible');
		//for keyboard down
		if(event.keyCode == "40") document.getElementsByClassName('chan')[0].focus();
		//for control panel
		if(event.keyCode == "0x28") document.getElementsByClassName('chan')[0].focus();
		//for control panel select\enter



	})
