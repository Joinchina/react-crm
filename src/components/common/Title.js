import React from 'react'
/*
 * {text} 要显示的文字
 * {num} 要显示的数字
 * {children} 子组件
 */
export default function Title (props) {
  const styles = {
    box: {
      backgroundColor: props.bColor || '#f2f5f7',
      fontSize: 14,
      fontWeight: 'bold',
      lineHeight: '35px',
      paddingLeft: props.left || 0,
      borderBottom: 'solid 1px #e0e0e2',
      ...props.style,
    },
    num: {
      marginLeft: 5
    },
    tag: {
      fontSize: 12,
      backgroundColor: 'rgb(231, 76, 60)',
      color: 'white',
      borderRadius: 4,
      paddingLeft: 8,
      paddingRight: 8,
      paddingTop: 4,
      paddingBottom: 4,
      marginLeft: 10
    }
  }
  return <div style={styles.box}>
    <span>
      {props.text}
      {
      props.num ?
      <span style={styles.num}>
        {props.num}
      </span>
      :
      null
      }
      {props.children}
    </span>
  </div>
}
