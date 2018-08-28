import { ATag } from "./ATag.js";
import { EnumTagType, EnumSerialization } from "../Enum/_Enum.js";

export class TagCompound extends ATag {
	constructor(key) {
		super(EnumTagType.COMPOUND, key, null);

		this.Value = {};
	}

	GetSchema(id = 1, pid = 0, depth = "") {
		let schema = `${id}.${pid}.${this.Type}`;
		let nid = id;
		for (let i in this.Value) {
			let r = `${this.Value[i].GetSchema(nid + 1, id, ":")}`;
			schema += r;
			r = r.split(":").filter((e) => e.length > 0);
			nid = Math.max.apply(Math, r.map((t) => +t.split(".")[0]));
		}

		return `${depth}${schema}`;
	}

	GetContentType() {
		return this.ContentType;
	}
	SetContentType(type) {
		this.ContentType = type;

		return this;
	}

	GetTag(input) {
		if (typeof input === "string" || input instanceof String) {
			return this.Value[input];
		}

		return this.Value[Object.keys(this.Value)[input]];
	}
	AddTag(tag) {
		if (tag instanceof ATag) {
			this.Value[tag.GetKey()] = tag;
		}

		return this;
	}
	RemoveTag(input) {
		if (typeof input === "string" || input instanceof String) {
			delete this.Value[input];
		}

		delete this.Value[Object.keys(this.Value)[input]];

		return this;
	}

	Size() {
		return Object.keys(this.Value).length;
	}

	Serialize(level) {
		let obj = {};
		for (let i in this.Value) {
			obj[i] = this.Value[i].Serialize(EnumSerialization.OBJECT);
		}

		return super.Serialize(level, this.GetType(), this.GetKey(), obj);
	}
	Deserialize(json) {
		while (typeof json === "string" || json instanceof String) {
			json = JSON.parse(json);
		}

		this.SetType(+json.Type);
		this.SetKey(json.Key);

		for (let i in json.Value) {
			let tag = new (EnumTagType.GetClass(
				+json.Value[i].Type
			))().Deserialize(json.Value[i]);
			this.AddTag(tag);
		}

		return this;
	}
}
