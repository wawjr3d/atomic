(function() {
    
    var global = this;
    var noop = function() {};
    
    if (typeof global.console == "undefined") {
    
        var console = {};
        
        var console_operations = ["debug", "info", "warn", "error", "assert",
                                  "clear", "dir", "dirxml", "trace", "group",
                                  "groupCollapsed", "groupEnd", "time", "timeEnd",
                                  "profile", "profileEnd", "count", "exception", "table"];
            
        for(operation in console_operations) {
            console[operation] = noop;
        }
            
        global.console = console;
    }
    
})();