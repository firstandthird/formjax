var Formjax = (function () {
'use strict';

function findParent(elem) {
  if (elem.parentNode) {
    if (elem.parentNode.dataset.module) {
      return elem.parentNode;
    }

    return findParent(elem.parentNode);
  }

  return elem;
}

/* global window */

var attrObj = function (key, el) {
  var values = {};

  Object.keys(el.dataset).forEach(function (data) {
    if (data.match(new RegExp('^' + key)) && data !== key) {
      var optionName = data.replace(key, '');
      var isGlobal = false;

      if (optionName.match(/^Global/)) {
        optionName = optionName.replace('Global', '');
        isGlobal = true;
      }

      optionName = '' + optionName[0].toLowerCase() + optionName.slice(1);

      if (isGlobal) {
        values[optionName] = window[el.dataset[data]];
      } else {
        values[optionName] = el.dataset[data];
      }
    }
  });

  return values;
};

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
  return typeof obj;
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
};











var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

var createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();









var inherits = function (subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
};











var possibleConstructorReturn = function (self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return call && (typeof call === "object" || typeof call === "function") ? call : self;
};

var aug = function aug() {
  var args = Array.prototype.slice.call(arguments); //eslint-disable-line prefer-rest-params
  var org = args.shift();
  var type = '';
  if (typeof org === 'string' || typeof org === 'boolean') {
    type = org === true ? 'deep' : org;
    org = args.shift();
    if (type === 'defaults') {
      org = aug({}, org); //clone defaults into new object
      type = 'strict';
    }
  }
  args.forEach(function (prop) {
    for (var propName in prop) {
      //eslint-disable-line
      var propValue = prop[propName];
      // just overwrite arrays:
      if (Array.isArray(propValue)) {
        org[propName] = propValue;
        continue;
      }
      if (type === 'deep' && (typeof propValue === 'undefined' ? 'undefined' : _typeof(propValue)) === 'object' && typeof org[propName] !== 'undefined') {
        if (_typeof(org[propName]) !== 'object') {
          org[propName] = propValue;
          continue;
        }
        aug(type, org[propName], propValue);
      } else if (type !== 'strict' || type === 'strict' && typeof org[propName] !== 'undefined') {
        org[propName] = propValue;
      }
    }
  });
  return org;
};
var index = aug;

function findOne(selector, el) {
  var found = find(selector, el);

  if (found.length) {
    return found[0];
  }

  return null;
}

function isWindow(obj) {
  return obj != null && obj === obj.window;
}

function find(selector) {
  var context = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

  if (selector instanceof HTMLElement || isWindow(selector)) {
    return [selector];
  } else if (selector instanceof NodeList) {
    return [].slice.call(selector);
  } else if (typeof selector === 'string') {
    var startElement = context ? findOne(context) : document;
    return [].slice.call(startElement.querySelectorAll(selector));
  }
  return [];
}

function on(selector, event, cb) {
  var capture = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;

  if (Array.isArray(selector)) {
    selector.forEach(function (item) {
      return on(item, event, cb, capture);
    });
    return;
  }

  var data = {
    cb: cb,
    capture: capture
  };

  if (!window._domassistevents) {
    window._domassistevents = {};
  }

  window._domassistevents['_' + event] = data;
  var el = find(selector);
  if (el.length) {
    el.forEach(function (item) {
      item.addEventListener(event, cb, capture);
    });
  }
}

var SCROLLABLE_CONTAINER = getScrollableContainer();

function getScrollableContainer() {
  if (SCROLLABLE_CONTAINER) {
    return SCROLLABLE_CONTAINER;
  }

  var documentElement = window.document.documentElement;
  var scrollableContainer = void 0;

  documentElement.scrollTop = 1;

  if (documentElement.scrollTop === 1) {
    documentElement.scrollTop = 0;
    scrollableContainer = documentElement;
  } else {
    scrollableContainer = document.body;
  }

  SCROLLABLE_CONTAINER = scrollableContainer;

  return scrollableContainer;
}

/* eslint no-new:0 */

var ACTION_SELECTOR = '[data-action]';
var DOMAssist = { find: find, findOne: findOne, on: on };

var Domodule = function () {
  function Domodule(el) {
    classCallCheck(this, Domodule);

    this.log('begin setup');
    this.el = el;
    this.els = {};
    this.options = index({}, this.defaults, attrObj('module', this.el));
    this.moduleName = this.el.dataset.module;
    this.setUps = {
      actions: [],
      named: [],
      options: []
    };
    this.boundActionRouter = this.actionRouter.bind(this);

    this.preInit();
    this.storeRef();
    this.setupActions();
    this.setupNamed();
    this.verifyRequired();
    this.postInit();
    this.log('initalized');

    return this;
  }

  createClass(Domodule, [{
    key: 'preInit',
    value: function preInit() {}
  }, {
    key: 'postInit',
    value: function postInit() {}
  }, {
    key: 'verifyRequired',
    value: function verifyRequired() {
      var _this = this;

      if (this.required === {}) {
        return this;
      }

      if (typeof this.required.options !== 'undefined') {
        this.setUps.options = Object.keys(this.options);
      }

      Object.keys(this.required).forEach(function (required) {
        _this.required[required].forEach(function (value) {
          if (_this.setUps[required].indexOf(value) < 0) {
            throw new Error(value + ' is required as ' + required + ' for ' + _this.moduleName + ', but is missing!');
          }
        });
      });

      return this;
    }
  }, {
    key: 'setupActions',
    value: function setupActions() {
      var _this2 = this;

      this.setupAction(this.el);

      this.find(ACTION_SELECTOR).forEach(function (action) {
        var parent = findParent(action);

        if (parent === _this2.el) {
          _this2.setupAction(action);
        }
      });
    }
  }, {
    key: 'setupAction',
    value: function setupAction(actionEl) {
      if (actionEl.dataset.domoduleActionProcessed) {
        return;
      }

      var _Domodule$parseAction = Domodule.parseAction(actionEl),
          actionName = _Domodule$parseAction.name,
          actionType = _Domodule$parseAction.type;

      if (!actionName) {
        return;
      } else if (typeof this[actionName] !== 'function') {
        this.log(actionName + ' was registered, but there is no function set up');
        return;
      }

      this.log(actionName + ' bound');
      this.storeSetUp(actionName, 'actions');

      DOMAssist.on(actionEl, actionType, this.boundActionRouter);

      actionEl.dataset.domoduleActionProcessed = true;
    }
  }, {
    key: 'actionRouter',
    value: function actionRouter(event) {
      var actionEl = event.currentTarget;

      var _Domodule$parseAction2 = Domodule.parseAction(actionEl),
          actionName = _Domodule$parseAction2.name;

      var actionData = attrObj('action', actionEl);

      this[actionName].call(this, actionEl, event, actionData);
    }
  }, {
    key: 'setupNamed',
    value: function setupNamed() {
      var _this3 = this;

      this.find('[data-name]').forEach(function (named) {
        var parent = findParent(named);

        if (parent !== _this3.el) {
          return;
        }

        if (!named.dataset.domoduleNameProcessed) {
          _this3.els[named.dataset.name] = named;

          _this3.storeSetUp(named.dataset.name, 'named');
          named.dataset.domoduleNameProcessed = true;
          named.dataset.domoduleOwner = _this3.id;
        }
      });
    }
  }, {
    key: 'storeRef',
    value: function storeRef() {
      if (typeof Domodule.refs === 'undefined') {
        Domodule.refs = {};
      }

      if (typeof Domodule.refs[this.el.dataset.moduleUid] !== 'undefined') {
        return false;
      }

      this.id = this.uuid;
      this.el.dataset.moduleUid = this.id;
      Domodule.refs[this.el.dataset.moduleUid] = this;
    }
  }, {
    key: 'find',
    value: function find$$1(selector) {
      return DOMAssist.find(selector, this.el);
    }
  }, {
    key: 'findOne',
    value: function findOne$$1(selector) {
      return DOMAssist.findOne(selector, this.el);
    }
  }, {
    key: 'findByName',
    value: function findByName(name) {
      return this.els[name];
    }
  }, {
    key: 'getOption',
    value: function getOption(option) {
      return this.options[option];
    }
  }, {
    key: 'storeSetUp',
    value: function storeSetUp(name, dict) {
      if (this.setUps[dict].indexOf(name) < 0) {
        this.setUps[dict].push(name);
      }
    }
  }, {
    key: 'destroy',
    value: function destroy() {
      var _this4 = this;

      DOMAssist.find(ACTION_SELECTOR, this.el.parentNode).forEach(function (el) {
        if (el.dataset.domoduleActionProcessed) {
          var _Domodule$parseAction3 = Domodule.parseAction(el),
              actionType = _Domodule$parseAction3.type;

          el.removeEventListener(actionType, _this4.boundActionRouter);
          el.dataset.domoduleActionProcessed = false;
        }
      });
    }

    // static methods can't access `this` so they go last

  }, {
    key: 'log',


    //used inside instance
    value: function log(msg) {
      Domodule.log(this.constructor.name + ': ' + msg);
    }
  }, {
    key: 'required',
    get: function get$$1() {
      return {};
    }
  }, {
    key: 'defaults',
    get: function get$$1() {
      return {};
    }
  }, {
    key: 'uuid',
    get: function get$$1() {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0;
        var v = c === 'x' ? r : r & 0x3 | 0x8;
        return v.toString(16);
      });
    }
  }], [{
    key: 'parseAction',
    value: function parseAction(el) {
      var _el$dataset = el.dataset,
          name = _el$dataset.action,
          _el$dataset$actionTyp = _el$dataset.actionType,
          type = _el$dataset$actionTyp === undefined ? 'click' : _el$dataset$actionTyp;

      return { name: name, type: type };
    }
  }, {
    key: 'getInstance',
    value: function getInstance(element) {
      if (element instanceof Node) {
        return Domodule.refs[element.dataset.moduleUid];
      }

      throw new Error('getInstance expects a dom node');
    }
  }, {
    key: 'register',
    value: function register(name, cls) {
      if (typeof name === 'function') {
        cls = name;
        name = cls.prototype.constructor.name;
      }
      if (!Domodule.modules) {
        Domodule.modules = {};
      }
      Domodule.log('Registering ' + name);
      Domodule.modules[name] = cls;
    }
  }, {
    key: 'discover',
    value: function discover() {
      var el = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'body';

      Domodule.log('Discovering modules...');
      if (!Domodule.modules) {
        Domodule.log('No modules found');
        return;
      }
      var els = void 0;

      if (el instanceof Node) {
        els = [el];
      } else if (Array.isArray(el)) {
        els = el;
      } else {
        els = DOMAssist.find(el);
      }

      var instances = [];
      els.forEach(function (matched) {
        var foundModules = DOMAssist.find('[data-module]', matched);

        foundModules.forEach(function (moduleEl) {
          var moduleName = moduleEl.dataset.module;

          if (moduleName && typeof Domodule.modules[moduleName] === 'function') {
            if (_typeof(Domodule.refs) === 'object' && typeof Domodule.refs[moduleEl.dataset.moduleUid] !== 'undefined') {
              return;
            }
            Domodule.log(moduleName + ' found');
            instances.push(new Domodule.modules[moduleName](moduleEl));
          }
        });
      });
      return instances;
    }
  }, {
    key: 'log',
    value: function log(msg) {
      if (Domodule.debug) {
        console.log('[DOMODULE] ' + msg); //eslint-disable-line no-console
      }
    }
  }]);
  return Domodule;
}();

Domodule.debug = _typeof(window.localStorage) === 'object' && window.localStorage.getItem('DomoduleDebug');

Domodule.autoDiscover = true;
window.addEventListener('DOMContentLoaded', function () {
  if (Domodule.autoDiscover) {
    Domodule.discover();
  }
});

function unwrapExports (x) {
	return x && x.__esModule ? x['default'] : x;
}

function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var ajax = createCommonjsModule(function (module, exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  var _createClass = function () {
    function defineProperties(target, props) {
      for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);
      }
    }return function (Constructor, protoProps, staticProps) {
      if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;
    };
  }();

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  /* eslint-env browser */
  var Ajax = function () {
    function Ajax() {
      _classCallCheck(this, Ajax);
    }

    _createClass(Ajax, null, [{
      key: 'request',

      /**
       * request - Makes a request to a remote server
       *
       * @param  String url         Url for the request
       * @param  String method      Request method: GET, POST, etc (default: GET)
       * @param  Object data        Data payload. Set to null to not send
       *                            anything. Data is sent as raw json (default: null)
       * @param  Function callback  Called con completion with an object containing
       *                            the status code and the data. If the response
       *                            has a content-type containing json data will
       *                            be parsed, otherwise it will be the raw data.
       * @returns XMLHttpRequest    Original XMLHttpRequest object to allow further
       *                            event binding.
       */
      value: function request(url) {
        for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
          args[_key - 1] = arguments[_key];
        }

        var method = args[0],
            data = args[1],
            headers = args[2],
            callback = args[3];

        if (typeof method === 'function') {
          method = 'GET';
          callback = method;
          data = null;
          headers = {};
        }

        if (typeof data === 'function') {
          callback = data;
          data = null;
          headers = {};
        }

        if (typeof headers === 'function') {
          callback = headers;
          headers = {};
        }

        if (headers === null) {
          headers = {};
        }

        var useMethod = method.toUpperCase();
        var validMethods = ['GET', 'POST', 'PUT', 'PATCH', 'HEAD', 'DELETE', 'OPTIONS'];

        if (validMethods.indexOf(useMethod) === -1) {
          var err = new TypeError('Method must be one of the following: ' + validMethods.join(', '));
          return callback(err);
        }

        var xhr = new XMLHttpRequest();

        xhr.open(useMethod, url);

        xhr.onreadystatechange = function () {
          if (xhr.readyState > 3 && xhr.status > 0) {
            var contentType = xhr.getResponseHeader('content-type');
            var parsedResponse = xhr.responseText;

            if (contentType && contentType.toLowerCase().indexOf('json') > -1) {
              parsedResponse = JSON.parse(parsedResponse);
            }

            return callback(null, {
              statusCode: xhr.status,
              data: parsedResponse
            });
          }
        };

        Object.keys(headers).forEach(function (header) {
          xhr.setRequestHeader(header, headers[header]);
        });

        if (data !== null) {
          xhr.setRequestHeader('Content-Type', 'application/json');
          xhr.send(JSON.stringify(data));
        } else {
          xhr.send();
        }

        return xhr;
      }
    }]);

    return Ajax;
  }();

  exports.default = Ajax;

  //# sourceMappingURL=ajax.js.map
});

var Ajax = unwrapExports(ajax);

function findOne$2(selector, el) {
  var found = find$2(selector, el);

  if (found.length) {
    return found[0];
  }

  return null;
}

function isWindow$2(obj) {
  return obj != null && obj === obj.window;
}

function find$2(selector) {
  var context = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

  if (selector instanceof HTMLElement || selector instanceof Node || isWindow$2(selector)) {
    return [selector];
  } else if (selector instanceof NodeList) {
    return [].slice.call(selector);
  } else if (typeof selector === 'string') {
    var startElement = context ? findOne$2(context) : document;
    return [].slice.call(startElement.querySelectorAll(selector));
  }
  return [];
}

var SCROLLABLE_CONTAINER$1 = void 0;

function getScrollableContainer$1() {
  if (SCROLLABLE_CONTAINER$1) {
    return SCROLLABLE_CONTAINER$1;
  }

  var documentElement = window.document.documentElement;
  var scrollableContainer = void 0;

  documentElement.scrollTop = 1;

  if (documentElement.scrollTop === 1) {
    documentElement.scrollTop = 0;
    scrollableContainer = documentElement;
  } else {
    scrollableContainer = document.body;
  }

  SCROLLABLE_CONTAINER$1 = scrollableContainer;

  return scrollableContainer;
}

SCROLLABLE_CONTAINER$1 = getScrollableContainer$1();

function toArray$3(value) {
  if (!value) {
    return [];
  }
  if (Array.isArray(value)) {
    return value;
  }
  if (value instanceof Node) {
    return [value];
  }
  return [].slice.call(value);
}

function deserialize(data, inputs) {
  var index = {};

  if (!Array.isArray(inputs)) {
    inputs = toArray$3(inputs);
  }

  inputs.forEach(function (input) {
    var name = input.getAttribute('name');
    var val = data[name];

    if (typeof index[name] === 'undefined') {
      index[name] = 0;
    } else {
      index[name] = index[name] + 1;
    }

    if (Array.isArray(val) && input.tagName !== 'SELECT' && !input.multiple) {
      val = val[index[name]];
    }

    if (typeof val === 'undefined') {
      return;
    }

    if (input.type === 'checkbox') {
      if (input.getAttribute('value')) {
        input.checked = val === input.value;
      } else {
        input.checked = val === true;
      }
    } else if (input.type === 'radio' && input.value === val) {
      input.checked = true;
    } else if (input.tagName === 'SELECT') {
      var v = val;

      if (!Array.isArray(val)) {
        v = [val];
      }

      toArray$3(input.options).filter(function (option) {
        return v.indexOf(option.value) > -1;
      }).forEach(function (option) {
        option.selected = true;
      });
    } else {
      input.value = val;
    }
  });
}

function isForm(el) {
  if (!el || !el.tagName || el.tagName !== 'FORM') {
    throw new Error('Must pass in a form element');
  }
}

function getInputs(form) {
  var selector = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '[name]';

  isForm(form);

  if (typeof selector !== 'string') {
    throw new Error('Invalid selector');
  }

  return toArray$3(find$2(selector, form));
}

function getJSON(form, selector) {
  var inputs = getInputs(form, selector);
  var output = {};

  inputs.forEach(function (input) {
    var name = input.getAttribute('name');
    var value = void 0;

    if (input.type === 'checkbox') {
      if (input.getAttribute('value')) {
        if (input.checked) {
          value = input.value;
        } else {
          return;
        }
      } else {
        value = input.checked;
      }
    } else if (input.type === 'radio') {
      if (input.checked) {
        value = input.value;
      } else {
        return;
      }
    } else if (input.tagName === 'SELECT' && input.multiple) {
      value = toArray$3(input.options).filter(function (option) {
        return option.selected;
      }).map(function (option) {
        return option.value;
      });
    } else {
      value = input.value;
    }

    // Radio will have multiple matching `name` attributes and we don't want them all.
    if (typeof output[name] !== 'undefined' && input.type !== 'radio') {
      if (Array.isArray(output[name])) {
        output[name].push(value);
      } else {
        output[name] = [output[name], value];
      }
    } else {
      output[name] = value;
    }
  });

  return output;
}

function getQueryString(form) {
  var data = void 0;
  var queryString = '';

  if (form instanceof HTMLElement) {
    data = getJSON(form);
  } else {
    data = form;
  }

  var formatValue = function formatValue(k, v) {
    return '&' + encodeURIComponent(k) + '=' + encodeURIComponent(v);
  };

  Object.keys(data).forEach(function (key) {
    var value = data[key];

    if (Array.isArray(value)) {
      value.forEach(function (k) {
        queryString += formatValue(key, k);
      });
    } else {
      queryString += formatValue(key, value);
    }
  });

  return queryString.substring(1);
}

function formobj(form, selector) {
  isForm(form);

  var api = {
    getInputs: function getInputs$$1() {
      return getInputs(form, selector);
    },
    getJSON: function getJSON$$1() {
      return getJSON(form, selector);
    },
    deserialize: function deserialize$$1(data) {
      return deserialize(data, getInputs(form, selector));
    },
    getQueryString: function getQueryString$$1() {
      return getQueryString(api.getJSON(form));
    }
  };

  return api;
}

function tinytemplate(string) {
  return string;
}

var Formjax = function (_Domodule) {
  inherits(Formjax, _Domodule);

  function Formjax() {
    classCallCheck(this, Formjax);
    return possibleConstructorReturn(this, (Formjax.__proto__ || Object.getPrototypeOf(Formjax)).apply(this, arguments));
  }

  createClass(Formjax, [{
    key: 'preInit',
    value: function preInit() {
      if (this.el.tagName !== 'FORM') {
        throw new Error('Formjax need to be attached to a form');
      }

      this.method = this.el.getAttribute('method').toUpperCase();
      this.url = this.el.getAttribute('action');
      this.form = formobj(this.el);
      this.sending = false;
    }
  }, {
    key: 'confirm',
    value: function confirm(sendForm) {
      if (window.confirm(this.options.confirmText)) {
        // eslint-disable-line no-alert
        sendForm();
      }
    }
  }, {
    key: 'submit',
    value: function submit(el, event) {
      event.preventDefault();

      if (this.options.confirm) {
        this.confirm(this.sendForm.bind(this));
      } else {
        this.sendForm();
      }
    }
  }, {
    key: 'sendForm',
    value: function sendForm() {
      var _this2 = this;

      if (this.sending) {
        return;
      }

      this.sending = true;
      var args = [this.url, this.method];

      if (this.method === 'GET') {
        var url = this.url;
        var uri = this.form.getQueryString();

        if (url.indexOf('?') > -1) {
          url = url + '&' + uri;
        } else {
          url = url + '?' + uri;
        }

        args[0] = url;
      } else {
        args.push(this.form.getJSON());
      }

      Ajax.request.apply(Ajax, args.concat([function (err, resp) {
        if (!err && resp.statusCode === 200) {
          if (_this2.options.successReload) {
            Formjax.reload();
          } else if (_this2.options.success) {
            Formjax.goTo(tinytemplate(_this2.options.success, resp.data));
          }
        }
      }]));
    }
  }, {
    key: 'defaults',
    get: function get$$1() {
      return {
        confirm: false,
        successReload: false,
        confirmText: 'Are you sure you want to submit?'
      };
    }
  }], [{
    key: 'reload',
    value: function reload() {
      window.location.reload();
    }
  }, {
    key: 'goTo',
    value: function goTo(url) {
      window.location.href = url;
    }
  }]);
  return Formjax;
}(Domodule);

Domodule.register('Formjax', Formjax);

return Formjax;

}());

//# sourceMappingURL=formjax.js.map