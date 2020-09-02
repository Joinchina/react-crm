import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import {
    Row, Col, Input, Select, Button,
} from 'antd';
import moment from 'moment';
import { connect as connectCustomerCenter } from '../../states/customerCenter/customer';
import { TablePage } from '../common/table-page';
import { DateRangePicker } from '../common/DateRangePicker';
import { Form } from '../common/form';
import { connectModalHelper } from '../../mixins/modal';
import { connectRouter } from '../../mixins/router';
import { SelectSingleHospital } from '../common/SelectSingleHospital';
import { SelectTagsForQuery } from '../common/SelectTagsForQuery';
import HasPermission from '../common/HasPermission';
import Removable from '../common/Removable';
import PropTypes from '../../helpers/prop-types';
import './customer.css';

const TableColumn = TablePage.Column;
const QueryKeyChoices = [{
    value: 'name',
    label: '姓名',
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
    value: 'accountNo',
    label: '会员卡号',
}, {
    value: 'liveStreet',
    label: '居住地址',
}, {
    value: 'createBy',
    label: '创建人',
}];

const SEX = { 0: '女', 1: '男' };
const STATUS = { 0: '正常', 1: '禁用' };

const SIGNSTATUS = [{
    value: '0',
    label: '见习会员',
}, {
    value: '1',
    label: '正式会员',
}];

const MEMBERTYPE = [{
    value: '1',
    label: '保障会员',
}, {
    value: '2',
    label: '绿A会员',
}];

const mapChoiceToOption = (choice, i) => (
    <Select.Option key={i} value={choice.value} title={choice.label}>
        {choice.label}
    </Select.Option>
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
        parse: val => val || 'name',
        stringify: val => (val === 'name' ? undefined : val),
    },
    queryText: {},
    hospitalId: {
        parse: val => (val ? { id: val } : undefined),
        stringify: val => (val ? val.id : undefined),
    },
    tags: {
        parse: val => (val ? val.split(',') : undefined),
        stringify: val => (val ? val.map(item => item.id || item).join(',') : undefined),
    },
    createDate: dateRangeField,
    createBy: {},
    signStatus: {},
    memberType: {},
    level: {},
});
class CustomerCenter extends Component {
    static propTypes = {
        currentModal: PropTypes.string,
        openModal: PropTypes.func,
        customerList: PropTypes.shape().isRequired,
        searchCustomerList: PropTypes.func.isRequired,
        resetCustomerList: PropTypes.func.isRequired,
        renderCustomerOption: PropTypes.func,
        router: PropTypes.shape().isRequired,
    };

    static defaultProps = {
        currentModal: '',
        openModal: undefined,
        renderCustomerOption: undefined,
    };

    componentWillReceiveProps(props) {
        const { currentModal } = this.props;
        if (currentModal === 'addCustomer' && !props.currentModal) {
            this.table.reload();
        }
    }

    componentDidMount(){
        const {getLevelList} = this.props;
        getLevelList();
    }

    componentWillUnmount() {
        const { resetCustomerList } = this.props;
        resetCustomerList();
    }

    loadData = ({ values, pageIndex, pageSize }) => {
        const { searchCustomerList } = this.props;
        const where = {};
        if (values.createBy) {
            const id = values.createBy.substr(0, values.createBy.indexOf(','));
            where.createById = id;
        }
        if (values.queryKey && values.queryText) {
            if (values.queryKey === 'name' || values.queryKey === 'liveStreet' || values.queryKey === 'createBy') {
                where[values.queryKey] = { $like: `${values.queryText}` };
            } else {
                where[values.queryKey] = values.queryText;
            }
        }
        where.hospitalId = values.hospitalId && values.hospitalId.id;
        if (values.tags) {
            where.tagIds = { $in: values.tags };
        }
        if (values.createDate && values.createDate.length > 0) {
            where.createDate = {};
            if (values.createDate[0]) {
                where.createDate.$gte = values.createDate[0].format('YYYY-MM-DD');
            }
            if (values.createDate[1]) {
                where.createDate.$lte = values.createDate[1].format('YYYY-MM-DD');
            }
        }
        if(values.signStatus!== undefined){
            where.signStatus = values.signStatus;
        }
        if(values.memberType !== undefined){
            where.memberType = values.memberType;
        }
        if(values.level !== undefined){
            where.gradeId = values.level;
        }
        searchCustomerList(where, pageIndex, pageSize);
    }

    resetData = () => {
        const { resetCustomerList } = this.props;
        resetCustomerList();
    }

    render() {
        const {
            customerList,
            openModal,
            router,
            renderCustomerOption,
            levelList,
        } = this.props;
        const LEVEL = levelList && levelList.list && levelList.list.length ? levelList.list.map((i) => ({value:`${i.id}`, label:i.name})) : []
        const SelectSingleHospitalForView = SelectSingleHospital.forDataRange('patient.edit,patient.view,patient.admin', 'or');
        const SelectTagsForQueryEdit = SelectTagsForQuery.forDataRange(2);
        return (
            <div className="customer">
                <TablePage
                    def={tableDef}
                    data={customerList}
                    onLoadData={this.loadData}
                    onResetData={this.resetData}
                    tableRef={(table) => { this.table = table; }}
                    autoLoad={false}
                    rowKey="id"
                    renderFormFields={(values, loadData) => {
                        let searchProps;
                        switch (values.queryKey) {
                            case 'name':
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
                            case 'accountNo':
                                searchProps = { placeholder: '请输入会员卡号' };
                                break;
                            case 'liveStreet':
                                searchProps = { placeholder: '请输入居住地址' };
                                break;
                            case 'createBy':
                                searchProps = { placeholder: '请输入创建人姓名' };
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
                                            <Col span={5}>
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
                                            <Col span={3} key="2">
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
                                    <Form.Item field="hospitalId" height="auto">
                                        <SelectSingleHospitalForView placeholder="请选择签约机构" allowClear />
                                    </Form.Item>
                                </Col>
                                <Col span={3}>
                                    <Form.Item field="tags" height="auto">
                                        <SelectTagsForQueryEdit placeholder="请选择标签" />
                                    </Form.Item>
                                </Col>
                                <Col span={3}>
                                    <Form.Item field="createDate" height="auto">
                                        <DateRangePicker size="default" placeholder="请选择创建时间" />
                                    </Form.Item>
                                </Col>
                                <Col span={3}>
                                    <Form.Item field="memberType" height="auto">
                                        <Select allowClear placeholder="请选择会员类型">
                                        {MEMBERTYPE.map(mapChoiceToOption)}
                                        </Select>
                                    </Form.Item>
                                </Col>
                                <Col span={3}>
                                    <Form.Item field="level" height="auto">
                                        <Select allowClear placeholder="请选择会员等级">
                                        {LEVEL.map(mapChoiceToOption)}
                                        </Select>
                                    </Form.Item>
                                </Col>
                                <Col span={2}>
                                    <Button onClick={loadData} style={{ width: '100%', minWidth: 0 }} type="primary">
                                        查询
                                    </Button>
                                </Col>
                                <Col span={2}>
                                    <HasPermission match="patient.edit">
                                        <Button onClick={() => openModal('addCustomer')} style={{ width: '100%', minWidth: 0 }} type="primary">
                                            新建
                                        </Button>
                                    </HasPermission>
                                </Col>
                            </Row>
                        );
                    }}
                >
                    <TableColumn
                        title="姓名"
                        className="max-w-200 nowrap"
                        dataIndex="name"
                        key="name"
                        render={(name, patient) => (
                            <span>
                                <Link
                                    to={`/customerDetails/${patient.id}/EssentialInfor?r=${encodeURIComponent(router.fullPath)}`}
                                    className={renderCustomerOption ? 'padding20ellipsis' : 'ellipsis'}
                                >
                                    <span className="clickable">
                                        {name}
                                    </span>
                                </Link>
                                {
                                    renderCustomerOption && renderCustomerOption(patient)
                                }
                            </span>
                        )}
                    />
                    <TableColumn
                        title="性别"
                        className="singleline"
                        dataIndex="sex"
                        key="sex"
                        render={sex => SEX[sex]}
                    />
                    <TableColumn
                        title="年龄"
                        className="singleline"
                        dataIndex="birthday"
                        key="birthday"
                        render={birthday => birthday && `${moment().year() - moment(birthday).year()}岁`}
                    />
                    <TableColumn
                        title="签约机构"
                        className="singleline max-w-300"
                        dataIndex="hospitalName"
                        key="hospitalName"
                    />
                    <TableColumn
                        title="手机号码"
                        className="singleline"
                        dataIndex="phone"
                        key="phone"
                    />
                    <TableColumn
                        title="其他联系方式"
                        className="singleline max-w-120"
                        dataIndex="machineNumber"
                        key="machineNumber"
                    />
                    <TableColumn
                        title="会员类型"
                        className="singleline max-w-120"
                        dataIndex="memberType"
                        key="memberType"
                        render={value => {
                            const val = MEMBERTYPE.filter((val) => val.value == value);
                            return (
                                <span>
                                    {val && val.length > 0 ? val[0].label : null}
                                </span>
                            )
                        }}
                    />
                    <TableColumn
                        title="会员等级"
                        className="singleline max-w-120"
                        dataIndex="gradeName"
                        key="gradeName"
                    />
                    <TableColumn
                        title="居住地址"
                        className="singleline max-w-300"
                        dataIndex="address"
                        key="address"
                        render={(address) => {
                            const province = address.provinceName ? `${address.provinceName}/` : '';
                            const city = address.cityName ? `${address.cityName}/` : '';
                            const area = address.areaName ? `${address.areaName}/` : '';
                            const liveStreet = address.liveStreet || '';
                            return province + city + area + liveStreet;
                        }}
                    />
                    <TableColumn
                        title="标签"
                        className="singleline max-w-200"
                        dataIndex="tags"
                        key="tags"
                        render={value => (
                            <span>
                                {value && value.split(',').join('/')}
                            </span>
                        )}
                    />
                    <TableColumn
                        title="账户状态"
                        className="singleline"
                        dataIndex="isDisabled"
                        key="isDisabled"
                        render={isDisabled => STATUS[isDisabled] || '未知状态'}
                    />
                    <TableColumn
                        title="创建时间"
                        className="singleline"
                        dataIndex="createDate"
                        key="createDate"
                    />
                </TablePage>
            </div>
        );
    }
}

export default connectRouter(connectModalHelper(connectCustomerCenter(CustomerCenter)));
