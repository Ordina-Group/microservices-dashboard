/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
var parse5 = require('parse5/index');
import { ListWrapper, StringMapWrapper } from '../src/facade/collection';
import { DomAdapter, setRootDomAdapter } from '../platform_browser_private';
import { isPresent, isBlank, global, setValueOnPath, DateWrapper } from '../src/facade/lang';
import { BaseException } from '../src/facade/exceptions';
import { SelectorMatcher, CssSelector } from '../compiler_private';
import { XHR } from '@angular/compiler';
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
    return new BaseException('This method is not implemented in Parse5DomAdapter: ' + methodName);
}
/* tslint:disable:requireParameterType */
export class Parse5DomAdapter extends DomAdapter {
    static makeCurrent() {
        parser = new parse5.Parser(parse5.TreeAdapters.htmlparser2);
        serializer = new parse5.Serializer(parse5.TreeAdapters.htmlparser2);
        treeAdapter = parser.treeAdapter;
        setRootDomAdapter(new Parse5DomAdapter());
    }
    hasProperty(element /** TODO #9100 */, name) {
        return _HTMLElementPropertyList.indexOf(name) > -1;
    }
    // TODO(tbosch): don't even call this method when we run the tests on server side
    // by not using the DomRenderer in tests. Keeping this for now to make tests happy...
    setProperty(el, name, value) {
        if (name === 'innerHTML') {
            this.setInnerHTML(el, value);
        }
        else if (name === 'className') {
            el.attribs['class'] = el.className = value;
        }
        else {
            el[name] = value;
        }
    }
    // TODO(tbosch): don't even call this method when we run the tests on server side
    // by not using the DomRenderer in tests. Keeping this for now to make tests happy...
    getProperty(el, name) { return el[name]; }
    logError(error /** TODO #9100 */) { console.error(error); }
    log(error /** TODO #9100 */) { console.log(error); }
    logGroup(error /** TODO #9100 */) { console.error(error); }
    logGroupEnd() { }
    getXHR() { return XHR; }
    get attrToPropMap() { return _attrToPropMap; }
    query(selector /** TODO #9100 */) { throw _notImplemented('query'); }
    querySelector(el /** TODO #9100 */, selector) {
        return this.querySelectorAll(el, selector)[0];
    }
    querySelectorAll(el /** TODO #9100 */, selector) {
        var res = [];
        var _recursive = (result /** TODO #9100 */, node /** TODO #9100 */, selector /** TODO #9100 */, matcher /** TODO #9100 */) => {
            var cNodes = node.childNodes;
            if (cNodes && cNodes.length > 0) {
                for (var i = 0; i < cNodes.length; i++) {
                    var childNode = cNodes[i];
                    if (this.elementMatches(childNode, selector, matcher)) {
                        result.push(childNode);
                    }
                    _recursive(result, childNode, selector, matcher);
                }
            }
        };
        var matcher = new SelectorMatcher();
        matcher.addSelectables(CssSelector.parse(selector));
        _recursive(res, el, selector, matcher);
        return res;
    }
    elementMatches(node /** TODO #9100 */, selector, matcher = null) {
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
                matcher = new SelectorMatcher();
                matcher.addSelectables(CssSelector.parse(selector));
            }
            var cssSelector = new CssSelector();
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
    }
    on(el /** TODO #9100 */, evt /** TODO #9100 */, listener /** TODO #9100 */) {
        var listenersMap = el._eventListenersMap;
        if (isBlank(listenersMap)) {
            var listenersMap = StringMapWrapper.create();
            el._eventListenersMap = listenersMap;
        }
        var listeners = StringMapWrapper.get(listenersMap, evt);
        if (isBlank(listeners)) {
            listeners = [];
        }
        listeners.push(listener);
        StringMapWrapper.set(listenersMap, evt, listeners);
    }
    onAndCancel(el /** TODO #9100 */, evt /** TODO #9100 */, listener /** TODO #9100 */) {
        this.on(el, evt, listener);
        return () => {
            ListWrapper.remove(StringMapWrapper.get(el._eventListenersMap, evt), listener);
        };
    }
    dispatchEvent(el /** TODO #9100 */, evt /** TODO #9100 */) {
        if (isBlank(evt.target)) {
            evt.target = el;
        }
        if (isPresent(el._eventListenersMap)) {
            var listeners = StringMapWrapper.get(el._eventListenersMap, evt.type);
            if (isPresent(listeners)) {
                for (var i = 0; i < listeners.length; i++) {
                    listeners[i](evt);
                }
            }
        }
        if (isPresent(el.parent)) {
            this.dispatchEvent(el.parent, evt);
        }
        if (isPresent(el._window)) {
            this.dispatchEvent(el._window, evt);
        }
    }
    createMouseEvent(eventType /** TODO #9100 */) { return this.createEvent(eventType); }
    createEvent(eventType) {
        var evt = {
            type: eventType,
            defaultPrevented: false,
            preventDefault: () => { evt.defaultPrevented = true; }
        };
        return evt;
    }
    preventDefault(evt /** TODO #9100 */) { evt.returnValue = false; }
    isPrevented(evt /** TODO #9100 */) {
        return isPresent(evt.returnValue) && !evt.returnValue;
    }
    getInnerHTML(el /** TODO #9100 */) {
        return serializer.serialize(this.templateAwareRoot(el));
    }
    getTemplateContent(el /** TODO #9100 */) {
        return null; // no <template> support in parse5.
    }
    getOuterHTML(el /** TODO #9100 */) {
        serializer.html = '';
        serializer._serializeElement(el);
        return serializer.html;
    }
    nodeName(node /** TODO #9100 */) { return node.tagName; }
    nodeValue(node /** TODO #9100 */) { return node.nodeValue; }
    type(node) { throw _notImplemented('type'); }
    content(node /** TODO #9100 */) { return node.childNodes[0]; }
    firstChild(el /** TODO #9100 */) { return el.firstChild; }
    nextSibling(el /** TODO #9100 */) { return el.nextSibling; }
    parentElement(el /** TODO #9100 */) { return el.parent; }
    childNodes(el /** TODO #9100 */) { return el.childNodes; }
    childNodesAsList(el /** TODO #9100 */) {
        var childNodes = el.childNodes;
        var res = ListWrapper.createFixedSize(childNodes.length);
        for (var i = 0; i < childNodes.length; i++) {
            res[i] = childNodes[i];
        }
        return res;
    }
    clearNodes(el /** TODO #9100 */) {
        while (el.childNodes.length > 0) {
            this.remove(el.childNodes[0]);
        }
    }
    appendChild(el /** TODO #9100 */, node /** TODO #9100 */) {
        this.remove(node);
        treeAdapter.appendChild(this.templateAwareRoot(el), node);
    }
    removeChild(el /** TODO #9100 */, node /** TODO #9100 */) {
        if (ListWrapper.contains(el.childNodes, node)) {
            this.remove(node);
        }
    }
    remove(el /** TODO #9100 */) {
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
    }
    insertBefore(el /** TODO #9100 */, node /** TODO #9100 */) {
        this.remove(node);
        treeAdapter.insertBefore(el.parent, node, el);
    }
    insertAllBefore(el /** TODO #9100 */, nodes /** TODO #9100 */) {
        nodes.forEach((n /** TODO #9100 */) => this.insertBefore(el, n));
    }
    insertAfter(el /** TODO #9100 */, node /** TODO #9100 */) {
        if (el.nextSibling) {
            this.insertBefore(el.nextSibling, node);
        }
        else {
            this.appendChild(el.parent, node);
        }
    }
    setInnerHTML(el /** TODO #9100 */, value /** TODO #9100 */) {
        this.clearNodes(el);
        var content = parser.parseFragment(value);
        for (var i = 0; i < content.childNodes.length; i++) {
            treeAdapter.appendChild(el, content.childNodes[i]);
        }
    }
    getText(el /** TODO #9100 */, isRecursive) {
        if (this.isTextNode(el)) {
            return el.data;
        }
        else if (this.isCommentNode(el)) {
            // In the DOM, comments within an element return an empty string for textContent
            // However, comment node instances return the comment content for textContent getter
            return isRecursive ? '' : el.data;
        }
        else if (isBlank(el.childNodes) || el.childNodes.length == 0) {
            return '';
        }
        else {
            var textContent = '';
            for (var i = 0; i < el.childNodes.length; i++) {
                textContent += this.getText(el.childNodes[i], true);
            }
            return textContent;
        }
    }
    setText(el /** TODO #9100 */, value) {
        if (this.isTextNode(el) || this.isCommentNode(el)) {
            el.data = value;
        }
        else {
            this.clearNodes(el);
            if (value !== '')
                treeAdapter.insertText(el, value);
        }
    }
    getValue(el /** TODO #9100 */) { return el.value; }
    setValue(el /** TODO #9100 */, value) { el.value = value; }
    getChecked(el /** TODO #9100 */) { return el.checked; }
    setChecked(el /** TODO #9100 */, value) { el.checked = value; }
    createComment(text) { return treeAdapter.createCommentNode(text); }
    createTemplate(html /** TODO #9100 */) {
        var template = treeAdapter.createElement('template', 'http://www.w3.org/1999/xhtml', []);
        var content = parser.parseFragment(html);
        treeAdapter.appendChild(template, content);
        return template;
    }
    createElement(tagName /** TODO #9100 */) {
        return treeAdapter.createElement(tagName, 'http://www.w3.org/1999/xhtml', []);
    }
    createElementNS(ns /** TODO #9100 */, tagName /** TODO #9100 */) {
        return treeAdapter.createElement(tagName, ns, []);
    }
    createTextNode(text) {
        var t = this.createComment(text);
        t.type = 'text';
        return t;
    }
    createScriptTag(attrName, attrValue) {
        return treeAdapter.createElement('script', 'http://www.w3.org/1999/xhtml', [{ name: attrName, value: attrValue }]);
    }
    createStyleElement(css) {
        var style = this.createElement('style');
        this.setText(style, css);
        return style;
    }
    createShadowRoot(el /** TODO #9100 */) {
        el.shadowRoot = treeAdapter.createDocumentFragment();
        el.shadowRoot.parent = el;
        return el.shadowRoot;
    }
    getShadowRoot(el /** TODO #9100 */) { return el.shadowRoot; }
    getHost(el /** TODO #9100 */) { return el.host; }
    getDistributedNodes(el) { throw _notImplemented('getDistributedNodes'); }
    clone(node) {
        var _recursive = (node /** TODO #9100 */) => {
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
            mapProps.forEach(mapName => {
                if (isPresent(node[mapName])) {
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
    }
    getElementsByClassName(element /** TODO #9100 */, name) {
        return this.querySelectorAll(element, '.' + name);
    }
    getElementsByTagName(element, name) {
        throw _notImplemented('getElementsByTagName');
    }
    classList(element /** TODO #9100 */) {
        var classAttrValue = null;
        var attributes = element.attribs;
        if (attributes && attributes.hasOwnProperty('class')) {
            classAttrValue = attributes['class'];
        }
        return classAttrValue ? classAttrValue.trim().split(/\s+/g) : [];
    }
    addClass(element /** TODO #9100 */, className) {
        var classList = this.classList(element);
        var index = classList.indexOf(className);
        if (index == -1) {
            classList.push(className);
            element.attribs['class'] = element.className = classList.join(' ');
        }
    }
    removeClass(element /** TODO #9100 */, className) {
        var classList = this.classList(element);
        var index = classList.indexOf(className);
        if (index > -1) {
            classList.splice(index, 1);
            element.attribs['class'] = element.className = classList.join(' ');
        }
    }
    hasClass(element /** TODO #9100 */, className) {
        return ListWrapper.contains(this.classList(element), className);
    }
    hasStyle(element /** TODO #9100 */, styleName, styleValue = null) {
        var value = this.getStyle(element, styleName) || '';
        return styleValue ? value == styleValue : value.length > 0;
    }
    /** @internal */
    _readStyleAttribute(element /** TODO #9100 */) {
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
    }
    /** @internal */
    _writeStyleAttribute(element /** TODO #9100 */, styleMap /** TODO #9100 */) {
        var styleAttrValue = '';
        for (var key in styleMap) {
            var newValue = styleMap[key];
            if (newValue && newValue.length > 0) {
                styleAttrValue += key + ':' + styleMap[key] + ';';
            }
        }
        element.attribs['style'] = styleAttrValue;
    }
    setStyle(element /** TODO #9100 */, styleName, styleValue) {
        var styleMap = this._readStyleAttribute(element);
        styleMap[styleName] = styleValue;
        this._writeStyleAttribute(element, styleMap);
    }
    removeStyle(element /** TODO #9100 */, styleName) {
        this.setStyle(element, styleName, null);
    }
    getStyle(element /** TODO #9100 */, styleName) {
        var styleMap = this._readStyleAttribute(element);
        return styleMap.hasOwnProperty(styleName) ? styleMap[styleName] : '';
    }
    tagName(element /** TODO #9100 */) {
        return element.tagName == 'style' ? 'STYLE' : element.tagName;
    }
    attributeMap(element /** TODO #9100 */) {
        var res = new Map();
        var elAttrs = treeAdapter.getAttrList(element);
        for (var i = 0; i < elAttrs.length; i++) {
            var attrib = elAttrs[i];
            res.set(attrib.name, attrib.value);
        }
        return res;
    }
    hasAttribute(element /** TODO #9100 */, attribute) {
        return element.attribs && element.attribs.hasOwnProperty(attribute);
    }
    hasAttributeNS(element /** TODO #9100 */, ns, attribute) {
        throw 'not implemented';
    }
    getAttribute(element /** TODO #9100 */, attribute) {
        return element.attribs && element.attribs.hasOwnProperty(attribute) ?
            element.attribs[attribute] :
            null;
    }
    getAttributeNS(element /** TODO #9100 */, ns, attribute) {
        throw 'not implemented';
    }
    setAttribute(element /** TODO #9100 */, attribute, value) {
        if (attribute) {
            element.attribs[attribute] = value;
            if (attribute === 'class') {
                element.className = value;
            }
        }
    }
    setAttributeNS(element /** TODO #9100 */, ns, attribute, value) {
        throw 'not implemented';
    }
    removeAttribute(element /** TODO #9100 */, attribute) {
        if (attribute) {
            StringMapWrapper.delete(element.attribs, attribute);
        }
    }
    removeAttributeNS(element /** TODO #9100 */, ns, name) {
        throw 'not implemented';
    }
    templateAwareRoot(el /** TODO #9100 */) {
        return this.isTemplateElement(el) ? this.content(el) : el;
    }
    createHtmlDocument() {
        var newDoc = treeAdapter.createDocument();
        newDoc.title = 'fake title';
        var head = treeAdapter.createElement('head', null, []);
        var body = treeAdapter.createElement('body', 'http://www.w3.org/1999/xhtml', []);
        this.appendChild(newDoc, head);
        this.appendChild(newDoc, body);
        StringMapWrapper.set(newDoc, 'head', head);
        StringMapWrapper.set(newDoc, 'body', body);
        StringMapWrapper.set(newDoc, '_window', StringMapWrapper.create());
        return newDoc;
    }
    defaultDoc() {
        if (defDoc === null) {
            defDoc = this.createHtmlDocument();
        }
        return defDoc;
    }
    getBoundingClientRect(el /** TODO #9100 */) {
        return { left: 0, top: 0, width: 0, height: 0 };
    }
    getTitle() { return this.defaultDoc().title || ''; }
    setTitle(newTitle) { this.defaultDoc().title = newTitle; }
    isTemplateElement(el) {
        return this.isElementNode(el) && this.tagName(el) === 'template';
    }
    isTextNode(node /** TODO #9100 */) { return treeAdapter.isTextNode(node); }
    isCommentNode(node /** TODO #9100 */) { return treeAdapter.isCommentNode(node); }
    isElementNode(node /** TODO #9100 */) {
        return node ? treeAdapter.isElementNode(node) : false;
    }
    hasShadowRoot(node /** TODO #9100 */) { return isPresent(node.shadowRoot); }
    isShadowRoot(node /** TODO #9100 */) { return this.getShadowRoot(node) == node; }
    importIntoDoc(node /** TODO #9100 */) { return this.clone(node); }
    adoptNode(node /** TODO #9100 */) { return node; }
    getHref(el /** TODO #9100 */) { return el.href; }
    resolveAndSetHref(el /** TODO #9100 */, baseUrl, href) {
        if (href == null) {
            el.href = baseUrl;
        }
        else {
            el.href = baseUrl + '/../' + href;
        }
    }
    /** @internal */
    _buildRules(parsedRules /** TODO #9100 */, css /** TODO #9100 */) {
        var rules = [];
        for (var i = 0; i < parsedRules.length; i++) {
            var parsedRule = parsedRules[i];
            var rule = StringMapWrapper.create();
            StringMapWrapper.set(rule, 'cssText', css);
            StringMapWrapper.set(rule, 'style', { content: '', cssText: '' });
            if (parsedRule.type == 'rule') {
                StringMapWrapper.set(rule, 'type', 1);
                StringMapWrapper.set(rule, 'selectorText', parsedRule.selectors.join(', ')
                    .replace(/\s{2,}/g, ' ')
                    .replace(/\s*~\s*/g, ' ~ ')
                    .replace(/\s*\+\s*/g, ' + ')
                    .replace(/\s*>\s*/g, ' > ')
                    .replace(/\[(\w+)=(\w+)\]/g, '[$1="$2"]'));
                if (isBlank(parsedRule.declarations)) {
                    continue;
                }
                for (var j = 0; j < parsedRule.declarations.length; j++) {
                    var declaration = parsedRule.declarations[j];
                    StringMapWrapper.set(StringMapWrapper.get(rule, 'style'), declaration.property, declaration.value);
                    StringMapWrapper.get(rule, 'style').cssText +=
                        declaration.property + ': ' + declaration.value + ';';
                }
            }
            else if (parsedRule.type == 'media') {
                StringMapWrapper.set(rule, 'type', 4);
                StringMapWrapper.set(rule, 'media', { mediaText: parsedRule.media });
                if (parsedRule.rules) {
                    StringMapWrapper.set(rule, 'cssRules', this._buildRules(parsedRule.rules));
                }
            }
            rules.push(rule);
        }
        return rules;
    }
    supportsDOMEvents() { return false; }
    supportsNativeShadowDOM() { return false; }
    getGlobalEventTarget(target) {
        if (target == 'window') {
            return this.defaultDoc()._window;
        }
        else if (target == 'document') {
            return this.defaultDoc();
        }
        else if (target == 'body') {
            return this.defaultDoc().body;
        }
    }
    getBaseHref() { throw 'not implemented'; }
    resetBaseElement() { throw 'not implemented'; }
    getHistory() { throw 'not implemented'; }
    getLocation() { throw 'not implemented'; }
    getUserAgent() { return 'Fake user agent'; }
    getData(el /** TODO #9100 */, name) {
        return this.getAttribute(el, 'data-' + name);
    }
    getComputedStyle(el /** TODO #9100 */) { throw 'not implemented'; }
    setData(el /** TODO #9100 */, name, value) {
        this.setAttribute(el, 'data-' + name, value);
    }
    // TODO(tbosch): move this into a separate environment class once we have it
    setGlobalVar(path, value) { setValueOnPath(global, path, value); }
    requestAnimationFrame(callback /** TODO #9100 */) { return setTimeout(callback, 0); }
    cancelAnimationFrame(id) { clearTimeout(id); }
    supportsWebAnimation() { return false; }
    performanceNow() { return DateWrapper.toMillis(DateWrapper.now()); }
    getAnimationPrefix() { return ''; }
    getTransitionEnd() { return 'transitionend'; }
    supportsAnimation() { return true; }
    replaceChild(el /** TODO #9100 */, newNode /** TODO #9100 */, oldNode /** TODO #9100 */) {
        throw new Error('not implemented');
    }
    parse(templateHtml) { throw new Error('not implemented'); }
    invoke(el, methodName, args) { throw new Error('not implemented'); }
    getEventKey(event /** TODO #9100 */) { throw new Error('not implemented'); }
    supportsCookies() { return false; }
    getCookie(name) { throw new Error('not implemented'); }
    setCookie(name, value) { throw new Error('not implemented'); }
    animate(element, keyframes, options) { throw new Error('not implemented'); }
}
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