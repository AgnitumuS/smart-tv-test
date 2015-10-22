"use strict";
/**
 * @description Load data via GET XHR with callback
 * @param url {String} Request URL
 * @param success {Function =} Optional callback on success, response body string passed as a parameter
 * @param error {Function =} Optional callback on error, object with status code and response body passed as a parameter
 */
function getXHR(url, success, error) {
    var request = new XMLHttpRequest();
    success = typeof success == 'function' ? success : function () {};
    error = typeof error == 'function' ? error : function () {};
    request.onreadystatechange = function () {
        if (request.readyState == XMLHttpRequest.DONE) {
            if (request.status == 200) {
                success(request.responseText);
            } else {
                error({
                    status: request.status,
                    body: request.responseText
                });
            }
        }
    };
    request.open('GET', url, true);
    request.send();
}

/**
 * @description Load JSON via GET XHR with callback
 * @param url {String} Request URL
 * @param success {Function =} Optional callback on success, data object is passed as a parameter
 * @param error {Function =} Optional callback on error, exception passed as a first parameter, object with status code
 * and response body is passed as a second parameter in case of XHR error
 */
function getJSON(url, success, error) {
    success = typeof success == 'function' ? success : function () {};
    error = typeof error == 'function' ? error : function () {};
    getXHR(url,
        function (body) {
            try { success(JSON.parse(body)); }
            catch (exception) { error(exception)}
        }, function (xhrError) { error(new XMLHttpRequestException, xhrError) }
    )
}

/**
 * @description Convert URL to CSS syntax
 * @param url {String} URL
 * @return {String} CSS syntax formatted URL
 */
function cssUrl(url) {
    return "url('" + url + "')";
}

/**
 * @description Hide DOM node
 * @param node {HTMLElement} DOM node
 * @return {HTMLElement | Boolean} Node or false
 */
function hideNode(node) {
    if (node) {
        node.style.display = 'none';
        return node;
    } else { return false; }
}

/**
 * @description Hide DOM node
 * @param node {HTMLElement} DOM node
 * @param display {String =} Optional CSS display value, default is 'block'
 * @return {HTMLElement | Boolean} Node or false
 */
function showNode(node, display) {
    if (node) {
        display = display ? display : 'block';
        node.style.display = display;
        return node;
    } else { return false; }
}

/**
 * @description Toggle DOM node
 * @param node {HTMLElement} DOM node
 * @param state {Boolean =} Optional force element state
 * @param display {String =} Optional CSS display value in case of showing element, default is 'block'
 * @return {HTMLElement | Boolean} Node or false
 */
function toggleNode(node, state, display) {
    if (node) {
        if (state !== false || state !== true)
            state = getComputedStyle(node).getPropertyValue('display') == 'none';
        if (state == false)
            hideNode(node);
        else if (state == true)
            showNode(node, display);
        return node;
    } else { return false; }
}

/**
 * @description Set CSS node width
 * @param node {HTMLElement} DOM node
 * @param width {Number} New width in pixels
 * @return {HTMLElement | Boolean} Node or false
 */
function setPixelNodeWidth(node, width) {
    if (node && typeof width == 'number') {
        node.style.width = width.toString() + 'px';
        return node;
    } else { return false; }
}

/**
 * @description Set CSS node height
 * @param node {HTMLElement} DOM node
 * @param height {Number} New height in pixels
 * @return {HTMLElement | Boolean} Node or false
 */
function setPixelNodeHeight(node, height) {
    if (node && typeof height == 'number') {
        node.style.height = height.toString() + 'px';
        return node;
    } else { return false; }
}

/**
 * @description Remove all children from DOM node
 * @param node {HTMLElement} DOM node
 * @return {HTMLElement | Boolean} Node or false
 */
function removeChildren(node) {
    if (node) {
        while (node.firstChild) {
            node.removeChild(node.firstChild);
        }
        return node;
    } else { return false; }
}

/**
 * @description Remove a class or list of classes from DOM node. Remove all classes if not specified
 * @param node {HTMLElement} DOM node
 * @param className {String | Array<String> =} Optional class name or a list of class names
 * @return {HTMLElement | Boolean} Node or false
 */
function removeClass(node, className) {
    switch (typeof className) {
        case 'string':
            className = [className];
            break;
        case 'undefined':
            className = [];
            if (node) {
                node.classList.forEach(function (name) {
                    className.push(name);
                })
            }
    }
    if (node) {
        className.forEach(function (name) {
            node.classList.remove(name);
        });
        return node;
    } else { return false; }
}

/**
 * @description Add a class or list of classes to DOM node
 * @param node {HTMLElement} DOM node
 * @param className {String | Array<String>} Class name or a list of class names
 * @return {HTMLElement | Boolean} Node or false
 */
function addClass(node, className) {
    if (typeof className == 'string') {
        className = [className];
    }
    if (node) {
        className.forEach(function (name) {
            node.classList.add(name);
        });
        return node;
    } else { return false; }
}

/**
 * @description Underscore.JS throttle implementation
 * @param func {Function} Throttled function
 * @param wait {Number} Wait until calling next time
 * @return {Function} Throttled function
 */
function throttle(func, wait) {
    var context, args, result;
    var timeout = null;
    var previous = 0;
    var later = function () {
        previous = new Date().getTime();
        timeout = null;
        result = func.apply(context, args);
        if (!timeout) context = args = null;
    };
    return function () {
        var now = new Date().getTime();
        var remaining = wait - (now - previous);
        context = this;
        args = arguments;
        if (remaining <= 0 || remaining > wait) {
            if (timeout) {
                clearTimeout(timeout);
                timeout = null;
            }
            previous = now;
            result = func.apply(context, args);
            if (!timeout) context = args = null;
        } else if (!timeout) {
            timeout = setTimeout(later, remaining);
        }
        return result;
    };
}
/**
 * @description Loop through array and execute passed function for each
 * @param array {Array} Target array
 * @param func {Function} Value processing function
 * @return {Array} Result array
 */
function mapArray(array, func) {
    var ret = [];
    array.forEach(function (value) {
        ret.push(func(value));
    });
    return ret;
}

/**
 * @description Pad a number with zeroes or custom symbols
 * @param number {Number} Source number
 * @param length {Number} Required length
 * @param symbol {String =} Optional padding symbol, default is 0
 * @return {String} Result string
 */
function pad(number, length, symbol) {
    symbol = symbol || '0';
    var str = number.toString();
    return str.length >= length ? str : new Array(length - str.length + 1).join(symbol) + str;
}