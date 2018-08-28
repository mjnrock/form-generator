import * as Enum from "../Enum/_Enum.js";
import * as Tag from "../Tag/_Tag.js";
import {
	IncorrectParameterCount,
	NoNameException,
	UnsafeIntegerRangeException
} from "../Error/_Error.js";
import { ByteBuffer } from "./ByteBuffer.js";
//import default from './../../Form/Helper';

export class Transformer {
	static GenerateUUID() {
		let d = new Date().getTime();
		let uuid = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
			/[xy]/g,
			function(c) {
				let r = ((d + Math.floor(Math.random() * 17)) % 16) | 0;
				d = Math.floor(d / 16);
				// eslint-disable-next-line
				return (c == "x" ? r : (r & 0x3) | 0x8).toString(16);
			}
		);

		return uuid.toUpperCase();
	}

	//	FAILURE: Reads the TagCompound itself, NOT the contents
	static InferTagStructure(name, json, throwErrors) {
		if (arguments.length !== 2 && arguments.length !== 3) {
			throw new IncorrectParameterCount(2, arguments.length, [
				...arguments
			]);
		}
		//  Activate to throw "Correctable" errors [TRUE], or instead auto-compensate for them [FALSE]
		if (throwErrors === null || throwErrors === void 0) {
			throwErrors = false;
		}
		if (name === null || name === void 0) {
			throw new NoNameException(name);
		}
		while (typeof json === "string" || json instanceof String) {
			json = JSON.parse(json);
		}

		let tc = new Tag.TagCompound(name);
		for (let i in json) {
			let t;
			if (
				typeof json[i] === "number" ||
				typeof json[i] === "string" ||
				json[i] instanceof String
			) {
				json[i] = json[i].toString();
				if (json[i].match(/^-?\d+$/gi)) {
					if (Number.isSafeInteger(+json[i])) {
						if (
							json[i] >= Enum.EnumDataTypeRange.INT_MIN &&
							json[i] <= Enum.EnumDataTypeRange.INT_MAX
						) {
							t = new Tag.TagInt(i);
						} else if (
							json[i] >= Enum.EnumDataTypeRange.LONG_MIN &&
							json[i] <= Enum.EnumDataTypeRange.LONG_MAX
						) {
							t = new Tag.TagLong(i);
						}
					} else {
						if (!!throwErrors) {
							throw new UnsafeIntegerRangeException(+json[i]);
						} else {
							console.log(
								`[WARNING]: Input value (${(+json[
									i
								]).toExponential()}) has exceeded the JavaScript Safe Integer thresholds.  Converting to "TagString", instead.`
							);
							t = new Tag.TagString(i);
						}
					}
				} else if (json[i].match(/^\d+\.?\d*&/gi)) {
					t = new Tag.TagFloat(i);
				} else {
					t = new Tag.TagString(i);
				}
				t.SetValues(json[i]);
			} else if (json[i] instanceof Array) {
				t = new Tag.TagList(i);
				let c = Transformer.InferTagStructure(i, json[i]);
				if (c && Object.keys(c.Value).length > 0) {
					let values = Object.values(c.Value),
						types = values.map((t) => t.Type);

					if (
						types.length !==
						types.filter((t) => t === types[0]).length
					) {
						//  Heterogenous
						let compositeTags = values.filter(
							(t) =>
								t instanceof Tag.TagCompound ||
								t instanceof Tag.TagList
						);
						if (
							(compositeTags.length > 0 &&
								compositeTags.filter((t) => t.Size() > 0)
									.length === 0) ||
							(compositeTags.length === 0 &&
								types.includes(Enum.EnumTagType.STRING))
						) {
							//  Has Composite AND All Values are empty
							//  No Composite AND Contains at least 1 TagString, thus implies an array of Strings
							let firstPrimitive = types.filter(
									(t) =>
										t === types[0] &&
										t !== Enum.EnumTagType.COMPOUND &&
										t !== Enum.EnumTagType.LIST
								)[0],
								tag = Enum.EnumTagType.GetClass(firstPrimitive);
							t.ContentType = firstPrimitive;
							for (let j in values) {
								let v = values[j];
								if (values[j].Type !== firstPrimitive) {
									v = new tag(values[j].Key);

									if (values[j].Value.length !== void 0) {
										v.SetValues(values[j].Value.toString());
									}
								}
								t.AddValue(v);
							}
						} else {
							//  Everything else
							t = new Tag.TagCompound(i);
							let c = Transformer.InferTagStructure(i, json[i]);
							t.Value = c.Value;
						}
					} else {
						//  Homogenous
						t.ContentType = types[0];
						t.Value = values;
					}
				}
			} else if (typeof json[i] === "object") {
				t = new Tag.TagCompound(i);
				let c = Transformer.InferTagStructure(i, json[i]);
				t.Value = c.Value;
			}
			tc.AddTag(t);
		}

		return tc;
	}

	static ToBuffer(input) {
		let obj = Transformer.FlattenTagStructure(input),
			bytes = 0;

		obj.forEach(function(tag) {
			bytes += tag.GetByteLength();
		});

		//  Buffer: TYPE [1] | KEY_LENGTH [1] | KEY [1 * Key.Length] | VALUE_LENGTH [1] | VALUE(S) [variable]
		let BB = new ByteBuffer(bytes);
		obj.forEach(function(tag) {
			BB.WriteTiny(tag.GetType(), false); //  TYPE
			BB.WriteTiny(tag.GetKey().length, false); //  KEY_LENGTH
			BB.WriteString(tag.GetKey()); //  KEY

			if (tag instanceof Tag.TagCompound || tag instanceof Tag.TagList) {
				BB.WriteTiny(1); //  VALUE_LENGTH

				if (tag instanceof Tag.TagList) {
					//  Array (at this point) would be VALUE_LENGTH | CONTENT_TYPE | VALUE...
					BB.WriteTiny(tag.GetContentType()); //  (Array Only) CONTENT_TYPE
				}

				BB.WriteTiny(tag.Size()); //  VALUE
			} else if (input instanceof Tag.ATag) {
				BB.WriteTiny(Array.from(tag.Value).length); //  VALUE_LENGTH

				switch (tag.GetType()) { //  VALUE
					case Enum.EnumTagType.BOOL:
						BB.WriteBoolean(Array.from(tag.Value));
						break;

					case Enum.EnumTagType.TINY:
						BB.WriteTiny(Array.from(tag.Value));
						break;
					case Enum.EnumTagType.SHORT:
						BB.WriteShort(Array.from(tag.Value));
						break;
					case Enum.EnumTagType.INT:
						BB.WriteInt(Array.from(tag.Value));
						break;
					case Enum.EnumTagType.LONG:
						BB.WriteInt(Array.from(tag.Value));
						break;

					case Enum.EnumTagType.FLOAT:
						BB.WriteInt(Array.from(tag.Value));
						break;
					case Enum.EnumTagType.DOUBLE:
						BB.WriteDouble(Array.from(tag.Value));
						break;

					case Enum.EnumTagType.CHARACTER:
						BB.WriteTiny(Array.from(tag.Value));
						break;
					case Enum.EnumTagType.STRING:
						BB.WriteTiny(Array.from(tag.Value));
						break;
					default:
						console.log(`ERROR`);
						break;
				}
			}
		});

		return BB.ResetPosition();
	}
	static FromBuffer(BB) {
		let tags = [];
		while (BB.Position < BB.DV.byteLength) {
			let id = BB.ReadTiny(1, false)[0],
				keyLength = BB.ReadTiny(1, false)[0],
				key = BB.ReadString(keyLength),
				valueLength = BB.ReadTiny(1, false)[0];

			let tag = new (Enum.EnumTagType.GetClass(id))(key);
			if (tag instanceof Tag.TagCompound) {
				tag.CHILD_COUNT = BB.ReadTiny(1, false)[0]; //  Temporarily hold the amount of children this Tag contains
			} else if (tag instanceof Tag.TagList) {
				//  Array (at this point) would be CONTENT_TYPE | VALUE...
				tag.SetContentType(BB.ReadTiny(1, false)[0]);
				tag.CHILD_COUNT = BB.ReadTiny(1, false)[0]; //  Temporarily hold the amount of children this Tag contains
			} else if (tag instanceof Tag.ATag) {
				let cacheString = [];

				for (let i = 0; i < valueLength; i++) {
					switch (id) {
						case Enum.EnumTagType.BOOL:
							tag.AddValue(BB.ReadBoolean(1)[0]);
							break;

						case Enum.EnumTagType.TINY:
							tag.AddValue(BB.ReadTiny(1)[0]);
							break;
						case Enum.EnumTagType.SHORT:
							tag.AddValue(BB.ReadShort(1)[0]);
							break;
						case Enum.EnumTagType.INT:
							tag.AddValue(BB.ReadInt(1)[0]);
							break;
						case Enum.EnumTagType.LONG:
							tag.AddBufferValue(BB.ReadInt(1)[0]);
							break;

						case Enum.EnumTagType.FLOAT:
							tag.AddBufferValue(BB.ReadInt(1)[0]);
							break;
						case Enum.EnumTagType.DOUBLE:
							tag.AddValue(BB.ReadDouble(1)[0]);
							break;

						case Enum.EnumTagType.CHARACTER:
							cacheString.push(BB.ReadTiny(1, false)[0]);
							break;
						case Enum.EnumTagType.STRING:
							cacheString.push(BB.ReadTiny(1, false)[0]);
							break;
						default:
							console.log(`ERROR`);
							break;
					}
				}

				if (cacheString.length > 0) {
					let s = "";
					cacheString.forEach((c) => (s += String.fromCharCode(c)));
					tag.SetValues(s);
				}
			}
			tags.push(tag);
		}

		BB.ResetPosition();
		return Transformer.UnflattenTagStructure(tags);
	}

	static FlattenTagStructure(input, array) {
		if (array === null || array === void 0) {
			array = [];
		}

		if (input instanceof Tag.TagCompound || input instanceof Tag.TagList) {
			array.push(input);
			let tags = input.Value;
			for (let i in tags) {
				Transformer.FlattenTagStructure(tags[i], array);
			}
		} else if (input instanceof Tag.ATag) {
			array.push(input);
		}

		return array;
	}
	static UnflattenTagStructure(tagList) {
		if (tagList.length > 0) {
			let e = tagList[0];

			if (e instanceof Tag.TagCompound) {
				for (let i = 0; i < e.CHILD_COUNT; i++) {
					tagList.shift();
					e.AddTag(Transformer.UnflattenTagStructure(tagList));
				}

				delete e.CHILD_COUNT; //  Delete this temp variable
				return e;
			} else if (e instanceof Tag.TagList) {
				for (let i = 0; i < e.CHILD_COUNT; i++) {
					tagList.shift();
					e.AddValue(Transformer.UnflattenTagStructure(tagList));
				}

				delete e.CHILD_COUNT; //  Delete this temp variable
				return e;
			} else if (e instanceof Tag.ATag) {
				return e;
			}
		}

		return tagList;
	}

	static ToHierarchy(tag, array, parentID) {
		if (array === null || array === void 0) {
			array = [];
		}
		if (parentID === void 0) {
			parentID = null;
		}

		let ID = array.length + 1;
		array.push({
			ID: ID,
			ParentID: parentID,
			Tag: tag
		});

		if (tag instanceof Tag.TagCompound || tag instanceof Tag.TagList) {
			for (let i in tag.Value) {
				array = Transformer.ToHierarchy(tag.Value[i], array, ID);
			}
		}

		return array;
	}
	static FromHierarchy(array) {
		if (array === null || array === void 0) {
			array = [];
		}

		if (
			array.length > 0 &&
			(array[0] && array[0].Tag instanceof Tag.ATag)
		) {
			let arr = {},
				minID = array[0].ID;
			for (let i in array) {
				let ID = array[i].ID,
					parentID = array[i].ParentID,
					tag = array[i].Tag;

				minID = ID < minID ? ID : minID;
				arr[ID] = tag;
				if (arr[parentID] instanceof Tag.TagCompound) {
					arr[parentID].AddTag(arr[ID]);
				} else if (arr[parentID] instanceof Tag.TagList) {
					arr[parentID].AddValue(arr[ID]);
				}
			}

			return arr[minID];
		}

		return array;
	}

	static ToDelimited(tagCompound, delimiters, hasHeaders, makeTextReadible) {
		if (hasHeaders === null || hasHeaders === void 0) {
			hasHeaders = true;
		}
		if (makeTextReadible === null || makeTextReadible === void 0) {
			makeTextReadible = true;
		}

		let s,
			d1 = delimiters && delimiters[0] ? delimiters[0] : ",",
			d2 = delimiters && delimiters[1] ? delimiters[1] : "|";

		if (tagCompound instanceof Array) {
			s = tagCompound;
		} else {
			s = Transformer.ToHierarchy(tagCompound);
		}

		let csv = !!hasHeaders ? "ID,ParentID,TagType,Key,Value,Extra\n" : "";
		for (let i in s) {
			let row = [
				+s[i].ID,
				s[i].ParentID === null ? null : +s[i].ParentID,
				+s[i].Tag.GetType(),
				s[i].Tag.GetKey().toString()
			];
			if (s[i].Tag instanceof Tag.TagCompound) {
				row.push(+s[i].Tag.Size());
				row.push(null);
			} else if (s[i].Tag instanceof Tag.TagList) {
				row.push(+s[i].Tag.Size());
				row.push(+s[i].Tag.GetContentType());
			} else if (
				!!makeTextReadible &&
				s[i].Tag instanceof Tag.TagString
			) {
				row.push(
					s[i].Tag.GetValues()
						.toString()
						.replace(/,/g, "|")
				);
				row.push(null);
			} else if (
				!!makeTextReadible &&
				s[i].Tag instanceof Tag.TagCharacter
			) {
				row.push(
					s[i].Tag.GetValues()
						.toString()
						.replace(/,/g, "|")
				);
				row.push(null);
			} else {
				if (s[i].Tag.GetValues().length > 0) {
					row.push(
						s[i].Tag.GetValues()
							.toString()
							.replace(/,/g, "|")
					);
				} else {
					row.push(null);
				}
				row.push(null);
			}

			csv += JSON.stringify(row)
				.replace(/null/gi, "")
				.replace(/\[/gi, "")
				.replace(/\]/gi, "");

			if (+i !== s.length - 1) {
				// Don't put a NEWLINE on the last row
				csv += "\n";
			}
		}

		csv = csv.replace(/,/gi, d1).replace(/\|/gi, d2);

		return csv;
	}
	static FromDelimited(string, delimiters, hasHeaders) {
		let arr = string.replace(/"/gi, "").split("\n");
		let d1 = delimiters && delimiters[0] ? delimiters[0] : ",",
			d2 = delimiters && delimiters[1] ? delimiters[1] : "|",
			tags = [];

		if (
			!!hasHeaders ||
			string.includes("ID,ParentID,TagType,Key,Value,Extra")
		) {
			arr.shift();
		}
		for (let i in arr) {
			let row = arr[i].split(d1);
			let CSV = {
				ID: +row[0],
				ParentID: row[1] === "" ? null : row[1],
				TagType: +row[2],
				Key: row[3],
				Value: row[4].split(d2),
				Extra: row[5]
			};
			let tag = new (Enum.EnumTagType.GetClass(CSV.TagType))(CSV.Key);

			if (tag instanceof Tag.TagCompound) {
				//  NOOP
			} else if (tag instanceof Tag.TagList) {
				tag.SetContentType(+CSV.Extra);
			} else {
				tag.Deserialize({
					Type: CSV.TagType,
					Key: CSV.Key,
					Value: CSV.Value
				});
			}

			if (
				tag instanceof Tag.TagString ||
				tag instanceof Tag.TagCharacter
			) {
				//  Lazy check to properly reinsert characters
				if (CSV.Value.length > 0) {
					if (isNaN(CSV.Value[0])) {
						tag.SetValues(...CSV.Value);
					} else {
						tag.SetValues(CSV.Value.map((o) => +o));
					}
				}
			}

			tags.push({
				ID: CSV.ID,
				ParentID: CSV.ParentID,
				Tag: tag
			});
		}

		return Transformer.FromHierarchy(tags);
	}

	static ToXML(tagCompound) {
		let xml = "";

		if (
			tagCompound instanceof Tag.TagCompound ||
			tagCompound instanceof Tag.TagList
		) {
			let tag = Enum.EnumTagType.GetClass(tagCompound.Type).name;
			xml += `<${tag} key="${tagCompound.Key}"${
				tagCompound instanceof Tag.TagList
					? ` content-type="${
							Enum.EnumTagType.GetClass(tagCompound.ContentType)
								.name
						}"`
					: ""
			}>`;
			let tags = tagCompound.Value;
			for (let i in tags) {
				let x = Transformer.ToXML(tags[i]);
				xml += x;
			}
			xml += `</${tag}>`;
		} else if (tagCompound instanceof Tag.ATag) {
			let tag = Enum.EnumTagType.GetClass(tagCompound.Type).name,
				values = "";

			for (let i in tagCompound.Value) {
				values += `<Value>${tagCompound.Value[i]}</Value>`;
			}

			xml += `<${tag} key="${tagCompound.Key}">${values}</${tag}>`;
		}

		return xml;
	}
	static FromXML(xml) {
		let selfClosing = xml.match(
			/<Tag(Boolean|Character|Compound|Double|Float|Int|List|Long|Short|String|Tiny)(.*?)(\/)>/gi
		);

		xml = xml.replace(/>(\s*)</gi, "><");
		if (selfClosing && selfClosing.length > 0) {
			xml = xml.replace(
				/<Tag(Boolean|Character|Compound|Double|Float|Int|List|Long|Short|String|Tiny)(.*?)[/]*>/gi,
				function(m, tag) {
					return m.replace(/\/>/gi, `></Tag${tag}>`);
				}
			);
		}

		xml = xml.replace(
			/<Tag(Boolean|Character|Compound|Double|Float|Int|List|Long|Short|String|Tiny)(.*?)>/gi,
			function(m, tag, attrs) {
				let type = `"Type": "Tag${tag}"`;
				attrs = attrs.replace(
					/(key="(.*?)"|content-type="(.*?)")/gi,
					function(m, p1, k, ct) {
						let arr = [];

						if (k !== void 0) {
							arr.push(`"Key": "${k}"`);
						}
						if (ct !== void 0) {
							arr.push(`, "ContentType": "${ct}"`);
						}

						return arr.join(", ");
					}
				);

				return `{${type},${attrs}, "Value": [`;
			}
		);
		xml = xml.replace(
			/<\/Tag(Boolean|Character|Compound|Double|Float|Int|List|Long|Short|String|Tiny)>/gi,
			"]}"
		);

		xml = xml.replace(/}(\s*){/gi, "}, {");
		xml = xml.replace(/<Value>(.*?)<\/Value>/gi, function(m, v) {
			return `${v}${String.fromCharCode(127)}`;
		});
		xml = xml.replace(/]/gi, "]").replace(//gi, ","); // the blank space is NOT whitespace, it's the (unrendered) DELETE CHARACTER (ASCII #127)

		xml = xml.replace(
			/Tag(Boolean|Character|Compound|Double|Float|Int|List|Long|Short|String|Tiny)/gi,
			function(m, t) {
				return Enum.EnumTagType.GetEnum(t);
			}
		);

		xml = JSON.parse(xml);

		let tag = new (Enum.EnumTagType.GetClass(+xml.Type))(xml.Key);
		tag.Deserialize(xml);

		return tag;
	}

	static ToJSON(tagCompound) {
		return tagCompound.Serialize(Enum.EnumSerialization.JSON);
	}
	static FromJSON(json) {
		while (typeof json === "string" || json instanceof String) {
			json = JSON.parse(json);
		}

		let tag = new (Enum.EnumTagType.GetClass(json.Type))(json.Key);
		return tag.Deserialize(json);
	}

	static ToAvro(tag, name, namespace) {
		if (name === null || name === void 0) {
			throw new NoNameException(name);
		}

		tag = Transformer.ToHierarchy(tag).map(function(t) {
			let value = t.Tag.GetValues(),
				extra = null;

			if (t.Tag instanceof Tag.TagString) {
				value = t.Tag.GetValues();
			} else if (t.Tag instanceof Tag.TagCharacter) {
				value = t.Tag.GetValues();
			}

			if (t.Tag instanceof Tag.TagCompound) {
				value = t.Tag.Size();
			} else if (t.Tag instanceof Tag.TagList) {
				value = t.Tag.Size();
				extra = t.Tag.GetContentType();
			}

			return {
				ID: t.ID,
				ParentID: t.ParentID,
				TagType: t.Tag.Type,
				Key: t.Tag.Key,
				Value: value,
				Extra: extra
			};
		});

		return {
			Schema: {
				type: "array",
				items: {
					type: "record",
					name: name,
					namespace:
						namespace ||
						`N${Transformer.GenerateUUID()}`.replace(/-/gi, ""),
					fields: [
						{
							name: "ID",
							type: "int"
						},
						{
							name: "ParentID",
							type: ["int", "null"]
						},
						{
							name: "TagType",
							type: "int"
						},
						{
							name: "Key",
							type: "string"
						},
						{
							name: "Value",
							type: ["string", "null"]
						},
						{
							name: "Extra",
							type: ["string", "null"]
						}
					]
				}
			},
			Data: tag
		};
	}
	static FromAvro(array) {
		for (let i in array) {
			while (typeof array[i] !== "object") {
				array[i] = JSON.parse(array[i]);
			}

			let o = {
				ID: +array[i].ID,
				ParentID:
					array[i].ParentID === "" || array[i].ParentID === null
						? ""
						: +array[i].ParentID,
				TagType: +array[i].TagType,
				Key: array[i].Key,
				Value: array[i].Value === null ? "" : array[i].Value,
				Extra: array[i].Extra === null ? "" : array[i].Extra
			};
			array[i] = `${o.ID},${o.ParentID},${o.TagType},"${o.Key}","${
				o.Value
			}",${o.Extra}`;
		}
		let string = array.join("\n");

		return Transformer.FromDelimited(string, ",|", false, true);
	}
}
