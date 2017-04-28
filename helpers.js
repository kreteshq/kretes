// Copyright 2017 Zaiste & contributors. All rights reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

const nunjucks = require('nunjucks');
nunjucks.configure('views', { autoescape: true });

// XXX how to do `response` compression
function reply(content, statusCode = 200, type = 'text/html') {
  return {
    body: content,
    statusCode,
    type
  }
}

function json(content, statusCode = 200) {
  return {
    statusCode,
    body: JSON.stringify(content),
    headers: {
      'Content-Type': 'application/json'
    }
  }
}

function redirect(url) {
  return {
    statusCode: 302,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Location': url
    },
    body: `Redirecting to ${url}.`
  }
}

function render(view, bindings) {
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/html; charset=utf-8',
    },
    body: nunjucks.render(view, bindings)
  }
}

module.exports = { reply, redirect, render };

