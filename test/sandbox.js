const tool = require('../toolchest')

const array = tool.range(1, 10)

tool.foldr(tool.add, 0, array)
