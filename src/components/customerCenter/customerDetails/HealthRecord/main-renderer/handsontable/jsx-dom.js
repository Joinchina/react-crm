/* eslint-disable */
/* modified from create-element-x */

const isArray =
  Array.isArray ||
  (arg => Object.prototype.toString.call(arg) === "[object Array]");
const isHTMLCollection = arg =>
  Object.prototype.toString.call(arg) === "[object HTMLCollection]";
const isNodeList = arg =>
  Object.prototype.toString.call(arg) === "[object NodeList]";

const renameAttributes = {
    className: 'class',
    htmlFor: 'for',
}
export const createCreateElement = (createElement, createTextNode) => {

  return (tagName, attributes, ...children) => {
    const el = createElement(tagName);

    for (const attr in attributes) {
        if (attr.startsWith('__')) {
            //ignore debug props
        } else if (attr.startsWith('on')) {
            el[attr.toLowerCase()] = attributes[attr];
        } else {
            el.setAttribute(renameAttributes[attr] || attr, attributes[attr]);
        }
    }

    function appendChild(el, children) {
        if (children === null) return;
        let shouldCopy;
        if (
            isArray(children) ||
            (shouldCopy = isHTMLCollection(children)) ||
            (shouldCopy = isNodeList(children))
        ) {
            let cs = children;
            if (shouldCopy) {
                cs = Array.prototype.slice.call(cs, 0);
            }
            cs.forEach(item => appendChild(el, item));
        } else if (typeof children === "string" || typeof children === "number") {
            el.appendChild(createTextNode(`${children}`));
        } else {
            el.appendChild(children);
        }
    }

    appendChild(el, children);

    return el;
  };
};

export const createElement = createCreateElement(
  document.createElement.bind(document),
  document.createTextNode.bind(document)
);
const React = { createElement };
export default React;

export function render(callback) {
    return callback(React);
}
