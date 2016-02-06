var Time = {
    timestamp: Math.ceil(new Date().getTime() / 1000),
    offset: new Date().getTimezoneOffset() * -60
};

Time.setTimestamp = function (timestamp) {
    this.timestamp = timestamp
};

Time.setOffset = function (offset) {
    this.offset = offset
};

Time.getTimestamp = function () {
    return this.timestamp
};

Time.getOffset = function () {
    return this.offset
};

/**
 * @description Get an object of local time
 * @param timestamp {Number =} Optional timestamp, default is now
 * @return {Object} Local time object (year, month, date, hours, minutes, seconds)
 */
Time.asObject = function (timestamp) {
    var date = new Date(((typeof timestamp == 'number' ? timestamp : this.timestamp) + this.offset) * 1000);
    return {
        year: date.getUTCFullYear(),
        month: date.getUTCMonth(),
        date: date.getUTCDate(),
        hours: date.getUTCHours(),
        minutes: date.getUTCMinutes(),
        seconds: date.getUTCSeconds(),
        getHhMm: function () { return this.hours.toPaddedString(2) + ':' + this.minutes.toPaddedString(2); }
    }
};
/**
 * @description Get a human readable remaining time till timestamp
 * @param till {Number} Timestamp of the moment in the future
 * @return {String} Human readable remaining time string
 */
Time.remainingTime = function (till) {
    var delta = till - this.timestamp,
        string;
    if (delta < -60) { // In the past
        string = 'Далее';
    } else if (delta < 60) { // Less than a minute
        string = 'Через несколько секунд';
    } else if (delta > 21600) { // More than 6 hours
        var localStartTime = this.asObject(till),
            localNowTime = this.asObject(),
            time = localStartTime.hours.toPaddedString(2) + ':' + localStartTime.minutes.toPaddedString(2);
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
        if (delta >= 3600) { // A hour or more
            var hours = Math.floor(delta / 3600);
            string += hours == 1 ? 'час' : hours.toString() + ' ' + (hours <= 4 ? 'часа' : 'часов');
        } else {
            var minutes = Math.floor(delta / 60),
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
};
