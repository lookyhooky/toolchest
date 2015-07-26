/**
 * toolchest.js
 * a simple set of tools
 */

// var push = Array.prototype.push
// var slice = Array.prototype.slice
var toString = Object.prototype.toString
var hOP = Object.prototype.hasOwnProperty

var nativeIsArray = Array.isArray

var tools = function (obj) {
  return obj
}

tools.isString = function (obj) {
  return typeof obj === 'string' || false
}

tools.isNumber = function (obj) {
  return typeof obj === 'number' || false
}

tools.isBool = function (obj) {
  return typeof obj === 'boolean' || false
}

tools.isFunction = function (obj) {
  return toString.call(obj) === '[object Function]' || false
}

tools.isObject = function (obj) {
  return toString.call(obj) === '[object Object]' || false
}

tools.isArray = nativeIsArray || function (obj) {
  return toString.call(obj) === '[object Array]'
}

tools.mixin = function (destination, source) {
  var key
  for (key in source) {
    if (hOP.call(source, key) &&
        toString.call(source[key]) === '[object Function]') {
      destination[key] = source[key]
    }
  }
  return destination
}

module.exports = tools
