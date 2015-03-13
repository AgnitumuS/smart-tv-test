//var XMLHttpRequest = require('xhr2')
var apiURL = "http://tvapi.la.net.ua/";

function handler(){
	var response = JSON.parse(this.responseText);
	var inner;
	inner = response.list[0]["_id"];
	for(i =0 ; i<response.list.length; i++){
		inner += response.list[i]._id + "<br>";
	}
	window.document.getElementById("test").innerHTML = inner;

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
document.getElementById("test").style["background-image"] = "http://static.lanet.ua/tv/logo/9032.png";


getTVAPI(apiURL + "list.json");
//Event Listeners
document.getElementById("test").addEventListener("click", function(){
	alert("event Listener");
});