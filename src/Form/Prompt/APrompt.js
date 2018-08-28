import { ASerializable } from './../ASerializable';

export class APrompt extends ASerializable {
	constructor(flag, responses = []) {
		this.Flag = flag;
		this.Responses = responses;
	}

	GetResponses() {
		return this.Responses;
	}
	SetResponses(responses) {
		this.Responses = responses;

		return this;
	}
	AddResponse(response) {
		this.Responses.push(response);

		return this;
	}
	RemoveResponse(index) {
		this.Responses.splice(index, 1);

		return this;
	}
	RemoveResponseValue(value) {
		for(let i in this.Responses) {
			if(value === this.Responses[i]) {
				this.Responses.splice(i, 1);
			}
		}

		return this;
	}
	ClearResponses() {
		this.Responses = [];

		return this;
	}

	Deserialize(json) {
		json = super.Deserialize(json);

		this.Flag = json.Flag;
		this.Responses = json.Responses;

		return json;
	}
}