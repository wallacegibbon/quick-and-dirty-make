import {makefile_create} from "./make";

export let sample_makefile1 = makefile_create();

sample_makefile1.rules = [
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
];


/*
date1.txt: date2.txt date3.txt
	echo building date1.txt
date2.txt: date3.txt
	echo building date2.txt
date3.txt: date4.txt
	cp date4.txt date3.txt
	echo building date3.txt
*/

export let sample_makefile2 = makefile_create();

sample_makefile2.rules = [
	{
		target: "date1.txt",
		prerequisites: ["date2.txt", "date3.txt"],
		commands: ["echo building date1.txt"],
	},
	{
		target: "date2.txt",
		prerequisites: ["date3.txt"],
		commands: ["echo building date2.txt"],
	},
	{
		target: "date3.txt",
		prerequisites: ["date4.txt"],
		commands: ["echo building date3.txt"],
	},
];
