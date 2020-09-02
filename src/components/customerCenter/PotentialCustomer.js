import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import {
    Row, Col, Input, Select, Button, Upload, Modal,
} from 'antd';
import moment from 'moment';
import PropTypes from '../../helpers/prop-types';
import { connect as connectPotentialCustomer } from '../../states/customerCenter/potentialCustomer';
import { TablePage } from '../common/table-page';
import { DateRangePicker } from '../common/DateRangePicker';
import { Form } from '../common/form';
import { connectModalHelper } from '../../mixins/modal';
import { connectRouter } from '../../mixins/router';
import { url } from '../../api';
import AsyncEvent from '../common/AsyncEvent';
import HasPermission, { testPermission } from '../common/HasPermission';
import {requestGet} from '../../createRequest'
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
    value: 'liveStreet',
    label: '家庭住址',
}];

const SEX = { 0: '女', 1: '男' };

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
    active: {
        // parse: val => val || 'channelName',
        // stringify: val => (val === 'channelName' ? undefined : val),
    },
    channelValue: {
    },
    createDate: dateRangeField,
});


class PotentialCustomer extends Component {
    constructor(props){
        super(props)
        this.state={
            channelData:[]
        }
    }
    static propTypes = {
        currentModal: PropTypes.string,
        openModal: PropTypes.func,
        resetpotentialCustomerList: PropTypes.func.isRequired,
        updateImportStatus: PropTypes.func.isRequired,
        searchPotentialCustomerList: PropTypes.func.isRequired,
        potentialCustomerList: PropTypes.asyncResult(PropTypes.shape({
            list: PropTypes.array,
        })).isRequired,
        importResult: PropTypes.asyncResult(PropTypes.object).isRequired,
        router: PropTypes.shape({
            path: PropTypes.string,
        }).isRequired,
    };
    static defaultProps = {
        currentModal: undefined,
        openModal: undefined,
    };
    componentDidMount(){
        //获取销售渠道
        requestGet(`_api/operationchannel`).then((res) => {
            this.setState({
                channelData:res
            })
        }).catch((err) => {

        });
    }
    componentWillReceiveProps(props) {
        const { currentModal } = this.props;
        if (currentModal === 'addPotentialCustomer' && !props.currentModal) {
            this.table.reload();
        }
        if (currentModal === 'addCustomer' && !props.currentModal) {
            this.table.reload();
        }
    }

    componentWillUnmount() {
        const { resetpotentialCustomerList } = this.props;
        resetpotentialCustomerList();
    }

    onImportChange = (changes) => {
        const { updateImportStatus } = this.props;
        updateImportStatus(changes.file.status, changes.file.response, changes.file.error);
    }

    onDownloadUrl = () => {
        window.location.href = 'https://wanhuhealth.oss-cn-beijing.aliyuncs.com/crm-web/static/files/%E8%AF%9D%E5%8A%A1%E8%B5%84%E6%96%99%E6%A8%A1%E6%9D%BF.xlsx';
    }

    loadData = ({ values, pageIndex, pageSize }) => {
        const where = {};
        where.isSign = 0;
        if(values.channelValue){
            where.channelValue = Number(values.channelValue);
        }
        if (values.queryKey && values.queryText) {
            if (values.queryKey === 'name' || values.queryKey === 'liveStreet') {
                where[values.queryKey] = { $like: `%${values.queryText}%` };
            } else {
                where[values.queryKey] = values.queryText;
            }
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
        const { searchPotentialCustomerList } = this.props;
        searchPotentialCustomerList(where, pageIndex, pageSize);
    }

    resetData = () => {
        const { resetpotentialCustomerList } = this.props;
        resetpotentialCustomerList();
    }

    finishImport = () => {
        const { importResult } = this.props;
        const mes = importResult.payload;
        const content = (
            <p style={{ whiteSpace: 'pre-line' }}>
                {mes}
            </p>
        );
        Modal.success({
            title: '导入完成',
            content,
            okText: '确定',
            onOk: () => {
                this.table.reload();
            },
        });
    }

    render() {
        const {
            openModal, potentialCustomerList, importResult, router,
        } = this.props;
        console.log("数据呢",this.state.channelData)
        return (
            <div>
                <TablePage
                    def={tableDef}
                    data={potentialCustomerList}
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
                        case 'liveStreet':
                            searchProps = { placeholder: '请输入家庭住址' };
                            break;
                        default:
                            searchProps = { disabled: true };
                            break;
                        }
                        return (
                            <Row gutter={10} className="block filter-box">
                                <Col span={2}>
                                    <Form.Item field="queryKey" height="auto">
                                        <Select>
                                            { QueryKeyChoices.map(mapChoiceToOption) }
                                        </Select>
                                    </Form.Item>
                                </Col>
                                <Col span={5}>
                                    <Form.Item field="queryText" height="auto">
                                        <Input {...searchProps} onPressEnter={loadData} />
                                    </Form.Item>
                                </Col>
                                <Col span={3}>
                                    <Form.Item field="active" height="auto">
                                        <Select placeholder="请选择营销活动" allowClear={true}>
                                            {/* { QueryKeyChoices.map(mapChoiceToOption) } */}
                                        </Select>
                                    </Form.Item>
                                </Col>
                                <Col span={3}>
                                    <Form.Item field="channelValue" height="auto" >
                                        <Select placeholder="请选择销售渠道" allowClear={true}>
                                            { this.state.channelData.map((choice, i) => (
                                                <Select.Option key={i} value={choice.channelValue} title={choice.channelName}>
                                                    {choice.channelName}（{choice.channelValue}）
                                                </Select.Option>
                                            ))}
                                        </Select>
                                    </Form.Item>
                                </Col>
                                <Col span={5}>
                                    <Form.Item field="createDate" height="auto">
                                        <DateRangePicker size="default" placeholder="请选择创建时间" />
                                    </Form.Item>
                                </Col>
                                <Col span={2}>
                                    <Button onClick={loadData} style={{ width: '100%', minWidth: 0 }} type="primary">
                                        查询
                                    </Button>
                                </Col>
                                <Col span={2}>
                                    <HasPermission match="patient.edit">
                                        <Button onClick={() => openModal('addPotentialCustomer')} style={{ width: '100%', minWidth: 0 }} type="primary">
                                            新建
                                        </Button>
                                    </HasPermission>
                                </Col>
                                <Col span={2}>
                                    <HasPermission match="patient.admin">
                                        <Upload
                                            showUploadList={false}
                                            className="fullwidth"
                                            name="file"
                                            action={url('/patient/potential/importData')}
                                            onChange={this.onImportChange}
                                            withCredentials
                                        >
                                            <Button
                                                className="fullwidth"
                                                type="primary"
                                                loading={importResult.status === 'pending'}
                                            >
                                                导入
                                            </Button>
                                        </Upload>
                                    </HasPermission>
                                </Col>
                            </Row>
                        );
                    }}
                    renderFooter={() => (
                        <Button onClick={this.onDownloadUrl} type="primary">
                        模板下载
                        </Button>
                    )}
                >
                    <TableColumn
                        title="姓名"
                        className="singleline max-w-100"
                        dataIndex="name"
                        key="name"
                        render={(name, order) => (
                            <Link to={`potentialCustomerDetails/${order.id}/EssentialInfor?r=${encodeURIComponent(router.fullPath)}`}>
                                <span className="clickable">
                                    {name}
                                </span>
                            </Link>
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
                        title="手机号码"
                        className="singleline"
                        dataIndex="phone"
                        key="phone"
                    />
                    <TableColumn
                        title="其他联系方式"
                        className="singleline"
                        dataIndex="machineNumber"
                        key="machineNumber"
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
                        title="营销活动"
                        className="singleline"
                        dataIndex=""
                        key=""
                    />
                    <TableColumn
                        title="销售渠道"
                        className="singleline"
                        dataIndex="channelName"
                        key="channelName"
                    />
                    <TableColumn
                        title="创建时间"
                        className="singleline"
                        dataIndex="createDate"
                        key="createDate"
                    />
                    { testPermission('patient.edit')
                        ? (
                            <TableColumn
                                title="操作"
                                className="singleline"
                                dataIndex="id"
                                key="id"
                                render={id => (
                                    /* eslint-disable-next-line */
                                    <span className="clickable" onClick={() => this.props.openModal('addCustomer', id)}>
                                        转化签约
                                    </span>
                                )
                                }
                            />
                        ) : null
                    }
                </TablePage>
                <AsyncEvent async={importResult} onFulfill={this.finishImport} alertError="modal" />
            </div>
        );
    }
}

export default connectRouter(connectModalHelper(connectPotentialCustomer(PotentialCustomer)));
