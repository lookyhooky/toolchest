/**
 * toolchest --- A simple set of tools.
 * index.js
 *
 */

var hOP = Object.prototype.hasOwnProperty
var toString = Object.prototype.toString

var nativeAssign = Object.assign
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

/*
 * Predicates
 */
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

/*
 * Math
 */
tools.round = function (number, pecision) {
  var adjust = Math.pow(10, Math.abs(pecision)) // No negative pecision.
  return Math.floor(number * adjust) / adjust   // Round down.
}

/*
 * Functional
 */
tools.each = function (obj, iteratee, context) {
  iteratee = optimizeCb(iteratee, context, 3)
  var i
  var len
  if (nativeIsArray(obj)) {
    for (i = 0, len = obj.length; i < len; i++) {
      // iteratee qrguments: item, index, array
      iteratee(obj[i], i, obj)
    }
  } else {
    var keys = Object.keys(obj)
    for (i = 0, len = keys.length; i < len; i++) {
      // iteratee arguments: item, key, object
      iteratee(obj[keys[i]], keys[i], obj)
    }
  }
  return obj
}

tools.find = function (array, predicate, context) {
  predicate = optimizeCb(predicate, context, 2)
  var i
  var len
  for (i = 0, len = array.length; i < len; i++) {
    // predicate arguments: item, index
    if (predicate(array[i], i)) {
      return i
    }
  }
  return null
}

/*
 * Utility
 */
tools.clone = function (obj) {
  if (!tools.isObject(obj)) return obj
  return nativeIsArray(obj) ? obj.slice() : tools.assign({}, obj)
}

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

/*
 * Random
 */
tools.random = function (min, max) {
  if (max == null) {
    max = min
    min = 0
  }
  return min + Math.floor(Math.random() * (max - min + 1))
}

tools.uniqueId = function (length) {
  var i
  var id
  var max
  var chars
  var defaultLength = 16

  chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
    .split('')

  max = chars.length - 1

  length = Math.abs(length)

  id = ''

  if (length) {
    for (i = 0; i < length; i++) {
      id.concat(chars[tools.random(0, max)])
    }
  } else {
    for (i = 0; i < defaultLength; i++) {
      id.concat(chars[tools.random(0, max)])
    }
  }

  return id
}

tools.Timer = function (label) {
  var start

  start = window.performance.now()

  this.stop = function () {
    if (this.elapsed === undefined) {
      this.elapsed = window.performance.now() - start
      return this.elapsed
    } else {
      console.log('Timer can not be stopped twice')
    }
  }

  this.log = function () {
    console.log(label + ' in ' + this.stop() + ' milliseconds.')
  }
}

module.exports = tools
