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

function redirect(url, body = `Redirecting...`, statusCode = 302) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Location': url
    },
    body
  }
}

function render(content) {
  return {
    statusCode: 200,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
    body: content
  }
}

module.exports = { reply, redirect, render };

