type MakeRule = {
	target: string,
	prerequisites: Array<string>,
	commands: Array<string>,
};

type Makefile = {
	rules: Array<MakeRule>,
};

let makefile_run = (self: Makefile) => {
	if (self.rules.length === 0)
		throw new Error(`no rule was found in the makefile`);
	let first_rule = self.rules[0];
	eval_rule(first_rule, self.rules);
};

let eval_rule = (current_rule: MakeRule, rules: Array<MakeRule>) => {
	for (let p of current_rule.prerequisites) {
		let next_rule = rules.find(({target}) => target === p);
		if (next_rule === undefined)
			continue;
		eval_rule(next_rule, rules);
	}
	console.log(`running command "${current_rule.commands.join(" ")}"`);
};

let sample_makefile: Makefile = {
	rules: [
		{
			target: "build/main.hex",
			prerequisites: ["build/main.elf"],
			commands: ["objcopy -O ihex build/main.hex build/main.elf"],
		},
		{
			target: "build/main.elf",
			prerequisites: ["main.o", "blah.o"],
			commands: ["cc main.o blah.o -o build/main.elf"],
		},
		{
			target: "main.o",
			prerequisites: ["main.c", "blah.h"],
			commands: ["cc -c main.c -o main.o"],
		},
		{
			target: "blah.o",
			prerequisites: ["blah.c", "blah.h"],
			commands: ["cc -c blah.c -o blah.o"],
		},
	],
};

makefile_run(sample_makefile);

