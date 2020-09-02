import React, { PureComponent } from 'react';
import Form from '@wanhu/antd-legacy/lib/form';
import { Button } from 'antd';
import message from '@wanhu/antd-legacy/lib/message'
import memoize from 'memoize-one';
import {
    healthCheckRecords, patientInfo, func, number,
} from '@wanhu/business/lib/health-record/prop-types';
import * as constants from '@wanhu/business/lib/health-record/constants';
import HotTable, { Handsontable, cellDecorator, trimmingContainerSpecialClass } from '../handsontable';
import api from '../../../../../../api/api';
import './index.less';
import header from './row-headers';
import warnings from './warnings';

const FormItem = Form.Item;

const buttonStyle = {
    display: 'block',
    width: '100%',
};

function isEmpty(val) {
    return val === undefined || val === null || val === '';
}

function defaultValue(val, def) {
    return isEmpty(val) ? def : val;
}

const groupRanges = [
    [0, 0],
    [1, 1],
    [2, 14],
    [15, 19],
    [20, 23],
    [24, 24],
    [25, 27],
    [28, 33],
    [34, 35],
    [36, 36],
    [37, 37],
];

const headerMerges = groupRanges.filter(([a, b]) => a !== b).map(([a, b]) => ({
    row: a, col: 0, rowspan: b - a + 1, colspan: 1,
}));

const headerColWidths = [60, 181];

const cachedHeaderValue = Symbol('cachedHeaderValue');

function headerRenderer(
    hotInstance, td, row, column, prop,
    func, cellProperties,
) {
    cellDecorator(
        hotInstance, td, row, column, prop, null, cellProperties,
    );
    if (td[cachedHeaderValue] === func) {
        return;
    }
    /* eslint-disable-next-line no-param-reassign */
    td[cachedHeaderValue] = func;
    Handsontable.dom.empty(td);
    if (func) {
        td.appendChild(func());
    }
}

const headerColumns = [
    {
        renderer: headerRenderer,
        className: 'header-col-group',
    },
    {
        renderer: headerRenderer,
        className: 'header-col-tip',
    },
];

function headerCells(row, col) {
    const additionalClassNames = {};
    if (row === 0) {
        additionalClassNames['table-header-row'] = true;
        additionalClassNames['bt-2'] = true;
    }
    if (row === header.length - 1) {
        additionalClassNames['ht-antd-upload-images'] = true;
    }
    for (const gr of groupRanges) {
        if (gr[0] === row && col === 0) {
            additionalClassNames['bl-2'] = true;
            additionalClassNames['bb-2'] = true;
        }
        if (gr[1] === row && col === 1) {
            additionalClassNames['bb-2'] = true;
        }
    }
    return { additionalClassNames };
}

function getBMI(record) {
    if (record.weight.validateStatus !== 'success'
        || record.height.validateStatus !== 'success') {
        return null;
    }
    const weight = record.weight.value;
    const height = record.height.value;
    if (weight === null || height === null) return null;
    const bmi = weight / height / height;
    return Number.isNaN(bmi) ? null : bmi.toFixed(2);
}

const rowData = [
    /* header */
    'date',
    /* 风险评估 */
    {
        get: (record) => {
            const value = record.risk && record.risk.value;
            if (typeof value === 'number') {
                return value === 0 ? '0' : value.toFixed(2);
            }
            return null;
        },
    },
    /* 重点关注 */
    'smoke',
    'exercise',
    'drink',
    'taste',
    'height',
    'weight',
    {/* BMI */
        get: getBMI,
    },
    'waistline',
    'heartRate',
    'systolicBloodPressure',
    'diastolicBloodPressure',
    'fastingBloodGlucose',
    'postPrandialBloodGlucose',
    'lowDensityLipoproteinCholesterol',
    /* 生活习惯 */
    'dailyActivities',
    'sleepQuality',
    'snap',
    'constipation',
    'nutrition',
    /* 体格检查 */
    'auscultationCheck',
    'eyeCheck',
    'mouthCheck',
    'footCheck',
    /* 血糖 */
    'glycatedHemoglobin',
    /* 血脂 */
    'triglyceride',
    'totalCholesterol',
    'highDensityLipoproteinCholesterol',
    /* 其他血清检查 */
    { /* serumCreatinine/serumCreatinineUnit */
        get: record => `${defaultValue(record.serumCreatinine.value, '')},${defaultValue(record.serumCreatinineUnit.value, '')}`,
        set: (record, value, setFields) => {
            let serumCreatinine;
            let serumCreatinineUnit;
            if (!value) {
                serumCreatinine = null;
                serumCreatinineUnit = null;
            } else {
                const [a, b] = value.split(',');
                serumCreatinine = a ? Number(a) : null;
                serumCreatinineUnit = b;
            }
            setFields(record, {
                serumCreatinine,
                serumCreatinineUnit,
            });
        },
    },
    { /* eGFR */
        get: record => record.egfr && record.egfr.toFixed(2),
    },
    'uricAcid',
    'plasmaHomocysteine',
    'ALT',
    'AST',
    /* 电解质 */
    'bloodSodium',
    'bloodPotassium',
    /* 其他 */
    'urinaryMicroprotein',
    /* 照片 */
    {
        get: record => record.pictures.value && record.pictures.value.join('|'),
        set: (record, value, setFields) => {
            const pictures = (value || '').split('|').filter(a => a);
            setFields(record, {
                pictures,
            });
        },
    },
];

const getRawData = {
    get: record => record,
};

const getNextColRawData = {
    get: (record, index, records) => records[index + 1],
};

export default class HealthCheckRecordsEdit extends PureComponent {
    rows = [
        {/* date */
            type: 'antd-date',
            dateFormat: 'YYYY-MM-DD',
            dateFilter: (dateMoment, row, col) => {
                if (!dateMoment) return true;
                console.log(dateMoment);
                if (dateMoment > Date.now()) return false;
                const { healthCheckRecords } = this.props;
                const dateString = dateMoment.format('YYYY-MM-DD');
                return healthCheckRecords.every((record, i) => {
                    if (i === col) return true;
                    if (record.date.value !== dateString) {
                        return true;
                    }
                    return false;
                });
            },
            placeholder: '选择日期',
            getPopupContainer: this.getPopupContainer,
            className: 'table-header-row ht-antd-cell-with-icon',
        },
        /* 风险评估 */
        {
            type: 'antd-text',
            readOnly: true,
        },
        {/* smoke */
            type: 'antd-select',
            source: constants.smokeOptions,
            ...this.validators('smoke'),
        },
        { /* exercise */
            type: 'antd-select',
            source: constants.exerciseOptions,
            ...this.validators('exercise'),
        },
        { /* drink */
            type: 'antd-select',
            source: constants.drinkOptions,
            ...this.validators('drink'),
        },
        { /* taste */
            type: 'antd-select',
            source: constants.tasteOptions,
            ...this.validators('taste'),
        },
        { /* height */
            type: 'antd-number',
            precision: 2,
            step: 0.1,
            validateStatus: record => record.height.validateStatus,
            help: record => record.height.help,
        },
        { /* weight */
            type: 'antd-number',
            precision: 2,
            step: 1,
            validateStatus: record => record.weight.validateStatus,
            help: record => record.weight.help,
        },
        { /* bmi */
            type: 'antd-text',
            readOnly: true,
            ...this.validators('bmi', getBMI),
        },
        { /* waistline */
            type: 'antd-number',
            precision: 0,
            step: 1,
            ...this.validators('waistline'),
        },
        { /* heartRate */
            type: 'antd-number',
            precision: 0,
            step: 1,
            ...this.validators('heartRate'),
        },
        { /* systolicBloodPressure */
            type: 'antd-number',
            precision: 0,
            step: 10,
            validateStatus: (record) => {
                return record.systolicBloodPressure.validateStatus;
            },
            help: (record) => {
                return record.systolicBloodPressure.help;
            },
        },
        { /* diastolicBloodPressure */
            type: 'antd-number',
            precision: 0,
            step: 10,
            validateStatus: (record) => {
                return record.diastolicBloodPressure.validateStatus;
            },
            help: (record) => {
                return record.diastolicBloodPressure.help;
            },
        },
        { /* fastingBloodGlucose */
            type: 'antd-number',
            precision: 2,
            step: 1,
            ...this.validators('fastingBloodGlucose'),
        },
        { /* postPrandialBloodGlucose */
            type: 'antd-number',
            precision: 2,
            step: 1,
            ...this.validators('postPrandialBloodGlucose'),
        },
        { /* lowDensityLipoproteinCholesterol */
            type: 'antd-number',
            precision: 2,
            step: 1,
            ...this.validators('lowDensityLipoproteinCholesterol'),
        },
        { /* dailyActivities */
            type: 'antd-select',
            source: constants.dailyActivitiesOptions,
            ...this.validators('dailyActivities'),
        },
        { /* sleepQuality */
            type: 'antd-select',
            source: constants.sleepQualityOptions,
            ...this.validators('sleepQuality'),
        },
        { /* snap */
            type: 'antd-select',
            source: constants.snapOptions,
            ...this.validators('snap'),
        },
        { /* constipation */
            type: 'antd-select',
            source: constants.constipationOptions,
            ...this.validators('constipation'),
        },
        { /* nutrition */
            type: 'antd-select',
            source: constants.nutritionOptions,
            ...this.validators('nutrition'),
        },
        { /* auscultationCheck */
            type: 'antd-popup-text',
            placeholder: '例如，血管杂音有无以及部位；肺部啰音有无以及左肺/右肺、干性/湿性；心律是否失常',
            validateStatus: record => record.auscultationCheck.validateStatus,
            help: record => record.auscultationCheck.help,
            maxLength: 200,
        },
        { /* eyeCheck */
            type: 'antd-popup-text',
            placeholder: '例如，眼底小动脉有或无硬化',
            validateStatus: record => record.eyeCheck.validateStatus,
            help: record => record.eyeCheck.help,
            maxLength: 200,
        },
        { /* mouthCheck */
            type: 'antd-popup-text',
            placeholder: '例如，牙齿个数； 牙周炎程度：轻/中/重',
            validateStatus: record => record.mouthCheck.validateStatus,
            help: record => record.mouthCheck.help,
            maxLength: 200,
        },
        { /* footCheck */
            type: 'antd-popup-text',
            placeholder: '例如，各部位有无水肿',
            maxLength: 200,
            validateStatus: record => record.footCheck.validateStatus,
            help: record => record.footCheck.help,
        },
        { /* glycatedHemoglobin */
            type: 'antd-number',
            precision: 2,
            step: 1,
            ...this.validators('glycatedHemoglobin'),
        },
        { /* triglyceride */
            type: 'antd-number',
            precision: 2,
            step: 1,
            ...this.validators('triglyceride'),
        },
        { /* totalCholesterol */
            type: 'antd-number',
            precision: 2,
            step: 1,
            ...this.validators('totalCholesterol'),
        },
        { /* highDensityLipoproteinCholesterol */
            type: 'antd-number',
            precision: 2,
            step: 1,
            ...this.validators('highDensityLipoproteinCholesterol'),
        },
        { /* serumCreatinine/serumCreatinineUnit */
            type: 'antd-number-select',
            source: constants.serumCreatinineUnits,
            precision: 2,
            step: 1,
            validateStatus: (record) => {
                if (record.serumCreatinine.validateStatus === 'error') {
                    return 'error';
                }
                return record.serumCreatinineUnit.validateStatus;
            },
            help: (record) => {
                if (record.serumCreatinine.validateStatus === 'error') {
                    return record.serumCreatinine.help;
                }
                return record.serumCreatinineUnit.help;
            },
        },
        { /* egfr */
            type: 'antd-text',
            readOnly: true,
            ...this.validators('egfr', record => record.egfr),
        },
        { /* uricAcid */
            type: 'antd-number',
            precision: 0,
            step: 10,
            ...this.validators('uricAcid'),
        },
        { /* plasmaHomocysteine */
            type: 'antd-number',
            precision: 0,
            step: 1,
            ...this.validators('plasmaHomocysteine'),
        },
        { /* ALT */
            type: 'antd-number',
            precision: 0,
            step: 10,
            ...this.validators('ALT'),
        },
        { /* AST */
            type: 'antd-number',
            precision: 0,
            step: 10,
            ...this.validators('AST'),
        },
        { /* bloodSodium */
            type: 'antd-number',
            precision: 0,
            step: 1,
            ...this.validators('bloodSodium'),
        },
        { /* bloodPotassium */
            type: 'antd-number',
            precision: 2,
            step: 1,
            ...this.validators('bloodPotassium'),
        },
        { /* urinaryMicroprotein */
            type: 'antd-number',
            precision: 0,
            step: 1,
            ...this.validators('urinaryMicroprotein'),
        },
        { /* pictures */
            type: 'antd-upload-images',
            height: 130,
            onUploadImage: async (file) => {
                try {
                    const { url } = await api.uploadImageToOss(file);
                    return url;
                } catch (e) {
                    message.error(e.message);
                    throw e;
                }
            },
        },
    ];

    static propTypes = {
        patientInfo: patientInfo.isRequired,
        healthCheckRecords,
        addHealthCheckRecord: func.isRequired,
        setHealthCheckRecordFields: func.isRequired,
        scrollXPadding: number,
    }

    static defaultProps = {
        healthCheckRecords: null,
        scrollXPadding: 0,
    }

    componentDidMount() {
        const { healthCheckRecords } = this.props;
        if (!healthCheckRecords || healthCheckRecords.length === 0) {
            this.addRecord();
        }
    }

    componentDidUpdate() {
        const { healthCheckRecords } = this.props;
        if (!healthCheckRecords || healthCheckRecords.length === 0) {
            this.addRecord();
        }
    }

    componentWillUnmount() {
        if (this.setFieldsTimeout) {
            clearTimeout(this.setFieldsTimeout);
        }
    }

    getColumns = memoize(healthCheckRecords => healthCheckRecords
        .map((record, index, records) => ({
            data: (row, value) => {
                if (value === undefined) {
                    if (typeof row === 'object') {
                        return row.get(record, index, records);
                    }
                    return record[row] && record[row].value;
                }
                if (typeof row === 'object') {
                    if (row.set) {
                        return row.set(record, value, this.setFields);
                    }
                } else {
                    return this.setFields(record, {
                        [row]: value,
                    });
                }
                return null;
            },
        })));

    setFieldsDelayBatched(id, tmpid, fields) {
        if (!this.pendingSetFields) {
            this.pendingSetFields = [];
        }
        this.pendingSetFields.push([id, tmpid, fields]);
        if (this.setFieldsTimeout) {
            clearTimeout(this.setFieldsTimeout);
        }
        this.setFieldsTimeout = setTimeout(() => {
            const { setHealthCheckRecordFields } = this.props;
            const { pendingSetFields } = this;
            this.pendingSetFields = null;
            this.setFieldsTimeout = null;

            if (pendingSetFields.length === 1) {
                const [id, tmpid, fields] = pendingSetFields[0];
                setHealthCheckRecordFields({
                    ...fields,
                    id,
                    tmpid,
                });
                return;
            }
            const batchedUpdates = [];
            pendingSetFields.forEach(([id, tmpid, fields]) => {
                let update = batchedUpdates.find(
                    u => (id && id === u.id) || (tmpid && tmpid === u.tmpid),
                );
                if (!update) {
                    update = { id, tmpid };
                    batchedUpdates.push(update);
                }
                Object.assign(update, fields);
            });
            setHealthCheckRecordFields(batchedUpdates);
        });
    }

    setFields = (record, fields) => {
        const {
            healthCheckRecords,
        } = this.props;
        const { id, tmpid } = record;
        if (healthCheckRecords.find(r => r.id === id)) {
            this.setFieldsDelayBatched(id, tmpid, fields);
        } else {
            this.addRecord(fields);
        }
    }

    getPopupContainer = () => this.popupContainer;

    setScrollXPosition(x, parentSticky) {
        if (parentSticky) {
            if (this.scrollTranslateElement) {
                this.scrollTranslateElement.style.transform = `translateX(${-x}px)`;
            }
            if (this.scrollPlaceholder) {
                this.scrollPlaceholder.style.transform = `translateX(${-x}px)`;
            }
        } else {
            if (this.scrollStickyElement) {
                this.scrollStickyElement.style.transform = `translateX(${x}px)`;
            }
            if (this.scrollTranslateElement) {
                this.scrollTranslateElement.style.transform = `translateX(${-x}px)`;
            }
        }
    }

    cells = (row, col, data) => {
        const additionalClassNames = {};
        if (row === 0) {
            additionalClassNames['bt-2'] = true;
        }
        for (const gr of groupRanges) {
            if (gr[1] === row) {
                additionalClassNames['bb-2'] = true;
            }
        }
        const { healthCheckRecords } = this.props;
        if (col === healthCheckRecords.length - 1) {
            additionalClassNames['br-2'] = true;
        }
        const record = data(getRawData);
        const rowConfig = this.rows[row];
        const myValidateStatus = rowConfig.validateStatus && rowConfig.validateStatus(record);
        const nextColRecord = data(getNextColRawData);
        const nextColValidateStatus = nextColRecord && rowConfig.validateStatus
            && rowConfig.validateStatus(nextColRecord);
        const nextRowConfig = this.rows[row + 1];
        const nextRowValidateStatus = nextRowConfig && nextRowConfig.validateStatus
            && nextRowConfig.validateStatus(record);
        additionalClassNames['br-warning'] = nextColValidateStatus === 'warning';
        additionalClassNames['bb-warning'] = nextRowValidateStatus === 'warning';
        return {
            ...rowConfig,
            validateStatus: myValidateStatus,
            help: rowConfig.help && rowConfig.help(record),
            additionalClassNames,
        };
    }

    addRecordClickListener = () => {
        this.addRecord();
    }

    refPopupContainer = (ref) => {
        this.popupContainer = ref;
    }

    refScrollStickyElement = (ref) => {
        this.scrollStickyElement = ref;
    }

    refScrollTranslateElement = (ref) => {
        this.scrollTranslateElement = ref;
    }

    refScrollPlaceholder = (ref) => {
        this.scrollPlaceholder = ref;
    }

    validators(key, valueGetter) {
        let getter;
        if (!valueGetter) {
            getter = record => record[key];
        } else {
            getter = record => ({ value: valueGetter(record) });
        }
        const validate = memoize((record) => {
            const field = getter(record);
            const status = field.validateStatus;
            if (status === 'error') {
                return {
                    validateStatus: 'error',
                    help: field.help,
                };
            }
            const { patientInfo } = this.props;
            if (warnings[key]) {
                const r = warnings[key](field.value, patientInfo);
                if (r) {
                    return {
                        validateStatus: 'warning',
                        help: r,
                    };
                }
            }
            return {
                validateStatus: status,
                help: field.help,
            };
        });
        return {
            validateStatus: record => validate(record).validateStatus,
            help: record => validate(record).help,
        };
    }

    addRecord(fields) {
        const { addHealthCheckRecord } = this.props;
        const randId = `temp:${Date.now().toString(36).substr(-4)}${Math.random().toString(36).substr(-4)}`;
        addHealthCheckRecord({ ...fields, tmpid: randId });
    }

    render() {
        const { healthCheckRecords, scrollXPadding } = this.props;
        const columns = this.getColumns(healthCheckRecords);
        return (
            <div>
                <div className="health-check-record-sticky" ref={this.refScrollStickyElement}>
                    <FormItem
                        colon={false}
                        className="health-check-record-add-row"
                        label="评估指标"
                    >
                        <Button className="health-check-record-add ant-btn-bordered" icon="plus" style={buttonStyle} onClick={this.addRecordClickListener}>
                            添加
                        </Button>
                    </FormItem>
                    <div ref={this.refPopupContainer} className={`health-check-record-container ${trimmingContainerSpecialClass}`}>
                        <div className="health-check-record-header">
                            <HotTable
                                data={header}
                                columns={headerColumns}
                                colWidths={headerColWidths}
                                cells={headerCells}
                                height={rowData.length * 33 + (130 - 33) + 10}
                                width={241}
                                disableVisualSelection
                                readOnly
                                contextMenu={false}
                                mergeCells={headerMerges}
                            />
                        </div>
                        <div ref={this.refScrollTranslateElement}>
                            <HotTable
                                className="health-check-record-main"
                                columns={columns}
                                cells={this.cells}
                                colWidths={130}
                                data={rowData}
                                height={
                                    (rowData.length - 1) * 33 /* 正常行高度 */
                                    + 130 /* 照片行高度 */
                                    + (groupRanges.length + 2) /* 分组边框高度 */
                                    + 10 /* padding-bottom */
                                }
                                width={130 * healthCheckRecords.length + 1}
                                selectionMode="range"
                            />
                        </div>
                    </div>
                </div>
                <div /* 此部分用于保持滚动区域，本身占位但不可见，在横向滚动时不变transform */
                    ref={this.refScrollPlaceholder}
                    className="health-check-record-scroll-placeholder"
                    style={{
                        width: 130 * healthCheckRecords.length
                            + 240/* header width */
                            + 20/* horizontal margins */
                            + 1/* border */
                            + (Number(scrollXPadding) || 0),
                        height: 1,
                    }}
                />
            </div>
        );
    }
}
