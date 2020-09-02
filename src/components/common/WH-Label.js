import React from 'react'
/*
 * {text} 要显示的文字
 * {title} 要显示的标题
 */
export default function label (props) {
  const styles = {
    text: {
      wordWrap: 'break-word'
    },
    title: {
      display: 'inline-block',
      height: 22,
      lineHeight: '22px',
      backgroundColor: 'white',
      paddingRight: 10,
      marginBottom: '-1px'
    },
    box: {
      borderBottom: 'solid 1px #e0e0e2',
      minHeight: '22px'
    }
  }
  const text = props.text !== null && props.text !== undefined ? props.text : '-';
  return <div style={styles.box}>
    <span style={styles.title}>
      {props.title}
    </span>
    {typeof text === 'string' ?   <span style={styles.text}
     dangerouslySetInnerHTML={{ __html: props.text !== null && props.text !== undefined ? props.text : '-'}}/>
     :
     <span style={styles.text} >{text}</span>}

  </div>
}
