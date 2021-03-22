"use strict";

var _object = _interopRequireDefault(require("object.assign"));

var _react = _interopRequireDefault(require("react"));

var _reactDom = _interopRequireDefault(require("react-dom"));

var _server = _interopRequireDefault(require("react-dom/server"));

var _shallow = _interopRequireDefault(require("react-test-renderer/shallow"));

var _package = require("react-test-renderer/package.json");

var _testUtils = _interopRequireDefault(require("react-dom/test-utils"));

var _semver = _interopRequireDefault(require("semver"));

var _checkPropTypes2 = _interopRequireDefault(require("prop-types/checkPropTypes"));

var _has = _interopRequireDefault(require("has"));

var _reactIs = require("react-is");

var _enzyme = require("enzyme");

var _Utils = require("enzyme/build/Utils");

var _enzymeShallowEqual = _interopRequireDefault(require("enzyme-shallow-equal"));

var _enzymeAdapterUtils = require("enzyme-adapter-utils");

var _findCurrentFiberUsingSlowPath = _interopRequireDefault(require("./findCurrentFiberUsingSlowPath"));

var _detectFiberTags = _interopRequireDefault(require("./detectFiberTags"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

// Lazily populated if DOM is available.
var FiberTags = null;

function nodeAndSiblingsArray(nodeWithSibling) {
  var array = [];
  var node = nodeWithSibling;

  while (node != null) {
    array.push(node);
    node = node.sibling;
  }

  return array;
}

function flatten(arr) {
  var result = [];
  var stack = [{
    i: 0,
    array: arr
  }];

  while (stack.length) {
    var n = stack.pop();

    while (n.i < n.array.length) {
      var el = n.array[n.i];
      n.i += 1;

      if (Array.isArray(el)) {
        stack.push(n);
        stack.push({
          i: 0,
          array: el
        });
        break;
      }

      result.push(el);
    }
  }

  return result;
}

function nodeTypeFromType(type) {
  if (type === _reactIs.Portal) {
    return 'portal';
  }

  return (0, _enzymeAdapterUtils.nodeTypeFromType)(type);
}

function isMemo(type) {
  return (0, _enzymeAdapterUtils.compareNodeTypeOf)(type, _reactIs.Memo);
}

function isLazy(type) {
  return (0, _enzymeAdapterUtils.compareNodeTypeOf)(type, _reactIs.Lazy);
}

function unmemoType(type) {
  return isMemo(type) ? type.type : type;
}

function checkIsSuspenseAndCloneElement(el, _ref) {
  var suspenseFallback = _ref.suspenseFallback;

  if (!(0, _reactIs.isSuspense)(el)) {
    return el;
  }

  var children = el.props.children;

  if (suspenseFallback) {
    var fallback = el.props.fallback;
    children = replaceLazyWithFallback(children, fallback);
  }

  var FakeSuspenseWrapper = function FakeSuspenseWrapper(props) {
    return /*#__PURE__*/_react["default"].createElement(el.type, _objectSpread(_objectSpread({}, el.props), props), children);
  };

  return /*#__PURE__*/_react["default"].createElement(FakeSuspenseWrapper, null, children);
}

function elementToTree(el) {
  if (!(0, _reactIs.isPortal)(el)) {
    return (0, _enzymeAdapterUtils.elementToTree)(el, elementToTree);
  }

  var children = el.children,
      containerInfo = el.containerInfo;
  var props = {
    children: children,
    containerInfo: containerInfo
  };
  return {
    nodeType: 'portal',
    type: _reactIs.Portal,
    props: props,
    key: (0, _enzymeAdapterUtils.ensureKeyOrUndefined)(el.key),
    ref: el.ref || null,
    instance: null,
    rendered: elementToTree(el.children)
  };
}

function _toTree(vnode) {
  if (vnode == null) {
    return null;
  } // TODO(lmr): I'm not really sure I understand whether or not this is what
  // i should be doing, or if this is a hack for something i'm doing wrong
  // somewhere else. Should talk to sebastian about this perhaps


  var node = (0, _findCurrentFiberUsingSlowPath["default"])(vnode);

  switch (node.tag) {
    case FiberTags.HostRoot:
      return childrenToTree(node.child);

    case FiberTags.HostPortal:
      {
        var containerInfo = node.stateNode.containerInfo,
            children = node.memoizedProps;
        var props = {
          containerInfo: containerInfo,
          children: children
        };
        return {
          nodeType: 'portal',
          type: _reactIs.Portal,
          props: props,
          key: (0, _enzymeAdapterUtils.ensureKeyOrUndefined)(node.key),
          ref: node.ref,
          instance: null,
          rendered: childrenToTree(node.child)
        };
      }

    case FiberTags.ClassComponent:
      return {
        nodeType: 'class',
        type: node.type,
        props: _objectSpread({}, node.memoizedProps),
        key: (0, _enzymeAdapterUtils.ensureKeyOrUndefined)(node.key),
        ref: node.ref,
        instance: node.stateNode,
        rendered: childrenToTree(node.child)
      };

    case FiberTags.FunctionalComponent:
      return {
        nodeType: 'function',
        type: node.type,
        props: _objectSpread({}, node.memoizedProps),
        key: (0, _enzymeAdapterUtils.ensureKeyOrUndefined)(node.key),
        ref: node.ref,
        instance: null,
        rendered: childrenToTree(node.child)
      };

    case FiberTags.MemoClass:
      return {
        nodeType: 'class',
        type: node.elementType.type,
        props: _objectSpread({}, node.memoizedProps),
        key: (0, _enzymeAdapterUtils.ensureKeyOrUndefined)(node.key),
        ref: node.ref,
        instance: node.stateNode,
        rendered: childrenToTree(node.child.child)
      };

    case FiberTags.MemoSFC:
      {
        var renderedNodes = flatten(nodeAndSiblingsArray(node.child).map(_toTree));

        if (renderedNodes.length === 0) {
          renderedNodes = [node.memoizedProps.children];
        }

        return {
          nodeType: 'function',
          type: node.elementType,
          props: _objectSpread({}, node.memoizedProps),
          key: (0, _enzymeAdapterUtils.ensureKeyOrUndefined)(node.key),
          ref: node.ref,
          instance: null,
          rendered: renderedNodes
        };
      }

    case FiberTags.HostComponent:
      {
        var _renderedNodes = flatten(nodeAndSiblingsArray(node.child).map(_toTree));

        if (_renderedNodes.length === 0) {
          _renderedNodes = [node.memoizedProps.children];
        }

        return {
          nodeType: 'host',
          type: node.type,
          props: _objectSpread({}, node.memoizedProps),
          key: (0, _enzymeAdapterUtils.ensureKeyOrUndefined)(node.key),
          ref: node.ref,
          instance: node.stateNode,
          rendered: _renderedNodes
        };
      }

    case FiberTags.HostText:
      return node.memoizedProps;

    case FiberTags.Fragment:
    case FiberTags.Mode:
    case FiberTags.ContextProvider:
    case FiberTags.ContextConsumer:
      return childrenToTree(node.child);

    case FiberTags.Profiler:
    case FiberTags.ForwardRef:
      {
        return {
          nodeType: 'function',
          type: node.type,
          props: _objectSpread({}, node.pendingProps),
          key: (0, _enzymeAdapterUtils.ensureKeyOrUndefined)(node.key),
          ref: node.ref,
          instance: null,
          rendered: childrenToTree(node.child)
        };
      }

    case FiberTags.Suspense:
      {
        return {
          nodeType: 'function',
          type: _reactIs.Suspense,
          props: _objectSpread({}, node.memoizedProps),
          key: (0, _enzymeAdapterUtils.ensureKeyOrUndefined)(node.key),
          ref: node.ref,
          instance: null,
          rendered: childrenToTree(node.child)
        };
      }

    case FiberTags.Lazy:
      return childrenToTree(node.child);

    case FiberTags.OffscreenComponent:
      return _toTree(node.child);

    default:
      throw new Error("Enzyme Internal Error: unknown node with tag ".concat(node.tag));
  }
}

function childrenToTree(node) {
  if (!node) {
    return null;
  }

  var children = nodeAndSiblingsArray(node);

  if (children.length === 0) {
    return null;
  }

  if (children.length === 1) {
    return _toTree(children[0]);
  }

  return flatten(children.map(_toTree));
}

function _nodeToHostNode(_node) {
  // NOTE(lmr): node could be a function component
  // which wont have an instance prop, but we can get the
  // host node associated with its return value at that point.
  // Although this breaks down if the return value is an array,
  // as is possible with React 16.
  var node = _node;

  while (node && !Array.isArray(node) && node.instance === null) {
    node = node.rendered;
  } // if the SFC returned null effectively, there is no host node.


  if (!node) {
    return null;
  }

  var mapper = function mapper(item) {
    if (item && item.instance) return _reactDom["default"].findDOMNode(item.instance);
    return null;
  };

  if (Array.isArray(node)) {
    return node.map(mapper);
  }

  if (Array.isArray(node.rendered) && node.nodeType === 'class') {
    return node.rendered.map(mapper);
  }

  return mapper(node);
}

function replaceLazyWithFallback(node, fallback) {
  if (!node) {
    return null;
  }

  if (Array.isArray(node)) {
    return node.map(function (el) {
      return replaceLazyWithFallback(el, fallback);
    });
  }

  if (isLazy(node.type)) {
    return fallback;
  }

  return _objectSpread(_objectSpread({}, node), {}, {
    props: _objectSpread(_objectSpread({}, node.props), {}, {
      children: replaceLazyWithFallback(node.props.children, fallback)
    })
  });
}

var eventOptions = {
  animation: true,
  pointerEvents: true,
  auxClick: true
};

function getEmptyStateValue() {
  // this handles a bug in React 16.0 - 16.2
  // see https://github.com/facebook/react/commit/39be83565c65f9c522150e52375167568a2a1459
  // also see https://github.com/facebook/react/pull/11965
  var EmptyState = /*#__PURE__*/function (_React$Component) {
    _inherits(EmptyState, _React$Component);

    var _super = _createSuper(EmptyState);

    function EmptyState() {
      _classCallCheck(this, EmptyState);

      return _super.apply(this, arguments);
    }

    _createClass(EmptyState, [{
      key: "render",
      value: function render() {
        return null;
      }
    }]);

    return EmptyState;
  }(_react["default"].Component);

  var testRenderer = new _shallow["default"]();
  testRenderer.render( /*#__PURE__*/_react["default"].createElement(EmptyState));
  return testRenderer._instance.state;
}

function wrapAct(fn) {
  var returnVal;

  _testUtils["default"].act(function () {
    returnVal = fn();
  });

  return returnVal;
}

function getProviderDefaultValue(Provider) {
  // React stores references to the Provider's defaultValue differently across versions.
  if ('_defaultValue' in Provider._context) {
    return Provider._context._defaultValue;
  }

  if ('_currentValue' in Provider._context) {
    return Provider._context._currentValue;
  }

  throw new Error('Enzyme Internal Error: can’t figure out how to get Provider’s default value');
}

function makeFakeElement(type) {
  return {
    $$typeof: _reactIs.Element,
    type: type
  };
}

function isStateful(Component) {
  return Component.prototype && (Component.prototype.isReactComponent || Array.isArray(Component.__reactAutoBindPairs) // fallback for createClass components
  );
}

var ReactSeventeenAdapter = /*#__PURE__*/function (_EnzymeAdapter) {
  _inherits(ReactSeventeenAdapter, _EnzymeAdapter);

  var _super2 = _createSuper(ReactSeventeenAdapter);

  function ReactSeventeenAdapter() {
    var _this;

    _classCallCheck(this, ReactSeventeenAdapter);

    _this = _super2.call(this);
    var lifecycles = _this.options.lifecycles;
    _this.options = _objectSpread(_objectSpread({}, _this.options), {}, {
      enableComponentDidUpdateOnSetState: true,
      // TODO: remove, semver-major
      legacyContextMode: 'parent',
      lifecycles: _objectSpread(_objectSpread({}, lifecycles), {}, {
        componentDidUpdate: {
          onSetState: true
        },
        getDerivedStateFromProps: {
          hasShouldComponentUpdateBug: false
        },
        getSnapshotBeforeUpdate: true,
        setState: {
          skipsComponentDidUpdateOnNullish: true
        },
        getChildContext: {
          calledByRenderer: false
        },
        getDerivedStateFromError: true
      })
    });
    return _this;
  }

  _createClass(ReactSeventeenAdapter, [{
    key: "createMountRenderer",
    value: function createMountRenderer(options) {
      (0, _enzymeAdapterUtils.assertDomAvailable)('mount');

      if ((0, _has["default"])(options, 'suspenseFallback')) {
        throw new TypeError('`suspenseFallback` is not supported by the `mount` renderer');
      }

      if (FiberTags === null) {
        // Requires DOM.
        FiberTags = (0, _detectFiberTags["default"])();
      }

      var attachTo = options.attachTo,
          hydrateIn = options.hydrateIn,
          wrappingComponentProps = options.wrappingComponentProps;
      var domNode = hydrateIn || attachTo || global.document.createElement('div');
      var instance = null;
      var adapter = this;
      return {
        render: function render(el, context, callback) {
          return wrapAct(function () {
            if (instance === null) {
              var type = el.type,
                  props = el.props,
                  ref = el.ref;

              var wrapperProps = _objectSpread({
                Component: type,
                props: props,
                wrappingComponentProps: wrappingComponentProps,
                context: context
              }, ref && {
                refProp: ref
              });

              var ReactWrapperComponent = (0, _enzymeAdapterUtils.createMountWrapper)(el, _objectSpread(_objectSpread({}, options), {}, {
                adapter: adapter
              }));

              var wrappedEl = /*#__PURE__*/_react["default"].createElement(ReactWrapperComponent, wrapperProps);

              instance = hydrateIn ? _reactDom["default"].hydrate(wrappedEl, domNode) : _reactDom["default"].render(wrappedEl, domNode);

              if (typeof callback === 'function') {
                callback();
              }
            } else {
              instance.setChildProps(el.props, context, callback);
            }
          });
        },
        unmount: function unmount() {
          _reactDom["default"].unmountComponentAtNode(domNode);

          instance = null;
        },
        getNode: function getNode() {
          if (!instance) {
            return null;
          }

          return (0, _enzymeAdapterUtils.getNodeFromRootFinder)(adapter.isCustomComponent, _toTree(instance._reactInternals), options);
        },
        simulateError: function simulateError(nodeHierarchy, rootNode, error) {
          var isErrorBoundary = function isErrorBoundary(_ref2) {
            var elInstance = _ref2.instance,
                type = _ref2.type;

            if (type && type.getDerivedStateFromError) {
              return true;
            }

            return elInstance && elInstance.componentDidCatch;
          };

          var _ref3 = nodeHierarchy.find(isErrorBoundary) || {},
              catchingInstance = _ref3.instance,
              catchingType = _ref3.type;

          (0, _enzymeAdapterUtils.simulateError)(error, catchingInstance, rootNode, nodeHierarchy, nodeTypeFromType, adapter.displayNameOfNode, catchingType);
        },
        simulateEvent: function simulateEvent(node, event, mock) {
          var mappedEvent = (0, _enzymeAdapterUtils.mapNativeEventNames)(event, eventOptions);
          var eventFn = _testUtils["default"].Simulate[mappedEvent];

          if (!eventFn) {
            throw new TypeError("ReactWrapper::simulate() event '".concat(event, "' does not exist"));
          }

          wrapAct(function () {
            eventFn(adapter.nodeToHostNode(node), mock);
          });
        },
        batchedUpdates: function batchedUpdates(fn) {
          return fn(); // return ReactDOM.unstable_batchedUpdates(fn);
        },
        getWrappingComponentRenderer: function getWrappingComponentRenderer() {
          return _objectSpread(_objectSpread({}, this), (0, _enzymeAdapterUtils.getWrappingComponentMountRenderer)({
            toTree: function toTree(inst) {
              return _toTree(inst._reactInternals);
            },
            getMountWrapperInstance: function getMountWrapperInstance() {
              return instance;
            }
          }));
        },
        wrapInvoke: wrapAct
      };
    }
  }, {
    key: "createShallowRenderer",
    value: function createShallowRenderer() {
      var _this2 = this;

      var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      var adapter = this;
      var renderer = new _shallow["default"]();
      var suspenseFallback = options.suspenseFallback;

      if (typeof suspenseFallback !== 'undefined' && typeof suspenseFallback !== 'boolean') {
        throw TypeError('`options.suspenseFallback` should be boolean or undefined');
      }

      var isDOM = false;
      var cachedNode = null;
      var lastComponent = null;
      var wrappedComponent = null;
      var sentinel = {}; // wrap memo components with a PureComponent, or a class component with sCU

      var wrapPureComponent = function wrapPureComponent(Component, compare) {
        if (lastComponent !== Component) {
          if (isStateful(Component)) {
            wrappedComponent = /*#__PURE__*/function (_Component) {
              _inherits(wrappedComponent, _Component);

              var _super3 = _createSuper(wrappedComponent);

              function wrappedComponent() {
                _classCallCheck(this, wrappedComponent);

                return _super3.apply(this, arguments);
              }

              return wrappedComponent;
            }(Component);

            if (compare) {
              wrappedComponent.prototype.shouldComponentUpdate = function (nextProps) {
                return !compare(_this2.props, nextProps);
              };
            } else {
              wrappedComponent.prototype.isPureReactComponent = true;
            }
          } else {
            var memoized = sentinel;
            var prevProps;

            wrappedComponent = function wrappedComponentFn(props) {
              var shouldUpdate = memoized === sentinel || (compare ? !compare(prevProps, props) : !(0, _enzymeShallowEqual["default"])(prevProps, props));

              if (shouldUpdate) {
                for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
                  args[_key - 1] = arguments[_key];
                }

                memoized = Component.apply(void 0, [_objectSpread(_objectSpread({}, Component.defaultProps), props)].concat(args));
                prevProps = props;
              }

              return memoized;
            };
          }

          (0, _object["default"])(wrappedComponent, Component, {
            displayName: adapter.displayNameOfNode({
              type: Component
            })
          });
          lastComponent = Component;
        }

        return wrappedComponent;
      }; // Wrap functional components on versions prior to 16.5,
      // to avoid inadvertently pass a `this` instance to it.


      var wrapFunctionalComponent = function wrapFunctionalComponent(Component) {
        if ((0, _has["default"])(Component, 'defaultProps')) {
          if (lastComponent !== Component) {
            wrappedComponent = (0, _object["default"])( // eslint-disable-next-line new-cap
            function (props) {
              for (var _len2 = arguments.length, args = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
                args[_key2 - 1] = arguments[_key2];
              }

              return Component.apply(void 0, [_objectSpread(_objectSpread({}, Component.defaultProps), props)].concat(args));
            }, Component, {
              displayName: adapter.displayNameOfNode({
                type: Component
              })
            });
            lastComponent = Component;
          }

          return wrappedComponent;
        }

        return Component;
      };

      var renderElement = function renderElement(elConfig) {
        for (var _len3 = arguments.length, rest = new Array(_len3 > 1 ? _len3 - 1 : 0), _key3 = 1; _key3 < _len3; _key3++) {
          rest[_key3 - 1] = arguments[_key3];
        }

        var renderedEl = renderer.render.apply(renderer, [elConfig].concat(rest));
        var typeIsExisted = !!(renderedEl && renderedEl.type);

        if (typeIsExisted) {
          var clonedEl = checkIsSuspenseAndCloneElement(renderedEl, {
            suspenseFallback: suspenseFallback
          });
          var elementIsChanged = clonedEl.type !== renderedEl.type;

          if (elementIsChanged) {
            return renderer.render.apply(renderer, [_objectSpread(_objectSpread({}, elConfig), {}, {
              type: clonedEl.type
            })].concat(rest));
          }
        }

        return renderedEl;
      };

      return {
        render: function render(el, unmaskedContext) {
          var _ref4 = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {},
              _ref4$providerValues = _ref4.providerValues,
              providerValues = _ref4$providerValues === void 0 ? new Map() : _ref4$providerValues;

          cachedNode = el;
          /* eslint consistent-return: 0 */

          if (typeof el.type === 'string') {
            isDOM = true;
          } else if ((0, _reactIs.isContextProvider)(el)) {
            providerValues.set(el.type, el.props.value);
            var MockProvider = (0, _object["default"])(function (props) {
              return props.children;
            }, el.type);
            return (0, _enzymeAdapterUtils.withSetStateAllowed)(function () {
              return renderElement(_objectSpread(_objectSpread({}, el), {}, {
                type: MockProvider
              }));
            });
          } else if ((0, _reactIs.isContextConsumer)(el)) {
            var Provider = adapter.getProviderFromConsumer(el.type);
            var value = providerValues.has(Provider) ? providerValues.get(Provider) : getProviderDefaultValue(Provider);
            var MockConsumer = (0, _object["default"])(function (props) {
              return props.children(value);
            }, el.type);
            return (0, _enzymeAdapterUtils.withSetStateAllowed)(function () {
              return renderElement(_objectSpread(_objectSpread({}, el), {}, {
                type: MockConsumer
              }));
            });
          } else {
            isDOM = false;
            var renderedEl = el;

            if (isLazy(renderedEl)) {
              throw TypeError('`React.lazy` is not supported by shallow rendering.');
            }

            renderedEl = checkIsSuspenseAndCloneElement(renderedEl, {
              suspenseFallback: suspenseFallback
            });
            var _renderedEl = renderedEl,
                Component = _renderedEl.type;
            var context = (0, _enzymeAdapterUtils.getMaskedContext)(Component.contextTypes, unmaskedContext);

            if (isMemo(el.type)) {
              var _el$type = el.type,
                  InnerComp = _el$type.type,
                  compare = _el$type.compare;
              return (0, _enzymeAdapterUtils.withSetStateAllowed)(function () {
                return renderElement(_objectSpread(_objectSpread({}, el), {}, {
                  type: wrapPureComponent(InnerComp, compare)
                }), context);
              });
            }

            if (!isStateful(Component) && typeof Component === 'function') {
              return (0, _enzymeAdapterUtils.withSetStateAllowed)(function () {
                return renderElement(_objectSpread(_objectSpread({}, renderedEl), {}, {
                  type: wrapFunctionalComponent(Component)
                }), context);
              });
            }

            if (isStateful) {
              // fix react bug; see implementation of `getEmptyStateValue`
              var emptyStateValue = getEmptyStateValue();

              if (emptyStateValue) {
                Object.defineProperty(Component.prototype, 'state', {
                  configurable: true,
                  enumerable: true,
                  get: function get() {
                    return null;
                  },
                  set: function set(value) {
                    if (value !== emptyStateValue) {
                      Object.defineProperty(this, 'state', {
                        configurable: true,
                        enumerable: true,
                        value: value,
                        writable: true
                      });
                    }

                    return true;
                  }
                });
              }
            }

            return (0, _enzymeAdapterUtils.withSetStateAllowed)(function () {
              return renderElement(renderedEl, context);
            });
          }
        },
        unmount: function unmount() {
          renderer.unmount();
        },
        getNode: function getNode() {
          if (isDOM) {
            return elementToTree(cachedNode);
          }

          var output = renderer.getRenderOutput();
          return {
            nodeType: nodeTypeFromType(cachedNode.type),
            type: cachedNode.type,
            props: cachedNode.props,
            key: (0, _enzymeAdapterUtils.ensureKeyOrUndefined)(cachedNode.key),
            ref: cachedNode.ref,
            instance: renderer._instance,
            rendered: Array.isArray(output) ? flatten(output).map(function (el) {
              return elementToTree(el);
            }) : elementToTree(output)
          };
        },
        simulateError: function simulateError(nodeHierarchy, rootNode, error) {
          (0, _enzymeAdapterUtils.simulateError)(error, renderer._instance, cachedNode, nodeHierarchy.concat(cachedNode), nodeTypeFromType, adapter.displayNameOfNode, cachedNode.type);
        },
        simulateEvent: function simulateEvent(node, event) {
          for (var _len4 = arguments.length, args = new Array(_len4 > 2 ? _len4 - 2 : 0), _key4 = 2; _key4 < _len4; _key4++) {
            args[_key4 - 2] = arguments[_key4];
          }

          var handler = node.props[(0, _enzymeAdapterUtils.propFromEvent)(event, eventOptions)];

          if (handler) {
            (0, _enzymeAdapterUtils.withSetStateAllowed)(function () {
              // TODO(lmr): create/use synthetic events
              // TODO(lmr): emulate React's event propagation
              // ReactDOM.unstable_batchedUpdates(() => {
              handler.apply(void 0, args); // });
            });
          }
        },
        batchedUpdates: function batchedUpdates(fn) {
          return fn(); // return ReactDOM.unstable_batchedUpdates(fn);
        },
        checkPropTypes: function checkPropTypes(typeSpecs, values, location, hierarchy) {
          return (0, _checkPropTypes2["default"])(typeSpecs, values, location, (0, _enzymeAdapterUtils.displayNameOfNode)(cachedNode), function () {
            return (0, _enzymeAdapterUtils.getComponentStack)(hierarchy.concat([cachedNode]));
          });
        }
      };
    }
  }, {
    key: "createStringRenderer",
    value: function createStringRenderer(options) {
      if ((0, _has["default"])(options, 'suspenseFallback')) {
        throw new TypeError('`suspenseFallback` should not be specified in options of string renderer');
      }

      return {
        render: function render(el, context) {
          if (options.context && (el.type.contextTypes || options.childContextTypes)) {
            var childContextTypes = _objectSpread(_objectSpread({}, el.type.contextTypes || {}), options.childContextTypes);

            var ContextWrapper = (0, _enzymeAdapterUtils.createRenderWrapper)(el, context, childContextTypes);
            return _server["default"].renderToStaticMarkup( /*#__PURE__*/_react["default"].createElement(ContextWrapper));
          }

          return _server["default"].renderToStaticMarkup(el);
        }
      };
    } // Provided a bag of options, return an `EnzymeRenderer`. Some options can be implementation
    // specific, like `attach` etc. for React, but not part of this interface explicitly.
    // eslint-disable-next-line class-methods-use-this

  }, {
    key: "createRenderer",
    value: function createRenderer(options) {
      switch (options.mode) {
        case _enzyme.EnzymeAdapter.MODES.MOUNT:
          return this.createMountRenderer(options);

        case _enzyme.EnzymeAdapter.MODES.SHALLOW:
          return this.createShallowRenderer(options);

        case _enzyme.EnzymeAdapter.MODES.STRING:
          return this.createStringRenderer(options);

        default:
          throw new Error("Enzyme Internal Error: Unrecognized mode: ".concat(options.mode));
      }
    }
  }, {
    key: "wrap",
    value: function wrap(element) {
      return (0, _enzymeAdapterUtils.wrap)(element);
    } // converts an RSTNode to the corresponding JSX Pragma Element. This will be needed
    // in order to implement the `Wrapper.mount()` and `Wrapper.shallow()` methods, but should
    // be pretty straightforward for people to implement.
    // eslint-disable-next-line class-methods-use-this

  }, {
    key: "nodeToElement",
    value: function nodeToElement(node) {
      if (!node || _typeof(node) !== 'object') return null;
      var type = node.type;
      return /*#__PURE__*/_react["default"].createElement(unmemoType(type), (0, _enzymeAdapterUtils.propsWithKeysAndRef)(node));
    } // eslint-disable-next-line class-methods-use-this

  }, {
    key: "matchesElementType",
    value: function matchesElementType(node, matchingType) {
      if (!node) {
        return node;
      }

      var type = node.type;
      return unmemoType(type) === unmemoType(matchingType);
    }
  }, {
    key: "elementToNode",
    value: function elementToNode(element) {
      return elementToTree(element);
    }
  }, {
    key: "nodeToHostNode",
    value: function nodeToHostNode(node) {
      var supportsArray = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

      var nodes = _nodeToHostNode(node);

      if (Array.isArray(nodes) && !supportsArray) {
        return nodes[0];
      }

      return nodes;
    }
  }, {
    key: "displayNameOfNode",
    value: function displayNameOfNode(node) {
      if (!node) return null;
      var type = node.type,
          $$typeof = node.$$typeof;
      var adapter = this;
      var nodeType = type || $$typeof; // newer node types may be undefined, so only test if the nodeType exists

      if (nodeType) {
        switch (nodeType) {
          case _reactIs.ConcurrentMode || NaN:
            return 'ConcurrentMode';

          case _reactIs.Fragment || NaN:
            return 'Fragment';

          case _reactIs.StrictMode || NaN:
            return 'StrictMode';

          case _reactIs.Profiler || NaN:
            return 'Profiler';

          case _reactIs.Portal || NaN:
            return 'Portal';

          case _reactIs.Suspense || NaN:
            return 'Suspense';

          default:
        }
      }

      var $$typeofType = type && type.$$typeof;

      switch ($$typeofType) {
        case _reactIs.ContextConsumer || NaN:
          return 'ContextConsumer';

        case _reactIs.ContextProvider || NaN:
          return 'ContextProvider';

        case _reactIs.Memo || NaN:
          {
            var nodeName = (0, _enzymeAdapterUtils.displayNameOfNode)(node);
            return typeof nodeName === 'string' ? nodeName : "Memo(".concat(adapter.displayNameOfNode(type), ")");
          }

        case _reactIs.ForwardRef || NaN:
          {
            if (type.displayName) {
              return type.displayName;
            }

            var name = adapter.displayNameOfNode({
              type: type.render
            });
            return name ? "ForwardRef(".concat(name, ")") : 'ForwardRef';
          }

        case _reactIs.Lazy || NaN:
          {
            return 'lazy';
          }

        default:
          return (0, _enzymeAdapterUtils.displayNameOfNode)(node);
      }
    }
  }, {
    key: "isValidElement",
    value: function isValidElement(element) {
      return (0, _reactIs.isElement)(element);
    }
  }, {
    key: "isValidElementType",
    value: function isValidElementType(object) {
      return !!object && (0, _reactIs.isValidElementType)(object);
    }
  }, {
    key: "isFragment",
    value: function isFragment(fragment) {
      return (0, _Utils.typeOfNode)(fragment) === _reactIs.Fragment;
    }
  }, {
    key: "isCustomComponent",
    value: function isCustomComponent(type) {
      var fakeElement = makeFakeElement(type);
      return !!type && (typeof type === 'function' || (0, _reactIs.isForwardRef)(fakeElement) || (0, _reactIs.isContextProvider)(fakeElement) || (0, _reactIs.isContextConsumer)(fakeElement) || (0, _reactIs.isSuspense)(fakeElement));
    }
  }, {
    key: "isContextConsumer",
    value: function isContextConsumer(type) {
      return !!type && (0, _reactIs.isContextConsumer)(makeFakeElement(type));
    }
  }, {
    key: "isCustomComponentElement",
    value: function isCustomComponentElement(inst) {
      if (!inst || !this.isValidElement(inst)) {
        return false;
      }

      return this.isCustomComponent(inst.type);
    }
  }, {
    key: "getProviderFromConsumer",
    value: function getProviderFromConsumer(Consumer) {
      // React stores references to the Provider on a Consumer differently across versions.
      if (Consumer) {
        var Provider;

        if (Consumer._context) {
          // check this first, to avoid a deprecation warning
          Provider = Consumer._context.Provider;
        } else if (Consumer.Provider) {
          Provider = Consumer.Provider;
        }

        if (Provider) {
          return Provider;
        }
      }

      throw new Error('Enzyme Internal Error: can’t figure out how to get Provider from Consumer');
    }
  }, {
    key: "createElement",
    value: function createElement() {
      return /*#__PURE__*/_react["default"].createElement.apply(_react["default"], arguments);
    }
  }, {
    key: "wrapWithWrappingComponent",
    value: function wrapWithWrappingComponent(node, options) {
      return {
        RootFinder: _enzymeAdapterUtils.RootFinder,
        node: (0, _enzymeAdapterUtils.wrapWithWrappingComponent)(_react["default"].createElement, node, options)
      };
    }
  }]);

  return ReactSeventeenAdapter;
}(_enzyme.EnzymeAdapter);

module.exports = ReactSeventeenAdapter;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9SZWFjdFNldmVudGVlbkFkYXB0ZXIuanMiXSwibmFtZXMiOlsiRmliZXJUYWdzIiwibm9kZUFuZFNpYmxpbmdzQXJyYXkiLCJub2RlV2l0aFNpYmxpbmciLCJhcnJheSIsIm5vZGUiLCJwdXNoIiwic2libGluZyIsImZsYXR0ZW4iLCJhcnIiLCJyZXN1bHQiLCJzdGFjayIsImkiLCJsZW5ndGgiLCJuIiwicG9wIiwiZWwiLCJBcnJheSIsImlzQXJyYXkiLCJub2RlVHlwZUZyb21UeXBlIiwidHlwZSIsIlBvcnRhbCIsImlzTWVtbyIsIk1lbW8iLCJpc0xhenkiLCJMYXp5IiwidW5tZW1vVHlwZSIsImNoZWNrSXNTdXNwZW5zZUFuZENsb25lRWxlbWVudCIsInN1c3BlbnNlRmFsbGJhY2siLCJjaGlsZHJlbiIsInByb3BzIiwiZmFsbGJhY2siLCJyZXBsYWNlTGF6eVdpdGhGYWxsYmFjayIsIkZha2VTdXNwZW5zZVdyYXBwZXIiLCJSZWFjdCIsImNyZWF0ZUVsZW1lbnQiLCJlbGVtZW50VG9UcmVlIiwiY29udGFpbmVySW5mbyIsIm5vZGVUeXBlIiwia2V5IiwicmVmIiwiaW5zdGFuY2UiLCJyZW5kZXJlZCIsInRvVHJlZSIsInZub2RlIiwidGFnIiwiSG9zdFJvb3QiLCJjaGlsZHJlblRvVHJlZSIsImNoaWxkIiwiSG9zdFBvcnRhbCIsInN0YXRlTm9kZSIsIm1lbW9pemVkUHJvcHMiLCJDbGFzc0NvbXBvbmVudCIsIkZ1bmN0aW9uYWxDb21wb25lbnQiLCJNZW1vQ2xhc3MiLCJlbGVtZW50VHlwZSIsIk1lbW9TRkMiLCJyZW5kZXJlZE5vZGVzIiwibWFwIiwiSG9zdENvbXBvbmVudCIsIkhvc3RUZXh0IiwiRnJhZ21lbnQiLCJNb2RlIiwiQ29udGV4dFByb3ZpZGVyIiwiQ29udGV4dENvbnN1bWVyIiwiUHJvZmlsZXIiLCJGb3J3YXJkUmVmIiwicGVuZGluZ1Byb3BzIiwiU3VzcGVuc2UiLCJPZmZzY3JlZW5Db21wb25lbnQiLCJFcnJvciIsIm5vZGVUb0hvc3ROb2RlIiwiX25vZGUiLCJtYXBwZXIiLCJpdGVtIiwiUmVhY3RET00iLCJmaW5kRE9NTm9kZSIsImV2ZW50T3B0aW9ucyIsImFuaW1hdGlvbiIsInBvaW50ZXJFdmVudHMiLCJhdXhDbGljayIsImdldEVtcHR5U3RhdGVWYWx1ZSIsIkVtcHR5U3RhdGUiLCJDb21wb25lbnQiLCJ0ZXN0UmVuZGVyZXIiLCJTaGFsbG93UmVuZGVyZXIiLCJyZW5kZXIiLCJfaW5zdGFuY2UiLCJzdGF0ZSIsIndyYXBBY3QiLCJmbiIsInJldHVyblZhbCIsIlRlc3RVdGlscyIsImFjdCIsImdldFByb3ZpZGVyRGVmYXVsdFZhbHVlIiwiUHJvdmlkZXIiLCJfY29udGV4dCIsIl9kZWZhdWx0VmFsdWUiLCJfY3VycmVudFZhbHVlIiwibWFrZUZha2VFbGVtZW50IiwiJCR0eXBlb2YiLCJFbGVtZW50IiwiaXNTdGF0ZWZ1bCIsInByb3RvdHlwZSIsImlzUmVhY3RDb21wb25lbnQiLCJfX3JlYWN0QXV0b0JpbmRQYWlycyIsIlJlYWN0U2V2ZW50ZWVuQWRhcHRlciIsImxpZmVjeWNsZXMiLCJvcHRpb25zIiwiZW5hYmxlQ29tcG9uZW50RGlkVXBkYXRlT25TZXRTdGF0ZSIsImxlZ2FjeUNvbnRleHRNb2RlIiwiY29tcG9uZW50RGlkVXBkYXRlIiwib25TZXRTdGF0ZSIsImdldERlcml2ZWRTdGF0ZUZyb21Qcm9wcyIsImhhc1Nob3VsZENvbXBvbmVudFVwZGF0ZUJ1ZyIsImdldFNuYXBzaG90QmVmb3JlVXBkYXRlIiwic2V0U3RhdGUiLCJza2lwc0NvbXBvbmVudERpZFVwZGF0ZU9uTnVsbGlzaCIsImdldENoaWxkQ29udGV4dCIsImNhbGxlZEJ5UmVuZGVyZXIiLCJnZXREZXJpdmVkU3RhdGVGcm9tRXJyb3IiLCJUeXBlRXJyb3IiLCJhdHRhY2hUbyIsImh5ZHJhdGVJbiIsIndyYXBwaW5nQ29tcG9uZW50UHJvcHMiLCJkb21Ob2RlIiwiZ2xvYmFsIiwiZG9jdW1lbnQiLCJhZGFwdGVyIiwiY29udGV4dCIsImNhbGxiYWNrIiwid3JhcHBlclByb3BzIiwicmVmUHJvcCIsIlJlYWN0V3JhcHBlckNvbXBvbmVudCIsIndyYXBwZWRFbCIsImh5ZHJhdGUiLCJzZXRDaGlsZFByb3BzIiwidW5tb3VudCIsInVubW91bnRDb21wb25lbnRBdE5vZGUiLCJnZXROb2RlIiwiaXNDdXN0b21Db21wb25lbnQiLCJfcmVhY3RJbnRlcm5hbHMiLCJzaW11bGF0ZUVycm9yIiwibm9kZUhpZXJhcmNoeSIsInJvb3ROb2RlIiwiZXJyb3IiLCJpc0Vycm9yQm91bmRhcnkiLCJlbEluc3RhbmNlIiwiY29tcG9uZW50RGlkQ2F0Y2giLCJmaW5kIiwiY2F0Y2hpbmdJbnN0YW5jZSIsImNhdGNoaW5nVHlwZSIsImRpc3BsYXlOYW1lT2ZOb2RlIiwic2ltdWxhdGVFdmVudCIsImV2ZW50IiwibW9jayIsIm1hcHBlZEV2ZW50IiwiZXZlbnRGbiIsIlNpbXVsYXRlIiwiYmF0Y2hlZFVwZGF0ZXMiLCJnZXRXcmFwcGluZ0NvbXBvbmVudFJlbmRlcmVyIiwiaW5zdCIsImdldE1vdW50V3JhcHBlckluc3RhbmNlIiwid3JhcEludm9rZSIsInJlbmRlcmVyIiwiaXNET00iLCJjYWNoZWROb2RlIiwibGFzdENvbXBvbmVudCIsIndyYXBwZWRDb21wb25lbnQiLCJzZW50aW5lbCIsIndyYXBQdXJlQ29tcG9uZW50IiwiY29tcGFyZSIsInNob3VsZENvbXBvbmVudFVwZGF0ZSIsIm5leHRQcm9wcyIsImlzUHVyZVJlYWN0Q29tcG9uZW50IiwibWVtb2l6ZWQiLCJwcmV2UHJvcHMiLCJ3cmFwcGVkQ29tcG9uZW50Rm4iLCJzaG91bGRVcGRhdGUiLCJhcmdzIiwiZGVmYXVsdFByb3BzIiwiZGlzcGxheU5hbWUiLCJ3cmFwRnVuY3Rpb25hbENvbXBvbmVudCIsInJlbmRlckVsZW1lbnQiLCJlbENvbmZpZyIsInJlc3QiLCJyZW5kZXJlZEVsIiwidHlwZUlzRXhpc3RlZCIsImNsb25lZEVsIiwiZWxlbWVudElzQ2hhbmdlZCIsInVubWFza2VkQ29udGV4dCIsInByb3ZpZGVyVmFsdWVzIiwiTWFwIiwic2V0IiwidmFsdWUiLCJNb2NrUHJvdmlkZXIiLCJnZXRQcm92aWRlckZyb21Db25zdW1lciIsImhhcyIsImdldCIsIk1vY2tDb25zdW1lciIsImNvbnRleHRUeXBlcyIsIklubmVyQ29tcCIsImVtcHR5U3RhdGVWYWx1ZSIsIk9iamVjdCIsImRlZmluZVByb3BlcnR5IiwiY29uZmlndXJhYmxlIiwiZW51bWVyYWJsZSIsIndyaXRhYmxlIiwib3V0cHV0IiwiZ2V0UmVuZGVyT3V0cHV0IiwiY29uY2F0IiwiaGFuZGxlciIsImNoZWNrUHJvcFR5cGVzIiwidHlwZVNwZWNzIiwidmFsdWVzIiwibG9jYXRpb24iLCJoaWVyYXJjaHkiLCJjaGlsZENvbnRleHRUeXBlcyIsIkNvbnRleHRXcmFwcGVyIiwiUmVhY3RET01TZXJ2ZXIiLCJyZW5kZXJUb1N0YXRpY01hcmt1cCIsIm1vZGUiLCJFbnp5bWVBZGFwdGVyIiwiTU9ERVMiLCJNT1VOVCIsImNyZWF0ZU1vdW50UmVuZGVyZXIiLCJTSEFMTE9XIiwiY3JlYXRlU2hhbGxvd1JlbmRlcmVyIiwiU1RSSU5HIiwiY3JlYXRlU3RyaW5nUmVuZGVyZXIiLCJlbGVtZW50IiwibWF0Y2hpbmdUeXBlIiwic3VwcG9ydHNBcnJheSIsIm5vZGVzIiwiQ29uY3VycmVudE1vZGUiLCJOYU4iLCJTdHJpY3RNb2RlIiwiJCR0eXBlb2ZUeXBlIiwibm9kZU5hbWUiLCJuYW1lIiwib2JqZWN0IiwiZnJhZ21lbnQiLCJmYWtlRWxlbWVudCIsImlzVmFsaWRFbGVtZW50IiwiQ29uc3VtZXIiLCJSb290RmluZGVyIiwibW9kdWxlIiwiZXhwb3J0cyJdLCJtYXBwaW5ncyI6Ijs7OztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQXNCQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFzQkE7O0FBQ0E7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBRUE7QUFDQSxJQUFJQSxTQUFTLEdBQUcsSUFBaEI7O0FBRUEsU0FBU0Msb0JBQVQsQ0FBOEJDLGVBQTlCLEVBQStDO0FBQzdDLE1BQU1DLEtBQUssR0FBRyxFQUFkO0FBQ0EsTUFBSUMsSUFBSSxHQUFHRixlQUFYOztBQUNBLFNBQU9FLElBQUksSUFBSSxJQUFmLEVBQXFCO0FBQ25CRCxJQUFBQSxLQUFLLENBQUNFLElBQU4sQ0FBV0QsSUFBWDtBQUNBQSxJQUFBQSxJQUFJLEdBQUdBLElBQUksQ0FBQ0UsT0FBWjtBQUNEOztBQUNELFNBQU9ILEtBQVA7QUFDRDs7QUFFRCxTQUFTSSxPQUFULENBQWlCQyxHQUFqQixFQUFzQjtBQUNwQixNQUFNQyxNQUFNLEdBQUcsRUFBZjtBQUNBLE1BQU1DLEtBQUssR0FBRyxDQUFDO0FBQUVDLElBQUFBLENBQUMsRUFBRSxDQUFMO0FBQVFSLElBQUFBLEtBQUssRUFBRUs7QUFBZixHQUFELENBQWQ7O0FBQ0EsU0FBT0UsS0FBSyxDQUFDRSxNQUFiLEVBQXFCO0FBQ25CLFFBQU1DLENBQUMsR0FBR0gsS0FBSyxDQUFDSSxHQUFOLEVBQVY7O0FBQ0EsV0FBT0QsQ0FBQyxDQUFDRixDQUFGLEdBQU1FLENBQUMsQ0FBQ1YsS0FBRixDQUFRUyxNQUFyQixFQUE2QjtBQUMzQixVQUFNRyxFQUFFLEdBQUdGLENBQUMsQ0FBQ1YsS0FBRixDQUFRVSxDQUFDLENBQUNGLENBQVYsQ0FBWDtBQUNBRSxNQUFBQSxDQUFDLENBQUNGLENBQUYsSUFBTyxDQUFQOztBQUNBLFVBQUlLLEtBQUssQ0FBQ0MsT0FBTixDQUFjRixFQUFkLENBQUosRUFBdUI7QUFDckJMLFFBQUFBLEtBQUssQ0FBQ0wsSUFBTixDQUFXUSxDQUFYO0FBQ0FILFFBQUFBLEtBQUssQ0FBQ0wsSUFBTixDQUFXO0FBQUVNLFVBQUFBLENBQUMsRUFBRSxDQUFMO0FBQVFSLFVBQUFBLEtBQUssRUFBRVk7QUFBZixTQUFYO0FBQ0E7QUFDRDs7QUFDRE4sTUFBQUEsTUFBTSxDQUFDSixJQUFQLENBQVlVLEVBQVo7QUFDRDtBQUNGOztBQUNELFNBQU9OLE1BQVA7QUFDRDs7QUFFRCxTQUFTUyxnQkFBVCxDQUEwQkMsSUFBMUIsRUFBZ0M7QUFDOUIsTUFBSUEsSUFBSSxLQUFLQyxlQUFiLEVBQXFCO0FBQ25CLFdBQU8sUUFBUDtBQUNEOztBQUVELFNBQU8sMENBQXFCRCxJQUFyQixDQUFQO0FBQ0Q7O0FBRUQsU0FBU0UsTUFBVCxDQUFnQkYsSUFBaEIsRUFBc0I7QUFDcEIsU0FBTywyQ0FBa0JBLElBQWxCLEVBQXdCRyxhQUF4QixDQUFQO0FBQ0Q7O0FBRUQsU0FBU0MsTUFBVCxDQUFnQkosSUFBaEIsRUFBc0I7QUFDcEIsU0FBTywyQ0FBa0JBLElBQWxCLEVBQXdCSyxhQUF4QixDQUFQO0FBQ0Q7O0FBRUQsU0FBU0MsVUFBVCxDQUFvQk4sSUFBcEIsRUFBMEI7QUFDeEIsU0FBT0UsTUFBTSxDQUFDRixJQUFELENBQU4sR0FBZUEsSUFBSSxDQUFDQSxJQUFwQixHQUEyQkEsSUFBbEM7QUFDRDs7QUFFRCxTQUFTTyw4QkFBVCxDQUF3Q1gsRUFBeEMsUUFBa0U7QUFBQSxNQUFwQlksZ0JBQW9CLFFBQXBCQSxnQkFBb0I7O0FBQ2hFLE1BQUksQ0FBQyx5QkFBV1osRUFBWCxDQUFMLEVBQXFCO0FBQ25CLFdBQU9BLEVBQVA7QUFDRDs7QUFIK0QsTUFLMURhLFFBTDBELEdBSzdDYixFQUFFLENBQUNjLEtBTDBDLENBSzFERCxRQUwwRDs7QUFPaEUsTUFBSUQsZ0JBQUosRUFBc0I7QUFBQSxRQUNaRyxRQURZLEdBQ0NmLEVBQUUsQ0FBQ2MsS0FESixDQUNaQyxRQURZO0FBRXBCRixJQUFBQSxRQUFRLEdBQUdHLHVCQUF1QixDQUFDSCxRQUFELEVBQVdFLFFBQVgsQ0FBbEM7QUFDRDs7QUFFRCxNQUFNRSxtQkFBbUIsR0FBRyxTQUF0QkEsbUJBQXNCLENBQUNILEtBQUQ7QUFBQSx3QkFBV0ksa0JBQU1DLGFBQU4sQ0FDckNuQixFQUFFLENBQUNJLElBRGtDLGtDQUVoQ0osRUFBRSxDQUFDYyxLQUY2QixHQUVuQkEsS0FGbUIsR0FHckNELFFBSHFDLENBQVg7QUFBQSxHQUE1Qjs7QUFLQSxzQkFBT0ssa0JBQU1DLGFBQU4sQ0FBb0JGLG1CQUFwQixFQUF5QyxJQUF6QyxFQUErQ0osUUFBL0MsQ0FBUDtBQUNEOztBQUVELFNBQVNPLGFBQVQsQ0FBdUJwQixFQUF2QixFQUEyQjtBQUN6QixNQUFJLENBQUMsdUJBQVNBLEVBQVQsQ0FBTCxFQUFtQjtBQUNqQixXQUFPLHVDQUFrQkEsRUFBbEIsRUFBc0JvQixhQUF0QixDQUFQO0FBQ0Q7O0FBSHdCLE1BS2pCUCxRQUxpQixHQUtXYixFQUxYLENBS2pCYSxRQUxpQjtBQUFBLE1BS1BRLGFBTE8sR0FLV3JCLEVBTFgsQ0FLUHFCLGFBTE87QUFNekIsTUFBTVAsS0FBSyxHQUFHO0FBQUVELElBQUFBLFFBQVEsRUFBUkEsUUFBRjtBQUFZUSxJQUFBQSxhQUFhLEVBQWJBO0FBQVosR0FBZDtBQUVBLFNBQU87QUFDTEMsSUFBQUEsUUFBUSxFQUFFLFFBREw7QUFFTGxCLElBQUFBLElBQUksRUFBRUMsZUFGRDtBQUdMUyxJQUFBQSxLQUFLLEVBQUxBLEtBSEs7QUFJTFMsSUFBQUEsR0FBRyxFQUFFLDhDQUFxQnZCLEVBQUUsQ0FBQ3VCLEdBQXhCLENBSkE7QUFLTEMsSUFBQUEsR0FBRyxFQUFFeEIsRUFBRSxDQUFDd0IsR0FBSCxJQUFVLElBTFY7QUFNTEMsSUFBQUEsUUFBUSxFQUFFLElBTkw7QUFPTEMsSUFBQUEsUUFBUSxFQUFFTixhQUFhLENBQUNwQixFQUFFLENBQUNhLFFBQUo7QUFQbEIsR0FBUDtBQVNEOztBQUVELFNBQVNjLE9BQVQsQ0FBZ0JDLEtBQWhCLEVBQXVCO0FBQ3JCLE1BQUlBLEtBQUssSUFBSSxJQUFiLEVBQW1CO0FBQ2pCLFdBQU8sSUFBUDtBQUNELEdBSG9CLENBSXJCO0FBQ0E7QUFDQTs7O0FBQ0EsTUFBTXZDLElBQUksR0FBRywrQ0FBOEJ1QyxLQUE5QixDQUFiOztBQUNBLFVBQVF2QyxJQUFJLENBQUN3QyxHQUFiO0FBQ0UsU0FBSzVDLFNBQVMsQ0FBQzZDLFFBQWY7QUFDRSxhQUFPQyxjQUFjLENBQUMxQyxJQUFJLENBQUMyQyxLQUFOLENBQXJCOztBQUNGLFNBQUsvQyxTQUFTLENBQUNnRCxVQUFmO0FBQTJCO0FBQUEsWUFFVlosYUFGVSxHQUlyQmhDLElBSnFCLENBRXZCNkMsU0FGdUIsQ0FFVmIsYUFGVTtBQUFBLFlBR1JSLFFBSFEsR0FJckJ4QixJQUpxQixDQUd2QjhDLGFBSHVCO0FBS3pCLFlBQU1yQixLQUFLLEdBQUc7QUFBRU8sVUFBQUEsYUFBYSxFQUFiQSxhQUFGO0FBQWlCUixVQUFBQSxRQUFRLEVBQVJBO0FBQWpCLFNBQWQ7QUFDQSxlQUFPO0FBQ0xTLFVBQUFBLFFBQVEsRUFBRSxRQURMO0FBRUxsQixVQUFBQSxJQUFJLEVBQUVDLGVBRkQ7QUFHTFMsVUFBQUEsS0FBSyxFQUFMQSxLQUhLO0FBSUxTLFVBQUFBLEdBQUcsRUFBRSw4Q0FBcUJsQyxJQUFJLENBQUNrQyxHQUExQixDQUpBO0FBS0xDLFVBQUFBLEdBQUcsRUFBRW5DLElBQUksQ0FBQ21DLEdBTEw7QUFNTEMsVUFBQUEsUUFBUSxFQUFFLElBTkw7QUFPTEMsVUFBQUEsUUFBUSxFQUFFSyxjQUFjLENBQUMxQyxJQUFJLENBQUMyQyxLQUFOO0FBUG5CLFNBQVA7QUFTRDs7QUFDRCxTQUFLL0MsU0FBUyxDQUFDbUQsY0FBZjtBQUNFLGFBQU87QUFDTGQsUUFBQUEsUUFBUSxFQUFFLE9BREw7QUFFTGxCLFFBQUFBLElBQUksRUFBRWYsSUFBSSxDQUFDZSxJQUZOO0FBR0xVLFFBQUFBLEtBQUssb0JBQU96QixJQUFJLENBQUM4QyxhQUFaLENBSEE7QUFJTFosUUFBQUEsR0FBRyxFQUFFLDhDQUFxQmxDLElBQUksQ0FBQ2tDLEdBQTFCLENBSkE7QUFLTEMsUUFBQUEsR0FBRyxFQUFFbkMsSUFBSSxDQUFDbUMsR0FMTDtBQU1MQyxRQUFBQSxRQUFRLEVBQUVwQyxJQUFJLENBQUM2QyxTQU5WO0FBT0xSLFFBQUFBLFFBQVEsRUFBRUssY0FBYyxDQUFDMUMsSUFBSSxDQUFDMkMsS0FBTjtBQVBuQixPQUFQOztBQVNGLFNBQUsvQyxTQUFTLENBQUNvRCxtQkFBZjtBQUNFLGFBQU87QUFDTGYsUUFBQUEsUUFBUSxFQUFFLFVBREw7QUFFTGxCLFFBQUFBLElBQUksRUFBRWYsSUFBSSxDQUFDZSxJQUZOO0FBR0xVLFFBQUFBLEtBQUssb0JBQU96QixJQUFJLENBQUM4QyxhQUFaLENBSEE7QUFJTFosUUFBQUEsR0FBRyxFQUFFLDhDQUFxQmxDLElBQUksQ0FBQ2tDLEdBQTFCLENBSkE7QUFLTEMsUUFBQUEsR0FBRyxFQUFFbkMsSUFBSSxDQUFDbUMsR0FMTDtBQU1MQyxRQUFBQSxRQUFRLEVBQUUsSUFOTDtBQU9MQyxRQUFBQSxRQUFRLEVBQUVLLGNBQWMsQ0FBQzFDLElBQUksQ0FBQzJDLEtBQU47QUFQbkIsT0FBUDs7QUFTRixTQUFLL0MsU0FBUyxDQUFDcUQsU0FBZjtBQUNFLGFBQU87QUFDTGhCLFFBQUFBLFFBQVEsRUFBRSxPQURMO0FBRUxsQixRQUFBQSxJQUFJLEVBQUVmLElBQUksQ0FBQ2tELFdBQUwsQ0FBaUJuQyxJQUZsQjtBQUdMVSxRQUFBQSxLQUFLLG9CQUFPekIsSUFBSSxDQUFDOEMsYUFBWixDQUhBO0FBSUxaLFFBQUFBLEdBQUcsRUFBRSw4Q0FBcUJsQyxJQUFJLENBQUNrQyxHQUExQixDQUpBO0FBS0xDLFFBQUFBLEdBQUcsRUFBRW5DLElBQUksQ0FBQ21DLEdBTEw7QUFNTEMsUUFBQUEsUUFBUSxFQUFFcEMsSUFBSSxDQUFDNkMsU0FOVjtBQU9MUixRQUFBQSxRQUFRLEVBQUVLLGNBQWMsQ0FBQzFDLElBQUksQ0FBQzJDLEtBQUwsQ0FBV0EsS0FBWjtBQVBuQixPQUFQOztBQVNGLFNBQUsvQyxTQUFTLENBQUN1RCxPQUFmO0FBQXdCO0FBQ3RCLFlBQUlDLGFBQWEsR0FBR2pELE9BQU8sQ0FBQ04sb0JBQW9CLENBQUNHLElBQUksQ0FBQzJDLEtBQU4sQ0FBcEIsQ0FBaUNVLEdBQWpDLENBQXFDZixPQUFyQyxDQUFELENBQTNCOztBQUNBLFlBQUljLGFBQWEsQ0FBQzVDLE1BQWQsS0FBeUIsQ0FBN0IsRUFBZ0M7QUFDOUI0QyxVQUFBQSxhQUFhLEdBQUcsQ0FBQ3BELElBQUksQ0FBQzhDLGFBQUwsQ0FBbUJ0QixRQUFwQixDQUFoQjtBQUNEOztBQUNELGVBQU87QUFDTFMsVUFBQUEsUUFBUSxFQUFFLFVBREw7QUFFTGxCLFVBQUFBLElBQUksRUFBRWYsSUFBSSxDQUFDa0QsV0FGTjtBQUdMekIsVUFBQUEsS0FBSyxvQkFBT3pCLElBQUksQ0FBQzhDLGFBQVosQ0FIQTtBQUlMWixVQUFBQSxHQUFHLEVBQUUsOENBQXFCbEMsSUFBSSxDQUFDa0MsR0FBMUIsQ0FKQTtBQUtMQyxVQUFBQSxHQUFHLEVBQUVuQyxJQUFJLENBQUNtQyxHQUxMO0FBTUxDLFVBQUFBLFFBQVEsRUFBRSxJQU5MO0FBT0xDLFVBQUFBLFFBQVEsRUFBRWU7QUFQTCxTQUFQO0FBU0Q7O0FBQ0QsU0FBS3hELFNBQVMsQ0FBQzBELGFBQWY7QUFBOEI7QUFDNUIsWUFBSUYsY0FBYSxHQUFHakQsT0FBTyxDQUFDTixvQkFBb0IsQ0FBQ0csSUFBSSxDQUFDMkMsS0FBTixDQUFwQixDQUFpQ1UsR0FBakMsQ0FBcUNmLE9BQXJDLENBQUQsQ0FBM0I7O0FBQ0EsWUFBSWMsY0FBYSxDQUFDNUMsTUFBZCxLQUF5QixDQUE3QixFQUFnQztBQUM5QjRDLFVBQUFBLGNBQWEsR0FBRyxDQUFDcEQsSUFBSSxDQUFDOEMsYUFBTCxDQUFtQnRCLFFBQXBCLENBQWhCO0FBQ0Q7O0FBQ0QsZUFBTztBQUNMUyxVQUFBQSxRQUFRLEVBQUUsTUFETDtBQUVMbEIsVUFBQUEsSUFBSSxFQUFFZixJQUFJLENBQUNlLElBRk47QUFHTFUsVUFBQUEsS0FBSyxvQkFBT3pCLElBQUksQ0FBQzhDLGFBQVosQ0FIQTtBQUlMWixVQUFBQSxHQUFHLEVBQUUsOENBQXFCbEMsSUFBSSxDQUFDa0MsR0FBMUIsQ0FKQTtBQUtMQyxVQUFBQSxHQUFHLEVBQUVuQyxJQUFJLENBQUNtQyxHQUxMO0FBTUxDLFVBQUFBLFFBQVEsRUFBRXBDLElBQUksQ0FBQzZDLFNBTlY7QUFPTFIsVUFBQUEsUUFBUSxFQUFFZTtBQVBMLFNBQVA7QUFTRDs7QUFDRCxTQUFLeEQsU0FBUyxDQUFDMkQsUUFBZjtBQUNFLGFBQU92RCxJQUFJLENBQUM4QyxhQUFaOztBQUNGLFNBQUtsRCxTQUFTLENBQUM0RCxRQUFmO0FBQ0EsU0FBSzVELFNBQVMsQ0FBQzZELElBQWY7QUFDQSxTQUFLN0QsU0FBUyxDQUFDOEQsZUFBZjtBQUNBLFNBQUs5RCxTQUFTLENBQUMrRCxlQUFmO0FBQ0UsYUFBT2pCLGNBQWMsQ0FBQzFDLElBQUksQ0FBQzJDLEtBQU4sQ0FBckI7O0FBQ0YsU0FBSy9DLFNBQVMsQ0FBQ2dFLFFBQWY7QUFDQSxTQUFLaEUsU0FBUyxDQUFDaUUsVUFBZjtBQUEyQjtBQUN6QixlQUFPO0FBQ0w1QixVQUFBQSxRQUFRLEVBQUUsVUFETDtBQUVMbEIsVUFBQUEsSUFBSSxFQUFFZixJQUFJLENBQUNlLElBRk47QUFHTFUsVUFBQUEsS0FBSyxvQkFBT3pCLElBQUksQ0FBQzhELFlBQVosQ0FIQTtBQUlMNUIsVUFBQUEsR0FBRyxFQUFFLDhDQUFxQmxDLElBQUksQ0FBQ2tDLEdBQTFCLENBSkE7QUFLTEMsVUFBQUEsR0FBRyxFQUFFbkMsSUFBSSxDQUFDbUMsR0FMTDtBQU1MQyxVQUFBQSxRQUFRLEVBQUUsSUFOTDtBQU9MQyxVQUFBQSxRQUFRLEVBQUVLLGNBQWMsQ0FBQzFDLElBQUksQ0FBQzJDLEtBQU47QUFQbkIsU0FBUDtBQVNEOztBQUNELFNBQUsvQyxTQUFTLENBQUNtRSxRQUFmO0FBQXlCO0FBQ3ZCLGVBQU87QUFDTDlCLFVBQUFBLFFBQVEsRUFBRSxVQURMO0FBRUxsQixVQUFBQSxJQUFJLEVBQUVnRCxpQkFGRDtBQUdMdEMsVUFBQUEsS0FBSyxvQkFBT3pCLElBQUksQ0FBQzhDLGFBQVosQ0FIQTtBQUlMWixVQUFBQSxHQUFHLEVBQUUsOENBQXFCbEMsSUFBSSxDQUFDa0MsR0FBMUIsQ0FKQTtBQUtMQyxVQUFBQSxHQUFHLEVBQUVuQyxJQUFJLENBQUNtQyxHQUxMO0FBTUxDLFVBQUFBLFFBQVEsRUFBRSxJQU5MO0FBT0xDLFVBQUFBLFFBQVEsRUFBRUssY0FBYyxDQUFDMUMsSUFBSSxDQUFDMkMsS0FBTjtBQVBuQixTQUFQO0FBU0Q7O0FBQ0QsU0FBSy9DLFNBQVMsQ0FBQ3dCLElBQWY7QUFDRSxhQUFPc0IsY0FBYyxDQUFDMUMsSUFBSSxDQUFDMkMsS0FBTixDQUFyQjs7QUFDRixTQUFLL0MsU0FBUyxDQUFDb0Usa0JBQWY7QUFDRSxhQUFPMUIsT0FBTSxDQUFDdEMsSUFBSSxDQUFDMkMsS0FBTixDQUFiOztBQUNGO0FBQ0UsWUFBTSxJQUFJc0IsS0FBSix3REFBMERqRSxJQUFJLENBQUN3QyxHQUEvRCxFQUFOO0FBbEhKO0FBb0hEOztBQUVELFNBQVNFLGNBQVQsQ0FBd0IxQyxJQUF4QixFQUE4QjtBQUM1QixNQUFJLENBQUNBLElBQUwsRUFBVztBQUNULFdBQU8sSUFBUDtBQUNEOztBQUNELE1BQU13QixRQUFRLEdBQUczQixvQkFBb0IsQ0FBQ0csSUFBRCxDQUFyQzs7QUFDQSxNQUFJd0IsUUFBUSxDQUFDaEIsTUFBVCxLQUFvQixDQUF4QixFQUEyQjtBQUN6QixXQUFPLElBQVA7QUFDRDs7QUFDRCxNQUFJZ0IsUUFBUSxDQUFDaEIsTUFBVCxLQUFvQixDQUF4QixFQUEyQjtBQUN6QixXQUFPOEIsT0FBTSxDQUFDZCxRQUFRLENBQUMsQ0FBRCxDQUFULENBQWI7QUFDRDs7QUFDRCxTQUFPckIsT0FBTyxDQUFDcUIsUUFBUSxDQUFDNkIsR0FBVCxDQUFhZixPQUFiLENBQUQsQ0FBZDtBQUNEOztBQUVELFNBQVM0QixlQUFULENBQXdCQyxLQUF4QixFQUErQjtBQUM3QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBSW5FLElBQUksR0FBR21FLEtBQVg7O0FBQ0EsU0FBT25FLElBQUksSUFBSSxDQUFDWSxLQUFLLENBQUNDLE9BQU4sQ0FBY2IsSUFBZCxDQUFULElBQWdDQSxJQUFJLENBQUNvQyxRQUFMLEtBQWtCLElBQXpELEVBQStEO0FBQzdEcEMsSUFBQUEsSUFBSSxHQUFHQSxJQUFJLENBQUNxQyxRQUFaO0FBQ0QsR0FUNEIsQ0FVN0I7OztBQUNBLE1BQUksQ0FBQ3JDLElBQUwsRUFBVztBQUNULFdBQU8sSUFBUDtBQUNEOztBQUVELE1BQU1vRSxNQUFNLEdBQUcsU0FBVEEsTUFBUyxDQUFDQyxJQUFELEVBQVU7QUFDdkIsUUFBSUEsSUFBSSxJQUFJQSxJQUFJLENBQUNqQyxRQUFqQixFQUEyQixPQUFPa0MscUJBQVNDLFdBQVQsQ0FBcUJGLElBQUksQ0FBQ2pDLFFBQTFCLENBQVA7QUFDM0IsV0FBTyxJQUFQO0FBQ0QsR0FIRDs7QUFJQSxNQUFJeEIsS0FBSyxDQUFDQyxPQUFOLENBQWNiLElBQWQsQ0FBSixFQUF5QjtBQUN2QixXQUFPQSxJQUFJLENBQUNxRCxHQUFMLENBQVNlLE1BQVQsQ0FBUDtBQUNEOztBQUNELE1BQUl4RCxLQUFLLENBQUNDLE9BQU4sQ0FBY2IsSUFBSSxDQUFDcUMsUUFBbkIsS0FBZ0NyQyxJQUFJLENBQUNpQyxRQUFMLEtBQWtCLE9BQXRELEVBQStEO0FBQzdELFdBQU9qQyxJQUFJLENBQUNxQyxRQUFMLENBQWNnQixHQUFkLENBQWtCZSxNQUFsQixDQUFQO0FBQ0Q7O0FBQ0QsU0FBT0EsTUFBTSxDQUFDcEUsSUFBRCxDQUFiO0FBQ0Q7O0FBRUQsU0FBUzJCLHVCQUFULENBQWlDM0IsSUFBakMsRUFBdUMwQixRQUF2QyxFQUFpRDtBQUMvQyxNQUFJLENBQUMxQixJQUFMLEVBQVc7QUFDVCxXQUFPLElBQVA7QUFDRDs7QUFDRCxNQUFJWSxLQUFLLENBQUNDLE9BQU4sQ0FBY2IsSUFBZCxDQUFKLEVBQXlCO0FBQ3ZCLFdBQU9BLElBQUksQ0FBQ3FELEdBQUwsQ0FBUyxVQUFDMUMsRUFBRDtBQUFBLGFBQVFnQix1QkFBdUIsQ0FBQ2hCLEVBQUQsRUFBS2UsUUFBTCxDQUEvQjtBQUFBLEtBQVQsQ0FBUDtBQUNEOztBQUNELE1BQUlQLE1BQU0sQ0FBQ25CLElBQUksQ0FBQ2UsSUFBTixDQUFWLEVBQXVCO0FBQ3JCLFdBQU9XLFFBQVA7QUFDRDs7QUFDRCx5Q0FDSzFCLElBREw7QUFFRXlCLElBQUFBLEtBQUssa0NBQ0F6QixJQUFJLENBQUN5QixLQURMO0FBRUhELE1BQUFBLFFBQVEsRUFBRUcsdUJBQXVCLENBQUMzQixJQUFJLENBQUN5QixLQUFMLENBQVdELFFBQVosRUFBc0JFLFFBQXRCO0FBRjlCO0FBRlA7QUFPRDs7QUFFRCxJQUFNOEMsWUFBWSxHQUFHO0FBQ25CQyxFQUFBQSxTQUFTLEVBQUUsSUFEUTtBQUVuQkMsRUFBQUEsYUFBYSxFQUFFLElBRkk7QUFHbkJDLEVBQUFBLFFBQVEsRUFBRTtBQUhTLENBQXJCOztBQU1BLFNBQVNDLGtCQUFULEdBQThCO0FBQzVCO0FBQ0E7QUFDQTtBQUg0QixNQUt0QkMsVUFMc0I7QUFBQTs7QUFBQTs7QUFBQTtBQUFBOztBQUFBO0FBQUE7O0FBQUE7QUFBQTtBQUFBLCtCQU1qQjtBQUNQLGVBQU8sSUFBUDtBQUNEO0FBUnlCOztBQUFBO0FBQUEsSUFLSGhELGtCQUFNaUQsU0FMSDs7QUFVNUIsTUFBTUMsWUFBWSxHQUFHLElBQUlDLG1CQUFKLEVBQXJCO0FBQ0FELEVBQUFBLFlBQVksQ0FBQ0UsTUFBYixlQUFvQnBELGtCQUFNQyxhQUFOLENBQW9CK0MsVUFBcEIsQ0FBcEI7QUFDQSxTQUFPRSxZQUFZLENBQUNHLFNBQWIsQ0FBdUJDLEtBQTlCO0FBQ0Q7O0FBRUQsU0FBU0MsT0FBVCxDQUFpQkMsRUFBakIsRUFBcUI7QUFDbkIsTUFBSUMsU0FBSjs7QUFDQUMsd0JBQVVDLEdBQVYsQ0FBYyxZQUFNO0FBQUVGLElBQUFBLFNBQVMsR0FBR0QsRUFBRSxFQUFkO0FBQW1CLEdBQXpDOztBQUNBLFNBQU9DLFNBQVA7QUFDRDs7QUFFRCxTQUFTRyx1QkFBVCxDQUFpQ0MsUUFBakMsRUFBMkM7QUFDekM7QUFDQSxNQUFJLG1CQUFtQkEsUUFBUSxDQUFDQyxRQUFoQyxFQUEwQztBQUN4QyxXQUFPRCxRQUFRLENBQUNDLFFBQVQsQ0FBa0JDLGFBQXpCO0FBQ0Q7O0FBQ0QsTUFBSSxtQkFBbUJGLFFBQVEsQ0FBQ0MsUUFBaEMsRUFBMEM7QUFDeEMsV0FBT0QsUUFBUSxDQUFDQyxRQUFULENBQWtCRSxhQUF6QjtBQUNEOztBQUNELFFBQU0sSUFBSTVCLEtBQUosQ0FBVSw2RUFBVixDQUFOO0FBQ0Q7O0FBRUQsU0FBUzZCLGVBQVQsQ0FBeUIvRSxJQUF6QixFQUErQjtBQUM3QixTQUFPO0FBQUVnRixJQUFBQSxRQUFRLEVBQUVDLGdCQUFaO0FBQXFCakYsSUFBQUEsSUFBSSxFQUFKQTtBQUFyQixHQUFQO0FBQ0Q7O0FBRUQsU0FBU2tGLFVBQVQsQ0FBb0JuQixTQUFwQixFQUErQjtBQUM3QixTQUFPQSxTQUFTLENBQUNvQixTQUFWLEtBQ0xwQixTQUFTLENBQUNvQixTQUFWLENBQW9CQyxnQkFBcEIsSUFDR3ZGLEtBQUssQ0FBQ0MsT0FBTixDQUFjaUUsU0FBUyxDQUFDc0Isb0JBQXhCLENBRkUsQ0FFNEM7QUFGNUMsR0FBUDtBQUlEOztJQUVLQyxxQjs7Ozs7QUFDSixtQ0FBYztBQUFBOztBQUFBOztBQUNaO0FBRFksUUFFSkMsVUFGSSxHQUVXLE1BQUtDLE9BRmhCLENBRUpELFVBRkk7QUFHWixVQUFLQyxPQUFMLG1DQUNLLE1BQUtBLE9BRFY7QUFFRUMsTUFBQUEsa0NBQWtDLEVBQUUsSUFGdEM7QUFFNEM7QUFDMUNDLE1BQUFBLGlCQUFpQixFQUFFLFFBSHJCO0FBSUVILE1BQUFBLFVBQVUsa0NBQ0xBLFVBREs7QUFFUkksUUFBQUEsa0JBQWtCLEVBQUU7QUFDbEJDLFVBQUFBLFVBQVUsRUFBRTtBQURNLFNBRlo7QUFLUkMsUUFBQUEsd0JBQXdCLEVBQUU7QUFDeEJDLFVBQUFBLDJCQUEyQixFQUFFO0FBREwsU0FMbEI7QUFRUkMsUUFBQUEsdUJBQXVCLEVBQUUsSUFSakI7QUFTUkMsUUFBQUEsUUFBUSxFQUFFO0FBQ1JDLFVBQUFBLGdDQUFnQyxFQUFFO0FBRDFCLFNBVEY7QUFZUkMsUUFBQUEsZUFBZSxFQUFFO0FBQ2ZDLFVBQUFBLGdCQUFnQixFQUFFO0FBREgsU0FaVDtBQWVSQyxRQUFBQSx3QkFBd0IsRUFBRTtBQWZsQjtBQUpaO0FBSFk7QUF5QmI7Ozs7d0NBRW1CWixPLEVBQVM7QUFDM0Isa0RBQW1CLE9BQW5COztBQUNBLFVBQUkscUJBQUlBLE9BQUosRUFBYSxrQkFBYixDQUFKLEVBQXNDO0FBQ3BDLGNBQU0sSUFBSWEsU0FBSixDQUFjLDZEQUFkLENBQU47QUFDRDs7QUFDRCxVQUFJeEgsU0FBUyxLQUFLLElBQWxCLEVBQXdCO0FBQ3RCO0FBQ0FBLFFBQUFBLFNBQVMsR0FBRyxrQ0FBWjtBQUNEOztBQVIwQixVQVNuQnlILFFBVG1CLEdBUzZCZCxPQVQ3QixDQVNuQmMsUUFUbUI7QUFBQSxVQVNUQyxTQVRTLEdBUzZCZixPQVQ3QixDQVNUZSxTQVRTO0FBQUEsVUFTRUMsc0JBVEYsR0FTNkJoQixPQVQ3QixDQVNFZ0Isc0JBVEY7QUFVM0IsVUFBTUMsT0FBTyxHQUFHRixTQUFTLElBQUlELFFBQWIsSUFBeUJJLE1BQU0sQ0FBQ0MsUUFBUCxDQUFnQjVGLGFBQWhCLENBQThCLEtBQTlCLENBQXpDO0FBQ0EsVUFBSU0sUUFBUSxHQUFHLElBQWY7QUFDQSxVQUFNdUYsT0FBTyxHQUFHLElBQWhCO0FBQ0EsYUFBTztBQUNMMUMsUUFBQUEsTUFESyxrQkFDRXRFLEVBREYsRUFDTWlILE9BRE4sRUFDZUMsUUFEZixFQUN5QjtBQUM1QixpQkFBT3pDLE9BQU8sQ0FBQyxZQUFNO0FBQ25CLGdCQUFJaEQsUUFBUSxLQUFLLElBQWpCLEVBQXVCO0FBQUEsa0JBQ2JyQixJQURhLEdBQ1FKLEVBRFIsQ0FDYkksSUFEYTtBQUFBLGtCQUNQVSxLQURPLEdBQ1FkLEVBRFIsQ0FDUGMsS0FETztBQUFBLGtCQUNBVSxHQURBLEdBQ1F4QixFQURSLENBQ0F3QixHQURBOztBQUVyQixrQkFBTTJGLFlBQVk7QUFDaEJoRCxnQkFBQUEsU0FBUyxFQUFFL0QsSUFESztBQUVoQlUsZ0JBQUFBLEtBQUssRUFBTEEsS0FGZ0I7QUFHaEI4RixnQkFBQUEsc0JBQXNCLEVBQXRCQSxzQkFIZ0I7QUFJaEJLLGdCQUFBQSxPQUFPLEVBQVBBO0FBSmdCLGlCQUtaekYsR0FBRyxJQUFJO0FBQUU0RixnQkFBQUEsT0FBTyxFQUFFNUY7QUFBWCxlQUxLLENBQWxCOztBQU9BLGtCQUFNNkYscUJBQXFCLEdBQUcsNENBQW1CckgsRUFBbkIsa0NBQTRCNEYsT0FBNUI7QUFBcUNvQixnQkFBQUEsT0FBTyxFQUFQQTtBQUFyQyxpQkFBOUI7O0FBQ0Esa0JBQU1NLFNBQVMsZ0JBQUdwRyxrQkFBTUMsYUFBTixDQUFvQmtHLHFCQUFwQixFQUEyQ0YsWUFBM0MsQ0FBbEI7O0FBQ0ExRixjQUFBQSxRQUFRLEdBQUdrRixTQUFTLEdBQ2hCaEQscUJBQVM0RCxPQUFULENBQWlCRCxTQUFqQixFQUE0QlQsT0FBNUIsQ0FEZ0IsR0FFaEJsRCxxQkFBU1csTUFBVCxDQUFnQmdELFNBQWhCLEVBQTJCVCxPQUEzQixDQUZKOztBQUdBLGtCQUFJLE9BQU9LLFFBQVAsS0FBb0IsVUFBeEIsRUFBb0M7QUFDbENBLGdCQUFBQSxRQUFRO0FBQ1Q7QUFDRixhQWpCRCxNQWlCTztBQUNMekYsY0FBQUEsUUFBUSxDQUFDK0YsYUFBVCxDQUF1QnhILEVBQUUsQ0FBQ2MsS0FBMUIsRUFBaUNtRyxPQUFqQyxFQUEwQ0MsUUFBMUM7QUFDRDtBQUNGLFdBckJhLENBQWQ7QUFzQkQsU0F4Qkk7QUF5QkxPLFFBQUFBLE9BekJLLHFCQXlCSztBQUNSOUQsK0JBQVMrRCxzQkFBVCxDQUFnQ2IsT0FBaEM7O0FBQ0FwRixVQUFBQSxRQUFRLEdBQUcsSUFBWDtBQUNELFNBNUJJO0FBNkJMa0csUUFBQUEsT0E3QksscUJBNkJLO0FBQ1IsY0FBSSxDQUFDbEcsUUFBTCxFQUFlO0FBQ2IsbUJBQU8sSUFBUDtBQUNEOztBQUNELGlCQUFPLCtDQUNMdUYsT0FBTyxDQUFDWSxpQkFESCxFQUVMakcsT0FBTSxDQUFDRixRQUFRLENBQUNvRyxlQUFWLENBRkQsRUFHTGpDLE9BSEssQ0FBUDtBQUtELFNBdENJO0FBdUNMa0MsUUFBQUEsYUF2Q0sseUJBdUNTQyxhQXZDVCxFQXVDd0JDLFFBdkN4QixFQXVDa0NDLEtBdkNsQyxFQXVDeUM7QUFDNUMsY0FBTUMsZUFBZSxHQUFHLFNBQWxCQSxlQUFrQixRQUFvQztBQUFBLGdCQUF2QkMsVUFBdUIsU0FBakMxRyxRQUFpQztBQUFBLGdCQUFYckIsSUFBVyxTQUFYQSxJQUFXOztBQUMxRCxnQkFBSUEsSUFBSSxJQUFJQSxJQUFJLENBQUNvRyx3QkFBakIsRUFBMkM7QUFDekMscUJBQU8sSUFBUDtBQUNEOztBQUNELG1CQUFPMkIsVUFBVSxJQUFJQSxVQUFVLENBQUNDLGlCQUFoQztBQUNELFdBTEQ7O0FBRDRDLHNCQVd4Q0wsYUFBYSxDQUFDTSxJQUFkLENBQW1CSCxlQUFuQixLQUF1QyxFQVhDO0FBQUEsY0FTaENJLGdCQVRnQyxTQVMxQzdHLFFBVDBDO0FBQUEsY0FVcEM4RyxZQVZvQyxTQVUxQ25JLElBVjBDOztBQWE1QyxpREFDRTZILEtBREYsRUFFRUssZ0JBRkYsRUFHRU4sUUFIRixFQUlFRCxhQUpGLEVBS0U1SCxnQkFMRixFQU1FNkcsT0FBTyxDQUFDd0IsaUJBTlYsRUFPRUQsWUFQRjtBQVNELFNBN0RJO0FBOERMRSxRQUFBQSxhQTlESyx5QkE4RFNwSixJQTlEVCxFQThEZXFKLEtBOURmLEVBOERzQkMsSUE5RHRCLEVBOEQ0QjtBQUMvQixjQUFNQyxXQUFXLEdBQUcsNkNBQW9CRixLQUFwQixFQUEyQjdFLFlBQTNCLENBQXBCO0FBQ0EsY0FBTWdGLE9BQU8sR0FBR2pFLHNCQUFVa0UsUUFBVixDQUFtQkYsV0FBbkIsQ0FBaEI7O0FBQ0EsY0FBSSxDQUFDQyxPQUFMLEVBQWM7QUFDWixrQkFBTSxJQUFJcEMsU0FBSiwyQ0FBaURpQyxLQUFqRCxzQkFBTjtBQUNEOztBQUNEakUsVUFBQUEsT0FBTyxDQUFDLFlBQU07QUFDWm9FLFlBQUFBLE9BQU8sQ0FBQzdCLE9BQU8sQ0FBQ3pELGNBQVIsQ0FBdUJsRSxJQUF2QixDQUFELEVBQStCc0osSUFBL0IsQ0FBUDtBQUNELFdBRk0sQ0FBUDtBQUdELFNBdkVJO0FBd0VMSSxRQUFBQSxjQXhFSywwQkF3RVVyRSxFQXhFVixFQXdFYztBQUNqQixpQkFBT0EsRUFBRSxFQUFULENBRGlCLENBRWpCO0FBQ0QsU0EzRUk7QUE0RUxzRSxRQUFBQSw0QkE1RUssMENBNEUwQjtBQUM3QixpREFDSyxJQURMLEdBRUssMkRBQWtDO0FBQ25DckgsWUFBQUEsTUFBTSxFQUFFLGdCQUFDc0gsSUFBRDtBQUFBLHFCQUFVdEgsT0FBTSxDQUFDc0gsSUFBSSxDQUFDcEIsZUFBTixDQUFoQjtBQUFBLGFBRDJCO0FBRW5DcUIsWUFBQUEsdUJBQXVCLEVBQUU7QUFBQSxxQkFBTXpILFFBQU47QUFBQTtBQUZVLFdBQWxDLENBRkw7QUFPRCxTQXBGSTtBQXFGTDBILFFBQUFBLFVBQVUsRUFBRTFFO0FBckZQLE9BQVA7QUF1RkQ7Ozs0Q0FFbUM7QUFBQTs7QUFBQSxVQUFkbUIsT0FBYyx1RUFBSixFQUFJO0FBQ2xDLFVBQU1vQixPQUFPLEdBQUcsSUFBaEI7QUFDQSxVQUFNb0MsUUFBUSxHQUFHLElBQUkvRSxtQkFBSixFQUFqQjtBQUZrQyxVQUcxQnpELGdCQUgwQixHQUdMZ0YsT0FISyxDQUcxQmhGLGdCQUgwQjs7QUFJbEMsVUFBSSxPQUFPQSxnQkFBUCxLQUE0QixXQUE1QixJQUEyQyxPQUFPQSxnQkFBUCxLQUE0QixTQUEzRSxFQUFzRjtBQUNwRixjQUFNNkYsU0FBUyxDQUFDLDJEQUFELENBQWY7QUFDRDs7QUFDRCxVQUFJNEMsS0FBSyxHQUFHLEtBQVo7QUFDQSxVQUFJQyxVQUFVLEdBQUcsSUFBakI7QUFFQSxVQUFJQyxhQUFhLEdBQUcsSUFBcEI7QUFDQSxVQUFJQyxnQkFBZ0IsR0FBRyxJQUF2QjtBQUNBLFVBQU1DLFFBQVEsR0FBRyxFQUFqQixDQVprQyxDQWNsQzs7QUFDQSxVQUFNQyxpQkFBaUIsR0FBRyxTQUFwQkEsaUJBQW9CLENBQUN2RixTQUFELEVBQVl3RixPQUFaLEVBQXdCO0FBQ2hELFlBQUlKLGFBQWEsS0FBS3BGLFNBQXRCLEVBQWlDO0FBQy9CLGNBQUltQixVQUFVLENBQUNuQixTQUFELENBQWQsRUFBMkI7QUFDekJxRixZQUFBQSxnQkFBZ0I7QUFBQTs7QUFBQTs7QUFBQTtBQUFBOztBQUFBO0FBQUE7O0FBQUE7QUFBQSxjQUFpQnJGLFNBQWpCLENBQWhCOztBQUNBLGdCQUFJd0YsT0FBSixFQUFhO0FBQ1hILGNBQUFBLGdCQUFnQixDQUFDakUsU0FBakIsQ0FBMkJxRSxxQkFBM0IsR0FBbUQsVUFBQ0MsU0FBRDtBQUFBLHVCQUNqRCxDQUFDRixPQUFPLENBQUMsTUFBSSxDQUFDN0ksS0FBTixFQUFhK0ksU0FBYixDQUR5QztBQUFBLGVBQW5EO0FBR0QsYUFKRCxNQUlPO0FBQ0xMLGNBQUFBLGdCQUFnQixDQUFDakUsU0FBakIsQ0FBMkJ1RSxvQkFBM0IsR0FBa0QsSUFBbEQ7QUFDRDtBQUNGLFdBVEQsTUFTTztBQUNMLGdCQUFJQyxRQUFRLEdBQUdOLFFBQWY7QUFDQSxnQkFBSU8sU0FBSjs7QUFDQVIsWUFBQUEsZ0JBQWdCLEdBQUcsU0FBU1Msa0JBQVQsQ0FBNEJuSixLQUE1QixFQUE0QztBQUM3RCxrQkFBTW9KLFlBQVksR0FBR0gsUUFBUSxLQUFLTixRQUFiLEtBQTBCRSxPQUFPLEdBQ2xELENBQUNBLE9BQU8sQ0FBQ0ssU0FBRCxFQUFZbEosS0FBWixDQUQwQyxHQUVsRCxDQUFDLG9DQUFha0osU0FBYixFQUF3QmxKLEtBQXhCLENBRmdCLENBQXJCOztBQUlBLGtCQUFJb0osWUFBSixFQUFrQjtBQUFBLGtEQUxxQ0MsSUFLckM7QUFMcUNBLGtCQUFBQSxJQUtyQztBQUFBOztBQUNoQkosZ0JBQUFBLFFBQVEsR0FBRzVGLFNBQVMsTUFBVCwwQ0FBZUEsU0FBUyxDQUFDaUcsWUFBekIsR0FBMEN0SixLQUExQyxVQUFzRHFKLElBQXRELEVBQVg7QUFDQUgsZ0JBQUFBLFNBQVMsR0FBR2xKLEtBQVo7QUFDRDs7QUFDRCxxQkFBT2lKLFFBQVA7QUFDRCxhQVZEO0FBV0Q7O0FBQ0Qsa0NBQ0VQLGdCQURGLEVBRUVyRixTQUZGLEVBR0U7QUFBRWtHLFlBQUFBLFdBQVcsRUFBRXJELE9BQU8sQ0FBQ3dCLGlCQUFSLENBQTBCO0FBQUVwSSxjQUFBQSxJQUFJLEVBQUUrRDtBQUFSLGFBQTFCO0FBQWYsV0FIRjtBQUtBb0YsVUFBQUEsYUFBYSxHQUFHcEYsU0FBaEI7QUFDRDs7QUFDRCxlQUFPcUYsZ0JBQVA7QUFDRCxPQWxDRCxDQWZrQyxDQW1EbEM7QUFDQTs7O0FBQ0EsVUFBTWMsdUJBQXVCLEdBQUcsU0FBMUJBLHVCQUEwQixDQUFDbkcsU0FBRCxFQUFlO0FBQzdDLFlBQUkscUJBQUlBLFNBQUosRUFBZSxjQUFmLENBQUosRUFBb0M7QUFDbEMsY0FBSW9GLGFBQWEsS0FBS3BGLFNBQXRCLEVBQWlDO0FBQy9CcUYsWUFBQUEsZ0JBQWdCLEdBQUcseUJBQ2pCO0FBQ0Esc0JBQUMxSSxLQUFEO0FBQUEsaURBQVdxSixJQUFYO0FBQVdBLGdCQUFBQSxJQUFYO0FBQUE7O0FBQUEscUJBQW9CaEcsU0FBUyxNQUFULDBDQUFlQSxTQUFTLENBQUNpRyxZQUF6QixHQUEwQ3RKLEtBQTFDLFVBQXNEcUosSUFBdEQsRUFBcEI7QUFBQSxhQUZpQixFQUdqQmhHLFNBSGlCLEVBSWpCO0FBQUVrRyxjQUFBQSxXQUFXLEVBQUVyRCxPQUFPLENBQUN3QixpQkFBUixDQUEwQjtBQUFFcEksZ0JBQUFBLElBQUksRUFBRStEO0FBQVIsZUFBMUI7QUFBZixhQUppQixDQUFuQjtBQU1Bb0YsWUFBQUEsYUFBYSxHQUFHcEYsU0FBaEI7QUFDRDs7QUFDRCxpQkFBT3FGLGdCQUFQO0FBQ0Q7O0FBRUQsZUFBT3JGLFNBQVA7QUFDRCxPQWZEOztBQWlCQSxVQUFNb0csYUFBYSxHQUFHLFNBQWhCQSxhQUFnQixDQUFDQyxRQUFELEVBQXVCO0FBQUEsMkNBQVRDLElBQVM7QUFBVEEsVUFBQUEsSUFBUztBQUFBOztBQUMzQyxZQUFNQyxVQUFVLEdBQUd0QixRQUFRLENBQUM5RSxNQUFULE9BQUE4RSxRQUFRLEdBQVFvQixRQUFSLFNBQXFCQyxJQUFyQixFQUEzQjtBQUVBLFlBQU1FLGFBQWEsR0FBRyxDQUFDLEVBQUVELFVBQVUsSUFBSUEsVUFBVSxDQUFDdEssSUFBM0IsQ0FBdkI7O0FBQ0EsWUFBSXVLLGFBQUosRUFBbUI7QUFDakIsY0FBTUMsUUFBUSxHQUFHakssOEJBQThCLENBQUMrSixVQUFELEVBQWE7QUFBRTlKLFlBQUFBLGdCQUFnQixFQUFoQkE7QUFBRixXQUFiLENBQS9DO0FBRUEsY0FBTWlLLGdCQUFnQixHQUFHRCxRQUFRLENBQUN4SyxJQUFULEtBQWtCc0ssVUFBVSxDQUFDdEssSUFBdEQ7O0FBQ0EsY0FBSXlLLGdCQUFKLEVBQXNCO0FBQ3BCLG1CQUFPekIsUUFBUSxDQUFDOUUsTUFBVCxPQUFBOEUsUUFBUSxtQ0FBYW9CLFFBQWI7QUFBdUJwSyxjQUFBQSxJQUFJLEVBQUV3SyxRQUFRLENBQUN4SztBQUF0Qyx1QkFBaURxSyxJQUFqRCxFQUFmO0FBQ0Q7QUFDRjs7QUFFRCxlQUFPQyxVQUFQO0FBQ0QsT0FkRDs7QUFnQkEsYUFBTztBQUNMcEcsUUFBQUEsTUFESyxrQkFDRXRFLEVBREYsRUFDTThLLGVBRE4sRUFHRztBQUFBLDBGQUFKLEVBQUk7QUFBQSwyQ0FETkMsY0FDTTtBQUFBLGNBRE5BLGNBQ00scUNBRFcsSUFBSUMsR0FBSixFQUNYOztBQUNOMUIsVUFBQUEsVUFBVSxHQUFHdEosRUFBYjtBQUNBOztBQUNBLGNBQUksT0FBT0EsRUFBRSxDQUFDSSxJQUFWLEtBQW1CLFFBQXZCLEVBQWlDO0FBQy9CaUosWUFBQUEsS0FBSyxHQUFHLElBQVI7QUFDRCxXQUZELE1BRU8sSUFBSSxnQ0FBa0JySixFQUFsQixDQUFKLEVBQTJCO0FBQ2hDK0ssWUFBQUEsY0FBYyxDQUFDRSxHQUFmLENBQW1CakwsRUFBRSxDQUFDSSxJQUF0QixFQUE0QkosRUFBRSxDQUFDYyxLQUFILENBQVNvSyxLQUFyQztBQUNBLGdCQUFNQyxZQUFZLEdBQUcsd0JBQ25CLFVBQUNySyxLQUFEO0FBQUEscUJBQVdBLEtBQUssQ0FBQ0QsUUFBakI7QUFBQSxhQURtQixFQUVuQmIsRUFBRSxDQUFDSSxJQUZnQixDQUFyQjtBQUlBLG1CQUFPLDZDQUFvQjtBQUFBLHFCQUFNbUssYUFBYSxpQ0FBTXZLLEVBQU47QUFBVUksZ0JBQUFBLElBQUksRUFBRStLO0FBQWhCLGlCQUFuQjtBQUFBLGFBQXBCLENBQVA7QUFDRCxXQVBNLE1BT0EsSUFBSSxnQ0FBa0JuTCxFQUFsQixDQUFKLEVBQTJCO0FBQ2hDLGdCQUFNK0UsUUFBUSxHQUFHaUMsT0FBTyxDQUFDb0UsdUJBQVIsQ0FBZ0NwTCxFQUFFLENBQUNJLElBQW5DLENBQWpCO0FBQ0EsZ0JBQU04SyxLQUFLLEdBQUdILGNBQWMsQ0FBQ00sR0FBZixDQUFtQnRHLFFBQW5CLElBQ1ZnRyxjQUFjLENBQUNPLEdBQWYsQ0FBbUJ2RyxRQUFuQixDQURVLEdBRVZELHVCQUF1QixDQUFDQyxRQUFELENBRjNCO0FBR0EsZ0JBQU13RyxZQUFZLEdBQUcsd0JBQ25CLFVBQUN6SyxLQUFEO0FBQUEscUJBQVdBLEtBQUssQ0FBQ0QsUUFBTixDQUFlcUssS0FBZixDQUFYO0FBQUEsYUFEbUIsRUFFbkJsTCxFQUFFLENBQUNJLElBRmdCLENBQXJCO0FBSUEsbUJBQU8sNkNBQW9CO0FBQUEscUJBQU1tSyxhQUFhLGlDQUFNdkssRUFBTjtBQUFVSSxnQkFBQUEsSUFBSSxFQUFFbUw7QUFBaEIsaUJBQW5CO0FBQUEsYUFBcEIsQ0FBUDtBQUNELFdBVk0sTUFVQTtBQUNMbEMsWUFBQUEsS0FBSyxHQUFHLEtBQVI7QUFDQSxnQkFBSXFCLFVBQVUsR0FBRzFLLEVBQWpCOztBQUNBLGdCQUFJUSxNQUFNLENBQUNrSyxVQUFELENBQVYsRUFBd0I7QUFDdEIsb0JBQU1qRSxTQUFTLENBQUMscURBQUQsQ0FBZjtBQUNEOztBQUVEaUUsWUFBQUEsVUFBVSxHQUFHL0osOEJBQThCLENBQUMrSixVQUFELEVBQWE7QUFBRTlKLGNBQUFBLGdCQUFnQixFQUFoQkE7QUFBRixhQUFiLENBQTNDO0FBUEssOEJBUXVCOEosVUFSdkI7QUFBQSxnQkFRU3ZHLFNBUlQsZUFRRy9ELElBUkg7QUFVTCxnQkFBTTZHLE9BQU8sR0FBRywwQ0FBaUI5QyxTQUFTLENBQUNxSCxZQUEzQixFQUF5Q1YsZUFBekMsQ0FBaEI7O0FBRUEsZ0JBQUl4SyxNQUFNLENBQUNOLEVBQUUsQ0FBQ0ksSUFBSixDQUFWLEVBQXFCO0FBQUEsNkJBQ2tCSixFQUFFLENBQUNJLElBRHJCO0FBQUEsa0JBQ0xxTCxTQURLLFlBQ1hyTCxJQURXO0FBQUEsa0JBQ011SixPQUROLFlBQ01BLE9BRE47QUFHbkIscUJBQU8sNkNBQW9CO0FBQUEsdUJBQU1ZLGFBQWEsaUNBQ3ZDdkssRUFEdUM7QUFDbkNJLGtCQUFBQSxJQUFJLEVBQUVzSixpQkFBaUIsQ0FBQytCLFNBQUQsRUFBWTlCLE9BQVo7QUFEWSxvQkFFNUMxQyxPQUY0QyxDQUFuQjtBQUFBLGVBQXBCLENBQVA7QUFJRDs7QUFFRCxnQkFBSSxDQUFDM0IsVUFBVSxDQUFDbkIsU0FBRCxDQUFYLElBQTBCLE9BQU9BLFNBQVAsS0FBcUIsVUFBbkQsRUFBK0Q7QUFDN0QscUJBQU8sNkNBQW9CO0FBQUEsdUJBQU1vRyxhQUFhLGlDQUN2Q0csVUFEdUM7QUFDM0J0SyxrQkFBQUEsSUFBSSxFQUFFa0ssdUJBQXVCLENBQUNuRyxTQUFEO0FBREYsb0JBRTVDOEMsT0FGNEMsQ0FBbkI7QUFBQSxlQUFwQixDQUFQO0FBSUQ7O0FBRUQsZ0JBQUkzQixVQUFKLEVBQWdCO0FBQ2Q7QUFDQSxrQkFBTW9HLGVBQWUsR0FBR3pILGtCQUFrQixFQUExQzs7QUFDQSxrQkFBSXlILGVBQUosRUFBcUI7QUFDbkJDLGdCQUFBQSxNQUFNLENBQUNDLGNBQVAsQ0FBc0J6SCxTQUFTLENBQUNvQixTQUFoQyxFQUEyQyxPQUEzQyxFQUFvRDtBQUNsRHNHLGtCQUFBQSxZQUFZLEVBQUUsSUFEb0M7QUFFbERDLGtCQUFBQSxVQUFVLEVBQUUsSUFGc0M7QUFHbERSLGtCQUFBQSxHQUhrRCxpQkFHNUM7QUFDSiwyQkFBTyxJQUFQO0FBQ0QsbUJBTGlEO0FBTWxETCxrQkFBQUEsR0FOa0QsZUFNOUNDLEtBTjhDLEVBTXZDO0FBQ1Qsd0JBQUlBLEtBQUssS0FBS1EsZUFBZCxFQUErQjtBQUM3QkMsc0JBQUFBLE1BQU0sQ0FBQ0MsY0FBUCxDQUFzQixJQUF0QixFQUE0QixPQUE1QixFQUFxQztBQUNuQ0Msd0JBQUFBLFlBQVksRUFBRSxJQURxQjtBQUVuQ0Msd0JBQUFBLFVBQVUsRUFBRSxJQUZ1QjtBQUduQ1osd0JBQUFBLEtBQUssRUFBTEEsS0FIbUM7QUFJbkNhLHdCQUFBQSxRQUFRLEVBQUU7QUFKeUIsdUJBQXJDO0FBTUQ7O0FBQ0QsMkJBQU8sSUFBUDtBQUNEO0FBaEJpRCxpQkFBcEQ7QUFrQkQ7QUFDRjs7QUFDRCxtQkFBTyw2Q0FBb0I7QUFBQSxxQkFBTXhCLGFBQWEsQ0FBQ0csVUFBRCxFQUFhekQsT0FBYixDQUFuQjtBQUFBLGFBQXBCLENBQVA7QUFDRDtBQUNGLFNBL0VJO0FBZ0ZMUSxRQUFBQSxPQWhGSyxxQkFnRks7QUFDUjJCLFVBQUFBLFFBQVEsQ0FBQzNCLE9BQVQ7QUFDRCxTQWxGSTtBQW1GTEUsUUFBQUEsT0FuRksscUJBbUZLO0FBQ1IsY0FBSTBCLEtBQUosRUFBVztBQUNULG1CQUFPakksYUFBYSxDQUFDa0ksVUFBRCxDQUFwQjtBQUNEOztBQUNELGNBQU0wQyxNQUFNLEdBQUc1QyxRQUFRLENBQUM2QyxlQUFULEVBQWY7QUFDQSxpQkFBTztBQUNMM0ssWUFBQUEsUUFBUSxFQUFFbkIsZ0JBQWdCLENBQUNtSixVQUFVLENBQUNsSixJQUFaLENBRHJCO0FBRUxBLFlBQUFBLElBQUksRUFBRWtKLFVBQVUsQ0FBQ2xKLElBRlo7QUFHTFUsWUFBQUEsS0FBSyxFQUFFd0ksVUFBVSxDQUFDeEksS0FIYjtBQUlMUyxZQUFBQSxHQUFHLEVBQUUsOENBQXFCK0gsVUFBVSxDQUFDL0gsR0FBaEMsQ0FKQTtBQUtMQyxZQUFBQSxHQUFHLEVBQUU4SCxVQUFVLENBQUM5SCxHQUxYO0FBTUxDLFlBQUFBLFFBQVEsRUFBRTJILFFBQVEsQ0FBQzdFLFNBTmQ7QUFPTDdDLFlBQUFBLFFBQVEsRUFBRXpCLEtBQUssQ0FBQ0MsT0FBTixDQUFjOEwsTUFBZCxJQUNOeE0sT0FBTyxDQUFDd00sTUFBRCxDQUFQLENBQWdCdEosR0FBaEIsQ0FBb0IsVUFBQzFDLEVBQUQ7QUFBQSxxQkFBUW9CLGFBQWEsQ0FBQ3BCLEVBQUQsQ0FBckI7QUFBQSxhQUFwQixDQURNLEdBRU5vQixhQUFhLENBQUM0SyxNQUFEO0FBVFosV0FBUDtBQVdELFNBbkdJO0FBb0dMbEUsUUFBQUEsYUFwR0sseUJBb0dTQyxhQXBHVCxFQW9Hd0JDLFFBcEd4QixFQW9Ha0NDLEtBcEdsQyxFQW9HeUM7QUFDNUMsaURBQ0VBLEtBREYsRUFFRW1CLFFBQVEsQ0FBQzdFLFNBRlgsRUFHRStFLFVBSEYsRUFJRXZCLGFBQWEsQ0FBQ21FLE1BQWQsQ0FBcUI1QyxVQUFyQixDQUpGLEVBS0VuSixnQkFMRixFQU1FNkcsT0FBTyxDQUFDd0IsaUJBTlYsRUFPRWMsVUFBVSxDQUFDbEosSUFQYjtBQVNELFNBOUdJO0FBK0dMcUksUUFBQUEsYUEvR0sseUJBK0dTcEosSUEvR1QsRUErR2VxSixLQS9HZixFQStHK0I7QUFBQSw2Q0FBTnlCLElBQU07QUFBTkEsWUFBQUEsSUFBTTtBQUFBOztBQUNsQyxjQUFNZ0MsT0FBTyxHQUFHOU0sSUFBSSxDQUFDeUIsS0FBTCxDQUFXLHVDQUFjNEgsS0FBZCxFQUFxQjdFLFlBQXJCLENBQVgsQ0FBaEI7O0FBQ0EsY0FBSXNJLE9BQUosRUFBYTtBQUNYLHlEQUFvQixZQUFNO0FBQ3hCO0FBQ0E7QUFDQTtBQUNBQSxjQUFBQSxPQUFPLE1BQVAsU0FBV2hDLElBQVgsRUFKd0IsQ0FLeEI7QUFDRCxhQU5EO0FBT0Q7QUFDRixTQTFISTtBQTJITHBCLFFBQUFBLGNBM0hLLDBCQTJIVXJFLEVBM0hWLEVBMkhjO0FBQ2pCLGlCQUFPQSxFQUFFLEVBQVQsQ0FEaUIsQ0FFakI7QUFDRCxTQTlISTtBQStITDBILFFBQUFBLGNBL0hLLDBCQStIVUMsU0EvSFYsRUErSHFCQyxNQS9IckIsRUErSDZCQyxRQS9IN0IsRUErSHVDQyxTQS9IdkMsRUErSGtEO0FBQ3JELGlCQUFPLGlDQUNMSCxTQURLLEVBRUxDLE1BRkssRUFHTEMsUUFISyxFQUlMLDJDQUFrQmpELFVBQWxCLENBSkssRUFLTDtBQUFBLG1CQUFNLDJDQUFrQmtELFNBQVMsQ0FBQ04sTUFBVixDQUFpQixDQUFDNUMsVUFBRCxDQUFqQixDQUFsQixDQUFOO0FBQUEsV0FMSyxDQUFQO0FBT0Q7QUF2SUksT0FBUDtBQXlJRDs7O3lDQUVvQjFELE8sRUFBUztBQUM1QixVQUFJLHFCQUFJQSxPQUFKLEVBQWEsa0JBQWIsQ0FBSixFQUFzQztBQUNwQyxjQUFNLElBQUlhLFNBQUosQ0FBYywwRUFBZCxDQUFOO0FBQ0Q7O0FBQ0QsYUFBTztBQUNMbkMsUUFBQUEsTUFESyxrQkFDRXRFLEVBREYsRUFDTWlILE9BRE4sRUFDZTtBQUNsQixjQUFJckIsT0FBTyxDQUFDcUIsT0FBUixLQUFvQmpILEVBQUUsQ0FBQ0ksSUFBSCxDQUFRb0wsWUFBUixJQUF3QjVGLE9BQU8sQ0FBQzZHLGlCQUFwRCxDQUFKLEVBQTRFO0FBQzFFLGdCQUFNQSxpQkFBaUIsbUNBQ2pCek0sRUFBRSxDQUFDSSxJQUFILENBQVFvTCxZQUFSLElBQXdCLEVBRFAsR0FFbEI1RixPQUFPLENBQUM2RyxpQkFGVSxDQUF2Qjs7QUFJQSxnQkFBTUMsY0FBYyxHQUFHLDZDQUFvQjFNLEVBQXBCLEVBQXdCaUgsT0FBeEIsRUFBaUN3RixpQkFBakMsQ0FBdkI7QUFDQSxtQkFBT0UsbUJBQWVDLG9CQUFmLGVBQW9DMUwsa0JBQU1DLGFBQU4sQ0FBb0J1TCxjQUFwQixDQUFwQyxDQUFQO0FBQ0Q7O0FBQ0QsaUJBQU9DLG1CQUFlQyxvQkFBZixDQUFvQzVNLEVBQXBDLENBQVA7QUFDRDtBQVhJLE9BQVA7QUFhRCxLLENBRUQ7QUFDQTtBQUNBOzs7O21DQUNlNEYsTyxFQUFTO0FBQ3RCLGNBQVFBLE9BQU8sQ0FBQ2lILElBQWhCO0FBQ0UsYUFBS0Msc0JBQWNDLEtBQWQsQ0FBb0JDLEtBQXpCO0FBQWdDLGlCQUFPLEtBQUtDLG1CQUFMLENBQXlCckgsT0FBekIsQ0FBUDs7QUFDaEMsYUFBS2tILHNCQUFjQyxLQUFkLENBQW9CRyxPQUF6QjtBQUFrQyxpQkFBTyxLQUFLQyxxQkFBTCxDQUEyQnZILE9BQTNCLENBQVA7O0FBQ2xDLGFBQUtrSCxzQkFBY0MsS0FBZCxDQUFvQkssTUFBekI7QUFBaUMsaUJBQU8sS0FBS0Msb0JBQUwsQ0FBMEJ6SCxPQUExQixDQUFQOztBQUNqQztBQUNFLGdCQUFNLElBQUl0QyxLQUFKLHFEQUF1RHNDLE9BQU8sQ0FBQ2lILElBQS9ELEVBQU47QUFMSjtBQU9EOzs7eUJBRUlTLE8sRUFBUztBQUNaLGFBQU8sOEJBQUtBLE9BQUwsQ0FBUDtBQUNELEssQ0FFRDtBQUNBO0FBQ0E7QUFDQTs7OztrQ0FDY2pPLEksRUFBTTtBQUNsQixVQUFJLENBQUNBLElBQUQsSUFBUyxRQUFPQSxJQUFQLE1BQWdCLFFBQTdCLEVBQXVDLE9BQU8sSUFBUDtBQURyQixVQUVWZSxJQUZVLEdBRURmLElBRkMsQ0FFVmUsSUFGVTtBQUdsQiwwQkFBT2Msa0JBQU1DLGFBQU4sQ0FBb0JULFVBQVUsQ0FBQ04sSUFBRCxDQUE5QixFQUFzQyw2Q0FBb0JmLElBQXBCLENBQXRDLENBQVA7QUFDRCxLLENBRUQ7Ozs7dUNBQ21CQSxJLEVBQU1rTyxZLEVBQWM7QUFDckMsVUFBSSxDQUFDbE8sSUFBTCxFQUFXO0FBQ1QsZUFBT0EsSUFBUDtBQUNEOztBQUhvQyxVQUk3QmUsSUFKNkIsR0FJcEJmLElBSm9CLENBSTdCZSxJQUo2QjtBQUtyQyxhQUFPTSxVQUFVLENBQUNOLElBQUQsQ0FBVixLQUFxQk0sVUFBVSxDQUFDNk0sWUFBRCxDQUF0QztBQUNEOzs7a0NBRWFELE8sRUFBUztBQUNyQixhQUFPbE0sYUFBYSxDQUFDa00sT0FBRCxDQUFwQjtBQUNEOzs7bUNBRWNqTyxJLEVBQTZCO0FBQUEsVUFBdkJtTyxhQUF1Qix1RUFBUCxLQUFPOztBQUMxQyxVQUFNQyxLQUFLLEdBQUdsSyxlQUFjLENBQUNsRSxJQUFELENBQTVCOztBQUNBLFVBQUlZLEtBQUssQ0FBQ0MsT0FBTixDQUFjdU4sS0FBZCxLQUF3QixDQUFDRCxhQUE3QixFQUE0QztBQUMxQyxlQUFPQyxLQUFLLENBQUMsQ0FBRCxDQUFaO0FBQ0Q7O0FBQ0QsYUFBT0EsS0FBUDtBQUNEOzs7c0NBRWlCcE8sSSxFQUFNO0FBQ3RCLFVBQUksQ0FBQ0EsSUFBTCxFQUFXLE9BQU8sSUFBUDtBQURXLFVBRWRlLElBRmMsR0FFS2YsSUFGTCxDQUVkZSxJQUZjO0FBQUEsVUFFUmdGLFFBRlEsR0FFSy9GLElBRkwsQ0FFUitGLFFBRlE7QUFHdEIsVUFBTTRCLE9BQU8sR0FBRyxJQUFoQjtBQUVBLFVBQU0xRixRQUFRLEdBQUdsQixJQUFJLElBQUlnRixRQUF6QixDQUxzQixDQU90Qjs7QUFDQSxVQUFJOUQsUUFBSixFQUFjO0FBQ1osZ0JBQVFBLFFBQVI7QUFDRSxlQUFLb00sMkJBQWtCQyxHQUF2QjtBQUE0QixtQkFBTyxnQkFBUDs7QUFDNUIsZUFBSzlLLHFCQUFZOEssR0FBakI7QUFBc0IsbUJBQU8sVUFBUDs7QUFDdEIsZUFBS0MsdUJBQWNELEdBQW5CO0FBQXdCLG1CQUFPLFlBQVA7O0FBQ3hCLGVBQUsxSyxxQkFBWTBLLEdBQWpCO0FBQXNCLG1CQUFPLFVBQVA7O0FBQ3RCLGVBQUt0TixtQkFBVXNOLEdBQWY7QUFBb0IsbUJBQU8sUUFBUDs7QUFDcEIsZUFBS3ZLLHFCQUFZdUssR0FBakI7QUFBc0IsbUJBQU8sVUFBUDs7QUFDdEI7QUFQRjtBQVNEOztBQUVELFVBQU1FLFlBQVksR0FBR3pOLElBQUksSUFBSUEsSUFBSSxDQUFDZ0YsUUFBbEM7O0FBRUEsY0FBUXlJLFlBQVI7QUFDRSxhQUFLN0ssNEJBQW1CMkssR0FBeEI7QUFBNkIsaUJBQU8saUJBQVA7O0FBQzdCLGFBQUs1Syw0QkFBbUI0SyxHQUF4QjtBQUE2QixpQkFBTyxpQkFBUDs7QUFDN0IsYUFBS3BOLGlCQUFRb04sR0FBYjtBQUFrQjtBQUNoQixnQkFBTUcsUUFBUSxHQUFHLDJDQUFrQnpPLElBQWxCLENBQWpCO0FBQ0EsbUJBQU8sT0FBT3lPLFFBQVAsS0FBb0IsUUFBcEIsR0FBK0JBLFFBQS9CLGtCQUFrRDlHLE9BQU8sQ0FBQ3dCLGlCQUFSLENBQTBCcEksSUFBMUIsQ0FBbEQsTUFBUDtBQUNEOztBQUNELGFBQUs4Qyx1QkFBY3lLLEdBQW5CO0FBQXdCO0FBQ3RCLGdCQUFJdk4sSUFBSSxDQUFDaUssV0FBVCxFQUFzQjtBQUNwQixxQkFBT2pLLElBQUksQ0FBQ2lLLFdBQVo7QUFDRDs7QUFDRCxnQkFBTTBELElBQUksR0FBRy9HLE9BQU8sQ0FBQ3dCLGlCQUFSLENBQTBCO0FBQUVwSSxjQUFBQSxJQUFJLEVBQUVBLElBQUksQ0FBQ2tFO0FBQWIsYUFBMUIsQ0FBYjtBQUNBLG1CQUFPeUosSUFBSSx3QkFBaUJBLElBQWpCLFNBQTJCLFlBQXRDO0FBQ0Q7O0FBQ0QsYUFBS3ROLGlCQUFRa04sR0FBYjtBQUFrQjtBQUNoQixtQkFBTyxNQUFQO0FBQ0Q7O0FBQ0Q7QUFBUyxpQkFBTywyQ0FBa0J0TyxJQUFsQixDQUFQO0FBakJYO0FBbUJEOzs7bUNBRWNpTyxPLEVBQVM7QUFDdEIsYUFBTyx3QkFBVUEsT0FBVixDQUFQO0FBQ0Q7Ozt1Q0FFa0JVLE0sRUFBUTtBQUN6QixhQUFPLENBQUMsQ0FBQ0EsTUFBRixJQUFZLGlDQUFtQkEsTUFBbkIsQ0FBbkI7QUFDRDs7OytCQUVVQyxRLEVBQVU7QUFDbkIsYUFBTyx1QkFBV0EsUUFBWCxNQUF5QnBMLGlCQUFoQztBQUNEOzs7c0NBRWlCekMsSSxFQUFNO0FBQ3RCLFVBQU04TixXQUFXLEdBQUcvSSxlQUFlLENBQUMvRSxJQUFELENBQW5DO0FBQ0EsYUFBTyxDQUFDLENBQUNBLElBQUYsS0FDTCxPQUFPQSxJQUFQLEtBQWdCLFVBQWhCLElBQ0csMkJBQWE4TixXQUFiLENBREgsSUFFRyxnQ0FBa0JBLFdBQWxCLENBRkgsSUFHRyxnQ0FBa0JBLFdBQWxCLENBSEgsSUFJRyx5QkFBV0EsV0FBWCxDQUxFLENBQVA7QUFPRDs7O3NDQUVpQjlOLEksRUFBTTtBQUN0QixhQUFPLENBQUMsQ0FBQ0EsSUFBRixJQUFVLGdDQUFrQitFLGVBQWUsQ0FBQy9FLElBQUQsQ0FBakMsQ0FBakI7QUFDRDs7OzZDQUV3QjZJLEksRUFBTTtBQUM3QixVQUFJLENBQUNBLElBQUQsSUFBUyxDQUFDLEtBQUtrRixjQUFMLENBQW9CbEYsSUFBcEIsQ0FBZCxFQUF5QztBQUN2QyxlQUFPLEtBQVA7QUFDRDs7QUFDRCxhQUFPLEtBQUtyQixpQkFBTCxDQUF1QnFCLElBQUksQ0FBQzdJLElBQTVCLENBQVA7QUFDRDs7OzRDQUV1QmdPLFEsRUFBVTtBQUNoQztBQUNBLFVBQUlBLFFBQUosRUFBYztBQUNaLFlBQUlySixRQUFKOztBQUNBLFlBQUlxSixRQUFRLENBQUNwSixRQUFiLEVBQXVCO0FBQUU7QUFDcEJELFVBQUFBLFFBRGtCLEdBQ0xxSixRQUFRLENBQUNwSixRQURKLENBQ2xCRCxRQURrQjtBQUV0QixTQUZELE1BRU8sSUFBSXFKLFFBQVEsQ0FBQ3JKLFFBQWIsRUFBdUI7QUFDekJBLFVBQUFBLFFBRHlCLEdBQ1pxSixRQURZLENBQ3pCckosUUFEeUI7QUFFN0I7O0FBQ0QsWUFBSUEsUUFBSixFQUFjO0FBQ1osaUJBQU9BLFFBQVA7QUFDRDtBQUNGOztBQUNELFlBQU0sSUFBSXpCLEtBQUosQ0FBVSwyRUFBVixDQUFOO0FBQ0Q7OztvQ0FFc0I7QUFDckIsMEJBQU9wQyxrQkFBTUMsYUFBTixvQ0FBUDtBQUNEOzs7OENBRXlCOUIsSSxFQUFNdUcsTyxFQUFTO0FBQ3ZDLGFBQU87QUFDTHlJLFFBQUFBLFVBQVUsRUFBVkEsOEJBREs7QUFFTGhQLFFBQUFBLElBQUksRUFBRSxtREFBMEI2QixrQkFBTUMsYUFBaEMsRUFBK0M5QixJQUEvQyxFQUFxRHVHLE9BQXJEO0FBRkQsT0FBUDtBQUlEOzs7O0VBNWdCaUNrSCxxQjs7QUErZ0JwQ3dCLE1BQU0sQ0FBQ0MsT0FBUCxHQUFpQjdJLHFCQUFqQiIsInNvdXJjZXNDb250ZW50IjpbIi8qIGVzbGludCBuby11c2UtYmVmb3JlLWRlZmluZTogb2ZmICovXG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xuaW1wb3J0IFJlYWN0RE9NIGZyb20gJ3JlYWN0LWRvbSc7XG5pbXBvcnQgUmVhY3RET01TZXJ2ZXIgZnJvbSAncmVhY3QtZG9tL3NlcnZlcic7XG5pbXBvcnQgU2hhbGxvd1JlbmRlcmVyIGZyb20gJ3JlYWN0LXRlc3QtcmVuZGVyZXIvc2hhbGxvdyc7XG5pbXBvcnQgeyB2ZXJzaW9uIGFzIHRlc3RSZW5kZXJlclZlcnNpb24gfSBmcm9tICdyZWFjdC10ZXN0LXJlbmRlcmVyL3BhY2thZ2UuanNvbic7XG5pbXBvcnQgVGVzdFV0aWxzIGZyb20gJ3JlYWN0LWRvbS90ZXN0LXV0aWxzJztcbmltcG9ydCBzZW12ZXIgZnJvbSAnc2VtdmVyJztcbmltcG9ydCBjaGVja1Byb3BUeXBlcyBmcm9tICdwcm9wLXR5cGVzL2NoZWNrUHJvcFR5cGVzJztcbmltcG9ydCBoYXMgZnJvbSAnaGFzJztcbmltcG9ydCB7XG4gIEFzeW5jTW9kZSxcbiAgQ29uY3VycmVudE1vZGUsXG4gIENvbnRleHRDb25zdW1lcixcbiAgQ29udGV4dFByb3ZpZGVyLFxuICBFbGVtZW50LFxuICBGb3J3YXJkUmVmLFxuICBGcmFnbWVudCxcbiAgaXNDb250ZXh0Q29uc3VtZXIsXG4gIGlzQ29udGV4dFByb3ZpZGVyLFxuICBpc0VsZW1lbnQsXG4gIGlzRm9yd2FyZFJlZixcbiAgaXNQb3J0YWwsXG4gIGlzU3VzcGVuc2UsXG4gIGlzVmFsaWRFbGVtZW50VHlwZSxcbiAgTGF6eSxcbiAgTWVtbyxcbiAgUG9ydGFsLFxuICBQcm9maWxlcixcbiAgU3RyaWN0TW9kZSxcbiAgU3VzcGVuc2UsXG59IGZyb20gJ3JlYWN0LWlzJztcbmltcG9ydCB7IEVuenltZUFkYXB0ZXIgfSBmcm9tICdlbnp5bWUnO1xuaW1wb3J0IHsgdHlwZU9mTm9kZSB9IGZyb20gJ2VuenltZS9idWlsZC9VdGlscyc7XG5pbXBvcnQgc2hhbGxvd0VxdWFsIGZyb20gJ2VuenltZS1zaGFsbG93LWVxdWFsJztcbmltcG9ydCB7XG4gIGRpc3BsYXlOYW1lT2ZOb2RlLFxuICBlbGVtZW50VG9UcmVlIGFzIHV0aWxFbGVtZW50VG9UcmVlLFxuICBub2RlVHlwZUZyb21UeXBlIGFzIHV0aWxOb2RlVHlwZUZyb21UeXBlLFxuICBtYXBOYXRpdmVFdmVudE5hbWVzLFxuICBwcm9wRnJvbUV2ZW50LFxuICBhc3NlcnREb21BdmFpbGFibGUsXG4gIHdpdGhTZXRTdGF0ZUFsbG93ZWQsXG4gIGNyZWF0ZVJlbmRlcldyYXBwZXIsXG4gIGNyZWF0ZU1vdW50V3JhcHBlcixcbiAgcHJvcHNXaXRoS2V5c0FuZFJlZixcbiAgZW5zdXJlS2V5T3JVbmRlZmluZWQsXG4gIHNpbXVsYXRlRXJyb3IsXG4gIHdyYXAsXG4gIGdldE1hc2tlZENvbnRleHQsXG4gIGdldENvbXBvbmVudFN0YWNrLFxuICBSb290RmluZGVyLFxuICBnZXROb2RlRnJvbVJvb3RGaW5kZXIsXG4gIHdyYXBXaXRoV3JhcHBpbmdDb21wb25lbnQsXG4gIGdldFdyYXBwaW5nQ29tcG9uZW50TW91bnRSZW5kZXJlcixcbiAgY29tcGFyZU5vZGVUeXBlT2YsXG59IGZyb20gJ2VuenltZS1hZGFwdGVyLXV0aWxzJztcbmltcG9ydCBmaW5kQ3VycmVudEZpYmVyVXNpbmdTbG93UGF0aCBmcm9tICcuL2ZpbmRDdXJyZW50RmliZXJVc2luZ1Nsb3dQYXRoJztcbmltcG9ydCBkZXRlY3RGaWJlclRhZ3MgZnJvbSAnLi9kZXRlY3RGaWJlclRhZ3MnO1xuXG4vLyBMYXppbHkgcG9wdWxhdGVkIGlmIERPTSBpcyBhdmFpbGFibGUuXG5sZXQgRmliZXJUYWdzID0gbnVsbDtcblxuZnVuY3Rpb24gbm9kZUFuZFNpYmxpbmdzQXJyYXkobm9kZVdpdGhTaWJsaW5nKSB7XG4gIGNvbnN0IGFycmF5ID0gW107XG4gIGxldCBub2RlID0gbm9kZVdpdGhTaWJsaW5nO1xuICB3aGlsZSAobm9kZSAhPSBudWxsKSB7XG4gICAgYXJyYXkucHVzaChub2RlKTtcbiAgICBub2RlID0gbm9kZS5zaWJsaW5nO1xuICB9XG4gIHJldHVybiBhcnJheTtcbn1cblxuZnVuY3Rpb24gZmxhdHRlbihhcnIpIHtcbiAgY29uc3QgcmVzdWx0ID0gW107XG4gIGNvbnN0IHN0YWNrID0gW3sgaTogMCwgYXJyYXk6IGFyciB9XTtcbiAgd2hpbGUgKHN0YWNrLmxlbmd0aCkge1xuICAgIGNvbnN0IG4gPSBzdGFjay5wb3AoKTtcbiAgICB3aGlsZSAobi5pIDwgbi5hcnJheS5sZW5ndGgpIHtcbiAgICAgIGNvbnN0IGVsID0gbi5hcnJheVtuLmldO1xuICAgICAgbi5pICs9IDE7XG4gICAgICBpZiAoQXJyYXkuaXNBcnJheShlbCkpIHtcbiAgICAgICAgc3RhY2sucHVzaChuKTtcbiAgICAgICAgc3RhY2sucHVzaCh7IGk6IDAsIGFycmF5OiBlbCB9KTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgICByZXN1bHQucHVzaChlbCk7XG4gICAgfVxuICB9XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbmZ1bmN0aW9uIG5vZGVUeXBlRnJvbVR5cGUodHlwZSkge1xuICBpZiAodHlwZSA9PT0gUG9ydGFsKSB7XG4gICAgcmV0dXJuICdwb3J0YWwnO1xuICB9XG5cbiAgcmV0dXJuIHV0aWxOb2RlVHlwZUZyb21UeXBlKHR5cGUpO1xufVxuXG5mdW5jdGlvbiBpc01lbW8odHlwZSkge1xuICByZXR1cm4gY29tcGFyZU5vZGVUeXBlT2YodHlwZSwgTWVtbyk7XG59XG5cbmZ1bmN0aW9uIGlzTGF6eSh0eXBlKSB7XG4gIHJldHVybiBjb21wYXJlTm9kZVR5cGVPZih0eXBlLCBMYXp5KTtcbn1cblxuZnVuY3Rpb24gdW5tZW1vVHlwZSh0eXBlKSB7XG4gIHJldHVybiBpc01lbW8odHlwZSkgPyB0eXBlLnR5cGUgOiB0eXBlO1xufVxuXG5mdW5jdGlvbiBjaGVja0lzU3VzcGVuc2VBbmRDbG9uZUVsZW1lbnQoZWwsIHsgc3VzcGVuc2VGYWxsYmFjayB9KSB7XG4gIGlmICghaXNTdXNwZW5zZShlbCkpIHtcbiAgICByZXR1cm4gZWw7XG4gIH1cblxuICBsZXQgeyBjaGlsZHJlbiB9ID0gZWwucHJvcHM7XG5cbiAgaWYgKHN1c3BlbnNlRmFsbGJhY2spIHtcbiAgICBjb25zdCB7IGZhbGxiYWNrIH0gPSBlbC5wcm9wcztcbiAgICBjaGlsZHJlbiA9IHJlcGxhY2VMYXp5V2l0aEZhbGxiYWNrKGNoaWxkcmVuLCBmYWxsYmFjayk7XG4gIH1cblxuICBjb25zdCBGYWtlU3VzcGVuc2VXcmFwcGVyID0gKHByb3BzKSA9PiBSZWFjdC5jcmVhdGVFbGVtZW50KFxuICAgIGVsLnR5cGUsXG4gICAgeyAuLi5lbC5wcm9wcywgLi4ucHJvcHMgfSxcbiAgICBjaGlsZHJlbixcbiAgKTtcbiAgcmV0dXJuIFJlYWN0LmNyZWF0ZUVsZW1lbnQoRmFrZVN1c3BlbnNlV3JhcHBlciwgbnVsbCwgY2hpbGRyZW4pO1xufVxuXG5mdW5jdGlvbiBlbGVtZW50VG9UcmVlKGVsKSB7XG4gIGlmICghaXNQb3J0YWwoZWwpKSB7XG4gICAgcmV0dXJuIHV0aWxFbGVtZW50VG9UcmVlKGVsLCBlbGVtZW50VG9UcmVlKTtcbiAgfVxuXG4gIGNvbnN0IHsgY2hpbGRyZW4sIGNvbnRhaW5lckluZm8gfSA9IGVsO1xuICBjb25zdCBwcm9wcyA9IHsgY2hpbGRyZW4sIGNvbnRhaW5lckluZm8gfTtcblxuICByZXR1cm4ge1xuICAgIG5vZGVUeXBlOiAncG9ydGFsJyxcbiAgICB0eXBlOiBQb3J0YWwsXG4gICAgcHJvcHMsXG4gICAga2V5OiBlbnN1cmVLZXlPclVuZGVmaW5lZChlbC5rZXkpLFxuICAgIHJlZjogZWwucmVmIHx8IG51bGwsXG4gICAgaW5zdGFuY2U6IG51bGwsXG4gICAgcmVuZGVyZWQ6IGVsZW1lbnRUb1RyZWUoZWwuY2hpbGRyZW4pLFxuICB9O1xufVxuXG5mdW5jdGlvbiB0b1RyZWUodm5vZGUpIHtcbiAgaWYgKHZub2RlID09IG51bGwpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuICAvLyBUT0RPKGxtcik6IEknbSBub3QgcmVhbGx5IHN1cmUgSSB1bmRlcnN0YW5kIHdoZXRoZXIgb3Igbm90IHRoaXMgaXMgd2hhdFxuICAvLyBpIHNob3VsZCBiZSBkb2luZywgb3IgaWYgdGhpcyBpcyBhIGhhY2sgZm9yIHNvbWV0aGluZyBpJ20gZG9pbmcgd3JvbmdcbiAgLy8gc29tZXdoZXJlIGVsc2UuIFNob3VsZCB0YWxrIHRvIHNlYmFzdGlhbiBhYm91dCB0aGlzIHBlcmhhcHNcbiAgY29uc3Qgbm9kZSA9IGZpbmRDdXJyZW50RmliZXJVc2luZ1Nsb3dQYXRoKHZub2RlKTtcbiAgc3dpdGNoIChub2RlLnRhZykge1xuICAgIGNhc2UgRmliZXJUYWdzLkhvc3RSb290OlxuICAgICAgcmV0dXJuIGNoaWxkcmVuVG9UcmVlKG5vZGUuY2hpbGQpO1xuICAgIGNhc2UgRmliZXJUYWdzLkhvc3RQb3J0YWw6IHtcbiAgICAgIGNvbnN0IHtcbiAgICAgICAgc3RhdGVOb2RlOiB7IGNvbnRhaW5lckluZm8gfSxcbiAgICAgICAgbWVtb2l6ZWRQcm9wczogY2hpbGRyZW4sXG4gICAgICB9ID0gbm9kZTtcbiAgICAgIGNvbnN0IHByb3BzID0geyBjb250YWluZXJJbmZvLCBjaGlsZHJlbiB9O1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgbm9kZVR5cGU6ICdwb3J0YWwnLFxuICAgICAgICB0eXBlOiBQb3J0YWwsXG4gICAgICAgIHByb3BzLFxuICAgICAgICBrZXk6IGVuc3VyZUtleU9yVW5kZWZpbmVkKG5vZGUua2V5KSxcbiAgICAgICAgcmVmOiBub2RlLnJlZixcbiAgICAgICAgaW5zdGFuY2U6IG51bGwsXG4gICAgICAgIHJlbmRlcmVkOiBjaGlsZHJlblRvVHJlZShub2RlLmNoaWxkKSxcbiAgICAgIH07XG4gICAgfVxuICAgIGNhc2UgRmliZXJUYWdzLkNsYXNzQ29tcG9uZW50OlxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgbm9kZVR5cGU6ICdjbGFzcycsXG4gICAgICAgIHR5cGU6IG5vZGUudHlwZSxcbiAgICAgICAgcHJvcHM6IHsgLi4ubm9kZS5tZW1vaXplZFByb3BzIH0sXG4gICAgICAgIGtleTogZW5zdXJlS2V5T3JVbmRlZmluZWQobm9kZS5rZXkpLFxuICAgICAgICByZWY6IG5vZGUucmVmLFxuICAgICAgICBpbnN0YW5jZTogbm9kZS5zdGF0ZU5vZGUsXG4gICAgICAgIHJlbmRlcmVkOiBjaGlsZHJlblRvVHJlZShub2RlLmNoaWxkKSxcbiAgICAgIH07XG4gICAgY2FzZSBGaWJlclRhZ3MuRnVuY3Rpb25hbENvbXBvbmVudDpcbiAgICAgIHJldHVybiB7XG4gICAgICAgIG5vZGVUeXBlOiAnZnVuY3Rpb24nLFxuICAgICAgICB0eXBlOiBub2RlLnR5cGUsXG4gICAgICAgIHByb3BzOiB7IC4uLm5vZGUubWVtb2l6ZWRQcm9wcyB9LFxuICAgICAgICBrZXk6IGVuc3VyZUtleU9yVW5kZWZpbmVkKG5vZGUua2V5KSxcbiAgICAgICAgcmVmOiBub2RlLnJlZixcbiAgICAgICAgaW5zdGFuY2U6IG51bGwsXG4gICAgICAgIHJlbmRlcmVkOiBjaGlsZHJlblRvVHJlZShub2RlLmNoaWxkKSxcbiAgICAgIH07XG4gICAgY2FzZSBGaWJlclRhZ3MuTWVtb0NsYXNzOlxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgbm9kZVR5cGU6ICdjbGFzcycsXG4gICAgICAgIHR5cGU6IG5vZGUuZWxlbWVudFR5cGUudHlwZSxcbiAgICAgICAgcHJvcHM6IHsgLi4ubm9kZS5tZW1vaXplZFByb3BzIH0sXG4gICAgICAgIGtleTogZW5zdXJlS2V5T3JVbmRlZmluZWQobm9kZS5rZXkpLFxuICAgICAgICByZWY6IG5vZGUucmVmLFxuICAgICAgICBpbnN0YW5jZTogbm9kZS5zdGF0ZU5vZGUsXG4gICAgICAgIHJlbmRlcmVkOiBjaGlsZHJlblRvVHJlZShub2RlLmNoaWxkLmNoaWxkKSxcbiAgICAgIH07XG4gICAgY2FzZSBGaWJlclRhZ3MuTWVtb1NGQzoge1xuICAgICAgbGV0IHJlbmRlcmVkTm9kZXMgPSBmbGF0dGVuKG5vZGVBbmRTaWJsaW5nc0FycmF5KG5vZGUuY2hpbGQpLm1hcCh0b1RyZWUpKTtcbiAgICAgIGlmIChyZW5kZXJlZE5vZGVzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICByZW5kZXJlZE5vZGVzID0gW25vZGUubWVtb2l6ZWRQcm9wcy5jaGlsZHJlbl07XG4gICAgICB9XG4gICAgICByZXR1cm4ge1xuICAgICAgICBub2RlVHlwZTogJ2Z1bmN0aW9uJyxcbiAgICAgICAgdHlwZTogbm9kZS5lbGVtZW50VHlwZSxcbiAgICAgICAgcHJvcHM6IHsgLi4ubm9kZS5tZW1vaXplZFByb3BzIH0sXG4gICAgICAgIGtleTogZW5zdXJlS2V5T3JVbmRlZmluZWQobm9kZS5rZXkpLFxuICAgICAgICByZWY6IG5vZGUucmVmLFxuICAgICAgICBpbnN0YW5jZTogbnVsbCxcbiAgICAgICAgcmVuZGVyZWQ6IHJlbmRlcmVkTm9kZXMsXG4gICAgICB9O1xuICAgIH1cbiAgICBjYXNlIEZpYmVyVGFncy5Ib3N0Q29tcG9uZW50OiB7XG4gICAgICBsZXQgcmVuZGVyZWROb2RlcyA9IGZsYXR0ZW4obm9kZUFuZFNpYmxpbmdzQXJyYXkobm9kZS5jaGlsZCkubWFwKHRvVHJlZSkpO1xuICAgICAgaWYgKHJlbmRlcmVkTm9kZXMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIHJlbmRlcmVkTm9kZXMgPSBbbm9kZS5tZW1vaXplZFByb3BzLmNoaWxkcmVuXTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB7XG4gICAgICAgIG5vZGVUeXBlOiAnaG9zdCcsXG4gICAgICAgIHR5cGU6IG5vZGUudHlwZSxcbiAgICAgICAgcHJvcHM6IHsgLi4ubm9kZS5tZW1vaXplZFByb3BzIH0sXG4gICAgICAgIGtleTogZW5zdXJlS2V5T3JVbmRlZmluZWQobm9kZS5rZXkpLFxuICAgICAgICByZWY6IG5vZGUucmVmLFxuICAgICAgICBpbnN0YW5jZTogbm9kZS5zdGF0ZU5vZGUsXG4gICAgICAgIHJlbmRlcmVkOiByZW5kZXJlZE5vZGVzLFxuICAgICAgfTtcbiAgICB9XG4gICAgY2FzZSBGaWJlclRhZ3MuSG9zdFRleHQ6XG4gICAgICByZXR1cm4gbm9kZS5tZW1vaXplZFByb3BzO1xuICAgIGNhc2UgRmliZXJUYWdzLkZyYWdtZW50OlxuICAgIGNhc2UgRmliZXJUYWdzLk1vZGU6XG4gICAgY2FzZSBGaWJlclRhZ3MuQ29udGV4dFByb3ZpZGVyOlxuICAgIGNhc2UgRmliZXJUYWdzLkNvbnRleHRDb25zdW1lcjpcbiAgICAgIHJldHVybiBjaGlsZHJlblRvVHJlZShub2RlLmNoaWxkKTtcbiAgICBjYXNlIEZpYmVyVGFncy5Qcm9maWxlcjpcbiAgICBjYXNlIEZpYmVyVGFncy5Gb3J3YXJkUmVmOiB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBub2RlVHlwZTogJ2Z1bmN0aW9uJyxcbiAgICAgICAgdHlwZTogbm9kZS50eXBlLFxuICAgICAgICBwcm9wczogeyAuLi5ub2RlLnBlbmRpbmdQcm9wcyB9LFxuICAgICAgICBrZXk6IGVuc3VyZUtleU9yVW5kZWZpbmVkKG5vZGUua2V5KSxcbiAgICAgICAgcmVmOiBub2RlLnJlZixcbiAgICAgICAgaW5zdGFuY2U6IG51bGwsXG4gICAgICAgIHJlbmRlcmVkOiBjaGlsZHJlblRvVHJlZShub2RlLmNoaWxkKSxcbiAgICAgIH07XG4gICAgfVxuICAgIGNhc2UgRmliZXJUYWdzLlN1c3BlbnNlOiB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBub2RlVHlwZTogJ2Z1bmN0aW9uJyxcbiAgICAgICAgdHlwZTogU3VzcGVuc2UsXG4gICAgICAgIHByb3BzOiB7IC4uLm5vZGUubWVtb2l6ZWRQcm9wcyB9LFxuICAgICAgICBrZXk6IGVuc3VyZUtleU9yVW5kZWZpbmVkKG5vZGUua2V5KSxcbiAgICAgICAgcmVmOiBub2RlLnJlZixcbiAgICAgICAgaW5zdGFuY2U6IG51bGwsXG4gICAgICAgIHJlbmRlcmVkOiBjaGlsZHJlblRvVHJlZShub2RlLmNoaWxkKSxcbiAgICAgIH07XG4gICAgfVxuICAgIGNhc2UgRmliZXJUYWdzLkxhenk6XG4gICAgICByZXR1cm4gY2hpbGRyZW5Ub1RyZWUobm9kZS5jaGlsZCk7XG4gICAgY2FzZSBGaWJlclRhZ3MuT2Zmc2NyZWVuQ29tcG9uZW50OlxuICAgICAgcmV0dXJuIHRvVHJlZShub2RlLmNoaWxkKTtcbiAgICBkZWZhdWx0OlxuICAgICAgdGhyb3cgbmV3IEVycm9yKGBFbnp5bWUgSW50ZXJuYWwgRXJyb3I6IHVua25vd24gbm9kZSB3aXRoIHRhZyAke25vZGUudGFnfWApO1xuICB9XG59XG5cbmZ1bmN0aW9uIGNoaWxkcmVuVG9UcmVlKG5vZGUpIHtcbiAgaWYgKCFub2RlKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbiAgY29uc3QgY2hpbGRyZW4gPSBub2RlQW5kU2libGluZ3NBcnJheShub2RlKTtcbiAgaWYgKGNoaWxkcmVuLmxlbmd0aCA9PT0gMCkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG4gIGlmIChjaGlsZHJlbi5sZW5ndGggPT09IDEpIHtcbiAgICByZXR1cm4gdG9UcmVlKGNoaWxkcmVuWzBdKTtcbiAgfVxuICByZXR1cm4gZmxhdHRlbihjaGlsZHJlbi5tYXAodG9UcmVlKSk7XG59XG5cbmZ1bmN0aW9uIG5vZGVUb0hvc3ROb2RlKF9ub2RlKSB7XG4gIC8vIE5PVEUobG1yKTogbm9kZSBjb3VsZCBiZSBhIGZ1bmN0aW9uIGNvbXBvbmVudFxuICAvLyB3aGljaCB3b250IGhhdmUgYW4gaW5zdGFuY2UgcHJvcCwgYnV0IHdlIGNhbiBnZXQgdGhlXG4gIC8vIGhvc3Qgbm9kZSBhc3NvY2lhdGVkIHdpdGggaXRzIHJldHVybiB2YWx1ZSBhdCB0aGF0IHBvaW50LlxuICAvLyBBbHRob3VnaCB0aGlzIGJyZWFrcyBkb3duIGlmIHRoZSByZXR1cm4gdmFsdWUgaXMgYW4gYXJyYXksXG4gIC8vIGFzIGlzIHBvc3NpYmxlIHdpdGggUmVhY3QgMTYuXG4gIGxldCBub2RlID0gX25vZGU7XG4gIHdoaWxlIChub2RlICYmICFBcnJheS5pc0FycmF5KG5vZGUpICYmIG5vZGUuaW5zdGFuY2UgPT09IG51bGwpIHtcbiAgICBub2RlID0gbm9kZS5yZW5kZXJlZDtcbiAgfVxuICAvLyBpZiB0aGUgU0ZDIHJldHVybmVkIG51bGwgZWZmZWN0aXZlbHksIHRoZXJlIGlzIG5vIGhvc3Qgbm9kZS5cbiAgaWYgKCFub2RlKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICBjb25zdCBtYXBwZXIgPSAoaXRlbSkgPT4ge1xuICAgIGlmIChpdGVtICYmIGl0ZW0uaW5zdGFuY2UpIHJldHVybiBSZWFjdERPTS5maW5kRE9NTm9kZShpdGVtLmluc3RhbmNlKTtcbiAgICByZXR1cm4gbnVsbDtcbiAgfTtcbiAgaWYgKEFycmF5LmlzQXJyYXkobm9kZSkpIHtcbiAgICByZXR1cm4gbm9kZS5tYXAobWFwcGVyKTtcbiAgfVxuICBpZiAoQXJyYXkuaXNBcnJheShub2RlLnJlbmRlcmVkKSAmJiBub2RlLm5vZGVUeXBlID09PSAnY2xhc3MnKSB7XG4gICAgcmV0dXJuIG5vZGUucmVuZGVyZWQubWFwKG1hcHBlcik7XG4gIH1cbiAgcmV0dXJuIG1hcHBlcihub2RlKTtcbn1cblxuZnVuY3Rpb24gcmVwbGFjZUxhenlXaXRoRmFsbGJhY2sobm9kZSwgZmFsbGJhY2spIHtcbiAgaWYgKCFub2RlKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbiAgaWYgKEFycmF5LmlzQXJyYXkobm9kZSkpIHtcbiAgICByZXR1cm4gbm9kZS5tYXAoKGVsKSA9PiByZXBsYWNlTGF6eVdpdGhGYWxsYmFjayhlbCwgZmFsbGJhY2spKTtcbiAgfVxuICBpZiAoaXNMYXp5KG5vZGUudHlwZSkpIHtcbiAgICByZXR1cm4gZmFsbGJhY2s7XG4gIH1cbiAgcmV0dXJuIHtcbiAgICAuLi5ub2RlLFxuICAgIHByb3BzOiB7XG4gICAgICAuLi5ub2RlLnByb3BzLFxuICAgICAgY2hpbGRyZW46IHJlcGxhY2VMYXp5V2l0aEZhbGxiYWNrKG5vZGUucHJvcHMuY2hpbGRyZW4sIGZhbGxiYWNrKSxcbiAgICB9LFxuICB9O1xufVxuXG5jb25zdCBldmVudE9wdGlvbnMgPSB7XG4gIGFuaW1hdGlvbjogdHJ1ZSxcbiAgcG9pbnRlckV2ZW50czogdHJ1ZSxcbiAgYXV4Q2xpY2s6IHRydWUsXG59O1xuXG5mdW5jdGlvbiBnZXRFbXB0eVN0YXRlVmFsdWUoKSB7XG4gIC8vIHRoaXMgaGFuZGxlcyBhIGJ1ZyBpbiBSZWFjdCAxNi4wIC0gMTYuMlxuICAvLyBzZWUgaHR0cHM6Ly9naXRodWIuY29tL2ZhY2Vib29rL3JlYWN0L2NvbW1pdC8zOWJlODM1NjVjNjVmOWM1MjIxNTBlNTIzNzUxNjc1NjhhMmExNDU5XG4gIC8vIGFsc28gc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9mYWNlYm9vay9yZWFjdC9wdWxsLzExOTY1XG5cbiAgY2xhc3MgRW1wdHlTdGF0ZSBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG4gICAgcmVuZGVyKCkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICB9XG4gIGNvbnN0IHRlc3RSZW5kZXJlciA9IG5ldyBTaGFsbG93UmVuZGVyZXIoKTtcbiAgdGVzdFJlbmRlcmVyLnJlbmRlcihSZWFjdC5jcmVhdGVFbGVtZW50KEVtcHR5U3RhdGUpKTtcbiAgcmV0dXJuIHRlc3RSZW5kZXJlci5faW5zdGFuY2Uuc3RhdGU7XG59XG5cbmZ1bmN0aW9uIHdyYXBBY3QoZm4pIHtcbiAgbGV0IHJldHVyblZhbDtcbiAgVGVzdFV0aWxzLmFjdCgoKSA9PiB7IHJldHVyblZhbCA9IGZuKCk7IH0pO1xuICByZXR1cm4gcmV0dXJuVmFsO1xufVxuXG5mdW5jdGlvbiBnZXRQcm92aWRlckRlZmF1bHRWYWx1ZShQcm92aWRlcikge1xuICAvLyBSZWFjdCBzdG9yZXMgcmVmZXJlbmNlcyB0byB0aGUgUHJvdmlkZXIncyBkZWZhdWx0VmFsdWUgZGlmZmVyZW50bHkgYWNyb3NzIHZlcnNpb25zLlxuICBpZiAoJ19kZWZhdWx0VmFsdWUnIGluIFByb3ZpZGVyLl9jb250ZXh0KSB7XG4gICAgcmV0dXJuIFByb3ZpZGVyLl9jb250ZXh0Ll9kZWZhdWx0VmFsdWU7XG4gIH1cbiAgaWYgKCdfY3VycmVudFZhbHVlJyBpbiBQcm92aWRlci5fY29udGV4dCkge1xuICAgIHJldHVybiBQcm92aWRlci5fY29udGV4dC5fY3VycmVudFZhbHVlO1xuICB9XG4gIHRocm93IG5ldyBFcnJvcignRW56eW1lIEludGVybmFsIEVycm9yOiBjYW7igJl0IGZpZ3VyZSBvdXQgaG93IHRvIGdldCBQcm92aWRlcuKAmXMgZGVmYXVsdCB2YWx1ZScpO1xufVxuXG5mdW5jdGlvbiBtYWtlRmFrZUVsZW1lbnQodHlwZSkge1xuICByZXR1cm4geyAkJHR5cGVvZjogRWxlbWVudCwgdHlwZSB9O1xufVxuXG5mdW5jdGlvbiBpc1N0YXRlZnVsKENvbXBvbmVudCkge1xuICByZXR1cm4gQ29tcG9uZW50LnByb3RvdHlwZSAmJiAoXG4gICAgQ29tcG9uZW50LnByb3RvdHlwZS5pc1JlYWN0Q29tcG9uZW50XG4gICAgfHwgQXJyYXkuaXNBcnJheShDb21wb25lbnQuX19yZWFjdEF1dG9CaW5kUGFpcnMpIC8vIGZhbGxiYWNrIGZvciBjcmVhdGVDbGFzcyBjb21wb25lbnRzXG4gICk7XG59XG5cbmNsYXNzIFJlYWN0U2V2ZW50ZWVuQWRhcHRlciBleHRlbmRzIEVuenltZUFkYXB0ZXIge1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBzdXBlcigpO1xuICAgIGNvbnN0IHsgbGlmZWN5Y2xlcyB9ID0gdGhpcy5vcHRpb25zO1xuICAgIHRoaXMub3B0aW9ucyA9IHtcbiAgICAgIC4uLnRoaXMub3B0aW9ucyxcbiAgICAgIGVuYWJsZUNvbXBvbmVudERpZFVwZGF0ZU9uU2V0U3RhdGU6IHRydWUsIC8vIFRPRE86IHJlbW92ZSwgc2VtdmVyLW1ham9yXG4gICAgICBsZWdhY3lDb250ZXh0TW9kZTogJ3BhcmVudCcsXG4gICAgICBsaWZlY3ljbGVzOiB7XG4gICAgICAgIC4uLmxpZmVjeWNsZXMsXG4gICAgICAgIGNvbXBvbmVudERpZFVwZGF0ZToge1xuICAgICAgICAgIG9uU2V0U3RhdGU6IHRydWUsXG4gICAgICAgIH0sXG4gICAgICAgIGdldERlcml2ZWRTdGF0ZUZyb21Qcm9wczoge1xuICAgICAgICAgIGhhc1Nob3VsZENvbXBvbmVudFVwZGF0ZUJ1ZzogZmFsc2UsXG4gICAgICAgIH0sXG4gICAgICAgIGdldFNuYXBzaG90QmVmb3JlVXBkYXRlOiB0cnVlLFxuICAgICAgICBzZXRTdGF0ZToge1xuICAgICAgICAgIHNraXBzQ29tcG9uZW50RGlkVXBkYXRlT25OdWxsaXNoOiB0cnVlLFxuICAgICAgICB9LFxuICAgICAgICBnZXRDaGlsZENvbnRleHQ6IHtcbiAgICAgICAgICBjYWxsZWRCeVJlbmRlcmVyOiBmYWxzZSxcbiAgICAgICAgfSxcbiAgICAgICAgZ2V0RGVyaXZlZFN0YXRlRnJvbUVycm9yOiB0cnVlLFxuICAgICAgfSxcbiAgICB9O1xuICB9XG5cbiAgY3JlYXRlTW91bnRSZW5kZXJlcihvcHRpb25zKSB7XG4gICAgYXNzZXJ0RG9tQXZhaWxhYmxlKCdtb3VudCcpO1xuICAgIGlmIChoYXMob3B0aW9ucywgJ3N1c3BlbnNlRmFsbGJhY2snKSkge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignYHN1c3BlbnNlRmFsbGJhY2tgIGlzIG5vdCBzdXBwb3J0ZWQgYnkgdGhlIGBtb3VudGAgcmVuZGVyZXInKTtcbiAgICB9XG4gICAgaWYgKEZpYmVyVGFncyA9PT0gbnVsbCkge1xuICAgICAgLy8gUmVxdWlyZXMgRE9NLlxuICAgICAgRmliZXJUYWdzID0gZGV0ZWN0RmliZXJUYWdzKCk7XG4gICAgfVxuICAgIGNvbnN0IHsgYXR0YWNoVG8sIGh5ZHJhdGVJbiwgd3JhcHBpbmdDb21wb25lbnRQcm9wcyB9ID0gb3B0aW9ucztcbiAgICBjb25zdCBkb21Ob2RlID0gaHlkcmF0ZUluIHx8IGF0dGFjaFRvIHx8IGdsb2JhbC5kb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICBsZXQgaW5zdGFuY2UgPSBudWxsO1xuICAgIGNvbnN0IGFkYXB0ZXIgPSB0aGlzO1xuICAgIHJldHVybiB7XG4gICAgICByZW5kZXIoZWwsIGNvbnRleHQsIGNhbGxiYWNrKSB7XG4gICAgICAgIHJldHVybiB3cmFwQWN0KCgpID0+IHtcbiAgICAgICAgICBpZiAoaW5zdGFuY2UgPT09IG51bGwpIHtcbiAgICAgICAgICAgIGNvbnN0IHsgdHlwZSwgcHJvcHMsIHJlZiB9ID0gZWw7XG4gICAgICAgICAgICBjb25zdCB3cmFwcGVyUHJvcHMgPSB7XG4gICAgICAgICAgICAgIENvbXBvbmVudDogdHlwZSxcbiAgICAgICAgICAgICAgcHJvcHMsXG4gICAgICAgICAgICAgIHdyYXBwaW5nQ29tcG9uZW50UHJvcHMsXG4gICAgICAgICAgICAgIGNvbnRleHQsXG4gICAgICAgICAgICAgIC4uLihyZWYgJiYgeyByZWZQcm9wOiByZWYgfSksXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgY29uc3QgUmVhY3RXcmFwcGVyQ29tcG9uZW50ID0gY3JlYXRlTW91bnRXcmFwcGVyKGVsLCB7IC4uLm9wdGlvbnMsIGFkYXB0ZXIgfSk7XG4gICAgICAgICAgICBjb25zdCB3cmFwcGVkRWwgPSBSZWFjdC5jcmVhdGVFbGVtZW50KFJlYWN0V3JhcHBlckNvbXBvbmVudCwgd3JhcHBlclByb3BzKTtcbiAgICAgICAgICAgIGluc3RhbmNlID0gaHlkcmF0ZUluXG4gICAgICAgICAgICAgID8gUmVhY3RET00uaHlkcmF0ZSh3cmFwcGVkRWwsIGRvbU5vZGUpXG4gICAgICAgICAgICAgIDogUmVhY3RET00ucmVuZGVyKHdyYXBwZWRFbCwgZG9tTm9kZSk7XG4gICAgICAgICAgICBpZiAodHlwZW9mIGNhbGxiYWNrID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICAgIGNhbGxiYWNrKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGluc3RhbmNlLnNldENoaWxkUHJvcHMoZWwucHJvcHMsIGNvbnRleHQsIGNhbGxiYWNrKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfSxcbiAgICAgIHVubW91bnQoKSB7XG4gICAgICAgIFJlYWN0RE9NLnVubW91bnRDb21wb25lbnRBdE5vZGUoZG9tTm9kZSk7XG4gICAgICAgIGluc3RhbmNlID0gbnVsbDtcbiAgICAgIH0sXG4gICAgICBnZXROb2RlKCkge1xuICAgICAgICBpZiAoIWluc3RhbmNlKSB7XG4gICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGdldE5vZGVGcm9tUm9vdEZpbmRlcihcbiAgICAgICAgICBhZGFwdGVyLmlzQ3VzdG9tQ29tcG9uZW50LFxuICAgICAgICAgIHRvVHJlZShpbnN0YW5jZS5fcmVhY3RJbnRlcm5hbHMpLFxuICAgICAgICAgIG9wdGlvbnMsXG4gICAgICAgICk7XG4gICAgICB9LFxuICAgICAgc2ltdWxhdGVFcnJvcihub2RlSGllcmFyY2h5LCByb290Tm9kZSwgZXJyb3IpIHtcbiAgICAgICAgY29uc3QgaXNFcnJvckJvdW5kYXJ5ID0gKHsgaW5zdGFuY2U6IGVsSW5zdGFuY2UsIHR5cGUgfSkgPT4ge1xuICAgICAgICAgIGlmICh0eXBlICYmIHR5cGUuZ2V0RGVyaXZlZFN0YXRlRnJvbUVycm9yKSB7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIGVsSW5zdGFuY2UgJiYgZWxJbnN0YW5jZS5jb21wb25lbnREaWRDYXRjaDtcbiAgICAgICAgfTtcblxuICAgICAgICBjb25zdCB7XG4gICAgICAgICAgaW5zdGFuY2U6IGNhdGNoaW5nSW5zdGFuY2UsXG4gICAgICAgICAgdHlwZTogY2F0Y2hpbmdUeXBlLFxuICAgICAgICB9ID0gbm9kZUhpZXJhcmNoeS5maW5kKGlzRXJyb3JCb3VuZGFyeSkgfHwge307XG5cbiAgICAgICAgc2ltdWxhdGVFcnJvcihcbiAgICAgICAgICBlcnJvcixcbiAgICAgICAgICBjYXRjaGluZ0luc3RhbmNlLFxuICAgICAgICAgIHJvb3ROb2RlLFxuICAgICAgICAgIG5vZGVIaWVyYXJjaHksXG4gICAgICAgICAgbm9kZVR5cGVGcm9tVHlwZSxcbiAgICAgICAgICBhZGFwdGVyLmRpc3BsYXlOYW1lT2ZOb2RlLFxuICAgICAgICAgIGNhdGNoaW5nVHlwZSxcbiAgICAgICAgKTtcbiAgICAgIH0sXG4gICAgICBzaW11bGF0ZUV2ZW50KG5vZGUsIGV2ZW50LCBtb2NrKSB7XG4gICAgICAgIGNvbnN0IG1hcHBlZEV2ZW50ID0gbWFwTmF0aXZlRXZlbnROYW1lcyhldmVudCwgZXZlbnRPcHRpb25zKTtcbiAgICAgICAgY29uc3QgZXZlbnRGbiA9IFRlc3RVdGlscy5TaW11bGF0ZVttYXBwZWRFdmVudF07XG4gICAgICAgIGlmICghZXZlbnRGbikge1xuICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoYFJlYWN0V3JhcHBlcjo6c2ltdWxhdGUoKSBldmVudCAnJHtldmVudH0nIGRvZXMgbm90IGV4aXN0YCk7XG4gICAgICAgIH1cbiAgICAgICAgd3JhcEFjdCgoKSA9PiB7XG4gICAgICAgICAgZXZlbnRGbihhZGFwdGVyLm5vZGVUb0hvc3ROb2RlKG5vZGUpLCBtb2NrKTtcbiAgICAgICAgfSk7XG4gICAgICB9LFxuICAgICAgYmF0Y2hlZFVwZGF0ZXMoZm4pIHtcbiAgICAgICAgcmV0dXJuIGZuKCk7XG4gICAgICAgIC8vIHJldHVybiBSZWFjdERPTS51bnN0YWJsZV9iYXRjaGVkVXBkYXRlcyhmbik7XG4gICAgICB9LFxuICAgICAgZ2V0V3JhcHBpbmdDb21wb25lbnRSZW5kZXJlcigpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAuLi50aGlzLFxuICAgICAgICAgIC4uLmdldFdyYXBwaW5nQ29tcG9uZW50TW91bnRSZW5kZXJlcih7XG4gICAgICAgICAgICB0b1RyZWU6IChpbnN0KSA9PiB0b1RyZWUoaW5zdC5fcmVhY3RJbnRlcm5hbHMpLFxuICAgICAgICAgICAgZ2V0TW91bnRXcmFwcGVySW5zdGFuY2U6ICgpID0+IGluc3RhbmNlLFxuICAgICAgICAgIH0pLFxuICAgICAgICB9O1xuICAgICAgfSxcbiAgICAgIHdyYXBJbnZva2U6IHdyYXBBY3QsXG4gICAgfTtcbiAgfVxuXG4gIGNyZWF0ZVNoYWxsb3dSZW5kZXJlcihvcHRpb25zID0ge30pIHtcbiAgICBjb25zdCBhZGFwdGVyID0gdGhpcztcbiAgICBjb25zdCByZW5kZXJlciA9IG5ldyBTaGFsbG93UmVuZGVyZXIoKTtcbiAgICBjb25zdCB7IHN1c3BlbnNlRmFsbGJhY2sgfSA9IG9wdGlvbnM7XG4gICAgaWYgKHR5cGVvZiBzdXNwZW5zZUZhbGxiYWNrICE9PSAndW5kZWZpbmVkJyAmJiB0eXBlb2Ygc3VzcGVuc2VGYWxsYmFjayAhPT0gJ2Jvb2xlYW4nKSB7XG4gICAgICB0aHJvdyBUeXBlRXJyb3IoJ2BvcHRpb25zLnN1c3BlbnNlRmFsbGJhY2tgIHNob3VsZCBiZSBib29sZWFuIG9yIHVuZGVmaW5lZCcpO1xuICAgIH1cbiAgICBsZXQgaXNET00gPSBmYWxzZTtcbiAgICBsZXQgY2FjaGVkTm9kZSA9IG51bGw7XG5cbiAgICBsZXQgbGFzdENvbXBvbmVudCA9IG51bGw7XG4gICAgbGV0IHdyYXBwZWRDb21wb25lbnQgPSBudWxsO1xuICAgIGNvbnN0IHNlbnRpbmVsID0ge307XG5cbiAgICAvLyB3cmFwIG1lbW8gY29tcG9uZW50cyB3aXRoIGEgUHVyZUNvbXBvbmVudCwgb3IgYSBjbGFzcyBjb21wb25lbnQgd2l0aCBzQ1VcbiAgICBjb25zdCB3cmFwUHVyZUNvbXBvbmVudCA9IChDb21wb25lbnQsIGNvbXBhcmUpID0+IHtcbiAgICAgIGlmIChsYXN0Q29tcG9uZW50ICE9PSBDb21wb25lbnQpIHtcbiAgICAgICAgaWYgKGlzU3RhdGVmdWwoQ29tcG9uZW50KSkge1xuICAgICAgICAgIHdyYXBwZWRDb21wb25lbnQgPSBjbGFzcyBleHRlbmRzIENvbXBvbmVudCB7fTtcbiAgICAgICAgICBpZiAoY29tcGFyZSkge1xuICAgICAgICAgICAgd3JhcHBlZENvbXBvbmVudC5wcm90b3R5cGUuc2hvdWxkQ29tcG9uZW50VXBkYXRlID0gKG5leHRQcm9wcykgPT4gKFxuICAgICAgICAgICAgICAhY29tcGFyZSh0aGlzLnByb3BzLCBuZXh0UHJvcHMpXG4gICAgICAgICAgICApO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB3cmFwcGVkQ29tcG9uZW50LnByb3RvdHlwZS5pc1B1cmVSZWFjdENvbXBvbmVudCA9IHRydWU7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGxldCBtZW1vaXplZCA9IHNlbnRpbmVsO1xuICAgICAgICAgIGxldCBwcmV2UHJvcHM7XG4gICAgICAgICAgd3JhcHBlZENvbXBvbmVudCA9IGZ1bmN0aW9uIHdyYXBwZWRDb21wb25lbnRGbihwcm9wcywgLi4uYXJncykge1xuICAgICAgICAgICAgY29uc3Qgc2hvdWxkVXBkYXRlID0gbWVtb2l6ZWQgPT09IHNlbnRpbmVsIHx8IChjb21wYXJlXG4gICAgICAgICAgICAgID8gIWNvbXBhcmUocHJldlByb3BzLCBwcm9wcylcbiAgICAgICAgICAgICAgOiAhc2hhbGxvd0VxdWFsKHByZXZQcm9wcywgcHJvcHMpXG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgaWYgKHNob3VsZFVwZGF0ZSkge1xuICAgICAgICAgICAgICBtZW1vaXplZCA9IENvbXBvbmVudCh7IC4uLkNvbXBvbmVudC5kZWZhdWx0UHJvcHMsIC4uLnByb3BzIH0sIC4uLmFyZ3MpO1xuICAgICAgICAgICAgICBwcmV2UHJvcHMgPSBwcm9wcztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBtZW1vaXplZDtcbiAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICAgIE9iamVjdC5hc3NpZ24oXG4gICAgICAgICAgd3JhcHBlZENvbXBvbmVudCxcbiAgICAgICAgICBDb21wb25lbnQsXG4gICAgICAgICAgeyBkaXNwbGF5TmFtZTogYWRhcHRlci5kaXNwbGF5TmFtZU9mTm9kZSh7IHR5cGU6IENvbXBvbmVudCB9KSB9LFxuICAgICAgICApO1xuICAgICAgICBsYXN0Q29tcG9uZW50ID0gQ29tcG9uZW50O1xuICAgICAgfVxuICAgICAgcmV0dXJuIHdyYXBwZWRDb21wb25lbnQ7XG4gICAgfTtcblxuICAgIC8vIFdyYXAgZnVuY3Rpb25hbCBjb21wb25lbnRzIG9uIHZlcnNpb25zIHByaW9yIHRvIDE2LjUsXG4gICAgLy8gdG8gYXZvaWQgaW5hZHZlcnRlbnRseSBwYXNzIGEgYHRoaXNgIGluc3RhbmNlIHRvIGl0LlxuICAgIGNvbnN0IHdyYXBGdW5jdGlvbmFsQ29tcG9uZW50ID0gKENvbXBvbmVudCkgPT4ge1xuICAgICAgaWYgKGhhcyhDb21wb25lbnQsICdkZWZhdWx0UHJvcHMnKSkge1xuICAgICAgICBpZiAobGFzdENvbXBvbmVudCAhPT0gQ29tcG9uZW50KSB7XG4gICAgICAgICAgd3JhcHBlZENvbXBvbmVudCA9IE9iamVjdC5hc3NpZ24oXG4gICAgICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbmV3LWNhcFxuICAgICAgICAgICAgKHByb3BzLCAuLi5hcmdzKSA9PiBDb21wb25lbnQoeyAuLi5Db21wb25lbnQuZGVmYXVsdFByb3BzLCAuLi5wcm9wcyB9LCAuLi5hcmdzKSxcbiAgICAgICAgICAgIENvbXBvbmVudCxcbiAgICAgICAgICAgIHsgZGlzcGxheU5hbWU6IGFkYXB0ZXIuZGlzcGxheU5hbWVPZk5vZGUoeyB0eXBlOiBDb21wb25lbnQgfSkgfSxcbiAgICAgICAgICApO1xuICAgICAgICAgIGxhc3RDb21wb25lbnQgPSBDb21wb25lbnQ7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHdyYXBwZWRDb21wb25lbnQ7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBDb21wb25lbnQ7XG4gICAgfTtcblxuICAgIGNvbnN0IHJlbmRlckVsZW1lbnQgPSAoZWxDb25maWcsIC4uLnJlc3QpID0+IHtcbiAgICAgIGNvbnN0IHJlbmRlcmVkRWwgPSByZW5kZXJlci5yZW5kZXIoZWxDb25maWcsIC4uLnJlc3QpO1xuXG4gICAgICBjb25zdCB0eXBlSXNFeGlzdGVkID0gISEocmVuZGVyZWRFbCAmJiByZW5kZXJlZEVsLnR5cGUpO1xuICAgICAgaWYgKHR5cGVJc0V4aXN0ZWQpIHtcbiAgICAgICAgY29uc3QgY2xvbmVkRWwgPSBjaGVja0lzU3VzcGVuc2VBbmRDbG9uZUVsZW1lbnQocmVuZGVyZWRFbCwgeyBzdXNwZW5zZUZhbGxiYWNrIH0pO1xuXG4gICAgICAgIGNvbnN0IGVsZW1lbnRJc0NoYW5nZWQgPSBjbG9uZWRFbC50eXBlICE9PSByZW5kZXJlZEVsLnR5cGU7XG4gICAgICAgIGlmIChlbGVtZW50SXNDaGFuZ2VkKSB7XG4gICAgICAgICAgcmV0dXJuIHJlbmRlcmVyLnJlbmRlcih7IC4uLmVsQ29uZmlnLCB0eXBlOiBjbG9uZWRFbC50eXBlIH0sIC4uLnJlc3QpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJldHVybiByZW5kZXJlZEVsO1xuICAgIH07XG5cbiAgICByZXR1cm4ge1xuICAgICAgcmVuZGVyKGVsLCB1bm1hc2tlZENvbnRleHQsIHtcbiAgICAgICAgcHJvdmlkZXJWYWx1ZXMgPSBuZXcgTWFwKCksXG4gICAgICB9ID0ge30pIHtcbiAgICAgICAgY2FjaGVkTm9kZSA9IGVsO1xuICAgICAgICAvKiBlc2xpbnQgY29uc2lzdGVudC1yZXR1cm46IDAgKi9cbiAgICAgICAgaWYgKHR5cGVvZiBlbC50eXBlID09PSAnc3RyaW5nJykge1xuICAgICAgICAgIGlzRE9NID0gdHJ1ZTtcbiAgICAgICAgfSBlbHNlIGlmIChpc0NvbnRleHRQcm92aWRlcihlbCkpIHtcbiAgICAgICAgICBwcm92aWRlclZhbHVlcy5zZXQoZWwudHlwZSwgZWwucHJvcHMudmFsdWUpO1xuICAgICAgICAgIGNvbnN0IE1vY2tQcm92aWRlciA9IE9iamVjdC5hc3NpZ24oXG4gICAgICAgICAgICAocHJvcHMpID0+IHByb3BzLmNoaWxkcmVuLFxuICAgICAgICAgICAgZWwudHlwZSxcbiAgICAgICAgICApO1xuICAgICAgICAgIHJldHVybiB3aXRoU2V0U3RhdGVBbGxvd2VkKCgpID0+IHJlbmRlckVsZW1lbnQoeyAuLi5lbCwgdHlwZTogTW9ja1Byb3ZpZGVyIH0pKTtcbiAgICAgICAgfSBlbHNlIGlmIChpc0NvbnRleHRDb25zdW1lcihlbCkpIHtcbiAgICAgICAgICBjb25zdCBQcm92aWRlciA9IGFkYXB0ZXIuZ2V0UHJvdmlkZXJGcm9tQ29uc3VtZXIoZWwudHlwZSk7XG4gICAgICAgICAgY29uc3QgdmFsdWUgPSBwcm92aWRlclZhbHVlcy5oYXMoUHJvdmlkZXIpXG4gICAgICAgICAgICA/IHByb3ZpZGVyVmFsdWVzLmdldChQcm92aWRlcilcbiAgICAgICAgICAgIDogZ2V0UHJvdmlkZXJEZWZhdWx0VmFsdWUoUHJvdmlkZXIpO1xuICAgICAgICAgIGNvbnN0IE1vY2tDb25zdW1lciA9IE9iamVjdC5hc3NpZ24oXG4gICAgICAgICAgICAocHJvcHMpID0+IHByb3BzLmNoaWxkcmVuKHZhbHVlKSxcbiAgICAgICAgICAgIGVsLnR5cGUsXG4gICAgICAgICAgKTtcbiAgICAgICAgICByZXR1cm4gd2l0aFNldFN0YXRlQWxsb3dlZCgoKSA9PiByZW5kZXJFbGVtZW50KHsgLi4uZWwsIHR5cGU6IE1vY2tDb25zdW1lciB9KSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaXNET00gPSBmYWxzZTtcbiAgICAgICAgICBsZXQgcmVuZGVyZWRFbCA9IGVsO1xuICAgICAgICAgIGlmIChpc0xhenkocmVuZGVyZWRFbCkpIHtcbiAgICAgICAgICAgIHRocm93IFR5cGVFcnJvcignYFJlYWN0LmxhenlgIGlzIG5vdCBzdXBwb3J0ZWQgYnkgc2hhbGxvdyByZW5kZXJpbmcuJyk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgcmVuZGVyZWRFbCA9IGNoZWNrSXNTdXNwZW5zZUFuZENsb25lRWxlbWVudChyZW5kZXJlZEVsLCB7IHN1c3BlbnNlRmFsbGJhY2sgfSk7XG4gICAgICAgICAgY29uc3QgeyB0eXBlOiBDb21wb25lbnQgfSA9IHJlbmRlcmVkRWw7XG5cbiAgICAgICAgICBjb25zdCBjb250ZXh0ID0gZ2V0TWFza2VkQ29udGV4dChDb21wb25lbnQuY29udGV4dFR5cGVzLCB1bm1hc2tlZENvbnRleHQpO1xuXG4gICAgICAgICAgaWYgKGlzTWVtbyhlbC50eXBlKSkge1xuICAgICAgICAgICAgY29uc3QgeyB0eXBlOiBJbm5lckNvbXAsIGNvbXBhcmUgfSA9IGVsLnR5cGU7XG5cbiAgICAgICAgICAgIHJldHVybiB3aXRoU2V0U3RhdGVBbGxvd2VkKCgpID0+IHJlbmRlckVsZW1lbnQoXG4gICAgICAgICAgICAgIHsgLi4uZWwsIHR5cGU6IHdyYXBQdXJlQ29tcG9uZW50KElubmVyQ29tcCwgY29tcGFyZSkgfSxcbiAgICAgICAgICAgICAgY29udGV4dCxcbiAgICAgICAgICAgICkpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmICghaXNTdGF0ZWZ1bChDb21wb25lbnQpICYmIHR5cGVvZiBDb21wb25lbnQgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIHJldHVybiB3aXRoU2V0U3RhdGVBbGxvd2VkKCgpID0+IHJlbmRlckVsZW1lbnQoXG4gICAgICAgICAgICAgIHsgLi4ucmVuZGVyZWRFbCwgdHlwZTogd3JhcEZ1bmN0aW9uYWxDb21wb25lbnQoQ29tcG9uZW50KSB9LFxuICAgICAgICAgICAgICBjb250ZXh0LFxuICAgICAgICAgICAgKSk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKGlzU3RhdGVmdWwpIHtcbiAgICAgICAgICAgIC8vIGZpeCByZWFjdCBidWc7IHNlZSBpbXBsZW1lbnRhdGlvbiBvZiBgZ2V0RW1wdHlTdGF0ZVZhbHVlYFxuICAgICAgICAgICAgY29uc3QgZW1wdHlTdGF0ZVZhbHVlID0gZ2V0RW1wdHlTdGF0ZVZhbHVlKCk7XG4gICAgICAgICAgICBpZiAoZW1wdHlTdGF0ZVZhbHVlKSB7XG4gICAgICAgICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShDb21wb25lbnQucHJvdG90eXBlLCAnc3RhdGUnLCB7XG4gICAgICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICAgICAgZ2V0KCkge1xuICAgICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBzZXQodmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgIGlmICh2YWx1ZSAhPT0gZW1wdHlTdGF0ZVZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCAnc3RhdGUnLCB7XG4gICAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgdmFsdWUsXG4gICAgICAgICAgICAgICAgICAgICAgd3JpdGFibGU6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiB3aXRoU2V0U3RhdGVBbGxvd2VkKCgpID0+IHJlbmRlckVsZW1lbnQocmVuZGVyZWRFbCwgY29udGV4dCkpO1xuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgdW5tb3VudCgpIHtcbiAgICAgICAgcmVuZGVyZXIudW5tb3VudCgpO1xuICAgICAgfSxcbiAgICAgIGdldE5vZGUoKSB7XG4gICAgICAgIGlmIChpc0RPTSkge1xuICAgICAgICAgIHJldHVybiBlbGVtZW50VG9UcmVlKGNhY2hlZE5vZGUpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IG91dHB1dCA9IHJlbmRlcmVyLmdldFJlbmRlck91dHB1dCgpO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIG5vZGVUeXBlOiBub2RlVHlwZUZyb21UeXBlKGNhY2hlZE5vZGUudHlwZSksXG4gICAgICAgICAgdHlwZTogY2FjaGVkTm9kZS50eXBlLFxuICAgICAgICAgIHByb3BzOiBjYWNoZWROb2RlLnByb3BzLFxuICAgICAgICAgIGtleTogZW5zdXJlS2V5T3JVbmRlZmluZWQoY2FjaGVkTm9kZS5rZXkpLFxuICAgICAgICAgIHJlZjogY2FjaGVkTm9kZS5yZWYsXG4gICAgICAgICAgaW5zdGFuY2U6IHJlbmRlcmVyLl9pbnN0YW5jZSxcbiAgICAgICAgICByZW5kZXJlZDogQXJyYXkuaXNBcnJheShvdXRwdXQpXG4gICAgICAgICAgICA/IGZsYXR0ZW4ob3V0cHV0KS5tYXAoKGVsKSA9PiBlbGVtZW50VG9UcmVlKGVsKSlcbiAgICAgICAgICAgIDogZWxlbWVudFRvVHJlZShvdXRwdXQpLFxuICAgICAgICB9O1xuICAgICAgfSxcbiAgICAgIHNpbXVsYXRlRXJyb3Iobm9kZUhpZXJhcmNoeSwgcm9vdE5vZGUsIGVycm9yKSB7XG4gICAgICAgIHNpbXVsYXRlRXJyb3IoXG4gICAgICAgICAgZXJyb3IsXG4gICAgICAgICAgcmVuZGVyZXIuX2luc3RhbmNlLFxuICAgICAgICAgIGNhY2hlZE5vZGUsXG4gICAgICAgICAgbm9kZUhpZXJhcmNoeS5jb25jYXQoY2FjaGVkTm9kZSksXG4gICAgICAgICAgbm9kZVR5cGVGcm9tVHlwZSxcbiAgICAgICAgICBhZGFwdGVyLmRpc3BsYXlOYW1lT2ZOb2RlLFxuICAgICAgICAgIGNhY2hlZE5vZGUudHlwZSxcbiAgICAgICAgKTtcbiAgICAgIH0sXG4gICAgICBzaW11bGF0ZUV2ZW50KG5vZGUsIGV2ZW50LCAuLi5hcmdzKSB7XG4gICAgICAgIGNvbnN0IGhhbmRsZXIgPSBub2RlLnByb3BzW3Byb3BGcm9tRXZlbnQoZXZlbnQsIGV2ZW50T3B0aW9ucyldO1xuICAgICAgICBpZiAoaGFuZGxlcikge1xuICAgICAgICAgIHdpdGhTZXRTdGF0ZUFsbG93ZWQoKCkgPT4ge1xuICAgICAgICAgICAgLy8gVE9ETyhsbXIpOiBjcmVhdGUvdXNlIHN5bnRoZXRpYyBldmVudHNcbiAgICAgICAgICAgIC8vIFRPRE8obG1yKTogZW11bGF0ZSBSZWFjdCdzIGV2ZW50IHByb3BhZ2F0aW9uXG4gICAgICAgICAgICAvLyBSZWFjdERPTS51bnN0YWJsZV9iYXRjaGVkVXBkYXRlcygoKSA9PiB7XG4gICAgICAgICAgICBoYW5kbGVyKC4uLmFyZ3MpO1xuICAgICAgICAgICAgLy8gfSk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBiYXRjaGVkVXBkYXRlcyhmbikge1xuICAgICAgICByZXR1cm4gZm4oKTtcbiAgICAgICAgLy8gcmV0dXJuIFJlYWN0RE9NLnVuc3RhYmxlX2JhdGNoZWRVcGRhdGVzKGZuKTtcbiAgICAgIH0sXG4gICAgICBjaGVja1Byb3BUeXBlcyh0eXBlU3BlY3MsIHZhbHVlcywgbG9jYXRpb24sIGhpZXJhcmNoeSkge1xuICAgICAgICByZXR1cm4gY2hlY2tQcm9wVHlwZXMoXG4gICAgICAgICAgdHlwZVNwZWNzLFxuICAgICAgICAgIHZhbHVlcyxcbiAgICAgICAgICBsb2NhdGlvbixcbiAgICAgICAgICBkaXNwbGF5TmFtZU9mTm9kZShjYWNoZWROb2RlKSxcbiAgICAgICAgICAoKSA9PiBnZXRDb21wb25lbnRTdGFjayhoaWVyYXJjaHkuY29uY2F0KFtjYWNoZWROb2RlXSkpLFxuICAgICAgICApO1xuICAgICAgfSxcbiAgICB9O1xuICB9XG5cbiAgY3JlYXRlU3RyaW5nUmVuZGVyZXIob3B0aW9ucykge1xuICAgIGlmIChoYXMob3B0aW9ucywgJ3N1c3BlbnNlRmFsbGJhY2snKSkge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignYHN1c3BlbnNlRmFsbGJhY2tgIHNob3VsZCBub3QgYmUgc3BlY2lmaWVkIGluIG9wdGlvbnMgb2Ygc3RyaW5nIHJlbmRlcmVyJyk7XG4gICAgfVxuICAgIHJldHVybiB7XG4gICAgICByZW5kZXIoZWwsIGNvbnRleHQpIHtcbiAgICAgICAgaWYgKG9wdGlvbnMuY29udGV4dCAmJiAoZWwudHlwZS5jb250ZXh0VHlwZXMgfHwgb3B0aW9ucy5jaGlsZENvbnRleHRUeXBlcykpIHtcbiAgICAgICAgICBjb25zdCBjaGlsZENvbnRleHRUeXBlcyA9IHtcbiAgICAgICAgICAgIC4uLihlbC50eXBlLmNvbnRleHRUeXBlcyB8fCB7fSksXG4gICAgICAgICAgICAuLi5vcHRpb25zLmNoaWxkQ29udGV4dFR5cGVzLFxuICAgICAgICAgIH07XG4gICAgICAgICAgY29uc3QgQ29udGV4dFdyYXBwZXIgPSBjcmVhdGVSZW5kZXJXcmFwcGVyKGVsLCBjb250ZXh0LCBjaGlsZENvbnRleHRUeXBlcyk7XG4gICAgICAgICAgcmV0dXJuIFJlYWN0RE9NU2VydmVyLnJlbmRlclRvU3RhdGljTWFya3VwKFJlYWN0LmNyZWF0ZUVsZW1lbnQoQ29udGV4dFdyYXBwZXIpKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gUmVhY3RET01TZXJ2ZXIucmVuZGVyVG9TdGF0aWNNYXJrdXAoZWwpO1xuICAgICAgfSxcbiAgICB9O1xuICB9XG5cbiAgLy8gUHJvdmlkZWQgYSBiYWcgb2Ygb3B0aW9ucywgcmV0dXJuIGFuIGBFbnp5bWVSZW5kZXJlcmAuIFNvbWUgb3B0aW9ucyBjYW4gYmUgaW1wbGVtZW50YXRpb25cbiAgLy8gc3BlY2lmaWMsIGxpa2UgYGF0dGFjaGAgZXRjLiBmb3IgUmVhY3QsIGJ1dCBub3QgcGFydCBvZiB0aGlzIGludGVyZmFjZSBleHBsaWNpdGx5LlxuICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgY2xhc3MtbWV0aG9kcy11c2UtdGhpc1xuICBjcmVhdGVSZW5kZXJlcihvcHRpb25zKSB7XG4gICAgc3dpdGNoIChvcHRpb25zLm1vZGUpIHtcbiAgICAgIGNhc2UgRW56eW1lQWRhcHRlci5NT0RFUy5NT1VOVDogcmV0dXJuIHRoaXMuY3JlYXRlTW91bnRSZW5kZXJlcihvcHRpb25zKTtcbiAgICAgIGNhc2UgRW56eW1lQWRhcHRlci5NT0RFUy5TSEFMTE9XOiByZXR1cm4gdGhpcy5jcmVhdGVTaGFsbG93UmVuZGVyZXIob3B0aW9ucyk7XG4gICAgICBjYXNlIEVuenltZUFkYXB0ZXIuTU9ERVMuU1RSSU5HOiByZXR1cm4gdGhpcy5jcmVhdGVTdHJpbmdSZW5kZXJlcihvcHRpb25zKTtcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgRW56eW1lIEludGVybmFsIEVycm9yOiBVbnJlY29nbml6ZWQgbW9kZTogJHtvcHRpb25zLm1vZGV9YCk7XG4gICAgfVxuICB9XG5cbiAgd3JhcChlbGVtZW50KSB7XG4gICAgcmV0dXJuIHdyYXAoZWxlbWVudCk7XG4gIH1cblxuICAvLyBjb252ZXJ0cyBhbiBSU1ROb2RlIHRvIHRoZSBjb3JyZXNwb25kaW5nIEpTWCBQcmFnbWEgRWxlbWVudC4gVGhpcyB3aWxsIGJlIG5lZWRlZFxuICAvLyBpbiBvcmRlciB0byBpbXBsZW1lbnQgdGhlIGBXcmFwcGVyLm1vdW50KClgIGFuZCBgV3JhcHBlci5zaGFsbG93KClgIG1ldGhvZHMsIGJ1dCBzaG91bGRcbiAgLy8gYmUgcHJldHR5IHN0cmFpZ2h0Zm9yd2FyZCBmb3IgcGVvcGxlIHRvIGltcGxlbWVudC5cbiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIGNsYXNzLW1ldGhvZHMtdXNlLXRoaXNcbiAgbm9kZVRvRWxlbWVudChub2RlKSB7XG4gICAgaWYgKCFub2RlIHx8IHR5cGVvZiBub2RlICE9PSAnb2JqZWN0JykgcmV0dXJuIG51bGw7XG4gICAgY29uc3QgeyB0eXBlIH0gPSBub2RlO1xuICAgIHJldHVybiBSZWFjdC5jcmVhdGVFbGVtZW50KHVubWVtb1R5cGUodHlwZSksIHByb3BzV2l0aEtleXNBbmRSZWYobm9kZSkpO1xuICB9XG5cbiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIGNsYXNzLW1ldGhvZHMtdXNlLXRoaXNcbiAgbWF0Y2hlc0VsZW1lbnRUeXBlKG5vZGUsIG1hdGNoaW5nVHlwZSkge1xuICAgIGlmICghbm9kZSkge1xuICAgICAgcmV0dXJuIG5vZGU7XG4gICAgfVxuICAgIGNvbnN0IHsgdHlwZSB9ID0gbm9kZTtcbiAgICByZXR1cm4gdW5tZW1vVHlwZSh0eXBlKSA9PT0gdW5tZW1vVHlwZShtYXRjaGluZ1R5cGUpO1xuICB9XG5cbiAgZWxlbWVudFRvTm9kZShlbGVtZW50KSB7XG4gICAgcmV0dXJuIGVsZW1lbnRUb1RyZWUoZWxlbWVudCk7XG4gIH1cblxuICBub2RlVG9Ib3N0Tm9kZShub2RlLCBzdXBwb3J0c0FycmF5ID0gZmFsc2UpIHtcbiAgICBjb25zdCBub2RlcyA9IG5vZGVUb0hvc3ROb2RlKG5vZGUpO1xuICAgIGlmIChBcnJheS5pc0FycmF5KG5vZGVzKSAmJiAhc3VwcG9ydHNBcnJheSkge1xuICAgICAgcmV0dXJuIG5vZGVzWzBdO1xuICAgIH1cbiAgICByZXR1cm4gbm9kZXM7XG4gIH1cblxuICBkaXNwbGF5TmFtZU9mTm9kZShub2RlKSB7XG4gICAgaWYgKCFub2RlKSByZXR1cm4gbnVsbDtcbiAgICBjb25zdCB7IHR5cGUsICQkdHlwZW9mIH0gPSBub2RlO1xuICAgIGNvbnN0IGFkYXB0ZXIgPSB0aGlzO1xuXG4gICAgY29uc3Qgbm9kZVR5cGUgPSB0eXBlIHx8ICQkdHlwZW9mO1xuXG4gICAgLy8gbmV3ZXIgbm9kZSB0eXBlcyBtYXkgYmUgdW5kZWZpbmVkLCBzbyBvbmx5IHRlc3QgaWYgdGhlIG5vZGVUeXBlIGV4aXN0c1xuICAgIGlmIChub2RlVHlwZSkge1xuICAgICAgc3dpdGNoIChub2RlVHlwZSkge1xuICAgICAgICBjYXNlIENvbmN1cnJlbnRNb2RlIHx8IE5hTjogcmV0dXJuICdDb25jdXJyZW50TW9kZSc7XG4gICAgICAgIGNhc2UgRnJhZ21lbnQgfHwgTmFOOiByZXR1cm4gJ0ZyYWdtZW50JztcbiAgICAgICAgY2FzZSBTdHJpY3RNb2RlIHx8IE5hTjogcmV0dXJuICdTdHJpY3RNb2RlJztcbiAgICAgICAgY2FzZSBQcm9maWxlciB8fCBOYU46IHJldHVybiAnUHJvZmlsZXInO1xuICAgICAgICBjYXNlIFBvcnRhbCB8fCBOYU46IHJldHVybiAnUG9ydGFsJztcbiAgICAgICAgY2FzZSBTdXNwZW5zZSB8fCBOYU46IHJldHVybiAnU3VzcGVuc2UnO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgfVxuICAgIH1cblxuICAgIGNvbnN0ICQkdHlwZW9mVHlwZSA9IHR5cGUgJiYgdHlwZS4kJHR5cGVvZjtcblxuICAgIHN3aXRjaCAoJCR0eXBlb2ZUeXBlKSB7XG4gICAgICBjYXNlIENvbnRleHRDb25zdW1lciB8fCBOYU46IHJldHVybiAnQ29udGV4dENvbnN1bWVyJztcbiAgICAgIGNhc2UgQ29udGV4dFByb3ZpZGVyIHx8IE5hTjogcmV0dXJuICdDb250ZXh0UHJvdmlkZXInO1xuICAgICAgY2FzZSBNZW1vIHx8IE5hTjoge1xuICAgICAgICBjb25zdCBub2RlTmFtZSA9IGRpc3BsYXlOYW1lT2ZOb2RlKG5vZGUpO1xuICAgICAgICByZXR1cm4gdHlwZW9mIG5vZGVOYW1lID09PSAnc3RyaW5nJyA/IG5vZGVOYW1lIDogYE1lbW8oJHthZGFwdGVyLmRpc3BsYXlOYW1lT2ZOb2RlKHR5cGUpfSlgO1xuICAgICAgfVxuICAgICAgY2FzZSBGb3J3YXJkUmVmIHx8IE5hTjoge1xuICAgICAgICBpZiAodHlwZS5kaXNwbGF5TmFtZSkge1xuICAgICAgICAgIHJldHVybiB0eXBlLmRpc3BsYXlOYW1lO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IG5hbWUgPSBhZGFwdGVyLmRpc3BsYXlOYW1lT2ZOb2RlKHsgdHlwZTogdHlwZS5yZW5kZXIgfSk7XG4gICAgICAgIHJldHVybiBuYW1lID8gYEZvcndhcmRSZWYoJHtuYW1lfSlgIDogJ0ZvcndhcmRSZWYnO1xuICAgICAgfVxuICAgICAgY2FzZSBMYXp5IHx8IE5hTjoge1xuICAgICAgICByZXR1cm4gJ2xhenknO1xuICAgICAgfVxuICAgICAgZGVmYXVsdDogcmV0dXJuIGRpc3BsYXlOYW1lT2ZOb2RlKG5vZGUpO1xuICAgIH1cbiAgfVxuXG4gIGlzVmFsaWRFbGVtZW50KGVsZW1lbnQpIHtcbiAgICByZXR1cm4gaXNFbGVtZW50KGVsZW1lbnQpO1xuICB9XG5cbiAgaXNWYWxpZEVsZW1lbnRUeXBlKG9iamVjdCkge1xuICAgIHJldHVybiAhIW9iamVjdCAmJiBpc1ZhbGlkRWxlbWVudFR5cGUob2JqZWN0KTtcbiAgfVxuXG4gIGlzRnJhZ21lbnQoZnJhZ21lbnQpIHtcbiAgICByZXR1cm4gdHlwZU9mTm9kZShmcmFnbWVudCkgPT09IEZyYWdtZW50O1xuICB9XG5cbiAgaXNDdXN0b21Db21wb25lbnQodHlwZSkge1xuICAgIGNvbnN0IGZha2VFbGVtZW50ID0gbWFrZUZha2VFbGVtZW50KHR5cGUpO1xuICAgIHJldHVybiAhIXR5cGUgJiYgKFxuICAgICAgdHlwZW9mIHR5cGUgPT09ICdmdW5jdGlvbidcbiAgICAgIHx8IGlzRm9yd2FyZFJlZihmYWtlRWxlbWVudClcbiAgICAgIHx8IGlzQ29udGV4dFByb3ZpZGVyKGZha2VFbGVtZW50KVxuICAgICAgfHwgaXNDb250ZXh0Q29uc3VtZXIoZmFrZUVsZW1lbnQpXG4gICAgICB8fCBpc1N1c3BlbnNlKGZha2VFbGVtZW50KVxuICAgICk7XG4gIH1cblxuICBpc0NvbnRleHRDb25zdW1lcih0eXBlKSB7XG4gICAgcmV0dXJuICEhdHlwZSAmJiBpc0NvbnRleHRDb25zdW1lcihtYWtlRmFrZUVsZW1lbnQodHlwZSkpO1xuICB9XG5cbiAgaXNDdXN0b21Db21wb25lbnRFbGVtZW50KGluc3QpIHtcbiAgICBpZiAoIWluc3QgfHwgIXRoaXMuaXNWYWxpZEVsZW1lbnQoaW5zdCkpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuaXNDdXN0b21Db21wb25lbnQoaW5zdC50eXBlKTtcbiAgfVxuXG4gIGdldFByb3ZpZGVyRnJvbUNvbnN1bWVyKENvbnN1bWVyKSB7XG4gICAgLy8gUmVhY3Qgc3RvcmVzIHJlZmVyZW5jZXMgdG8gdGhlIFByb3ZpZGVyIG9uIGEgQ29uc3VtZXIgZGlmZmVyZW50bHkgYWNyb3NzIHZlcnNpb25zLlxuICAgIGlmIChDb25zdW1lcikge1xuICAgICAgbGV0IFByb3ZpZGVyO1xuICAgICAgaWYgKENvbnN1bWVyLl9jb250ZXh0KSB7IC8vIGNoZWNrIHRoaXMgZmlyc3QsIHRvIGF2b2lkIGEgZGVwcmVjYXRpb24gd2FybmluZ1xuICAgICAgICAoeyBQcm92aWRlciB9ID0gQ29uc3VtZXIuX2NvbnRleHQpO1xuICAgICAgfSBlbHNlIGlmIChDb25zdW1lci5Qcm92aWRlcikge1xuICAgICAgICAoeyBQcm92aWRlciB9ID0gQ29uc3VtZXIpO1xuICAgICAgfVxuICAgICAgaWYgKFByb3ZpZGVyKSB7XG4gICAgICAgIHJldHVybiBQcm92aWRlcjtcbiAgICAgIH1cbiAgICB9XG4gICAgdGhyb3cgbmV3IEVycm9yKCdFbnp5bWUgSW50ZXJuYWwgRXJyb3I6IGNhbuKAmXQgZmlndXJlIG91dCBob3cgdG8gZ2V0IFByb3ZpZGVyIGZyb20gQ29uc3VtZXInKTtcbiAgfVxuXG4gIGNyZWF0ZUVsZW1lbnQoLi4uYXJncykge1xuICAgIHJldHVybiBSZWFjdC5jcmVhdGVFbGVtZW50KC4uLmFyZ3MpO1xuICB9XG5cbiAgd3JhcFdpdGhXcmFwcGluZ0NvbXBvbmVudChub2RlLCBvcHRpb25zKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIFJvb3RGaW5kZXIsXG4gICAgICBub2RlOiB3cmFwV2l0aFdyYXBwaW5nQ29tcG9uZW50KFJlYWN0LmNyZWF0ZUVsZW1lbnQsIG5vZGUsIG9wdGlvbnMpLFxuICAgIH07XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBSZWFjdFNldmVudGVlbkFkYXB0ZXI7XG4iXX0=
//# sourceMappingURL=ReactSeventeenAdapter.js.map