import {exit} from "process";
import {makefile_create, makefile_run} from "./make";
import {parser_fsm_create, parser_run} from "./parser";

let start = async () => {
	let input_makefile = makefile_create();
	let parser_fsm = parser_fsm_create();

	if (process.argv.length !== 3) {
		console.error(`Usage: node main.js xxx.mk`);
		exit(1);
	}

	input_makefile.rules = await parser_run(parser_fsm, process.argv[2]);
	await makefile_run(input_makefile);
};

start()
	.catch(console.error);

