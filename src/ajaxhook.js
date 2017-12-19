/*
 * author: wendu
 * email: 824783146@qq.com
 * source code: https://github.com/wendux/Ajax-hook
 **/
!function (global) {
    global.hookObject = function (object, name, hookObj) {
        var oriName = '_' + name;
        object[oriName] = object[oriName] || object[name];
        object[name] = function (...args) {
            this[oriName] = new object[oriName](...args);
            for (var attr in this[oriName]) {
                var type = "";
                try {
                    type = typeof this[oriName][attr]
                } catch (e) { }
                if (type === "function") {
                    this[attr] = hookfun(attr);
                } else {
                    Object.defineProperty(this, attr, {
                        get: getterFactory(attr),
                        set: setterFactory(attr)
                    })
                }
            }
        }

        function getterFactory(attr) {
            return function () {
                return this.hasOwnProperty(attr + "_") ? this[attr + "_"] : this[oriName][attr];
            }
        }

        function setterFactory(attr) {
            return function (value) {
                var origin = this[oriName];
                var that = this;
                if (attr.indexOf("on") === 0) {
                    if (hookObj[attr]) {
                        this['_' + attr] = value; // 保存原始的回调, 供外部使用
                        origin[attr] = function () {
                            if (hookObj[attr].apply(that, arguments)) {
                                return;
                            }
                            return value.apply(origin, arguments);
                        };
                    } else {
                        origin[attr] = value;
                    }
                } else {
                    // 设置的属性不是onXxx时, 保存到hook对象里面, 因为大多数回调函数中不是使用this来取属性(如xhr.responseText), 而是直接使用之前创建的hook对象
                    this[attr + "_"] = value;
                }
            }
        }

        function hookfun(attr) {
            return function () {
                if (hookObj[attr] && hookObj[attr].apply(this, arguments)) {
                    return;
                }
                return this[oriName][attr].apply(this[oriName], arguments);
            }
        }
        return object[oriName];
    }
    global.unHookObject = function (object, name) {
        var oriName = '_' + name;
        if (object[oriName]) object[name] = object[oriName];
        object[oriName] = undefined;
    }
}(window);
