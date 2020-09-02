import React, { Component } from 'react';
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { setRightPanelWidth } from '../../../states/navMenu'
import mount, { prop, action } from '@wanhu/react-redux-mount';
import query from '@wanhu/react-redux-mount/query';
import api from '../../../api/api';
import './index.scss';
import { Modal } from 'antd';
import message from '@wanhu/antd-legacy/lib/message'
import { withRouter } from 'react-router-dom';

const statusActions = {
    3: ["dial"],
    4: ["dial"],
    5: ["dial"],
}

@withRouter
@mount({
    keyPath: ["CallWorkbench"],
    resetOnUnmount: false
})
class CallWorkbench extends Component {

    @prop()
    visible;

    @prop()
    loginState;

    @prop()
    availableActions;

    @prop({
        onUpdate: "onPerformAction"
    })
    performAction;

    @prop()
    performActionResult;

    @query()
    nocall;

    calls = {

    };

    workbench = {

    }

    @action()
    onPerformAction(action) {
        if (action) {
            console.log("Perform action", action);
            this.performAction = null;
            if (this.workbench.instance) {
                try {
                    const res = this.workbench.instance[action.action](...action.args);
                    this.performActionResult = {
                        id: action.id,
                        value: res
                    };
                } catch (e) {
                    console.warn("Perform action error", e);
                    this.performActionResult = {
                        id: action.id,
                        error: e.message
                    };
                }
            } else {
                this.performActionResult = {
                    id: action.id,
                    error: "SDK not inited"
                }
            }
        }
    }

    @action()
    async init(){
        const show = window.localStorage.getItem("defaultShowCallWorkbench");
        this.visible = show;
        const loginRedirect = await api.getLoginState();
        if (loginRedirect) {
            this.elem.innerHTML = `<div class="call-login-tip"><div class="call-login-title">您需要登录阿里云客服系统才能使用电话条</div><a class="call-login-btn ant-btn ant-btn-primary" href="${loginRedirect}">登录</a></div>`;
        } else {
            this.workbench.instance = new window.WorkbenchSdk({
                width: 280,
                height: document.body.clientHeight - 60,
                dom: "workbench",
                instanceId: window.CALL_INSTANCE_ID,
                ajaxPath: '/_api/call',
                onInit: () => {
                    this.workbench.instance.register();
                    const btn = window.document.createElement("a");
                    btn.style.position = "absolute";
                    btn.style.right = "45px";
                    btn.style.top = 0;
                    btn.style.height = "48px";
                    btn.style.lineHeight = "48px";
                    btn.style.textAlign = "center";
                    btn.style.width = "20px";
                    btn.style.color = "#d7d8d9";
                    this.elem.appendChild(btn);
                    btn.innerHTML = '<i class="anticon anticon-logout"></i>';
                    btn.onclick = () => {
                        window.open("https://account.aliyun.com/logout/logout.htm");
                        const redirectUrl = window.location.pathname + (window.location.search || '');
                        window.location.href = `/_api/call/logout?r=${encodeURIComponent(redirectUrl)}`;
                    }
                },
                onErrorNotify: (err) => {
                    console.error('呼叫系统错误', err);
                    message.error(`呼叫系统错误：${err.errorMsg || err.errorMsgTip}`);
                },
                onCallComing: (connid, caller, callee, contactId) => {
                    this.calls[connid] = { caller, contactId };
                    this.showPanel();
                },
                onStatusChange: this.onStatusChange
            });
        }
    }

    @action()
    onStatusChange(code, lastCode, context) {
        if (this.availableActions !== statusActions[code]) {
            this.availableActions = statusActions[code];
        }
        if (code === 9 && context.connid) {
            this.currentCall = context.connid;
            if (this.calls[context.connid]) {
                window.open(`/newtask?phone=${this.calls[context.connid].caller}&aliyunid=${this.calls[context.connid].contactId}&nocall=1`);
                //this.props.history.push(`/newtask?phone=${caller}`);
            }
        }
        if (lastCode === 9 && code !== 9) {
            delete this.calls[this.currentCall];
            this.currentCall = null;
        }
        console.log("status change", code, lastCode, context);
    }

    componentDidMount(){
        if (this.nocall) {
            return;
        }
        const show = window.localStorage.getItem("defaultShowCallWorkbench");
        const elem = document.createElement("div");
        elem.id = "workbench";
        elem.style.position = "fixed";
        elem.style.top = "60px";
        elem.style.right = "0";
        elem.style.width = "280px";
        elem.style.bottom = "0";
        elem.style.borderLeft = '1px solid rgb(214, 217, 221)';
        elem.style.transition = "all 0.3s";
        elem.style.background = "white";
        elem.style.transform = show ? null : 'translateX(280px)';
        document.body.appendChild(elem);
        if (show) {
            this.props.setRightPanelWidth(280);
        }
        this.elem = elem;
        this.init();
    }

    @action()
    togglePanel() {
        if (!this.elem) return;
        if (this.visible) {
            this.elem.style.transform = 'translateX(280px)';
            this.visible = false;
            this.props.setRightPanelWidth(0);
            window.localStorage.removeItem("defaultShowCallWorkbench");
        } else {
            this.elem.style.transform = null;
            this.visible = true;
            this.props.setRightPanelWidth(280);
            window.localStorage.setItem("defaultShowCallWorkbench", "true");
        }
    }

    @action()
    showPanel(){
        if (!this.elem) return;
        if (this.visible) return;
        this.elem.style.transform = null;
        this.visible = true;
        this.props.setRightPanelWidth(280);
    }

    render(){
        if (this.nocall) {
            return React.cloneElement(this.props.children, { onClick: () => Modal.error({
                content: "弹出窗口不能使用电话条"
            }) });
        } else {
            return React.cloneElement(this.props.children, { onClick: this.togglePanel });
        }
    }
}

function select(state){
    return {
        rightPanelWidth: state.navMenu.rightPanelWidth
    }
}

function mapDispachToProps(dispatch){
    return bindActionCreators({ setRightPanelWidth }, dispatch)
}

export default connect(select, mapDispachToProps)(CallWorkbench)
