import Helper from './Helper';

export class ASerializable {
	constructor(uuid = null) {
		this.UUID = uuid || Helper.GenerateUUID();
	}

	GetUUID() {
		return this.UUID;
	}
	SetUUID(uuid) {
		this.UUID = uuid;

		return this;
	}

	Serialize(obj) {
		if(obj !== null && obj !== void 0) {
			return JSON.stringify(obj);
		}
		
		return JSON.stringify(this);
	};
	Deserialize(json) {
		if(typeof json === "string" || json instanceof String) {
			json = JSON.parse(json);
		}

		this.UUID = json.UUID || null;

		return json;
	};
}