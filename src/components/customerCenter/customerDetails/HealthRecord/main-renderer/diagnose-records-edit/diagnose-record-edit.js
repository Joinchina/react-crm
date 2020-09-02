import React, { PureComponent } from 'react';
import propTypes from 'prop-types';
import Form from '@wanhu/antd-legacy/lib/form';
import Input from '@wanhu/antd-legacy/lib/input';
import memorize from 'memoize-one';
import moment from 'moment';
import AddDeleteTable from '../add-delete-table';
import { diagnoseRecord } from '@wanhu/business/lib/health-record/prop-types';
import { symptoms } from '@wanhu/business/lib/health-record/constants';

import './diagnose-record-edit.less';

const FormItem = Form.Item;

const colHeaders = ['症状*', '描述'];
const colWidths = [130, undefined];
const commonSymptomPlaceholder = '持续时间、加重或减轻的相关因素、伴发症状描述';

const symptomsSource = symptoms.map(item => ({
    ...item,
    placeholder: commonSymptomPlaceholder,
})).concat([{
    id: '__other',
    name: '其他',
    placeholder:
        '1. 患者是否进行过自行处理（如服药、非药物治疗等），以及处理后病情变化；\n'
        + '2. 来诊前是否到过其他医院就诊、做了什么检查和处理、检查结果及处理后的变化；\n'
        + '3.  基本查体信息：与上面第1条、第2条描述相关的查体阳性和具有鉴别诊断意义的阴性体征；\n'
        + '4. 患者精神心理状态和变化，例如有无焦虑、抑郁状态。',
}]);

export default class DiagnoseRecordEdit extends PureComponent {
    columns = [
        {/* symptom */
            data: (row, value) => {
                if (value === undefined) {
                    return row.symptom.value;
                }
                return this.updateSymptoms(row, 'symptom', value);
            },
            type: 'antd-select',
            source: symptomsSource,
        },
        {/* description */
            type: 'antd-popup-text',
            data: (row, value) => {
                if (value === undefined) {
                    return row.description.value;
                }
                return this.updateSymptoms(row, 'description', value);
            },
            autosize: { minRows: 4 },
            maxLength: 200,
        },
    ]

    toMoment = memorize(date => moment(date, 'YYYY-MM-DD'))

    static propTypes = {
        diagnoseRecord: diagnoseRecord.isRequired,
        setDiagnoseRecordField: propTypes.func.isRequired,
    }

    cells = (row, col) => {
        const { diagnoseRecord } = this.props;
        const symptoms = diagnoseRecord.symptoms.value || [];
        if (col === 0) {
            const otherSelected = symptoms
                .filter((_, i) => i !== row)
                .map(s => s.symptom.value);
            return {
                source: symptomsSource.filter(s => otherSelected.indexOf(s.id) < 0),
                validateStatus: symptoms[row] && symptoms[row].symptom.validateStatus,
                help: symptoms[row] && symptoms[row].symptom.help,
            };
        }
        if (col === 1) {
            const selection = symptoms[row]
                && symptoms[row].symptom
                && symptoms[row].symptom.value;
            const source = symptomsSource.find(s => s.id === selection);
            return source ? {
                placeholder: source.placeholder,
            } : null;
        }
        return null;
    }

    updateComplaint = (event) => {
        const { diagnoseRecord, setDiagnoseRecordField } = this.props;
        setDiagnoseRecordField({
            id: diagnoseRecord.id,
            complaint: event.target.value,
        });
    }

    addSymptom = (col, value) => {
        const { diagnoseRecord, setDiagnoseRecordField } = this.props;
        let symptoms = diagnoseRecord.symptoms.value || [];
        const filedName = ['symptom', 'description'][col];
        symptoms = [...symptoms, {
            [filedName]: value,
        }];
        setDiagnoseRecordField({
            id: diagnoseRecord.id,
            symptoms,
        });
    }

    removeSymptom = (item, index) => {
        if (!window.confirm('确认删除该条信息？')) {
            return;
        }
        const { diagnoseRecord, setDiagnoseRecordField } = this.props;
        let symptoms = diagnoseRecord.symptoms.value || [];
        symptoms = [...symptoms];
        symptoms.splice(index, 1);
        setDiagnoseRecordField({
            id: diagnoseRecord.id,
            symptoms,
        });
    }

    updateSymptoms(row, key, value) {
        const { diagnoseRecord, setDiagnoseRecordField } = this.props;
        let newSymptoms = diagnoseRecord.symptoms.value;
        if (newSymptoms) {
            newSymptoms = [...newSymptoms];
        } else {
            newSymptoms = [];
        }
        const itemIndex = newSymptoms.indexOf(row);
        if (itemIndex < 0) {
            newSymptoms.push({
                [key]: value,
            });
        } else {
            newSymptoms[itemIndex] = {
                ...newSymptoms[itemIndex],
                [key]: value,
            };
        }
        setDiagnoseRecordField({
            id: diagnoseRecord.id,
            symptoms: newSymptoms,
        });
    }

    render() {
        const { diagnoseRecord } = this.props;
        const symptoms = diagnoseRecord.symptoms.value || [];
        let dateMoment = this.toMoment(diagnoseRecord.date.value);
        if (!dateMoment.isValid()) {
            dateMoment = null;
        }
        return (
            <div className="diagnose-record-container">
                <FormItem
                    label="主诉"
                    required
                    validateStatus={diagnoseRecord.complaint.validateStatus}
                    help={diagnoseRecord.complaint.help}
                    colon={false}
                >
                    <Input.TextArea
                        autosize
                        value={diagnoseRecord.complaint.value}
                        onChange={this.updateComplaint}
                        maxLength={200}
                    />
                </FormItem>
                <FormItem
                    label="现病史"
                    required
                    className="ant-form-item-with-table ant-form-item-mb-0"
                    colon={false}
                >
                    <AddDeleteTable
                        colHeaders={colHeaders}
                        columns={this.columns}
                        cells={this.cells}
                        colWidths={colWidths}
                        className="diagnose-record-hot"
                        stretchH="last"
                        data={symptoms}
                        selectionMode="range"
                        onAddRow={this.addSymptom}
                        onDeleteRow={this.removeSymptom}
                    />
                </FormItem>
            </div>
        );
    }
}
