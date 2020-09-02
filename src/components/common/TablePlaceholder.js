import React from 'react';
import { Button, Icon } from 'antd';
import PropTypes from 'prop-types';

export default function SelectPlaceholder(props) {
    const loadingTip = props.loadingTip || (props.keyword && `正在加载${props.keyword}列表`) || '正在加载列表';
    const errorTip = props.errorTip || (props.keyword && `加载${props.keyword}列表失败`) || '加载列表失败';
    const emptyTip = props.emptyTip || '暂无数据';
    const style = props.style || {};
    if (props.noQuery) {
        return <div style={{textAlign: 'center', ...style}}>
            <Icon type="info-circle-o" style={{marginRight: 10}}/>
            请输入查询条件
        </div>
    } else if (props.status === 'pending') {
        return <div style={{textAlign: 'center', ...style}}>
            { loadingTip }
        </div>
    } else if (props.status === 'rejected') {
        return <div style={{textAlign: 'center', color:'#f04134', ...style}} onClick={props.onReload}>
            <Icon type="close-circle" style={{marginRight: 10}}/>
            { errorTip }
            <Button size="small" style={{marginLeft:10}}>重试</Button>
        </div>
    } else {
        return <div style={{textAlign: 'center', ...style}}>
            <Icon type="frown-o" style={{marginRight: 10}}/>
            {emptyTip}
        </div>;
    }
}

SelectPlaceholder.propTypes = {
    keyword: PropTypes.string,
    loadingTip: PropTypes.string,
    errorTip: PropTypes.string,
    emptyTip: PropTypes.string,
    status: PropTypes.string,
    onReload: PropTypes.func.isRequired,
};
