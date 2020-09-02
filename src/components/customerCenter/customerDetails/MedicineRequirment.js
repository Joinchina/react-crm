import React, { Component } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { Pagination, Spin, Affix, Button, Form, Row, Col, Select, Modal } from 'antd'
import history from '../../../history'
import AlertError from '../../common/AlertError'
import { getPatientAction, getPotentialPatientAction, renewFormDataAction, postDrugAction, getDrugAction, setEditStatusAction } from '../../../states/customerCenter/medicineRequirment'
import NotEditableField from '../../common/NotEditableField'
import AddCustomerMedicineRow from '../AddCustomerMedicineRow'
import picIcon from '../../../images/picIcon.png'
import api from '../../../api/api';

const Option = Select.Option
const FormItem = Form.Item
const useStatusMap = {
  '1': '使用中',
  '2': '已停用'
};
class MedicineRequirment extends Component{
  constructor(props) {
    super(props)
    this.state = {
      hospitalId: '',
    }
    this.uuid = 0
    this.form = props.form
    this.pageSize = 5
    this.drugRequirements = [];
  }

  componentDidMount(){
    let pageNumber = this.props.match.params.pageNumber ? this.props.match.params.pageNumber : 1
    this.props.getDrugAction(this.props.patientId, this.pageSize, pageNumber)
    if(this.props.patientType == 'formal'){
      this.props.getPatientAction(this.props.patientId)
    }else if(this.props.patientType == 'potential'){
      this.props.getPotentialPatientAction(this.props.patientId)
    }
  }

  componentWillMount(){
    const { getFieldDecorator } = this.form
    getFieldDecorator('medicineKeys', { initialValue: [this.uuid] })
  }

  componentWillReceiveProps(nextProps){

    if(this.props.match.params.pageNumber != nextProps.match.params.pageNumber){
      let pageNumber = nextProps.match.params.pageNumber ? nextProps.match.params.pageNumber : 1
      this.props.getDrugAction(this.props.patientId, this.pageSize, pageNumber)
    }

    if(this.props.customerDetailsDrug.postDrugResult != nextProps.customerDetailsDrug.postDrugResult){
      if(nextProps.customerDetailsDrug.postDrugResult.status === 'fulfilled'){
        this.reset();
      }
    }

    if(this.props.customerDetailsDrug.getPotentialPatientResult != nextProps.customerDetailsDrug.getPotentialPatientResult){
      if(nextProps.customerDetailsDrug.getPotentialPatientResult.status === 'fulfilled'){
        this.setState({hospitalId: nextProps.customerDetailsDrug.getPotentialPatientResult.payload.hospital.id})
      }
    }

    if(this.props.customerDetailsDrug.getFormalPatientResult != nextProps.customerDetailsDrug.getFormalPatientResult){
      if(nextProps.customerDetailsDrug.getFormalPatientResult.status === 'fulfilled'){
        this.setState({hospitalId: nextProps.customerDetailsDrug.getFormalPatientResult.payload.hospital.id})
      }
    }
  }

  componentWillUnmount(){
    this.props.setEditStatusAction(false)
    this.props.form.resetFields()
  }

  reset() {
    this.uuid = 0
    this.drugRequirements = [];
    this.props.setEditStatusAction(false)
    this.props.form.resetFields()
    this.props.getDrugAction(this.props.patientId, this.pageSize, 1)
    this.handlePageChange(1, this.pageSize)
  }

  handleSubmit = () => {
    this.props.form.validateFieldsAndScroll(async (err, values) => {
      if (err) {
        return
      }
      const { getFieldValue } = this.form
      const patientId = this.props.patientId;
      let medicineKeys = [...getFieldValue('medicineKeys')]
      medicineKeys.pop()
      try {
        if (this.drugRequirements.length === 0 && medicineKeys.length === 0) {
          Modal.warning({ 
            title: '请添加药品',
            okText: '确定'
          });
          this.isWarning = true;
          return;
        } else {
          this.isWarning = false;
        }
        this.setState({ loading: true });
        if (this.drugRequirements.length > 0) {
          await Promise.all(this.drugRequirements.map(async item => {
            await api.putDrugRequirements(patientId, item.drugRequirementId, { outDrugDetailId: item.outDrugDetailId, useStatus: Number(item.useStatus) });
          }));
        }
        let drugRequirements = []
        if(medicineKeys.length){
          drugRequirements = medicineKeys.map(v => {
            let sourceData = getFieldValue(`medicine_${v}_data`)
            let data = {}
            if(sourceData){
              data.baseDrugId = sourceData.baseDrugId
              data.drugName = sourceData.drugName
              data.standard = sourceData.packageSize
              data.producerName = sourceData.producerName
              data.monthlyUsage = getFieldValue(`medicine_${v}_dosage`)
              data.useStatus = Number(getFieldValue(`medicine_${v}_useStatus`))
            } else{
              data.baseDrugId = ''
              data.monthlyUsage = getFieldValue(`medicine_${v}_dosage`)
              data.drugName = getFieldValue(`medicine_${v}_name`)
              data.standard = getFieldValue(`medicine_${v}_standard`)
              data.producerName = getFieldValue(`medicine_${v}_company`)
              data.useStatus = Number(getFieldValue(`medicine_${v}_useStatus`))
            }
            return data
          })
          let dataForPost = JSON.stringify(drugRequirements)
          await api.postDrugRequirements(patientId, dataForPost);
        }
      } finally {
        if (this.isWarning) {
          return;
        }
        this.props.setEditStatusAction(false);
        this.props.form.resetFields();
        this.setState({ loading: false }, () => this.reset());
      }      
    })
  }

  handleChange = (k, type, value) => {
    this.value = value;
    const { getFieldValue, setFieldsValue } = this.form
    const medicineKeys = [...getFieldValue('medicineKeys')]
    const lastKey = medicineKeys.pop()
    let newContactkeys = medicineKeys.filter((element, index, array)=>{
      if(( k == element && type === 'name' ? ( value && value.key !== '' ) : (getFieldValue(`medicine_${element}_name`) && getFieldValue(`medicine_${element}_name`).key !== '') )
        || ( ( k == element && type === 'standard' && value ) ? value.target.value : getFieldValue(`medicine_${element}_standard`) )
        || ( ( k == element && type === 'company' && value ) ? value.target.value : getFieldValue(`medicine_${element}_company`) )
        || ( ( k == element && type === 'dosage') ? value : getFieldValue(`medicine_${element}_dosage`) )
      )return true
      return false
    })

    const lastNameValue = k == lastKey && type === 'name' ? value : getFieldValue(`medicine_${lastKey}_name`)
    const lastStandardValue = k == lastKey && type === 'standard' ? value.target.value : getFieldValue(`medicine_${lastKey}_standard`)
    const lastCompanyValue = k == lastKey && type === 'company' ? value.target.value : getFieldValue(`medicine_${lastKey}_company`)
    const lastDosageValue = k == lastKey && type === 'dosage' ? value : getFieldValue(`medicine_${lastKey}_dosage`)
    if(lastNameValue && lastNameValue.key !== '' || lastStandardValue || lastCompanyValue || lastDosageValue){
      newContactkeys.push(lastKey)
      // 重置最后一行
      let fieldsDataForReset = {}
      fieldsDataForReset[`medicine_${lastKey}_name`] = lastNameValue
      fieldsDataForReset[`medicine_${lastKey}_standard`] = lastStandardValue
      fieldsDataForReset[`medicine_${lastKey}_company`] = lastCompanyValue
      fieldsDataForReset[`medicine_${lastKey}_dosage`] = lastDosageValue
      setFieldsValue(fieldsDataForReset)
      newContactkeys.push(++this.uuid)
    }else{
      newContactkeys.push(++this.uuid)
    }
    setFieldsValue({medicineKeys: newContactkeys})
  }

  removeRow = k => { 
    const medicineKeys = this.form.getFieldValue('medicineKeys')
    if (medicineKeys.length === 1) {
      return
    }
    this.form.setFieldsValue({
      medicineKeys: medicineKeys.filter(key => key !== k),
    })
  }

  getEditebleRow() {
    const { getFieldValue } = this.form
    const medicineKeys = getFieldValue('medicineKeys')
    return medicineKeys.map((k, index) => {
      return (
        <AddCustomerMedicineRow
          key={k}
          {...this.props}
          k={k}
          value={this.value}
          index={index}
          listLength={medicineKeys.length}
          removeRow={this.removeRow}
          hospitalId={this.state.hospitalId}
          handleChange={this.handleChange}
          showCreateDateField={true}
        />
      )
    })
  }

  get permission () {
    let data = this.props.customerDetailsDrug.getDrugResult.status === 'fulfilled' && this.props.customerDetailsDrug.getDrugResult.payload;
    return !data.isEdit
  }

  handlePageChange(pageNumber, pageSize){
    let url = this.props.match.path.split(':')
    url = url[0]
    history.push(url + pageNumber)
  }

  onChangeUseStatus = (value, outDrugDetailId, drugRequirementId) => {
    this.drugRequirements.push({ drugRequirementId, outDrugDetailId, useStatus: value });
  }

  render() {
    let editStatus = this.props.customerDetailsDrug.editStatus
    const { getFieldDecorator } = this.props.form;
    const formItems = editStatus ? this.getEditebleRow() : null
    let trs = [], noDataTr, pagination
    if(this.props.customerDetailsDrug.getDrugResult.payload && Array.isArray(this.props.customerDetailsDrug.getDrugResult.payload.list)){
      const drugResult = this.props.customerDetailsDrug.getDrugResult
      if(drugResult.payload.count > this.pageSize){
        pagination = (
          <div style={{textAlign: 'right', padding: 10}}>
            <Pagination
              current={Number(drugResult.params.pageNumber)}
              pageSize={Number(drugResult.params.pageSize)}
              total={Number(drugResult.payload.count)}
              showTotal={()=>'第 ' + drugResult.params.pageNumber + ' 页'}
              onChange={this.handlePageChange.bind(this)}
            />
          </div>
        )
      }
      trs = drugResult.payload.list.map((row, index) => {
        let images
        let picPath = row.picPath
        if(Array.isArray(picPath)){
          images = picPath.map((img, index)=>{
            return (<a href={img.url} target='_blank' key={index}>
              <img style={{width: 20, marginLeft: 5}} src={picIcon} />
            </a>)
          })
        }
        return (
          <tr key={row.drugRequirementId}>
            <td>{row.drugName}{images}</td>
            <td>{row.standard}</td>
            <td>{row.producerName}</td>
            <td>{row.monthlyUsage ? row.monthlyUsage + (row.packageUnit ? row.packageUnit : '') : ''}</td>
            <td>{editStatus ? 
              <FormItem
              label=''
            >
              {getFieldDecorator(`medicine_${row.drugRequirementId}_useStatus`, {
                  rules: [{required: true, message: '不能为空'}],
                  initialValue: useStatusMap[row.useStatus] || ''
              })(            
               <Select placeholder="请选择使用状态" onChange={(value) => this.onChangeUseStatus(value, row.outDrugDetailId, row.drugRequirementId)}>
                 <Option key='1' title="使用中">使用中</Option>
                 <Option key='2' title="已停用">已停用</Option>
               </Select>
              )}
            </FormItem> 
             : (useStatusMap[row.useStatus] || '')}</td>
            <td>{row.createDate}</td>
            { editStatus ? <td></td> : null }
          </tr>
        )
      })
      if(!editStatus && trs.length === 0 && this.props.customerDetailsDrug.getDrugResult.status !== 'pending'){
        noDataTr = <tr><td colSpan='10'>暂无数据</td></tr>
      }
    }
    let styles = this.styles()
    return (
      <div className='form-table-box block' id='customerDetailsDrug' style={{marginBottom: 30}}>
        <AlertError {...this.props.customerDetailsDrug.getDrugResult} />
        <AlertError {...this.props.customerDetailsDrug.postDrugResult} />
        <NotEditableField
          editStatus={editStatus}
          notEditableOnly={this.permission || editStatus}
          switchState={()=>this.props.setEditStatusAction(true)}
        />
        <Spin
          spinning={this.props.customerDetailsDrug.getDrugResult.status === 'pending'}
        >
          <table>
            <thead>
              <tr>
                <th width='20%'> 通用名（商品名）</th>
                <th width='15%'>规格</th>
                <th width='17.5%'>生产企业</th>
                <th width='15%'>单月用量(盒/瓶，包装单位)</th>
                <th width='12.5%'>使用状态</th>
                <th width='15%'>登记日期</th>
                { editStatus ? <th>操作</th> : null }
              </tr>
            </thead>
            <tbody>
              {formItems}
              {trs}
              {noDataTr}
            </tbody>
          </table>
          {pagination}
        </Spin>
        {
          editStatus
          ?
            <Row>
              <Col>
                  {
                      this.props.disableAffix ?
                        <div className='block' style={styles.foot}>
                          <Button loading={this.state.loading} onClick={this.handleSubmit.bind(this)} type='primary'>保存</Button>
                          <Button style={{marginLeft: 10}} onClick={ () =>{ this.props.form.resetFields(); this.props.setEditStatusAction(false);} } className='cancelButton'>取消</Button>
                        </div>
                      :
                      <Affix offsetBottom={0} ref={affix => affix && affix.updatePosition({})}>
                        <div className='block' style={styles.foot}>
                          <Button loading={this.state.loading} onClick={this.handleSubmit.bind(this)} type='primary'>保存</Button>
                          <Button style={{marginLeft: 10}} onClick={ () =>{ this.props.form.resetFields(); this.props.setEditStatusAction(false);} } className='cancelButton'>取消</Button>
                        </div>
                      </Affix>
                  }
              </Col>
            </Row>
          :
            null
        }
      </div>
    )
  }

  styles () {
    return {
      foot: {
        textAlign: 'center',
        height: 60,
        lineHeight: '60px'
      },
      footBtn: {
        marginRight: 10
      }
    }
  }
}

const MedicineRequirmentForm = Form.create({
  mapPropsToFields(props){
    return {...props.customerDetailsDrug.formData}
  },
  onFieldsChange(props, fields){
    props.renewFormDataAction(fields)
  }
})(MedicineRequirment)

function select(state){
  return {customerDetailsDrug: state.customerDetailsDrug}
}

function mapDispachToProps(dispatch){
  return bindActionCreators( { getPatientAction, getPotentialPatientAction, renewFormDataAction, getDrugAction, postDrugAction, setEditStatusAction }, dispatch)
}

export default connect(select, mapDispachToProps)(MedicineRequirmentForm)
