import {sample_makefile2} from "./sample_makefile";
import fs from "node:fs/promises";

export type MakeRule = {
	target: string,
	prerequisites: Array<string>,
	commands: Array<string>,
};

export type Makefile = {
	rules: Array<MakeRule>,
};

let makefile_run = async (self: Makefile) => {
	if (self.rules.length === 0)
		throw new Error(`no rule was found in the makefile`);
	let first_rule = self.rules[0];
	await eval_rule(first_rule, self.rules);
};

let target_timestamp = async (target_path: string) => {
	try {
		return (await fs.stat(target_path)).mtime.getTime();
	} catch (e: any) {
		throw new Error(`target ${target_path} was not found`);
	}
};

let eval_rule = async (current_rule: MakeRule, rules: Array<MakeRule>) => {
	for (let p of current_rule.prerequisites) {
		let next_rule = rules.find(({target}) => target === p);
		if (next_rule === undefined) {
			await target_timestamp(p);
		} else {
			await eval_rule(next_rule, rules);
		}
	}
	console.log(`running command "${current_rule.commands.join(" ")}"`);
};

makefile_run(sample_makefile2)
	.catch(console.error);

