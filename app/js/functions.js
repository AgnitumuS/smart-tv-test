/**
 * @description Load JSON via XHR with callback
 * @param url {String} URL of JSON
 * @param success {Function=} Optional callback on success, data object as a parameter
 * @param error {Function=} Optional callback on error, code and response text as parameters
 */
function loadJSON(url, success, error) {
    var request = new XMLHttpRequest();
    success = typeof success == 'function' ? success : function () {};
    error = typeof error == 'function' ? error : function () {};
    request.onreadystatechange = function () {
        if (request.readyState == XMLHttpRequest.DONE) {
            if (request.status == 200) {
                success(JSON.parse(request.responseText));
            } else {
                error(request.status, request.responseText);
            }
        }
    };
    request.open('GET', url, true);
    request.send();
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
 * @param display {String=} Optional CSS display value, default is 'block'
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