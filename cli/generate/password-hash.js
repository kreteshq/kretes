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

const { spawn } = require('child_process');
const cwd = process.cwd();

const handler = ({ password }) => {
  const options = { cwd, stdio: 'inherit', shell: true };
  spawn(`echo ${password} | argon2-cli -e`, [], options);
};

module.exports = {
  command: 'password-hash <password>',
  builder: {},
  handler
};
