(function($, Component, ComponentList, PatternList, undefined) {

	var components = new ComponentList("resources/components.json");
    var patterns = new PatternsList("resources/patterns.json");
    
	// TODO: view events go somewhere else? -ck
	$("ul.tabs").tabs("div.panes > div", {
		effect: "fade",
		tabs : "li"
	});

	patterns.load();

	components.load()
	        .pipe(function() { return components.loadComponentsProps(); })
	        .pipe(function() {
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

})(jQuery, Component, ComponentList, PatternsList);