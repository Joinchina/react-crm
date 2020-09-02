import React, { Component } from 'react'
import { Menu, Dropdown, Button, Modal, Alert } from 'antd';

import { getReport, getState, dispatch } from './middleware';
import { createUpdateStateAction, DELETE } from './state';

let component;

if (process.env.NODE_ENV === 'development') {
    const style = {
        btn: {
            position: 'fixed',
            zIndex: 9999,
            bottom: 20,
            right: 20
        },
        pre: {
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-all',
            height: 300,
            width: '100%',
            padding: 5,
            border: '1px solid #ddd',
        }
    };
    component = class DebuggerButton extends Component {

        constructor(...args) {
            super(...args);
            this.state = {
                showModifyState: false
            };
        }

        submitError(){
            const report = getReport();
            Modal.info({
                width: '80%',
                title: '请复制下方内容到错误报告中',
                content: (
                  <div>
                      <Alert message="建议在打开或刷新页面之后，直接复现问题并提交，避免无用操作，
                          以减少提交的内容数据量和调试难度。" type="warning" closable/>
                    <textarea disabled="disabled" style={style.pre} value={report}></textarea>
                  </div>
                )
            })
        }

        modifyState(){
            const stateValue = JSON.stringify(getState(), null, '    ');
            this.setState({showModifyState:true, stateValue: stateValue, oldStateValue: stateValue });
        }

        submitModifyState(){
            const oldState = JSON.parse(this.state.oldStateValue);
            const newState = JSON.parse(this.state.stateValue);
            function diff(o, n){
                if (o === null || n === null) return n;
                let patch;
                for (const name in o) {
                    const ov = o[name];
                    const nv = n[name];
                    if (ov === nv) {

                    } else if (typeof(ov) === 'object' && typeof(nv) === 'object') {
                        const d = diff(ov, nv);
                        if (d !== undefined) {
                            if (!patch) patch = Object.create(null);
                            patch[name] = d;
                        }
                    } else if (nv === undefined) {
                        if (!patch) patch = Object.create(null);
                        patch[name] = DELETE;
                    } else {
                        if (!patch) patch = Object.create(null);
                        patch[name] = nv;
                    }
                }
                if (Array.isArray(o) && Array.isArray(n)) {
                    if (o.length !== n.length) {
                        patch.length = n.length;
                    }
                }
                return patch;
            }
            const patch = diff(oldState, newState);
            if (patch) {
                dispatch(createUpdateStateAction(patch));
            }
            this.setState({ showModifyState: false });
        }

        cancelModifyState() {
            this.setState({ showModifyState: false });
        }

        render(){
            const menu = (
              <Menu onClick={({key}) => this[key]()}>
                <Menu.Item key="submitError">
                    提交错误
                </Menu.Item>
                <Menu.Item key="modifyState">
                    修改状态
                </Menu.Item>
              </Menu>
            );
            return <div style={style.btn}>
                <Dropdown overlay={menu}>
                    <Button type="dashed">调试器</Button>
                </Dropdown>
                <Modal
                  title="修改状态"
                  visible={this.state.showModifyState}
                  width="80%"
                  onOk={()=>this.submitModifyState()}
                  onCancel={()=>this.cancelModifyState()}
                >
                    <textarea style={style.pre} value={this.state.stateValue} onChange={event=>this.setState({stateValue:event.target.value})}></textarea>
                </Modal>
            </div>;
        }
    };
} else {
    component = () => null;
}

export default component;
