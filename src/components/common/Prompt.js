import React from 'react'

const styles = (bColor = 'rgb(231, 76, 60)',color = 'white') =>{
  return {
    tag: {
      fontSize: 12,
      backgroundColor: `${bColor}`,
      color: `${color}`,
      borderRadius: 4,
      paddingLeft: 8,
      paddingRight: 8,
      paddingTop: 4,
      paddingBottom: 4,
      marginLeft: 10
    }
  }
}
/*
 * {text} 要显示的文字
 * {bColor} 要使用的背景颜色
 * {color} 要使用的字体颜色
 */
export default function Prompt (props) {
  const tag = styles().tag
  return <span style={tag}>
      {props.text}
    </span>
}
