(function($, Mustache, undefined) {
    
	var cssId = 1;
	
	function loadCss(cssFile) {
		var head = document.getElementsByTagName("HEAD")[0];
		
		var css = document.createElement("LINK");
		css.id = cssId++;
		css.rel = "stylesheet";
		css.type = "text/css";
		css.href = cssFile;
		
		head.appendChild(css);
		
		return cssId;
	}
    
    function loadComponentTemplate(componentPropertiesFile) {
 
    	$.get(componentPropertiesFile, function(componentProperties) {

    		var componentPath = componentPropertiesFile.substring(0, componentPropertiesFile.lastIndexOf("/")),
    			templateXhr = $.get(componentPath + "/" + componentProperties.templates["Default"].template),
    			dataXhr = $.get(componentPath + "/" + componentProperties.templates["Default"].data);
    		
    		loadCss(componentPath + "/" + componentProperties.css[0]);
    		
        	$.when(templateXhr, dataXhr)
        	 .then(function(templateResult, dataResult) {
        		var template = templateResult[0],
        			data = dataResult[0],
        			css = dataResult[0];
        		
        		$(".component").html(Mustache.to_html(template, data));
        	});
    	});
    }
    
    loadComponentTemplate("components/searchResult/component.json");
    
})(jQuery, Mustache);