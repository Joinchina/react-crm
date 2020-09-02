import React, { Component } from 'react';
import { Modal } from 'antd';
import message from '@wanhu/antd-legacy/lib/message';


export default class AlertError extends Component {

    componentWillReceiveProps(nextProps) {
        const status = this.props.status || (this.props.async && this.props.async.status);
        const nextStatus = nextProps.status || (nextProps.async && nextProps.async.status);
        const nextPayload = nextProps.payload || (nextProps.async && nextProps.async.payload);
        if (status !== 'rejected' && nextStatus === 'rejected') {
            alertError(nextPayload);
        }
    }

    render(){
        return null;
    }
}

export function alertError(payload, method) {
    let msg = payload.message;
    if (payload.status === 403) {
        msg = '权限不足，请联系管理员';
    }
    if (payload.code === 'ERELOAD') {
        Modal.error({
            title: '错误',
            content: msg,
            onOk(){
                location.reload();
            },
        });
    } else if (payload.code === 'ELOGOUT') {
        Modal.error({
            title: '错误',
            content: msg,
            onOk(){
                location.href = "/user/logout";
            },
        });
    } else if (method === 'modal') {
        Modal.error({
            content: msg,
            onOk(){
            },
        });
    } else {
        message.error(msg, 3);
    }
}
