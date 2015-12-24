if (navigator.userAgent.match(/^((?!(NetCast|DuneHD|SmartHub)).)*$/g)) {
    lanet_tv.Controller.getInstance().addKeymap({
        '13': 'ENTER',
        '8': 'BACK',
        '33': 'CH_UP',
        '34': 'CH_DOWN',

        '37': 'LEFT',
        '38': 'UP',
        '39': 'RIGHT',
        '40': 'DOWN',

        '96': 'NUM0',
        '97': 'NUM1',
        '98': 'NUM2',
        '99': 'NUM3',
        '100': 'NUM4',
        '101': 'NUM5',
        '102': 'NUM6',
        '103': 'NUM7',
        '104': 'NUM8',
        '105': 'NUM9',

        '65': 'RED',
        '83': 'GREEN',
        '68': 'YELLOW',
        '70': 'BLUE'
    });
}