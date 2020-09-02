/* eslint-disable class-methods-use-this */
import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import Handsontable from '../lib';

export class BaseComponent extends Component {
    state = {
        value: null,
    }

    getValue() {
        const { value } = this.state;
        return value;
    }

    setValue = (value) => {
        this.setState({ value });
    }

    refElement = (ref) => {
        this.element = ref;
    }

    focus() {
        if (this.element) {
            this.element.focus();
        }
    }

    blur() {
        if (this.element) {
            this.element.blur();
        }
    }
}

function stopImmediatePropagation(event) {
    /* eslint-disable-next-line no-param-reassign */
    event.isImmediatePropagationEnabled = false;
    /* eslint-disable-next-line no-param-reassign */
    event.cancelBubble = true;
}

export const NativeHandler = stopImmediatePropagation;

function handleClipboard(editor, event) {
    const ctrlDown = (event.ctrlKey || event.metaKey) && !event.altKey;
    if (ctrlDown) {
        // CTRL+A, CTRL+C, CTRL+V, CTRL+X should only work locally
        // when cell is edited (not in table context)
        stopImmediatePropagation(event);
    }
}

function handleClear(editor, event) {
    // backspace, delete, home, end should only work locally
    // when cell is edited (not in table context)
    stopImmediatePropagation(event);
}

function handleSubmit(editor) {
    editor.finishEditing(false);
    return false;
}

function handleClose(editor) {
    editor.finishEditing(true);
    return false;
}

const { KEY_CODES } = Handsontable.helper;

export const InputKeyCodeHandlers = {
    [KEY_CODES.ENTER]: handleSubmit,
    [KEY_CODES.A]: handleClipboard,
    [KEY_CODES.X]: handleClipboard,
    [KEY_CODES.C]: handleClipboard,
    [KEY_CODES.V]: handleClipboard,
    [KEY_CODES.BACKSPACE]: handleClear,
    [KEY_CODES.DELETE]: handleClear,
    [KEY_CODES.HOME]: handleClear,
    [KEY_CODES.END]: handleClear,
};

export const PopupKeyCodeHandlers = {
    [KEY_CODES.ENTER]: handleSubmit,
    [KEY_CODES.BACKSPACE]: handleClose,
    [KEY_CODES.DELETE]: handleClose,
    [KEY_CODES.HOME]: handleClose,
    [KEY_CODES.END]: handleClose,
};

export default class AntdBaseEditor extends Handsontable.editors.BaseEditor {
    handleKeyCodes = {};

    static Handlers = {
        native: handleClear,
        submit: handleSubmit,
        cancel: handleClose,
    }

    static InputKeyCodeHandlers = InputKeyCodeHandlers;

    static PopupKeyCodeHandlers = PopupKeyCodeHandlers;

    onBeforeKeyDown = (event) => {
        this.handleKeyDown(event);
    }

    handleKeyDown(event, handleKeyCodes = this.handleKeyCodes) {
        if (handleKeyCodes[event.keyCode]) {
            if (handleKeyCodes[event.keyCode](this, event) === false) {
                event.stopImmediatePropagation();
                event.preventDefault();
            }
        }
    }

    onAfterScroll = () => {
        const editorSection = this.checkEditorSection();
        let cssTransformOffset;

        switch (editorSection) {
        case 'top':
            cssTransformOffset = Handsontable.dom.getCssTransform(
                this.instance.view.wt.wtOverlays.topOverlay
                    .clone.wtTable.holder.parentNode,
            );
            break;
        case 'left':
            cssTransformOffset = Handsontable.dom.getCssTransform(
                this.instance.view.wt.wtOverlays.leftOverlay
                    .clone.wtTable.holder.parentNode,
            );
            break;
        case 'corner':
            cssTransformOffset = Handsontable.dom.getCssTransform(
                this.instance.view.wt.wtOverlays.topLeftCornerOverlay
                    .clone.wtTable.holder.parentNode,
            );
            break;
        default:
        }

        const selectStyle = this.element.style;

        if (cssTransformOffset && cssTransformOffset !== -1) {
            const [key, value] = cssTransformOffset;
            selectStyle[key] = value;
        } else {
            Handsontable.dom.resetCssTransform(this.element);
        }
    }

    getPopupContainer = () => {
        let elem = this.instance.rootElement.getElementsByClassName('ht-antd-popup-container')[0];
        if (!elem) {
            elem = document.createElement('div');
            elem.className = 'ht-antd-popup-container';
            elem.addEventListener('wheel', e => e.stopPropagation());
            this.instance.rootElement.appendChild(elem);
        }
        return elem;
    }

    init() {
        this.element = document.createElement('div');
        Handsontable.dom.addClass(this.element, 'ht-antd');
        if (this.getContainerClassName()) {
            Handsontable.dom.addClass(this.element, this.getContainerClassName());
        }
        this.instance.rootElement.appendChild(this.element);
        this.reactRootElement = this.getReactRootElement();
        this.refReactComponent = (ref) => {
            this.reactComponent = ref;
        };
    }

    getReactRootElement() {
        return this.element;
    }

    saveValue(value, ctrlDown) {
        super.saveValue(value, ctrlDown);
        this.originalValue = value;
    }

    prepare(...args) {
        super.prepare(...args);
        const elem = this.render();
        ReactDOM.render(
            React.cloneElement(elem, { ref: this.refReactComponent }),
            this.reactRootElement,
        );
    }

    render() {
        throw new Error('render should be overridden in subclasses');
    }

    getValue() {
        return this.reactComponent.getValue();
    }

    getContainerClassName() {
        return '';
    }

    setValue(value) {
        this.reactComponent.setValue(value);
    }

    onSubmit = (ctrlDown) => {
        this.finishEditing(false, ctrlDown);
    }

    onCancel = (ctrlDown) => {
        this.finishEditing(true, ctrlDown);
    }

    checkEditorSection() {
        if (this.row < this.instance.getSettings().fixedRowsTop) {
            if (this.col < this.instance.getSettings().fixedColumnsLeft) {
                return 'corner';
            }
            return 'top';
        }
        if (this.col < this.instance.getSettings().fixedColumnsLeft) {
            return 'left';
        }
        return null;
    }

    /* 此函数目标是让子类进行扩展，此处只要有简单的实现即可 */
    /* eslint-disable-next-line class-methods-use-this, no-unused-vars */
    initValueFromEvent(event) {

    }

    open(event) {
        const width = Handsontable.dom.outerWidth(this.TD);
        const height = Handsontable.dom.outerHeight(this.TD);
        const rootOffset = Handsontable.dom.offset(this.instance.rootElement);
        const tdOffset = Handsontable.dom.offset(this.TD);
        const editorSection = this.checkEditorSection();
        let cssTransformOffset;

        switch (editorSection) {
        case 'top':
            cssTransformOffset = Handsontable.dom.getCssTransform(
                this.instance.view.wt.wtOverlays.topOverlay
                    .clone.wtTable.holder.parentNode,
            );
            break;
        case 'left':
            cssTransformOffset = Handsontable.dom.getCssTransform(
                this.instance.view.wt.wtOverlays.leftOverlay
                    .clone.wtTable.holder.parentNode,
            );
            break;
        case 'corner':
            cssTransformOffset = Handsontable.dom.getCssTransform(
                this.instance.view.wt.wtOverlays.topLeftCornerOverlay
                    .clone.wtTable.holder.parentNode,
            );
            break;
        default:
        }

        const selectStyle = this.element.style;

        if (cssTransformOffset && cssTransformOffset !== -1) {
            const [key, value] = cssTransformOffset;
            selectStyle[key] = value;
        } else {
            Handsontable.dom.resetCssTransform(this.element);
        }

        selectStyle.height = `${height}px`;
        selectStyle.width = `${width}px`;
        selectStyle.top = `${tdOffset.top - rootOffset.top}px`;
        selectStyle.left = `${tdOffset.left - rootOffset.left}px`;
        selectStyle.margin = '0px';

        this.element.style.display = 'block';

        this.initValueFromEvent(event);

        this.instance.addHook('beforeKeyDown', this.onBeforeKeyDown);
        if (editorSection) {
            this.instance.addHook('afterScrollVertically', this.onAfterScroll);
            this.instance.addHook('afterScrollHorizontally', this.onAfterScroll);
        }
    }

    close() {
        this.blur();
        this.element.style.display = 'none';
        const editorSection = this.checkEditorSection();
        this.instance.removeHook('beforeKeyDown', this.onBeforeKeyDown);
        if (editorSection) {
            this.instance.removeHook('afterScrollVertically', this.onAfterScroll);
            this.instance.removeHook('afterScrollHorizontally', this.onAfterScroll);
        }
    }

    focus() {
        this.reactComponent.focus();
    }

    blur() {
        this.reactComponent.blur();
    }
}
