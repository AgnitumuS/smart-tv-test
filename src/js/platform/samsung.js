if (navigator.userAgent.match(/SmartHub/g)) {
    Helpers.addScript('$MANAGER_WIDGET/Common/API/Widget.js');
    Helpers.addScript('$MANAGER_WIDGET/Common/webapi/1.0/webapis.js');
    (function () {
        var readyStateCheckInterval = setInterval(function () {
            if (document.readyState === 'complete') {
                var widgetAPI = new Common.API.Widget();
                widgetAPI.sendReadyEvent();
                clearInterval(readyStateCheckInterval)
            }
        }, 10);
    })();
    lanet_tv.Input.getInstance().addKeymap({
        '29443': 'ENTER',
        '88': 'BACK',
        '68': 'CH_UP',
        '65': 'CH_DOWN',

        '4': 'LEFT',
        '29460': 'UP',
        '5': 'RIGHT',
        '29461': 'DOWN',

        '17': 'NUM0',
        '101': 'NUM1',
        '98': 'NUM2',
        '6': 'NUM3',
        '8': 'NUM4',
        '9': 'NUM5',
        '10': 'NUM6',
        '12': 'NUM7',
        '13': 'NUM8',
        '14': 'NUM9',

        '108': 'RED',
        '20': 'GREEN',
        '21': 'YELLOW',
        '22': 'BLUE'
    });
}
