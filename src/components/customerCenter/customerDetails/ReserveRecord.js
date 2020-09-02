import React, { Component } from 'react';
import { Table, Form } from 'antd';
import message from '@wanhu/antd-legacy/lib/message'
import moment from 'moment';
import { connectRouter, routerPropType } from '../../../mixins/router';
import UpdateReservation from '../reservationCenter/UpdateReservation';
import api from '../../../api/api';
import PropTypes from '../../../helpers/prop-types';

const reserveStatusMap = {
    1: '已预约',
    2: '已确认',
    3: '已取消',
};
const styles = {
    reserveRecordWrap: {
        position: 'relative',
    },
    expandIcon: {
        position: 'absolute',
        zIndex: 1,
        top: 10,
        left: 20,
    },
};
const replace = (data, text) => {
    if (data === 0 || Number.isNaN(data)) {
        return '-';
    }
    if (typeof data === 'number') return `${data}${text}`;
    return `${data}`;
};
class ReserveRecord extends Component {
    static propTypes = {
        form: PropTypes.form().isRequired,
        router: routerPropType().isRequired,
        customerId: PropTypes.string.isRequired,
    };

    state = {
        expandedRowKeys: [],
        modifyed: false,
        cancelled: false,
        submitting: false,
    };

    componentDidMount() {
        const { router } = this.props;
        const { p } = router.query;
        this.loadData(Number(p) || 1);
    }

    onOk = async (id) => {
        const { router } = this.props;
        const { p } = router.query;
        await api.putReservationRecordById(id, { status: 2 });// 1：已预约，2：已确认，3：已取消
        message.success('确认成功', 2, () => this.loadData(Number(p) || 1));
    }

    onExpand = (expanded, record) => {
        const handleExpandAllAfter = () => {
            const { expandedRowKeys, dataSource } = this.state;
            const expandedRowKeysAll = dataSource && dataSource.list.map(item => item.id);
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
            const { form, router } = this.props;
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
                    const match = router.match('/taskDetail/:taskId/reserveRecord') || router.match('/taskPool/:taskPoolId/task/:taskId');
                    if (match) {
                        data.channelId = match.taskId;
                    }
                    await api.updateAppointmentTime(id, data);
                    message.success('改期成功', 1, () => this.reset());
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
                    message.success('取消成功', 1, () => this.reset());
                });
            }
        } catch (e) {
            message.error(e.message);
        }
    }

    onCancel = () => {
        this.reset();
    }

    reset = () => {
        this.setState({
            modifyed: false,
            cancelled: false,
        });
        const { form } = this.props;
        form.resetFields();
        const { router } = this.props;
        const { p } = router.query;
        this.loadData(Number(p) || 1);
    }

    handleExpandAll = () => {
        const { dataSource } = this.state;
        const expandedRowKeysAll = dataSource && dataSource.list.map(item => item.id);
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

    async loadData(pageIndex) {
        try {
            this.setState({ initing: true });
            const pageSize = 5;
            const { customerId } = this.props;
            const where = { patientId: customerId, status: { $in: [1, 2, 3] } };
            const dataSource = await api.getReservationRecord(where, pageIndex, pageSize);
            this.setState({ dataSource });
        } catch (e) {
            message.error(e.message);
        } finally {
            this.setState({ initing: false });
        }
    }

    updatePagination(pagination) {
        const { router } = this.props;
        const pageIndex = pagination.current;
        const { query } = router;
        router.setQuery({
            ...query,
            p: pageIndex,
        });
        this.loadData(pageIndex);
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
                render: (text, record) => replace(text, record.packageUnit),
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
        const columns = [{
            title: '会员',
            dataIndex: 'patientName',
        }, {
            title: '预约医生',
            dataIndex: 'doctorName',
        }, {
            title: '预约时间',
            dataIndex: 'appointmentTimeStr',
            render: (value, row) => (
                <div style={{ color: !row.isNormal ? 'red' : '' }}>
                    {value}
                </div>
            ),
        }, {
            title: '预约机构',
            dataIndex: 'hospitalName',
            render: value => (
                <div className="singleline max-w-200">
                    {value}
                </div>
            ),
        },
        {
            title: '预约状态',
            dataIndex: 'status',
            render: value => (
                <span>
                    {reserveStatusMap[value]}
                </span>
            ),
        },
        {
            title: '创建人',
            dataIndex: 'createByName',
            render: (value, row) => {
                let creator = '';
                if (value) {
                    if (row.createByCompany) {
                        if (row.createByDepartment) {
                            creator = `${value}(${row.createByCompany}，${row.createByDepartment})`;
                        } else {
                            creator = `${value}(${row.createByCompany})`;
                        }
                    } else {
                        creator = value;
                    }
                }
                return creator;
            },
        }, {
            title: '更新人',
            dataIndex: 'updateByName',
            render: (value, row) => {
                let updator = '';
                if (value) {
                    if (row.createByCompany) {
                        if (row.createByDepartment) {
                            updator = `${value}(${row.createByCompany}，${row.createByDepartment})`;
                        } else {
                            updator = `${value}(${row.createByCompany})`;
                        }
                    } else {
                        updator = value;
                    }
                }
                return updator;
            },
        }, {
            title: '创建时间',
            dataIndex: 'createDate',
        }, {
            title: '更新时间',
            dataIndex: 'updateDate',
        }, {
            title: '操作',
            dataIndex: 'whScale',
            render: (value, row) => {
                const obj = {
                    children: row.status === 1 ? (
                        <div>
                            {/* eslint-disable */}
                            <a className="clickable" title="确认" onClick={() => this.onOk(row.id)}>
                                确认
                            </a>
                            {
                                row.updateFlag === 1
                                    &&
                                    <a className="clickable" title="改期" onClick={() => this.showModifyModal(row)}>
                                    改期
                                </a>
                            }
                            <a className="clickable" title="取消" onClick={() => this.showCancelModal(row)}>
                                取消
                            </a>
                        </div>
                    ) : null,
                };
                return obj;
            },
        },
        ];
        const { form } = this.props;
        const { dataSource, initing, expand, expandedRowKeys, modifyed, cancelled, submitting } = this.state;
        const expandedRowRender = this.renderExpandedRowRender;
        const expandedRowKeysAll = dataSource && dataSource.list.map(item => item.id);
        const data = {
            doctorSchedules: this.doctorSchedules,
            reservationRecord: this.reservationRecord,
        };
        return (
            <div className="block table-box reservecord-wrap" style={styles.reserveRecordWrap}>
                {/* eslint-disable */}
                <span
                    style={styles.expandIcon}
                    className={`ant-table-row-expand-icon ${expand ? 'ant-table-row-expanded' : 'ant-table-row-collapsed'}`}
                    onClick={this.handleExpandAll}
                />
                {dataSource && (
                    <Table
                        loading={initing}
                        dataSource={dataSource.list}
                        rowKey={record => record.id}
                        columns={columns}
                        expandedRowRender={expandedRowRender}
                        expandedRowKeys={expand ? expandedRowKeysAll : expandedRowKeys}
                        onExpand={this.onExpand}
                        pagination={false}
                        bordered={false}
                        onChange={this.updatePagination}
                        pagination={{
                            total: dataSource.count,
                            current: dataSource.pageIndex,
                            pageSize: dataSource.pageSize,
                            showTotal: () => `第 ${dataSource.pageIndex} 页`,
                        }}
                    />
                )
                }
                <Form>
                    {
                        <UpdateReservation form={form} modifyed={modifyed} cancelled={cancelled} submitting={submitting} dataSource={data} onSubmit={this.onSubmit} onCancel={this.onCancel} />
                    }
                </Form>
            </div>
        );
    }
}

const ReserveRecordWrap = Form.create({})(ReserveRecord);
export default connectRouter(ReserveRecordWrap);
