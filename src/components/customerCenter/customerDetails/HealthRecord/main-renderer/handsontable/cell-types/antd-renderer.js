import Handsontable from '../lib';
import cachedHtmlRenderer from '../cached-html-renderer';

function DefaultComponent(value, cellProperties) {
    const {
        validateStatus,
        help,
        formatter,
    } = cellProperties;
    if (validateStatus === 'warning') {
        return `
            <span>
                ${value === null || value === undefined ? '' : value}
                <span class="ht-antd-cell-icon">
                    <i theme="filled" class="anticon anticon-${help}"></i>
                </span>
            </span>
        `;
    }
    if (formatter) {
        return formatter(value);
    }
    return value || null;
}

export default function makeAntdRenderer(Target = DefaultComponent) {
    function Renderer(value, cellProperties, row, column) {
        let {
            validateStatus,
            help,
        } = cellProperties;
        if (typeof validateStatus === 'function') {
            validateStatus = validateStatus(row, column);
        }
        if (typeof help === 'function') {
            help = help(row, column);
        }
        if (validateStatus === 'error') {
            return `
                <span>
                    ${help || ''}
                    <span class="ht-antd-cell-icon">
                        <i theme="filled" class="anticon anticon-exclamation-circle"></i>
                    </span>
                </span>
            `;
        }
        return Target(value, cellProperties);
    }

    Renderer.processTableCell = (td, value, cellProperties, row, column) => {
        let { validateStatus } = cellProperties;
        if (typeof validateStatus === 'function') {
            validateStatus = validateStatus(row, column);
        }
        if (validateStatus === 'error') {
            Handsontable.dom.addClass(td, 'ht-antd-validate-error');
        } else {
            Handsontable.dom.removeClass(td, 'ht-antd-validate-error');
        }
        if (validateStatus === 'warning') {
            Handsontable.dom.addClass(td, 'ht-antd-validate-warning');
        } else {
            Handsontable.dom.removeClass(td, 'ht-antd-validate-warning');
        }
        if (Target.processTableCell) {
            Target.processTableCell(td, value, cellProperties);
        }
    };

    return function antdRenderer(hotInstance, td, row, column, prop, value, cellProperties) {
        const html = Renderer(value, cellProperties, row, column);
        Renderer.processTableCell(td, value, cellProperties, row, column);
        cachedHtmlRenderer(hotInstance, td, row, column, prop, html, cellProperties);
    };
}
