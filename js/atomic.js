(function($, Mustache, undefined) {
	
	var cssId = 1,
		$componentStage = $(".component");
	
	function getData(xhr) {
		return xhr[0];
	}
	
	var Component = function(propsFile) {
		this.propsFile = propsFile;
		this.path = propsFile.substring(0, propsFile.lastIndexOf("/"));
		this.cssIds = [];
	}
	
	Component.prototype = {
			
		loadTemplateFile: function(templateId) {
			return $.get(this.path + "/" + this.props.templates[templateId].template);
		},
		
		loadDataFile: function(templateId) {
			return $.get(this.path + "/" + this.props.templates[templateId].data);
		},
		
		loadCss: function(cssFile) {
			var cssFileId = cssId++;
			$("head").append("<link data-component-id='" + cssFileId + "' href='" + cssFile + "' rel='stylesheet' type='text/css' />");
			
			this.cssIds.push(cssFileId);
		},
		
		loadAllCss: function() {
			var cssFiles = this.props.css;
			for (var i = 0; this.loadCss(this.path + "/" + cssFiles[i]) || i < cssFiles.length - 1; i++);
		},
		
		unloadAllCss: function() {
			for (var i = 0; i < this.cssIds.length; i++) {
				$("head link[data-component-id='" + this.cssIds[i] + "']").remove();
			}
		},
		
		loadProps: function() {
			return this.props || $.get(this.propsFile, $.proxy(function(props) {
				this.props = props;
			}, this));
		},
			
		load: function() {
			$.when(this.loadProps()).then($.proxy(function(props) {
	        	
	        	this.loadAllCss();
				
	        	var finishedloadingTemplate = this.loadTemplateFile("Default");
	        	var finishedloadingData = this.loadDataFile("Default");
	        	
	        	$.when(finishedloadingTemplate, finishedloadingData)
		       	 .then(function(templateResult, dataResult) {
		       		 
		       		var template = getData(templateResult),
		       			data = getData(dataResult);
		       		
		       		$componentStage.html(Mustache.to_html(template, data));
		       	});
	    	}, this));	
		},
		
		destroy: function() {
			this.unloadAllCss();
		}
	};

    
    var component = new Component("components/searchResult/component.json");
    component.load();
    
})(jQuery, Mustache);