import makeAntdRenderer from './antd-renderer';
import Handsontable from '../lib';

export default {
    editor: Handsontable.editors.TextEditor,
    renderer: makeAntdRenderer(),
    className: 'ht-antd-text',
};
