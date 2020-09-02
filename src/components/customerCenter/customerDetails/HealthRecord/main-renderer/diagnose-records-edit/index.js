import React, { Component } from 'react';
import moment from 'moment';
import Form from '@wanhu/antd-legacy/lib/form';
// import DatePicker from '@wanhu/antd-legacy/lib/datePicker';
import { DatePicker } from 'antd';
import Button from '@wanhu/antd-legacy/lib/button';
import { diagnoseRecords, diagnoseRecord, func } from '@wanhu/business/lib/health-record/prop-types';
import DiagnoseRecordEdit from './diagnose-record-edit';

const FormItem = Form.Item;

export default class DiagnoseRecordsEdit extends Component {
    static propTypes = {
        diagnoseRecords: diagnoseRecords.isRequired,
        selectedDiagnoseRecord: diagnoseRecord.isRequired,
        setSelectedDiagnoseRecordByDate: func.isRequired,
        setDiagnoseRecordField: func.isRequired,
        removeDiagnoseRecord: func.isRequired,
    }

    setSelectedDate = (moment) => {
        if (!moment) return;
        const { setSelectedDiagnoseRecordByDate } = this.props;
        setSelectedDiagnoseRecordByDate(moment.format('YYYY-MM-DD'));
    }

    disabledDate = (moment) => {
        if (!moment) return false;
        if (moment > Date.now()) {
            return true;
        }
        const { diagnoseRecords } = this.props;
        const date = moment.format('YYYY-MM-DD');
        return diagnoseRecords.some(r => r.date === date);
    }

    removeDiagnoseRecord = () => {
        const { selectedDiagnoseRecord, removeDiagnoseRecord } = this.props;
        if (!window.confirm('确认删除该条信息？')) {
            return;
        }
        removeDiagnoseRecord(selectedDiagnoseRecord);
    }

    renderDate = (date) => {
        const { diagnoseRecords, selectedDiagnoseRecord } = this.props;
        const selectedString = selectedDiagnoseRecord.date.value;
        const dateString = date.format('YYYY-MM-DD');
        let specialClassName;
        if (selectedString === dateString) {
            specialClassName = 'ant-calendar-selected-date';
        } else if (diagnoseRecords.some(dr => !dr.id.startsWith('temp:') && dr.date.value === dateString)) {
            specialClassName = 'ant-calendar-selected-day';
        }
        return (
            <div className={specialClassName}>
                <div className="ant-calendar-date">
                    {date.format('D')}
                </div>
            </div>
        );
    }

    render() {
        const { setDiagnoseRecordField, selectedDiagnoseRecord } = this.props;
        const selectedDate = moment(selectedDiagnoseRecord.date.value, 'YYYY-MM-DD');
        const isTemp = selectedDiagnoseRecord.id.startsWith('temp:');
        return (
            <div>
                { !isTemp
                    ? (
                        <Button size="small" type="danger" className="diagnose-record-del ant-btn-link" onClick={this.removeDiagnoseRecord}>
                            删除
                        </Button>
                    ) : null
                }
                <FormItem
                    className="no-validator"
                    label="就诊日期"
                    colon={false}
                    required
                >
                    <DatePicker
                        dateRender={this.renderDate}
                        disabledDate={this.disabledDate}
                        value={selectedDate}
                        onChange={this.setSelectedDate}
                    />
                </FormItem>
                <DiagnoseRecordEdit
                    diagnoseRecord={selectedDiagnoseRecord}
                    setDiagnoseRecordField={setDiagnoseRecordField}
                />
            </div>
        );
    }
}
