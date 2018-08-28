import { GenerateUUID } from './Helper';
import { ASerializable } from './ASerializable';

export class Form extends ASerializable {
	constructor(title = "", sections = []) {
		this.Title = title;
		this.Sections = sections;
	}

	GetTitle() {
		return this.Title;
	}
	SetTitle(title) {
		this.Title = title;

		return this;
	}
}