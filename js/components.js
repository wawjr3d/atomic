(function(global) {
    "use strict";

    var ComponentList = function(propsFile) {
        this.propsFile = propsFile;
        this.components = {};
        this.loaded = $.Deferred();
    };

    ComponentList.prototype = {
        load: function() {
            $.getJSON(this.propsFile, $.proxy(function(data) {
                this.components = data.components;
                this.loaded.resolve();
            }, this));
        }
    };
    
    global.ComponentList = ComponentList;
})(this);

