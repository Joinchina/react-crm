import React, { PureComponent } from 'react';
import AddDeleteTable from '../add-delete-table';
import { diseaseList, familyDiseases, func } from '@wanhu/business/lib/health-record/prop-types';
import { relationships, outcomes } from '@wanhu/business/lib/health-record/constants';

const colHeaders = ['与本人关系*', '关系人疾病*', '患病年龄（岁）', '转归'];

function randid() {
    return `temp:${Date.now().toString(36).substr(-4)}${Math.random().toString(36).substr(-4)}`;
}

export default class FamilyDiseasesTable extends PureComponent {
    columns = [
        {/* relationship */
            type: 'antd-select',
            data: (row, value) => {
                if (value === undefined) {
                    return row.relationship.value;
                }
                if (row.relationship.value !== value) {
                    return this.updateField(row, {
                        relationship: value,
                    });
                }
                return null;
            },
            source: relationships,
        },
        {/* diseaseId */
            type: 'antd-select',
            data: (row, value) => {
                if (value === undefined) {
                    return row.diseaseId.value;
                }
                if (row.diseaseId.value !== value) {
                    return this.updateField(row, {
                        diseaseId: value,
                    });
                }
                return null;
            },
            showSearch: true,
            filterSource: (input, sourceItem) => {
                if (sourceItem.name.toLowerCase().indexOf(input.toLowerCase()) >= 0) {
                    return true;
                }
                if (sourceItem.key
                    && sourceItem.key.toLowerCase().indexOf(input.toLowerCase()) >= 0) {
                    return true;
                }
                return false;
            },
        },
        {/* diagnoseAge */
            type: 'antd-number',
            min: 0,
            max: 200,
            defaultValue: 60,
            data: (row, value) => {
                if (value === undefined) {
                    return row.diagnoseAge.value;
                }
                if (row.diagnoseAge.value !== value) {
                    return this.updateField(row, {
                        diagnoseAge: value,
                    });
                }
                return null;
            },
        },
        {/* outcome */
            type: 'antd-select',
            // getPopupContainer: () => this.popupContainer,
            data: (row, value) => {
                if (value === undefined) {
                    return row.outcome.value;
                }
                if (row.outcome.value !== value) {
                    return this.updateField(row, {
                        outcome: value,
                    });
                }
                return null;
            },
            source: outcomes,
        },
    ]

    static propTypes = {
        value: familyDiseases,
        diseaseList: diseaseList.isRequired,
        onChange: func.isRequired,
    };

    static defaultProps = {
        value: null,
    }

    onAddRow = (col, addedValue) => {
        const colName = ['relationship', 'diseaseId', 'diagnoseAge', 'outcome'][col];
        const { onChange } = this.props;
        let { value } = this.props;
        if (!value) {
            value = [];
        } else {
            value = [...value];
        }
        value.push({
            tmpid: randid(),
            [colName]: addedValue,
        });
        onChange(value);
    }

    onDeleteRow = (item, index) => {
        if (!window.confirm('确认删除该条信息？')) {
            return;
        }
        const {
            onChange,
        } = this.props;
        let { value } = this.props;
        if (!value) {
            value = [];
        } else {
            value = [...value];
        }
        value.splice(index, 1);
        onChange(value);
    }

    cells = (rowIndex, col) => {
        const {
            diseaseList,
        } = this.props;
        let {
            value,
        } = this.props;
        if (!value) value = [];
        if (col === 0) {
            return {
                validateStatus: value[rowIndex] && value[rowIndex].relationship.validateStatus,
                help: value[rowIndex] && value[rowIndex].relationship.help,
            };
        }
        if (col === 1) {
            return {
                source: diseaseList,
                validateStatus: value[rowIndex] && value[rowIndex].diseaseId.validateStatus,
                help: value[rowIndex] && value[rowIndex].diseaseId.help,
            };
        }
        if (col === 2) {
            return {
                validateStatus: value[rowIndex] && value[rowIndex].diagnoseAge.validateStatus,
                help: value[rowIndex] && value[rowIndex].diagnoseAge.help,
            };
        }
        return null;
    }

    updateField(row, newValues) {
        const { onChange } = this.props;
        let { value } = this.props;
        if (value) {
            value = [...value];
        } else {
            value = [];
        }
        const index = value.indexOf(row);
        if (index < 0) {
            value.push({
                tmpid: randid(),
                ...newValues,
            });
        } else {
            value[index] = {
                ...value[index],
                ...newValues,
            };
        }
        onChange(value);
    }

    render() {
        const { value = [] } = this.props;
        return (
            <div>
                <AddDeleteTable
                    data={value}
                    colHeaders={colHeaders}
                    columns={this.columns}
                    cells={this.cells}
                    stretchH="all"
                    selectionMode="range"
                    onAddRow={this.onAddRow}
                    onDeleteRow={this.onDeleteRow}
                />
            </div>
        );
    }
}
