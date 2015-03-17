
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

// var $play = {
// 	init : function (){

// 	},
// 	load : function (){

// 	}
// }
//document.getElementById("test").style["background-image"] = "http://static.lanet.ua/tv/logo/9032.png";

/* start jquery when web page is loaded */
// function buildChannels(data, status, xhr){
// 	for( i=0 ; i<data.list.length ; i++){
// 		$("#flex-main").append('<div class="flex-item"> 1 </div>')
// 	};
// }

//$(document).ready(function(){
$.getJSON($apiURL + "list.json",function(data){
		$edge = data.edge;
		alert($edge);
		for( i=0 ; i<data.list.length ; i++){
			// var input = '<div class="flex-chan"' + " data-id=\"" + data.list[i]._id  + '\"' +  'style="background-image: url(\'' +$staticURL + 'tv/logo/'+ data.list[i]._id + '.png\');"'+ '</div>';
			// console.log(input);
		$(".child").append('<div class="chan"' + " data-id=\"" + data.list[i]._id  + '\"'  
			+  'style="background-image: url(\'' +$staticURL + 'tv/logo/'+ data.list[i]._id + '.png\');">' 
			+ '</div>');
	};})
	
//})

//getTVAPI($apiURL + "list.json");
//Event Listeners
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
			// document.write($(document).width()) + "\n ";
			// $("#iPlayer").attr({
			// 	"width": document.documentElement.clientWidth, 
			// 	"height":document.documentElement.clientHeight
			// });
/*   -- resize screen --*/


	$(".flex-chans").on("click",'.flex-chan', function(){
		
		//this.innerHTML = "OOOPS";	//debug
		//alert($(this).attr('data-id'));	//debug
		var playlist = $edge + $(this).attr('data-id') + '.m3u8';
		$("#iPlayer").attr("src", playlist);
		//alert(this);
	})	

