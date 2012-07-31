(function($, Component, ComponentList, PatternList, undefined) {

    var loadedComponents = {};

	function loadComponent(url) {
		var component = loadedComponents[url];
		if (!loadedComponents[url]) {
			loadedComponents[url] = component;
			//component.load();
		}
		
//		component.displayDetails();
//		component.displayTemplate("Default");
	}

	var components = new ComponentList("resources/components.json");
    var patterns = new PatternsList("resources/patterns.json");
    
	// TODO: view events go somewhere else? -ck
	$("ul.tabs").tabs("div.panes > div", {
		effect: "fade",
		tabs : "li"
	});

	patterns.load();

	$.when(components.load(), patterns.patternsLoaded)
	 .done(function() {
	     components.loadComponentsProps()
    	     .done(function() {
    	         $('#search input[type=text]').autocomplete({
    	             dataSource : components,
    	             minimumCharacters : 0,
    	             resultsDestination : "#component-list",
    	             doInitialRetrieve : true,
    	             itemValue : function(item) {
    	                 return item.getName();
    	             },
    	             itemDisplay : function(item) {
    	                 return item.getName();
    	             },
    	             filter : function(value, query) {
    	                 return value.toLowerCase().indexOf(query.toLowerCase()) > -1;
    	             }
    	         })
    	         .bind("autocomplete:item:selected", function(e, item) {
    	             item.load();
    	         }).focus();
    	     });
	 });

})(jQuery, Component, ComponentList, PatternsList);