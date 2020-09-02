import React, { Component } from 'react'

export default (props) => {
  return (
    <div
      style={{
        fornSize: 14,
        fontWeight: 'bold',
        lineHeight: '30px',
        paddingLeft: 20,
        borderBottom: props.hideBottomLine?null:'1px solid #e0e0e2'
      }}
    >
      <span>{props.text}</span>
      <span style={{color: 'red'}}>{props.noteText}</span>
    </div>
  )
}
