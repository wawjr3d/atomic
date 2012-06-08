"use strict";

(function(global) {

	//TODO: make recursive for embedded objects and arrays
	function json2form(json) {
	
		var $form = $("<form/>");
		
		for (var prop in json) {
			if (json.hasOwnProperty(prop)) {
				var value = json[prop],
					type = typeof value,
					inputType = "text",
					$input,
					label = prop.replace(/[^A-Za-z0-9]/gi, " "),
					labelSecond;
				
				if (type == "boolean") {
					inputType = "checkbox";
					labelSecond = label;
					label = null;
				}
				
				$input = $(["<label>",
				            	label,
				            	"<input type='" + inputType + "' name='" + prop + "' value='" + value + "' />",
				            	labelSecond,
				            "</label>"].join(""));
				
				$form.append($input);
			}
		}
		
		return $form;
	}
	
	global.json2form = json2form;
	
})(this, undefined);