import fs from "node:fs/promises";
import {MakeRule} from "./make";

type ParserState = "normal" | "wait_for_command";

type ParserFSM = {
	state: ParserState,
	result: Array<MakeRule>,
	current_rule: MakeRule | null,
};

export let parser_fsm_create: () => ParserFSM = () => ({
	state: "normal",
	result: [],
	current_rule: null,
});

type CheckTargetFn = (line: string) => MakeRule | null;

let check_target: CheckTargetFn = (line: string) => {
	let result = /^([^:]+)\s*:\s*(.*)/.exec(line);
	if (result !== null)
		return {target: result[1], prerequisites: result[2].split(/\s+/).filter(x => x), commands: []};
	else
		return null;
};

let check_command = (line: string) => {
	let result = /^\t\s*(.*)/.exec(line);
	if (result !== null)
		return result[1];
	else
		return null;
};

let parser_step_normal = (self: ParserFSM, current_line: string) => {
	if (check_command(current_line) !== null)
		throw new Error(`command do not belong to any target`);

	let rule = check_target(current_line);
	if (rule === null)
		throw new Error(`syntax error`);

	self.current_rule = rule;
	self.state = "wait_for_command";
};

let parser_step_wait_for_command = (self: ParserFSM, current_line: string) => {
	if (self.current_rule === null)
		throw new Error(`current_rule should not be null here`);

	if (check_target(current_line)) {
		self.result.push(self.current_rule);
		parser_step_normal(self, current_line);
		return;
	}

	let command = check_command(current_line);
	if (command !== null)
		self.current_rule.commands.push(command);
};

let parser_step = (self: ParserFSM, current_line: string) => {
	if (self.state === "normal")
		return parser_step_normal(self, current_line);
	if (self.state === "wait_for_command")
		return parser_step_wait_for_command(self, current_line);

	throw new Error(`unexpected state: ${self.state}`);
};

export let parser_run = async (self: ParserFSM, inputfile: string) => {
	let lines = (await fs.readFile(inputfile)).toString()
		.split("\n")
		.filter(x => x.trim())
		.map(x => x.trimEnd());

	for (let line of lines)
		parser_step(self, line);

	self.result.push(self.current_rule!);
	return self.result;
};

