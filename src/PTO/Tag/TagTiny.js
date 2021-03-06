import { ATag } from "./ATag.js";
import { EnumTagType, EnumDataTypeRange } from "../Enum/_Enum.js";

export class TagTiny extends ATag {
	constructor(key, value) {
		super(EnumTagType.TINY, key, null);

		this.SetValues(value);
	}

	SetValues(value) {
		return super.SetValues(Int8Array, value);
	}
	SetValue(index, value) {
		return super.SetValue(
			Int8Array,
			EnumDataTypeRange.TINY_MIN,
			EnumDataTypeRange.TINY_MAX,
			index,
			value
		);
	}
	AddValue(value) {
		return super.AddValue(
			Int8Array,
			EnumDataTypeRange.TINY_MIN,
			EnumDataTypeRange.TINY_MAX,
			value
		);
	}
	RemoveValue(index) {
		return super.RemoveValue(Int8Array, index);
	}
	GetValue(index) {
		return super.GetValue(index);
	}
}
