var PatternsList = function(propsFile) {
	this.propsFile = propsFile;
	this.path = propsFile.substring(0, propsFile.lastIndexOf("/"));

	this.patterns = {};
	this.patternsLoaded = $.Deferred();

	this.template = {};
	this.templateLoaded = $.Deferred();

}

PatternsList.prototype = {

	loadPatterns : function() {
		$.getJSON(this.propsFile, $.proxy(function(data) {
			this.patterns = data.patterns;
			this.patternsLoaded.resolve();
		}, this));

	},

	loadTemplate : function() {
		$.get('pattern-listing.html', $.proxy(function(data) {
			this.template = data;
			this.templateLoaded.resolve();
		}, this));
	},

	render : function() {
		$.when(this.patternsLoaded, this.templateLoaded).then(
    		$.proxy(function() {
    			this.renderList(this.patterns);
		}, this));
	},

	load : function() {
		this.loadPatterns();
		this.loadTemplate();
	    this.render();
	},

	filter : function(letters) {
		var matchingPatterns = this.search(letters);
		this.renderList(matchingPatterns);
	},

	search : function(letters) {
		if (letters == "") {
			return this.patterns;
		}

		var regex = new RegExp(letters, "i");
		return _.filter(this.patterns, function(pattern) {
			return regex.test(pattern.name);
		});
	},

	renderList : function(patternList) {
		var patterns = Mustache.to_html(this.template, {
			'patterns' : patternList
		});
		$('#pattern-list').html(patterns);
	}
};
