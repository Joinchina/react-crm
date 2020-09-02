import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import {
    Row, Col, Input, Select, Button, Upload, Modal, Table, Form as AntForm,
} from 'antd';
import message from '@wanhu/antd-legacy/lib/message'
import moment from 'moment';
import PropTypes from '../../../helpers/prop-types';
import { connect as connectReservationCenter } from '../../../states/reservationRecord/reservation';
import { TablePage } from '../../common/table-page';
import { DateRangePicker } from '../../common/DateRangePicker';
import { Form } from '../../common/form';
import { connectModalHelper } from '../../../mixins/modal';
import { connectRouter } from '../../../mixins/router';
import { SelectSingleHospital } from '../../common/SelectSingleHospital';
import HasPermission from '../../common/HasPermission';
import Removable from '../../common/Removable';
import { url } from '../../../api';
import api from '../../../api/api';
import AsyncEvent from '../../common/AsyncEvent';
import './index.css';
import UpdateReservation from './UpdateReservation';

const TableColumn = TablePage.Column;
const { Option } = Select;
const styles = {
    btn: {
        minWidth: 50,
        width: 50,
        padding: 0,
    },
    expandIcon: {
        position: 'relative',
        zIndex: 1,
        top: 100,
        left: 20,
    },
};
const QueryKeyChoices = [{
    value: 'patientName',
    label: '会员',
}, {
    value: 'phone',
    label: '手机号',
}, {
    value: 'machineNumber',
    label: '其他联系方式',
}, {
    value: 'idCard',
    label: '身份证号',
}, {
    value: 'doctorName',
    label: '预约医生',
}, {
    value: 'createByName',
    label: '创建人',
}, {
    value: 'updateByName',
    label: '更新人',
}];
const StatusChoices = [
    { value: '1', label: '已预约' },
    { value: '2', label: '已确认' },
    { value: '3', label: '已取消' },

];
const StatusMap = {};
for (const item of StatusChoices) {
    StatusMap[item.value] = item.label;
}
const worktimeMap = [
    {
        id: '1',
        label: '上午8：00~12：00',
    },
    {
        id: '2',
        label: '下午14：00~17：00',
    },
    {
        id: '3',
        label: '全天8：00~17：00',
    },
];
const mapChoiceToOption = (choice, i) => (
    <Option key={i} value={choice.value} title={choice.label}>
        {choice.label}
    </Option>
);
const dateRangeField = {
    parse: val => (val ? val.split(',').map((s) => {
        if (!s) return undefined;
        const m = moment(s);
        return m.isValid() ? m : undefined;
    }) : undefined),
    stringify: val => (val ? val.map(d => ((d && moment.isMoment(d)) ? d.format('YYYY-MM-DD') : '')).join(',') : undefined),
};
const tableDef = TablePage.def({
    queryKey: {
        parse: val => val || 'patientName',
        stringify: val => (val === 'patientName' ? undefined : val),
    },
    queryText: {},
    status: {},
    hospitalId: {
        parse: val => (val ? { id: val } : undefined),
        stringify: val => (val ? val.id : undefined),
    },
    appointmentTime: dateRangeField,
    appointmentFlag: val => val,
    createDate: dateRangeField,
    updateDate: dateRangeField,
    createByName: {},
});

class ReservationCenter extends Component {
    static propTypes = {
        router: PropTypes.shape().isRequired,
        currentModal: PropTypes.string,
        openModal: PropTypes.func,
        form: PropTypes.form().isRequired,
        resetReservationList: PropTypes.func.isRequired,
        updateImportStatus: PropTypes.func.isRequired,
        searchReservationList: PropTypes.func.isRequired,
        reservationList: PropTypes.asyncResult(PropTypes.shape({
            list: PropTypes.array,
        })).isRequired,
        importResult: PropTypes.asyncResult(PropTypes.object).isRequired,
        renderCustomerOption: PropTypes.func,
    };

    static defaultProps = {
        currentModal: undefined,
        openModal: undefined,
        renderCustomerOption: undefined,
    };

    state = {
        expand: false,
        expandedRowKeys: [],
        modifyed: false,
        cancelled: false,
        submitting: false,
    };

    componentWillReceiveProps(nextProps) {
        const { currentModal } = this.props;
        if (currentModal === 'addCustomerReserve' && !nextProps.currentModal) {
            this.table.reload();
        }
    }

    componentWillUnmount() {
        const { resetReservationList } = this.props;
        resetReservationList();
    }

    onExportTable(values) {
        const where = this.mapFormValuesToQuery(values);
        api.downloadReservationTable(where);
    }

    onImportChange = (changes) => {
        const { updateImportStatus } = this.props;
        updateImportStatus(changes.file.status, changes.file.response, changes.file.error);
    }

    onDownloadUrl = () => {
        window.location.href = 'http://wanhuhealth.oss-cn-beijing.aliyuncs.com/crm-web/static/files/%E6%8E%92%E7%8F%AD%E5%AF%BC%E5%85%A5%E6%A8%A1%E6%9D%BF.xlsx';
    }

    onExpand = (expanded, record) => {
        const handleExpandAllAfter = () => {
            const { reservationList } = this.props;
            const { expandedRowKeys } = this.state;
            const expandedRowKeysAll = reservationList && reservationList.list
                && reservationList.list.map(item => item.id);
            if (expandedRowKeys.length === expandedRowKeysAll.length) {
                this.setState({ expand: true });
            } else {
                this.setState({ expand: false });
            }
        };
        if (expanded) {
            this.setState(prevState => ({
                expandedRowKeys: [...prevState.expandedRowKeys, record.id],
            }), () => handleExpandAllAfter());
        } else {
            this.setState(prevState => ({
                expandedRowKeys: prevState.expandedRowKeys.filter(item => item !== record.id),
            }), () => handleExpandAllAfter());
        }
    }

    onSubmit = () => {
        try {
            const { form } = this.props;
            const { modifyed, cancelled } = this.state;
            const { id, patientId } = this.reservationRecord;
            if (modifyed) {
                form.validateFields(['day', 'time'], async (err, values) => {
                    if (err) {
                        return;
                    }
                    const data = {
                        patientId,
                        recordId: id,
                        appointmentDate: moment(values.day).format('YYYY-MM-DD'),
                        appointmentFlag: values.time,
                    };
                    await api.updateAppointmentTime(id, data);
                    message.success('改期成功', 1, () => this.onCancel());
                });
            }
            if (cancelled) {
                form.validateFields(['reason', 'otherReason'], async (err, values) => {
                    if (err) {
                        return;
                    }
                    const data = {
                        status: 3,
                        cancelReason: values.reason,
                        otherReason: values.otherReason,
                    };
                    await api.operateReservation(id, data);
                    message.success('取消成功', 1, () => this.onCancel());
                });
            }
        } catch (e) {
            message.error(e.message);
        }
    }

    onCancel = () => {
        this.setState({
            modifyed: false,
            cancelled: false,
        });
        const { form } = this.props;
        form.resetFields();
        this.table.reload();
    }

    operateReservation = async (id, status) => {
        await api.putReservationRecordById(id, { status });// 1：已预约，2：已确认，3：已取消
        message.success('确认成功', 2, () => this.table.reload());
    }

    loadData = ({ values, pageIndex, pageSize }) => {
        const where = this.mapFormValuesToQuery(values);
        const { searchReservationList } = this.props;
        searchReservationList(where, pageIndex, pageSize);
    }

    resetData = () => {
        const { resetReservationList } = this.props;
        resetReservationList();
    }

    finishImport = () => {
        message.success('排班导入成功', 3, () => this.table.reload());
    }

    handleExpandAll = () => {
        const { reservationList } = this.props;
        const expandedRowKeysAll = reservationList && reservationList.list
        && reservationList.list.map(item => item.id);
        this.setState(prevState => ({
            expand: !prevState.expand,
        }), () => {
            const { expand } = this.state;
            if (!expand) {
                this.setState({ expandedRowKeys: [] });
            } else {
                this.setState({ expandedRowKeys: expandedRowKeysAll });
            }
        });
    }

    showModifyModal = async (record) => {
        this.reservationRecord = record;
        const params = {
            where: {
                doctorId: record.doctorId,
                workDay: { $gte: moment().format('YYYY-MM-DD') },
            },
        };
        const res = await api.getDoctorSchedules(params);
        this.doctorSchedules = res.datas && res.datas.map(item => ({
            workday: item.workday,
            worktime: item.worktime,
        }));
        this.setState({ modifyed: true });
    }

    showCancelModal = (record) => {
        this.reservationRecord = record;
        this.setState({ cancelled: true });
    }

    handleDisabledDate = (current) => {
        if (!current) return null;
        const allowDate = this.doctorSchedules;
        if (allowDate && allowDate.some(item => item.workday === current.format('YYYY-MM-DD').valueOf())) {
            return current && current.valueOf() < Date.now();
        }
        return current && current.valueOf();
    }

    /* eslint-disable class-methods-use-this */
    importFaild(nextPayload) {
        let errorTitle;
        let errorMessage = '';
        if (/^.+：/.test(nextPayload.message)) {
            const errorArray = nextPayload.message.split('\n');
            [errorTitle] = [errorArray[0]];
            if (Array.isArray(errorArray)) {
                errorMessage = errorArray.map((row, index) => (
                    <p key={row.id || index}>
                        {row}
                    </p>
                ));
                errorMessage = (
                    <div>
                        {errorMessage}
                    </div>
                );
            }
        } else {
            errorTitle = nextPayload.message;
        }
        Modal.error({
            title: errorTitle,
            content: errorMessage,
        });
    }

    /* eslint-disable class-methods-use-this */
    mapFormValuesToQuery(values) {
        const where = {};
        if (values.queryKey && values.queryText) {
            if (values.queryKey === 'patientName' || values.queryKey === 'doctorName') {
                where[values.queryKey] = { $like: `%${values.queryText}%` };
            } else {
                where[values.queryKey] = values.queryText;
            }
        }
        where.status = values.status ? { $in: [parseInt(values.status, 10)] } : values.status;
        where.hospitalId = values.hospitalId && values.hospitalId.id;
        where.appointmentFlag = values.appointmentFlag;
        const dateTypeArr = ['appointmentTime', 'createDate', 'updateDate'];
        dateTypeArr.forEach((type) => {
            if (values[type] && values[type].length > 0) {
                where[type] = {};
                if (values[type][0]) {
                    where[type].$gte = values[type][0].format('YYYY-MM-DD');
                }
                if (values[type][1]) {
                    where[type].$lte = values[type][1].format('YYYY-MM-DD');
                }
            }
        });
        return where;
    }

    replace(data, text) {
        if (data === 0 || Number.isNaN(data)) {
            return '-';
        }
        if (typeof data === 'number') return `${data}${text}`;
        return `${data}`;
    }

    renderExpandedRowRender = (record) => {
        const columns = [
            {
                title: '通用名（商品名）',
                dataIndex: 'commonName',
                width: '10%',
                className: 'singleline',
                render: (text, record) => (record.productName ? `${text}(${record.productName})` : `${text}`),
            },
            {
                title: '规格',
                dataIndex: 'packageSize',
                width: '10%',
                render: (text, record) => (`${record.preparationUnit}*${text}${record.minimumUnit}/${record.packageUnit}`),
            },
            {
                title: '单次用量',
                dataIndex: 'useAmount',
                width: '5%',
                render: (text, record) => (`${text}${record.minimumUnit}`),
            },
            {
                title: '频次',
                dataIndex: 'frequency',
                width: '5%',
                render: (text) => {
                    const texts = Number.isNaN(parseInt(text, 10)) ? text : parseInt(text, 10);
                    switch (text) {
                    case 1: return 'qd 每日一次';
                    case 2: return 'bid 每日两次';
                    case 3: return 'tid 每日三次';
                    case 4: return 'qid 每日四次';
                    case 5: return 'qn 每夜一次';
                    case 6: return 'qw 每周一次';
                    default: return texts;
                    }
                },
            },
            {
                title: '购买数量',
                dataIndex: 'amount',
                width: '5%',
                render: (text, record) => (`${text}${record.packageUnit}`),
            },
            {
                title: '实售数量',
                dataIndex: 'realQuantity',
                width: '5%',
                render: (text, record) => this.replace(text, record.packageUnit),
            },
            {
                title: '取药时间',
                width: '10%',
                dataIndex: 'takeOrderDate',
            },
        ];
        return (
            <Table
                columns={columns}
                dataSource={record.drugs}
                rowKey="id"
                className="child-table"
                pagination={false}
            />
        );
    }

    render() {
        const {
            openModal, reservationList, importResult, renderCustomerOption, form, router,
        } = this.props;
        const {
            expand,
            expandedRowKeys,
            modifyed,
            cancelled,
            submitting,
        } = this.state;
        const SelectSingleHospitalForView = SelectSingleHospital.forDataRange('patient.edit,patient.view,patient.admin', 'or');
        const expandedRowRender = this.renderExpandedRowRender;
        const expandedRowKeysAll = reservationList && reservationList.list
            && reservationList.list.map(item => item.id);
        const dataSource = {
            doctorSchedules: this.doctorSchedules,
            reservationRecord: this.reservationRecord,
        };
        const timeOptions = worktimeMap.map(time => (
            <Option key={time.id} title={time.label}>
                {time.label}
            </Option>
        ));
        return (
            <div className="reservationCenter">
                {/* eslint-disable */}
                <span
                    style={styles.expandIcon}
                    className={`ant-table-row-expand-icon ${expand ? 'ant-table-row-expanded' : 'ant-table-row-collapsed'}`}
                    onClick={this.handleExpandAll}
                />
                <TablePage
                    def={tableDef}
                    data={reservationList}
                    expandedRowRender={expandedRowRender}
                    expandedRowKeys={expand ? expandedRowKeysAll : expandedRowKeys}
                    onExpand={this.onExpand}
                    onLoadData={this.loadData}
                    onResetData={this.resetData}
                    tableRef={(table) => { this.table = table; }}
                    autoLoad={false}
                    rowKey="id"
                    renderFormFields={(values, loadData) => {
                        let searchProps;
                        switch (values.queryKey) {
                        case 'patientName':
                            searchProps = { placeholder: '请输入会员姓名' };
                            break;
                        case 'phone':
                            searchProps = { placeholder: '请输入会员手机号' };
                            break;
                        case 'machineNumber':
                            searchProps = { placeholder: '请输入会员其他联系方式' };
                            break;
                        case 'idCard':
                            searchProps = { placeholder: '请输入会员身份证号' };
                            break;
                        case 'doctorName':
                            searchProps = { placeholder: '请输入预约医生姓名' };
                            break;
                        case 'createByName':
                            searchProps = { placeholder: '请输入创建人姓名' };
                            break;
                        case 'updateByName':
                            searchProps = { placeholder: '请输入更新人姓名' };
                            break;
                        default:
                            searchProps = { disabled: true };
                            break;
                        }
                        return (
                            <Row gutter={10} className="block filter-box">
                                {
                                    values.createBy
                                        ? (
                                            <Col span={6}>
                                                <Form.Item field="createBy" height="auto">
                                                    <Removable renderer={val => `创建人：${val.substr(1 + val.indexOf(','))}`} />
                                                </Form.Item>
                                            </Col>
                                        ) : [
                                            <Col span={2} key="1">
                                                <Form.Item field="queryKey" height="auto">
                                                    <Select>
                                                        {QueryKeyChoices.map(mapChoiceToOption)}
                                                    </Select>
                                                </Form.Item>
                                            </Col>,
                                            <Col span={2} key="2">
                                                <Form.Item field="queryText" height="auto">
                                                    <Input
                                                        {...searchProps}
                                                        onPressEnter={loadData}
                                                    />
                                                </Form.Item>
                                            </Col>,
                                        ]
                                }
                                <Col span={3}>
                                    <Form.Item field="status" height="auto">
                                        <Select placeholder="请选择预约状态" allowClear>
                                            {StatusChoices.map(mapChoiceToOption)}
                                        </Select>
                                    </Form.Item>
                                </Col>
                                <Col span={3}>
                                    <Form.Item field="hospitalId" height="auto">
                                        <SelectSingleHospitalForView placeholder="请选择预约机构" allowClear />
                                    </Form.Item>
                                </Col>
                                <Col span={3}>
                                    <Form.Item field="appointmentTime" height="auto">
                                        <DateRangePicker size="default" placeholder="请选择预约时间" />
                                    </Form.Item>
                                </Col>
                                <Col span={3}>
                                    <Form.Item field="appointmentFlag" height="auto">
                                        <Select
                                            allowClear
                                            placeholder="请选择预约时间"
                                        >
                                            {timeOptions}
                                        </Select>
                                    </Form.Item>
                                </Col>
                                <Col span={3}>
                                    <Form.Item field="createDate" height="auto">
                                        <DateRangePicker size="default" placeholder="请选择创建时间" />
                                    </Form.Item>
                                </Col>
                                <Col span={3}>
                                    <Form.Item field="updateDate" height="auto">
                                        <DateRangePicker size="default" placeholder="请选择更新时间" />
                                    </Form.Item>
                                </Col>
                                <Col span={1}>
                                    <Button onClick={loadData} type="primary" style={styles.btn}>
                                        查询
                                    </Button>
                                </Col>
                                <Col span={1} >
                                    <HasPermission match="patient.edit">
                                        <Button onClick={() => openModal('addCustomerReserve')} type="primary" style={styles.btn}>
                                            新建
                                        </Button>
                                    </HasPermission>
                                </Col>
                            </Row>
                        );
                    }}
                    renderFooter={values => (
                        <div>
                            <Button
                                type="primary"
                                style={{ marginRight: 20 }}
                                onClick={() => this.onExportTable(values)}
                            >
                                导出
                            </Button>
                            <Upload
                                showUploadList={false}
                                name="file"
                                action={url('/doctorSchedules/importing')}
                                onChange={this.onImportChange}
                                withCredentials
                            >
                                <Button
                                    style={{ width: '100%', minWidth: 0 }}
                                    type="primary"
                                    loading={importResult.status === 'pending'}
                                >
                                    排班导入
                                </Button>
                            </Upload>
                            <Button
                                type="primary"
                                style={{ marginLeft: 20 }}
                                onClick={this.onDownloadUrl}
                            >
                                模板下载
                            </Button>
                        </div>
                    )}
                    footerHeight={36}
                >
                    <TableColumn
                        title="会员"
                        className="max-w-200 nowrap"
                        dataIndex="patientName"
                        key="patientName"
                        render={(name, info) => (
                            <span>
                                <Link
                                    to={`/reservationDetails/${info.id}?r=${encodeURIComponent(router.fullPath)}`}
                                    className={renderCustomerOption ? 'padding20ellipsis' : 'ellipsis'}
                                >
                                    <span className="clickable">
                                        {name}
                                    </span>
                                </Link>
                            </span>
                        )}
                    />
                    <TableColumn
                        title="预约医生"
                        className="singleline"
                        dataIndex="doctorName"
                        key="doctorName"
                    />
                    <TableColumn
                        title="预约时间"
                        className="singleline max-w-200"
                        dataIndex="appointmentTimeStr"
                        key="appointmentTimeStr"
                        render={(appointmentTimeStr, info) => (
                            <span style={{ color: !info.isNormal ? '#e74c3c' : '' }}>
                                {appointmentTimeStr}
                            </span>
                        )}
                    />
                    <TableColumn
                        title="预约机构"
                        className="singleline max-w-200"
                        dataIndex="hospitalName"
                        key="hospitalName"
                    />
                    <TableColumn
                        title="预约状态"
                        className="singleline"
                        dataIndex="status"
                        key="status"
                        render={status => (
                            <span>
                                {StatusChoices.find(s => parseInt(s.value, 10) === status).label}
                            </span>
                        )}
                    />
                    <TableColumn
                        title="创建人"
                        className="singleline"
                        dataIndex="createByName"
                        key="createByName"
                        render={(createByName, info) => {
                            let creator = '';
                            if (createByName) {
                                if (info.createByCompany) {
                                    if (info.createByDepartment) {
                                        creator = `${createByName}(${info.createByCompany}，${info.createByDepartment})`;
                                    } else {
                                        creator = `${createByName}(${info.createByCompany})`;
                                    }
                                } else {
                                    creator = createByName;
                                }
                            }
                            return creator;
                        }}
                    />
                    <TableColumn
                        title="更新人"
                        className="singleline"
                        dataIndex="updateByName"
                        key="updateByName"
                        render={(updateByName, info) => {
                            let updator = '';
                            if (updateByName) {
                                if (info.createByCompany) {
                                    if (info.createByDepartment) {
                                        updator = `${updateByName}(${info.createByCompany}，${info.createByDepartment})`;
                                    } else {
                                        updator = `${updateByName}(${info.createByCompany})`;
                                    }
                                } else {
                                    updator = updateByName;
                                }
                            }
                            return updator;
                        }}
                    />
                    <TableColumn
                        title="创建时间"
                        className="singleline"
                        dataIndex="createDate"
                        key="createDate"
                    />
                    <TableColumn
                        title="更新时间"
                        className="singleline"
                        dataIndex="updateDate"
                        key="updateDate"
                    />
                    <TableColumn
                        title="操作"
                        className="singleline"
                        dataIndex="status"
                        key="operate"
                        render={(status, info) => (
                            <span>
                                {status === 1 ? (
                                    <span>
                                        {/* eslint-disable */}
                                        <span className="clickable" title="确认" onClick={() => this.operateReservation(info.id, 2)}>
                                            确认
                                        </span>
                                        {
                                            info.updateFlag === 1
                                                &&
                                            <span className="clickable" title="改期" onClick={() => this.showModifyModal(info)}>
                                                改期
                                            </span>
                                        }
                                        <span className="clickable" title="取消" onClick={() => this.showCancelModal(info)}>
                                            取消
                                        </span>
                                    </span>
                                ) : null}
                            </span>
                        )}
                    />
                </TablePage>
                <AsyncEvent
                    async={importResult}
                    onFulfill={this.finishImport}
                    onReject={this.importFaild}
                />
                {
                    <UpdateReservation form={form} modifyed={modifyed} cancelled={cancelled} submitting={submitting} dataSource={dataSource} onSubmit={this.onSubmit} onCancel={this.onCancel} />
                }
            </div>
        );
    }
}

const ReservationCenterWrap = AntForm.create({})(ReservationCenter);
export default connectRouter(connectModalHelper(connectReservationCenter(ReservationCenterWrap)));
