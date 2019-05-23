'use strict';

import React, { PropTypes } from 'react';
import ReactNative, { requireNativeComponent, View, StyleSheet } from 'react-native';

var {
    NativeModules: { UIManager, CrosswalkWebViewManager: { JSNavigationScheme } }
} = ReactNative;

var resolveAssetSource = require('react-native/Libraries/Image/resolveAssetSource')



var WEBVIEW_REF = 'crosswalkWebView';


var hasOwnProperty = Object.prototype.hasOwnProperty;

/**
 * inlined Object.is polyfill to avoid requiring consumers ship their own
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is
 */
function is(x, y) {
  // SameValue algorithm
  if (x === y) {
    // Steps 1-5, 7-10
    // Steps 6.b-6.e: +0 != -0
    // Added the nonzero y check to make Flow happy, but it is redundant
    return x !== 0 || y !== 0 || 1 / x === 1 / y;
  } else {
    // Step 6.a: NaN == NaN
    return x !== x && y !== y;
  }
}

/**
 * Performs equality by iterating through keys on an object and returning false
 * when any key has values which are not strictly equal between the arguments.
 * Returns true when the values of all keys are strictly equal.
 */
function shallowEqual(objA, objB) {
  if (is(objA, objB)) {
    return true;
  }

  if (typeof objA !== 'object' || objA === null || typeof objB !== 'object' || objB === null) {
    return false;
  }

  var keysA = Object.keys(objA);
  var keysB = Object.keys(objB);

  if (keysA.length !== keysB.length) {
    return false;
  }

  // Test for A's keys different from B.
  for (var i = 0; i < keysA.length; i++) {
    if (!hasOwnProperty.call(objB, keysA[i]) || !is(objA[keysA[i]], objB[keysA[i]])) {
      return false;
    }
  }

  return true;
}

var CrosswalkWebView = React.createClass({
    statics:   { JSNavigationScheme },
    propTypes: {
        localhost:               PropTypes.bool.isRequired,
        onNavigationStateChange: PropTypes.func,
        onError:                 PropTypes.func,
        url:                     PropTypes.string,
        injectedJavaScript:      PropTypes.string,
        source:                  PropTypes.oneOfType([
          PropTypes.shape({
           uri: PropTypes.string, // uri to load in webview
          }),
          PropTypes.shape({
           html: PropTypes.string, // static html to load in webview
          }),
           PropTypes.number, // used internally by packager
        ]),
        ...View.propTypes
    },
    getDefaultProps () {
        return {
            localhost: false
        };
    },
    shouldComponentUpdate (nextProps, nextState) {
      return (
        !shallowEqual(this.props, nextProps) ||
        !shallowEqual(this.state, nextState)
      );
    },
    render () {
      var source = this.props.source || {};
      if (this.props.url) {
        source.uri = this.props.url;
      }
      return (
          <NativeCrosswalkWebView
            { ...this.props }
            ref={ WEBVIEW_REF }
            source={resolveAssetSource(source)}
            onNavigationStateChange={ this.onNavigationStateChange }
            onError={ this.onError } />
      );
    },
    getWebViewHandle () {
        return React.findNodeHandle(this.refs[WEBVIEW_REF]);
    },
    onNavigationStateChange (event) {
        var { onNavigationStateChange } = this.props;
        if (onNavigationStateChange) {
            onNavigationStateChange(event.nativeEvent);
        }
    },
    onError (event) {
        var { onError } = this.props;
        if (onError) {
            onError(event.nativeEvent);
        }
    },
    goBack () {
        UIManager.dispatchViewManagerCommand(
            this.getWebViewHandle(),
            UIManager.NativeCrosswalkWebView.Commands.goBack,
            null
        );
    },
    goForward () {
        UIManager.dispatchViewManagerCommand(
            this.getWebViewHandle(),
            UIManager.NativeCrosswalkWebView.Commands.goForward,
            null
        );
    },
    reload () {
        UIManager.dispatchViewManagerCommand(
            this.getWebViewHandle(),
            UIManager.NativeCrosswalkWebView.Commands.reload,
            null
        );
    }
});

var NativeCrosswalkWebView = requireNativeComponent('CrosswalkWebView', CrosswalkWebView);

export default CrosswalkWebView;
