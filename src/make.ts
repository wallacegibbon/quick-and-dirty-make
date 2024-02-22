import fs from "node:fs/promises";
import child_process from "node:child_process";

type MakeTarget = string;

export type MakeRule = {
	target: MakeTarget,
	prerequisites: Array<MakeTarget>,
	commands: Array<string>,
};

export type Makefile = {
	rules: Array<MakeRule>,
	finished_target: Set<MakeTarget>,
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

let target_timestamp = async (target: MakeTarget) => {
	try {
		return (await fs.stat(target)).mtime.getTime();
	} catch (e: any) {
		return -1;
	}
};

let target_file_ensure = async (target: MakeTarget) => {
	let target_modify_time = await target_timestamp(target);
	if (target_modify_time === -1)
		throw new Error(`target ${target} was not found`);

	return target_modify_time;
};

/*
{
	target1: 1234,
	target2: {
		target3: 4567,
		target4: {
			target5: 7899,
		},
	},
};
*/
type EvalReturn = Map<MakeTarget, EvalReturn | number>;

type EvalRuleFn = (current_rule: MakeRule, rules: Array<MakeRule>, finished_target: Set<MakeTarget>) =>
	Promise<EvalReturn>;

let eval_rule: EvalRuleFn = async (current_rule, rules, finished_target) => {
	let result: EvalReturn = new Map();

	if (finished_target.has(current_rule.target))
		return result;

	for (let p of current_rule.prerequisites) {
		let next_rule = rules.find(({target}) => target === p);
		if (next_rule === undefined)
			result.set(p, await target_file_ensure(p));
		else
			result.set(p, await eval_rule(next_rule, rules, finished_target));
	}

	let prerequisite_time = calculate_max_time(result);
	let target_time = await target_timestamp(current_rule.target);

	if (prerequisite_time > target_time) {
		for (let c of current_rule.commands)
			await run_command(c);
	}

	finished_target.add(current_rule.target);
	return result;
};

let run_command = (command: string) => new Promise((res, rej) => {
	console.log(`running "${command}"`);
	child_process.exec(command, (error, _out, _err) => error ? rej(error) : res(0));
});

type CalculateMaxTimeRet = (time_tree: EvalReturn | number) => number;

let calculate_max_time: CalculateMaxTimeRet = (time_tree) => {
	if (typeof time_tree === "number")
		return time_tree;
	else
		return Array.from(time_tree.values()).map(calculate_max_time)
			.sort((a, b) => b - a)[0] ?? 0;
};

