/**
 * xmlHttpRequest API wrapper for GM_xmlhttpRequest
 *
 * This module allows you to provide a drop-in replacement for xmlHttpRequest
 * using instead, the Greasemonkey (or Tampermonkey) privileged GM_xmlhttpRequest
 * function, which is available under the Greasemonkey or Tampermonkey Web
 * Extensions for Firefox and Chromium-based browsers.
 *
 * Can be used to allow jQuery to perform ajax calls using GM_xmlhttpRequest
 *
 * e.g.
 *
 * $.ajax({
 *   url: '/p/',
 *   xhr: function(){return new gmxhr();},
 *   type: 'POST',
 *   success: function(val){
 *      ....
 *   }
 * });
 *
 *  Contributions:
 *  (c) 2016,2017 Damien Clark (https://gist.github.com/damoclark/f01b957797b7dd2c33d6)
 *  (c) 2011 Martin Monperrus (https://gist.github.com/monperrus/999065)
 *
 *  Original version:
 *  (c) 2010 Ryan Greenberg (http://ryangreenberg.com/archives/2010/03/greasemonkey_jquery.php)
 *
 * Licence: GPL-3.0+
 * This program is free software: you can redistribute it and/or modify it under
 * the terms of the GNU General Public License as published by the Free Software
 * Foundation, version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
 * PARTICULAR PURPOSE. See the GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License along with
 * this program. If not, see <http://www.gnu.org/licenses/>.
 */

/**
 * xmlHttpRequest API wrapper for GM_xmlhttpRequest
 *
 * @returns {gmxhr} An instance with a compatible API to xmlHttpRequest
 */
function gmxhr() {
  this.type = null;
  this.url = null;
  this.async = null;
  this.username = null;
  this.password = null;
  this.status = null;
  this.headers = {};
  this.readyState = null;
}

gmxhr.prototype.abort = function () {
  this.readyState = 0;
};

gmxhr.prototype.getAllResponseHeaders = function () {
  if (this.readyState != 4) return '';
  return this.responseHeaders;
};

gmxhr.prototype.getResponseHeader = function (header) {
  var value = null;
  if (this.responseHeaders) {
    var regex = new RegExp('^' + header + ': (.*)$', 'igm');
    var match = regex.exec(this.responseHeaders);
    var result = [];
    while (match != null) {
      result.push(match[1]);
      match = regex.exec(this.responseHeaders);
    }
    if (result.length > 0) {
      value = result.join(', ');
    }
  }
  return value;
};

gmxhr.prototype.open = function (type, url, async, username, password) {
  this.type = type ? type : null;
  this.url = url ? url : null;
  this.async = async ? async : null;
  this.username = username ? username : null;
  this.password = password ? password : null;
  this.readyState = 1;
};

gmxhr.prototype.setRequestHeader = function (name, value) {
  this.headers[name] = value;
};

gmxhr.prototype.send = function (data) {
  this.data = data;
  var that = this;
  // Detect if using older GM API (or other userscript engines)
  var agent =
    typeof GM_xmlhttpRequest === 'undefined'
      ? GM.xmlHttpRequest
      : GM_xmlhttpRequest;
  // https://wiki.greasespot.net/GM.xmlHttpRequest
  agent({
    method: this.type,
    url: this.url,
    headers: this.headers,
    data: this.data,
    onload: function (rsp) {
      // Populate wrapper object with returned data
      // including the Greasemonkey specific "responseHeaders"
      var responseKeys = [
        'readyState',
        'responseHeaders',
        'finalUrl',
        'status',
        'statusText',
        'response',
        'responseText',
      ];
      for (var k in responseKeys) {
        if (responseKeys[k] in rsp)
          that[responseKeys[k]] = rsp[responseKeys[k]];
      }
      // now we call onreadystatechange
      that.onreadystatechange();
    },
    onerror: function (rsp) {
      var responseKeys = [
        'readyState',
        'responseHeaders',
        'finalUrl',
        'status',
        'statusText',
        'response',
        'responseText',
      ];
      for (var k in responseKeys) {
        if (responseKeys[k] in rsp)
          that[responseKeys[k]] = rsp[responseKeys[k]];
      }
      // now we call onreadystatechange
      that.onreadystatechange();
    },
  });
};

export default gmxhr;
