if (navigator.userAgent.match(/DuneHD/g)) {
    lanet_tv.Input.getInstance().addKeymap({
        '13': 'ENTER',
        '461': 'BACK',
        '107': 'CH_UP',
        '109': 'CH_DOWN',

        '37': 'LEFT',
        '38': 'UP',
        '39': 'RIGHT',
        '40': 'DOWN',

        '48': 'NUM0',
        '49': 'NUM1',
        '50': 'NUM2',
        '51': 'NUM3',
        '52': 'NUM4',
        '53': 'NUM5',
        '54': 'NUM6',
        '55': 'NUM7',
        '56': 'NUM8',
        '57': 'NUM9',

        '193': 'RED',
        '194': 'GREEN',
        '195': 'YELLOW',
        '196': 'BLUE'
    });
}
