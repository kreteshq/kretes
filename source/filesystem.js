const { readFile } = require('fs-extra');
const fg = require('fast-glob')

const memory = {}

const read = async (path, options = {}) => {
  const { cache } = options
  if (cache && memory[path]) { return new Promise(resolve => resolve(memory[path])) }
  const content = await readFile(path, { encoding: 'utf-8' })
  if (cache) { memory[path] = content }
  return content
}

const glob = async (patterns, options = {}) => fg(patterns, options)

const readAll = async (patterns, options = {}) => {
  const files = await glob(patterns);
  const promises = files.map(path => read(path, options));
  return Promise.all(promises).then(sources => {
    return sources.map((source, index) => {
      return {
        source,
        path: files[index]
      }
    });
  });
}

module.exports = {
  read,
  glob,
  readAll,
}
