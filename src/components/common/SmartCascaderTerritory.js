import React from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import { Cascader } from 'antd'

import NotEditableField from './NotEditableField'
import SmartFieldBase from './SmartFieldBase'

/*
 * 参数
 *
 */

import { getProvincesAction, getCitiesAction, getAreasAction } from '../../states/smartCascaderTerritory'

class SmartCascaderTerritory extends SmartFieldBase {
  constructor(props) {
    super(props)
    this.state = {
      options: props.options ? props.options : [],
      provinceName: '',
      cityName: '',
      areaName: ''
    }
  }

  handleLoadData = selectedOptions => {
    const targetOption = selectedOptions[selectedOptions.length - 1]
    if(targetOption.level === 'p'){
      this.props.getCitiesAction(targetOption.value)
    }else if(targetOption.level === 'c'){
      this.props.getAreasAction(selectedOptions[0].value, selectedOptions[1].value)
    }
  }

  findIndex(array, id){
    let index = -1
    for(let i=0; i < array.length; i++){
      if(array[i].value == id){
        index = i
        break
      }
    }
    return index
  }

  componentWillReceiveProps(nextProps){
    let newValue
    if('value' in nextProps){
      this.setState({value: nextProps.value})
      newValue = nextProps.value
    }else{
      newValue = this.state.value
    }
    if(nextProps.smartCascaderTerritory && nextProps.smartCascaderTerritory.cn){
      let options = JSON.parse(JSON.stringify(nextProps.smartCascaderTerritory.cn))
      if(newValue){
        let provinceIndex = -1, cityIndex = -1
        if(newValue.length > 0){
          provinceIndex = this.findIndex(options, newValue[0])
          if(newValue[0] in nextProps.smartCascaderTerritory){
            if(provinceIndex !== -1){
              this.setState({provinceName: options[provinceIndex].label})
              options[provinceIndex].children = JSON.parse(JSON.stringify(nextProps.smartCascaderTerritory[newValue[0]].payload))
            }
          }else{
            this.props.getCitiesAction(newValue[0])
          }
        }
        if(newValue.length > 1){
          if(newValue[1] in nextProps.smartCascaderTerritory){
            cityIndex = this.findIndex(options[provinceIndex].children, newValue[1])
            if(cityIndex !== -1 && provinceIndex !== -1){
              this.setState({cityName: options[provinceIndex].children[cityIndex].label})
              options[provinceIndex].children[cityIndex].children = JSON.parse(JSON.stringify(nextProps.smartCascaderTerritory[newValue[1]].payload))
            }
          }else{
            this.props.getAreasAction(newValue[0], newValue[1])
          }
        }
        if(newValue.length > 2 && cityIndex !== -1 && provinceIndex !== -1){
          let areaIndex = this.findIndex(options[provinceIndex].children[cityIndex].children, newValue[2])
          if(areaIndex !== -1){
            this.setState({areaName: options[provinceIndex].children[cityIndex].children[areaIndex].label})
          }
        }
      }
      this.setState({options})
    }
  }

  handleValueChange = () => {
    const provinceName = this.state.provinceName || '';
    const cityName = this.state.cityName || '';
    const areaName = this.state.areaName || '';
    if (this.props.onBlur) {
        this.props.onBlur(provinceName, cityName, areaName)
    }
  }

  render() {
    const { smartCascaderTerritory, getProvincesAction, getCitiesAction, getAreasAction, switchState, editStatus, notEditableOnly, ...rest} = this.props
    if(!this.props.editStatus || notEditableOnly === true){
      return (
        <NotEditableField
          switchState={switchState}
          editStatus={editStatus}
          notEditableOnly={notEditableOnly}
        >
          {`${this.state.provinceName} ${this.state.cityName} ${this.state.areaName}`}
        </NotEditableField>
      )
    }

    return (
      <Cascader
        {...rest}
        changeOnSelect
        allowClear={this.props.allowClear}
        value={this.state.value}
        loadData={this.handleLoadData}
        onBlur={this.handleValueChange}
        options={this.state.options}
      />
    )
  }

  componentDidMount(){
    this.props.getProvincesAction()
  }
}

function select(state){
  return { smartCascaderTerritory: state.smartCascaderTerritory }
}

function mapDispachToProps(dispatch){
  return bindActionCreators( { getProvincesAction, getCitiesAction, getAreasAction }, dispatch)
}

export default connect(select, mapDispachToProps)(SmartCascaderTerritory)
