if (!Object.prototype.create) {
    Object.prototype.create = function (o) {
        function F() {
        }

        F.prototype = o;
        return new F();
    };
}

if (!Array.prototype.forEach) {
    Array.prototype.forEach = function (callback) {
        for (var index = 0; index < this.length; index++) {
            callback(this[index], index, this);
        }
    };
}

if (!Array.prototype.chunk) {
    Array.prototype.chunk = function (chunkSize) {
        var array = this;
        return [].concat.apply([],
            array.map(function (elem, i) {
                return i % chunkSize ? [] : [array.slice(i, i + chunkSize)];
            })
        );
    };
}

if (!Array.prototype.map) {
    Array.prototype.map = function (callback, thisArg) {
        var T, A, k;
        if (this == null) {
            throw new TypeError(' this is null or not defined');
        }
        var O = Object(this);
        var len = O.length >>> 0;
        if (typeof callback !== 'function') {
            throw new TypeError(callback + ' is not a function');
        }
        if (arguments.length > 1) {
            T = thisArg;
        }
        A = new Array(len);
        k = 0;
        while (k < len) {
            var kValue, mappedValue;
            if (k in O) {
                kValue = O[k];
                mappedValue = callback.call(T, kValue, k, O);
                A[k] = mappedValue;
            }
            k++;
        }
        return A;
    };
}

if (!Number.prototype.toPaddedString) {
    Number.prototype.toPaddedString = function (length, symbol) {
        symbol = symbol || '0';
        var str = this.toString();
        return str.length >= length ? str : new Array(length - str.length + 1).join(symbol) + str;
    }
}

if (!String.prototype.startsWith) {
    String.prototype.startsWith = function (searchString, position) {
        position = position || 0;
        return this.indexOf(searchString, position) === position;
    };
}

if (!String.prototype.endsWith) {
    String.prototype.endsWith = function (searchString, position) {
        var subjectString = this.toString();
        if (typeof position !== 'number' || !isFinite(position) || Math.floor(position) !== position || position > subjectString.length) {
            position = subjectString.length;
        }
        position -= searchString.length;
        var lastIndex = subjectString.indexOf(searchString, position);
        return lastIndex !== -1 && lastIndex === position;
    };
}

if (!Array.prototype.filter) {
    Array.prototype.filter = function (fun) {
        'use strict';

        if (this === void 0 || this === null) {
            throw new TypeError();
        }

        var t = Object(this);
        var len = t.length >>> 0;
        if (typeof fun !== 'function') {
            throw new TypeError();
        }

        var res = [];
        var thisArg = arguments.length >= 2 ? arguments[1] : void 0;
        for (var i = 0; i < len; i++) {
            if (i in t) {
                var val = t[i];

                // NOTE: Technically this should Object.defineProperty at
                //       the next index, as push can be affected by
                //       properties on Object.prototype and Array.prototype.
                //       But that method's new, and collisions should be
                //       rare, so use the more-compatible alternative.
                if (fun.call(thisArg, val, i, t)) {
                    res.push(val);
                }
            }
        }

        return res;
    };
}
if (!Array.prototype.spliced) {
    Array.prototype.spliced = function () {
        Array.prototype.splice.apply(this, arguments);
        return ( this );
    };
}

if (!Object.prototype.filter) {
    Object.prototype.filter = function (obj, predicate) {
        var result = {}, key;
        for (key in obj) {
            if (obj.hasOwnProperty(key) && !predicate(obj[key])) {
                result[key] = obj[key];
            }
        }
        return result;
    };
}

if (!Date.prototype.addSeconds) {
    Date.prototype.addSeconds = function (seconds) {
        this.setTime(this.getTime() + (seconds * 1000));
        return this;
    };
}

if (!Date.prototype.addMinutes) {
    Date.prototype.addMinutes = function (minutes) {
        this.addSeconds(minutes * 60);
        return this;
    };
}

if (!Date.prototype.addHours) {
    Date.prototype.addHours = function (hours) {
        this.addMinutes(hours * 60);
        return this;
    };
}

if (!Date.prototype.addDays) {
    Date.prototype.addDays = function (days) {
        this.addHours(days * 24);
        return this;
    };
}

if (!Element.prototype.remove) {
    Element.prototype.remove = function () {
        this.parentElement.removeChild(this);
    }
}
if (!NodeList.prototype.remove) {
    NodeList.prototype.remove = HTMLCollection.prototype.remove = function () {
        for (var i = this.length - 1; i >= 0; i--) {
            if (this[i] && this[i].parentElement) {
                this[i].parentElement.removeChild(this[i]);
            }
        }
    }
}
