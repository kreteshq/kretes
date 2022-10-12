import { IAction } from "cliffy";

import { parse } from "path"

export const action: IAction = async (_options) => {
  // TODO brittle as hell :)

  // TODO check if installed
  // deno install --allow-read --allow-write --allow-env --allow-net --allow-run --no-check -r -f https://deno.land/x/deploy/deployctl.ts

  // TODO check if root e.g. deno.json

  const { base } = parse(Deno.cwd());

  const p = Deno.run({
    cmd: [
      "deployctl",
      "deploy",
      `--project=${base}`,
      "--import-map=import_map.json",
      "main.ts"
    ]
  });

  await p.status();
}

