import Handsontable from './lib';

export default function cellDecorator(hotInstance, td, row, column, prop, value, cellProperties) {
    /* eslint-disable-next-line no-param-reassign */
    // td.className = '';
    Handsontable.renderers.cellDecorator(
        hotInstance, td, row, column, prop, value, cellProperties,
    );
    const { additionalClassNames } = cellProperties;
    if (additionalClassNames) {
        for (const className of Object.keys(additionalClassNames)) {
            if (additionalClassNames[className]) {
                Handsontable.dom.addClass(td, className);
            } else {
                Handsontable.dom.removeClass(td, className);
            }
        }
    }
}
