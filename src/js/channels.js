lanet_tv.Channel = function (channel) {
    var channels = lanet_tv.Channels.getInstance(),
        element = document.createElement('div'),
        main = document.createElement('div'),
        logo = document.createElement('img'),
        program = document.createElement('div'),
        epg_title = document.createElement('div'),
        epg_time = document.createElement('div'),
        epg_time_end = document.createElement('div'),
        epg_time_line = document.createElement('div'),
        epg_time_line_value = document.createElement('div'),
        epg_tag_string = document.createElement('div'),
        epg_description = document.createElement('div'),
        preview = document.createElement('img'),
        star = document.createElement('div'),
        number = document.createElement('div'),
        data = {},
        calcProgress = function (begin, end) {
            var progress = Math.round((Time.getTimestamp() - begin) / (end - begin) * 100);
            return (progress >= 0 && progress <= 100) ? progress : undefined;
        },
        update = function (channel) {
            var is_current = channels.getCurrent() && channels.getCurrent().data['id'] == channel['id'];
            data = channel;
            is_current ? element.classList.add('current') : element.classList.remove('current');
            channel['favourite'] == true ? element.classList.add('favourite') : element.classList.remove('favourite');
            element.dataset['id'] = channel['id'];
            element.dataset['title'] = channel['title'];
            number.innerHTML = channel["num"].toPaddedString(3);
            logo.src = channel['logo'];
            epg_title.innerHTML = channel["epg"]["now"]["title"];
            epg_tag_string.innerHTML = [channel["epg"]["now"]["genre"].capitalizeFirstLetter()].concat(channel["epg"]["now"]["tags"]).join(' ');
            epg_description.innerHTML = channel["epg"]["now"]["description"];
            epg_time_end.innerHTML = Time.asObject(channel["epg"]["now"]["end"]).getHhMm();
            var progress = calcProgress(channel["epg"]["now"]["begin"], channel["epg"]["now"]["end"]);
            if (progress !== undefined) {
                element.classList.add('progress');
                epg_time_line_value.style.width = progress + '%';
            } else {
                element.classList.remove('progress');
            }
            preview.src = (is_current ? channel['preview'] : channel['preview_bg']) + '?timestamp=' + channels.getPreviewTimestamp();
        };

    element.className = 'channel';
    main.className = 'main';
    logo.className = 'logo';
    program.className = 'program';
    epg_title.className = 'title';
    epg_tag_string.className = 'tags';
    epg_description.className = 'description';
    epg_time.className = 'time';
    epg_time_end.className = 'end';
    epg_time_line.className = 'line';
    epg_time_line_value.className = 'value';
    preview.className = 'preview';
    star.className = 'star';
    number.className = 'number';
    main.appendChild(star);
    main.appendChild(number);
    main.appendChild(logo);
    element.appendChild(main);
    program.appendChild(epg_title);
    epg_time.appendChild(epg_time_end);
    program.appendChild(epg_tag_string);
    program.appendChild(epg_description);
    epg_time_line.appendChild(epg_time_line_value);
    epg_time.appendChild(epg_time_line);
    program.appendChild(epg_time);
    element.appendChild(program);
    element.appendChild(preview);
    update(channel);
    this.element = element;
    this.preview = preview;
    this.data = data;
    this.update = function (channel) {
        update(channel);
        this.data = data;
    }
};
lanet_tv.Channels = (function () {
    var instance;

    function init() {
        var channels = {}, current = 0, timestamp = Time.getTimestamp().toString();
        setInterval(function () {
            var local_timestamp = Time.getTimestamp().toString(), images = [];
            for (var channel_id in channels) {
                if (channels.hasOwnProperty(channel_id))
                    images.push(channels[channel_id].data['preview_bg'] + '?timestamp=' + local_timestamp);
            }
            new PreLoader(images, function () {
                timestamp = local_timestamp;
            });
        }, 15000);
        return {
            setChannel: function (channel) {
                if (channels[channel['id']])
                    channels[channel['id']].update(channel);
                else {
                    channels[channel['id']] = new lanet_tv.Channel(channel);
                    new PreLoader([channel['logo']]);
                }
            },
            leaveOnly: function (ids) {
                channels = channels.filter(function (channel) {
                    return ids.indexOf(channel.data['id']) > -1;
                });
            },
            getChannels: function () {
                return channels;
            },
            getByGenre: function (genre) {
                return channels.filter(function (channel) {
                    return channel.data.epg.now.genre == genre;
                });
            },
            getByTag: function (tag) {
                return channels.filter(function (channel) {
                    return channel.data.epg.now.tags.indexOf(tag) > -1;
                });
            },
            getFavourite: function () {
                return channels.filter(function (channel) {
                    return channel.data.favourite;
                });
            },
            getChannelByNumber: function (number) {
                number = number || 1;
                return channels.filter(function (channel) {
                    return channel.data['num'] === number;
                })[0];
            },
            getFirstChannel: function () {
                return channels[Object.keys(channels)[0]];
            },
            getChannelById: function (id) {
                return channels[id];
            },
            setCurrent: function (channel) {
                if (channels[current]) {
                    channels[current].element.classList.remove('current');
                    channels[current].preview.src = channels[current].data['preview_bg'] + '?timestamp=' + this.getPreviewTimestamp();
                }
                current = channel.data['id'];
                channels[current].preview.src = channel.data['preview'] + '?timestamp=' + this.getPreviewTimestamp();
                channels[current].element.classList.add('current');
            },
            getCurrent: function () {
                return channels[current];
            },
            getPrevious: function () {
                var i = Object.keys(channels).indexOf(current.toString());
                i = i > 0 ? i - 1 : Object.keys(channels).length - 1;
                return channels[Object.keys(channels)[i]];
            },
            getNext: function () {
                var i = Object.keys(channels).indexOf(current.toString());
                i = i < Object.keys(channels).length - 1 ? i + 1 : 0;
                return channels[Object.keys(channels)[i]];
            },
            getPreviewTimestamp: function () {
                return timestamp
            }
        };
    }

    return {
        getInstance: function () {
            if (!instance)
                instance = init();
            return instance;
        }
    };
})();
