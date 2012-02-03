/**
* @preserve MicroFramework.js
* v1.0.3
* Copyright 2011, IBI Group
*/
(function (window, undefined) {

    var AJAX = function () {

        //This method create an XHR Object
        function getxhr() {
            var xhr = (window.XMLHttpRequest) ? new XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP");
            return xhr;
        }

        //Main AJAX Method
        //Parameters sendRequest(method, url, ValuesToSend, callbackObject)
        //E.g. $().sendRequest('get','customers.php',{customerId:1234, name:'James', lastname:'Bond'}, {success:function(){alert('yes')}, loading:function(){alert('Waiting')}, error:function(){alert('no')}});
        function sendRequest(m, url, valObj, callObj) {

            //Here we create the xhr Object
            var myxhr = getxhr();

            //Because we have to send the values in a query string E.g. myurl.php?param1=value1&param2=value2...
            //We create the var values that is going to save the query string
            //Walking throught the object valObj we take the name and its value
            //Using encodeURLComponent to scape special values
            var values = '?';
            for (var k in valObj) {
                values += encodeURIComponent(k) + '=' + encodeURIComponent(valObj[k]) + '&';
            }

            //If the method we choose is get we add the values to the url
            //As we don't need to send the values by the xhr.send, we set the variable values to null; 
            if (m === 'get') {
                url += values;
                values = null;
            }

            //Here opening the AJAX conection
            myxhr.open(m, url, true);

            //If the method is post
            //We need to delete the ? at the begining of the string in values;
            //And set the headers requiered for the post method
            if (m == 'post') {
                values = values.substring(1, values.length - 1);
                myxhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
            }

            //Send the request with ajax;
            myxhr.send(values);

            //If it is available execute the loading function from the callObj
            if (callObj.loading) {
                callObj.loading();
            }

            //When readyState change to 4
            myxhr.onreadystatechange = function () {
                if (myxhr.readyState == 4) {
                    switch (myxhr.status) {

                        //If estatus is 200 means it success, the execute success from the callObj.                                                                                                                                               
                        case 200:
                            if (callObj.success) {
                                callObj.success(myxhr.responseText);
                            }
                            break;

                        //If estatus is 403, 404 or 503 means that there is something wrong, execute error from the callObj.                                                                                                                                               
                        case 403:
                        case 404:
                        case 503:
                            if (callObj.error) {
                                callObj.error(myxhr.responseText);
                            }
                            break;

                        default:
                            if (callObj.error) {
                                callObj.error(myxhr.responseText);
                            }
                    }
                }
            };
        }

        // PUBLIC
        var api = {
            // Gets the results from a GET request
            get: function (url, values, callback) {
                return sendRequest("get", url, values, callback);
            },

            // Gets the results from a POST to the URL with
            // given values.
            post: function (url, values, callback) {
                return sendRequest("post", url, values, callback);
            },

            // Gets JSON items
            getJSON: function (url, values, successCallback, failCallback) {
                this.post(url, values,
                    {
                        success: function (response) {
                            var json = JSON.parse(response);

                            if (successCallback) {
                                successCallback(json);
                            }
                        },
                        fail: failCallback
                    });
            }
        };

        return api;
    };

    var microLib = (function () {

        var microLib = function (selector) {

            // Create a new copy of the engine
            var engine = new microLibEngine();

            // Work out what the selector is
            if (selector) {

                // If it's string, we're trying to find
                // something by ID.
                if (typeof selector === 'string') {
                    return engine.findById(selector);
                }

                // If a function is passed, wait for 
                // ready and use as callback.
                else if (typeof selector === 'function') {
                    return engine.ready(selector);
                }

            }

            return engine;
        };

        var microLibEngine = function (elements) {

            // The elems array is going to contains all the elements in order to chain
            var elems = elements || [],

            ajax = new AJAX(),

            // Verify when the DOM is ready.
            // Callback is the anonymous function to execute when the dom is ready
            ready = function (callback) {
                var done = false; //Create a variable called done with false as value;

                // Checking every 10 milliseconds if the document.body and document.getElementById are ready to work with them
                // If the they are ready to work then we change done to true;
                var checkLoaded = setInterval(function () {
                    if (document.body && document.getElementById) {
                        done = true;
                    }
                }, 10);

                // Checking every 10 milliseconds if done == true
                // If it is true then execute the callback
                var checkInter = setInterval(function () {
                    if (done) {
                        clearInterval(checkLoaded);
                        clearInterval(checkInter);
                        callback();
                    }
                }, 10);
            },

            //The method to get Elements By Id
            findById = function () {
                var tempElems = []; //temp Array to save the elements found
                for (var i = 0; i < arguments.length; i++) {
                    if (typeof arguments[i] === 'string') { //Verify if the parameter is an string
                        var id = arguments[i].replace('#', '');
                        tempElems.push(document.getElementById(id)); //Add the element to tempElems
                    }
                }

                return microLibEngine(tempElems);
            },

            // Get children of elements
            children = function (tagName) {
                if (elems.length > 0) {
                    var tempElems = [];

                    var thisTag = tagName, remainingTags;

                    // Check for multiple levels
                    var split = tagName.split(" ");
                    if (split.length > 1) {
                        thisTag = split[0];
                        remainingTags = tagName.substring(thisTag.length + 1);
                    }

                    for (var elementLoop = 0; elementLoop < elems.length; elementLoop++) {
                        if (elems[elementLoop]) {
                            var e = elems[elementLoop].getElementsByTagName(thisTag);
                            for (var matchLoop = 0; matchLoop < e.length; matchLoop++) {
                                tempElems.push(e[matchLoop]);
                            }
                        }
                    }

                    var ret = microLibEngine(tempElems);

                    if (remainingTags) {
                        return ret.children(remainingTags);
                    }

                    return ret;
                }

                return this;
            },

            each = function (callback) {
                if (callback) {
                    for (var i = 0; i < elems.length; i++) {
                        if (elems[i]) {
                            var tempElems = [];
                            tempElems.push(elems[i]);
                            callback(i, microLibEngine(tempElems));
                        }
                    }
                }

                return this;
            },

            hide = function (callback) {
                for (var i = 0; i < elems.length; i++) {
                    if (elems[i]) {
                        elems[i].style.display = "none";
                    }
                }

                if (callback) {
                    callback();
                }

                return this;
            },

            show = function (callback) {
                for (var i = 0; i < elems.length; i++) {
                    if (elems[i]) {
                        elems[i].style.display = "block";
                    }
                }

                if (callback) {
                    callback();
                }

                return this;
            },

            //Method innerHTML to insert HTML code into an element
            //html is the param with the html code to insert in the elements
            html = function (html, callback) {
                if (typeof html == "undefined" && elems[0]) {
                    return elems[0].innerHTML;
                }
                else {
                    for (var i = 0; i < elems.length; i++) {
                        if (elems[i]) {
                            elems[i].innerHTML = html;
                        }
                    }

                    if (callback) {
                        callback();
                    }

                    return this;
                }
            },

            // Method value to value code into an element
            // value is the param with the valueto insert in the elements
            value = function (value, callback) {
                if (typeof value == "undefined" && elems[0]) {
                    return elems[0].value;
                }
                else {
                    for (var i = 0; i < elems.length; i++) {
                        if (elems[i]) {
                            elems[i].value = value;
                        }
                    }

                    if (callback) {
                        callback();
                    }

                    return this;
                }
            },

            attr = function (attribute, data, callback) {
                if (typeof data == "undefined" && elems[0]) {
                    return elems[0].getAttribute(attribute);
                }
                else {
                    for (var i = 0; i < elems.length; i++) {
                        if (elems[i]) {
                            elems[i].setAttribute(attribute, data);
                        }
                    }

                    if (callback) {
                        callback();
                    }

                    return this;
                }
            },

            url = function (value, callback) {
                if (typeof value == "undefined" && elems[0]) {
                    if (elems[0] && elems[0].attributes && elems[0].attributes.href) {
                        return elems[0].attributes.href.value;
                    }
                }
                else {
                    for (var i = 0; i < elems.length; i++) {
                        if (elems[i] && elems[i].attributes && elems[i].attributes.href) {
                            elems[i].attributes.href.value = value;
                        }
                    }

                    if (callback) {
                        callback();
                    }

                    return this;
                }
            },

            // Disables the default action for the event.
            disableEvent = function (event) {
                if (event.stopPropagation) {
                    event.stopPropagation();
                }
                if (event.preventDefault) {
                    event.preventDefault();
                }
            },

            // Attaches an event listener to the supplied item.
            attachEventListener = function (item, action, callback) {
                if (item.addEventListener) {
                    item.addEventListener(action, function (e) {
                        disableEvent(e);
                        if (callback) {
                            callback(e);
                        }
                    }, false);
                }

                else if (item.attachEvent) {
                    item.attachEvent('on' + action, function (e) {
                        disableEvent(e);
                        if (callback) {
                            callback(e);
                        }
                    });
                }
            },

            on = function (action, callback) {
                for (var i = 0; i < elems.length; i++) {
                    attachEventListener(elems[i], action, callback);
                }

                return this;
            },

            // Unbind events from the elements
            un = function (action, callback) {
                for (var i = 0; i < elems.length; i++) {
                    // Check if the method removeEventListener is available
                    // This work for all major browsers except IE
                    if (elems[0].removeEventListener) {
                        // Remove the event from the elements
                        elems[i].removeEventListener(action, callback, false);
                    }
                    // If it is IE :( use detachEvent method
                    else {
                        // Remove the event from the elements, only IE
                        elems[i].detachEvent('on' + action, callback);
                    }
                }

                return this;
            },

            click = function (callback) {
                return on('click', function (mousevent) {
                    if (callback) {
                        return callback(mousevent.target);
                    }
                });
            },

            checked = function (callback) {
                if (typeof callback == "undefined" && elems[0]) {
                    return elems[0].type === 'checkbox' && elems[0].checked;
                }
                else {
                    return on('change', function (event) {
                        if (callback) {
                            var target = event.target;
                            if (target && target.type === 'checkbox') {
                                return callback(target.checked, target.value);
                            }
                        }
                    });
                }
            },

            submit = function (callback) {
                return on('submit', callback);
            };

            // Public API
            return {
                ready: ready,

                // Finders
                findById: findById,
                children: children,

                // Display
                hide: hide,
                show: show,

                // Manipulation
                html: html,
                value: value,
                attr: attr,
                url: url,
                each: each,

                // Events
                click: click,
                checked: checked,
                submit: submit,

                // AJAX
                get: ajax.get,
                post: ajax.post,
                getJSON: ajax.getJSON
            };
        };

        return microLib;

    })();

    // Add a shortcut to the library
    window.microLib = $ = microLib;

})(window);