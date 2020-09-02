import React, { Component } from 'react'
import { Button } from 'antd'
import imgSelected from '../../images/gouxuan.png'

export default class WHButton extends Component{
  render(){
    let style = {...this.props.style}
    if(this.props.selected && !this.props.disabled){
        style.backgroundImage = `url(${imgSelected})`;
        style.backgroundRepeat = 'no-repeat';
        style.backgroundPositionX = 'right';
        style.backgroundPositionY = 'bottom';
        style.borderColor = '#1DA57A';
    }

    return (
      <Button
        {...this.props}
        style={style}
      >
        {this.props.children}
      </Button>
    )
  }
}

export { WHButton };
