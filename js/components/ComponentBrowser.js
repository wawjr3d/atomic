define(
    [
         "jQuery"
    ],
    
    function($) {

        var ComponentTester = function(viewType, model) {
            this.viewType = viewType;
            this.model = model;
        };
        
        ComponentTester.prototype = {
            
            viewType: undefined,
            
            update: function(model) {
                this.model = model;
            },
            
            render: function() {

                var view = new this.viewType(this.model);
                
                $("#content").html(view.render().el);
            }

        }
        
        return ComponentTester;
    }

);