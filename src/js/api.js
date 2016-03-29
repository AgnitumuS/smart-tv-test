lanet_tv.Api = (function () {
    var instance;

    function init() {
        var domains = {
                "api": 'https://play.lanet.tv',
                "static_files": 'https://static.lanet.ua'
                //images: 'https://kirito.la.net.ua',
                //data: 'data.rmrf.co',
                //data: 'data.lanet.tv',
                //edge: 'tv.rmrf.co'
            }, loaded = false, data = {}, key, channels = [], genres = [], tags = [],
            getLogoUrl = function (id) { return domains['static_files'] + '/tv/logo/' + id.toString() + '.svg'; },
            //getLogoUrl = function (id) { return domains.static_files + '/tv/logo/' + id.toString() + '.png'; },
            getPreviewBgUrl = function (id) { return domains.images + '_' + id.toString() + '_bg.jpg'; },
            getPreviewBigUrl = function (id) { return domains.images + id.toString() + '.jpg'; },
            getPreviewUrl = function (id) { return domains.images + '_' + id.toString() + '.jpg'; },
            loadData = function (callback) {
                callback = callback || function (callback) { };
                Helpers.getJSON(domains.api + '/init' + (key ? "?key=" + key : ""), function (reply) {
                    data = reply;
                    domains['edge'] = domains['edge'] || reply['edge'];
                    domains['images'] = domains['images'] || reply['images'];
                    loaded = true;
                    parseChannels();
                    callback(data);
                });
            },
            parseChannels = function () {
                channels = [];
                var all_genres = [],
                    all_tags = data['tagList'],
                    current_genres = [],
                    current_tags = [];
                for (var g in data['classList']) {
                    if (data['classList'].hasOwnProperty(g)) {
                        all_genres.push(data['classList'][g]['name']);
                    }
                }
                for (var channel in data['list']) {
                    if (data['list'].hasOwnProperty(channel)) {
                        var channel_object = {
                            id: parseInt(channel),
                            title: data['list'][channel]['title'],
                            logo: getLogoUrl(channel),
                            preview: getPreviewUrl(channel),
                            preview_bg: getPreviewBgUrl(channel),
                            preview_big: getPreviewBigUrl(channel),
                            //url: 'http://' + domains.edge + '/tv/' + channel.toString() + '.m3u8',
                            url: data['list'][channel]['url'],
                            ratio: data['list'][channel]['ratio'].split(':').map(function (value) {
                                return parseInt(value);
                            }),
                            num: data['list'][channel]['order'],
                            epg: {
                                now: {
                                    begin: 0,
                                    end: 0,
                                    title: 'Прямой эфир',
                                    tags: [],
                                    genre: "Другое",
                                    description: ''
                                }
                            }
                        }, now_genre = "Другое", next_genre = "Другое";
                        if (data['list'][channel]['epg'][0]) {
                            now_genre = data['classList'].filter(function (genre) {
                                return genre.id == data['list'][channel]['epg'][0]['class'];
                            })[0]['name'];
                            for (var tag in data['list'][channel]['epg'][0]['tags']) {
                                if (data['list'][channel]['epg'][0]['tags'].hasOwnProperty(tag)) {
                                    current_tags.pushUnique(data['list'][channel]['epg'][0]['tags'][tag]);
                                }
                            }
                            current_genres.pushUnique(now_genre);
                            channel_object['epg']['now'] = {
                                begin: data['list'][channel]['epg'][0]['start'],
                                end: data['list'][channel]['epg'][0]['stop'],
                                title: data['list'][channel]['epg'][0]['title'],
                                tags: data['list'][channel]['epg'][0]['tags'],
                                genre: now_genre,
                                description: data['list'][channel]['epg'][0]['text']
                            }
                        }
                        if (data['list'][channel]['epg'][1]) {
                            next_genre = data['classList'].filter(function (genre) {
                                return genre.id == data['list'][channel]['epg'][0]['class'];
                            })[0]['name'];
                            channel_object['epg']['next'] = {
                                begin: data['list'][channel]['epg'][1]['start'],
                                end: data['list'][channel]['epg'][1]['stop'],
                                title: data['list'][channel]['epg'][1]['title'],
                                tags: data['list'][channel]['epg'][1]['tags'],
                                genre: next_genre,
                                description: data['list'][channel]['epg'][1]['text']
                            }
                        }
                        channels.push(channel_object);
                    }
                }
                genres = all_genres.filter(function (genre) {
                    return current_genres.indexOf(genre) > -1;
                });
                tags = all_tags.filter(function (tag) {
                    return current_tags.indexOf(tag) > -1;
                });
            };

        return {
            getData: function (callback) {
                callback = callback || function (callback) { };
                loaded ? callback(data) : loadData(callback);
            },
            update: function (callback) { loadData(callback) },
            setKey: function (new_key) { key = new_key },
            getPack: function () { return "/" + data['pack'].toUpperCase() },
            getTimestamp: function () { return data['timestamp'] },
            getOffset: function () { return data['time_offset'] },
            getGenres: function () { return genres; },
            getTags: function () { return tags; },
            getChannels: function () { return channels; }
        }
    }

    return {
        getInstance: function () {
            if (!instance)
                instance = init();
            return instance;
        }
    };
})();
