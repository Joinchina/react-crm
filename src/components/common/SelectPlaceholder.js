import React from 'react';
import { Spin, Button, Icon } from 'antd';

export default function SelectPlaceholder(props) {
    let { keyword, loadingTip, errorTip, emptyTip, status, onReload, ...nextProps } = props;
    loadingTip = loadingTip || (keyword && `正在加载${keyword}列表`) || '正在加载列表';
    errorTip = errorTip || (keyword && `加载${keyword}列表失败`) || '加载列表失败';
    emptyTip = emptyTip || (keyword && `没有可选择的${keyword}`) || '没有可选择的项';
    if (status === 'pending') {
        return <div style={{textAlign: 'center'}} {...nextProps}>
            <Spin size="small"/> {loadingTip}
        </div>
    } else if (status === 'rejected') {
        return <div style={{textAlign: 'center', color:'#f04134'}} onClick={onReload} {...nextProps}>
            <Icon type="close-circle" style={{marginRight: 10}}/>
            { errorTip }
            <Button size="small" style={{marginLeft:10}}>重试</Button>
        </div>
    } else {
        return <div style={{textAlign: 'center'}} {...nextProps}>
            <Icon type="exclamation-circle" style={{marginRight: 5}}/>
            {emptyTip}
        </div>;
    }
}
