/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var parse5 = require('parse5/index');
var collection_1 = require('../src/facade/collection');
var platform_browser_private_1 = require('../platform_browser_private');
var lang_1 = require('../src/facade/lang');
var exceptions_1 = require('../src/facade/exceptions');
var compiler_private_1 = require('../compiler_private');
var compiler_1 = require('@angular/compiler');
var parser = null;
var serializer = null;
var treeAdapter = null;
var _attrToPropMap = {
    'class': 'className',
    'innerHtml': 'innerHTML',
    'readonly': 'readOnly',
    'tabindex': 'tabIndex',
};
var defDoc = null;
var mapProps = ['attribs', 'x-attribsNamespace', 'x-attribsPrefix'];
function _notImplemented(methodName /** TODO #9100 */) {
    return new exceptions_1.BaseException('This method is not implemented in Parse5DomAdapter: ' + methodName);
}
/* tslint:disable:requireParameterType */
var Parse5DomAdapter = (function (_super) {
    __extends(Parse5DomAdapter, _super);
    function Parse5DomAdapter() {
        _super.apply(this, arguments);
    }
    Parse5DomAdapter.makeCurrent = function () {
        parser = new parse5.Parser(parse5.TreeAdapters.htmlparser2);
        serializer = new parse5.Serializer(parse5.TreeAdapters.htmlparser2);
        treeAdapter = parser.treeAdapter;
        platform_browser_private_1.setRootDomAdapter(new Parse5DomAdapter());
    };
    Parse5DomAdapter.prototype.hasProperty = function (element /** TODO #9100 */, name) {
        return _HTMLElementPropertyList.indexOf(name) > -1;
    };
    // TODO(tbosch): don't even call this method when we run the tests on server side
    // by not using the DomRenderer in tests. Keeping this for now to make tests happy...
    Parse5DomAdapter.prototype.setProperty = function (el, name, value) {
        if (name === 'innerHTML') {
            this.setInnerHTML(el, value);
        }
        else if (name === 'className') {
            el.attribs['class'] = el.className = value;
        }
        else {
            el[name] = value;
        }
    };
    // TODO(tbosch): don't even call this method when we run the tests on server side
    // by not using the DomRenderer in tests. Keeping this for now to make tests happy...
    Parse5DomAdapter.prototype.getProperty = function (el, name) { return el[name]; };
    Parse5DomAdapter.prototype.logError = function (error /** TODO #9100 */) { console.error(error); };
    Parse5DomAdapter.prototype.log = function (error /** TODO #9100 */) { console.log(error); };
    Parse5DomAdapter.prototype.logGroup = function (error /** TODO #9100 */) { console.error(error); };
    Parse5DomAdapter.prototype.logGroupEnd = function () { };
    Parse5DomAdapter.prototype.getXHR = function () { return compiler_1.XHR; };
    Object.defineProperty(Parse5DomAdapter.prototype, "attrToPropMap", {
        get: function () { return _attrToPropMap; },
        enumerable: true,
        configurable: true
    });
    Parse5DomAdapter.prototype.query = function (selector /** TODO #9100 */) { throw _notImplemented('query'); };
    Parse5DomAdapter.prototype.querySelector = function (el /** TODO #9100 */, selector) {
        return this.querySelectorAll(el, selector)[0];
    };
    Parse5DomAdapter.prototype.querySelectorAll = function (el /** TODO #9100 */, selector) {
        var _this = this;
        var res = [];
        var _recursive = function (result /** TODO #9100 */, node /** TODO #9100 */, selector /** TODO #9100 */, matcher /** TODO #9100 */) {
            var cNodes = node.childNodes;
            if (cNodes && cNodes.length > 0) {
                for (var i = 0; i < cNodes.length; i++) {
                    var childNode = cNodes[i];
                    if (_this.elementMatches(childNode, selector, matcher)) {
                        result.push(childNode);
                    }
                    _recursive(result, childNode, selector, matcher);
                }
            }
        };
        var matcher = new compiler_private_1.SelectorMatcher();
        matcher.addSelectables(compiler_private_1.CssSelector.parse(selector));
        _recursive(res, el, selector, matcher);
        return res;
    };
    Parse5DomAdapter.prototype.elementMatches = function (node /** TODO #9100 */, selector, matcher) {
        if (matcher === void 0) { matcher = null; }
        if (this.isElementNode(node) && selector === '*') {
            return true;
        }
        var result = false;
        if (selector && selector.charAt(0) == '#') {
            result = this.getAttribute(node, 'id') == selector.substring(1);
        }
        else if (selector) {
            var result = false;
            if (matcher == null) {
                matcher = new compiler_private_1.SelectorMatcher();
                matcher.addSelectables(compiler_private_1.CssSelector.parse(selector));
            }
            var cssSelector = new compiler_private_1.CssSelector();
            cssSelector.setElement(this.tagName(node));
            if (node.attribs) {
                for (var attrName in node.attribs) {
                    cssSelector.addAttribute(attrName, node.attribs[attrName]);
                }
            }
            var classList = this.classList(node);
            for (var i = 0; i < classList.length; i++) {
                cssSelector.addClassName(classList[i]);
            }
            matcher.match(cssSelector, function (selector /** TODO #9100 */, cb /** TODO #9100 */) { result = true; });
        }
        return result;
    };
    Parse5DomAdapter.prototype.on = function (el /** TODO #9100 */, evt /** TODO #9100 */, listener /** TODO #9100 */) {
        var listenersMap = el._eventListenersMap;
        if (lang_1.isBlank(listenersMap)) {
            var listenersMap = collection_1.StringMapWrapper.create();
            el._eventListenersMap = listenersMap;
        }
        var listeners = collection_1.StringMapWrapper.get(listenersMap, evt);
        if (lang_1.isBlank(listeners)) {
            listeners = [];
        }
        listeners.push(listener);
        collection_1.StringMapWrapper.set(listenersMap, evt, listeners);
    };
    Parse5DomAdapter.prototype.onAndCancel = function (el /** TODO #9100 */, evt /** TODO #9100 */, listener /** TODO #9100 */) {
        this.on(el, evt, listener);
        return function () {
            collection_1.ListWrapper.remove(collection_1.StringMapWrapper.get(el._eventListenersMap, evt), listener);
        };
    };
    Parse5DomAdapter.prototype.dispatchEvent = function (el /** TODO #9100 */, evt /** TODO #9100 */) {
        if (lang_1.isBlank(evt.target)) {
            evt.target = el;
        }
        if (lang_1.isPresent(el._eventListenersMap)) {
            var listeners = collection_1.StringMapWrapper.get(el._eventListenersMap, evt.type);
            if (lang_1.isPresent(listeners)) {
                for (var i = 0; i < listeners.length; i++) {
                    listeners[i](evt);
                }
            }
        }
        if (lang_1.isPresent(el.parent)) {
            this.dispatchEvent(el.parent, evt);
        }
        if (lang_1.isPresent(el._window)) {
            this.dispatchEvent(el._window, evt);
        }
    };
    Parse5DomAdapter.prototype.createMouseEvent = function (eventType /** TODO #9100 */) { return this.createEvent(eventType); };
    Parse5DomAdapter.prototype.createEvent = function (eventType) {
        var evt = {
            type: eventType,
            defaultPrevented: false,
            preventDefault: function () { evt.defaultPrevented = true; }
        };
        return evt;
    };
    Parse5DomAdapter.prototype.preventDefault = function (evt /** TODO #9100 */) { evt.returnValue = false; };
    Parse5DomAdapter.prototype.isPrevented = function (evt /** TODO #9100 */) {
        return lang_1.isPresent(evt.returnValue) && !evt.returnValue;
    };
    Parse5DomAdapter.prototype.getInnerHTML = function (el /** TODO #9100 */) {
        return serializer.serialize(this.templateAwareRoot(el));
    };
    Parse5DomAdapter.prototype.getTemplateContent = function (el /** TODO #9100 */) {
        return null; // no <template> support in parse5.
    };
    Parse5DomAdapter.prototype.getOuterHTML = function (el /** TODO #9100 */) {
        serializer.html = '';
        serializer._serializeElement(el);
        return serializer.html;
    };
    Parse5DomAdapter.prototype.nodeName = function (node /** TODO #9100 */) { return node.tagName; };
    Parse5DomAdapter.prototype.nodeValue = function (node /** TODO #9100 */) { return node.nodeValue; };
    Parse5DomAdapter.prototype.type = function (node) { throw _notImplemented('type'); };
    Parse5DomAdapter.prototype.content = function (node /** TODO #9100 */) { return node.childNodes[0]; };
    Parse5DomAdapter.prototype.firstChild = function (el /** TODO #9100 */) { return el.firstChild; };
    Parse5DomAdapter.prototype.nextSibling = function (el /** TODO #9100 */) { return el.nextSibling; };
    Parse5DomAdapter.prototype.parentElement = function (el /** TODO #9100 */) { return el.parent; };
    Parse5DomAdapter.prototype.childNodes = function (el /** TODO #9100 */) { return el.childNodes; };
    Parse5DomAdapter.prototype.childNodesAsList = function (el /** TODO #9100 */) {
        var childNodes = el.childNodes;
        var res = collection_1.ListWrapper.createFixedSize(childNodes.length);
        for (var i = 0; i < childNodes.length; i++) {
            res[i] = childNodes[i];
        }
        return res;
    };
    Parse5DomAdapter.prototype.clearNodes = function (el /** TODO #9100 */) {
        while (el.childNodes.length > 0) {
            this.remove(el.childNodes[0]);
        }
    };
    Parse5DomAdapter.prototype.appendChild = function (el /** TODO #9100 */, node /** TODO #9100 */) {
        this.remove(node);
        treeAdapter.appendChild(this.templateAwareRoot(el), node);
    };
    Parse5DomAdapter.prototype.removeChild = function (el /** TODO #9100 */, node /** TODO #9100 */) {
        if (collection_1.ListWrapper.contains(el.childNodes, node)) {
            this.remove(node);
        }
    };
    Parse5DomAdapter.prototype.remove = function (el /** TODO #9100 */) {
        var parent = el.parent;
        if (parent) {
            var index = parent.childNodes.indexOf(el);
            parent.childNodes.splice(index, 1);
        }
        var prev = el.previousSibling;
        var next = el.nextSibling;
        if (prev) {
            prev.next = next;
        }
        if (next) {
            next.prev = prev;
        }
        el.prev = null;
        el.next = null;
        el.parent = null;
        return el;
    };
    Parse5DomAdapter.prototype.insertBefore = function (el /** TODO #9100 */, node /** TODO #9100 */) {
        this.remove(node);
        treeAdapter.insertBefore(el.parent, node, el);
    };
    Parse5DomAdapter.prototype.insertAllBefore = function (el /** TODO #9100 */, nodes /** TODO #9100 */) {
        var _this = this;
        nodes.forEach(function (n /** TODO #9100 */) { return _this.insertBefore(el, n); });
    };
    Parse5DomAdapter.prototype.insertAfter = function (el /** TODO #9100 */, node /** TODO #9100 */) {
        if (el.nextSibling) {
            this.insertBefore(el.nextSibling, node);
        }
        else {
            this.appendChild(el.parent, node);
        }
    };
    Parse5DomAdapter.prototype.setInnerHTML = function (el /** TODO #9100 */, value /** TODO #9100 */) {
        this.clearNodes(el);
        var content = parser.parseFragment(value);
        for (var i = 0; i < content.childNodes.length; i++) {
            treeAdapter.appendChild(el, content.childNodes[i]);
        }
    };
    Parse5DomAdapter.prototype.getText = function (el /** TODO #9100 */, isRecursive) {
        if (this.isTextNode(el)) {
            return el.data;
        }
        else if (this.isCommentNode(el)) {
            // In the DOM, comments within an element return an empty string for textContent
            // However, comment node instances return the comment content for textContent getter
            return isRecursive ? '' : el.data;
        }
        else if (lang_1.isBlank(el.childNodes) || el.childNodes.length == 0) {
            return '';
        }
        else {
            var textContent = '';
            for (var i = 0; i < el.childNodes.length; i++) {
                textContent += this.getText(el.childNodes[i], true);
            }
            return textContent;
        }
    };
    Parse5DomAdapter.prototype.setText = function (el /** TODO #9100 */, value) {
        if (this.isTextNode(el) || this.isCommentNode(el)) {
            el.data = value;
        }
        else {
            this.clearNodes(el);
            if (value !== '')
                treeAdapter.insertText(el, value);
        }
    };
    Parse5DomAdapter.prototype.getValue = function (el /** TODO #9100 */) { return el.value; };
    Parse5DomAdapter.prototype.setValue = function (el /** TODO #9100 */, value) { el.value = value; };
    Parse5DomAdapter.prototype.getChecked = function (el /** TODO #9100 */) { return el.checked; };
    Parse5DomAdapter.prototype.setChecked = function (el /** TODO #9100 */, value) { el.checked = value; };
    Parse5DomAdapter.prototype.createComment = function (text) { return treeAdapter.createCommentNode(text); };
    Parse5DomAdapter.prototype.createTemplate = function (html /** TODO #9100 */) {
        var template = treeAdapter.createElement('template', 'http://www.w3.org/1999/xhtml', []);
        var content = parser.parseFragment(html);
        treeAdapter.appendChild(template, content);
        return template;
    };
    Parse5DomAdapter.prototype.createElement = function (tagName /** TODO #9100 */) {
        return treeAdapter.createElement(tagName, 'http://www.w3.org/1999/xhtml', []);
    };
    Parse5DomAdapter.prototype.createElementNS = function (ns /** TODO #9100 */, tagName /** TODO #9100 */) {
        return treeAdapter.createElement(tagName, ns, []);
    };
    Parse5DomAdapter.prototype.createTextNode = function (text) {
        var t = this.createComment(text);
        t.type = 'text';
        return t;
    };
    Parse5DomAdapter.prototype.createScriptTag = function (attrName, attrValue) {
        return treeAdapter.createElement('script', 'http://www.w3.org/1999/xhtml', [{ name: attrName, value: attrValue }]);
    };
    Parse5DomAdapter.prototype.createStyleElement = function (css) {
        var style = this.createElement('style');
        this.setText(style, css);
        return style;
    };
    Parse5DomAdapter.prototype.createShadowRoot = function (el /** TODO #9100 */) {
        el.shadowRoot = treeAdapter.createDocumentFragment();
        el.shadowRoot.parent = el;
        return el.shadowRoot;
    };
    Parse5DomAdapter.prototype.getShadowRoot = function (el /** TODO #9100 */) { return el.shadowRoot; };
    Parse5DomAdapter.prototype.getHost = function (el /** TODO #9100 */) { return el.host; };
    Parse5DomAdapter.prototype.getDistributedNodes = function (el) { throw _notImplemented('getDistributedNodes'); };
    Parse5DomAdapter.prototype.clone = function (node) {
        var _recursive = function (node /** TODO #9100 */) {
            var nodeClone = Object.create(Object.getPrototypeOf(node));
            for (var prop in node) {
                var desc = Object.getOwnPropertyDescriptor(node, prop);
                if (desc && 'value' in desc && typeof desc.value !== 'object') {
                    nodeClone[prop] = node[prop];
                }
            }
            nodeClone.parent = null;
            nodeClone.prev = null;
            nodeClone.next = null;
            nodeClone.children = null;
            mapProps.forEach(function (mapName) {
                if (lang_1.isPresent(node[mapName])) {
                    nodeClone[mapName] = {};
                    for (var prop in node[mapName]) {
                        nodeClone[mapName][prop] = node[mapName][prop];
                    }
                }
            });
            var cNodes = node.children;
            if (cNodes) {
                var cNodesClone = new Array(cNodes.length);
                for (var i = 0; i < cNodes.length; i++) {
                    var childNode = cNodes[i];
                    var childNodeClone = _recursive(childNode);
                    cNodesClone[i] = childNodeClone;
                    if (i > 0) {
                        childNodeClone.prev = cNodesClone[i - 1];
                        cNodesClone[i - 1].next = childNodeClone;
                    }
                    childNodeClone.parent = nodeClone;
                }
                nodeClone.children = cNodesClone;
            }
            return nodeClone;
        };
        return _recursive(node);
    };
    Parse5DomAdapter.prototype.getElementsByClassName = function (element /** TODO #9100 */, name) {
        return this.querySelectorAll(element, '.' + name);
    };
    Parse5DomAdapter.prototype.getElementsByTagName = function (element, name) {
        throw _notImplemented('getElementsByTagName');
    };
    Parse5DomAdapter.prototype.classList = function (element /** TODO #9100 */) {
        var classAttrValue = null;
        var attributes = element.attribs;
        if (attributes && attributes.hasOwnProperty('class')) {
            classAttrValue = attributes['class'];
        }
        return classAttrValue ? classAttrValue.trim().split(/\s+/g) : [];
    };
    Parse5DomAdapter.prototype.addClass = function (element /** TODO #9100 */, className) {
        var classList = this.classList(element);
        var index = classList.indexOf(className);
        if (index == -1) {
            classList.push(className);
            element.attribs['class'] = element.className = classList.join(' ');
        }
    };
    Parse5DomAdapter.prototype.removeClass = function (element /** TODO #9100 */, className) {
        var classList = this.classList(element);
        var index = classList.indexOf(className);
        if (index > -1) {
            classList.splice(index, 1);
            element.attribs['class'] = element.className = classList.join(' ');
        }
    };
    Parse5DomAdapter.prototype.hasClass = function (element /** TODO #9100 */, className) {
        return collection_1.ListWrapper.contains(this.classList(element), className);
    };
    Parse5DomAdapter.prototype.hasStyle = function (element /** TODO #9100 */, styleName, styleValue) {
        if (styleValue === void 0) { styleValue = null; }
        var value = this.getStyle(element, styleName) || '';
        return styleValue ? value == styleValue : value.length > 0;
    };
    /** @internal */
    Parse5DomAdapter.prototype._readStyleAttribute = function (element /** TODO #9100 */) {
        var styleMap = {};
        var attributes = element.attribs;
        if (attributes && attributes.hasOwnProperty('style')) {
            var styleAttrValue = attributes['style'];
            var styleList = styleAttrValue.split(/;+/g);
            for (var i = 0; i < styleList.length; i++) {
                if (styleList[i].length > 0) {
                    var elems = styleList[i].split(/:+/g);
                    styleMap[elems[0].trim()] = elems[1].trim();
                }
            }
        }
        return styleMap;
    };
    /** @internal */
    Parse5DomAdapter.prototype._writeStyleAttribute = function (element /** TODO #9100 */, styleMap /** TODO #9100 */) {
        var styleAttrValue = '';
        for (var key in styleMap) {
            var newValue = styleMap[key];
            if (newValue && newValue.length > 0) {
                styleAttrValue += key + ':' + styleMap[key] + ';';
            }
        }
        element.attribs['style'] = styleAttrValue;
    };
    Parse5DomAdapter.prototype.setStyle = function (element /** TODO #9100 */, styleName, styleValue) {
        var styleMap = this._readStyleAttribute(element);
        styleMap[styleName] = styleValue;
        this._writeStyleAttribute(element, styleMap);
    };
    Parse5DomAdapter.prototype.removeStyle = function (element /** TODO #9100 */, styleName) {
        this.setStyle(element, styleName, null);
    };
    Parse5DomAdapter.prototype.getStyle = function (element /** TODO #9100 */, styleName) {
        var styleMap = this._readStyleAttribute(element);
        return styleMap.hasOwnProperty(styleName) ? styleMap[styleName] : '';
    };
    Parse5DomAdapter.prototype.tagName = function (element /** TODO #9100 */) {
        return element.tagName == 'style' ? 'STYLE' : element.tagName;
    };
    Parse5DomAdapter.prototype.attributeMap = function (element /** TODO #9100 */) {
        var res = new Map();
        var elAttrs = treeAdapter.getAttrList(element);
        for (var i = 0; i < elAttrs.length; i++) {
            var attrib = elAttrs[i];
            res.set(attrib.name, attrib.value);
        }
        return res;
    };
    Parse5DomAdapter.prototype.hasAttribute = function (element /** TODO #9100 */, attribute) {
        return element.attribs && element.attribs.hasOwnProperty(attribute);
    };
    Parse5DomAdapter.prototype.hasAttributeNS = function (element /** TODO #9100 */, ns, attribute) {
        throw 'not implemented';
    };
    Parse5DomAdapter.prototype.getAttribute = function (element /** TODO #9100 */, attribute) {
        return element.attribs && element.attribs.hasOwnProperty(attribute) ?
            element.attribs[attribute] :
            null;
    };
    Parse5DomAdapter.prototype.getAttributeNS = function (element /** TODO #9100 */, ns, attribute) {
        throw 'not implemented';
    };
    Parse5DomAdapter.prototype.setAttribute = function (element /** TODO #9100 */, attribute, value) {
        if (attribute) {
            element.attribs[attribute] = value;
            if (attribute === 'class') {
                element.className = value;
            }
        }
    };
    Parse5DomAdapter.prototype.setAttributeNS = function (element /** TODO #9100 */, ns, attribute, value) {
        throw 'not implemented';
    };
    Parse5DomAdapter.prototype.removeAttribute = function (element /** TODO #9100 */, attribute) {
        if (attribute) {
            collection_1.StringMapWrapper.delete(element.attribs, attribute);
        }
    };
    Parse5DomAdapter.prototype.removeAttributeNS = function (element /** TODO #9100 */, ns, name) {
        throw 'not implemented';
    };
    Parse5DomAdapter.prototype.templateAwareRoot = function (el /** TODO #9100 */) {
        return this.isTemplateElement(el) ? this.content(el) : el;
    };
    Parse5DomAdapter.prototype.createHtmlDocument = function () {
        var newDoc = treeAdapter.createDocument();
        newDoc.title = 'fake title';
        var head = treeAdapter.createElement('head', null, []);
        var body = treeAdapter.createElement('body', 'http://www.w3.org/1999/xhtml', []);
        this.appendChild(newDoc, head);
        this.appendChild(newDoc, body);
        collection_1.StringMapWrapper.set(newDoc, 'head', head);
        collection_1.StringMapWrapper.set(newDoc, 'body', body);
        collection_1.StringMapWrapper.set(newDoc, '_window', collection_1.StringMapWrapper.create());
        return newDoc;
    };
    Parse5DomAdapter.prototype.defaultDoc = function () {
        if (defDoc === null) {
            defDoc = this.createHtmlDocument();
        }
        return defDoc;
    };
    Parse5DomAdapter.prototype.getBoundingClientRect = function (el /** TODO #9100 */) {
        return { left: 0, top: 0, width: 0, height: 0 };
    };
    Parse5DomAdapter.prototype.getTitle = function () { return this.defaultDoc().title || ''; };
    Parse5DomAdapter.prototype.setTitle = function (newTitle) { this.defaultDoc().title = newTitle; };
    Parse5DomAdapter.prototype.isTemplateElement = function (el) {
        return this.isElementNode(el) && this.tagName(el) === 'template';
    };
    Parse5DomAdapter.prototype.isTextNode = function (node /** TODO #9100 */) { return treeAdapter.isTextNode(node); };
    Parse5DomAdapter.prototype.isCommentNode = function (node /** TODO #9100 */) { return treeAdapter.isCommentNode(node); };
    Parse5DomAdapter.prototype.isElementNode = function (node /** TODO #9100 */) {
        return node ? treeAdapter.isElementNode(node) : false;
    };
    Parse5DomAdapter.prototype.hasShadowRoot = function (node /** TODO #9100 */) { return lang_1.isPresent(node.shadowRoot); };
    Parse5DomAdapter.prototype.isShadowRoot = function (node /** TODO #9100 */) { return this.getShadowRoot(node) == node; };
    Parse5DomAdapter.prototype.importIntoDoc = function (node /** TODO #9100 */) { return this.clone(node); };
    Parse5DomAdapter.prototype.adoptNode = function (node /** TODO #9100 */) { return node; };
    Parse5DomAdapter.prototype.getHref = function (el /** TODO #9100 */) { return el.href; };
    Parse5DomAdapter.prototype.resolveAndSetHref = function (el /** TODO #9100 */, baseUrl, href) {
        if (href == null) {
            el.href = baseUrl;
        }
        else {
            el.href = baseUrl + '/../' + href;
        }
    };
    /** @internal */
    Parse5DomAdapter.prototype._buildRules = function (parsedRules /** TODO #9100 */, css /** TODO #9100 */) {
        var rules = [];
        for (var i = 0; i < parsedRules.length; i++) {
            var parsedRule = parsedRules[i];
            var rule = collection_1.StringMapWrapper.create();
            collection_1.StringMapWrapper.set(rule, 'cssText', css);
            collection_1.StringMapWrapper.set(rule, 'style', { content: '', cssText: '' });
            if (parsedRule.type == 'rule') {
                collection_1.StringMapWrapper.set(rule, 'type', 1);
                collection_1.StringMapWrapper.set(rule, 'selectorText', parsedRule.selectors.join(', ')
                    .replace(/\s{2,}/g, ' ')
                    .replace(/\s*~\s*/g, ' ~ ')
                    .replace(/\s*\+\s*/g, ' + ')
                    .replace(/\s*>\s*/g, ' > ')
                    .replace(/\[(\w+)=(\w+)\]/g, '[$1="$2"]'));
                if (lang_1.isBlank(parsedRule.declarations)) {
                    continue;
                }
                for (var j = 0; j < parsedRule.declarations.length; j++) {
                    var declaration = parsedRule.declarations[j];
                    collection_1.StringMapWrapper.set(collection_1.StringMapWrapper.get(rule, 'style'), declaration.property, declaration.value);
                    collection_1.StringMapWrapper.get(rule, 'style').cssText +=
                        declaration.property + ': ' + declaration.value + ';';
                }
            }
            else if (parsedRule.type == 'media') {
                collection_1.StringMapWrapper.set(rule, 'type', 4);
                collection_1.StringMapWrapper.set(rule, 'media', { mediaText: parsedRule.media });
                if (parsedRule.rules) {
                    collection_1.StringMapWrapper.set(rule, 'cssRules', this._buildRules(parsedRule.rules));
                }
            }
            rules.push(rule);
        }
        return rules;
    };
    Parse5DomAdapter.prototype.supportsDOMEvents = function () { return false; };
    Parse5DomAdapter.prototype.supportsNativeShadowDOM = function () { return false; };
    Parse5DomAdapter.prototype.getGlobalEventTarget = function (target) {
        if (target == 'window') {
            return this.defaultDoc()._window;
        }
        else if (target == 'document') {
            return this.defaultDoc();
        }
        else if (target == 'body') {
            return this.defaultDoc().body;
        }
    };
    Parse5DomAdapter.prototype.getBaseHref = function () { throw 'not implemented'; };
    Parse5DomAdapter.prototype.resetBaseElement = function () { throw 'not implemented'; };
    Parse5DomAdapter.prototype.getHistory = function () { throw 'not implemented'; };
    Parse5DomAdapter.prototype.getLocation = function () { throw 'not implemented'; };
    Parse5DomAdapter.prototype.getUserAgent = function () { return 'Fake user agent'; };
    Parse5DomAdapter.prototype.getData = function (el /** TODO #9100 */, name) {
        return this.getAttribute(el, 'data-' + name);
    };
    Parse5DomAdapter.prototype.getComputedStyle = function (el /** TODO #9100 */) { throw 'not implemented'; };
    Parse5DomAdapter.prototype.setData = function (el /** TODO #9100 */, name, value) {
        this.setAttribute(el, 'data-' + name, value);
    };
    // TODO(tbosch): move this into a separate environment class once we have it
    Parse5DomAdapter.prototype.setGlobalVar = function (path, value) { lang_1.setValueOnPath(lang_1.global, path, value); };
    Parse5DomAdapter.prototype.requestAnimationFrame = function (callback /** TODO #9100 */) { return setTimeout(callback, 0); };
    Parse5DomAdapter.prototype.cancelAnimationFrame = function (id) { clearTimeout(id); };
    Parse5DomAdapter.prototype.supportsWebAnimation = function () { return false; };
    Parse5DomAdapter.prototype.performanceNow = function () { return lang_1.DateWrapper.toMillis(lang_1.DateWrapper.now()); };
    Parse5DomAdapter.prototype.getAnimationPrefix = function () { return ''; };
    Parse5DomAdapter.prototype.getTransitionEnd = function () { return 'transitionend'; };
    Parse5DomAdapter.prototype.supportsAnimation = function () { return true; };
    Parse5DomAdapter.prototype.replaceChild = function (el /** TODO #9100 */, newNode /** TODO #9100 */, oldNode /** TODO #9100 */) {
        throw new Error('not implemented');
    };
    Parse5DomAdapter.prototype.parse = function (templateHtml) { throw new Error('not implemented'); };
    Parse5DomAdapter.prototype.invoke = function (el, methodName, args) { throw new Error('not implemented'); };
    Parse5DomAdapter.prototype.getEventKey = function (event /** TODO #9100 */) { throw new Error('not implemented'); };
    Parse5DomAdapter.prototype.supportsCookies = function () { return false; };
    Parse5DomAdapter.prototype.getCookie = function (name) { throw new Error('not implemented'); };
    Parse5DomAdapter.prototype.setCookie = function (name, value) { throw new Error('not implemented'); };
    Parse5DomAdapter.prototype.animate = function (element, keyframes, options) { throw new Error('not implemented'); };
    return Parse5DomAdapter;
}(platform_browser_private_1.DomAdapter));
exports.Parse5DomAdapter = Parse5DomAdapter;
// TODO: build a proper list, this one is all the keys of a HTMLInputElement
var _HTMLElementPropertyList = [
    'webkitEntries',
    'incremental',
    'webkitdirectory',
    'selectionDirection',
    'selectionEnd',
    'selectionStart',
    'labels',
    'validationMessage',
    'validity',
    'willValidate',
    'width',
    'valueAsNumber',
    'valueAsDate',
    'value',
    'useMap',
    'defaultValue',
    'type',
    'step',
    'src',
    'size',
    'required',
    'readOnly',
    'placeholder',
    'pattern',
    'name',
    'multiple',
    'min',
    'minLength',
    'maxLength',
    'max',
    'list',
    'indeterminate',
    'height',
    'formTarget',
    'formNoValidate',
    'formMethod',
    'formEnctype',
    'formAction',
    'files',
    'form',
    'disabled',
    'dirName',
    'checked',
    'defaultChecked',
    'autofocus',
    'autocomplete',
    'alt',
    'align',
    'accept',
    'onautocompleteerror',
    'onautocomplete',
    'onwaiting',
    'onvolumechange',
    'ontoggle',
    'ontimeupdate',
    'onsuspend',
    'onsubmit',
    'onstalled',
    'onshow',
    'onselect',
    'onseeking',
    'onseeked',
    'onscroll',
    'onresize',
    'onreset',
    'onratechange',
    'onprogress',
    'onplaying',
    'onplay',
    'onpause',
    'onmousewheel',
    'onmouseup',
    'onmouseover',
    'onmouseout',
    'onmousemove',
    'onmouseleave',
    'onmouseenter',
    'onmousedown',
    'onloadstart',
    'onloadedmetadata',
    'onloadeddata',
    'onload',
    'onkeyup',
    'onkeypress',
    'onkeydown',
    'oninvalid',
    'oninput',
    'onfocus',
    'onerror',
    'onended',
    'onemptied',
    'ondurationchange',
    'ondrop',
    'ondragstart',
    'ondragover',
    'ondragleave',
    'ondragenter',
    'ondragend',
    'ondrag',
    'ondblclick',
    'oncuechange',
    'oncontextmenu',
    'onclose',
    'onclick',
    'onchange',
    'oncanplaythrough',
    'oncanplay',
    'oncancel',
    'onblur',
    'onabort',
    'spellcheck',
    'isContentEditable',
    'contentEditable',
    'outerText',
    'innerText',
    'accessKey',
    'hidden',
    'webkitdropzone',
    'draggable',
    'tabIndex',
    'dir',
    'translate',
    'lang',
    'title',
    'childElementCount',
    'lastElementChild',
    'firstElementChild',
    'children',
    'onwebkitfullscreenerror',
    'onwebkitfullscreenchange',
    'nextElementSibling',
    'previousElementSibling',
    'onwheel',
    'onselectstart',
    'onsearch',
    'onpaste',
    'oncut',
    'oncopy',
    'onbeforepaste',
    'onbeforecut',
    'onbeforecopy',
    'shadowRoot',
    'dataset',
    'classList',
    'className',
    'outerHTML',
    'innerHTML',
    'scrollHeight',
    'scrollWidth',
    'scrollTop',
    'scrollLeft',
    'clientHeight',
    'clientWidth',
    'clientTop',
    'clientLeft',
    'offsetParent',
    'offsetHeight',
    'offsetWidth',
    'offsetTop',
    'offsetLeft',
    'localName',
    'prefix',
    'namespaceURI',
    'id',
    'style',
    'attributes',
    'tagName',
    'parentElement',
    'textContent',
    'baseURI',
    'ownerDocument',
    'nextSibling',
    'previousSibling',
    'lastChild',
    'firstChild',
    'childNodes',
    'parentNode',
    'nodeType',
    'nodeValue',
    'nodeName',
    'closure_lm_714617',
    '__jsaction'
];
//# sourceMappingURL=parse5_adapter.js.map