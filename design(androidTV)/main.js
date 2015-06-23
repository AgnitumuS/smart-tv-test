var $api = 'http://api.lanet.tv/',
	$allEpgNow ,
	$static = 'http://kirito.la.net.ua/tv/';
	$staticLogo = 'http://static.lanet.ua/tv/'


swfobject.embedSWF('./live.swf', "iPlayer", '100%', '100%', '11', null, null, {
						allowScriptAccess: 'always',
						bgcolor: '#000000',
						wmode: 'opaque',
						 });
var play = {
	init: function(){
		this.flash =  document.getElementById('iPlayer');
		this.flash.set({ url : "http://kirito.la.net.ua/tv/9002.m3u8" , scale: "16:9"});

	},
	play: function(){
		this.flash.set({ url : "http://kirito.la.net.ua/tv/9002.m3u8" , scale: "16:9"});
	}
}

function onPlayerEvent(e, data) {
	switch(e) {
		case 'ready':
			console.log("ready");
			play.init();
			// var flash = document.getElementById('iPlayer');
			// flash.set({ url : "http://kirito.la.net.ua/tv/9089.m3u8" , scale: "16:9"});
			break;
		case 'error':
			console.log(data);
			break;
	}
}

function showChans(){
	$.getJSON($api + "epg/now", function(res){
		$allEpgNow = res;
		$.getJSON($api + "list.json",function (data){
		
		$edge = data.edge;
		$staticURL = data.img;
		$chans = data.list.slice();
		$pack = data.pack;

		$chans.forEach(function(cur, index){
			$("#content").append(genreChanCard(cur));
		})
		$chans.forEach(function(cur, index){
			$("#content").append(genreChanCard(cur));
		})

	})
})
}
showChans();

// $(document).ready(function(){
// 	$.getJSON($api + "epg/now", function(res){
// 		$allEpgNow = res;
// 		console.log($allEpgNow["9001"].title);
// 	})
// })
// $(document).ready(function(){
// 	$.getJSON($api + "list.json",function (data){
		
// 		$edge = data.edge;
// 		$staticURL = data.img;
// 		$chans = data.list.slice();
// 		$pack = data.pack;
		// data.list.forEach(function(cur, index){
		// 	$channels.cable.push(cur.id)

		// })

		

		// $.getJSON($api + "list/rating/" + data.pack, function(res){
		// 	$channels.rating = res;
		// 	if ($("#switchByRating").prop("checked")) {
		// 		// $channels.sortRating();
		// 		$(".left").trigger("sortByRating");
		// 	}	
		// })
		
		// $(".genres").trigger("getAllEpgNow");
		// $play.init();
// 	});
// });


function genreChanCard(_chan) {
	console.log(_chan);
	var title ;
	if($allEpgNow[_chan.id]){
		title = $allEpgNow[_chan.id].title;		
	} else {
		title = "No epg"
	}
	return  '<div class="col s3"> <div class="card" data-id=' + _chan.id+ '> <div class="card-image"><img src="' + $static + _chan.id + '.jpg">' 
               + '<span class="card-title">'+_chan["title"] + '</span></div><div class="card-content truncate"><p> ' 
                + title
              +'</p>' 
              // + '<div class="card-action"> <img src="' + $staticLogo + "logo/" +  _chan.id + ".png" +'"/> </div>'
             + '</div> </div> </div>';
}

// $(document).ready(function(){
// 	$.getJSON($api + 'categories.json', function(res){
// 		if(!res){
// 			return;
// 		}
// 		$cats = res;
// 		$cats[0][0] = 'Без жанра';
// 		$(".genreslist").append('<div class="genre" tabindex=1' + ' data-id=-1' + ' data-position=-1' + '><span>'
// 			+ "Все" + '</span></div>');
// 		$cats.forEach(function(val , index){
// 			$(".genreslist").append('<div class="genre" tabindex='+ index + ' data-id=' + index + ' data-position=' + index + '><span>'
// 			+ val[0] + '</span></div>');
// 		});
// 	})
// })