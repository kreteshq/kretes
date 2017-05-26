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

// XXX auto-create those functions?

function ok(body = '', headers = {}) {
  return { statusCode: 200, headers, body }
}

function created(body = '', headers = {}) {
  return { statusCode: 201, headers, body }
}

function accepted(body = '', headers = {}) {
  return { statusCode: 202, headers, body }
}

function noContent(headers = {}) {
  return { statusCode: 204, headers, body: '' }
}

function redirect(url, body = `Redirecting...`, statusCode = 302) {
  return {
    statusCode,
    headers: { 'Location': url },
    type: 'text/plain',
    body
  }
}

function json(content, statusCode = 200) {
  return {
    statusCode,
    body: JSON.stringify(content),
    type: 'application/json',
  }
}

function html(content) {
  return {
    statusCode: 200,
    type: 'text/html',
    body: content,
  }
}

module.exports = {
  ok,
  created,
  accepted,
  redirect,
  html,
  json
}
