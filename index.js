/**
 * toolchest javascript
 * 
 * Comments : 
 *
 */

var slice = Array.prototype.slice
var toString = Object.prototype.toString

/**
 * Provides a set of practical tools not in the js base.
 *
 */
var toolchest = {
  /**
   * mixes one obj's functions with another obj
   */
  mixin: function(destination, source) {
    var key
    for (key in source) {
      if (source.hasOwnProperty(key) &&
          toString.call(source[key]) == '[object Function]') {
        destination[key] = source[key]
      }
    }
    return destination
  }  
}

module.exports = toolchest
