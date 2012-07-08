(function($, Mustache, ComponentList, PatternList, undefined) {

	var $componentView = $("#component-view"), $componentStage = $componentView
			.children(".component"), $componentStyles = $componentView
			.children("style"), $componentStates = $("#states"), $componentDetails = $("#component-details"), $componentTitle = $componentDetails
			.find("h1"), $componentAuthor = $componentDetails.find(".author"), $componentData = $("#data")

	loadedComponents = {};

	// TODO: make this an object and pull out code that shouldnt be a part of
	// the object
	var Component = function(propsFile) {
		this.propsFile = propsFile;
		this.path = propsFile.substring(0, propsFile.lastIndexOf("/"));

		// TODO: cache by file name to prevent loading files more than once
		this.templates = {};
		this.data = {};

		this.templatesLoaded = $.Deferred();
		this.dataLoaded = $.Deferred();
		this.propsLoaded = $.Deferred();
	}

	Component.prototype = {

		loadTemplateFile : function(templateId) {
			if (this.templates[templateId]) {
				return;
			}

			return $.get(this.path + "/"
					+ this.props.templates[templateId].template, $.proxy(
					function(template) {
						this.templates[templateId] = template;
					}, this), "html");
		},

		loadAllTemplates : function() {
			var templates = [];

			for (templateId in this.props.templates) {
				if (!this.props.templates.hasOwnProperty(templateId)) {
					continue;
				}
				templates.push(this.loadTemplateFile(templateId));
			}

			$.when.apply(this, templates).then($.proxy(function() {
				this.templatesLoaded.resolve();
			}, this));
		},

		loadDataFile : function(templateId) {
			if (this.templates[templateId]) {
				return;
			}

			return $.get(this.path + "/"
					+ this.props.templates[templateId].data, $.proxy(function(
					data) {
				this.data[templateId] = data;
			}, this), "json");
		},

		loadAllData : function() {
			var datas = [];

			for (templateId in this.props.templates) {
				if (!this.props.templates.hasOwnProperty(templateId)) {
					continue;
				}
				datas.push(this.loadDataFile(templateId));
			}

			$.when.apply(this, datas).then($.proxy(function() {
				this.dataLoaded.resolve();
			}, this));
		},

		loadAllCss : function() {
			var cssFiles = this.props.css;
			var cssPaths = $.map(cssFiles, $.proxy(function(cssFile) {
				return "@import '" + this.path + "/" + cssFile + "';";
			}, this));

			$componentStyles.append(cssPaths.join("\n"));
		},

		unloadAllCss : function() {
			$componentStyles.empty();
		},

		loadProps : function() {
			return this.props || $.get(this.propsFile, $.proxy(function(props) {
				this.props = props;
				this.propsLoaded.resolve();
			}, this), "json");
		},

		load : function() {
			$.when(this.loadProps()).then($.proxy(function() {
				this.loadAllCss();
				this.loadAllTemplates();
				this.loadAllData();
			}, this));
		},

		displayTemplate : function(templateId) {
			$
					.when(this.templatesLoaded, this.dataLoaded)
					.then(
							$
									.proxy(
											function() {
												var template = this.templates[templateId], data = this.data[templateId];

												$componentStage
														.html(Mustache.to_html(
																template, data));
											}, this));
		},

		displayDetails : function() {
			$.when(this.propsLoaded).then($.proxy(function() {
				$componentTitle.html(this.props.name);
				$componentAuthor.html(this.props.author);
			}, this));

			$.when(this.templatesLoaded).then(
					$.proxy(function() {
						var $templateList = $("<ul/>");

						for ( var templateId in this.templates) {
							if (!this.templates.hasOwnProperty(templateId)) {
								continue;
							}

							var $li = $("<li/>").html(templateId).click(
									(function(tid, component) {
										return function(e) {
											component.displayTemplate(tid);
										}
									})(templateId, this));

							$templateList.append($li);
						}

						$componentStates.find("ul").replaceWith($templateList);
					}, this));

			$.when(this.dataLoaded).then(
					$.proxy(function() {

						$componentData.find("form").replaceWith(
								json2form(this.data["Default"]));

					}, this));
		},

		destroy : function() {
			this.unloadAllCss();
		}
	};

	function loadComponent(url) {
		var component = loadedComponents[url];
		if (!loadedComponents[url]) {
			loadedComponents[url] = component = new Component(url);
		}

		component.load();
		component.displayDetails();
		component.displayTemplate("Default");
	}

	loadComponent("components/searchResult/component.json");

	var components = new ComponentList("resources/components.json");
    var patterns = new PatternsList("resources/patterns.json");
	// TODO: view events go somewhere else? -ck
	$("ul.tabs").tabs("div.panes > div");

	 components.load();
	 patterns.load();

	$.when(components.componentsLoaded, patterns.patternsLoaded).then(
			function() {
				$('#search input[type=text]').autocomplete(
						{
							dataSource : components.components,
							minimumCharacters : 0,
							resultsDestination : "#component-list",
							doInitialRetrieve : true,
							itemValue : function(item) {
								return item.name;
							},
							itemDisplay : function(item) {
								return item.name;
							},
							filter : function(value, query) {
								return value.toLowerCase().indexOf(
										query.toLowerCase()) > -1;
							}
						}).bind("autocomplete:item:selected",
						function(e, item) {
							loadComponent(item.url);
						}).focus();
			});

})(jQuery, Mustache, ComponentList, PatternsList);