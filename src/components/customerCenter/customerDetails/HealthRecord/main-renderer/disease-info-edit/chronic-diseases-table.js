import React, { PureComponent } from 'react';
import moment from 'moment';
import memoize from 'memoize-one';
import AddDeleteTable from '../add-delete-table';
import { diseaseList, chronicDiseases, func } from '@wanhu/business/lib/health-record/prop-types';

const colHeaders = ['疾病*', '并发症/分型', '分级', '确诊年份'];

function randid() {
    return `temp:${Date.now().toString(36).substr(-4)}${Math.random().toString(36).substr(-4)}`;
}

const SPARE = '$$spare';

const empty = {
    validateStatus: 'success',
    help: null,
};

function filterWithNameAndKey(input, sourceItem) {
    if (sourceItem.name.toLowerCase().indexOf(input.toLowerCase()) >= 0) {
        return true;
    }
    if (sourceItem.key
        && sourceItem.key.toLowerCase().indexOf(input.toLowerCase()) >= 0) {
        return true;
    }
    return false;
}

export default class ChronicDiseasesTable extends PureComponent {
    columns = [
        {/* diseaseId */
            type: 'antd-select',
            data: row => row.diseaseId.value,
            showSearch: true,
            filterSource: filterWithNameAndKey,
        },
        {/* chronicDiseaseId */
            type: 'antd-select',
            data: (row, value) => {
                if (row[SPARE]) {
                    if (value === undefined) {
                        return null;
                    }
                    return this.onAddDiseaseRow(row.diseaseId.value, {
                        chronicDiseaseId: value,
                    });
                }
                if (value === undefined) {
                    return row.chronicDiseaseId.value;
                }
                if (row.chronicDiseaseId.value !== value) {
                    return this.updateDiseaseField(row, {
                        chronicDiseaseId: value,
                        levelId: null,
                    });
                }
                return null;
            },
            showSearch: true,
            filterSource: filterWithNameAndKey,
        },
        {/* levelId */
            type: 'antd-select',
            data: (row, value) => {
                if (row[SPARE]) {
                    if (value === undefined) {
                        return null;
                    }
                    return this.onAddDiseaseRow(row.diseaseId.value, {
                        levelId: value,
                    });
                }
                if (value === undefined) {
                    return row.levelId.value;
                }
                if (row.levelId.value !== value) {
                    return this.updateDiseaseField(row, {
                        levelId: value,
                    });
                }
                return null;
            },
            showSearch: true,
            filterSource: filterWithNameAndKey,
        },
        {/* date */
            type: 'antd-date',
            dateFormat: 'YYYY',
            minDate: '1900',
            maxDate: moment().year().toString(),
            mode: 'year',
            data: (row, value) => {
                if (row[SPARE]) {
                    if (value === undefined) {
                        return null;
                    }
                    return this.onAddDiseaseRow(row.diseaseId.value, {
                        date: value,
                    });
                }
                if (value === undefined) {
                    return row.date.value;
                }
                if (row.date.value !== value) {
                    return this.updateDiseaseField(row, {
                        date: value,
                    });
                }
                return null;
            },
        },
    ]

    static propTypes = {
        value: chronicDiseases,
        diseaseList: diseaseList.isRequired,
        onChange: func.isRequired,
    };

    static defaultProps = {
        value: null,
    }

    onAddRow = (col, addedValue) => {
        const colName = ['diseaseId', 'levelId', 'date'][col];
        const { onChange } = this.props;
        let { value = [] } = this.props;
        value = [...value, {
            tmpid: randid(),
            [colName]: addedValue,
        }];
        onChange(value);
    }

    onAddDiseaseRow = (diseaseId, addedFields) => {
        const { onChange } = this.props;
        let { value } = this.props;
        value = [...value];
        let insertPoint = -1;
        for (let i = 0; i < value.length; i += 1) {
            if (value[i].diseaseId.value === diseaseId) {
                insertPoint = i;
            }
        }
        if (insertPoint < 0) {
            console.warn('Cannot insert', diseaseId, addedFields);
            return;
        }
        value.splice(insertPoint + 1, 0, {
            tmpid: randid(),
            diseaseId,
            ...addedFields,
        });
        onChange(value);
    }

    onDeleteRow = (item, index) => {
        if (!window.confirm('确认删除该条信息？')) {
            return;
        }
        const { value, onChange } = this.props;
        const data = [...this.getData(value)];
        data.splice(index, 1);
        onChange(data.filter(item => !item[SPARE]));
    }

    getData = memoize((value) => {
        if (!value || value.length === 0) {
            return [];
        }
        let oldDiseaseId = null;
        let oldDiseaseCount = 0;
        const newData = [];
        for (let i = 0; i <= value.length; i += 1) {
            const cur = value[i];
            const curDiseaseId = cur && cur.diseaseId.value;
            if (curDiseaseId !== oldDiseaseId) {
                if (oldDiseaseCount > 1) {
                    newData.push({
                        diseaseId: { value: oldDiseaseId },
                        chronicDiseaseId: empty,
                        levelId: empty,
                        date: empty,
                        [SPARE]: true,
                    });
                } else if (oldDiseaseCount === 1) {
                    const old = value[i - 1];
                    if (old.chronicDiseaseId.value || old.levelId.value) {
                        newData.push({
                            diseaseId: { value: oldDiseaseId },
                            chronicDiseaseId: empty,
                            levelId: empty,
                            date: empty,
                            [SPARE]: true,
                        });
                    }
                }
                oldDiseaseId = curDiseaseId;
                oldDiseaseCount = 1;
            } else {
                oldDiseaseCount += 1;
            }
            if (cur) newData.push(cur);
        }
        return newData;
    });

    getMergeCells = memoize((data) => {
        if (!data || data.length <= 1) {
            return [];
        }
        const merges = [];
        let mergeStart = 0;
        let mergeDiseaseId = data[0].diseaseId.value;
        for (let i = 1; i <= data.length; i += 1) {
            const diseaseId = data[i] && data[i].diseaseId.value;
            if (mergeDiseaseId !== diseaseId) {
                const rowspan = i - mergeStart;
                if (rowspan > 1) {
                    merges.push({
                        row: mergeStart, col: 0, rowspan, colspan: 1,
                    });
                }
                mergeStart = i;
                mergeDiseaseId = diseaseId;
            }
        }
        return merges;
    });

    cells = (rowIndex, col) => {
        const {
            diseaseList,
        } = this.props;
        let {
            value,
        } = this.props;
        value = this.getData(value);
        if (col === 0) {
            return {
                readOnly: true,
                renderSource: diseaseList,
                validateStatus: value[rowIndex] && value[rowIndex].diseaseId.validateStatus,
                help: value[rowIndex] && value[rowIndex].diseaseId.help,
            };
        }
        if (col === 1) {
            const rowData = value[rowIndex];
            const disease = diseaseList.find(d => d.id === rowData.diseaseId.value);
            if (disease && disease.chronicDiseases && disease.chronicDiseases.length > 0) {
                return {
                    source: disease.chronicDiseases.filter((cd) => {
                        if (cd.id === rowData.chronicDiseaseId.value) {
                            return true;
                        }
                        if (value.some(rowData => cd.id === rowData.chronicDiseaseId.value)) {
                            return false;
                        }
                        return true;
                    }),
                };
            }
            return {
                readOnly: true,
                placeholder: '无',
            };
        }
        if (col === 2) {
            const rowData = value[rowIndex];
            const disease = diseaseList.find(d => d.id === rowData.diseaseId.value);
            if (disease) {
                if (disease.chronicDiseases.length === 0) {
                    return {
                        readOnly: true,
                        placeholder: '无',
                    };
                }
                const chronicDisease = disease.chronicDiseases.find(
                    cd => cd.id === rowData.chronicDiseaseId.value,
                );
                if (chronicDisease) {
                    if (chronicDisease.levels && chronicDisease.levels.length > 0) {
                        return {
                            source: chronicDisease.levels,
                        };
                    }
                    return {
                        readOnly: true,
                        placeholder: '无',
                    };
                }
                return {
                    readOnly: true,
                };
            }
            return {
                readOnly: true,
                placeholder: '无',
            };
        }
        if (col === 3) {
            const rowData = value[rowIndex];
            if (rowData[SPARE]) {
                return {
                    readOnly: true,
                };
            }
        }
        return null;
    }

    canDeleteRow = row => !row[SPARE];

    spareCells = (col) => {
        const {
            value,
        } = this.props;
        if (col === 0) {
            const {
                diseaseList,
            } = this.props;
            return {
                source: diseaseList.filter(
                    d => value.every(
                        row => row.diseaseId.value !== d.id,
                    ),
                ),
            };
        }
        if (col === 1 || col === 2 || col === 3) {
            return { readOnly: true };
        }
        return null;
    }

    updateDiseaseField(row, newValues) {
        const { onChange } = this.props;
        let { value } = this.props;
        value = [...this.getData(value)];
        const index = value.indexOf(row);
        if (index < 0) {
            console.warn('update item not found', row);
        } else {
            value[index] = {
                ...value[index],
                ...newValues,
            };
        }
        onChange(value.filter(item => !item[SPARE]));
    }

    render() {
        const { value = [] } = this.props;
        const data = this.getData(value);
        const mergeCells = this.getMergeCells(data);
        return (
            <div>
                <AddDeleteTable
                    data={data}
                    colHeaders={colHeaders}
                    columns={this.columns}
                    cells={this.cells}
                    spareCells={this.spareCells}
                    mergeCells={mergeCells}
                    selectionMode="range"
                    onAddRow={this.onAddRow}
                    onDeleteRow={this.onDeleteRow}
                    canDeleteRow={this.canDeleteRow}
                    stretchH="all"
                />
            </div>
        );
    }
}
