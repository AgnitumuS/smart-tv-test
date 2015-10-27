"use strict";
var Time = {
    tzOffset: new Date().getTimezoneOffset() * -1000,
    /**
     * @description Get current timezone offset for Europe/Kiev from Google Maps service
     * @param callback {Function =} Optional callback function on success or error
     */
    updateOffset: function (callback) {
        callback = typeof callback == 'function' ? callback : function () {};
        var self = this,
            timestamp = Math.round(new Date().getTime() / 1000);
        getJSON(
            'https://maps.googleapis.com/maps/api/timezone/json?location=50.4500,30.5233&timestamp=' + timestamp,
            function (response) {
                if (response['status'] == 'OK')
                    self.tzOffset = (response['rawOffset'] + response['dstOffset']) * 1000;
                callback();
            }, callback
        )
    },
    /**
     * @description Get an object of local time
     * @param time {Number =} Optional timestamp, default is now
     * @return {Object} Local time object (year, month, date, hours, minutes, seconds)
     */
    getLocalTime: function (time) {
        var date = new Date(typeof time == 'number' ? time : new Date().getTime() + this.tzOffset);
        return {
            year: date.getUTCFullYear(),
            month: date.getUTCMonth(),
            date: date.getUTCDate(),
            hours: date.getUTCHours(),
            minutes: date.getUTCMinutes(),
            seconds: date.getUTCSeconds()
        }
    },
    /**
     * @description Get a human readable remaining time till timestamp
     * @param till {Number} Timestamp of the moment in the future
     * @return {String} Human readable remaining time string
     */
    remainingTime: function (till) {
        var difference = till - Math.ceil(new Date().getTime() / 1000),
            string;
        if (difference < 0) { // In the past
            string = 'Далее';
        } else if (difference < 60) { // Less than a minute
            string = 'Через несколько секунд';
        } else if (difference > 21600) { // More than 6 hours
            var localStartTime = this.getLocalTime(till * 1000),
                localNowTime = this.getLocalTime(),
                time = pad(localStartTime.hours, 2) + ':' + pad(localStartTime.minutes, 2);
            if (localNowTime.date + 1 == localStartTime.date && localStartTime.hours >= 5) { // After 5 AM next day
                string = 'Завтра в ' + time;
            } else if (localNowTime.date == localStartTime.date ||
                localNowTime.date + 1 == localStartTime.date && localStartTime.hours < 5) {
                string = 'В ' + time;
            } else {
                string = 'Далее';
            }
        } else {
            string = 'Через ';
            if (difference >= 3600) { // A hour or more
                var hours = Math.floor(difference / 3600);
                string += hours == 1 ? 'час' : hours.toString() + ' ' + (hours <= 4 ? 'часа' : 'часов');
            } else {
                var minutes = Math.floor(difference / 60),
                    mod = minutes % 10;
                string += minutes == 1 ? '' : minutes.toString() + ' ';
                if (minutes < 20 && minutes != 1) {
                    string += minutes <= 4 ? 'минуты' : 'минут';
                } else {
                    string += mod == 1 ? 'минуту' : (mod == 0 || mod > 4 ? 'минут' : 'минуты');
                }
            }
        }
        return string;
    }
};