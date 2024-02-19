import {Makefile} from "./make";

export let sample_makefile1: Makefile = {
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

/*
target1: target2 target3
	echo building target1
target2: target3
	echo building target2
target3: date.txt
	echo building target3
 */
export let sample_makefile2: Makefile = {
	rules: [
		{
			target: "target1",
			prerequisites: ["target2", "target3"],
			commands: ["echo building target1"],
		},
		{
			target: "target2",
			prerequisites: ["target3"],
			commands: ["echo building target2"],
		},
		{
			target: "target3",
			prerequisites: ["date.txt"],
			commands: ["echo building target3"],
		},
	],
};
