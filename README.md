## FocusObserver

With the introduction of ShadowDOM, tracking active focus elements on the page
for the purposes of accessibility features has been complicated. `FocusObserver`
is intended to simplify observation of focus changes that span the full depth of
the accessibility tree, including parts of the tree within shadow roots.

### Usage

`FocusObserver` has an interface that is modeled after `MutationObserver`.

```javascript
var focusObserver = new FocusObserver(function onFocus(event) {
  console.log('The current active element is', event.activeElement);
  console.log('The active element\'s root is', event.activeRoot);
  console.log('The active element\'s host is', event.activeHost):
});

// Connect the focus observer..
focusObserver.observe();

// Disconnect the focus observer..
focusObserver.disconnect();
```

