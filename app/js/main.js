var $ARROW_LEFT=37, 
	$ARROW_TOP=38, 
	$ARROW_RIGHT=39, 
	$ARROW_DOWN=40, 
	$ENTER=13,
 $staticURL = '',
 $pack = '',
 $channels = {
 	sort : function(type){
 		var arr;
 		if (type === "rating"){
 			arr = $channels.rating;
 		} else if (type == "cable"){
 			arr = $channels.cable;
 		}
 		this.chans.sort(function( a , b ){
 			if ( arr.indexOf(a) && arr.indexOf(b) ) {
 				return arr.indexOf(a.id) - arr.indexOf(b.id);
 			} else {
 				return 0;
 			}
 		})
 	},
 	chans : [] ,
 	rating : [] ,
 	cable : []
 },
 $epgNowAll = {},
 $cats = []
 ;


hideAll = function(){
	$(".left").addClass("hidden");
	$(".footer").addClass("hidden");
	$(".genres").addClass("hidden");
	$(".header").addClass("hidden");
	$(".wrapper").addClass("hidden");
	$(".epgProgramInfo").addClass("hidden");
	$("body").focus();
}
showGenres = function(opt){
	if(opt){
		$(".left").addClass("withGenres");
		$(".genres").addClass("showGenres");
		$(".genres").trigger("getAllEpgNow");
	} else {
		$(".left").removeClass("withGenres");
		$(".genres").removeClass("showGenres");
	}
}


$(document).ready(function(){
	$.getJSON($api + "list.json",function (data){
		
		$edge = data.edge;
		$staticURL = data.img;
		$channels.chans = data.list.slice();
		$pack = data.pack;
		data.list.forEach(function(cur, index){
			$channels.cable.push(cur.id)

		})

		$.getJSON($api + "list/rating/" + data.pack, function(res){
			$channels.rating = res;
			if ($("#switchByRating").prop("checked")) {
				// $channels.sortRating();
				$(".left").trigger("sortByRating");
			}	
		})
		
		$(".genres").trigger("getAllEpgNow");
		$play.init();
	});
});
$(document).ready(function(){
	$.getJSON($api + 'categories.json', function(res){
		if(!res){
			return;
		}
		$cats = res;
		$cats[0][0] = 'Без жанра';
		$(".genreslist").append('<div class="genre" tabindex=1' + ' data-id=-1' + ' data-position=-1' + '><span>'
			+ "Все" + '</span></div>');
		$cats.forEach(function(val , index){
			$(".genreslist").append('<div class="genre" tabindex='+ index + ' data-id=' + index + ' data-position=' + index + '><span>'
			+ val[0] + '</span></div>');
		});
	})
})
// setTimeout(console.log($epgNowAll), 10000);
// console.log($epgNowAll);
//sort by genres
// $(document).ready(function(){
// 	console.log($channels);
// 	$channels.forEach(function(current, index){
// 		$.getJSON($api + 'epg/'+ current.id + '/now', function(res){
// 			$epgNowAll[current.id] = res;
// 			console.log($epgNowAll);
// 		})
// 	})
// })
// $(".logs").append('height: ' + window.screen.height);
// $(".logs").append('width: ' + window.screen.width);
// $(".logs").append('device pixel ratio: ' + window.devicePixelRatio);
// $(".logs").append('device pixel depth: ' + window.screen.pixelDepth);




							//Event listeners
$(".genre").on("click", function(){
	drawList($(this).attr("data-id"));
})

$(".genres").on("getAllEpgNow", function(){
	$.getJSON($api + "epg/now" , function(res){
		$epgNowAll = res;
	})
})
//testing
$(".left").on("sortByRating", function(){
	console.log("custom event sortByRating");
	$channels.sort("rating");
})
//testing
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
// $("#myswitch").on('click', function(){
// 	// console.log($(this));
// 	if( $(this).prop('checked') ){
// 		alert('checked');
// 	}
// })
$(".footer").on("click",".epgNext",  function(){
	$programInfo.prepareContent($(this).attr("data-position"));
			$(".epgProgramInfo").attr("data-position", $(this).attr("data-position"));
			$(".epgProgramInfo").removeClass("hidden");
})
$(".epgProgramInfo").on("click", function(){
			$(".epgProgramInfo").addClass("hidden");
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
$(".sort").on("keydown",".sorttype", function(event){
	switch (event.keyCode) {
		case $ENTER:
			event.stopPropagation();
			if($(this).children().first().prop("disabled")){
				return;
			}
			if( $(this).children().first().is(":checked") ) {
				$(this).children().first().prop("checked", false);
			} else {
				$(this).children().first().prop("checked", true);
			}
			$(this).children().first().trigger("change");
			break;

		case $ARROW_LEFT:
			break;

		case $ARROW_TOP:
			event.stopPropagation();
			if( $(this).prev().length == 0 ) {
				$(".logo").focus() ;
			} else {
				$(this).prev().focus();
			}
			break;

		case $ARROW_RIGHT:
			$(".chan").first().focus();
			showGenres(false);
			break;

		case $ARROW_DOWN:
			event.stopPropagation();
			console.log($(this));
			if( $(this).next().length !== 0) {
				$(this).next().focus();
			} else {
				console.log("else");
				$(".genre").first().focus();
			}
			break;

		default:
		break;	
	}
})

$("#switchByRating").on("change", function(){
	if( $(this).prop("checked") ){
		console.log("$channels sort by rating");
		$channels.sort("rating")
	} else {
		$channels.sort("cable");
		console.log("$channels sort by cable");
	}
});

$(".genres").on("keydown", ".genre",  function(event){
	event.stopPropagation();
	switch (event.keyCode){
		
		case $ARROW_LEFT:
			break;
		
		case $ARROW_TOP:
			if($(this).prev().length !== 0) {
				$(this).prev().focus();
			} else {
				// showGenres(false);
				// $(".logo").focus() ;
				console.log("jump to sort");
				$(".sort").children().last().focus();
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

		case $ARROW_DOWN:
			event.preventDefault();
			break;
		case $ENTER:
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