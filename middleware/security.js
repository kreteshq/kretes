// Copyright 2020 Zaiste & contributors. All rights reserved.
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

// Copyright Zaiste. All rights reserved.
// Licensed under the Apache License, Version 2.0
const security = () => {
  return async (context, next) => {
    const { response } = context;

    response.setHeader('X-Download-Options', 'noopen');
    response.setHeader('X-Content-Type-Options', 'nosniff');
    response.setHeader('X-XSS-Protection', '1; mode=block');

    return next(context);
  };
};

module.exports = security;
