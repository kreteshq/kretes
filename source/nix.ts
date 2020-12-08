import color from 'chalk';
import { lookpath } from 'lookpath';

const checkNixInstalled = async () => {
  const isNixInstalled = await lookpath('nix-shell');
  if (!isNixInstalled) {
    console.error(`${color.red('Error'.padStart(10))}: Kretes requires the Nix package manager`);
    console.error(`${''.padStart(12)}${color.gray('https://nixos.org/guides/install-nix.html')}`);
    process.exit(1);
  }
}

import { println } from './util';

export const verifyIfInNixEnvironment = () => {
  const InNixEnvironment = process.env.IN_NIX_SHELL || false;
  if (!InNixEnvironment) {
    println(color`{yellow Warning} This command can be only run inside a Nix environment`)
    println(color`        Kretes works best combined with Nix`)
    println(color`        Follow the docs to learn more about it: `)
    process.exit(1);
  }
}
