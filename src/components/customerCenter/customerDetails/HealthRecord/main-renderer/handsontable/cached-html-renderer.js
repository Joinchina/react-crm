import Handsontable from './lib';
import cellDecorator from './cell-decorator';

const cachedInnerHtml = Symbol('cachedInnerHtml');

export default function cachedHtmlRenderer(
    hotInstance, td, row, column, prop, html, cellProperties,
) {
    if (td[cachedInnerHtml] === html) {
        cellDecorator(
            hotInstance, td, row, column, prop, html, cellProperties,
        );
        return;
    }
    /* eslint-disable-next-line no-param-reassign */
    td[cachedInnerHtml] = html;
    Handsontable.renderers.HtmlRenderer(
        hotInstance, td, row, column, prop, html, cellProperties,
    );
}
