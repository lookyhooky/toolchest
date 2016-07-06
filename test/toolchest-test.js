/**
 * toolchest-test.js
 */

var beforeEach = require('mocha').beforeEach
var describe = require('mocha').describe
var it = require('mocha').it

var expect = require('chai').expect

var tools = require('../toolchest')

describe('toolchest', function () {
  var i, test, control, callback

  beforeEach(function () {
    i = 0
    test = false
    control = false
  })

  describe('#isString #isBoolean #isNumber', function () {
    it('should return true if argument type is of the proper type', function () {
      var types = {string: 'string', number: 1, boolean: true}
      tools.each(types, function (item, key) {
        var upcase = key.charAt(0).toUpperCase() + key.slice(1)
        test = tools['is' + upcase](item)
        expect(test).to.equal(typeof item === key)
      })
    })
    it('should return false if argument type is not of the proper type', function () {
      var isString = [1, true, false, {}, []]
      var isBoolean = [1, 'true', {}, []]
      var isNumber = [true, false, {}, 'one']
      tools.each(isString, function (item) {
        test = tools.isString(item)
        expect(test).to.equal.false
      })
      tools.each(isBoolean, function (item) {
        test = tools.isBoolean(item)
        expect(test).to.equal.false
      })
      tools.each(isNumber, function (item) {
        test = tools.isNumber(item)
        expect(test).to.equal.false
      })
    })
  })
})
