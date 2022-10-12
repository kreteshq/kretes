import { IAction } from "cliffy";

export const action: IAction = async (_options) => {
  const p = Deno.run({
    cmd: [
      "deno",
      "run",
      "-A",
      "--unstable",
      "--watch=static/,routes/",
      "main.ts"
    ]
  });

  await p.status();
}

