function SocketAPI(addr, params) {
	params = params || {};

	var main = this;
	this.active = false;

	var msgList = [];
	var Router = {}, Socket = {};

	if ( Object.keys(params).length > 0 ) {
		var array = [];

		for (var key in params) {
			var value = params[key];
			
			if (value) {
				array.push(key +'='+ value)
			}
		}

		addr += '?'+ array.join('&')
	}

	function onState(e) {
		if (e.type === 'open') {
			main.active = true;

			if (main.room) {
				main.join(main.room)
			}

			checkList();
		} else {
			main.active = false;
			setTimeout(Connect, 1000);
		}
	}

	function Connect() {
		Socket = new WebSocket(addr);

		Socket.onopen = onState;
		Socket.onclose = onState;

		Socket.onmessage = function(msg) {
			var data = {};
			try {
				data = JSON.parse(msg.data)
			} catch(e) {};
			if (data.type && data.data) {
				if (data.type in Router) {
					Router[ data.type ] ( data.data )
				}
			} 
		}
	}

	function checkList() {
		var msg = msgList.shift();

		if (msg) {
			Send(msg.type, msg.data);
			checkList()
		}
	}

	function Send(type, data) {
		var msg = { type: type, data: data };
		if (main.active) {
			Socket.send( JSON.stringify(msg) )
		} else {
			msgList.push(msg)
		}
	}

	this.on = function (type, callback) {
		Router[type] = callback;
	}

	this.send = function (type, data) { Send(type, data) }

	Connect();
}