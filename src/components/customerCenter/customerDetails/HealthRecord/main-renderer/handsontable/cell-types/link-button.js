import { render } from '../jsx-dom';
import Handsontable from '../lib';
import './link-button.less';

const LinkButtonRendererCache = Symbol('LinkButtonRendererCache');

function LinkButtonRenderer(hotInstance, td, row, column, prop, value, cellProperties) {
    /* eslint-disable */
    Handsontable.renderers.cellDecorator(hotInstance, td, row, column, prop, value, cellProperties);
    const { onClick, buttonType = 'default' } = cellProperties;
    const cached = td[LinkButtonRendererCache];
    if (cached
        && cached.row === row
        && cached.value === value
        && cached.onClick === onClick
        && cached.buttonType === buttonType) {
        return;
    }
    td[LinkButtonRendererCache] = { row, value, onClick, buttonType };
    function actualOnClick(event) {
        event.stopPropagation();
        onClick(row);
    }
    Handsontable.dom.empty(td);
    if (value) {
        td.appendChild(render(React => (
            <a className={`link-button-btn link-button-btn-${buttonType}`} onClick={actualOnClick}>{ value }</a>
        )));
    }
    /* eslint-enable */
}

class LinkButtonEditor extends Handsontable.editors.BaseEditor {
    open(event) {
        setTimeout(() => this.finishEditing());
        if (event.keyCode === Handsontable.helper.KEY_CODES.ENTER) {
            if (this.value) {
                const { onClick } = this.cellProperties;
                onClick(this.row);
            }
        }
    }

    /* editor lifecycle callback stubs */
    /* eslint-disable-next-line class-methods-use-this */
    focus() { }

    /* eslint-disable-next-line class-methods-use-this */
    close() { }

    getValue() {
        return this.value;
    }

    setValue(value) {
        this.value = value;
    }
}

export default {
    editor: LinkButtonEditor,
    renderer: LinkButtonRenderer,
    className: 'ht-antd-link-button',
};
