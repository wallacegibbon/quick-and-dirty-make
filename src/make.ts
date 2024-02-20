import fs from "node:fs/promises";

export type MakeRule = {
	target: string,
	prerequisites: Array<string>,
	commands: Array<string>,
};

export type Makefile = {
	rules: Array<MakeRule>,
	finished_target: Set<string>,
};

type MakefileCreate = () => Makefile;

export let makefile_create: MakefileCreate = () => ({
	rules: [],
	finished_target: new Set(),
});

export let makefile_run = async (self: Makefile) => {
	if (self.rules.length === 0)
		throw new Error(`no rule was found in the makefile`);
	let first_rule = self.rules[0];
	await eval_rule(first_rule, self.rules, self.finished_target);
};

let target_timestamp = async (target_path: string) => {
	try {
		return (await fs.stat(target_path)).mtime.getTime();
	} catch (e: any) {
		throw new Error(`target ${target_path} was not found`);
	}
};

let eval_rule = async (current_rule: MakeRule, rules: Array<MakeRule>, finished: Set<string>) => {
	if (finished.has(current_rule.target))
		return;

	for (let p of current_rule.prerequisites) {
		let next_rule = rules.find(({target}) => target === p);
		if (next_rule === undefined) {
			await target_timestamp(p);
		} else {
			await eval_rule(next_rule, rules, finished);
		}
	}

	console.log(`running command "${current_rule.commands.join(" ")}"`);
	finished.add(current_rule.target);
};

