define(
    [
         // load jquery
         "order!jQuery",
         
         // put all ui includes here, make sure to add 'order!' in the front
         "order!jquery.tools/jquery.tools.min"
    ],
    
    function() {
        
        return jQuery;
    }
);