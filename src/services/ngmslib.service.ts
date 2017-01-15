import {Injectable} from "@angular/core";

import {List, Map} from 'immutable';
import * as ss from 'string';
import * as _ from 'lodash';
import * as moment_ from "moment";
import * as Immutable from "immutable";
import {Component} from "@angular/core";
import {Observable} from "rxjs";
export const moment = moment_["default"];

@Injectable()
export class NgmslibService {
    constructor() {
        console.log('NgmslibService constructed');
    }

    public inDevMode(): boolean {
        if (window.location.href.indexOf('localhost') > -1) {
            return true;
        } else {
            return false;
        }
    }

    /**
     *
     * @param dateString format of date + time: /Date(1469923200000+0000)/"
     * @returns {any}
     * @constructor
     */
    processDateField(dateString: string, addDay: boolean = false): any {
        if (_.isUndefined(dateString))
            return '';
        var epoc = dateString.match(/Date\((.*)\)/)
        if (epoc[1]) {
            var date = epoc[1].split('+')[0]
            var time = epoc[1].split('+')[1]
            var result;
            //todo: adding +1 on save to server hack, need to ask Alon
            if (addDay) {
                result = moment(Number(date)).add(1, 'day');
            } else {
                result = moment(Number(date));
            }
            return moment(result).format('YYYY-MM-DD');
            /** moment examples
             var a = moment().unix().format()
             console.log(moment.now());
             console.log(moment().format('dddd'));
             console.log(moment().startOf('day').fromNow());
             **/
        }
    }

    /**
     *
     * @param dateString format of date + time: /Date(1469923200000+0000)/"
     * @returns {any}
     * @constructor
     */
    processDateFieldToUnix(dateString: string, addDay: boolean = false): any {
        if (_.isUndefined(dateString))
            return '';
        //todo: adding +1 on save to server hack, need to ask Alon
        if (addDay) {
            return moment(dateString, 'YYYY-MM-DD').add(1, 'day').valueOf();
        } else {
            return moment(dateString, 'YYYY-MM-DD').valueOf();
        }
    }

    cleanCharForXml(value: any): any {
        var clean = function (value: string) {
            if (_.isUndefined(value))
                return '';
            if (_.isNull(value))
                return '';
            if (_.isNumber(value))
                return value;
            if (_.isBoolean(value))
                return value;
            value = value.replace(/\}/g, ' ');
            value = value.replace(/%/g, ' ');
            value = value.replace(/{/g, ' ');
            value = value.replace(/"/g, '`');
            value = value.replace(/'/g, '`');
            value = value.replace(/&/g, 'and');
            value = value.replace(/>/g, ' ');
            value = value.replace(/</g, ' ');
            value = value.replace(/\[/g, ' ');
            value = value.replace(/]/g, ' ');
            value = value.replace(/#/g, ' ');
            value = value.replace(/\$/g, ' ');
            value = value.replace(/\^/g, ' ');
            value = value.replace(/;/g, ' ');
            return value
        }
        if (_.isUndefined(value))
            return '';
        if (_.isNull(value))
            return '';
        if (_.isNumber(value))
            return value;
        if (_.isBoolean(value))
            return value;
        if (_.isString(value))
            return clean(value);
        _.forEach(value, (v, k) => {
            // currently we don't support / clean arrays
            if (_.isArray(value[k]))
                return value[k] = v;
            value[k] = clean(v);
        });
        return value;
    }

    unionList(a: List<any>, b: List<any>) {
        return a.toSet().union(b.toSet()).toList();
    }

    processHourStartEnd(value: string, key: string): any {
        if (_.isUndefined(!value))
            return '';
        if (key == 'hourStart')
            return `${value}:00`;
        return `${value}:59`;
    }

    staggered(list: List<any>, delay: number): Observable<any> {
        return Observable.zip(
            Observable.from(<any>list),
            Observable.interval(delay),
            (x, y) => {
                return x;
            })
            .scan((acc: any, x) => acc.concat(x), [])
    }

    /**
     * CheckFoundIndex will check if a return value is -1 and error out if in dev mode (list.findIndex or indexOf for example)
     * @param i_value
     * @param i_message
     * @returns {number}
     * @constructor
     */
    checkFoundIndex(i_value: number, i_message: string = 'CheckFoundIndex did not find index'): number {
        if (i_value === -1) {
            console.log(i_message);
            if (this.inDevMode()) {
                alert(i_message);
                throw Error(i_message);
            }
        }
        return i_value;
    }

    getCompSelector(i_constructor) {
        if (!this.inDevMode())
            return;
        var annotations = Reflect.getMetadata('annotations', i_constructor);
        var componentMetadata = annotations.find(annotation => {
            return (annotation instanceof Component);
        });
        return componentMetadata.selector;
    }

    bootboxHide(i_time = 1500) {
        setTimeout(() => {
            bootbox.hideAll();
        }, i_time)
    }

    dateToAbsolute(year, month) {
        return year * 12 + month;
    }

    dateFromAbsolute(value: number) {
        var year = Math.floor(value / 12);
        var month = value % 12 + 1;
        return {
            year,
            month
        }
    }

    mapOfIndex(map: Map<string,any>, index: number, position: "first" | "last"): string {
        var mapJs = map.toJS();
        var mapJsPairs = _.toPairs(mapJs);
        var offset = position == 'first' ? 0 : 1;
        if (mapJsPairs[index] == undefined)
            return "0"
        return mapJsPairs[index][offset];
    }

    /**
     *  PrivilegesXmlTemplate will generate a template for priveleges in 2 possible modes
     *
     *  mode 1: just a raw template (we will ignore the values set) and this is the mode when
     *  no selPrivName and appStore params are given
     *
     *  mode 2: is when we actually serialize data to save to server and in this mode we do pass
     *  in the selPrivName and appStore which we use to retrieve current values from user appStore
     *  and generate the final XML to save to server
     *
     * @param selPrivName
     * @param appStore
     * @param callBack
     * @constructor
     */

    base64() {

        var _PADCHAR = "=", _ALPHA = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/", _VERSION = "1.0";


        function _getbyte64(s, i) {
            // This is oddly fast, except on Chrome/V8.
            // Minimal or no improvement in performance by using a
            // object with properties mapping chars to value (eg. 'A': 0)

            var idx = _ALPHA.indexOf(s.charAt(i));

            if (idx === -1) {
                throw "Cannot decode base64";
            }

            return idx;
        }


        function _decode(s) {
            var pads = 0, i, b10, imax = s.length, x = [];

            s = String(s);

            if (imax === 0) {
                return s;
            }

            if (imax % 4 !== 0) {
                throw "Cannot decode base64";
            }

            if (s.charAt(imax - 1) === _PADCHAR) {
                pads = 1;

                if (s.charAt(imax - 2) === _PADCHAR) {
                    pads = 2;
                }

                // either way, we want to ignore this last block
                imax -= 4;
            }

            for (i = 0; i < imax; i += 4) {
                b10 = ( _getbyte64(s, i) << 18 ) | ( _getbyte64(s, i + 1) << 12 ) | ( _getbyte64(s, i + 2) << 6 ) | _getbyte64(s, i + 3);
                x.push(String.fromCharCode(b10 >> 16, ( b10 >> 8 ) & 0xff, b10 & 0xff));
            }

            switch (pads) {
                case 1:
                    b10 = ( _getbyte64(s, i) << 18 ) | ( _getbyte64(s, i + 1) << 12 ) | ( _getbyte64(s, i + 2) << 6 );
                    x.push(String.fromCharCode(b10 >> 16, ( b10 >> 8 ) & 0xff));
                    break;

                case 2:
                    b10 = ( _getbyte64(s, i) << 18) | ( _getbyte64(s, i + 1) << 12 );
                    x.push(String.fromCharCode(b10 >> 16));
                    break;
            }

            return x.join("");
        }


        function _getbyte(s, i) {
            var x = s.charCodeAt(i);

            if (x > 255) {
                throw "INVALID_CHARACTER_ERR: DOM Exception 5";
            }

            return x;
        }


        function _encode(s) {
            if (arguments.length !== 1) {
                throw "SyntaxError: exactly one argument required";
            }

            s = String(s);

            var i, b10, x = [], imax = s.length - s.length % 3;

            if (s.length === 0) {
                return s;
            }

            for (i = 0; i < imax; i += 3) {
                b10 = ( _getbyte(s, i) << 16 ) | ( _getbyte(s, i + 1) << 8 ) | _getbyte(s, i + 2);
                x.push(_ALPHA.charAt(b10 >> 18));
                x.push(_ALPHA.charAt(( b10 >> 12 ) & 0x3F));
                x.push(_ALPHA.charAt(( b10 >> 6 ) & 0x3f));
                x.push(_ALPHA.charAt(b10 & 0x3f));
            }

            switch (s.length - imax) {
                case 1:
                    b10 = _getbyte(s, i) << 16;
                    x.push(_ALPHA.charAt(b10 >> 18) + _ALPHA.charAt(( b10 >> 12 ) & 0x3F) + _PADCHAR + _PADCHAR);
                    break;

                case 2:
                    b10 = ( _getbyte(s, i) << 16 ) | ( _getbyte(s, i + 1) << 8 );
                    x.push(_ALPHA.charAt(b10 >> 18) + _ALPHA.charAt(( b10 >> 12 ) & 0x3F) + _ALPHA.charAt(( b10 >> 6 ) & 0x3f) + _PADCHAR);
                    break;
            }

            return x.join("");
        }


        return {
            decode: _decode,
            encode: _encode,
            VERSION: _VERSION
        };
    }


    constructImmutableFromTable(path): Array<any> {
        var arr = [];
        path.forEach((member) => {
            var obj = {};
            obj[member._attr.name] = {
                table: {}
            }
            for (var k in member._attr) {
                var value = member._attr[k]
                obj[member._attr.name][k] = value;
                for (var t in member.Tables["0"]._attr) {
                    var value = member.Tables["0"]._attr[t]
                    obj[member._attr.name]['table'][t] = value;
                }
            }
            arr.push(Immutable.fromJS(obj));
        });
        return arr;
    }

    computeMask(accessMask): number {
        var bits = [1, 2, 4, 8, 16, 32, 64, 128];
        var computedAccessMask = 0;
        accessMask.forEach(value => {
            var bit = bits.shift();
            if (value) computedAccessMask = computedAccessMask + bit;

        })
        return computedAccessMask;
    }

    getAccessMask(accessMask): List<any> {
        var checks = List();
        var bits = [1, 2, 4, 8, 16, 32, 64, 128];
        for (var i = 0; i < bits.length; i++) {
            let checked = (bits[i] & accessMask) > 0 ? true : false;
            checks = checks.push(checked)
        }
        return checks;
    }

    getADaysMask(accessMask): List<any> {
        var checks = List();
        var bits = [1, 2, 4, 8, 16, 32, 64];
        for (var i = 0; i < bits.length; i++) {
            let checked = (bits[i] & accessMask) > 0 ? true : false;
            checks = checks.push(checked)
        }
        return checks;
    }

    log(msg) {
        console.log(new Date().toTimeString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, "$1") + ': ' + msg);
    }

    guid(): string {
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1);
        }

        return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
    }




    xml2Json() {
        //https://github.com/metatribal/xmlToJSON
        var xmlToJSON = (function () {

            this.version = "1.3";

            var options = { // set up the default options
                mergeCDATA: true, // extract cdata and merge with text
                grokAttr: true, // convert truthy attributes to boolean, etc
                grokText: true, // convert truthy text/attr to boolean, etc
                normalize: true, // collapse multiple spaces to single space
                xmlns: true, // include namespaces as attribute in output
                namespaceKey: '_ns', // tag name for namespace objects
                textKey: '_text', // tag name for text nodes
                valueKey: '_value', // tag name for attribute values
                attrKey: '_attr', // tag for attr groups
                cdataKey: '_cdata', // tag for cdata nodes (ignored if mergeCDATA is true)
                attrsAsObject: true, // if false, key is used as prefix to name, set prefix to '' to merge children and attrs.
                stripAttrPrefix: true, // remove namespace prefixes from attributes
                stripElemPrefix: true, // for elements of same name in diff namespaces, you can enable namespaces and access the nskey property
                childrenAsArray: true // force children into arrays
            };

            var prefixMatch: any = new RegExp('(?!xmlns)^.*:/');
            var trimMatch: any = new RegExp('^\s+|\s+$g');

            this.grokType = function (sValue) {
                if (/^\s*$/.test(sValue)) {
                    return null;
                }
                if (/^(?:true|false)$/i.test(sValue)) {
                    return sValue.toLowerCase() === "true";
                }
                if (isFinite(sValue)) {
                    return parseFloat(sValue);
                }
                return sValue;
            };

            this.parseString = function (xmlString, opt) {
                return this.parseXML(this.stringToXML(xmlString), opt);
            }

            this.parseXML = function (oXMLParent, opt) {

                // initialize options
                for (var key in opt) {
                    options[key] = opt[key];
                }

                var vResult = {}, nLength = 0, sCollectedTxt = "";

                // parse namespace information
                if (options.xmlns && oXMLParent.namespaceURI) {
                    vResult[options.namespaceKey] = oXMLParent.namespaceURI;
                }

                // parse attributes
                // using attributes property instead of hasAttributes method to support older browsers
                if (oXMLParent.attributes && oXMLParent.attributes.length > 0) {
                    var vAttribs = {};

                    for (nLength; nLength < oXMLParent.attributes.length; nLength++) {
                        var oAttrib = oXMLParent.attributes.item(nLength);
                        vContent = {};
                        var attribName = '';

                        if (options.stripAttrPrefix) {
                            attribName = oAttrib.name.replace(prefixMatch, '');

                        } else {
                            attribName = oAttrib.name;
                        }

                        if (options.grokAttr) {
                            vContent[options.valueKey] = this.grokType(oAttrib.value.replace(trimMatch, ''));
                        } else {
                            vContent[options.valueKey] = oAttrib.value.replace(trimMatch, '');
                        }

                        if (options.xmlns && oAttrib.namespaceURI) {
                            vContent[options.namespaceKey] = oAttrib.namespaceURI;
                        }

                        if (options.attrsAsObject) { // attributes with same local name must enable prefixes
                            vAttribs[attribName] = vContent;
                        } else {
                            vResult[options.attrKey + attribName] = vContent;
                        }
                    }

                    if (options.attrsAsObject) {
                        vResult[options.attrKey] = vAttribs;
                    } else {
                    }
                }

                // iterate over the children
                if (oXMLParent.hasChildNodes()) {
                    for (var oNode, sProp, vContent, nItem = 0; nItem < oXMLParent.childNodes.length; nItem++) {
                        oNode = oXMLParent.childNodes.item(nItem);

                        if (oNode.nodeType === 4) {
                            if (options.mergeCDATA) {
                                sCollectedTxt += oNode.nodeValue;
                            } else {
                                if (vResult.hasOwnProperty(options.cdataKey)) {
                                    if (vResult[options.cdataKey].constructor !== Array) {
                                        vResult[options.cdataKey] = [vResult[options.cdataKey]];
                                    }
                                    vResult[options.cdataKey].push(oNode.nodeValue);

                                } else {
                                    if (options.childrenAsArray) {
                                        vResult[options.cdataKey] = [];
                                        vResult[options.cdataKey].push(oNode.nodeValue);
                                    } else {
                                        vResult[options.cdataKey] = oNode.nodeValue;
                                    }
                                }
                            }
                        } /* nodeType is "CDATASection" (4) */ else if (oNode.nodeType === 3) {
                            sCollectedTxt += oNode.nodeValue;
                        } /* nodeType is "Text" (3) */ else if (oNode.nodeType === 1) { /* nodeType is "Element" (1) */

                            if (nLength === 0) {
                                vResult = {};
                            }

                            // using nodeName to support browser (IE) implementation with no 'localName' property
                            if (options.stripElemPrefix) {
                                sProp = oNode.nodeName.replace(prefixMatch, '');
                            } else {
                                sProp = oNode.nodeName;
                            }

                            vContent = xmlToJSON.parseXML(oNode);

                            if (vResult.hasOwnProperty(sProp)) {
                                if (vResult[sProp].constructor !== Array) {
                                    vResult[sProp] = [vResult[sProp]];
                                }
                                vResult[sProp].push(vContent);

                            } else {
                                if (options.childrenAsArray) {
                                    vResult[sProp] = [];
                                    vResult[sProp].push(vContent);
                                } else {
                                    vResult[sProp] = vContent;
                                }
                                nLength++;
                            }
                        }
                    }
                } else if (!sCollectedTxt) { // no children and no text, return null
                    if (options.childrenAsArray) {
                        vResult[options.textKey] = [];
                        vResult[options.textKey].push(null);
                    } else {
                        vResult[options.textKey] = null;
                    }
                }

                if (sCollectedTxt) {
                    if (options.grokText) {
                        var value = this.grokType(sCollectedTxt.replace(trimMatch, ''));
                        if (value !== null && value !== undefined) {
                            vResult[options.textKey] = value;
                        }
                    } else if (options.normalize) {
                        vResult[options.textKey] = sCollectedTxt.replace(trimMatch, '').replace(/\s+/g, " ");
                    } else {
                        vResult[options.textKey] = sCollectedTxt.replace(trimMatch, '');
                    }
                }

                return vResult;
            }


            // Convert xmlDocument to a string
            // Returns null on failure
            this.xmlToString = function (xmlDoc) {
                try {
                    var xmlString = xmlDoc.xml ? xmlDoc.xml : (new XMLSerializer()).serializeToString(xmlDoc);
                    return xmlString;
                } catch (err) {
                    return null;
                }
            }

            // Convert a string to XML Node Structure
            // Returns null on failure
            this.stringToXML = function (xmlString) {
                try {
                    var xmlDoc = null;

                    if (window['DOMParser']) {

                        var parser = new DOMParser();
                        xmlDoc = parser.parseFromString(xmlString, "text/xml");

                        return xmlDoc;
                    } else {
                        xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
                        xmlDoc.async = false;
                        xmlDoc.loadXML(xmlString);

                        return xmlDoc;
                    }
                } catch (e) {
                    return null;
                }
            }

            return this;
        }).call({});
        return xmlToJSON;
    }
}
