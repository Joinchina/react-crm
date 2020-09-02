import React, { Component } from 'react';
import Form from '@wanhu/antd-legacy/lib/form';
import Input from '@wanhu/antd-legacy/lib/input';
import message from '@wanhu/antd-legacy/lib/message';
import Tag from '@wanhu/antd-legacy/lib/tag';
import { Link } from 'react-router-dom';
import memoize from 'memoize-one';
import {
    diagnoseRecord, func, shape, string,
} from '@wanhu/business/lib/health-record/prop-types';
import { frequencies } from '@wanhu/business/lib/health-record/constants';
import api from '../../../../../../api/api';
import HotTable, { trimmingContainerSpecialClass } from '../handsontable';
import './therapy-edit.less';

const FormItem = Form.Item;
const { TextArea } = Input;

const colHeaders = ['通用名（商品名）', '规格', '单次用量', '频次', '数量', '服药说明', ''];

const SPARE_DATA = {
    useAmount: {},
    frequency: {},
    amount: {},
    medicationInstructions: {},
};

const styles = {
    searchItemNameCol: {
        minWidth: 200,
        maxWidth: 300,
        display: 'inline-block',
        marginRight: 10,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        verticalAlign: 'middle',
    },
    searchItemStandardCol: {
        minWidth: 100,
        maxWidth: 200,
        display: 'inline-block',
        marginRight: 10,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        verticalAlign: 'middle',
    },
    searchItemProducerCol: {
        minWidth: 200,
        maxWidth: 300,
        display: 'inline-block',
        marginRight: 10,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        verticalAlign: 'middle',
    },
};

const stretchH = [1 / 6, 1 / 6, 1 / 6, 1 / 6, 1 / 6, 1 / 6, 0];

export default class TherapyEdit extends Component {
    columns = [
        {/* name */
            type: 'antd-text',
            readOnly: true,
            data: (drug) => {
                if (drug === SPARE_DATA) {
                    return '';
                }
                const name = (drug.productName
                    ? `${drug.commonName}（${drug.productName}）`
                    : drug.commonName);
                const tag = drug.status === 0
                    ? '' : `<span class="ant-tag ant-tag-red drug-tag">
                    ${drug.status === 3 ? '停售' : '目录外'}
                    </span>`;
                return `<span class="drug-name">${name}</span>${tag}`;
            },
        },
        {/* standard */
            type: 'antd-text',
            readOnly: true,
            data: (drug) => {
                if (drug === SPARE_DATA) {
                    return '';
                }
                return `${drug.preparationUnit}*${drug.packageSize}${drug.minimumUnit}`;
            },
        },
        {/* useAmount */
            type: 'antd-number',
            precision: 1,
            formatter: (val) => {
                const num = Number(val);
                if (Number.isNaN(num)) {
                    return '';
                }
                if (num % 1 !== 0) return num.toFixed(1);
                return num.toFixed(0);
            },
            ...this.makeFormColumn('useAmount'),
        },
        {/* frequency */
            type: 'antd-select',
            source: frequencies,
            ...this.makeFormColumn('frequency'),
        },
        {/* amount */
            type: 'antd-number',
            precision: 0,
            min: 1,
            max: 999,
            ...this.makeFormColumn('amount'),
        },
        {/* medicationInstructions */
            type: 'antd-popup-text',
            direction: 'bottomLeft',
            maxLength: 200,
            formatter: val => `<span class="instructions">${val || ''}</span>`,
            ...this.makeFormColumn('medicationInstructions'),
        },
        {
            type: 'antd-link-button',
            data: drug => (drug === SPARE_DATA ? null : '删除'),
            onClick: (index) => {
                if (!window.confirm('确认删除该条信息？')) {
                    return;
                }
                this.removeDrugAtIndex(index);
            },
        },
    ]

    static propTypes = {
        diagnoseRecord: diagnoseRecord.isRequired,
        setDiagnoseRecordField: func.isRequired,
        patientId: string.isRequired,
        patientInfo: shape({
            hospital: shape({
                id: string.isRequired,
            }).isRequired,
        }).isRequired,
    }

    getData = memoize(data => [...data, SPARE_DATA]);

    getMergeCells = memoize(data => [{
        row: data.length, col: 0, rowspan: 1, colspan: 7,
    }])

    cells = (row, col) => {
        const {
            diagnoseRecord: { drugTherapy },
            patientInfo: { hospital: { id: hospitalId } },
        } = this.props;
        const length = (drugTherapy.value && drugTherapy.value.length) || 0;
        if (row === length && col === 0) {
            return {
                type: 'antd-search',
                placeholder: '请输入药品信息',
                readOnly: false,
                search: (key, skip, limit) => api.getDrugList({
                    where: {
                        search: key,
                        hospitalId,
                    },
                    skip,
                    limit,
                }),
                pagination: true,
                renderOption: drug => (
                    <span>
                        <span style={styles.searchItemNameCol}>
                            {drug.commonName}
                            {drug.productName ? `（${drug.productName}）` : null }
                        </span>
                        {drug.status !== 0
                            ? (
                                <Tag color="red" className="search-item-tag">
                                    {drug.status === 3 ? '停售' : '目录外'}
                                </Tag>
                            ) : <span style={styles.searchItemTag} />
                        }
                        <span style={styles.searchItemStandardCol}>
                            {drug.preparationUnit}
                            *
                            {drug.packageSize}
                            {drug.minimumUnit}
                        </span>
                        <span style={styles.searchItemProducerCol}>
                            {drug.producerName}
                        </span>
                    </span>
                ),
                onSelect: drug => this.addDrug(drug),
            };
        }
        return null;
    }

    addDrug = (drug) => {
        const { diagnoseRecord, setDiagnoseRecordField } = this.props;
        let drugTherapy = diagnoseRecord.drugTherapy.value || [];
        if (drugTherapy.some(d => d.baseDrugId === drug.baseDrugId)) {
            message.warn('不能添加重复的药品');
            return; /* existing drugs added */
        }
        drugTherapy = [
            ...drugTherapy,
            {
                ...drug,
                tmpid: `${Math.random()}${Date.now()}`,
            },
        ];
        setDiagnoseRecordField({
            id: diagnoseRecord.id,
            drugTherapy,
        });
    }

    updateNonDrugTherapy = (event) => {
        const { diagnoseRecord, setDiagnoseRecordField } = this.props;
        setDiagnoseRecordField({
            id: diagnoseRecord.id,
            nonDrugTherapy: event.target.value,
        });
    }

    makeFormColumn(name) {
        return {
            data: (drug, setValue) => {
                if (drug === SPARE_DATA) {
                    return '';
                }
                if (setValue === undefined) {
                    return drug[name].value;
                }
                return this.updateDrug(drug, name, setValue);
            },
            validateStatus: (row) => {
                const { diagnoseRecord } = this.props;
                const drug = diagnoseRecord.drugTherapy.value
                    ? diagnoseRecord.drugTherapy.value[row]
                    : null;
                return drug && drug[name] && drug[name].validateStatus;
            },
            help: (row) => {
                const { diagnoseRecord } = this.props;
                const drug = diagnoseRecord.drugTherapy.value
                    ? diagnoseRecord.drugTherapy.value[row]
                    : null;
                return drug && drug[name] && drug[name].help;
            },
        };
    }

    updateDrug(drug, key, value) {
        if (drug[key].value === value) {
            return;
        }
        const { diagnoseRecord, setDiagnoseRecordField } = this.props;
        const drugTherapy = diagnoseRecord.drugTherapy.value
            ? [...diagnoseRecord.drugTherapy.value]
            : [];
        const itemIndex = drugTherapy.indexOf(drug);
        if (itemIndex < 0) {
            return;
        }
        drugTherapy[itemIndex] = {
            ...drugTherapy[itemIndex],
            [key]: value,
        };
        setDiagnoseRecordField({
            id: diagnoseRecord.id,
            drugTherapy,
        });
    }

    removeDrugAtIndex(index) {
        const { diagnoseRecord, setDiagnoseRecordField } = this.props;
        const drugTherapy = diagnoseRecord.drugTherapy.value
            ? [...diagnoseRecord.drugTherapy.value]
            : [];
        drugTherapy.splice(index, 1);
        setDiagnoseRecordField({
            id: diagnoseRecord.id,
            drugTherapy,
        });
    }

    render() {
        const { diagnoseRecord } = this.props;
        const drugTherapy = diagnoseRecord.drugTherapy.value || [];
        return (
            <div className="therapy-edit">
                <FormItem
                    label="药物治疗"
                    required
                    className="ant-form-item-with-table"
                    colon={false}
                >
                    <div className="therapy-drug-table">
                        <div className={trimmingContainerSpecialClass}>
                            <HotTable
                                data={this.getData(drugTherapy)}
                                colHeaders={colHeaders}
                                columns={this.columns}
                                mergeCells={this.getMergeCells(drugTherapy)}
                                cells={this.cells}
                                stretchH={stretchH}
                                height={drugTherapy.length * 33 + 63}
                            />
                        </div>
                    </div>
                </FormItem>
                <FormItem
                    label="非药物治疗"
                    colon={false}
                >
                    <TextArea
                        value={diagnoseRecord.nonDrugTherapy.value}
                        onChange={this.updateNonDrugTherapy}
                    />
                </FormItem>
            </div>
        );
    }
}
