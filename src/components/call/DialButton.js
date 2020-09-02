import React, { Component } from 'react';
import mount, { prop, action } from '@wanhu/react-redux-mount';
import { Icon } from 'antd';
import message from '@wanhu/antd-legacy/lib/message'

@mount({
    keyPath: ["CallWorkbench"],
    resetOnUnmount: false
})
class DialButton extends Component {

    @prop()
    availableActions;

    @prop()
    performAction;

    @action()
    call() {
        if (!this.availableActions || this.availableActions.indexOf("dial") < 0) {
            message.error("现在不能拨打电话，可能未登录呼叫中心或正在呼叫中");
            return;
        }
        this.performAction = {
            action: "call",
            args: [this.props.phone, "auto"],
            id: Math.random().toString().substr(-4)
        };
    }

    render() {
        return <a onClick={this.call}><Icon type="phone" /></a>
    }
}

export default DialButton;
