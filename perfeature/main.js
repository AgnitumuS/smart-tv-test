$.getJSON("http://api.lanet.tv/epg/9002/now", function(res){
	console.log(res);
	res.forEach(function(current, index, array){
		$(".epgNext").html("<span>"+ current.title + "</span>");
	})
	

})

$(".epgNext").on("click",function(){
	console.log("click");
	$(".epgNextToday").css("height","800px");
	$.getJSON("http://api.lanet.tv/epg/9002/dayfromnow", function(res){
		res.forEach(function(current, index){
			$(".epgNextToday").append('<div class="epgNext"><span>' + current.title + '</span></div>');
		})		
	})
})