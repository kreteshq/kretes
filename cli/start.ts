import type { IAction } from "cliffy";
import { expandGlob } from "fs";
import { Manifest } from "../types.ts";

import { convertFilenameToPathname, generate } from "../util.ts";

export const action: IAction = async (_options) => {
	// (re-) generate manifest

	const entries = [];
	for await (const entry of expandGlob("routes/**/*.{ts,tsx}")) {
		const filename = entry.path.split("routes/").pop()!;
		const pathname = convertFilenameToPathname(filename);

		entries.push({ filename, pathname });
	}

	await generate(entries);

	const p = Deno.run({
		cmd: [
			"deno",
			"run",
			"-A",
			"--unstable",
			"--watch=static/,routes/",
			"main.ts",
		],
	});

	await p.status();
};
