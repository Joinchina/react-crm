import React, { Component } from 'react';
import { Modal, Progress, Button } from 'antd';
import SocketIO from 'socket.io-client';
import { url } from '../../api';
import './ProgressModal.scss';

export default class ProgressModal extends Component {

    state = {
        current: 0,
        total: 1,
        indeterminate: true,
        success: false,
        error: false,
    };

    componentWillMount(){
        this.socket = SocketIO(url('_async'), {
            forceNew: true,
            reconnection: false,
            query: {
                id: this.props.session.id,
                secret: this.props.session.secret,
            },
        });
        this.socket.on('tick', (current, total, data) => {
            this.setState({
                indeterminate: false,
                current,
                total,
                data
            });
        });
        this.socket.on('complete', data => {
            if (data.code === 0) {
                if (this.props.autoHide) {
                    if (this.props.onSuccess) {
                        this.props.onSuccess(data.data);
                    }
                } else {
                    this.setState({
                        success: true,
                        data: data.data,
                        current: 1,
                        total: 1,
                    });
                }
            } else {
                if (this.props.autoHide) {
                    if (this.props.onError) {
                        this.props.onError({ code: data.code, message: data.message });
                    }
                } else {
                    this.setState({
                        error: true,
                        message: data.message,
                        errorCode: data.code,
                    });
                }
            }
        });
        this.socket.on('disconnect', () => {
            this.setState(state => {
                if (!state.success || !state.error) {
                    if (this.props.autoHide) {
                        if (this.props.onError) {
                            this.props.onError({ message: '网络连接错误' });
                        }
                        return null;
                    } else {
                        return {
                            error: true,
                            message: '网络连接错误'
                        };
                    }
                }
            });
        });
    }

    componentWillUnmount(){
        this.socket.disconnect();
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
