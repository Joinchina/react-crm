import React, { Component } from 'react';
import { Select, Row, Col, Timeline, Spin, Table, Modal} from 'antd'
import message from '@wanhu/antd-legacy/lib/message'
import moment from 'moment';
import DateRangePicker from '../../common/DateRangePicker';
import { Form, fieldBuilder as field, formBuilder as form } from '../../common/form';
import { connect as reduxConnect } from '../../../states/customerCenter/integralRecord';
import _ from 'underscore';
import { connectModalHelper } from '../../../mixins/modal';
import { connectRouter } from '../../../mixins/router';
import AsyncEvent from '../../common/AsyncEvent';
import NotEditableField from '../../common/NotEditableField'
import HasPermission, { testPermission } from '../../common/HasPermission';

const RECORD_TYPE_MAP = {
    1: '日常记录',
    2: '特殊需求',
    3: '反馈建议',
    4: '投诉意见',
}

class IntegralRecord extends Component {

    constructor(props) {
        super(props);
        this.customerId = this.props.customerId;
    }

    componentDidMount() {
        console.log('ceshi999')
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

    loadData(pageIndex = 1, opts = {}) {
        const where = {
            patientId: this.customerId,
        };
        let pageSize = this.props.integalList.pageSize || 5;

        this.props.getIntegalAction(where, pageIndex || 1, pageSize);
    }

    updatePagination = (pagination) => {
        const pageIndex = pagination.current;
        const query = this.props.router.query;
        query.p = query.p || 1
        this.props.router.setQuery({
            ...query,
            p: pageIndex,
        })
    }

    render() {
        const data = this.props.integalList;
        if(data.status && data.status === 'fulfilled'){
            return (
                <div className="block filter-box table-box">
                    <Table
                        rowKey="id"
                        dataSource={data.data}
                        loading={data.status === 'pending' ? {delay: 200} : false}
                        onChange={this.updatePagination}
                        pagination={{
                            total: data.pageIndex !== 1 && data.count === data.pageSize ? data.count + 1 : data.count,
                            current: data.pageIndex || 1,
                            pageSize: data.pageSize,
                            showTotal: () => `第 ${data.pageIndex} 页`,
                        }}
                    >
                        <Table.Column title="时间" className="singleline max-w-200"
                            dataIndex="createDate"
                            key="createDate"
                            render={createDate => <span title={createDate}>{createDate}</span>}
                            />
                        <Table.Column title="积分来源" className="singleline max-w-300"
                            dataIndex="rewardDetail"
                            key="rewardDetail"
                            render={rewardDetail => <span title={rewardDetail}>{rewardDetail}</span>}
                            />
                        <Table.Column title="积分收支额度" className="singleline"
                            dataIndex="points"
                            key="points"
                            render={points => <span title={points}>{points}</span>}
                            />
                        <Table.Column title="可用积分额度" className="singleline"
                            dataIndex="curPoints"
                            key="curPoints"
                            render={curPoints => <span title={curPoints}>{curPoints}</span>}
                            />
                    </Table>
                    <AsyncEvent async={this.props.deleteRecordResult} onFulfill={this.finishDeleteRecordResult} alertError/>
                </div>
            )
        }else{
            return(
                <div></div>
            )
        }
    }
}

export default connectRouter(connectModalHelper(reduxConnect(IntegralRecord)));
