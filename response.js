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

const OK = (body = '', headers = {}) => {
  return { headers, body };
};

const Created = (resource = '', headers = {}) => {
  return {
    statusCode: 201,
    headers,
    body: resource
  };
};

const Accepted = (body = '', headers = {}) => {
  return {
    statusCode: 202,
    headers,
    body
  };
};

const NoContent = (headers = {}) => {
  return {
    statusCode: 204,
    headers,
    body: ''
  };
};

const NotFound = (headers = {}) => {
  return {
    statusCode: 404,
    headers,
    body: ''
  };
};

const Redirect = (url, body = 'Redirecting...', statusCode = 302) => {
  return {
    statusCode,
    headers: { Location: url },
    type: 'text/plain',
    body
  };
};

const JSONPayload = (content, statusCode = 200) => {
  return {
    statusCode,
    body: JSON.stringify(content),
    type: 'application/json'
  };
};

const HTMLPage = content => {
  return {
    statusCode: 200,
    type: 'text/html',
    body: content
  };
};

const Unauthorized = () => {
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
  OK,
  Created,
  Accepted,
  Redirect,
  HTMLPage,
  JSONPayload,
  NotFound,
  NoContent,
  Unauthorized,
  Forbidden,
  InternalServerError
};
