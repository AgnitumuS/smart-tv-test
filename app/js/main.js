var $ARROW_LEFT=37, 
	$ARROW_TOP=38, 
	$ARROW_RIGHT=39, 
	$ARROW_DOWN=40, 
	$ENTER=13,
 $tvApi = "http://tvapi.la.net.ua/",
 $staticURL = "http://static.la.net.ua/",
 $edge = '',
 $channels = [],
 $classes = [
	{"id": 0,"caption": "Всё"},
	{"id": 1,"caption": "Общее"	},
	{"id": 2,"caption": "Новости"	},
	{"id": 3,"caption": "Шоу"},
	{"id": 4,"caption": "Док. фильмы"},
	{"id": 5,"caption": "Фильмы"},
	{"id": 6,"caption": "Музыка"},
	{"id": 7,"caption": "Спорт"},
	{"id": 8,"caption": "Детям"}
];

hideAll = function(){
	$(".left").addClass("hidden");
	$(".footer").addClass("hidden");
	$(".genres").addClass("hidden");
	$(".header").addClass("hidden");
	$(".wrapper").addClass("hidden");
	$("body").focus();
}
showGenres = function(opt){
	if(opt){
		$(".left").addClass("withGenres");
		$(".genres").addClass("showGenres");
	} else {
		$(".left").removeClass("withGenres");
		$(".genres").removeClass("showGenres");
	}
}

//make content

for(var iter = 0; iter < $classes.length;iter++){
	$(".genres").append('<div class="genre" tabindex='+ iter + ' data-id='+ $classes[iter].id+  ' data-position=' 
		+ iter + '><span>'+$classes[iter].caption + '</span></div>')
}
 // $("#iPlayer").attr({
 // 	"width": document.documentElement.clientWidth, 
 // 	"height":document.documentElement.clientHeight
 // });

$(document).ready(function(){
	$.getJSON($tvApi + "list.json",function(data){
		$edge = data.edge;
		$channels = data.list.slice();
		for( i=0 ; i<data.list.length ; i++){
			var tabindex = 1;
			$(".left").append('<div class="chan" tabindex='+ tabindex++ + " data-id=\"" + data.list[i]._id  + '\"'  
				+ " data-position=\"" + i + "\"" 
				+ 'style="background-image: url(\'' +$staticURL + 'tv/logo/'+ data.list[i]._id + '.png\');">' 
				+ '</div>');
		};
		
	});
});

							//Event listeners
$(".genre").on("click", function(){
	drawList($(this).attr("data-id"));
})

$(".left").on("click",".chan",  function(){
	$play.load($(this));
	if(! $(".footer").hasClass("hidden") ) {
		$epg.showCards($(this));
	}
});
$(".genresHead").on("click", function(){
	showGenres(false);
})
$(".wrapper").on("click", function(){
	hideAll();
})
$("#iPlayer").on("click", function(){
	$(".wrapper").removeClass("hidden");
	$(".header").removeClass("hidden");
	$(".left").removeClass("hidden");
	$(".genres").removeClass("hidden");
})
setInterval(function(){
	$epg.drawTimeLine();
}, 10000);


$("body").on("keydown", function(event){
	console.log("key pressed on body");
	switch (event.keyCode){
		case $ARROW_DOWN:
			$(".wrapper").removeClass("hidden");
			$(".header").removeClass("hidden");
			$(".left").removeClass("hidden");
			$(".genres").removeClass("hidden");
			$(".logo").first().focus();
			break;
		default:
			console.log(event);
			break;
	}
})

$(".header").on("keydown",  function(event){
	event.stopPropagation();
	console.log("key pressed on header");
	switch (event.keyCode){
		case $ARROW_LEFT:
			$(".genres").removeClass("hidden");
			$(".genre").first().focus();
			break;
		case $ARROW_TOP:
			hideAll();
		break;
		case $ARROW_RIGHT:
			
			break;
		case $ENTER:
			break;
		case $ARROW_DOWN:
			console.log($(".chan:first"));
			$(".chan:first").focus();
			break;
		default:
			console.log(event);
		break;	
	}
});

$(".left").on("keydown", ".chan",  function(event){
	event.stopPropagation();
	console.log("key pressed on chan");
	switch (event.keyCode){

		case $ARROW_LEFT:
			$(".genres").removeClass("hidden");
			showGenres(true);
			$(".genre").first().focus();
			break;

		case $ARROW_TOP:
			if( $(this).prev().length == 0 ) {
				$(".logo").focus() ;
			} else {
				$(this).prev().focus();
			}
			break;

		case $ARROW_RIGHT:
			$(".footer").attr("data-position", $(this).attr("data-position"));
			$epg.showCards($(this));
			$(".footer").removeClass("hidden");
			break;

		case $ENTER:
			$play.load($(this));
			break;

		case $ARROW_DOWN:
			$(this).next().focus();
			break;

		default:
		break;	
	};
			
});

$(".genres").on("keydown", ".genre",  function(event){
	event.stopPropagation();
	console.log("key pressed on genre");
	switch (event.keyCode){
		
		case $ARROW_LEFT:
			break;
		
		case $ARROW_TOP:
			if($(this).prev().length !== 0) {
				$(this).prev().focus();
			} else {
				showGenres(false);
				$(".logo").focus() ;
			}
			break;

		case $ENTER:
		case $ARROW_RIGHT:
			$(".chan").first().focus();
			// $(".genres").addClass("hidden");
			showGenres(false);
			break;
		
		case $ARROW_DOWN:
			$(this).next().focus();
			break;
		default:
		break;	
	};
			
});
$(".genres").on("focus", ".genre", function(){
	if(! $(".genres").hasClass("showGenres")){
		showGenres(true);
	}
	drawList($(this).attr("data-id"));
})

$(".footer").on("keydown", ".epgNext",  function(event){
	event.stopPropagation();
	console.log("key pressed on footer");
	switch (event.keyCode){

		case $ARROW_LEFT:
			if( $(this).prev().length == 0 ) {
				console.log("true");
				$(".chan[data-position=" + $(".footer").attr("data-position")+ "]").focus() ;
				$(".footer").addClass("hidden");	
			} else {
				$(this).prev().focus();
			}
			break;

		case $ARROW_TOP:
			$(".chan[data-position=" + $(".footer").attr("data-position")+ "]").focus() ;
			$(".footer").addClass("hidden");
			break;

		case $ARROW_RIGHT:
			$(this).next().focus();
			break;

		case $ENTER:
		case $ARROW_DOWN:
			//prevent down scroll
			event.preventDefault();
			$programInfo.prepareContent($(this).attr("data-position"));
			$(".epgProgramInfo").attr("data-position", $(this).attr("data-position"));
			$(".epgProgramInfo").removeClass("hidden");
			$(".epgProgramContent").focus();
			break;
		default:
		break;	
	};
});
$(".epgProgramInfo").on("keydown", function(event){
	event.stopPropagation();
	switch (event.keyCode) {
		case $ARROW_TOP:
		case $ENTER:
			$(".epgNext[data-position=" + $(".epgProgramInfo").attr("data-position")+ "]").focus() ;
			$(this).addClass("hidden");
			break;
	}
})