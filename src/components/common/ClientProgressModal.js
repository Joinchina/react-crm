import React, { Component } from 'react';
import { Modal, Progress, Button } from 'antd';
import { url } from '../../api';
import './ProgressModal.scss';

export default class ClientProgressModal extends Component {

    state = {
        current: 0,
        total: 1,
        indeterminate: true,
        success: false,
        error: false,
    };

    componentWillMount(){
        const onTick = (current, total, data) => {
            this.setState({
                indeterminate: !total,
                current,
                total,
                data
            });
        };
        const promise = this.props.onStart(onTick);
        promise.then(data => {
            if (this.props.autoHide) {
                if (this.props.onSuccess) {
                    this.props.onSuccess(data);
                }
            } else {
                this.setState({
                    success: true,
                    data: data,
                    current: 1,
                    total: 1,
                });
            }
        }).catch(e => {
            console.warn("async progress error", e);
            if (this.props.autoHide) {
                if (this.props.onError) {
                    this.props.onError({ code: e.code, message: e.message });
                }
            } else {
                this.setState({
                    error: true,
                    message: e.message,
                    errorCode: e.code,
                });
            }
        });
    }

    onSuccess = () => {
        if (this.props.onSuccess) {
            this.props.onSuccess(this.state.data);
        }
    }

    onError = () => {
        if (this.props.onError) {
            this.props.onError({ code: this.state.errorCode, message: this.state.message });
        }
    }

    render() {
        const { type } = this.props;
        let label;
        let footer;
        let status;
        let format;
        if (this.state.success) {
            status = 'success';
            format = null;
            label = typeof this.props.successTip === 'function' ? this.props.successTip(this.state.data) : this.props.successTip;
            footer = <div>
                    <Button type={this.props.successButtonType} onClick={this.onSuccess}>{this.props.successButtonLabel || '返回'}</Button>
                </div>
        } else if (this.state.error) {
            status = 'exception';
            format = null;
            label = typeof this.props.errorTip === 'function' ? this.props.errorTip({ message: this.state.message }) : this.props.errorTip;
            footer = <div>
                    <Button type={this.props.errorButtonType} onClick={this.onError}>{this.props.errorButtonLabel || '返回'}</Button>
                </div>

        } else {
            status = 'active';
            format = type === 'tick' ? (() => this.state.indeterminate ? '- / -' : `${this.state.current} / ${this.state.total}`) : null;
            label = typeof this.props.progressTip === 'function' ? this.props.progressTip(this.state.data) : this.props.progressTip;
            footer = null;
        }

        return <Modal visible className="wh-progress-modal"
            footer={footer}
            closable={false}
            >
                <Progress status={status} percent={ Math.floor(100 * this.state.current / this.state.total) } format={format}/>
                <div>
                    { label }
                </div>
        </Modal>
    }
}
