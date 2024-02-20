import {makefile_run} from "./make";
import {sample_makefile2} from "./sample_makefile";

makefile_run(sample_makefile2)
	.catch(console.error);

