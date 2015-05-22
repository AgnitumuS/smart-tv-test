
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

$("#interactive").html("Press Enter");
// $("#replay").hide();
	//**EL
$(document).on("keydown", function(event){
	switch ( event.keyCode) {  
		case VK_ENTER:
			if($("#wrapper").is(".wrapperActive")){
				if( $("#control").is(".paused") ){
					play.play();
					$("#control").removeClass("paused");
					$("#replay").css({"visibility":"hidden"});
				} else {
					$("#control").addClass("paused");
					play.flash.stop();
					$("#replay").css({"visibility":"visible"});
				}
				
			} else {
				$("#wrapper").addClass("wrapperActive");
				$("#qMenu").show();
				$("#replay").css({"visibility":"hidden"});
				$("#interactive").html("Press ENTER or ARROW_KEYS");
			}
		break;

		case VK_UP:
			if($("#wrapper").is(".wrapperActive")){
				setTimeout(
					function(){
						$("#wrapper").removeClass("wrapperActive");
						$("#qMenu").hide();
					}, 200)
				$("#interactive").html("Menu is hidden.Press ENTER");
			}
		break;
		case VK_RIGHT:
			if($("#wrapper").is(".wrapperActive")){
				$("#like").css("background-color", "#9C27B0");
			};
		break;
		case VK_DOWN:
			if($("#wrapper").is(".wrapperActive")){
			$("#menu").css("background-color", "#0097A7");

				setTimeout(
					function(){
						$("#qMenu").hide();
					}, 800)
				$("#interactive").html("Showing main menu. Not ready. Reload page.");
			};
		break;
		case VK_LEFT:
			if($("#replay").css("visibility") == "visible"){
				$("#replay").css({"background-color":"#F8BBD0"});
				$("#interactive").html("Start playing telecast from the beginning");
			}
		default:
			console.log(event.keyCode);
		break;
	}

})
// $("#wrapper").on("click", function(){
// 	$("#wrapper").addClass("wrapperActive");
// 	$("#qMenu").show();
// })
