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
    }
};