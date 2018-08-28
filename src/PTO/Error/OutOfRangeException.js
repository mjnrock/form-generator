import { AException } from "./AException.js";
import { EnumTagType } from "../Enum/EnumTagType.js";

export class OutOfRangeException extends AException {
	constructor(tagType, rangeMin, rangeMax, passedValue) {
		if(passedValue !== null && passedValue !== void 0) {
			passedValue = Number.isSafeInteger(passedValue) ? passedValue : passedValue.toExponential();
		} else {
			passedValue = "";
		}

		super(`Value is out of range for Tag ${EnumTagType.GetString(tagType)} [${tagType}]. Range is [${rangeMin}, ${rangeMax}].`, passedValue);
	}
}
