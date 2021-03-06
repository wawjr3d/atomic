(function(global, $, Mustache, undefined) {
    "use strict";
 
    var $componentView = $("#component-view"),
        $componentStyles = $componentView.children("style"),
        $componentCss = $("#component-copy").find(".css");
  
    
    function addCopyButton($code, text) {
        var $copyButton = $("<span class='copy'/>");
        
        $code.prepend($copyButton);
        
        $copyButton.zclip({
            path: "zclip/ZeroClipboard.swf",
            copy: text,
            afterCopy: function() {
                console.log("copied");
            }
        });
    }
    // Component class
    var Component = function(descriptor) {
        this.descriptor = descriptor;
        this.path = descriptor.substring(0, descriptor.lastIndexOf("/"));

        // TODO: cache by file name to prevent loading files more than once
        this.templates = {};
        this.data = {};

        this.loaded = null;
        this.templatesLoaded = null;
        this.dataLoaded = null;
        this.propsLoaded = null;
    };
    
    Component.prototype = {

        loadTemplateFile: function(templateId) {
            if (this.templates[templateId]) { return; }

            return $.get(this.path + "/" + this.props.templates[templateId].template, $.proxy(function(template) {
                this.templates[templateId] = template;
            }, this), "html");
        },

        loadAllTemplates: function() {
            if (this.templatesLoaded) { return this.templatesLoaded; }
            
            var templates = [];

            for (var templateId in this.props.templates) {
                if (this.props.templates.hasOwnProperty(templateId)) {
                    templates.push(this.loadTemplateFile(templateId));
                }
            }

            return this.templatesLoaded = $.when.apply(this, templates);
        },

        loadDataFile: function(templateId) {
            if (this.templates[templateId]) {
                return;
            }

            return $.get(this.path + "/" + this.props.templates[templateId].data, $.proxy(function(data) {
                this.data[templateId] = data;
            }, this), "json");
        },

        loadAllData: function() {
            if (this.dataLoaded) { return this.dataLoaded; }
            
            var datas = [];

            for (var templateId in this.props.templates) {
                if (this.props.templates.hasOwnProperty(templateId)) {
                    datas.push(this.loadDataFile(templateId));
                }
            }

            return this.dataLoaded = $.when.apply(this, datas);
        },

        // TODO: reconsider how this works so that rendering is with renderer
        loadAllCss: function() {
            var cssFiles = this.props.css;
            var cssPaths = $.map(cssFiles, $.proxy(function(cssFile) {
                return "@import '" + this.path + "/" + cssFile + "';";
            }, this));

            var css = cssPaths.join("\n");
            $componentStyles.append(css);
            $componentCss.html(prettyPrintOne(css, "css", true));
            addCopyButton($componentCss, css);
        },

        unloadAllCss: function() {
            $componentStyles.empty();
        },

        loadProps: function() {
            if (this.propsLoaded) { return this.propsLoaded; }
            
            return this.propsLoaded = $.get(this.descriptor, $.proxy(function(props) {
                this.props = props;
            }, this), "json");
        },
        
        load: function() {
            this.loaded = $.when(this.loadProps()).pipe($.proxy(function() {
                return $.when.apply(this, [
                   this.loadAllCss(),
                   this.loadAllTemplates(),
                   this.loadAllData()
               ]);
            }, this));
            
            return this.loaded;
        },
        
        destroy : function() {
            this.unloadAllCss();
        },
        
        getName: function() {
            return this.props.name;
        }
    };
    
    
    // ComponentList class
    var ComponentList = function(descriptor) {
        this.descriptor = descriptor;
        this.loaded = null;
        Array.prototype.push.call(this, null);
        Array.prototype.shift.call(this);
    };

    ComponentList.prototype = {
        load: function() {
            if (this.loaded) { return this.loaded; }
            
            return this.loaded = $.getJSON(this.descriptor, $.proxy(function(data) {
                for(var i = 0; i < data.components.length; i++) {
                    var component = data.components[i];
                    Array.prototype.push.call(this, new Component(component.url));
                }
            }, this));
        },
        
        loadComponentsProps: function() {
            var loadingComponentsProps = $.map(this, function(component) {
                return component.loadProps();
            });
            
            return $.when.apply(this, loadingComponentsProps);
        }
    };

    
    var ComponentRenderer = (function() {

        var $componentStage = $componentView.children(".component"),
            $componentStates = $("#states"),
            $componentDetails = $("#component-details"), 
            $componentTitle = $componentDetails.find("h1"),
            $componentAuthor = $componentDetails.find(".author"),
            $componentData = $("#data"),
            $componentHTML = $("#component-copy").find(".html");
        
        var SELECTED_CLASS = "selected";

        function escapeHTML(str) {                                                                                                        
            return str.replace(/>/g,'&gt;')
                        .replace(/</g,'&lt;')
                        .replace(/"/g,'&quot;');
        };
        
        function displayCopyHTML(html) {
            $componentHTML.html(prettyPrintOne(escapeHTML(html), "html", true));
            addCopyButton($componentHTML, html);
        }
        
        function makeTemplateClickHandler(templateId, component, $templateList) {
            return function(e) {
                var $li = $(this);
                
                $templateList.find("li").removeClass(SELECTED_CLASS);
                $li.addClass(SELECTED_CLASS);
                
                new ComponentRenderer().renderTemplate(component, templateId);
            };
        }

        function displayDetails(component) {
            $.when(component.load()).then(function() {
                var $templateList;
                
                $componentTitle.html(component.props.name);
                $componentAuthor.html(component.props.author);

                $templateList = $("<ul/>");
                
                for (var templateId in component.templates) {
                    if (component.templates.hasOwnProperty(templateId)) {
                        var $li = $("<li/>").html(templateId).click(makeTemplateClickHandler(templateId, component, $templateList));

                        $templateList.append($li);
                    }
                }

                $componentStates.find("ul").replaceWith($templateList);

                $componentData.find("form").replaceWith(json2form(component.data["Default"]));
            });
        }

        function displayTemplate(component, templateId, data) {
            $.when(component.load())
             .then(function() {
                 var template = component.templates[templateId],
                     templateData = data || component.data[templateId];
                 
                 var html = Mustache.to_html(template, templateData);
                 $componentStage.html(html);
                 displayCopyHTML(html);
             });
        }
   
        return function() {
            if (ComponentRenderer.instance) {
                return ComponentRenderer.instance;
            }
            
            ComponentRenderer.instance = this;
            
            var currentRendering = 0;
            
            this.render = function(component) {
                displayDetails(component);
                this.renderTemplate(component, "Default");
            };
            
            this.renderTemplate = function(component, templateId) {
                this.renderTemplateWithData(component, templateId);
            };
            
            this.renderTemplateWithData = function(component, templateId, data) {
                displayTemplate(component, templateId, data);
            }
        };
        
    })();
    
    global.ComponentList = ComponentList;
    global.Component = Component;
    global.ComponentRenderer = ComponentRenderer;
})(this, jQuery, Mustache);