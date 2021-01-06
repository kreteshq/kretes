const debug = require('debug')('ks:machine:browser')

import {promises as fs} from 'fs';
import { join, dirname } from 'path';
import url from 'url';
import RE from '../regexp'
import MagicString from 'magic-string'
import Lexer from 'es-module-lexer'
import { App } from '../manifest';

const isDirectory = async path => {
  try {
    const stat = await fs.lstat(path);
    return stat.isDirectory();
  } catch (error) {
    return false;
  }
}

const rewrite = async (source: string, importer: string) => {
  try {
    await Lexer.init
    const [imports] = Lexer.parse(source)

    if (imports.length <= 0) {
      debug(`no imports in "${importer}"`)
      return source
    } else {
      debug(`rewriting "${importer}"`)
      const s = new MagicString(source)
      let isRewritten = false

      const oldImportees = App.Importees.get(importer)
      const importees = new Set<string>()
      App.Importees.set(importer, importees)

      for (let i = 0; i < imports.length; i++) {
        const { s: start, e: end, d: dynamicIndex } = imports[i]
        let id = source.substring(start, end)
        let isDynamicImport = false
        if (dynamicIndex >= 0) {
          const actualImportId = id.match(RE.IsQuotedString)
          if (actualImportId) {
            isDynamicImport = true
            id = actualImportId[1] || actualImportId[2]
          }
        }
        if (dynamicIndex === -1 || isDynamicImport) {
          let resolved

          if (RE.IsExternalURL.test(id)) continue

          if (RE.IsSpecialImport.test(id)) {
            resolved = `/${id}`
          } else if (RE.IsHotReloadImport.test(id)) {
            resolved = `/${id}`
          } else if (RE.IsFeature.test(id)) {
            resolved = `/${id}`.replace('@', '')
          } else if (RE.IsExternalImport.test(id)) {
            resolved = `/@modules/${id}`
          } else if (RE.IsFeaturesImport.test(id)) {
            resolved = `/features/${id}`
          } else if (RE.IsRelative.test(id)) {
            const p = join(process.cwd(), importer);
            const isDir = await isDirectory(p);
            resolved = !isDir ? join(dirname(importer), id) : join(importer, id);
          } else {
            resolved = id
          }

          if (resolved !== id) {
            debug(`'${id}' is rewritten to '${resolved}'`);
            const content = isDynamicImport ? `'${resolved}'` : resolved;
            s.overwrite(start, end, content);
            isRewritten = true;
          }

          const { pathname: importee } = url.parse(resolved)
          importees.add(importee)
          debug(`${importer} imports ${importee}`)

          const updatedImporters = App.Importers.get(importee) || new Set<string>();
          updatedImporters.add(importer);
          App.Importers.set(importee, updatedImporters)
        } else {
          console.log(`dynamic import ignored for 'import(${id})'`)
        }
      }

      // since the importees may have changed due to edits,
      // check if we need to remove this importer from certain importees
      if (oldImportees) {
        oldImportees.forEach((importee) => {
          if (!importees.has(importee)) {
            const importers = App.Importers.get(importee)
            if (importers) {
              importers.delete(importer)
            }
          }
        })
      }

      if (isRewritten) return s.toString()

      return source
    }
  } catch (error) {
    console.error(
      `error: cannot rewrite imports for ${importer}.\n`,
      error.message
    )
  }
}

export {
  rewrite
}
