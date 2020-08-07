const debug = require('debug')('ks:machine:vue')

import { promises as fs } from 'fs'
import path from 'path'
import color from 'chalk'
import {
  SFCDescriptor,
  SFCTemplateBlock,
  SFCBlock,
  CompilerError,
} from '@vue/compiler-sfc'
import hash_sum from 'hash-sum'

import { generateSourceMap } from '../util';
import { Vue, App } from '../manifest'

export const isEqual = (a: SFCBlock | null, b: SFCBlock | null) => {
  if (!a && !b) return true
  if (!a || !b) return false
  if (a.content !== b.content) return false

  const keysA = Object.keys(a.attrs)
  const keysB = Object.keys(b.attrs)
  if (keysA.length !== keysB.length) return false

  return keysA.every((key) => a.attrs[key] === b.attrs[key])
}

export const parse = async (
  fsPath: string,
  content?: string
): Promise<SFCDescriptor | undefined> => {
  if (!content) {
    try {
      content = await fs.readFile(fsPath, 'utf-8')
    } catch (error) {
      return
    }
  }

  const { descriptor, errors } = Vue.Compiler.parse(content, {
    filename: fsPath,
    sourceMap: true
  })
  if (errors.length) {
    console.error(color`\n{red Error} Vue parsing: `)
    for (let error of errors) {
      printError(fsPath, error);
    }
  }

  return descriptor
}

export const compile = async (
  { script, template }: SFCDescriptor,
  fsPath: string,
  urlPath: string
): Promise<string> => {
  let compiled = ''
  if (script) {
    let content = script.content
    // TODO Generalize it to other file extensions
    if (script.lang === 'ts') {
      debug('transpiling a TypeScript file')
      const transpiled = await App.transpile(content, { loader: 'ts' });
      content = transpiled
    }

    compiled += content.replace(`export default`, 'const __script =')
  } else {
    compiled += `const __script = {}`
  }

  if (template) {
    const id = JSON.stringify(`${urlPath}?type=template`)
    compiled += `
      import { render as __render } from ${id}
      __script.render = __render`;
  }

  compiled += `
    __script.__hmrId = ${JSON.stringify(urlPath)}
    __script.__file = ${JSON.stringify(fsPath)}
    export default __script`;

  if (script) {
    compiled += generateSourceMap(script.map)
  }

  return compiled
}

export const compileTemplate = (
  { content: source, map: inMap }: SFCTemplateBlock,
  fsPath: string,
  urlPath: string,
  scoped: boolean
): string => {
  const { code, map, errors } = Vue.Compiler.compileTemplate({
    source,
    filename: fsPath,
    inMap,
    transformAssetUrls: {
      base: path.posix.dirname(urlPath)
    },
    compilerOptions: {
      scopeId: scoped ? `data-v-${hash_sum(urlPath)}` : null,
      runtimeModuleName: '/@modules/vue'
    }
  })

  if (errors.length) {
    console.error(color`\n Vue template compilation error: `)
    for (const error of errors) {
      (typeof error === 'string')
        ? console.error(error)
        : printError(fsPath, error);
    }
  }

  const finalCode = code + generateSourceMap(map);
  return finalCode
}

const printError = (fsPath: string, { message }: CompilerError | SyntaxError) => {
  console.error(`${fsPath}`);
  console.error(message);
}
