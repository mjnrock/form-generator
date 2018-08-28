import * as Tag from "../Tag/_Tag.js";

export const EnumTagType = Object.freeze({
	INT: 1,
	STRING: 2,
	SHORT: 3,
	TINY: 4,
	LONG: 5,
	BOOL: 6,
	FLOAT: 7,
	DOUBLE: 8,
	LIST: 9,
	COMPOUND: 10,
	CHARACTER: 11,
	UUID: 12,

	GetString: value => {
		let keys = Object.keys(EnumTagType);

		for(let i in keys) {
			if(EnumTagType[keys[i]] === value) {
				return keys[i];
			}
		}
	},

	GetClass: value => {
		switch(value) {
			case EnumTagType.INT:
				return Tag.TagInt;
			case EnumTagType.STRING:
				return Tag.TagString;
			case EnumTagType.SHORT:
				return Tag.TagShort;
			case EnumTagType.TINY:
				return Tag.TagTiny;
			case EnumTagType.LONG:
				return Tag.TagLong;
			case EnumTagType.BOOL:
				return Tag.TagBoolean;
			case EnumTagType.FLOAT:
				return Tag.TagFloat;
			// case EnumTagType.DOUBLE:
			// 	return Tag.TagDouble;
			case EnumTagType.LIST:
				return Tag.TagList;
			case EnumTagType.COMPOUND:
				return Tag.TagCompound;
			case EnumTagType.CHARACTER:
				return Tag.TagCharacter;
			case EnumTagType.UUID:
				return Tag.TagUUID;
			default:
				console.log(`ERROR`);
				break;
		}
	},

	GetAvroType: value => {
		switch(value) {
			case EnumTagType.INT:
				return "int";
			case EnumTagType.STRING:
				return "string";
			case EnumTagType.SHORT:
				return "int";
			case EnumTagType.TINY:
				return "int";
			case EnumTagType.LONG:
				return "long";
			case EnumTagType.BOOL:
				return "boolean";
			case EnumTagType.FLOAT:
				return "float";
			case EnumTagType.DOUBLE:
				return "double";
			case EnumTagType.LIST:
				return "array";
			case EnumTagType.COMPOUND:
				return "record";
			case EnumTagType.CHARACTER:
				return "string";
			case EnumTagType.UUID:
				return "string";
			default:
				console.log(`ERROR`);
				break;
		}
	},

	GetEnum: value => {
		switch(value) {
			case "Int" || "TagInt":
				return EnumTagType.INT;
			case "String" || "TagString":
				return EnumTagType.STRING;
			case "Short" || "TagShort":
				return EnumTagType.SHORT;
			case "Tiny" || "TagTiny":
				return EnumTagType.TINY;
			case "Long" || "TagLong":
				return EnumTagType.LONG;
			case "Boolean" || "TagBoolean":
				return EnumTagType.BOOL;
			case "Float" || "TagFloat":
				return EnumTagType.FLOAT;
			case "Double" || "TagDouble":
				return EnumTagType.DOUBLE;
			case "List" || "TagList":
				return EnumTagType.LIST;
			case "Compound" || "TagCompound":
				return EnumTagType.COMPOUND;
			case "Character" || "TagCharacter":
				return EnumTagType.CHARACTER;
			case "UUID" || "TagUUID":
				return EnumTagType.UUID;
			default:
				console.log(`ERROR`);
				break;
		}
	}
});
