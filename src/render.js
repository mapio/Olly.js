/*global window */
(function (olly, document) {
    "use strict";
    
    olly.render = function (element, URL) {
        var src, domain, domainName, field, templateObj, scriptIndex;
        
        domainName = this.findDomain(URL);
        
        if (!domainName) {
            return "";
        }
        
        domain = this.domains[domainName](URL);
        templateObj = this.templates[domain.template || domainName];
        
        this.load('http://www.ustream.tv/oembed?url=http://www.ustream.tv/channel/americatv2oficial').then(function (data) {
            console.log(data); 
        });
        
        if (templateObj.scripts) {
            for (scriptIndex = 0; scriptIndex < templateObj.scripts.length; scriptIndex += 1) {
                src = templateObj.scripts[scriptIndex];
                this.loadScript(element, olly.generate(src, domain.data));
            }
        }
        
        if (domain.templatePromise) {
            domain.templatePromise.then(function (templateObj) {
                this.display(templateObj, domain.data, element);
            });
        } else {
            this.display(templateObj, domain.data, element);
        }
        
        return true;
    };
    
    olly.findDomain = function (URL) {
        var domainName, domainNameIndex, domainNames;

        domainNames = URL.hostname.split('.');
        
        for (domainNameIndex in domainNames) {
            domainName = domainNames[domainNameIndex];
            if (this.domains[domainName] !== undefined) {
                break;
            }
        }
        
        if (!domainName) { return false; }
        
        return domainName;
    };
    
    olly.load = function (src) {
        var deferred = olly.defer();
        
        function reqListener (res) {
            deferred.resolve(res.responseText);
        }
        
        var xhr = new XMLHttpRequest();
        xhr.onload = reqListener;
        xhr.open("get", src, true);
        xhr.send(); 
        
        return deferred.promise;
    };
    
    olly.loadScript = function (element, src) {
        var script;
        script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = src;
        element.appendChild(script);
    };
    
    olly.display = function (templateObj, data, element) {
        if (typeof templateObj === "string") {
            templateObj = {markup: templateObj};
        }
        
        element.innerHTML = olly.generate(templateObj.markup, data);
    };
    
    olly.generate = function (template, data) {
        var field, output;
        output = template;
        for (field in data) {
            output = output.replace(new RegExp("{{" + field + "}}", "g"), data[field]);
        }
        return output;
    };
}(window.olly, window.document));