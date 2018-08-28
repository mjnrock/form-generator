import { ATag } from "./ATag.js";
import { EnumTagType, EnumDataTypeRange } from "../Enum/_Enum.js";

export class TagShort extends ATag {
	constructor(key, value) {
		super(EnumTagType.SHORT, key, null);

		this.SetValues(value);
	}

	SetValues(value) {
		return super.SetValues(Int16Array, value);
	}
	SetValue(index, value) {
		return super.SetValue(
			Int16Array,
			EnumDataTypeRange.SHORT_MIN,
			EnumDataTypeRange.SHORT_MAX,
			index,
			value
		);
	}
	AddValue(value) {
		return super.AddValue(
			Int16Array,
			EnumDataTypeRange.SHORT_MIN,
			EnumDataTypeRange.SHORT_MAX,
			value
		);
	}
	RemoveValue(index) {
		return super.RemoveValue(Int16Array, index);
	}
	GetValue(index) {
		return super.GetValue(index);
	}

	GetBytePerValue() {
		return super.GetBytePerValue(2) * this.Value.length;
	}
}
