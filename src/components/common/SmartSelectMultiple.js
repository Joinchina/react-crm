import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'

import { Button, Select, Tag } from 'antd'
const Option = Select.Option
import NotEditableField from './NotEditableField'
import WHButton from './WHButton'
import { getAsyncSmartSelectMultipleOptinsAction } from '../../states/smartSelectMultiple'

/*
 * 参数
 *    props.switchState       func  切换编辑状态的方法 一般从Form所在的组件定义并传递到以Smart开头的表单域
 *      switchState = ()=>{this.setState({editStatus: !this.state.editStatus})}
 *    props.editStatus        bool  当前编辑状态
 *    props.selectStyle       object  select的样式
 *    props.notEditableOnly   bool  是否允许编辑
 *    props.value             array 值
 *      [
 *        {
 *          id: 3,
 *          name: '偏头痛',
 *        },
 *        {
 *          id: 5,
 *          name: '偏头痛',
 *        }
 *      ]
 *
 *   props.selectOptions=[
 *     {id:'0', name: 'options0'},
 *   ]
 *   props.defaultButtonCount         Number
 *
 * async组件参数:
 *    包括上边的参数
 *    props.asyncRequestFuncName      String
 *    props.asyncResultId            String  唯一ID
 *    props.asyncRequestParams        Oject
 *    props.asyncMapResultToState     func
 *      function(asyncResult){
 *        // ....
 *        return asyncResult
 *      }
 *
 */
export default class SmartSelectMultiple extends Component {

  constructor(props) {
    super(props)
    let value = props.value ? props.value : []
    let buttonOptions = props.buttonOptions ? props.buttonOptions : []
    let selectOptions = props.selectOptions ? props.selectOptions : []
    //selectOptions = this.deleteOptionsThatHaveChosen(selectOptions, value)
    this.state = {
      selectInputValue: undefined,
      value,
      selectOptions,
      buttonOptions,
    }
  }

  componentWillReceiveProps(nextProps) {
    // Should be a controlled component.
    let newValue
    if('value' in nextProps){
      newValue = nextProps.value ? nextProps.value : []
      this.setState({value: newValue})
    }else{
      newValue = this.state.value
    }
    let key = this.state.asyncResultId
    if(key && nextProps.smartSelectMultiple[key] && Array.isArray(nextProps.smartSelectMultiple[key])) {
      this.setState({buttonOptions: nextProps.smartSelectMultiple[key].slice(0, 10)})
      let asyncResult = nextProps.smartSelectMultiple[key]
      const asyncMapResultToState = this.props.asyncMapResultToState
      let selectOptions = asyncMapResultToState ? asyncMapResultToState(asyncResult) : asyncResult
      //kselectOptions = this.deleteOptionsThatHaveChosen(selectOptions, newValue)
      this.setState({ selectOptions })
    }else if('selectOptions' in nextProps) {
      this.setState({selectOptions: nextProps.selectOptions})
    }
  }

  changeStatus(d){
    //console.log('d', d)
    //let index = this.state.value.indexOf(d)
    let index = -1
    for(let i=0; i<this.state.value.length; i++){
      if(d.id == this.state.value[i].id){
        index = i
        break
      }
    }
    //console.log('index', index)
    let newValue
    if(index !== -1){
      newValue = [...this.state.value.slice(0, index), ...this.state.value.slice(index + 1)]
    }else{
      newValue = [...this.state.value, d]
    }
    this.setState({value: newValue})
    this.triggerChange(newValue)
  }

  triggerChange = (newValue) => {
    const onChange = this.props.onChange
    if (onChange) {
      onChange(newValue)
    }
  }

  handleSelect = (value, option) => {
    let newState = [...this.state.value, {id: value.key, name: value.label}]
    //console.log('---------', newState)
    this.setState(
      {
        value: newState,
        selectInputValue: undefined,
      }
    )
    this.triggerChange(newState)
  }

  deleteOptionsThatHaveChosen(selectOptions, value){
    selectOptions = selectOptions ? selectOptions : this.state.selectOptions
    value = value ? value : this.state.value
    // 去除option 中已选中的项
    for(let i=0; i<selectOptions.length; i++){
      let index = -1
      for(let j=0; j< value.length; j++){
        if(value[j].id == selectOptions[i].id){
          index = j
          break
        }
      }
      selectOptions[i].disabled = index === -1 ? false : true
    }
    return selectOptions
  }

  getNameById(id){
    let selectOptions = this.state.selectOptions
    if(!Array.isArray(selectOptions)) return '未知id:' + id
    for(let i=0; i<selectOptions.length; i++){
      if(selectOptions[i].id == id){
        return selectOptions[i].name
      }
    }
    return '未知id:' + id
  }

  ifOptionInValue(d){
    let index = -1
    if(!this.state.value) return false
    this.state.value.forEach((row, i) => {
      if(d.id == row.id){
        index = i
      }
    })
    return index === -1 ? false : true
  }

  render() {
    let defaultButtonCount = 'defaultButtonCount' in this.props ? this.props.defaultButtonCount : 10
    const options = this.state.selectOptions.map((d, index)=> {
      let isSelected = this.ifOptionInValue(d)
      if(index < defaultButtonCount || isSelected){
        const btnStyle={marginRight: 5, marginBottom:10,  textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap'}
        return <WHButton style={d.isEmphasis ? {...btnStyle, background: '#FDECE2'} : btnStyle} key={index} onClick={this.changeStatus.bind(this, d)} selected={isSelected ? true : false} title={d.name} >{d.name}</WHButton>
      }else{
        return null
      }
    })
    let selectOptions = []
    if(this.state.selectOptions){
      //console.log('selectOptions', this.state.selectOptions)
      let selectOptionsData = this.state.selectOptions.filter((option, index)=>{
        if(index < defaultButtonCount) return false
        return !this.ifOptionInValue(option)
      })
      selectOptions = selectOptionsData.map((d, index)=> {
        return <Option key={d.id} disabled={d.disabled}>{d.name}</Option>
      })
    }
    if(!this.props.editStatus || this.props.notEditableOnly === true){
      if(this.state.value){
        let tags = this.state.value.map((d, index) => {
          return <Tag key={index}>{ d.name ? d.name : this.getNameById(d.id) }</Tag>
        })
        return (
          <NotEditableField
            {...this.props}
          >
            {tags}
          </NotEditableField>
        )
      }
    }

    return (
      <div>
      {options}
      <Select
        style={this.props.selectStyle ? this.props.selectStyle : {}}
        value={this.state.selectInputValue}
        showSearch={true}
        allowClear={true}
        labelInValue={true}
        optionFilterProp='children'
        onSearch={this.handleSearch ? this.handleSearch : undefined}
        onSelect={this.handleSelect}
        placeholder={this.props.placeholder ? this.props.placeholder : '输入关键字搜索'}
        getPopupContainer={this.props.getPopupContainer ? this.props.getPopupContainer : ()=>document.body }
      >
        {selectOptions ? selectOptions : this.props.children}
      </Select>
      </div>
    )
  }
}

class SmartSelectMultipleAsyncParent extends SmartSelectMultiple{

  constructor(props) {
    super(props)
    let asyncRequestFuncName = props.asyncRequestFuncName ? props.asyncRequestFuncName : null
    let asyncResultId = props.asyncResultId ? props.asyncResultId : null
    if(asyncResultId === null && asyncRequestFuncName !== null){
      asyncResultId = asyncRequestFuncName
    }
    this.state = {
      ...this.state,
      asyncResultId,
      asyncRequestFuncName,
      asyncRequestParams: props.asyncRequestParams ? props.asyncRequestParams : null,
    }
  }

  componentDidMount(){
    this.props.getAsyncSmartSelectMultipleOptinsAction(this.state.asyncRequestFuncName, this.state.asyncResultId, this.asyncRequestParams)
  }
}

SmartSelectMultipleAsyncParent.propTypes = {
  editStatus: PropTypes.bool.isRequired,
  //switchState: PropTypes.func.isRequired,
  asyncRequestFuncName: PropTypes.string.isRequired,
  //asyncResultId: PropTypes.string.isRequired,
}

function select(state){
  return {smartSelectMultiple: state.smartSelectMultiple}
}

function mapDispachToProps(dispatch){
  return bindActionCreators( { getAsyncSmartSelectMultipleOptinsAction }, dispatch)
}

export const SmartSelectMultipleAsync = connect(select, mapDispachToProps)(SmartSelectMultipleAsyncParent)
