require.config({
    paths: {
        "jquery": "thirdparty/jquery/1.7.1",
        "jquery.tools": "thirdparty/jquery.tools",
        "json2": "thirdparty/json2",
        "underscore": "thirdparty/underscore/1.3.0",
        "backbone": "thirdparty/backbone/0.9.1",
        "mustache": "thirdparty/mustache/0.4.0-dev",
        
        jQuery: "modules/lib/jQuery",
        jQueryUIComponents: "modules/lib/jQueryUIComponents",
        Backbone: "modules/lib/Backbone",
        Templates: "modules/templating/Templates",
        Mustache: "modules/lib/Mustache"
    }
});

require(
    [
        "jQuery",
        "Backbone",
        "components/ComponentBrowser",
        "components/searchResult/js/SearchResultView",
        "text!components/searchResult/demo/data.json"
    ],

    function($, Backbone, ComponentBrowser, SearchResultView, model) {
        
        var componentBrowser = new ComponentBrowser(SearchResultView, {model: new Backbone.Model($.parseJSON(model))});
        
        componentBrowser.render();
    }
);
