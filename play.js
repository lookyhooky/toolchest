/**
 * Module Play
 *
 * Importing
 */

const tool = require('./toolchest')

const gt = tool.gt
const lte = tool.lte
const empty = tool.empty
const filter = tool.filter

/**
 * recursive version of foldl... slow as molasses
 */
const foldl = function (fn, acc, list) {
  let [x, ...xs] = list
  if (empty(xs)) { return x }
  reduce(fn, fn(acc, x), xs)
}

/**
 * quicksort :: (Ord a) => [a] -> [a]
 */
const quicksort = function (array) {
  if (empty(array)) {
    return []
  } else {
    let [x, ...xs] = array
    let smallerOrEqual = filter(lte(x), xs)
    let larger = filter(gt(x), xs)
    return [...quicksort(smallerOrEqual), x, ...quicksort(larger)]
  }
}

/**
 * Exposing
 */

module.exports = {
  quicksort
}
