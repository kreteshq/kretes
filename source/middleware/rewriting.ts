// Copyright Zaiste. All rights reserved.
// Licensed under the Apache License, Version 2.0

export const debug = require('debug')('ks:middleware:rewriting')

import { promises as fs } from 'fs';

import { HTMLString, MIME } from '../response';
import { rewrite } from '../machine/browser';
import RE from '../regexp';
import { App, HotReload } from '../manifest'

const DevelopmentSnippet = `
<script type="module">
import "${HotReload.URLPath}"
window.__DEV__ = true
window.process = { env: { NODE_ENV: 'development' }}
</script>`


const Rewriting = () => {
  return async (context: any, next: any) => {
    let response = await next()

    // WARNING Do not use destructuring before next()
    // i.e. in the middleware function signature - magic! ;)
    const { path, query } = context
    if (path === '/index.html') {
      let html = await fs.readFile(App.BaseHTML, 'utf-8')
      if (response.body) {
        let isAdded = false
        const importer = '/index.html'

        const matches = html!.matchAll(RE.IsHTMLScriptBody)
        for (const [match, tag, innerContent] of matches) {
          const IsDevelopmentSnippetAdded = isAdded ? `` : DevelopmentSnippet
          isAdded = true

          if (innerContent) {
            const rewritten = await rewrite(innerContent, importer)
            const replacement = `${IsDevelopmentSnippetAdded}${tag}${rewritten}</script>`

            html = html!.replace(match, replacement)
          } else {
            // TODO

            const srcAttribute = tag.match(RE.IsHTMLScriptSource)
            html = html!.replace(match, `${IsDevelopmentSnippetAdded}${match}`)
          }
        }

        response.body = html
      }

      return HTMLString(response.body)
    }

    if (
      response.body &&
      MIME.isJavaScript(response.type) &&
      !path.endsWith('.map') &&
      !path.startsWith(`/kretes/hot`) &&
      !(path.endsWith('.vue') && query.type != null)
    ) {
      const content = response.body
      response.body = await rewrite(content!, path)
    } else {
      debug(`skipped for ${path}`)
    }

    return response
  }
};

export default Rewriting;
