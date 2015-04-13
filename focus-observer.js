/**
 * Copyright (c) 2015 Chris Joel (MIT Licensed)
 */
(function () {

  var DOM = {
    /**
     * For a given node, returns true if the node is a root. A root in this
     * case is defined as a document or document fragment.
     */
    isRootNode: function (node) {
      return node.nodeType === Node.DOCUMENT_NODE ||
        node.nodeType === Node.DOCUMENT_FRAGMENT_NODE;
    },

    /**
     * For a given node, returns the closest root. A root in this case is
     * defined as the closest ancestor document or document fragment.
     */
    rootFor: function (node) {
      if (node.shadowRoot) {
        node = node.shadowRoot;
      }

      while (node && !DOM.isRootNode(node)) {
        node = node.parentNode;
      }

      if (!node) {
        node = document;
      }

      return node;
    },

    /**
     * Returns the deepest active element in the document by walking the chain
     * of shadow roots and their corresponding active elements until no more
     * are found.
     */
    getDeepActiveElement: function () {
      var active = document.activeElement;

      if (!active) {
        return;
      }

      while (active.shadowRoot && active.shadowRoot.activeElement) {
        active = active.shadowRoot.activeElement;
      }

      if (active === document.activeElement) {
        return;
      }

      return active;
    }
  };


  /**
   * FocusState
   *
   * This class maintains pointers to various elements in the document that
   * collectively represent a snapshot of the focus state at the time that
   * the FocusState was instantiated.
   */
  function FocusState () {
    this.documentActiveElement = document.activeElement;
    this.deepActiveElement = DOM.getDeepActiveElement();
    this.activeRoot = DOM.rootFor(this.activeElement);
  }

  FocusState.prototype = {
    get activeElement () {
      return this.deepActiveElement ||
        this.documentActiveElement;
    },

    get activeHost () {
      return this.activeRoot.host || window;
    },

    isSameAs: function (otherState) {
      return !!otherState &&
        otherState.activeElement === this.activeElement;
    }
  };


  /**
   * Subscription
   *
   * This class represents a capturing event binding to a given target. It
   * allows bound listeners to be tracked and removed without maintaining
   * pointers to their related targets.
   */
  function Subscription (target, event, handler) {
    this.target = target;
    this.event = event;
    this.handler = handler;

    this.target.addEventListener(event, handler, true);
  }

  Subscription.prototype = {
    remove: function() {
      this.target.removeEventListener(this.event, this.handler, true);
    }
  };


  /**
   * FocusObserver
   *
   * This class's interface is modeled after MutationObserver. It takes a
   * callback as the single argument for the constructor. The callback will
   * be called whenever the focus state of the page changes.
   */
  function FocusObserver (changeCallback) {
    this.changeCallback = changeCallback;
    this.updateStateTimer = null;
    this.currentState = null;

    this.rootFocusListener = null;
    this.rootBlurListener = null;
    this.localFocusListener = null;
    this.localBlurListener = null;

    this.updateState();
  }

  FocusObserver.prototype = {
    observe: function () {
      this.disconnect();
      this.updateListeners();
      this.updateState();
    },

    disconnect: function () {
      if (this.rootBlurListener) {
        this.rootBlurListener.remove();
      }

      if (this.rootFocusListener) {
        this.rootFocusListener.remove();
      }

      if (this.localBlurListener) {
        this.localBlurListener.remove();
      }

      if (this.localFocusListener) {
        this.localFocusListener.remove();
      }
    },

    updateState: function () {
      var nextState = new FocusState();

      if (nextState.isSameAs(this.currentState)) {
        return;
      }

      this.currentState = nextState;
      this.updateListeners();
      this.changeCallback(this.currentState);
    },

    debouncedUpdateState: function () {
      if (this.updateStateTimer !== null) {
        return;
      }

      this.updateStateTimer = window.setTimeout(function () {
        this.updateStateTimer = null;
        this.updateState();
      }.bind(this), 0);
    },

    onFocus: function () {
      this.updateState();
    },

    onBlur: function () {
      this.debouncedUpdateState();
    },

    updateListeners: function () {
      this.disconnect();

      this.rootBlurListener = new Subscription(
        this.currentState.activeRoot,
        'blur',
        this.onBlur.bind(this)
      );

      this.rootFocusListener = new Subscription(
        this.currentState.activeRoot,
        'focus',
        this.onFocus.bind(this)
      );

      this.localBlurListener = new Subscription(
        this.currentState.activeElement,
        'blur',
        this.onBlur.bind(this)
      );

      this.localFocusListener = new Subscription(
        this.currentState.activeRoot,
        'focus',
        this.onFocus.bind(this)
      );
    }
  };

  window.FocusObserver = FocusObserver;
})();
