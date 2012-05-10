var Components = function(propsFile) {
    this.propsFile = propsFile;
    this.path = propsFile.substring(0, propsFile.lastIndexOf("/"));

    this.components = {};
    this.componentsLoaded = $.Deferred();
    
    this.template = {};
    this.templateLoaded = $.Deferred();
    
}

Components.prototype = {
   
    loadComponents: function() {
        $.getJSON(this.propsFile, $.proxy(function(data) {
            this.components = data.components;
            this.componentsLoaded.resolve();
        }, this));
        
    },
    
    loadTemplate: function() {
        $.get('component-listing.html',$.proxy(function(data) {
            this.template = data;
            this.templateLoaded.resolve();
        }, this));
    },
    
    render: function() {
        $.when(this.componentsLoaded, this.templateLoaded).then($.proxy(function() {
            this.renderList(this.components);
        }, this));  
    },
    
    load: function() {
        this.loadComponents();
        this.loadTemplate();
        this.render();
    },
    
    filter: function(letters) {
        var matchingComponents = this.search(letters);
        this.renderList(matchingComponents);
    },
    
    search: function(letters){
        if(letters == "") return this.components;
 
        var pattern = new RegExp(letters,"gi");
        return _.filter(this.components, function(component) {
            return pattern.test(component.name);
        });
    },
    
    renderList: function(componentList) {
        var components = Mustache.to_html(this.template, { 'components' : componentList });
        $('#component-list').html(components);
    }
};
