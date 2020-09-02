import React, { Component } from 'react'
import { Row, Col, Input, Button, DatePicker } from 'antd'
import { Form } from '../common/form';
import { TablePage } from '../common/table-page';
import moment from 'moment';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { searchTask } from '../../states/taskCenter/demoTable';

const tableDef = TablePage.def({
    name: {
        // parse: val => val,
        // stringify: val => val
    },
    date: {
        parse: val => val ? moment(val) : null,
        stringify: date => moment.isMoment(date) ? date.format('YYYY-MM-DD') : null
    },
});

class DemoTable extends Component {

    loadData = ({values, pageSize, pageIndex}) => {
        this.props.searchTask(values, pageIndex, pageSize);
    }

    render(){
        return <TablePage
            def={tableDef}
            data={this.props.tableData}
            onLoadData={this.loadData}
            rowKey='index'
            renderFormFields={(values, onLoadData) => {
                return <Row>
                    <Col span={6}>
                        <Form.Item field="name">
                            <Input/>
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item field="date">
                            <DatePicker/>
                        </Form.Item>
                    </Col>
                    <Col span={4}>
                        <Button onClick={onLoadData}>Submit</Button>
                    </Col>
                </Row>
            }}
            >
                <TablePage.Column title="name"
                    dataIndex="name"
                    key="name"/>
                <TablePage.Column title="index"
                    dataIndex="index"
                    key="index"/>
            </TablePage>
    }
}

export default connect(
    state => ({
        tableData: state.taskCenter.demoTable.tableData
    }),
    dispatch => bindActionCreators({
        searchTask
    }, dispatch)
)(DemoTable);
