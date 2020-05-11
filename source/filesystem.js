const { readFile } = require('fs-extra');

const memory = {}

const read = async (path, options = {}) => {
  const { cache } = options
  if (cache && memory[path]) { return new Promise(resolve => resolve(memory[path])) }
  const content = await readFile(path, { encoding: 'utf-8' })
  if (cache) { memory[path] = content }
  return content
}

module.exports = {
  read
}
