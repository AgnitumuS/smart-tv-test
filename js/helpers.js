var Helpers = {};
/**
 * @description Load data via GET XHR with callback
 * @param url {String} Request URL
 * @param success {Function =} Optional callback on success, response body string passed as a parameter
 * @param error {Function =} Optional callback on error, object with status code and response body passed as a parameter
 */
Helpers.getXHR = function (url, success, error) {
    var request = new XMLHttpRequest();
    success = typeof success == 'function' ? success : function () { };
    error = typeof error == 'function' ? error : function () { };
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
    return request;
};

/**
 * @description Load JSON via GET XHR with callback
 * @param url {String} Request URL
 * @param success {Function =} Optional callback on success, data object is passed as a parameter
 * @param error {Function =} Optional callback on error, exception passed as a first parameter, object with status code
 * and response body is passed as a second parameter in case of XHR error
 */
Helpers.getJSON = function (url, success, error) {
    success = typeof success == 'function' ? success : function () { };
    error = typeof error == 'function' ? error : function () { };
    return this.getXHR(url,
        function (body) {
            try {
                success(JSON.parse(body));
            } catch (exception) {
                error({
                    status: 200,
                    body: body
                })
            }
        }, function (xhrError) {
            error(xhrError)
        }
    )
};

/**
 * @description Convert URL to CSS syntax
 * @param url {String} URL
 * @return {String} CSS syntax formatted URL
 */
Helpers.cssUrl = function (url) {
    return "url('" + url + "')";
};

/**
 * @description Hide DOM node
 * @param node {HTMLElement} DOM node
 * @return {HTMLElement | Boolean} Node or false
 */
Helpers.hideNode = function (node) {
    if (node) {
        node.style.display = 'none';
        return node;
    } else {
        return false;
    }
};

/**
 * @description Hide DOM node
 * @param node {HTMLElement} DOM node
 * @param display {String =} Optional CSS display value, default is 'block'
 * @return {HTMLElement | Boolean} Node or false
 */
Helpers.showNode = function (node, display) {
    if (node) {
        display = display ? display : 'block';
        node.style.display = display;
        return node;
    } else {
        return false;
    }
};

/**
 * @description Toggle DOM node
 * @param node {HTMLElement} DOM node
 * @param state {Boolean =} Optional force element state
 * @param display {String =} Optional CSS display value in case of showing element, default is 'block'
 * @return {HTMLElement | Boolean} Node or false
 */
Helpers.toggleNode = function (node, state, display) {
    if (node) {
        if (state !== false && state !== true)
            state = getComputedStyle(node).getPropertyValue('display') == 'none';
        if (state == false)
            this.hideNode(node);
        else if (state == true)
            this.showNode(node, display);
        return node;
    } else {
        return false;
    }
};

/**
 * @description Set CSS node width
 * @param node {HTMLElement} DOM node
 * @param width {Number} New width in pixels
 * @return {HTMLElement | Boolean} Node or false
 */
Helpers.setPixelNodeWidth = function (node, width) {
    if (node && typeof width == 'number') {
        node.style.width = width.toString() + 'px';
        return node;
    } else {
        return false;
    }
};

/**
 * @description Set CSS node height
 * @param node {HTMLElement} DOM node
 * @param height {Number} New height in pixels
 * @return {HTMLElement | Boolean} Node or false
 */
Helpers.setPixelNodeHeight = function (node, height) {
    if (node && typeof height == 'number') {
        node.style.height = height.toString() + 'px';
        return node;
    } else {
        return false;
    }
};

/**
 * @description Remove all children from DOM node
 * @param node {HTMLElement} DOM node
 * @return {HTMLElement | Boolean} Node or false
 */
Helpers.removeChildren = function (node) {
    if (node) {
        while (node.firstChild) {
            node.removeChild(node.firstChild);
        }
        return node;
    } else {
        return false;
    }
};

/**
 * @description Remove a class or list of classes from DOM node. Remove all classes if not specified
 * @param node {HTMLElement} DOM node
 * @param className {String | Array<String> =} Optional class name or a list of class names
 * @return {HTMLElement | Boolean} Node or false
 */
Helpers.removeClass = function (node, className) {
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
    } else {
        return false;
    }
};

/**
 * @description Add a class or list of classes to DOM node
 * @param node {HTMLElement} DOM node
 * @param className {String | Array<String>} Class name or a list of class names
 * @return {HTMLElement | Boolean} Node or false
 */
Helpers.addClass = function (node, className) {
    if (typeof className == 'string') {
        className = [className];
    }
    if (node) {
        className.forEach(function (name) {
            node.classList.add(name);
        });
        return node;
    } else {
        return false;
    }
};

/**
 * @description Underscore.JS throttle implementation
 * @param func {Function} Throttled function
 * @param wait {Number} Wait until calling next time
 * @return {Function} Throttled function
 */
Helpers.throttle = function (func, wait) {
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
};

/**
 * @description Calculate maximum resolution based on aspect ratio
 * @param ratio {Array<Number>} Aspect ratio
 * @param res {Array<Number>=} Maximum resolution, default is full screen
 * @return {Array<Number>} [width, height]
 */
Helpers.calcResolution = function (ratio, res) {
    if (!res)
        res = [window.innerWidth, window.innerHeight];
    return [
        res[0] / res[1] > ratio[0] / ratio[1] ? Math.ceil((ratio[1] / ratio[0]) * res[0]) : res[0],
        res[0] / res[1] < ratio[0] / ratio[1] ? Math.ceil((ratio[1] / ratio[0]) * res[0]) : res[1]
    ];
};

/**
 * @description Concatenate array children
 * @param array {Array<Array>} Array with children
 * @return {Array} Concatenated children
 */
Helpers.concatChildren = function (array) {
    var result = [];
    array.forEach(function (child) {
        result.concat(child);
    });
    return result;
};

/**
 * @description Create an SWF object
 * @param src {String} SWF file source
 * @param attributes {Object =} Optional object attributes
 * @param parameters {Object =} Optional SWF parameters
 * @return {HTMLElement} SWF object
 */
Helpers.createSwfObject = function (src, attributes, parameters) {
    var i, object, div, obj, attr = attributes || {}, param = parameters || {}, paramEl;
    attr.type = 'application/x-shockwave-flash';
    attr.data = src;
    object = document.createElement('object');
    for (i in attr) {
        if (attr.hasOwnProperty(i))
            object.setAttribute(i, attr[i]);
    }
    for (i in param) {
        if (param.hasOwnProperty(i)) {
            paramEl = document.createElement('param');
            paramEl.setAttribute('name', i);
            paramEl.setAttribute('value', param[i]);
            object.appendChild(paramEl);
        }
    }
    div = document.createElement('div');
    div.appendChild(object);
    obj = div.firstChild;
    div.removeChild(obj);
    return obj;
};

/**
 * @description Load a n arbitrary JavaScript file (into head tag)
 * @param source {String} JS file source
 */
Helpers.addScript = function (source) {
    var head = document.getElementsByTagName('head')[0];
    var element = document.createElement('script');
    element.type = 'text/javascript';
    element.src = source;
    head.appendChild(element)
};
