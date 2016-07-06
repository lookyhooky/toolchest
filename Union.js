/**
 * Union.js
 */

// there should be a difference between type alias and a union type
const util = require('./util')
const tool = require('./toolchest')

const curryN = tool.curryN

const isArray = util.isArray
const isNumber = util.isNumber
const isString = util.isString
const isObject = util.isObject
const isBoolean = util.isBoolean
const isFunction = util.isFunction

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
    if (Type.check === true &&
        (validator.prototype === undefined || !validator.prototype.isPrototypeOf(v)) &&
        (typeof validator !== 'function' || !validator(v))) {
      throw new TypeError('wrong value ' + v + ' passed to location ' + numToStr[i] +
                          ' in ' + name)
    }
  }
}

function valueToArray (value) {
  const array = []
  for (let i = 0, len = value._keys.length; i < len; i++) {
    array.push(value[value._keys[i]])
  }
  return array
}

function extractValues (keys, obj) {
  const array = []
  for (let i = 0, len = keys.length; i < len; i++) {
    array[i] = obj[keys[i]]
  }
  return array
}

function constructor (group, name, fields) {
  let validators
  const keys = Object.keys(fields)

  if (isArray(fields)) {
    validators = fields
  } else {
    validators = extractValues(keys, fields)
  }

  function construct (...args) {
    const val = Object.create(group.prototype)
    val._keys = keys
    val._name = name
    if (Type.check === true) {
      validate(group, validators, name, args)
    }
    for (let i = 0, len = args.length; i < len; i++) {
      val[keys[i]] = args[i]
    }
    return val
  }

  group[name] = curryN(keys.length, construct)

  if (keys !== undefined) {
    group[name + 'Of'] = (obj) => {
      return construct.apply(undefined, extractValues(keys, obj))
    }
  }
}

function rawCase (type, cases, value, arg) {
  let wildcard = false
  let handler = cases[value._name]
  if (handler === undefined) {
    handler = cases['_']
    wildcard = true
  }
  if (Type.check === true) {
    if (!type.prototype.isPrototypeOf(value)) {
      throw new TypeError('wrong type passed to case')
    } else if (handler === undefined) {
      throw new Error('non-exhaustive patterns in a function')
    }
  }
  const args = wildcard === true ? [arg]
        : arg !== undefined ? valueToArray(value).concat([arg])
        : valueToArray(value)
  return handler.apply(undefined, args)
}

const typeCase = curryN(3, rawCase)
const caseOn = curryN(4, rawCase)

function createIterator () {
  return {
    idx: 0,
    val: this,
    next: function () {
      var keys = this.val._keys
      return this.idx === keys.length
        ? {done: true}
        : {value: this.val[keys[this.idx++]]}
    }
  }
}

function Type (desc) {
  let res
  const obj = {}
  obj.case = typeCase(obj)
  obj.caseOn = caseOn(obj)

  obj.prototype = {}
  obj.prototype[Symbol ? Symbol.iterator : '@@iterator'] = createIterator
  obj.prototype.case = function (cases) { return obj.case(cases, this) }
  obj.prototype.caseOn = function (cases) { return obj.caseOn(cases, this) }

  for (let key in desc) {
    res = constructor(obj, key, desc[key])
  }
  return obj
}

Type.check = true

module.exports = Type
