/**
 * toolchest/util
 */

const nativeAssign = Object.assign
const nativeIsArray = Array.isArray
const hOP = Object.prototype.hasOwnProperty

const __ = Symbol('Placeholder')

function isPlaceholder (val) { return val === __ }

/**
 * Function Functions
 */

function arity (n, fn) {
  switch (n) {
    case 0: return function () { return fn.apply(null, arguments) }
    case 1: return function (a0) { return fn.apply(null, arguments) }
    case 2: return function (a0, a1) { return fn.apply(null, arguments) }
    case 3: return function (a0, a1, a2) { return fn.apply(null, arguments) }
    case 4: return function (a0, a1, a2, a3) { return fn.apply(null, arguments) }
    case 5: return function (a0, a1, a2, a3, a4) { return fn.apply(null, arguments) }
    case 6: return function (a0, a1, a2, a3, a4, a5) { return fn.apply(null, arguments) }
    case 7: return function (a0, a1, a2, a3, a4, a5, a6) { return fn.apply(null, arguments) }
    case 8: return function (a0, a1, a2, a3, a4, a5, a6, a7) { return fn.apply(null, arguments) }
    default: throw new Error('First argument to _arity must be a non-negative integer no greater than eight')
  }
}

function optimizeCall (fn, args) {
  switch (args.length) {
    case 0: return fn()
    case 1: return fn(args[0])
    case 2: return fn(args[0], args[1])
    case 3: return fn(args[0], args[1], args[2])
    case 4: return fn(args[0], args[1], args[2], args[3])
    case 5: return fn(args[0], args[1], args[2], args[3], args[4])
  }
  return fn.apply(null, args)
}

function optimizeCallback (fn, args) {
  return () => optimizeCall(fn, args)
}

function curry1 (fn) {
  return function curry (a) {
    if (arguments.length === 0 || isPlaceholder(a)) {
      return curry
    } else {
      return fn.apply(null, arguments)
    }
  }
}

function curry2 (fn) {
  return function curry (a, b) {
    switch (arguments.length) {
      case 0:
        return curry
      case 1:
        return isPlaceholder(a) ? curry
        : curry1((_b) => fn(a, _b))
      default:
        return isPlaceholder(a) && isPlaceholder(b) ? curry
        : isPlaceholder(a) ? curry1((_a) => fn(_a, b))
        : isPlaceholder(b) ? curry1((_b) => fn(a, _b))
        : fn(a, b)
    }
  }
}

function curry3 (fn) {
  return function curry (a, b, c) {
    switch (arguments.length) {
      case 0:
        return curry
      case 1:
        return isPlaceholder(a) ? curry
        : curry2((_b, _c) => fn(a, _b, _c))
      case 2:
        return isPlaceholder(a) && isPlaceholder(b) ? curry
        : isPlaceholder(a) ? curry2((_a, _c) => fn(_a, b, _c))
        : isPlaceholder(b) ? curry2((_b, _c) => fn(a, _b, _c))
        : curry1((_c) => fn(a, b, _c))
      default:
        return isPlaceholder(a) && isPlaceholder(b) && isPlaceholder(c) ? curry
        : isPlaceholder(a) && isPlaceholder(b) ? curry2((_a, _b) => fn(_a, _b, c))
        : isPlaceholder(a) && isPlaceholder(c) ? curry2((_a, _c) => fn(_a, b, _c))
        : isPlaceholder(b) && isPlaceholder(c) ? curry2((_b, _c) => fn(a, _b, _c))
        : isPlaceholder(a) ? curry1((_a) => fn(_a, b, c))
        : isPlaceholder(b) ? curry1((_b) => fn(a, _b, c))
        : isPlaceholder(c) ? curry1((_c) => fn(a, b, _c))
        : fn(a, b, c)
    }
  }
}

function curryN (length, received, fn) {
  return function () {
    let left = length
    let argsIdx = 0
    let combinedIdx = 0

    const combined = []

    while (combinedIdx < received.length || argsIdx < arguments.length) {
      let result
      if (combinedIdx < received.length &&
          (!isPlaceholder(received[combinedIdx]) ||
           argsIdx >= arguments.length)) {
        result = received[combinedIdx]
      } else {
        result = arguments[argsIdx]
        argsIdx += 1
      }
      combined[combinedIdx] = result
      if (!isPlaceholder(result)) {
        left -= 1
      }
      combinedIdx += 1
    }
    return left <= 0 ? fn.apply(null, combined)
      : arity(left, curryN(length, combined, fn))
  }
}

/**
 * Type Functions

 */
// a -> Boolean
function isString (x) {
  return typeof x === 'string'
}

// a -> Boolean
function isNumber (x) {
  return typeof x === 'number'
}

// a -> Boolean
function isBoolean (x) {
  return typeof x === 'boolean'
}

// a -> Boolean
function isFunction (x) {
  return !!(x && x.constructor && x.call && x.apply)
}

// a -> Boolean
function isObject (x) {
  return isFunction(x) || (!!x && typeof (x) === 'object')
  /* Object.prototype.toString.call(x) === '[object Object]' */
}

// a -> Boolean
function isArray (x) {
  return nativeIsArray(x) || toString.call(x) === '[object Array]'
}

/**
 * is : (* -> {*}) -> a -> Boolean
 */
const is = curry2(function is (Ctor, val) {
  return val != null && val.constructor === Ctor || val instanceof Ctor
})

/**
 * Object Functions
 */

const assign = nativeAssign || function (destination, source) {
  var key
  for (key in source) {
    if (hOP.call(source, key)) {
      destination[key] = source[key]
    }
  }
  return destination
}

function clone (obj) {
  if (!isObject(obj)) return obj
  return nativeIsArray(obj) ? obj.slice() : assign({}, obj)
}

function freeze (obj) {
  if (isObject(obj) && !Object.isFrozen(obj)) {
    Object.keys(obj).forEach(key => freeze(obj[key]))
    Object.freeze(obj)
  }
  return obj
}

/**
 * Random Stuff
 */

function random (min, max) {
  if (max == null) {
    max = min
    min = 0
  }
  return min + Math.floor(Math.random() * (max - min + 1))
}

function Timer (label) {
  const start = new Date().getTime()

  this.stop = function () {
    if (this.elapsed === undefined) {
      this.elapsed = new Date().getTime() - start
      return this.elapsed
    } else {
      console.log('Timer can not be stopped twice')
    }
  }

  this.log = function () {
    console.log(label + ' in ' + this.elapsed + ' milliseconds.')
  }
}

/**
 * Exposing
 */

module.exports = {
  __,
  is,
  arity,
  clone,
  Timer,
  random,
  curry1,
  curry2,
  curry3,
  curryN,
  freeze,
  isArray,
  isObject,
  isString,
  isNumber,
  isBoolean,
  isFunction,
  optimizeCall,
  optimizeCallback
}
