'use strict'
/**
 * toolchest --- A simple set of tools.
 *
 */

/**
 * Importing
 */
const util = require('./util')

const __ = util.__
const _arity = util.arity
const _curry1 = util.curry1
const _curry2 = util.curry2
const _curry3 = util.curry3
const _curryN = util.curryN
const _isArray = util.isArray

const _nativeReduce = Array.prototype.reduce

/**
 * lt :: a -> a -> Boolean
 */
const lt = curry((a, b) => a < b)

/**
 * lte :: a -> a -> Boolean
 */
const lte = curry((a, b) => a <= b)

/**
 * gt :: a -> a -> Boolean
 */
const gt = curry((a, b) => a > b)

/**
 * gte :: a -> a -> Boolean
 */
const gte = curry((a, b) => a >= b)

/**
 * add :: Number -> Number -> Number
 */
const add = _curry2((a, b) => Number(a) + Number(b))

/**
 * subtract :: Number -> Number -> Number
 */
const subtract = curry((a, b) => Number(a) - Number(b))

/**
 * multiply :: Number -> Number -> Number
 */
const multiply = curry((a, b) => Number(a) * Number(b))

/**
 * divide :: Number -> Number -> Number
 */
const divide = curry((a, b) => Number(a) / Number(b))

/**
 * quotient :: Number -> Number -> Number
 */
const quotient = curry((a, b) => Math.trunc(Number(a) / Number(b)))

/**
 * quotient :: Number -> Number -> Number
 */
const modulo = curry((a, b) => Number(a) % Number(b))

/**
 * inc :: Number -> Number
 */
const inc = add(1)

/**
 * inc :: Number -> Number
 */
const dec = subtract(1)

/**
 * max :: a -> a -> Boolean
 */
const max = curry((a, b) => b > a ? b : a)

/**
 * exists :: a -> Boolean
 */
const exists = x => x != null

/**
 * empty :: a -> Boolean
 */
const empty = x => (_isArray(x) && x.length === 0)

/**
 * head :: [x:xs] -> x
 */
const head = xs => xs[0]

/**
 * tail :: [x:xs] -> xs
 */
const tail = xs => xs.slice(1)

/**
 * truthy :: a -> Boolean
 */
const truthy = x => exists(x) && x !== false

/**
 * falsy :: a -> Boolean
 */
const falsy = x => !truthy(x)

/**
 * Lens
 */

const assoc = curry(function (prop, val, obj) {
  const result = {}
  for (var p in obj) {
    result[p] = obj[p]
  }
  // what is the difference between the above and below
  // Object.assign(result, obj)
  result[prop] = val
  return result
})

/**
 * Used only for side effects, no return value
 *
 * each :: (x -> ()) -> [a] -> ()
 */
const each = curry(function (iterator, xs) {
  let idx = 0
  const len = xs.length
  while (idx < len) {
    iterator(xs[idx])
    idx += 1
  }
})

/**
 * map :: (a -> b) -> [a] -> [b]
 */
const map = _curry2(function (iterator, xs) {
  let idx = 0
  const ys = []
  const len = xs.length
  while (idx < len) {
    ys[idx] = iterator(xs[idx])
    idx += 1
  }
  return ys
})

const reduce = _curry3(function (fn, acc, xs) {
  return _nativeReduce.call(xs, fn, acc)
})

/**
 * foldl :: (b -> a -> b) -> [a] -> b
 */
const foldl = _curry3(function (iterator, accumulator, xs) {
  let idx = 0
  const len = xs.length
  while (idx < len) {
    accumulator = iterator(accumulator, xs[idx])
    idx += 1
  }
  return accumulator
})

/**
 * foldr :: (b -> a -> b) -> [a] -> b
 */
const foldr = function (iterator, accumulator, xs) {
  var idx = xs.length - 1
  while (idx > -1) {
    accumulator = iterator(accumulator, xs[idx])
    idx -= 1
  }
  return accumulator
}

/**
 * filter :: a -> Boolean) -> [a]-> [a]
 */
const filter = _curry2(function filter (predicate, xs) {
  let idx = 0
  const ys = []
  const len = xs.length
  while (idx < len) {
    if (predicate(xs[idx])) { ys.push(xs[idx]) }
    idx += 1
  }
  return ys
})

/**
 * Returns the first item to match predicate in xs
 *
 * find :: (a -> Boolean) -> [a] -> a
 */
const find = _curry2(function (predicate, xs) {
  let idx = 0
  const len = xs.length
  while (idx < len) {
    if (predicate(xs[idx])) { return xs[idx] }
    idx += 1
  }
  return null // Don't know if this is best. Perhaps should return a Maybe...
})

/**
 * range :: Number -> Number -> &optional Number -> [Number]
 * Note: Only works for incremental ranges
 */
const range = _curry2(function (start, end, step) {
  const rule = start < end ? lte : gte

  if (step === undefined) {
    step = rule === lte ? 1 : -1
  }

  if (rule === lte && step <= 0 || rule === gte && step >= 0) {
    throw new RangeError('the range function has recieved out of range arguments')
  }

  const result = []

  while (rule(start, end)) {
    result.push(start)
    start += step
  }

  return result
})

/**
 * zip :: [a] -> [b] -> [[a,b]]
 */
const zip = _curry2(function (xs, ys) {
  let idx = 0
  const zs = []
  const xslen = xs.length
  const yslen = ys.length

  while (idx < xslen && idx < yslen) {
    zs[idx] = [xs[idx], ys[idx]]
    idx += 1
  }

  return zs
})

/**
 * zipWith :: (a -> b -> c) -> [a] -> [b] -> [c]
 */
const zipWith = _curry3(function (iterator, xs, ys) {
  const zs = []
  const xslen = xs.length
  const yslen = ys.length
  for (let i = 0; i < xslen && i < yslen; i++) {
    zs[i] = iterator(xs[i], ys[i])
  }
  return zs
})

/**
 * The All Mighty Curry!
 * Any extra arguments are to be handled by the curried function.
 *
 * Note: Default and Rest parameters are not accounted for in Function#length.
 * So the curried function will be called as soon as it has recieved all regular
 * parameters. To utilize Rest parameters use curryN
 *
 * By the way, the spread operator is so cool!
 */

function curry (fn, ...args) {
  if (args.length >= fn.length) {
    return fn.apply(null, args)
  } else {
    return function (...rest) {
      return curry(fn, ...args, ...rest)
    }
  }
}

/*
function curryN (n, fn) {
  return curry(_arity(n, fn))
}
*/

const curryN = _curry2(function curryN (length, fn) {
  if (length === 1) {
    return _curry1(fn)
  }
  return _arity(length, _curryN(length, [], fn))
})

/**
 * Exposing
 */

module.exports = {
  __,
  lt,
  gt,
  lte,
  gte,
  add,
  inc,
  dec,
  max,
  map,
  zip,
  head,
  tail,
  find,
  each,
  foldl,
  foldr,
  range,
  assoc,
  empty,
  falsy,
  curry,
  reduce,
  curryN,
  filter,
  divide,
  modulo,
  truthy,
  exists,
  zipWith,
  subtract,
  multiply,
  quotient
}
