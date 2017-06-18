const { exec } = require('child_process');
const { basename } = require('path');
const cwd = process.cwd();

function handler(_) {
  const app = basename(cwd);
  console.log(`Creating database... ${app}`);
  const { stdout, stderr } = exec(`createdb ${app}`, { cwd })
  stdout.pipe(process.stdout);
  stderr.pipe(process.stderr);
}

module.exports = {
  command: 'create',
  builder: {},
  handler
};
