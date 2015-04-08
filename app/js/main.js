var $ARROW_LEFT=37, $ARROW_TOP=38, $ARROW_RIGHT=39, $ARROW_DOWN=40, $ENTER=13;
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



window.addEventListener("keydown", function(event){
	var _triggered ;
	console.log(event);
	// $(".logs").append('<span>  ' + event.target + "  "+ event.target.className + ' ,<span>');
	switch (event.target.parentNode){
		case html.element:
			console.log("html.element");
			console.log(html);
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
				case $ENTER:
					// $play.load();
					_triggered.select(event.target);
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
				case $ENTER:
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

for(var iter = 0; iter < $classes.length;iter++){
	$(".genres").append('<div class="genre" tabindex='+ iter + ' data-id='+ $classes[iter].id+  ' data-position=' + iter + '>'+$classes[iter].caption + '</div>')
}
 $("#iPlayer").attr({
 	"width": document.documentElement.clientWidth, 
 	"height":document.documentElement.clientHeight
 });

$(document).ready(function(){
	$.getJSON($apiURL + "list.json",function(data){
		$edge = data.edge;
		$channels = data.list.slice();
		for( i=0 ; i<data.list.length ; i++){
			var tabindex = 1;
			$(".left").append('<div class="chan" tabindex='+ tabindex++ + " data-id=\"" + data.list[i]._id  + '\"'  
				+ " data-position=\"" + i + "\"" 
				+ 'style="background-image: url(\'' +$staticURL + 'tv/logo/'+ data.list[i]._id + '.png\');">' 
				+ '</div>');
		};});
});

$(".genre").on("click", function(){
	drawList($(this).attr("data-id"));
})
$(".epgNext").on("click", function(){
	var _elem = document.querySelector(".chan[data-position='" 
			+ $(".footer").attr("data-position")+ "']" )
	$epg.createEpgWidget(_elem.getAttribute("data-id"));
})

$(".left").on("click",".chan",  function(){
	console.log("clicked");
	var playlist = $edge + $(this).attr('data-id') + '.m3u8';
	$play.load(playlist);
	
});

$(document).on("click", function(event){
	console.log(event);
})
$(".epgDay").on("click",function(){
	$(this).css("visibility","hidden");
})
$("#iPlayer").on("click", function(){
	if($(".header").css("visibility") == "visible"){
		$(".header").css("visibility", "hidden");
		$(".left").css("visibility","hidden");
		$(".footer").css("visibility","hidden");
		$(".genres").css("visibility","hidden");
	} else {
		$(".header").css("visibility", "visible");
		$(".left").css("visibility","visible");
	}

})
