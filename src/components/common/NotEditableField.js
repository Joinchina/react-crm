import React, { Component } from 'react'

import editDefault from '../../images/editDefault.png'
import editRowOver from '../../images/editRowOver.png'
import editMouseOver from '../../images/editMouseOver.png'

export default class NotEditableField extends Component{

  state = {
    editImage: editDefault
  }

  render(){
    const styles = {
      box:{
        minHeight:36,
        lineHeight:'36px',
        position: 'relative',
        borderBottom: this.props.hideBottomLine ? null : '1px solid #d9d9d9'
      },
      img:{
        width: 20,
        height: 20,
        position: 'absolute',
        right: 0,
        bottom: 4
      }
    }

    const contentContainerStyle = this.props.contentContainerStyle ? {...this.props.contentContainerStyle, wordWrap: 'break-word'} : { wordWrap: 'break-word' }

    return (
      <div style={{...styles.box, ...this.props.style}}
        onMouseOver={(e)=>{
          this.setState({editImage: editRowOver})
        }}
        onMouseLeave={()=>this.setState({editImage: editDefault})}
      >
        <div style={contentContainerStyle}>
          {this.props.children}
        </div>
        {
          this.props.notEditableOnly !== true
          ?
            <img
              onMouseOver={(e)=>{
                //e.preventDefault()
                e.stopPropagation()
                this.setState({editImage: editMouseOver})
              }}
              onClick={e => {
                e.stopPropagation()
                this.props.switchState ? this.props.switchState() : null
              }}
              style={styles.img}
              src={this.state.editImage}
              alt=''
            />
          :
            null
        }
      </div>
    )
  }
}
