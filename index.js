/**
 * toolchest.js
 * a simple set of tools
 */

var toString = Object.prototype.toString

var nativeIsArray = Array.isArray

var optimizeCb = function (func, context, argCount) {
  if (context === void 0) return func
  switch (argCount == null ? 3 : argCount) {
    case 1: return function (value) {
      return func.call(context, value)
    }
    case 2: return function (value, other) {
      return func.call(context, value, other)
    }
    case 3: return function (value, index, collection) {
      return func.call(context, value, index, collection)
    }
    case 4: return function (accumulator, value, index, collection) {
      return func.call(context, accumulator, value, index, collection)
    }
  }
  return function () {
    return func.apply(context, arguments)
  }
}

var tools = function (obj) {
  return obj
}

tools.isString = function (obj) {
  return typeof obj === 'string'
}

tools.isNumber = function (obj) {
  return typeof obj === 'number'
}

tools.isBool = function (obj) {
  return typeof obj === 'boolean'
}

tools.isFunction = function (obj) {
  return typeof obj === 'function'
}

tools.isObject = function (obj) {
  var type = typeof obj
  return type === 'function' || type === 'object' && !!obj
}

tools.isArray = nativeIsArray || function (obj) {
  return toString.call(obj) === '[object Array]'
}

tools.round = function (number, pecision) {
  var adjust = Math.pow(10, Math.abs(pecision)) // No negative pecision.
  return Math.round(number * adjust) / adjust
}

tools.clone = function (obj) {
  if (!tools.isObject(obj)) return obj
  return nativeIsArray(obj) ? obj.slice() : Object.assign({}, obj)
}

/*
tools.assign = nativeAssign || function (destination, source) {
  var key
  for (key in source) {
    if (hOP.call(source, key) &&
        tools.isFunction(source[key])) {
      destination[key] = source[key]
    }
  }
  return destination
}
*/

tools.each = function (obj, interatee, context) {
  interatee = optimizeCb(interatee, context)
  var i
  var len
  if (nativeIsArray(obj)) {
    for (i = 0, len = obj.length; i < len; i++) {
      interatee(obj[i], i, obj)
    }
  } else {
    var keys = keys(obj)
    for (i = 0, len = keys.length; i < len; i++) {
      interatee(obj[keys[i]], keys[i], obj)
    }
  }
  return obj
}

tools.find = function (array, predicate) {
  var i
  var len
  for (i = 0, len = array.length; i < len; i++) {
    if (predicate(array[i])) {
      return i
    }
  }
  return null
}

module.exports = tools
