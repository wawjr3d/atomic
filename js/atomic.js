(function($, Mustache, ComponentList, undefined) {
	
	var cssId = 1,
		$componentStage = $("#component-view"),
		$componentStates = $("#states"),
		$componentDetails = $("#component-details"),
		$componentTitle = $componentDetails.find("h1"),
		$componentAuthor = $componentDetails.find(".author"),
		$componentData = $("#data");
	
	var Component = function(propsFile) {
		this.propsFile = propsFile;
		this.path = propsFile.substring(0, propsFile.lastIndexOf("/"));
		
		// TODO: cache by file name to prevent loading files more than once
		this.templates = {};
		this.data = {};
		this.cssIds = [];
		
		this.templatesLoaded = $.Deferred();
		this.dataLoaded = $.Deferred();
		this.propsLoaded = $.Deferred();
	}
	
	Component.prototype = {
			
		loadTemplateFile: function(templateId) {
			if (this.templates[templateId]) { return; }
			
			return $.get(this.path + "/" + this.props.templates[templateId].template, $.proxy(function(template) {
				this.templates[templateId] = template;
			}, this), "html");
		},
		
		loadAllTemplates: function() {
			var templates = [];
			
			for(templateId in this.props.templates) {
				if (!this.props.templates.hasOwnProperty(templateId)) { continue; }
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
			}, this), "json");
		},
		
		loadAllData: function() {
			var datas = [];
			
			for(templateId in this.props.templates) {
				if (!this.props.templates.hasOwnProperty(templateId)) { continue; }
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
				this.propsLoaded.resolve();
			}, this), "json");
		},
			
		load: function() {
			$.when(this.loadProps()).then($.proxy(function() {
	        	this.loadAllCss();
	        	this.loadAllTemplates();
	        	this.loadAllData();
	    	}, this));	
		},
		
		displayTemplate: function(templateId) {
			$.when(this.templatesLoaded, this.dataLoaded).then($.proxy(function() {
				var template = this.templates[templateId],
					data = this.data[templateId];
				
				$componentStage.html(Mustache.to_html(template, data));
			}, this));
		},
		
		displayDetails: function() {
			$.when(this.propsLoaded).then($.proxy(function() {
            	$componentTitle.html(this.props.name);
            	$componentAuthor.html(this.props.author);
			}, this));
			
        	$.when(this.templatesLoaded).then($.proxy(function() {
    			var $templateList = $("<ul/>");
    			
	        	for (var templateId in this.templates) {
	        		if (!this.templates.hasOwnProperty(templateId)) { continue; }
	        		
	        		var $li = $("<li/>").html(templateId).click((function(tid, component) {
	        			return function(e) {
		        			component.displayTemplate(tid);
		        		}
	        		})(templateId, this));
	        		
	        		$templateList.append($li);
	        	}
	        	
	            $componentStates.find("ul").replaceWith($templateList);	
        	}, this));
        	
        	$.when(this.dataLoaded).then($.proxy(function() {
        		
        		$componentData.find("form").replaceWith(json2form(this.data["Default"]));
        		
        	}, this));
		},
		
		destroy: function() {
			this.unloadAllCss();
		}
	};

    
    var component = new Component("components/searchResult/component.json");
    component.load();
    component.displayDetails();
    component.displayTemplate("Default");

    
    var components = new ComponentList("resources/components.json");
    components.load();

    var delay = (function() {
        var timer = 0;
        return function(callback, ms) {
            clearTimeout(timer);
            timer = setTimeout(callback, ms);
        };
    })();
    
    $.when(components.componentsLoaded)
     .then(function() {
	    $('#search input[type=text]').autocomplete({
	        dataSource: components.components,
	        minimumCharacters: 0,
	        resultsDestination: "#component-list",
	        doInitialRetrieve: true,
	        itemValue: function(item) {
	            return item.name;
	        },
	        itemDisplay: function(item) {
	            return item.name;
	        },
	        filter: function(value, query) {
	            return value.toLowerCase().indexOf(query.toLowerCase()) > -1;
	        }
	    }).bind("autocomplete:item:selected", function(e, item) {
	        var component = new Component(item.url);
	        component.load();
	        component.displayDetails();
	        component.displayTemplate("Default");
	    }).focus(); 
     });
    
})(jQuery, Mustache, ComponentList);