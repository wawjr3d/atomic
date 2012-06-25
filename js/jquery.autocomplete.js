/*
 * Version: 0.5.1
 * 
 * TODO: keep refactoring...not as heavily as before!
 */
(function(global, $, undefined) {
    "use strict";

    var console = typeof global.console != "undefined" ? global.console : {
        log: $.noop,
        error: $.noop
    };

    $.fn.autocomplete = function(options) {
        
        if (!this.length) { return this; }

        var AUTOCOMPLETE = "autocomplete",
        
            EVENTS = (function() {
                var events = {
                    OPEN: "open",
                    CLOSE: "close",
                    SEARCH: "search",
                    SEARCH_COMPLETE: "search:complete",
                    ITEM_HIGHLIGHTED: "item:highlighted",
                    ITEM_SELECTED: "item:selected",
                    EXTRA_OPTION_HIGHLIGHTED: "extra-option:highlighted",
                    EXTRA_OPTION_SELECTED: "extra-option:selected"
                };
                
                for(var eventId in events) {
                    if (events.hasOwnProperty(eventId)) {
                        events[eventId] = AUTOCOMPLETE + ":" + events[eventId];    
                    }
                }
                
                return events; 
            })(),
            
            HIGHLIGHTED_CLASS = "highlighted",
            LOADING_CLASS = "loading",
        
            TEXT_BASED_INPUT_TYPES = ["text", "email", "search", "url"],

            
            // keys
            KEYLEFT = 37,
            KEYUP = 38,
            KEYRIGHT = 39,
            KEYDOWN = 40,
            ENTER_KEY = 13,
            
            // stolen from jquery.ui, used to prevent race conditions
            autocompleteCount = 0;
        
        var defaultOptions = {
            
            dataSource: "",

            queryParam: "q",

            extraParams: {},

            minimumCharacters: 3,
            
            resultsDestination: null,
            
            doInitialRetrieve: false,

            delay: 400,

            limit: 10,
         
            showFailure: true,
            
            failureMessage: "No results found.",

            itemDisplay: function(item) {
                return item.value;
            },

            itemValue: function(item) {
                return item.value;
            },

            filter: function(value, query) {
                return value.toLowerCase().indexOf(query.toLowerCase()) > -1;
            },

            parse: function(data) {
                return data;
            },

            sort: function(item1, item2) {
                return item1.value > item2.value;
            },
            
            extraOptions: []
        };
        
        if (typeof options === "string") { options = { dataSource: options }; }
        
        var settings = $.extend(defaultOptions, options);
        
        var isDataSourceUrl = typeof settings.dataSource == "string"; // hopefully this is a url
        var hasResultsDestination = settings.resultsDestination !== null;
        
        /*
         * There will only be one result div because
         * only 1 autocomplete needs to be open at any given time.
         * I was going to do one per instance but until there's
         * a specific use case for it, it's probably better to just
         * keep the added markup minimal
         */
        var $results = hasResultsDestination ? $(settings.resultsDestination).first() : $("#autocomplete-results");
        
        if (!$results.length) {
            $results = $("<div id='autocomplete-results'></div>").css("display", "none");
            $results.appendTo("body");
        }

 
        return this.first().each(function() {

            var $input = $(this);
            
            // Reasons to do nothing
            if ($input.data("autocomplete") === true) { return; }
            
            if (typeof settings.dataSource == "undefined" || !settings.dataSource) {
                console.error("a dataSource is required");
                return;
            }
            
            if (this.tagName != "INPUT" || $.inArray($input.prop("type"), TEXT_BASED_INPUT_TYPES) < 0) {
                console.error("can only turn text based inputs into autocompletes");
                return;
            }

            // Instance variables
            var lastQuery = this.value;
            var hasFocus = false;
            var showResultsTimeout = null;
            
            // Instance methods
            function resetAutocomplete() {
                clearTimeout(showResultsTimeout);
                showResultsTimeout = null;
                hideResults(); 
                lastQuery = "";
                hasFocus = false;
            }
            
            function selectItem($item) {
                if (!$item) { $item = getHighlightedItem(); }
                if (!$item || !$item.length) { return false; }
                
                var item = $item.data("autocomplete.item");
                var option = $item.data("autocomplete.option");
    
                if (item) {
                    $input.val(settings.itemValue(item)).trigger(EVENTS.ITEM_SELECTED, item);
                } else if (option) {
                    (option.onSelect || $.noop)();
                    $input.trigger(EVENTS.EXTRA_OPTION_SELECTED, option);
                }
                
                hideResults();
                
                return true;
            }
            
            function getHighlightedItem() {
                return $results.find("li." + HIGHLIGHTED_CLASS);
            }
            
            function deselectHiglightedItem() {
                getHighlightedItem().removeClass(HIGHLIGHTED_CLASS);
            }
            
            function highlightPrevious() {
                
                var $items = $results.find("li");
                if ($items.first().hasClass(HIGHLIGHTED_CLASS)) { return false; }
                
                var $currentHighlightedItem = getHighlightedItem();
                if (!$currentHighlightedItem.length) { return false; }
    
                var $highlightedItem = $currentHighlightedItem.prev("li");
                $currentHighlightedItem.removeClass(HIGHLIGHTED_CLASS);
                
                highlightItem($highlightedItem);
                
                return true;
            }
               
            function highlightNext() {
                
                var $items = $results.find("li");
                if ($items.last().hasClass(HIGHLIGHTED_CLASS)) { return false; }
                
                var $currentHighlightedItem = getHighlightedItem();
                var $highlightedItem;
                
                if ($currentHighlightedItem.size() > 0) {
                    $highlightedItem = $currentHighlightedItem.next("li");
                    $currentHighlightedItem.removeClass(HIGHLIGHTED_CLASS);
                } else {
                    $highlightedItem = $items.first();
                }
    
                highlightItem($highlightedItem);
                
                return true;
            }
            
            function highlightItem($item) {
                var item = $item.data("autocomplete.item");
                var option = $item.data("autocomplete.option");
                
                $item.addClass(HIGHLIGHTED_CLASS);
                
                if (item) {
                    $input.val(settings.itemValue(item)).trigger(EVENTS.ITEM_HIGHLIGHTED, item);
                } else if (option) {
                    $input.val(lastQuery).trigger(EVENTS.EXTRA_OPTION_HIGHLIGHTED, option);
                }
            }
            
            function loadResults(results, query) {
                
                var howmany = Math.min(settings.limit, results.length),
                    $ul = $("<ul/>"),
                    i;
                
                $results.empty();

                for (i = 0; i < howmany; i++) {
                    var item = results[i];
                    
                    var $listItem = $("<li/>");
                    $listItem.data("autocomplete.item", item);
                    $listItem[0].innerHTML = settings.itemDisplay(item);
                    
                    $listItem.appendTo($ul);
                }
                
                for (i = 0; i < settings.extraOptions.length; i++) {
                    var option = settings.extraOptions[i];
                    var content = typeof option.content == "function" ? option.content(query) : option.content;
                    
                    if (!content) { continue; }
                    
                    var $extraListItem = $("<li class='extra-option'/>");
                    $extraListItem.data("autocomplete.option", option);
                    $extraListItem[0].innerHTML = content;
                    $extraListItem.appendTo($ul);
                }

                $ul.delegate("li", "click", function(e) { selectItem($(this)); }).appendTo($results);
            }
            
            function loadFailureMessage() {
                $results[0].innerHTML = "<div class='failure'>" + settings.failureMessage + "</div>";
            }
            
            function getPositionType($element) {
                var position = $element.css("position");
                return position == "fixed" ? "fixed" : "absolute";
            }
            
            function getZIndex($element) {
                var zIndex = $element.css("zIndex");
                return zIndex == "auto" ? 0 : zIndex;
            }
            
            function showResults() {
                if (!$results.is(":visible") && !$input.prop("disabled")) {
                    var position = $input.position();
                    
                    $results.css({
                        position: getPositionType($input),
                        top: position.top + $input.prop("offsetHeight"),
                        left: position.left,
                        width: $input.prop("offsetWidth"),
                        zIndex: getZIndex($input) + 1
                    })
                    .insertAfter($input)
                    .show();
                    
                    $input.trigger(EVENTS.OPEN);
                }
            }
            
            function hideResults() {
                if (!hasResultsDestination && $results.is(":visible")) {
                    $results.hide();
                    
                    $input.trigger(EVENTS.CLOSE);
                }
            }   
            
            function search(query) {
                
                var deferred = $.Deferred();
                
                if (isDataSourceUrl) {
                    
                    var urlDataSourceParams = {};
                    $.extend(urlDataSourceParams, settings.extraParams);
                    
                    // put this after extend to make sure this isnt overwritten
                    urlDataSourceParams[settings.queryParam] = query;
                    
                    $.ajax({
                        url: settings.dataSource,
                        type: "GET",
                        data: urlDataSourceParams,
                        dataType: "json",
                        context: {
                            currentAutocomplete: ++autocompleteCount
                        },
                        success: function(data) {
                            if (autocompleteCount === this.currentAutocomplete) {
                                deferred.resolve(settings.parse(data));                            
                            }
                        },
                        error: function() {
                            if (autocompleteCount === this.currentAutocomplete) {
                                deferred.resolve([]);
                            }
                        },
                        
                        /*
                         * im not sure if you MUST resolve or reject a deferred to make sure its
                         * garbage collected but didnt want to take a chance, if it gets rejected
                         * at this point it wasnt supposed to run because another query has
                         * happened 
                         */
                        complete: function() {
                            deferred.reject();
                        }
                    });
                } else {
                    var results = [];
                    
                    var data = settings.parse(settings.dataSource);
                    
                    for (var i = 0; i < data.length; i++) {
                        var item = data[i];
                        
                        if (settings.filter(settings.itemValue(item), query)) {
                            results.push(item);
                        }
                    }
                    
                    deferred.resolve(results);
                }
                
                return deferred;
            }
            
            function retrieveData(query) {
                
                $input.addClass(LOADING_CLASS);
                $input.trigger(EVENTS.SEARCH, query);
                
                $.when(search(query)).then(function(results) {
                    if (!hasFocus) { return; }
                    
                    $input.removeClass(LOADING_CLASS);
                    $input.trigger(EVENTS.SEARCH_COMPLETE, {"results": results});
    
                    if (results.length || settings.extraOptions.length) {
                        results.sort(settings.sort);
                        loadResults(results, query);
                        
                        showResults();
                    } else {
                        if (settings.showFailure) {
                            loadFailureMessage();                            
                            showResults();
                        } else {
                            hideResults();
                        }
                    }

                });
            }
            
            function shouldIgnoreKeyup(keyCode) {
                return keyCode == KEYLEFT || keyCode == KEYUP || keyCode == KEYRIGHT || keyCode == KEYDOWN || keyCode == ENTER_KEY;
            }
            
            function shouldIgnoreKeydown(keycode) {
                return !shouldIgnoreKeyup(keycode);
            }

            // Spaghetti
            $input
                .data("autocomplete", true)
                .addClass("autocomplete")
                .attr("autocomplete", "off")
                .keyup(function(e) {
                    if (shouldIgnoreKeyup(e.keyCode)) { return; }
                    
                    if (this.value.length >= settings.minimumCharacters) {
                        if (this.value != lastQuery) {
                            hasFocus = true;
                            clearTimeout(showResultsTimeout);
                            showResultsTimeout = null;
                            
                            showResultsTimeout = setTimeout($.proxy(function() {    
                                var value = this.value;
                                
                                retrieveData(value);
                                lastQuery = value;
                            }, this), settings.delay);
                        }
                    } else {
                        resetAutocomplete();
                    }
                })
                .keydown(function(e) {
                    if (shouldIgnoreKeydown(e.keyCode)) { return; }
                    
                    var $input = $(this);
                    
                    if (e.keyCode == ENTER_KEY) {
                        if ($results.is(":visible")) {
                            if (selectItem()) {
                                e.preventDefault();
                            } else {
                                resetAutocomplete();
                            }
                        } else {
                            resetAutocomplete();
                        }
                        
                        return;
                    }
                    
                    if ($results.is(":visible")) {
                        switch (e.keyCode) {
                            case KEYUP:
                                if (!highlightPrevious()) {
                                    if ($input.val() == lastQuery) {
                                        hideResults();
                                    }
                                    deselectHiglightedItem();
                                    $input.val(lastQuery);
                                }
                                
                                break;
                            case KEYDOWN:
                                highlightNext();
                                break;
                        }
                    }
                })
                .focus(function(e) {
                    lastQuery = this.value;
                })
                .blur(function(e) {
                    hasFocus = false;
                    // little delay to allow click event on selected item to happen
                    setTimeout(function() {
                        resetAutocomplete();
                    }, 200);
                });
            
            
            if (settings.doInitialRetrieve) {
                hasFocus = true;
                retrieveData($input.val());
            }
        });
    };
    
})(this, jQuery);