(function (_, g) {

    var Class = g.Class = function (options) {
        this.options = _.extend({}, this.options, options);
        this.initialize.apply(this, arguments);
    };

    _.extend(Class.prototype, {
        initialize: function () {
        },

        copyArray: function (src, dst, options) {
            var keepReference = this.getOrElse(options, "keepReference", true);
            if (src instanceof Array) {
                for (var i = 0; i < src.length; i++) {
                    var obj;
                    if (src[i] instanceof Array) {
                        obj = this._createDestination(dst, i, keepReference, []);
                        this.copyArray(src[i], obj, options);
                    }
                    else if (typeof src[i] == "object") {
                        obj = this._createDestination(dst, i, keepReference, {});
                        this.copyObject(src[i], obj, options);
                    } else {
                        obj = src[i];
                    }
                    dst[i] = obj;
                }
                if (dst.length > src.length) {
                    dst.splice(src.length, (dst.length - src.length));  //Remove ths rest of the extra destination items
                }
            }
        },

        /**
         *
         * @param src
         * @param dst
         * @param options e.g. {keepReference: true, exceptions:["htmlId"], transformMaps: {"dataId", function(src, options){ return src "33"+src; }}}
         */
        copyObject: function (src, dst, options) {
            var keepReference = this.getOrElse(options, "keepReference", true);
            var exceptions = this.getOrElse(options, "exceptions", []);
            var transformMaps = this.getOrElse(options, "transformMaps", {});
            if (typeof src == "object") {
                for (var child in src) {
                    if (exceptions.indexOf(child) == -1) {
                        if (src[child] instanceof Array) {
                            dst[child] = this._createDestination(dst, child, keepReference, []);
                            this.copyArray(src[child], dst[child], options);
                        }
                        else if (typeof src[child] == "object" && src[child] != null) {
                            dst[child] = this._createDestination(dst, child, keepReference, {});
                            this.copyObject(src[child], dst[child], options);
                        }
                        else {
                            if (!_.isUndefined(transformMaps[child])) {
                                dst[child] = transformMaps[child](src[child], options, src);
                            }
                            else
                                dst[child] = src[child];
                        }
                    }
                }
            }
        },

        _createDestination: function (obj, property, keepReference, defaultValue) {
            if (!keepReference)
                return defaultValue;
            else if (_.isObject(obj) && !obj.hasOwnProperty(property))
                return defaultValue;
            else
                return obj[property] || defaultValue;  //Would handle both, Array and objects
        },

        getOrElse: function (obj) {
            var currObject = obj;
            if (arguments.length < 2)
                return currObject;
            else if (arguments.length == 2) {
                if (!_.isUndefined(currObject)) {
                    return currObject;
                } else {
                    return _.clone(arguments[1]);
                }
            }
            else {
                var propChain = (arguments[1] || "").split(".");
                var defaultValue = arguments[2];
                _.each(propChain, function (prop) {
                    if (_.isObject(currObject))
                        currObject = currObject[prop];
                    else
                        currObject = undefined;
                }, this);

                if (!_.isUndefined(currObject))
                    return currObject;
                else {
                    return _.clone(defaultValue); //May have to do deep clone in future. TODO: support for conditional clone
                }
            }
        }
    });

    _.extend(Class, {
        defineProps: function (propsMap) {
            _.each(propsMap, function (propDesc, propName) {
                Object.defineProperty(this.prototype, propName, propDesc);
            }, this);
        },

        createSimpleProps: function (props) {
            var actualPropsMap = {};
            _.each(props, function (prop) {
                actualPropsMap[prop] = {
                    get: function () {
                        return this.options[prop];
                    },
                    set: function (val) {
                        this.options[prop] = val;
                    }
                }
            })
            this.defineProps(actualPropsMap);
        },
        extend: function (props) {
            var child = inherits(this, props);
            child.extend = this.extend;
            return child;
        }
    });

    // Shared empty constructor function to aid in prototype-chain creation.
    var ctor = function () {
    };

    // Helper function to correctly set up the prototype chain, for subclasses.
    // Similar to `goog.inherits`, but uses a hash of prototype properties and
    // class properties to be extended.
    function inherits(parent, protoProps) {
        var child;
        var _super = parent.prototype;
        // The constructor function for the new subclass is either defined by you
        // (the "constructor" property in your `extend` definition), or defaulted
        // by us to simply call the parent's constructor.
        if (protoProps && protoProps.hasOwnProperty('constructor')) {
            child = protoProps.constructor;
        } else {
            child = function () {
                parent.apply(this, arguments);
            };
        }

        // Inherit class (static) properties from parent.
        _.extend(child, parent);

        // Set the prototype chain to inherit from `parent`, without calling
        // `parent`'s constructor function.
        ctor.prototype = parent.prototype;
        child.prototype = new ctor();
        child._super = parent.prototype;
        child._superClass = parent;

        // Add prototype properties (instance properties) to the subclass,
        // if supplied.
        if (protoProps) { //_.extend(child.prototype, protoProps);
            // Copy the properties over onto the new prototype
            for (var name in protoProps) {
                if (name == "_defaults") {
                    protoProps[name] = _.extend({}, _super[name], protoProps[name]);
                }
                child.prototype[name] = protoProps[name];
            }
        }


        // Correctly set child's `prototype.constructor`.
        child.prototype.constructor = child;

        // Set a convenience property in case the parent's prototype is needed later.
        child.__super__ = parent.prototype;

        return child;
    };
})(_, pacmanLib);
