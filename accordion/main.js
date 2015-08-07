function getRandomColor() {
    var letters = '0123456789ABCDEF'.split('');
    var color = '#';
    for (var i = 0; i < 6; i++ ) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

$('#block1').find('*:first-child').focus();
$("#playlist, #genres, #tags, #settings").on('keydown',function (event) {
	console.log(event);
	var target = event.currentTarget;

	if(event.keyCode === 13 ){
		//if hasn't visible elem
		if ( $(target).find('*.accItems:visible').length ===0 ){
			$(target).find('*').show();
			$(target).find('*:first-child').focus();
		} else {
			$(target).find('*').hide();
		}

	} else if (event.keyCode === 40) {
		//down
		$(target).next().focus();
	} else if (event.keyCode === 38) {
		//up
		// console.log($(target).prev().find('div.accItems:visible'))
		if( $(target).prev().find('div.accItems:visible').length !== 0){
			console.log('here');
			$(target).prev().find('*:last-child').focus();
		} else {
			$(target).prev().focus();
		}
	}

})
$(".accItems").on('keydown',function  (event) {
	console.log(event);
	var target = event.currentTarget;
	event.stopPropagation();
	if (event.keyCode === 40) {
		//down
		//if next elem
		if( $(target).next().length !== 0 ){
			$(target).next().focus();
		} else {
			//switch to parent next
			$(target).parent().next().focus();
		}
	} else if (event.keyCode === 38) {
		//up
		if($(target).prev().length !==0 ){
			$(target).prev().focus();
		} else {
			$(target).parent().focus();
		}
	} else if (event.keyCode === 13){
		event.stopPropagation();
		$('#block2').css('background-color', getRandomColor())
	}

})

