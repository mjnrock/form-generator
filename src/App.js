import React, { Component } from "react";

import { Transformer } from "./PTO/Utility/Transformer.js";
// import { Navigator } from "./PTO/Utility/Navigator.js";
// import * as Enum from "./PTO/Enum/_Enum.js";
import * as Tag from "./PTO/Tag/_Tag.js";

let post = new Tag.TagCompound("Post");
post.AddTag(new Tag.TagUUID("UUID"));
post.AddTag(new Tag.TagString("Author"));
post.AddTag(new Tag.TagString("Message"));
post.AddTag(new Tag.TagLong("Timestamp"));
post.AddTag(new Tag.TagCompound("Test"));
post.GetTag("Test").AddTag(new Tag.TagInt(5));

console.log(Transformer.ToXML(post));

let x = Transformer.FromJSON(`{
	"Key": "Post",
	"Type": 10,
	"Value": {
		"UUID": {
			"Key": "UUID",
			"Type": 12,
			"Value": null
		},
		"Author": {
			"Key": "Author",
			"Type": 2,
			"Value": null
		},
		"Messsage": {
			"Key": "Messsage",
			"Type": 2,
			"Value": null
		},
		"Timestamp": {
			"Key": "Timestamp",
			"Type": 5,
			"Value": null
		}
	}
}`);
console.log(x);

class App extends Component {
	render() {
		return (
			<div className="App">
				Yo
			</div>
		);
	}
}

export default App;