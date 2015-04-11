/**
 * Copyright (c) 2015 Chris Joel (MIT Licensed)
 */
function ElementDisplayNameFor(element) {
  if (element === window) {
    return 'window';
  }

  return element ?
    element.nodeName + (element.id ? (':' + element.id) : '') :
    'None';
}

function TemplateFor(tagName) {
  return document.getElementById(tagName + '-template');
}

function RegisterElement(tagName) {
  var template = TemplateFor(tagName);
  var xProto = Object.create(HTMLElement.prototype);

  xProto.createdCallback = function() {
    this.createShadowRoot()
    .appendChild(
      document.importNode(template.content, true)
    );
  };

  document.registerElement(tagName, {
    prototype: xProto
  });
}

function UpdateAnalysis(event) {
  var analysis = 'document.activeElement => ' +
    ElementDisplayNameFor(document.activeElement) + '\n' +
    'event.activeElement => ' + ElementDisplayNameFor(event.activeElement) + '\n' +
    'event.activeHost => ' + ElementDisplayNameFor(event.activeHost) + '\n' +
    'event.activeRoot => ' + ElementDisplayNameFor(event.activeRoot);

  document.querySelector('#FocusedElement').textContent = analysis;
}


RegisterElement('x-menu');
RegisterElement('x-button-item');

window.phantasmalMenu = XMenu3;
window.phantasmalMenuParent = XMenu3.parentNode;

window.setInterval(function () {
  if (phantasmalMenu.parentNode) {
    phantasmalMenu.parentNode.removeChild(XMenu3);
  } else {
    phantasmalMenuParent.appendChild(phantasmalMenu);
  }
}, 3000);


