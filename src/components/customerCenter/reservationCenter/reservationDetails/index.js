import React from 'react';
import { Row, Col, Table } from 'antd';
import Title from '../../../common/Title';
import Prompt from '../../../common/Prompt';
import WHLabel from '../../../common/WH-Label';
import BaseComponent from '../../../BaseComponent';
import { isLagel } from '../../../../helpers/checkDataType';

const StatusChoices = [
    { value: 1, label: '已预约' },
    { value: 2, label: '已确认' },
    { value: 3, label: '已取消' },

];
const SEX = { 0: '女', 1: '男' };
const replace = (data, text) => {
    if (data === 0 || Number.isNaN(data)) {
        return '-';
    }
    if (typeof text === 'number') return `${data}${text}`;
    return `${data}`;
};
export default class MedicationOrder extends BaseComponent {
    render() {
        const columns = [
            {
                title: '通用名（商品名）',
                dataIndex: 'commonName',
                width: '10%',
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
                width: '10%',
                render: (text, record) => (`${text}${record.minimumUnit}`),
            },
            {
                title: '频次',
                dataIndex: 'frequency',
                width: '10%',
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
                width: '10%',
                render: (text, record) => (`${text}${record.packageUnit}`),
            },
            {
                title: '实售数量',
                dataIndex: 'realQuantity',
                width: '10%',
                render: (text, record) => replace(text, record.packageUnit),
            },
            {
                title: '取药时间',
                dataIndex: 'takeOrderDate',
                width: '10%',
            },
        ];
        const data = isLagel(this.props.data);
        return (
            <div>
                <div>
                    <Title text="会员预约" num={data.orderNo} left={5}>
                        <Prompt
                            text={
                                data.status
                                    ? StatusChoices.find(s => s.value === data.status).label : null
                            }
                        />
                    </Title>
                    <Row className="label-box" gutter={40}>
                        <Col className="label-col" span={8}>
                            <WHLabel
                                title="姓名"
                                text={(
                                    <span>
                                        {data.patientName}
                                    </span>
                                )
                                }
                            />
                        </Col>
                        <Col className="label-col" span={8}>
                            <WHLabel title="性别" text={SEX[data.sex]} />
                        </Col>
                        <Col className="label-col" span={8}>
                            <WHLabel title="年龄" text={`${data.age}岁`} />
                        </Col>
                        <Col className="label-col" span={8}>
                            <WHLabel title="手机号码" text={data.phone} />
                        </Col>
                        <Col className="label-col" span={8}>
                            <WHLabel title="其他联系方式" text={data.machineNumber} />
                        </Col>
                        <Col className="label-col" span={8}>
                            <WHLabel title="现有疾病" text={data.disease && data.disease.length ? data.disease.map(item => `${item} `) : null} />
                        </Col>
                        <Col className="label-col" span={8}>
                            <WHLabel title="预约医生" text={data.doctorName} />
                        </Col>
                        <Col className="label-col" span={8}>
                            <WHLabel
                                title="预约时间"
                                text={(
                                    <span style={{ color: data.isNormal ? '' : '#e74c3c' }}>
                                        {data.appointmentTimeStr}
                                    </span>
                                )}
                            />
                        </Col>
                        <Col className="label-col" span={8}>
                            <WHLabel title="预约机构" text={data.hospitalName} />
                        </Col>
                        <Col className="label-col">
                            <WHLabel title="预约备注" text={data.remarks} />
                        </Col>
                    </Row>
                    <Title left={5} style={{ background: 'white', borderBottom: 'none' }}>
                        前次购药信息
                    </Title>
                    <div className="form-table-box" style={{ marginLeft: 5, marginRight: 5 }}>
                        <Table
                            columns={columns}
                            dataSource={data.drugs}
                            rowKey="id"
                            pagination={false}
                        />
                    </div>
                </div>
            </div>
        );
    }
}
