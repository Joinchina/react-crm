import React, { Component } from 'react';
import { Modal, Button } from 'antd';
import { connect } from '../states/version';
import AlertError from './common/AlertError';
import AsyncEvent from './common/AsyncEvent';

class VersionComponent extends Component {

    componentWillMount() {
        this.props.getVersionIns();
    }

    componentWillReceiveProps(props) {
        if(props.version.status === 'fulfilled' && this.props.version.payload !== props.version.payload) {
            const version = props.version.payload;
            if(version.isView === 0) {
                this.showModal();
            }
        }
    }

    showModal = () => {
        this.props.setModalVisable(true);
    }

    hideModal = () => {
        this.props.setModalVisable(false);
    }

    onConfirm = () => {
        const isView = this.props.version.payload.isView
        const versionId = this.props.version.payload.versionId
        if(isView === 0) {
            this.props.updateVersion(versionId);
        } else {
            this.hideModal();
        }
    }

    createMarkup = (string) => {
        return {__html: string}
    }

    render() {
        const version = this.props.version.status === 'fulfilled' && this.props.version.payload;
        return (
            <div onClick={this.showModal} style={this.props.style} className="version">
                <AlertError status={this.props.version.status} payload={this.props.version.payload} />
                {version.insName}
                <Modal title={version.insName}
                    maskClosable={false}
                    visible={this.props.visible}
                    onCancel={this.onConfirm}
                    footer={<Button type='primary' onClick={this.onConfirm}>确定</Button>}
                >
                    <div dangerouslySetInnerHTML={ this.createMarkup(version.insContent)} />
                </Modal>
                <AsyncEvent async={this.props.updateStatus} onFulfill={this.hideModal} alertError />
            </div>
        )
    }
}

export default connect(VersionComponent)
