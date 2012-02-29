define(
    [
         "order!jquery/jquery",
         "order!json2/json2",
         "order!underscore/underscore",
         "order!backbone/backbone"
    ],
    function() {
    
        return Backbone.noConflict(); 
    }
);