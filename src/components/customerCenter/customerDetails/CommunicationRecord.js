import React, { Component } from 'react';
import { Select, Row, Col, Timeline, Spin, Table, Modal} from 'antd'
import message from '@wanhu/antd-legacy/lib/message'
import moment from 'moment';
import DateRangePicker from '../../common/DateRangePicker';
import { Form, fieldBuilder as field, formBuilder as form } from '../../common/form';
import { connect as reduxConnect } from '../../../states/customerCenter/communicationRecord';
import _ from 'underscore';
import { connectModalHelper } from '../../../mixins/modal';
import { connectRouter } from '../../../mixins/router';
import AsyncEvent from '../../common/AsyncEvent';
import NotEditableField from '../../common/NotEditableField'
import HasPermission, { testPermission } from '../../common/HasPermission';


const RECORD_TYPE = [
    { label: '全部类型', id: 'all' },
    { label: '日常记录', id: '1' },
    { label: '特殊需求', id: '2' },
    { label: '反馈建议', id: '3' },
    { label: '投诉意见', id: '4' },
]

const RECORD_TYPE_MAP = {
    1: '日常记录',
    2: '特殊需求',
    3: '反馈建议',
    4: '投诉意见',
}

const formDef = Form.def(
    {
        recordType: field().initialValue('all'),
        time: field(),
    }
);

class CommunicationRecord extends Component {

    constructor(props) {
        super(props);
        this.customerId = this.props.customerId;
    }

    componentDidMount() {
        const query = this.props.router.query;
        this.props.router.setQuery({
                ...query,
                p:1
            },
            { replace: true });
        this.loadData(1);
    }

    componentWillUnmount() {
        this.props.resetAction();
    }

    componentWillReceiveProps(props) {
        const oldQuery = this.props.router.query;
        const newQuery = props.router.query;
        if(JSON.stringify(oldQuery) !== JSON.stringify(newQuery) && oldQuery.p && !newQuery.modal ) {
            const {p, recordType, time } = newQuery;
            this.loadData(Number(p), { recordType, time });
        }
    }

    loadData(pageIndex, opts = {}) {

        const where = {
            patientId: this.customerId,
        };
        if(opts.recordType && opts.recordType !== 'all') {
            where.recordType = opts.recordType;
        }
        if(opts.time) {
            where.createDate = {}
            const date = opts.time.split(',');
            if(opts.time[0]) {
                where.createDate.$gte = date[0];
            }
            if(opts.time[1]) {
                where.createDate.$lte = date[1];
            }
        }
        let pageSize = this.props.communicationList.pageSize || 5;
        this.props.getCommunicationAction(where, pageIndex, pageSize);
    }

    deleteRecord = (id) => {
        Modal.confirm({
            title: '确认要删除该沟通记录吗？',
            okText: '确定',
            cancelText: '取消',
            onOk: () => this.props.deleteRecordAction(id),
        })

    }

    finishDeleteRecordResult = () => {
        message.success('删除沟通记录成功', 3);
        const { p, recordType, time } = this.props.router.query;
        this.loadData(Number(p), { recordType, time });
    }

    updatePagination = (pagination) => {
        const pageIndex = pagination.current;
        const query = this.props.router.query;
        this.props.router.setQuery({
            ...query,
            p: pageIndex,
        })
    }

    fieldsChange = (values) => {
        const query = this.props.router.query;
        if(values.recordType) {
            this.props.router.setQuery({
                ...query,
                p: 1,
                recordType: values.recordType.value !== 'all' ? values.recordType.value : null,
            })
        }
        const createDate = []
        if(values.time) {
            if(values.time.value[0]) {
                createDate[0] = values.time.value[0].format('YYYY-MM-DD');
            }
            if(values.time.value[1]) {
                createDate[1] = values.time.value[1].format('YYYY-MM-DD');
            }
            this.props.router.setQuery({
                ...query,
                p: 1,
                time: createDate.join(',') || null,
            })
        }
        this.props.updateFormField(values);
    }



    render() {
        const data = this.props.communicationList;
        return (
            <div className="block filter-box table-box">
                <Form def={formDef}
                    data={this.props.formData}
                    onFieldsChange={this.fieldsChange}
                    formRef={form => this.form = form}
                    >
                    <Row gutter={10}>
                        <Col span={4}>
                            <Form.Item field="recordType">
                                <Select placeholder="请选择记录类型">
                                    {RECORD_TYPE.map(o => <Select.Option key={o.id} value={o.id}>{o.label}</Select.Option>)}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={6}>
                            <Form.Item field="time">
                                <DateRangePicker size="default" placeholder="请选择创建时间"/>
                            </Form.Item>
                        </Col>
                        <Col span={10} />
                        <Col span={4}>
                            <HasPermission match='patient.edit'>
                                <NotEditableField style={{border:'none'}}
                                    switchState={() => this.props.openModal('newCommunicationRecord', `${this.customerId},`)} />
                            </HasPermission>
                        </Col>
                    </Row>
                </Form>
                <Table
                    rowKey="id"
                    dataSource={data.list}
                    loading={data.status === 'pending' ? {delay: 200} : false}
                    onChange={this.updatePagination}
                    pagination={{
                        total: data.pageIndex !== 1 && data.count === data.pageSize ? data.count + 1 : data.count,
                        current: data.pageIndex,
                        pageSize: data.pageSize,
                        showTotal: () => `第 ${data.pageIndex} 页`,
                    }}
                >
                    <Table.Column title="主题" className="singleline max-w-200"
                        dataIndex="title"
                        key="title"
                        render={title => <span title={title}>{title}</span>}
                        />
                    <Table.Column title="内容" className="singleline max-w-300"
                        dataIndex="content"
                        key="content"
                        render={content => <span title={content}>{content}</span>}
                        />
                    <Table.Column title="记录类型" className="singleline"
                        dataIndex="recordType"
                        key="recordType"
                        render={recordType => <span title={RECORD_TYPE_MAP[recordType] || '未知类型'}>{RECORD_TYPE_MAP[recordType] || '未知类型'}</span>}
                        />
                    <Table.Column title="创建时间" className="singleline"
                        dataIndex="createDate"
                        key="createDate"
                        render={createDate => <span title={createDate && moment(createDate).format('YYYY-MM-DD HH:mm')}>{createDate && moment(createDate).format('YYYY-MM-DD HH:mm')}</span>}
                        />
                    <Table.Column title="提交人" className="singleline"
                        dataIndex="createByName"
                        key="createByName"
                        render={(createByName, record) => <span title={record.createCompanyName ? `${createByName}(${record.createCompanyName})` : createByName}>{record.createCompanyName ? `${createByName}(${record.createCompanyName})` : createByName}</span>}
                        />
                    {
                        testPermission('patient.edit') ?
                        <Table.Column title="操作" className="singleline"
                            dataIndex="patientId"
                            key="patientId"
                            render={(patientId, record) => {
                                return <div>
                                    <span title='编辑' onClick={() => this.props.openModal('newCommunicationRecord', `,${record.id}`)} className="clickable" style={{marginRight: 10}}>编辑</span>
                                    <span title='删除' className="clickable" onClick={() => this.deleteRecord(record.id)}>删除</span>
                                </div>
                            }}
                            /> : null
                    }

                </Table>
                <AsyncEvent async={this.props.deleteRecordResult} onFulfill={this.finishDeleteRecordResult} alertError/>
            </div>
        )
    }
}

export default connectRouter(connectModalHelper(reduxConnect(CommunicationRecord)));
