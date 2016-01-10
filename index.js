/**
 * toolchest --- A simple set of tools.
 * index.js
 *
 */

var tools = (function () {
  var hOP = Object.prototype.hasOwnProperty
  var slice = Array.prototype.slice
  var toString = Object.prototype.toString

  var nativeAssign = Object.assign
  var nativeIsArray = Array.isArray

  var convert = function (args) {
    var result
    if (args.length < 5) {
      result = []
      for (var i = 0, len = args.length; i < len; i++) {
        result.push(args[i])
      }
    } else {
      result = args.length > 0 ? slice.call(args, 0) : []
    }
    return result
  }

  var optimizedCall = function (fn, ctx, args) {
    if (ctx === void 0) return fn
    switch (args.length) {
      case 0:
        return fn.call(ctx)
      case 1:
        return fn.call(ctx, args[0])
      case 2:
        return fn.call(ctx, args[0], args[1])
      case 3:
        return fn.call(ctx, args[0], args[1], args[2])
      case 4:
        return fn.call(ctx, args[0], args[1], args[2], args[3])
    }
    return fn.apply(ctx, args)
  }

  var optimizeCallback = function (fn, ctx, args) {
    return function () {
      optimizedCall(fn, ctx, args)
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

  tools.isBoolean = function (obj) {
    return typeof obj === 'boolean'
  }

  var isFunction = tools.isFunction = function (obj) {
    return !!(obj && obj.constructor && obj.call && obj.apply)
  }

  var isObject = tools.isObject = function (obj) {
    return isFunction(obj) || (!!obj && typeof (obj) === 'object')
  }

  var isArray = tools.isArray = nativeIsArray || function (obj) {
    return toString.call(obj) === '[object Array]'
  }

  var isArrayLike = tools.isArrayLike = function (obj) {
    return (Array.isArray(obj) || (!!obj && typeof item !== 'function' &&
                                   obj.hasOwnProperty('length') &&
                                   typeof obj.length === 'number'))
  }

  tools.empty = function (item) {
    return (isArrayLike(item) && item.length === 0)
  }

  var head = tools.head = function (array) {
    return array[0]
  }

  var tail = tools.tail = function (array) {
    return array.splice(1, array.length)
  }

  var exists = tools.exists = function (obj) {
    return obj != null
  }

  tools.truthy = function (obj) {
    return tools.exists(obj) && obj !== false
  }

  tools.falsy = function (obj) {
    return !tools.truthy(obj)
  }

  /*
   * Math
   */
  tools.round = function (number, pecision) {
    var adjust = Math.pow(10, Math.abs(pecision)) // No negative pecision.
    return Math.floor(number * adjust) / adjust   // Round down.
  }

  /*
   * Functional --- Using ECMACSript 6 for rest parameters.
   */
  tools.fn = (function (fn) {
    var curry = fn.curry = function (fn) {
      if (isFunction(fn)) {
        return function inner () {
          var args = convert(arguments)
          if (args.length === fn.length) {
            return optimizedCall(fn, null, args)
          } else if (args.length > fn.length) {
            var initial = optimizeCallback(fn, null, args)
            return fold(fn, initial, args.slice(fn.length))
          } else {
            return function () {
              var rest = convert(arguments)
              return optimizedCall(inner, null, args.concat(rest))
            }
          }
        }
      }
    }

    var each = fn.each = curry(function (iterator, items) {
      if (isFunction(iterator)) {
        if (!exists(items) || !isArray(items)) { return }
        for (var i = 0, len = items.length; i < len; i++) {
          iterator(items[i], i)
        }
      }
    })

    fn.map = curry(function (iterator, items) {
      if (isFunction(iterator)) {
        var result = []
        each(function () {
          result.push(optimizedCall(iterator, null, arguments))
        }, items)
        return result
      }
    })

    var fold = fn.fold = curry(function (iterator, cumulate, items) {
      if (isFunction(iterator)) {
        each(function (item, i) {
          cumulate = iterator(cumulate, item, i)
        }, items)
        return cumulate
      }
    })

    fn.reduce = curry(function (iterator, items) {
      if (isFunction(iterator)) {
        var cumulate = head(items)
        items = tail(items)
        return fold(iterator, cumulate, items)
      }
    })

    fn.filter = curry(function (iterator, items) {
      if (isFunction(iterator)) {
        var filtered = []
        each(function (item) {
          if (iterator(item)) {
            filtered.push(item)
          }
        }, items)
        return filtered
      }
    })

    return fn
  })({})

  tools.each = function (obj, iteratee, context) {
    var i, len
    if (nativeIsArray(obj)) {
      for (i = 0, len = obj.length; i < len; i++) {
        iteratee.call(context, obj[i], i, obj)
      }
    } else {
      var keys = Object.keys(obj)
      for (i = 0, len = keys.length; i < len; i++) {
        iteratee.call(context, obj[keys[i]], keys[i], obj)
      }
    }
    return obj
  }

  tools.map = function (obj, iteratee, context) {
    var i, keys, length, results, current
    keys = !isArray(obj) && Object.keys(obj)
    length = (keys || obj).length
    results = Array(length)
    for (i = 0; i < length; i++) {
      current = keys ? keys[i] : i
      results[i] = iteratee.call(context, obj[current], current, obj)
    }
  }

  tools.find = function (array, predicate, context) {
    var i, len
    for (i = 0, len = array.length; i < len; i++) {
      if (predicate.call(context, array[i], i)) {
        return i
      }
    }
    return -1
  }

  /*
   * Utility
   */

  tools.clone = function (obj) {
    if (!isObject(obj)) return obj
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

  return tools
})()

if (typeof (exports) !== 'undefined') {
  if (typeof (module) !== 'undefined' && module.exports) {
    exports = module.exports = tools
  }
  exports.Keyboard = tools
}
