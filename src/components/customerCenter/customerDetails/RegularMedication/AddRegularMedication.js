import React, { Component } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { connectRouter } from '../../../../mixins/router'
import NotEditableField from '../../../common/NotEditableField'
import { Form, Col, Row, Tag, AutoComplete, Affix, Button, Modal } from 'antd'
import message from '@wanhu/antd-legacy/lib/message'
import SmartSelectForMedicineWithNumber from '../../../common/SmartSelectForMedicineWithNumber'
import SmartInputNumber from '../../../common/SmartInputNumber'
import { centToYuan, refundRountCentPercentToCent } from '../../../../helpers/money'
import AsyncEvent from '../../../common/AsyncEvent';
const Option = AutoComplete.Option;
const FormItem = Form.Item;
const AmountFieldOptions = {
    rules: [
        { required: true, message:'不能为空' },
    ]
};
const confirm = Modal.confirm;

class AddRegularMedication extends Component {
  constructor(props) {
    super(props);
    this.state = {
      editStatus: false,
      addRegularMedication: false,
    }
    this.historyKeyArr = [];
    this.historySourceData = [];
    this.form = props.form
  }
  componentWillMount(){
    const { getFieldDecorator } = this.props.form;
    getFieldDecorator('medicineKeys', { initialValue: [] });
  }

  componentWillReceiveProps(nextProps) {
    const { getFieldValue, setFieldsValue} = this.form;
    let medicineKeys = getFieldValue('medicineKeys');
    if (this.props.customerDetailsRegular.getRegularMedicationResult.status != nextProps.customerDetailsRegular.getRegularMedicationResult.status) {
      if (nextProps.customerDetailsRegular.getRegularMedicationResult.status === 'fulfilled') {
        const historyDrugs = nextProps.customerDetailsRegular.getRegularMedicationResult.payload  && nextProps.customerDetailsRegular.getRegularMedicationResult.payload.drugs ? nextProps.customerDetailsRegular.getRegularMedicationResult.payload.drugs : [];
        this.historyKeyArr = historyDrugs.map(item => item.baseDrugId);
        this.historySourceData = historyDrugs.map(item => parseInt(item.amount, 10));
        setFieldsValue({
          medicineKeys: this.historyKeyArr
        });
        this.addHistoryDrgusToForm(historyDrugs);
      }
    }
    if (this.props.customerDetailsRegular.getDeleteResult != nextProps.customerDetailsRegular.getDeleteResult) {
      if (nextProps.customerDetailsRegular.getDeleteResult && nextProps.customerDetailsRegular.getDeleteResult.status === 'fulfilled') {
        this.props.getRegularMedication(this.props.patientId);
        message.success('删除成功', 1);
      }
    }
    if (this.props.customerDetailsRegular.postRegularMedicationDrugsResult != nextProps.customerDetailsRegular.postRegularMedicationDrugsResult) {
      if (nextProps.customerDetailsRegular.postRegularMedicationDrugsResult.status === 'fulfilled') {
        this.props.getRegularMedication(this.props.patientId);
        this.setState({
          editStatus: false,
          addRegularMedication: false
        })
      }
    }
  }

  addHistoryDrgusToForm = value => {
    const { getFieldDecorator } = this.form;
    if (value.length === 0) {
      return
    }
    value.forEach(item => {
      let uuid = item.baseDrugId;
      let amount = parseInt(item.amount, 10)
      getFieldDecorator(`medicine_${uuid}_data`, { initialValue: item })
      getFieldDecorator(`medicine_${uuid}_amount`, {
        ...AmountFieldOptions,
        initialValue: amount
      })
    })
  }

  addDrguToForm = (value, number) => {
    let uuid = value.baseDrugId
    const { getFieldDecorator, getFieldValue, setFieldsValue, resetFields} = this.form
    let medicineKeys = getFieldValue('medicineKeys')
    setFieldsValue({medicineKeys: [...medicineKeys, uuid]})
    getFieldDecorator(`medicine_${uuid}_data`, { initialValue: value })
    getFieldDecorator(`medicine_${uuid}_amount`, {
        ...AmountFieldOptions,
        initialValue: number < 999 ? number : 999
    })
    // 解决删除后重新添加同一药品表单值不正常问题
    resetFields([`medicine_${uuid}_amount`])
  }

  handleMedicineSelect = (value, number) => {
    const { getFieldValue } = this.form
    value = typeof value == 'object' ? value : JSON.parse(value)
    let uuid = value.baseDrugId;
    let medicineKeys = getFieldValue('medicineKeys');
    if (medicineKeys.indexOf(uuid) !== -1) {
      let productName = value.productName ? `(${value.productName})` : '';
      message.warning(`${value.commonName}${productName} 已存在`);
      return
    }
    this.addDrguToForm(value, number);
  }

  edit = (key) => {
    this.activeKey = key;
    this.setState({ editStatus:true });
  }

  mapAsyncDataToOption = data => {
    const { getFieldDecorator } = this.form
    return data.map((row, index) => {
      let productName = row.productName ? `(${row.productName})` : '';
      let statusMap = { 0: '正常', 2: '目录外', 3: '停售' };
      let status;
      if (row.status > 1) {
        status = <Tag style={{marginLeft: 5}} color='#e44d42'>{statusMap[row.status]}</Tag>;
      }
      let priceCent = row.priceCent;
      if (!priceCent) {
        priceCent = 0;
      }
      let price = row.priceCent ? `零售价：¥${centToYuan(priceCent, 2)}` : '';
      let whScale = priceCent ? `报销比例：${row.whScale}%` : '';
      let reimbursement;
      if (row.priceCent) {
        const actualPriceCent = priceCent - (priceCent * (row.whScale / 100.00));
        reimbursement = `报销价：¥${Math.round(actualPriceCent * 100 )/10000}`
      }
      return (
          <Option key={index} disabled={row.status > 1} value={JSON.stringify(row)}>
            <Row gutter={5}>
              <Col span={6} style={{whiteSpace: 'normal'}}>
                <span>{row.commonName}{productName}{row.status > 1 ? status : ''}</span>
              </Col>
              <Col span={6} style={{whiteSpace: 'normal'}}>
                <p>{row.preparationUnit + '*' + row.packageSize + row.minimumUnit + '/' + row.packageUnit}</p>
                <p>{row.producerName}</p>
              </Col>
              {row.status < 1 && <Col span={4}>{price}</Col>}
              {row.status < 1 && <Col span={4}>{whScale}</Col>}
              {row.status < 1 && <Col span={4}>{reimbursement}</Col>}
            </Row>
          </Option>
      )
    })
  }

  handleSubmit = (actionType) => {
    const { getFieldValue } = this.props.form;
    let medicineKeys = getFieldValue('medicineKeys');
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (err) {
        return
      }
      this.activeKey = undefined;//保存后输入框立即消失，而不是等接口响应成功后再消失
      this.historyKeyArr = medicineKeys;//此时的historyKeyArr并不是真正的历史数组(保存失败时)，为了该药品输入框编辑状态立即消失而暂存
      let dataForPost = {};
      let drugs = [];
      if (medicineKeys.length) {
        drugs = medicineKeys.map(v => {
          let sourceData = getFieldValue(`medicine_${v}_data`);
          let data = {};
          data.baseDrugId = sourceData.baseDrugId;
          data.amount = getFieldValue(`medicine_${v}_amount`);
          return data
        })
      }
      dataForPost.drugs = drugs;
      // console.log(dataForPost)
      this.props.postRegularMedication(this.props.patientId, dataForPost);
    })
  }

  handleCancel = () => {
    const { setFieldsValue } = this.props.form;
    this.activeKey = undefined;
    if (this.historyKeyArr.length > 0) {
        this.historyKeyArr.forEach((v, index) => {
          let amount = this.historySourceData[index];
          const medicineAmount = `medicine_${v}_amount`;
          let obj = {};
          obj[medicineAmount] = amount;
          setFieldsValue(obj);
        })
    }
    setFieldsValue({ medicineKeys: this.historyKeyArr });
    this.props.getRegularMedication(this.props.patientId);
    this.setState(
      { editStatus: false, addRegularMedication: false }
    );
  }

  showConfirm = (id) => {
    var that = this;
    confirm({
      title: '确定要删除吗？',
      okText: '是',
      cancelText: '否',
      onOk() {
        that.deleteRecord(id);
      },
    });
  }

  deleteRecord = (id) => {
    this.props.deleteRegularRecord(this.props.patientId, id)
  }

  switchAddState = () => {
    this.setState({
      addRegularMedication:true,
      editStatus:true
    });
  }


  render() {
    const styles ={
      box:{
        padding: 20
      },
      foot: {
        textAlign: 'center',
        height: 60,
        lineHeight: '60px'
      },
      footBtn: {
        marginRight: 10
      },
      count: {
        marginLeft: '15px'
      }
    }
    const { getFieldValue, getFieldDecorator } = this.form;
    const medicineKeys = getFieldValue('medicineKeys');
    const formItems = medicineKeys.map((v, index) => {
      const medicineRowData = getFieldValue(`medicine_${v}_data`)
      const productName = medicineRowData.productName ? `(${medicineRowData.productName})` : ''
      const baseDrugId = medicineRowData.baseDrugId;
      const amount = medicineRowData.amount;
      let standard = medicineRowData.standard ? medicineRowData.standard : medicineRowData.preparationUnit + '*' + medicineRowData.packageSize + medicineRowData.minimumUnit + '/' + medicineRowData.packageUnit;
      let dosageStatus = this.activeKey === v ? true : this.historyKeyArr.indexOf(v) === -1 ?  true : false;
      let statusMap = { 0: '正常', 2:'目录外', 3:'停售' };
      let status;
      if (medicineRowData.status > 1) {
        status = <Tag style={{marginLeft: 5}} color='#e44d42'>{statusMap[medicineRowData.status]}</Tag>
      }
    return <tbody className="drug-item" key={v}>
        <tr>
          <td>{medicineRowData.commonName?medicineRowData.commonName:''}{productName}{status}</td>
          <td>{standard}</td>
          <td>{medicineRowData.producerName?medicineRowData.producerName:''}</td>
          <td>
              <FormItem
                label=''
              >
                {getFieldDecorator(`medicine_${v}_amount`, {
                  ...AmountFieldOptions
                })(
                  <SmartInputNumber
                    editStatus={dosageStatus}
                    notEditableOnly={!dosageStatus}
                    hideBottomLine={true}
                    placeholder="请输入用量"
                    min={1}
                    max={999}
                    maxLength='3'
                    parser={(value)=> {
                      value = parseInt(value, 10)
                      return isNaN(value) ? '' : value
                    }}
                    text={medicineRowData.packageUnit}
                />
                )}
              </FormItem>
          </td>
            <td>
              <a onClick={() => this.edit(v)}>{this.state.editStatus ? '' : '编辑'}</a>
              <a style={{marginLeft:'10px'}} onClick={() => {this.showConfirm(v)}}>{this.state.editStatus ? '' : '删除'}</a>
            </td>
        </tr>
      </tbody>

    })
    return (
      <div>
        <div className='form-table-box block'>
        {
          !this.state.addRegularMedication && !this.permission && !this.state.editStatus ?
          <Button
            onClick={(e)=>{e.stopPropagation();this.switchAddState()}}
            style={{position: 'absolute',
              top: '21px',
              right: '2px',
              backgroundColor: '#1DA57A',
              color: '#fff',
              width: '74px',
              borderRadius: '10px',
              height: '32px'}}>新建</Button>
          :null
        }
        <table>
          <thead>
            <tr>
              <th width='25%'>通用名（商品名）</th>
              <th width='20%'>规格</th>
              <th width='22.5%'>生产企业</th>
              <th width='22.5%'>规律用量（盒/瓶，包装单位）</th>
              <th width='10%'>操作</th>
            </tr>
          </thead>
          {formItems}
          {this.state.addRegularMedication &&
          <tbody>
            <tr>
              <td colSpan="50">
                <Col span={12}>
                  <SmartSelectForMedicineWithNumber
                    {...this.props}
                    editStatus={true}
                    uuid='AddRegularMedication'
                    placeholder='阿司匹林/ASPL'
                    onSelect={this.handleMedicineSelect}
                    mapAsyncDataToOption={this.mapAsyncDataToOption}
                    mapValueToAutoComplete={value => {
                      try{
                        value = JSON.parse(value)
                        return typeof value == 'object' ? '' : String(value)
                      }catch(e){
                        return value
                      }
                    }}
                  />
                </Col>
              </td>
            </tr>
          </tbody>
          }
        </table>
      </div>
      {this.state.editStatus &&
              <Row>
                <Col>
                  <Affix offsetBottom={0} ref={affix => affix && affix.updatePosition({})}>
                  <div className='block' style={styles.foot}>
                    <Button style={styles.footBtn} loading={ this.props.customerDetailsRegular.postRegularMedicationDrugsResult && this.props.customerDetailsRegular.postRegularMedicationDrugsResult.status === 'pending'}
                      type="primary" onClick={this.handleSubmit}>保存</Button>
                    <Button
                      onClick={this.handleCancel} className='cancelButton' disabled={this.props.customerDetailsRegular.postRegularMedicationDrugsResult && this.props.customerDetailsRegular.postRegularMedicationDrugsResult === 'pending'}>取消</Button>
                  </div>
                </Affix>
                </Col>
              </Row>
      }
      {/* <AsyncEvent async={this.props.postRegularMedicationDrugsResult} onFulfill={this.handleResetHistory} alertError/> */}
      </div>
    )
  }
}

function select(state){
  return {
    customerDetailsRegular: state.customerDetailsRegular,
  }
}

export default connect(select)(AddRegularMedication)
