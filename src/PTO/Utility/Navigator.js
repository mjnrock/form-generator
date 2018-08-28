import { ATag, TagCompound, TagList } from "../Tag/_Tag.js";

export class Navigator {
	//	This is really designed for treating a tag like an object with Dot Notation
	static FindTag(tag, keys, dl) {
		dl = dl === null || dl === void 0 ? "." : dl;
		if (keys.length > 0 && tag instanceof ATag) {
			keys = keys.split(dl);
			let key = keys.shift();
			if (keys.length > 0) {
				keys = keys.join(dl);
			}
			
			if (tag.GetKey() === key || key === "") {
				let value = tag.GetValues();
				if (tag instanceof TagCompound) {
					let v = Object.values(value);
					for (let i in v) {
						tag = Navigator.FindTag(v[i], keys, dl);

						if (tag !== null) {
							return tag;
						}
					}
				} else if (tag instanceof TagList) {
					for (let i in value) {
						tag = Navigator.FindTag(value[i], keys, dl);

						if (tag !== null) {
							return tag;
						}
					}
				}
			}
			
			if (tag.GetKey() === key && tag instanceof ATag) {
				return tag;
			}
		}
	}
	
	//	TODO Add a "Selector" function that allows for CSS-style Tag selection
}
