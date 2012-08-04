(function(global, $, Mustache, undefined) {
    "use strict";

    String.prototype.escapeHTML = function () {                                                                                                        
        return this.replace(/>/g,'&gt;')
                    .replace(/</g,'&lt;')
                    .replace(/"/g,'&quot;');
    };

    var $componentView = $("#component-view"),
        $componentStage = $componentView.children(".component"),
        $componentStyles = $componentView.children("style"),
        $componentStates = $("#states"),
        $componentDetails = $("#component-details"), 
        $componentTitle = $componentDetails.find("h1"),
        $componentAuthor = $componentDetails.find(".author"),
        $componentData = $("#data"),
        $componentHTML = $("#component-copy").find(".html"),
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
            var datas = [];

            for (var templateId in this.props.templates) {
                if (this.props.templates.hasOwnProperty(templateId)) {
                    datas.push(this.loadDataFile(templateId));
                }
            }

            return this.dataLoaded = $.when.apply(this, datas);
        },

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
    
    global.ComponentList = ComponentList;
    global.Component = Component;
})(this, jQuery, Mustache);
//
//displayTemplate : function(templateId) {
//    $.when(this.templatesLoaded, this.dataLoaded)
//     .then($.proxy(function() {
//         var template = this.templates[templateId],
//             data = this.data[templateId];
//         var html = Mustache.to_html(template, data);
//         $componentStage.html(html);
//         this.displayCopyHTML(html);
//     }, this));
//},
//
//displayCopyHTML: function(html) {
//    $componentHTML.html(prettyPrintOne(html.escapeHTML(), "html", true));
//    addCopyButton($componentHTML, html);
//},
//
//displayDetails : function() {
//    $.when(this.propsLoaded).then($.proxy(function() {
//        $componentTitle.html(this.props.name);
//        $componentAuthor.html(this.props.author);
//    }, this));
//
//    $.when(this.templatesLoaded).then($.proxy(function() {
//        var $templateList = $("<ul/>");
//
//        for (var templateId in this.templates) {
//            if (this.templates.hasOwnProperty(templateId)) {
//                var $li = $("<li/>").html(templateId).click((function(tid, component) {
//                    return function(e) {
//                        component.displayTemplate(tid);
//                    }
//                })(templateId, this));
//
//                $templateList.append($li);
//            }
//        }
//
//        $componentStates.find("ul").replaceWith($templateList);
//    }, this));
//
//    $.when(this.dataLoaded).then($.proxy(function() {
//        $componentData.find("form").replaceWith(json2form(this.data["Default"]));
//    }, this));
//},