import React, { Component } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { Row, Col, Form, Affix, Button, Select, Input} from 'antd'
import Title from '../../common/Title'
import SmartSelectSingle from '../../common/SmartSelectSingle'
import BaseComponent from '../../BaseComponent'
import SmartCascaderTerritory  from '../../common/SmartCascaderTerritory'
import { getPatientAction, postRegularMedicationAction, getRegularMedicationAction, getHistoricalDrugsAction, renewFormDataAction, getPatientOrderAction, deleteRegularAction, postRegularMedicationDrugsAction } from '../../../states/customerCenter/regularMedication'
import NotEditableField from '../../common/NotEditableField'
import { searchPatientCount, getReceiverAddress } from '../../../api'
import context from '../../../api/contextCreator'
import AddRegularMedication from '../customerDetails/RegularMedication/AddRegularMedication'
const FormItem = Form.Item;
const Option = Select.Option;
const regularAddressArr = [
  {label: '居住地址', key: '1'},
  {label: '签约机构地址', key: '2'},
  {label: '自定义地址', key: '3'}
];
const period = [
  {label: '每一月周期', key: '1'},
  {label: '每两月周期', key: '2'},
  {label: '每三月周期', key: '3'}
];
const dateRange = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28];
class RegularMedication extends BaseComponent {
 constructor (props) {
    super(props)
    this.state = {
          editStatus: false,
          showCount:false,
          showCustomAddress:false,
          homeDelivery:true,
          isUncompletedOrder: false,
        }
    this.customerId = props.customerId;
    this.patientId = undefined;
    this.hospitalName = '';
    this.form = props.form;
    this.area = [];
 }

 componentDidMount () {
      const params = {
        where:{
          patientId: this.customerId
        }
      }
      this.props.getPatientAction(this.customerId);
      this.props.getPatientOrderAction(params);
      this.props.getRegularMedicationAction(this.customerId);
      this.props.getHistoricalDrugsAction(this.customerId);
      this.init(this.customerId);
}

async init(patientId) {
  const addresses = await getReceiverAddress(context(), patientId);
  const defaultReceiver = addresses.find(item => item.state === 1) || {};
  const defaultReceiverAddress = `${defaultReceiver.provincesName || ''}${defaultReceiver.cityName || ''}${defaultReceiver.areaName || ''}${defaultReceiver.street || ''}${defaultReceiver.deliveryType === 2 ? '（' + defaultReceiver.hospitalName + '）': ''}`;
  this.setState({ defaultReceiverAddress });
}

componentWillReceiveProps(nextProps){
  //登记用药页面去维护进来此页面，customerId发生了变化，需要重新请求接口
    if (nextProps.customerId !== this.props.customerId) {
      this.customerId = nextProps.customerId;
      this.props.getPatientAction(this.customerId);
      this.props.getPatientOrderAction({where: this.customerId});
      this.props.getRegularMedicationAction(this.customerId);
      this.props.getHistoricalDrugsAction(this.customerId);
    }
    const { getFieldDecorator, getFieldValue, setFieldsValue } = this.props.form;
    let thisPatientResultStatus = this.props.customerDetailsRegular.getPatientResult.status;
    let nextPatientResultStatus = nextProps.customerDetailsRegular.getPatientResult.status;
    if (thisPatientResultStatus != nextPatientResultStatus) {
      if (nextPatientResultStatus === 'fulfilled') {
        const result = nextProps.customerDetailsRegular.getPatientResult.payload;
        this.hospitalId = result.hospital.id;
        this.hospitalName = result.hospital.name;
        this.warehouseId = result.hospital.warehouseId;
        if(this.hospitalName){
          this.hospitalName = ' (' + this.hospitalName + ')'
        }
      }
    }
    if (this.props.customerDetailsRegular.getPatientOrderResult.status != nextProps.customerDetailsRegular.getPatientOrderResult.status) {
      if (nextProps.customerDetailsRegular.getPatientOrderResult.status === 'fulfilled' && nextProps.customerDetailsRegular.getPatientOrderResult.payload) {
        const orderResult = nextProps.customerDetailsRegular.getPatientOrderResult.payload;
        if (orderResult.list) {
          const isUncompletedOrder = orderResult.list.some(ele => ele.status < 60);
          if (isUncompletedOrder) {
            this.setState({ isUncompletedOrder });
          }
        }
      }
    }

    if (this.props.customerDetailsRegular.getRegularMedicationResult != nextProps.customerDetailsRegular.getRegularMedicationResult) {
      if (nextProps.customerDetailsRegular.getRegularMedicationResult.status === 'fulfilled' && nextProps.customerDetailsRegular.getRegularMedicationResult.payload) {
        const result = nextProps.customerDetailsRegular.getRegularMedicationResult.payload;
        this.isEstimatedPickup = result.isRegularMedication;
        this.isCustomDelivery = result.isCustomDelivery;
        this.timing = result.timing;
        const estimatedPickupDay =  this.timing.estimatedPickupDay ? this.timing.estimatedPickupDay + '号' : '';
        const estimatedPickupPeriod =  this.timing.estimatedPickupPeriod  ? this.timing.estimatedPickupPeriod === 1 ? ' 每一月周期' : this.timing.estimatedPickupPeriod === 2 ? ' 每两月周期' : ' 每三月周期' : '';
        this.timingValue = estimatedPickupDay + estimatedPickupPeriod;
        getFieldDecorator('taketime', {initialValue: this.timing.estimatedPickupDay ? { key: String(this.timing.estimatedPickupDay) , label: estimatedPickupDay} : [] });
        getFieldDecorator('period', {initialValue: this.timing.estimatedPickupPeriod ? { key: String(this.timing.estimatedPickupPeriod) , label: estimatedPickupPeriod} : [] });
        if( this.timing.estimatedPickupDay && this.timing.estimatedPickupPeriod ){
          this.getPatientCount(this.timing.estimatedPickupDay, this.timing.estimatedPickupPeriod);
        }
       }
    }

    if (this.props.customerDetailsRegular.postRegularMedicationResult.status != nextProps.customerDetailsRegular.postRegularMedicationResult.status) {
      if (nextProps.customerDetailsRegular.postRegularMedicationResult.status === 'fulfilled') {
        this.props.getRegularMedicationAction(this.customerId);
        this.setState({ editStatus: false });
      }
    }
 }

 componentWillUnmount(){
  this.setState({ editStatus: false });
  this.props.form.resetFields();
}

handleAddress(addr){
  const { provincesId, provincesName, cityId, cityName, areaId, areaName, street } = addr;
  return {
    id: {
      provincesId: provincesId,
      cityId: cityId,
      areaId: areaId,
      street: street
    },
    name: `${provincesName ? provincesName + '/' : ''}${cityName ? cityName + '/': ''}${areaName ? areaName : ''}${provincesName && cityName && areaName && street ? '/' + street : street ? street : ''}`
  }
}

 async getPatientCount(day, period){
    //type:1预计取药时间，2预计取药周期//taketime与period初始渲染时为undefined，key报错
    try{
        let dayKey = this.form.getFieldValue('taketime') ? Number(this.form.getFieldValue('taketime').key) : '';
        let periodKey = this.form.getFieldValue('period') ? Number(this.form.getFieldValue('period').key) : ''
        let params = {
          where: {
            warehouseId: this.warehouseId,
            estimatedPickupDay: day ? day : dayKey,
            estimatedPickupPeriod: period ? period :periodKey
          },
          skip: 0,
          limit: 1,
          count: 1
        }
        const result = await searchPatientCount(context(), params)
        if (result) {
          this.setState({showCount:true, patientCount: result.count})
        }
    }catch(e){
      console.log(e)
    }
  }

 onTakeTimeChange = (e) =>{
    this.period = this.props.form.getFieldValue('period');
    if(this.period && this.period.label && e.label){
      this.setState({ showCount: true });
      this.getPatientCount();
    }
  }

  onPeriodChange = (e, callback) =>{
    this.taketime = this.props.form.getFieldValue('taketime');
    if(e.label && this.taketime && this.taketime.label){
      this.setState({ showCount: true });
      this.getPatientCount();
    }
  }

  checkTakeTime = (rule,value,callback) =>{
    this.period = this.props.form.getFieldValue('period');
    if (this.period && this.period.label) {
      if (value && value.label) {
        callback()
      }else{
        callback('不能为空')
      }
    }else{
      callback()
    }
  }

  checkPeriod = (rule,value,callback) =>{
    this.taketime = this.props.form.getFieldValue('taketime');
    if (this.taketime && this.taketime.label) {
      if (value && value.label) {
        callback()
      }else{
        callback('不能为空')
      }
    }else{
      callback()
    }
  }

  onRegularAddressChange = (e) => {
    if (this.type != 3) {
      this.area = [];//this.area一直存储在页面中,必要时清空
    }
    if (e && e.key === '3') {
      this.type = 3;
      this.setState({ showCustomAddress: true });
    }else{
      this.setState({ showCustomAddress: false });
      if ( e.key === '2') {
        this.type = 2;
      }else{
        this.type = 1;
      }
    }
  }

  switchState = () => {
    this.setState({
      editStatus: !this.state.editStatus,
    });
    if (this.isEstimatedPickup) {
      if (this.props.form.getFieldValue('taketime') && this.props.form.getFieldValue('period')) {
        if (this.props.form.getFieldValue('taketime').label && this.props.form.getFieldValue('period').label) {
          this.setState({ showCount: true });
        }
      }
    }
  }

  handleSubmit = (e) =>{
    e.preventDefault();
    const { getFieldDecorator, getFieldValue } = this.props.form;
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (err) {
        return
      }
      let dataForPost = {};
      const estimatedPickupDay = getFieldValue('taketime');
      const estimatedPickupPeriod = getFieldValue('period');
      let timing = {};
      if(estimatedPickupDay && estimatedPickupPeriod && estimatedPickupDay.key && estimatedPickupPeriod.key){
        timing.estimatedPickupDay = Number(estimatedPickupDay.key);
        timing.estimatedPickupPeriod = Number(estimatedPickupPeriod.key);
        dataForPost.timing = timing
      }
      //console.log(values)
      let shippingAddress = {};
      if (values.shippingAddress) {
        if (values.shippingAddress.key === '1') {
          shippingAddress = {
            shippingAddressType: 1,
            ...this.liveAddress
          }
        }else if (values.shippingAddress.key === '2') {
          shippingAddress = {
            shippingAddressType: 2,
            ...this.hospitalAddress
          }
        }else{
          if (values.regularArea && values.street) {
            shippingAddress = {
              shippingAddressType: 3,
              provincesId: values.regularArea[0],
              cityId: values.regularArea[1],
              areaId: values.regularArea[2],
              street: values.street
            }
          }
        }
        dataForPost.shippingAddress = shippingAddress;
      }
      this.props.postRegularMedicationAction(this.customerId, dataForPost);
    })
  }

  handleCancel = (e) => {
    e && e.preventDefault();
    this.props.form.resetFields();
    this.props.getRegularMedicationAction(this.customerId);
    this.setState({
      editStatus: false,
      showCustomAddress: false,
      showCount: false
    });
  }

  render(){
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
      },
      shippingAddress: {
        marginLeft:'20px',
        lineHeight:'36px'
      }
    }
    const { getFieldDecorator } = this.props.form
    const mapPropsToFormItems = {
        switchState: this.switchState,
        editStatus: this.state.editStatus,
        notEditableOnly: this.permisson
      };
    const periodOptions = period.map((row,index) => <Option key={index + 1} >{row.label}</Option>);
    const dateOptions = dateRange.map((row,index) => <Option key={index + 1} >{`${index + 1}号`}</Option>);
    const addressOptions = regularAddressArr.map((row,index) => <Option key={row.key} >{row.label}</Option>);
    const isAddressEditable = false;
    if(this.type === 2 && this.hospitalName){
      this.shippingAddressValue = regularAddressArr[this.type - 1].label + ' ' + this.deliveryAddressHospital + this.hospitalName;
    }

    return(
        <div>
         <div style={styles.box}>
          {this.state.editStatus && this.state.isUncompletedOrder && <div className="explain">该会员尚有未完成的用药订单，修改规律订药信息将导致未完成的订单不符合规律订药标准</div>}
          <Form>
            <Title text='规律取药时间' style={{float:'left',width:'50%',marginBottom:'12px',borderBottom:'none'}}/>
            <Title text='规律配送地址' style={{float:'left',width:'50%',marginBottom:'12px',borderBottom:'none'}}/>
            <Row gutter={20}>
            {!this.state.editStatus ?
              <Col span={12}>
                <NotEditableField
                {...mapPropsToFormItems}
                >
                  {this.timingValue ? this.timingValue : ''}
                </NotEditableField>
              </Col> :
              <Col span={12}>
                <Col span={8}>
                  <FormItem
                        className="taketime"
                        wrapperCol={{ span: 24 }}
                        >
                        {getFieldDecorator('taketime',
                            {
                            validateTrigger: ['onSelect'],
                            rules: [ {validator: this.checkTakeTime} ],
                            })(
                            <SmartSelectSingle
                                placeholder='请选择规律时间'
                                editStatus={true}
                                showSearch={true}
                                selectStyle={{width:'100%'}}
                                onSelect={this.onTakeTimeChange}
                            >
                                {dateOptions}
                            </SmartSelectSingle>
                        )}
                    </FormItem>
                  </Col>
                  <Col span={8}>
                    <FormItem
                        label=""
                        wrapperCol={{ span: 24 }}
                        >
                        {getFieldDecorator('period',
                            {
                            validateTrigger: ['onSelect'],
                            rules: [ {validator: this.checkPeriod} ],
                            })(
                            <SmartSelectSingle
                                placeholder='请选择规律周期'
                                editStatus={true}
                                showSearch={true}
                                selectStyle={{width:'100%',marginLeft: '5px'}}
                                onSelect={this.onPeriodChange}
                                >
                                {periodOptions}
                                </SmartSelectSingle>
                            )}
                    </FormItem>
                  </Col>
                  {this.state.showCount && this.state.editStatus?<span className="show-count" style={styles.count}>已预约会员数量：{this.state.patientCount}</span>:null}
                </Col>
            }

              { !isAddressEditable ?
                <Col span={12} style={{marginLeft:'-10px',paddingRight:0}}>
                  <NotEditableField
                    switchState={this.switchState}
                    editStatus={false}
                    notEditableOnly={true}
                  >
                    {this.state.defaultReceiverAddress ? this.state.defaultReceiverAddress : ''}
                  </NotEditableField>
                </Col> :
                  <Col span={12} style={{marginLeft:'-10px'}}>
                    <Col span={8}>
                      <FormItem
                        className="regularAddress"
                        wrapperCol={{ span: 24 }}
                      >
                        {getFieldDecorator('shippingAddress',
                          {
                            rules: [ ],
                          })(
                          <SmartSelectSingle
                              placeholder='请选择地址'
                              editStatus={false}
                              showSearch={true}
                              onSelect={this.onRegularAddressChange}
                            >
                              {addressOptions}
                          </SmartSelectSingle>
                      )}
                      </FormItem>
                      </Col>
                    { this.state.showCustomAddress ?
                     <Col span={16}>
                      <Col span={12}>
                        <FormItem
                          wrapperCol={{ span:24 }}
                          required={true}
                          style={{paddingLeft: 10}}
                        >
                        {getFieldDecorator('regularArea',
                      {
                        rules: [
                          {validator: (rules, value, callback) =>{
                            if(!value || !Array.isArray(value)){
                              callback('不能为空')
                              return
                            }
                            if(value.length != 3){
                              callback('不能为空')
                            }else{
                              callback()
                            }
                          }}
                        ],
                      })(
                        <SmartCascaderTerritory
                          placeholder="请选择省/市/区"
                          {...mapPropsToFormItems}
                        />
                      )}
                        </FormItem>
                      </Col>
                      <Col span={12}  style={{paddingLeft: '5px'}}>
                      <FormItem
                        wrapperCol={{ span: 24}}
                      >
                        {getFieldDecorator('street',
                          {
                              rules: [
                                {required: true, message: '不能为空'},
                                {max:50, message: '不能超过50个字符'}
                              ],
                          })(
                            <Input
                              style={{marginLeft: 5}}
                              maxLength='50'
                              placeholder="请输入详细地址"
                            />
                          )}
                      </FormItem>
                    </Col>
                    </Col>:
                    <Col span={16}><div style={styles.shippingAddress}>{ this.type ? this.type === 2 && this.deliveryAddressHospital ? this.deliveryAddressHospital + this.hospitalName : this.deliveryAddressLive : ''}</div></Col>
                    }
                    </Col>
                }
            </Row>
            {this.state.editStatus &&
              <Row>
                <Col>
                  <Affix offsetBottom={0} ref={affix => affix && affix.updatePosition({})}>
                  <div className='block' style={styles.foot}>
                    <Button style={styles.footBtn} loading={ this.props.customerDetailsRegular.postRegularMedicationResult.status === 'pending'}
                      type="primary" onClick={this.handleSubmit}>保存</Button>
                    <Button disabled={this.props.customerDetailsRegular.postRegularMedicationResult === 'pending'}
                      onClick={this.handleCancel} className='cancelButton'>取消</Button>
                  </div>
                </Affix>
                </Col>
              </Row>
            }
              <Row>
                <Title text='规律取药药品' style={{borderBottom:'none',marginTop:'20px'}}/>
                <AddRegularMedication
                  form={this.props.form}
                  hospitalId={this.hospitalId}
                  patientId={this.customerId}
                  postRegularMedicationDrugsResult={this.props.customerDetailsRegular.postRegularMedicationDrugsResult}
                  getRegularMedication={(patientId) => {this.props.getRegularMedicationAction( patientId )}}
                  postRegularMedication={(patientId, data) => {this.props.postRegularMedicationDrugsAction(patientId, data)}}
                  deleteRegularRecord={(patientId, id) => this.props.deleteRegularAction( patientId, id )}
                />
              </Row>
          </Form>
        </div>
       </div>
    )
}
}
const RegularMedicationForm = Form.create({
    mapPropsToFields(props){
      return { ...props.customerDetailsRegular.formData }
    },
    onFieldsChange(props, fields){
      props.renewFormDataAction(fields)
    }
  })(RegularMedication)

  function select (state) {
    return {
      customerDetailsRegular:state.customerDetailsRegular
    }
  }

  function mapDispachToProps (dispatch) {
    return bindActionCreators( { getRegularMedicationAction, postRegularMedicationAction, getPatientAction,  postRegularMedicationAction, getRegularMedicationAction, getHistoricalDrugsAction, renewFormDataAction, getPatientOrderAction, deleteRegularAction, postRegularMedicationDrugsAction}, dispatch)
  }

  export default connect(select, mapDispachToProps)(RegularMedicationForm)
