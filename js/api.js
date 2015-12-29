lanet_tv.Api = (function () {
    var instance;

    function init() {
        var domains = {
            api: 'api.lanet.tv',
            stat: 'static.lanet.ua',
            //data: 'data.rmrf.co',
            data: 'data.lanet.tv',
            edge: 'tv.rmrf.co'
        }, loaded = false, data = {};

        function loadData(callback) {
            callback = callback || function (callback) { };
            Helpers.getJSON('http://' + domains.data, function (reply) {
                data = reply;
                domains['edge'] = domains['edge'] || reply['edge'];
                loaded = true;
                callback(data);
            });
        }

        return {
            getData: function (callback) {
                callback = callback || function (callback) { };
                loaded ? callback(data) : loadData(callback);
            },
            update: function (callback) { loadData(callback) },
            getTimestamp: function () { return data['timestamp'] },
            getOffset: function () { return data['time_offset'] },
            getGenres: function () { return data['classList']; },
            getTags: function () { return data['tagList']; },
            getLogoUrl: function (id) { return 'http://' + domains.stat + '/tv/logo/' + id.toString() + '.svg'; },
            getPreviewBgUrl: function (id) { return 'http://' + domains.edge + '/tv/_' + id.toString() + '_bg.jpg'; },
            getPreviewUrl: function (id) { return 'http://' + domains.edge + '/tv/_' + id.toString() + '.jpg'; },
            parseChannels: function () {
                var channels = [];
                for (var channel in data['list']) {
                    if (data['list'].hasOwnProperty(channel)) {
                        var channel_object = {
                            id: parseInt(channel),
                            title: data['list'][channel]['title'],
                            logo: this.getLogoUrl(channel),
                            preview: this.getPreviewUrl(channel),
                            preview_bg: this.getPreviewBgUrl(channel),
                            url: 'http://' + domains['edge'] + '/tv/' + channel.toString() + '.m3u8',
                            ratio: data['list'][channel]['ratio'].split(':').map(function (value) {
                                return parseInt(value);
                            }),
                            num: data['list'][channel]['n'],
                            classID: -1,
                            epg: {
                                now: {
                                    begin: 0,
                                    end: 0,
                                    title: 'Прямой эфир',
                                    tags: ['другое'],
                                    description: ''
                                }
                            }
                        };
                        if (data['list'][channel]['epg'][0]) {
                            channel_object['classID'] = data['list'][channel]['epg'][0]['class'];
                            channel_object['epg']['now'] = {
                                begin: data['list'][channel]['epg'][0]['start'],
                                end: data['list'][channel]['epg'][0]['stop'],
                                title: data['list'][channel]['epg'][0]['title'],
                                tags: [data['classList'][data['list'][channel]['epg'][0]['class']]].concat(data['list'][channel]['epg'][0]['tags']),
                                description: data['list'][channel]['epg'][0]['text']
                            }
                        }
                        if (data['list'][channel]['epg'][1]) {
                            channel_object['epg']['next'] = {
                                begin: data['list'][channel]['epg'][1]['start'],
                                end: data['list'][channel]['epg'][1]['stop'],
                                title: data['list'][channel]['epg'][1]['title'],
                                tags: [data['classList'][data['list'][channel]['epg'][1]['class']]].concat(data['list'][channel]['epg'][1]['tags']),
                                description: data['list'][channel]['epg'][1]['text']
                            }
                        }
                        channels.push(channel_object);
                    }
                }
                return channels;
            }
        };
    }

    return {
        getInstance: function () {
            if (!instance)
                instance = init();
            return instance;
        }
    }
})();
