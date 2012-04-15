(function($, Mustache, undefined) {
    
	var cssId = 1,
		$componentStage = $(".component");
	
	function loadTemplate(template, path) {
		return $.get(path + "/" + template.template);
	}
	
	function loadData(template, path) {
		return $.get(path + "/" + template.data);
	}
	
	function loadCss(cssFile) {
		$("head").append("<link id='" + cssId++ + "' href='" + cssFile + "' rel='stylesheet' type='text/css' />");
		
		return cssId;
	}
	
	function getData(xhr) {
		return xhr[0];
	}
	
	function loadComponentCSS(cssFiles, path) {
		for (var i = 0; function() { loadCss(path + "/" + cssFiles[i]); }() || i < cssFiles.length - 1; i++);
	}
    
    function loadComponent(propertiesFile) {
    	
    	$.get(propertiesFile, function(props) {
        	var path = propertiesFile.substring(0, propertiesFile.lastIndexOf("/"));
        	
        	var finishedloadingTemplate = loadTemplate(props.templates["Default"], path);
        	var finishedloadingData = loadData(props.templates["Default"], path);
        	loadComponentCSS(props.css, path);
        	
        	$.when(finishedloadingTemplate, finishedloadingData)
	       	 .then(function(templateResult, dataResult) {
	       		 
	       		var template = getData(templateResult),
	       			data = getData(dataResult);
	       		
	       		$componentStage.html(Mustache.to_html(template, data));
	       	});
    	});
    }
    
    loadComponent("components/searchResult/component.json");
    
})(jQuery, Mustache);