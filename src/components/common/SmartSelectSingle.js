import React from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import Select from './FocusableSelect';
import SelectPlaceholder from './SelectPlaceholder';
import NotEditableField from './NotEditableField'
import SmartFieldBase from './SmartFieldBase'
import { getAsyncThrottleSmartSelectSingleOptinsAction, getAsyncSmartSelectSingleOptinsAction } from '../../states/smartSelectSingle'
const Option = Select.Option

/*
 * 参数
 *    props.switchState             func  切换编辑状态的方法 一般从Form所在的组件定义并传递到以Smart开头的表单域
 *    props.mapDataToOption         func  生成Options
 *      switchState = ()=>{this.setState({editStatus: !this.state.editStatus})}
 *    props.editStatus              bool  当前编辑状态
 *    props.notEditableOnly         bool  是否允许编辑
 *    asyncRequestTrigger           string 'componentDidMount' 或 空
 *    props.value                   Object
 *      { key:'1', label: 'option2'}
 *    props.selectOptions           Array
 *      [
 *        {value:0, text: 'option1', disabled: false},
 *        {value:1, text: 'option2', disabled: false},
 *        {value:3, text: 'option3', disabled: false},
 *      ]
 *    props.selectStyle             Object
 *
 * async组件参数:
 *    包括上边的参数
 *    props.asyncRequestFuncName      String
 *    props.asyncRequestId            String  唯一ID
 *    props.asyncRequestParams        Oject
 *    props.asyncMapResultToState     func
 *      function(asyncResult){
 *        // ....
 *        return asyncResult
 *      }
 *
 */
export default class SmartSelectSingle extends SmartFieldBase {
  constructor(props) {
    super(props)
    let selectOptions = props.selectOptions ? props.selectOptions : undefined
    this.state = {
      ...this.state,
      selectOptions
    }
  }

  onSelect = (value, option) => {
    this.handleValueChange(value, option)
    this.cleanOptions ? this.cleanOptions() : undefined
    if(this.props.onSelect){
      //value = JSON.parse(JSON.stringify(value))
      this.props.onSelect(value, option)
    }
  }

  handleChange = (value) => {
    /*
    if(!value.label){
      value.label = value.value
    }
    */
    this.setState({value})
    if(this.props.onChange){
      this.props.onChange(value)
    }
  }

  search(keyword) {
    this.refs.select.search(keyword);
  }

  render() {
    let { value, switchState, editStatus, notEditableOnly, selectStyle, cleanOptionsOnBlur, hideBottomLine,...rest} = this.props
    if(value && value.label && typeof value.label == 'object'){
      value = {key: value.key, label: ' '}
    }else{
      value = value ? JSON.parse(JSON.stringify(value)) : value
    }
    if(!this.props.editStatus || notEditableOnly === true){
      return (
        <NotEditableField
          style={selectStyle}
          switchState={switchState}
          editStatus={editStatus}
          notEditableOnly={notEditableOnly}
          hideBottomLine={hideBottomLine}
        >
          {value && value.label ? value.label : null}
        </NotEditableField>
      )
    }

    let options
    if(this.state.selectOptions){
      if(this.props.mapDataToOption){        
        options = this.props.mapDataToOption(this.state.selectOptions)
      }else{
        options = this.state.selectOptions.map(d => <Option key={d.value} title={d.text} title={d.text}>{d.text}</Option>)
      }
    }
    return (
      <Select
        {...rest}
        ref="select"
        value={value}
        style={selectStyle}
        //allowClear={true}
        labelInValue={true}
        optionFilterProp='children'
        onSelect={this.onSelect}
        onSearch={ (value) => this.handleSearch(value)}
        onChange={this.handleChange}
        getPopupContainer={this.props.getPopupContainer ? this.props.getPopupContainer : null}        
        onBlur={ ()=> {
          if(this.props.onBlur){
            this.props.onBlur()
          }
          if(this.cleanOptions){
            this.cleanOptions()
          }
        }}
        notFoundContent={ this.getNotFoundContent ? this.getNotFoundContent() : this.props.notFoundContent }
      >
        {this.state.search && options ? options : this.props.children}
      </Select>
    )
  }
}

class SmartSelectSingleAsyncParent extends SmartSelectSingle{

  constructor(props) {
    super(props)
    this.state = {
      ...this.state,
      asyncResultId: props.asyncResultId ? props.asyncResultId : null,
      asyncRequestFuncName: props.asyncRequestFuncName ? props.asyncRequestFuncName : null,
    }
  }

  componentWillReceiveProps(nextProps) {
    /*
    if ('value' in nextProps) {
      this.setState({value: nextProps.value})
    }
    */
    if(this.state.asyncResultId){
      let key = this.state.asyncResultId
      if(this.props.smartSelectSingle && this.props.smartSelectSingle[key] && this.props.smartSelectSingle[key].status != 'fulfilled' && nextProps.smartSelectSingle[key].status == 'fulfilled'){
        let asyncResult = nextProps.smartSelectSingle[key].payload
        let params = nextProps.smartSelectSingle[key].params
        const asyncMapResultToState = this.props.asyncMapResultToState
        let selectOptions = asyncMapResultToState ? asyncMapResultToState(asyncResult, params) : asyncResult
        this.setState({ selectOptions })
      }
    }
  }

  componentDidMount(){
    if(this.props.asyncRequestTrigger === 'componentDidMount'){
      let params = this.props.asyncRequestParams ? this.props.asyncRequestParams : {}
      this.props.getAsyncSmartSelectSingleOptinsAction(this.state.asyncRequestFuncName, this.state.asyncResultId, null, params)
    }
  }

  cleanOptions = () => {
    if(this.props.cleanOptionsOnBlur){
      this.setState({
        selectOptions: undefined
      })
    }
  }

  handleSearch = (value) => {
    if(this.props.asyncRequestTrigger === 'componentDidMount') return
    this.setState({
      search: value.trim(),
      selectOptions: []
    });
    if (value === '') {
      return;
    } 
    value = value.trim()
    let params = this.props.asyncRequestParams ? this.props.asyncRequestParams : {}
    if(this.props.delay){
      this.props.getAsyncThrottleSmartSelectSingleOptinsAction(this.state.asyncRequestFuncName, this.state.asyncResultId, value, params)
    }else{     
      this.props.getAsyncSmartSelectSingleOptinsAction(this.state.asyncRequestFuncName, this.state.asyncResultId, value, params)
    }    
  }

  getNotFoundContent () {
        if (!this.state.search) {
            return null;
        }
        let key = this.state.asyncResultId;
        let status;
        if (this.props.smartSelectSingle && this.props.smartSelectSingle[key]){
            status = this.props.smartSelectSingle[key].status;
        } else {
            status = 'pending';
        }
        return status ? <SelectPlaceholder
            keyword={this.props.keyword} status={status} onReload={this.reload}
            loadingTip={this.props.loadingTip} errorTip={this.props.errorTip}
            emptyTip={this.props.emptyTip} />
            : null;
    }
}

SmartSelectSingleAsyncParent.propTypes = {
  asyncResultId: PropTypes.string.isRequired,
  asyncRequestFuncName: PropTypes.string.isRequired,
  //asyncRequestParams: PropTypes.object.isRequired,
}

function select(state){
  return {smartSelectSingle: state.smartSelectSingle}
}

function mapDispachToProps(dispatch){
  return bindActionCreators( { getAsyncThrottleSmartSelectSingleOptinsAction, getAsyncSmartSelectSingleOptinsAction }, dispatch)
}

export const SmartSelectSingleAsync = connect(select, mapDispachToProps, undefined, { withRef: true })(SmartSelectSingleAsyncParent)
