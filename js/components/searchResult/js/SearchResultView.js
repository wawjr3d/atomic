define(
    [
         "Backbone",
         "Templates",
         "text!components/searchResult/templates/default.html",
         "text!components/searchResult/templates/no_image.html",
         "text!components/searchResult/templates/saved.html",
         "text!components/searchResult/templates/zero.html",
    ], 
    
    function(Backbone, Templates, defaultTemplate, noImageTemplate, savedTemplate, zeroTemplate) {
        
        var SearchResultView = Backbone.View.extend({
            
            className: "search-result",
            
            template: defaultTemplate,
            
            initialize: function() {
                this.pickTemplate();
            },
            
            events: {
              
                "click .save": function() {
                    
                }
            },
            
            pickTemplate: function() {
                
                if (!this.model.get("image")) {
                    
                    this.template = noImageTemplate;
                    
                } else if (this.model.get("is_saved") == true) {
                    
                    this.template = savedTemplate;
                    
                }
            },
            
            render: function() {
                
                Templates.render({
                    template: this.template,
                    container: this.el,
                    model: this.model
                });
             
                return this;
            }         
        });
        
        return SearchResultView;
    }
);