import React, { Component } from 'react';
import 'moment/locale/zh-cn';
import Handsontable, { HotTable, trimmingContainerSpecialClass, noTrimmingContainerSpecialClass } from './lib';
import './index.less';
import textCellType from './cell-types/text';
import selectCellType from './cell-types/select';
import searchCellType from './cell-types/search';
import dateCellType from './cell-types/date';
import numberCellType from './cell-types/number';
import twoNumberCellType from './cell-types/two-number';
import numberSelectCellType from './cell-types/number-select';
import popupTextCellType from './cell-types/popup-text';
import cascaderCellType from './cell-types/cascader';
import uploadImageCellType from './cell-types/upload-images';
import linkButtonCellType from './cell-types/link-button';
import cellDecorator from './cell-decorator';

Handsontable.cellTypes.registerCellType('antd-text', textCellType);
Handsontable.cellTypes.registerCellType('antd-select', selectCellType);
Handsontable.cellTypes.registerCellType('antd-search', searchCellType);
Handsontable.cellTypes.registerCellType('antd-date', dateCellType);
Handsontable.cellTypes.registerCellType('antd-number', numberCellType);
Handsontable.cellTypes.registerCellType('antd-two-number', twoNumberCellType);
Handsontable.cellTypes.registerCellType('antd-number-select', numberSelectCellType);
Handsontable.cellTypes.registerCellType('antd-popup-text', popupTextCellType);
Handsontable.cellTypes.registerCellType('antd-cascader', cascaderCellType);
Handsontable.cellTypes.registerCellType('antd-upload-images', uploadImageCellType);
Handsontable.cellTypes.registerCellType('antd-link-button', linkButtonCellType);

function bindThisAsContext(func) {
    return function bound(...args) {
        return func(this, ...args);
    };
}

export default class AntdHotTable extends Component {
    afterSelectionEnd = bindThisAsContext(
        (hotInstance, row, col, row2, col2, selectionLayerLevel) => {
            const { afterSelectionEnd } = this.props;
            const td = hotInstance.getCell(row, col);
            if (td && td.scrollIntoViewIfNeeded) {
                td.scrollIntoViewIfNeeded(false);
            }
            if (afterSelectionEnd) {
                afterSelectionEnd(row, col, row2, col2, selectionLayerLevel);
            }
        },
    );


    static propTypes = HotTable.propTypes;

    render() {
        let { className } = this.props;
        if (className) {
            className = `ht-antd-table ${className}`;
        } else {
            className = 'ht-antd-table';
        }
        return (
            <HotTable
                {...this.props}
                className={className}
                afterSelectionEnd={this.afterSelectionEnd}
            />
        );
    }
}

export {
    Handsontable, trimmingContainerSpecialClass,
    noTrimmingContainerSpecialClass, cellDecorator,
};
