const util = require('./util')

const freeze = util.freeze

const isArray = util.isArray
const isNumber = util.isNumber
const isString = util.isString
const isObject = util.isObject
const isBoolean = util.isBoolean
const isFunction = util.isFunction

const typeCheck = true

const mapConstrToFn = function (group, constr) {
  return constr === String ? isString
    : constr === Number ? isNumber
    : constr === Boolean ? isBoolean
    : constr === Object ? isObject
    : constr === Array ? isArray
    : constr === Function ? isFunction
    : constr === undefined ? group
    : constr
}

const numToStr = [ 'first', 'second', 'third', 'fourth', 'fifth',
                 'sixth', 'seventh', 'eighth', 'ninth', 'tenth' ]

const validate = function (group, validators, name, args) {
  for (let i = 0; i < args.length; ++i) {
    let v = args[i]
    let validator = mapConstrToFn(group, validators[i])
    if (typeCheck === true &&
        (validator.prototype === undefined || !validator.prototype.isPrototypeOf(v)) &&
        (typeof validator !== 'function' || !validator(v))) {
      throw new TypeError('wrong value ' + v + ' passed to location ' + numToStr[i] +
                          ' in ' + name)
    }
  }
}

function push (tuple, val) {
  const key = (tuple._keys.length).toString()
  tuple._keys.push(key)
  return (tuple[key] = val)
}

const TupleFactory = function (...typeInfo) {
  function Tuple (type) {
    this._keys = []
  }

  Tuple.prototype.values = function () {
    return this._keys.map(function (k) {
      return this[k]
    }, this)
  }

  function Factory (...values) {
    if (values.some((val) => val === null || val === undefined)) {
      throw new ReferenceError('Tuples may not have any null values')
    }

    if (values.length !== typeInfo.length) {
      throw new TypeError('Tuple arity does not match its prototype')
    }

    const tuple = new Tuple()

    // try {                       //
    validate(null, typeInfo, null, values)
    values.map(function (val, index) {
      push(tuple, val)
    })
    // } catch (e) {
    //   if (e instanceof TypeError) {
    //     throw new TypeError('Tuple encounter a type mismatch')
    //   } else {
    //     throw e
    //   }
    // }

    freeze(tuple)

    return tuple
  }

  return Factory
}

module.exports = TupleFactory
