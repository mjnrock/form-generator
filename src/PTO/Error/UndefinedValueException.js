import { AException } from "./AException.js";

export class UndefinedValueException extends AException {
	constructor(passedValue) {
		super(`Value is not defined.`, passedValue);
	}
}
