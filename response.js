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

const ok = (body = '', headers = {}) => {
  return { headers, body };
};

const created = (body = '', headers = {}) => {
  return {
    statusCode: 201,
    headers,
    body
  };
};

const accepted = (body = '', headers = {}) => {
  return {
    statusCode: 202,
    headers,
    body
  };
};

const noContent = (headers = {}) => {
  return {
    statusCode: 204,
    headers,
    body: ''
  };
};

const notFound = (headers = {}) => {
  return {
    status: 404,
    headers,
    body: ''
  };
};

const redirect = (url, body = 'Redirecting...', status = '302 Found') => {
  return {
    status,
    headers: { Location: url },
    type: 'text/plain',
    body
  };
};

const json = (content, statusCode = 200) => {
  return {
    statusCode,
    body: JSON.stringify(content),
    type: 'application/json'
  };
};

const html = content => {
  return {
    statusCode: 200,
    type: 'text/html',
    body: content
  };
};

const unauthorized = () => {
  return {
    statusCode: 401,
    // TODO add WWW-Authenticate
    body: ''
  };
};

const Forbidden = message => {
  return {
    statusCode: 403,
    body: message
  };
};

const InternalServerError = message => {
  return {
    statusCode: 500,
    body: message
  };
};

module.exports = {
  ok,
  created,
  accepted,
  redirect,
  html,
  json,
  notFound,
  noContent,
  unauthorized,
  Forbidden,
  InternalServerError
};
