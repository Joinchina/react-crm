import React, { PureComponent } from 'react';
import propTypes from 'prop-types';
import memoize from 'memoize-one';
import './add-delete-table.less';

import HotTable, { trimmingContainerSpecialClass } from './handsontable';

const spareData = { $$spare: true };

export default class AddDeleteTable extends PureComponent {
    static propTypes = {
        ...HotTable.propTypes,
        onAddRow: propTypes.func.isRequired,
        onDeleteRow: propTypes.func.isRequired,
        canDeleteLastRow: propTypes.bool,
        canDeleteRow: propTypes.func,
    }

    static defaultProps = {
        canDeleteLastRow: false,
        canDeleteRow: () => true,
    }

    getColumns = memoize(columns => [
        ...columns.map((col, colIndex) => ({
            ...col,
            data: (row, value) => {
                if (value === undefined) {
                    if (row === spareData) {
                        return null;
                    }
                    return col.data(row);
                }
                if (row === spareData) {
                    const { onAddRow } = this.props;
                    onAddRow(colIndex, value);
                    return undefined;
                }
                return col.data(row, value);
            },
        })),
        {
            data: (row) => {
                if (row === spareData) return null;
                const { canDeleteRow } = this.props;
                if (!canDeleteRow(row)) return null;
                return '删除';
            },
            type: 'antd-link-button',
            buttonType: 'danger',
            onClick: (row) => {
                const { data, onDeleteRow } = this.props;
                const item = data[row];
                onDeleteRow(item, row);
            },
        },
    ]);

    getCells = memoize((data, columns, cells, spareCells) => (row, col) => {
        if (col === columns.length) {
            return null;
        }
        if (!data || row === data.length) {
            if (spareCells) {
                return spareCells(col);
            }
            return null;
        }
        if (cells) {
            return cells(row, col);
        }
        return null;
    });

    getColHeaders = memoize(colHeaders => [
        ...colHeaders,
        '',
    ]);

    getData = memoize(data => [
        ...(data || []),
        spareData,
    ]);

    getStretchH = memoize((columns, stretchH) => {
        if (stretchH === 'all') {
            return columns.map(() => 1 / columns.length).concat([0]);
        }
        if (stretchH === 'last') {
            return columns.map((_, index) => {
                if (index === columns.length - 1) {
                    return 1;
                }
                return 0;
            }).concat([0]);
        }
        return 'none';
    });

    render() {
        const {
            onAddRow,
            onDeleteRow,
            canDeleteLastRow,
            data,
            cells,
            columns,
            colHeaders,
            stretchH,
            spareCells,
            ...rest
        } = this.props;
        const height = (((data && data.length) || 0) + 1) * 33 + 30;
        return (
            <div className="add-delete-table-container">
                <div className={trimmingContainerSpecialClass}>
                    <HotTable
                        {...rest}
                        data={this.getData(data)}
                        cells={this.getCells(data, columns, cells, spareCells)}
                        columns={this.getColumns(columns)}
                        colHeaders={this.getColHeaders(colHeaders)}
                        stretchH={this.getStretchH(columns, stretchH)}
                        height={height}
                    />
                </div>
            </div>
        );
    }
}
