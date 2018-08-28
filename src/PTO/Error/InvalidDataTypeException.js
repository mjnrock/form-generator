import { AException } from "./AException.js";
import { EnumTagType } from "../Enum/EnumTagType.js";

export class InvalidDataTypeException extends AException {
	constructor(tagType, passedValue) {
		super(`Value is not of type ${EnumTagType.GetString(tagType)} [${tagType}].`, passedValue);
	}
}
