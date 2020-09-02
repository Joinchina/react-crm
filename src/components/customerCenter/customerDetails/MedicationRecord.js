import React from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { Breadcrumb, Table, Row, Col, Select } from 'antd'
import Title from '../../common/Title'

import { SmartSelectSingleAsync } from '../../common/SmartSelectSingle'
import { isLagel, isArray } from '../../../helpers/checkDataType'
import { Link } from 'react-router-dom'
import BaseComponent from '../../BaseComponent'
import { drugRecordAction } from '../../../states/customerCenter/customerDetails'
import { testPermission } from '../../common/HasPermission'

const Option = Select.Option
const { Column } = Table

class MedicationRecord extends BaseComponent {

  constructor (props) {
    super(props)
    this.handleOnChange = this.handleOnChange.bind(this)
    this.customerId = props.customerId
    this.isShow = props.source === 'customerDetails'
  }

  componentDidMount () {
    this.record(0, 10, this.customerId)
  }

  handleOnChange (pagination) {
    const prePage = pagination.current - 1
    const skip = pagination.pageSize * prePage
    this.record(skip, pagination.pageSize, this.customerId)
  }

  record (skip, pageSize, customerId) {
    this.props.drugRecordAction(skip, pageSize, customerId)
  }

  get permission () {
    const res = testPermission({
      $any: [
           'patient.edit',
           'patient.admin'
       ]
    })
    return !res
  }

  render () {
    const styles = this.styles()
    let { data } = super.result('customerDetails')
    data = isLagel(data)
    const tableData = isArray(data.list)
    const count = data.count
    return (
      <div>
      <div className='table-box block'>
        <Row gutter={10} style={styles.row}>
          <Col span={12}>
            <SmartSelectSingleAsync style={{width: '100%'}}
              placeholder="单选async模式"
              asyncResultId='medicationRecordSelectSingle'
              asyncRequestUrl='/user/infor'
              value={{key:'1', label: 'option2'}}
              editStatus={ true }
            >
              <Option key='001'>opt1</Option>
              <Option key='002'>opt2</Option>
              <Option key='003'>opt3</Option>
            </SmartSelectSingleAsync>
          </Col>
          <Col span={12} style={styles.col}>
            药品说明
          </Col>
        </Row>
        <Table onChange={this.handleOnChange} dataSource={super.addListId(tableData)} pagination={{showSizeChanger: true, total: count,
          showTotal: (total)=>{ return `共有 ${total} 条`},
          pageSizeOptions: ['10', '20', '50', '100']
          }} rowKey='id'>
          <Column
            title="用药日期"
            dataIndex="registerDate"
            key="registerDate"
          />
          <Column
            title="用药周期"
            dataIndex="cycle"
            key="cycle"
          />
          <Column
            title="单次用量"
            dataIndex="useAmount"
            key="useAmount"
          />
          <Column
            title="频次"
            dataIndex="frequency"
            key="frequency"
            render={(text, record) => {
              text = isNaN(parseInt(text, 10)) ? text : parseInt(text, 10)
              switch (text) {
                case 1: return 'qd 每日一次'
                case 2: return 'bid 每日两次'
                case 3: return 'tid 每日三次'
                case 4: return 'qid 每日四次'
                case 5: return 'qn 每夜一次'
                case 6: return 'qw 每周一次'
                default: return text
              }
            }}
          />
          <Column
            title="来源"
            dataIndex="orderId"
            key="orderId"
            render={
              (text, record) => (
                <span>
                  <Link to={{
                    pathname: `/orderDetails/${record.orderId}`
                  }}>
                  【订单】{text}
                </Link>
                </span>
              )
            }
          />
        </Table>
      </div>
      </div>
    )
  }
  styles () {
    return {
      row:{
        margin: 20
      },
      col:{
        height: 36,
        lineHeight: '36px'
      }
    }
  }
}

function select (state) {
  return {
    params: state.routerReducer.location.state,
    customerDetails: state.customerDetails
  }
}

function mapDispachToProps (dispatch) {
  return bindActionCreators({ drugRecordAction }, dispatch)
}

export default connect(select, mapDispachToProps)(MedicationRecord)
