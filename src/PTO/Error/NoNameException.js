import { AException } from "./AException.js";

export class NoNameException extends AException {
	constructor(passedValue) {
		super(`The 'name' attribute is required on this function.`, passedValue);
	}
}
