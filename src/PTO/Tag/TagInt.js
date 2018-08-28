import { ATag } from "./ATag.js";
import { EnumTagType, EnumDataTypeRange } from "../Enum/_Enum.js";

export class TagInt extends ATag {
	constructor(key, value) {
		super(EnumTagType.INT, key, null);

		this.SetValues(value);
	}

	SetValues(value) {
		return super.SetValues(Int32Array, value);
	};
	SetValue(index, value) {
		return super.SetValue(Int32Array, EnumDataTypeRange.INT_MIN, EnumDataTypeRange.INT_MAX, index, value);
	};
	AddValue(value) {
		return super.AddValue(Int32Array, EnumDataTypeRange.INT_MIN, EnumDataTypeRange.INT_MAX, value);
	};
	RemoveValue(index) {
		return super.RemoveValue(Int32Array, index);
	};
	GetValue(index) {
		return super.GetValue(index);
	};

	GetBytePerValue() {
		return super.GetBytePerValue(4) * this.Value.length;
	};
}
