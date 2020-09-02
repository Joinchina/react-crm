import React, { Component } from 'react'
import { Select, Row, Col, Timeline, Spin,} from 'antd'
import moment from 'moment';
import { Form, fieldBuilder as field, formBuilder as form } from '../../common/form';
import DateRangePicker from '../../common/DateRangePicker'
import TablePlaceholder from '../../common/TablePlaceholder';
import { connect as reduxConnect } from '../../../states/customerCenter/customerLog';
import _ from 'underscore';

const logType = [
    { label: '全部', id: 'all' },
    { label: '基本日志', id: '1' },
    { label: '转签日志', id: '2' },
    { label: '健康日志', id: '3' },
]

const formDef = Form.def(
    {
        logType: field().initialValue('all'),
        time: field(),
    }
);

class EditLog extends Component {
    constructor(props) {
        super(props);
        this.customerId = props.customerId;
    }

    componentDidMount() {
        this.loadData()
    }

    componentWillUnmount() {
        this.props.resetAction()
    }

    componentWillReceiveProps(props) {
        const oldForm = this.getFormValue(this.props.formData);
        const newForm = this.getFormValue(props.formData);
        const oldData = oldForm.time;
        const newData = newForm.time;
        if(!(oldForm.logType === newForm.logType && this.compareData(oldData, newData))) {
            this.loadData()
        }
    }

    compareData(oldData, newData) {
        const old = oldData && oldData.map(o => JSON.stringify(moment(o).format('YYYY-MM-DD'))) || [];
        const news = newData && newData.map(o => JSON.stringify(moment(o).format('YYYY-MM-DD'))) || [];
        if(!(old[0] === news[0] && old[1] === news[1])) {
            return false
        }
        return true
    }

    getFormValue(formData) {
        return _.mapObject(formData, val => val.value);
    }

    loadData() {
        const val = this.form.getFieldsValue();
        const where = {};
        if(val.logType !== 'all') {
            where.type = val.logType;
        }
        if(val.time && val.time.length > 0) {
            where.createDate = {}
            if(val.time[0]) {
                where.createDate.$gte = val.time[0].format('YYYY-MM-DD');
            }
            if(val.time[1]) {
                where.createDate.$lte = val.time[1].format('YYYY-MM-DD');
            }
        }

        this.props.getCustomerLogAction(this.customerId, { where })
    }

    render() {
        return (
            <div className="block filter-box">
                <Form def={formDef}
                    data={this.props.formData}
                    onFieldsChange={this.props.updateFormField}
                    formRef={form => this.form = form}
                    >
                    <Row gutter={10}>
                        <Col span={4}>
                            <Form.Item field="logType">
                                <Select placeholder="请选择日志类型">
                                    {logType.map(o => <Select.Option key={o.id} value={o.id}>{o.label}</Select.Option>)}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={6}>
                            <Form.Item field="time">
                                <DateRangePicker size="default" placeholder="请选择更新时间"/>
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
                {this.renderLog()}
            </div>
        )
    }

    renderLog() {
        if(this.props.customerLog.status === 'fulfilled' && this.props.customerLog.payload.length) {
            return <Timeline className='timeline-box'>
                {
                    this.props.customerLog.payload.map((item, i) =>
                        <Timeline.Item key={i}>
                            <span><i></i>{moment(item.createDate).format('YYYY-MM-DD HH:mm:ss')}</span>
                            {item.content}
                        </Timeline.Item>
                    )
                }
            </Timeline>;
        } else {
            return <TablePlaceholder
                style={{padding: '20px 0'}}
                status={this.props.customerLog.status}
                loadingTip="正在加载操作日志"
                errorTip={this.props.customerLog.payload && this.props.customerLog.status == '403' ? '权限不足，请联系管理员' : '加载操作日志失败'}
                onReload={this.loadData}/>;
        }
    }
}

export default reduxConnect(EditLog);
