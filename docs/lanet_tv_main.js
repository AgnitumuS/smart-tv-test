var $list = {}, $epg = {}, 
	$etc = {
		api: 'http://tvapi.la.net.ua/',
		hover: '', niz: '', panelW: 65
	},

$LS = window.localStorage || {};		//HTML 5 Local Storage

var $view = {
	start: 0,
	timer: ''
}

function viewTimer (name) {
	var stop = new Date().getTime();
	if ( $view.start != 0 ) {
		var inMin = Math.round((stop - $view.start) / 60000);
		$view.start = stop;
		_gaq.push([
			'_setCustomVar',
			1, name, inMin
		])
	}
}

function getTimeStart(time){
	d = new Date(time);
	h = d.getHours(); m = d.getMinutes();
	if (h < 10) h = '0'+h;
	if (m < 10) m = '0'+m;
	return h+':'+m
}

var $play = {								//Обьект
	init: function(start){				
		var app = 'tv', url;
		if ( $LS.ott_id ) {
			start = $LS.ott_id;
			app = $LS.ott_app;
		}
		if (app != 'tv') {
			url = this.plus
		} else {
			url = this.edge
		}
		$etc.now = start;
		UA = navigator.userAgent;
		if ( /iPad|iPhone|Android\s4|Version/.test(UA) && !/Opera/.test(UA) ){
			this.isHLS = true;
			$('#play').html('<video id="iPlayer" src="'+ url + start +'.m3u8" controls autoplay></video>')
		} else {
			swfobject.embedSWF('swf/GrindPlayer.swf', 'play', '100%', '100%', '11', null, {					//Использование grind player'a
				src: url + start +'.m3u8',
				plugin_hls: 'swf/flashlsOSMF.swf',
				streamType: 'live',
				hls_debug: false,
				hls_debug2: false,
				hls_usehardwarevideodecoder: true
			}, {
				allowFullScreen: true,
				allowScriptAccess: 'always',
				bgcolor: '#000000',
				wmode: 'opaque'
			})
		}
		viewTimer( $list[start].title)
	},
	load: function(id){
		$etc.now = id;
		var url = this.edge;
		if ( $list[id].app === 'plus' ) { url = this.plus };
		url = url + id +'.m3u8'
		if (this.isHLS) {
			$('#iPlayer').attr('src', url)
		} else {
			play = document.getElementById('play');
			play.setMediaResourceURL(url)
		}
		$LS.ott_id = id;
		$LS.ott_app = $list[id].app;
		showNiz(id);

		ga('send', 'event', 'PLAY', $list[id].title)
	}
};

function scrSize(){
	var win = {
		w: document.documentElement.clientWidth,
		h: document.documentElement.clientHeight}
	$('#pWrap').css({
		width: win.w - $etc.panelW,
		height: win.h
	})
	$('#niz, #tvDayEpg').css({
		left: ( (win.w - $etc.panelW) / 2 ) -320
	})
}
$(window).resize(scrSize);
scrSize();

$(window).scroll(function(){
	clearInterval( $etc.hover )									//JQuery  when entered end leave from element (can get 2 parameters)
	if ( ! $('#chans').hasClass('hoverOFF') ) {
		$('#chans').addClass('hoverOFF')
	}
	$etc.hover = setTimeout(function(){
		$('#chans').removeClass('hoverOFF')
	}, 300)
})

function showEpgDay (data) {
	day = new Date().toISOString().substr(0,10);
	now = new Date().getTime();
	$.getJSON($etc.api + 'epg/day/'+day+'/'+data.epg, function (res){
		if ( res.length != 0 ) {
			$('#tvDayEpg').html('<div id="tvDayTitle"><img src="'+ $etc.img +'60px/'+ data.id+'.png"><div id="tvDayName">'
				+data.name+'</div><div id="tvDayClose"></div></div>')
			for (var i=0; res.length > i; i++){
				var old = ''
				if ( now > res[i].stop ) { old = 'true' }
				$('#tvDayEpg').append('<div data-old="'+old+'" class="tvDayEvent"><div class="tvDayTime">'+getTimeStart(res[i].start)+'</div>'+
					'<span>'+res[i].lang.ru.title+'</span></div>')
			}
			$('#tvDayEpg').attr('data-on', true)
		} else {
			alert('ÐÐ° Ð²Ñ‹Ð±Ñ€Ð°Ð½Ñ‹Ð¹ ÐºÐ°Ð½Ð°Ð» Ð½ÐµÑ‚ Ð¿Ñ€Ð¾Ð³Ñ€Ð°Ð¼Ð¼Ñ‹ Ñ‚ÐµÐ»ÐµÐ¿ÐµÑ€ÐµÐ´Ð°Ñ‡')
		}
	})
	_gaq.push(['_trackEvent', 'Event', 'showEPG', data.name ])
}

$.getJSON( $etc.api +'list.json', function (res){		//send Jquery HTTP GET 
	$play.edge = res.edge
	$etc.img = res.img;

	if (res.plus != null) {
		$play.plus = res.plus;
	} 

	for (var i=0; res.list.length > i; i++) {
		$('#chans').append('<div class="chan" data-id="'+ res.list[i]._id +'">'+
			'<div class="chImg" style="background-image: url('+ $etc.img +'60px/'+ res.list[i]._id +'.png)"></div>'+ //Добавление иконки канала
			'<div data-id="'+ res.list[i]._id +'" class="chEPG"><span></span>'+
			'<div class="chDay"></div></div></div>');
		$list[res.list[i]._id] = {
			epg: res.list[i].epg,
			app: res.list[i].app,
			title: res.list[i].title
		}
		updEpg(res.list[i]._id)		//Функция поиска EPG для канала
	}

	$play.init(res.list[0]._id)		// Запуск проигрывания первого канала по счету
})

$('#chans').on('click', '.chan', function (e){			// Обработка события клика по иконке канала
	var id = $(this).attr('data-id'),
		targ = e.target.className;
	if (targ == 'chDay') {
		showEpgDay({
			id:   id,
			epg:  $list[id].epg,
			name: $list[id].title
		})
	} else {
		$play.load(id);
	}
})

function updEpg(id){
	$.getJSON($etc.api + 'epg/one/'+ $list[id].epg, function (res){
		if (res) {
			$epg[id] = {
				stop:  res.stop,
				desc:  res.lang.ru.desc,
				title: res.lang.ru.title
			}
		} else {
			$epg[id] = {
				stop:  9090909090909,
				desc:  '',
				title: 'ÐÐµÑ‚ Ð¿Ñ€Ð¾Ð³Ñ€Ð°Ð¼Ð¼Ñ‹ Ñ‚ÐµÐ»ÐµÐ¿ÐµÑ€ÐµÐ´Ð°Ñ‡'
			}
		}
		$('.chEPG[data-id="'+id+'"] span').html($epg[id].title);
	})
}

function showNiz(id){
	$('#nizEpg').html( $epg[id].title + '<p>'+ $epg[id].desc +'</p>' )
	clearInterval($etc.niz)
	$('#nizImg').attr('src', $etc.img+ '60px/'+ id +'.png')
	$('#niz').css({ bottom: 3, opacity: 1 })
	$etc.niz = setTimeout(function(){
		$('#niz').css({ bottom: '-65px', opacity: 0 })
	}, 3000)
}

$(window).keydown(function (e){					//Менять каналы с помощью "вверх-вниз"
	var tmpID = false;
	if (e.keyCode == 40){
		tmpID = $('.chan[data-id="'+ $etc.now +'"]').next().attr('data-id');
	}
	if (e.keyCode == 38){
		tmpID = $('.chan[data-id="'+ $etc.now +'"]').prev().attr('data-id');
	}

	if (tmpID) { $play.load(tmpID) }
})

$('#tvDayEpg').on('click', '#tvDayClose', function(){
	$('#tvDayEpg').attr('data-on', false)
})



	// Analytics

var _gaq = _gaq || [];
	_gaq.push(['_setAccount', 'UA-2946020-12']);
	_gaq.push(['_trackPageview']);

(function() {
	var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
	ga.src = ('https:' == document.location.protocol ? 'https://' : 'http://') + 'stats.g.doubleclick.net/dc.js';
	var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
})();



