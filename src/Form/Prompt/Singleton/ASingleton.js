import { APrompt } from './../APrompt';

export class ASingleton extends APrompt {
	constructor(flag, responses = []) {
		super(flag, responses);
	}
}