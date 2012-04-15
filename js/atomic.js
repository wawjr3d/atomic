(function($, Mustache, undefined) {
	
	var cssId = 1,
		$componentStage = $(".component");
	
	function getData(xhr) {
		return xhr[0];
	}
	
	var Component = function(propsFile) {
		this.propsFile = propsFile;
		this.path = propsFile.substring(0, propsFile.lastIndexOf("/"));
		
		this.templates = {};
		this.data = {};
		this.cssIds = [];
		
		this.templatesLoaded = $.Deferred();
		this.dataLoaded = $.Deferred();
	}
	
	Component.prototype = {
			
		loadTemplateFile: function(templateId) {
			if (this.templates[templateId]) { return; }
			
			return $.get(this.path + "/" + this.props.templates[templateId].template, $.proxy(function(template) {
				this.templates[templateId] = template;
			}, this));
		},
		
		loadAllTemplates: function() {
			var templates = [];
			
			for(templateId in this.props.templates) {
				templates.push(this.loadTemplateFile(templateId));
			}
			
			$.when.apply(this, templates).then($.proxy(function() {
				this.templatesLoaded.resolve();
			}, this));
		},
		
		loadDataFile: function(templateId) {
			if (this.templates[templateId]) { return; }
			
			return $.get(this.path + "/" + this.props.templates[templateId].data, $.proxy(function(data) {
				this.data[templateId] = data;
			}, this));
		},
		
		loadAllData: function() {
			var datas = [];
			
			for(templateId in this.props.templates) {
				datas.push(this.loadDataFile(templateId));
			}
			
			$.when.apply(this, datas).then($.proxy(function() {
				this.dataLoaded.resolve();
			}, this));			
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
			$.when(this.loadProps()).then($.proxy(function() {
	        	this.loadAllCss();
	        	this.loadAllTemplates();
	        	this.loadAllData();
	    	}, this));	
		},
		
		display: function(templateId) {
			$.when(this.templatesLoaded, this.dataLoaded).then($.proxy(function() {
				var template = this.templates[templateId],
					data = this.data[templateId];
				
				$componentStage.html(Mustache.to_html(template, data));
			}, this));
		},
		
		destroy: function() {
			this.unloadAllCss();
		}
	};

    
    var component = new Component("components/searchResult/component.json");
    component.load();
    component.display("Default");
    
    $("#states ul a").click(function(e) {
    	e.preventDefault();
    	
    	component.display($(this).attr("data-template-id"));
    });
    
})(jQuery, Mustache);