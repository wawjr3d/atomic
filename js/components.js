var ComponentList = function(propsFile) {
    this.propsFile = propsFile;
    this.path = propsFile.substring(0, propsFile.lastIndexOf("/"));

    this.components = {};
    this.loaded = $.Deferred();
}

ComponentList.prototype = {
   
    loadComponents: function() {
        $.getJSON(this.propsFile, $.proxy(function(data) {
            this.components = data.components;
            this.loaded.resolve();
        }, this));
    },
    
    load: function() {
        this.loadComponents();
    }
};
