// Copyright 2019 Zaiste & contributors. All rights reserved.
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

// TODO auto-create those functions?

const ok = (body = '', headers = {}) => ({ status: '200 OK', headers, body });
const created = (body = '', headers = {}) => ({
  status: '201 Created',
  headers,
  body
});
const accepted = (body = '', headers = {}) => ({
  status: '202 Accepted',
  headers,
  body
});
const noContent = (headers = {}) => ({
  status: '204 No Content',
  headers,
  body: ''
});
const notFound = (headers = {}) => ({
  status: '404 Not Found',
  headers,
  body: ''
});
const redirect = (url, body = 'Redirecting...', status = '302 Found') => ({
  status,
  headers: { Location: url },
  type: 'text/plain',
  body
});

const json = (content, status = '200 OK') => ({
  status,
  body: JSON.stringify(content),
  type: 'application/json'
});

const html = content => ({
  status: '200 OK',
  type: 'text/html',
  body: content
});

const unauthorized = () => ({
  status: '401 OK',
  type: 'text/html',
  // TODO add WWW-Authenticate
  body: ''
});

module.exports = {
  ok,
  created,
  accepted,
  redirect,
  html,
  json,
  notFound,
  noContent,
  unauthorized
};
