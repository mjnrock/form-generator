import { EnumSerialization } from "../Enum/_Enum.js";
import { OutOfRangeException } from "../Error/_Error.js";
import { TagCompound, TagList } from "./_Tag.js";

export class ATag {
	constructor(type, key, value) {
		this.Type = type;
		this.Key = key;
		this.Value = value;
	}

	GetSchema(id = 1, pid = 0, depth = "") {
		return `${depth}${id}.${pid}.${this.Type}`;
	}

	GetType() {
		return this.Type;
	}
	SetType(type) {
		this.Type = type;

		return this;
	}

	GetKey() {
		return this.Key;
	}
	SetKey(key) {
		this.Key = key;

		return this;
	}

	GetValues() {
		return this.Value;
	}
	SetValues(array, value) {
		if(typeof value === "number") {
			this.Value = array.of(value);
		} else if(typeof value === "string" || value instanceof String) {
			this.Value = array.of(value);
		} else if(value && value.length > 0) {
			this.Value = array.of(...value);
		} else {
			this.Value = new array();
		}

		return this;
	};

	IsEmpty() {
		return this.Value !== null && this.Value !== void 0;
	};
	SetValue(array, min, max, index, value) {
		if(value >= min && value <= max) {
			let arr = [...this.Value];
			arr[index] = +value;
			this.Value = array.of(...arr);
		} else if(value < min || value > max) {
			throw new OutOfRangeException(this.Type, min, max, value);
		}

		return this;
	};
	AddValue(array, min, max, value) {
		if(value >= min && value <= max) {
			let arr = [...this.Value];
			arr.push(+value);
			this.Value = array.of(...arr);
		} else if(value < min || value > max) {
			throw new OutOfRangeException(this.Type, min, max, value);
		}

		return this;
	};
	RemoveValue(array, index) {
		let arr = [...this.Value];
		arr.splice(index, 1);
		this.Value = array.of(...arr);

		return this;
	};
	GetValue(index) {
		if(this.Value !== null && this.Value !== void 0) {
			return this.Value[index];
		}

		return null;
	};

	GetBuffer() {
		if(!this.IsEmpty()) {
			if(this.Value["buffer"] !== null && this.Value["buffer"] !== void 0) {
				return this.Value.buffer;
			}
		}

		return null;
	};

	GetBytePerValue(size = 1) {
		return 1 * size;
	};
	GetByteLength() {
		let bytes = 0;
		++bytes;    //  Tag Type
		++bytes;    //  Key Length
		bytes += this.Key.length;
		++bytes;    //  Value Length

		if(this instanceof TagCompound || this instanceof TagList) {
			++bytes; //  Amount of child Tags
		} else {
			bytes += this.Value.BYTES_PER_ELEMENT * this.Value.length;  //  Size of payload in bytes
		}

		return bytes;
	};

	Serialize(level, type, key, value, append) {
		level = (level === null || level === void 0) ? EnumSerialization.STRING : level;
		let obj = {
			Type: (type === null || type === void 0) ? this.GetType() : type,
			Key: (key === null || key === void 0) ? this.GetKey() : key,
			Value: (value === null || value === void 0) ? [...this.GetValues()] : value
		};

		if(append !== null && append !== void 0) {
			for(let i in append) {
				obj[i] = append[i];
			}
		}

		switch(level) {
			case EnumSerialization.OBJECT:
				return obj;
			case EnumSerialization.STRING:
				return JSON.stringify(obj);
			case EnumSerialization.JSON:
				return JSON.stringify(JSON.stringify(obj));
			default:
				return JSON.stringify(obj);
		}
	};
	Deserialize(json) {
		while(typeof json === "string" || json instanceof String) {
			json = JSON.parse(json);
		}

		this.SetType(+json.Type);
		this.SetKey(json.Key);
		this.SetValues(json.Value);

		return this;
	};
}
