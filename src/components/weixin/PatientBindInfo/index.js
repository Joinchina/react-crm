import React, { Component } from 'react';
import mount, { prop, action } from '@wanhu/react-redux-mount';
import { Spin, Button, Icon } from 'antd';
import alertError from '../../../decorators/alertError';
import { confirm } from '../../common/MessageBox';

import api from '../../../api/api';
import './index.scss';

const cache = {};

export default function PatientBindInfoWrapper(props) {
    if (!props.patientId) {
        throw new Error('patientId is required in PatientBindInfo');
    }
    if (!cache[props.patientId]) {
        cache[props.patientId] = forPatientId(props.patientId);
    }
    const PatientBindInfo = cache[props.patientId];
    return <PatientBindInfo {...props}/>
}

export function forPatientId(patientId) {

    @mount('PatientBindInfo', patientId)
    class PatientBindInfo extends Component {

        @prop()
        bindInfo = null;

        @action()
        async loadBindInfo() {
            this.bindInfo = null;
            const binds = (await api.getWeixinBindByPatient(patientId)) || [];
            const bindsWithInfo = await Promise.all(binds.map(async (bind) => {
                const openid = bind.openid;
                let info;
                try {
                    info = await api.getWeixinInfo(openid, bind.appid);
                } catch (e) {
                    if (e.status !== 404) {
                        throw e;
                    }
                }
                info = info || {};
                return {
                    ...bind,
                    info
                };
            }))
            this.bindInfo = bindsWithInfo;
        }

        @action()
        @alertError()
        async unbind(bind) {
            // const idx = this.bindInfo.indexOf(bind);
            // if (idx < 0) throw new Error('找不到此条绑定信息');
            if (!await confirm(`确认解除会员${this.props.patientName}在${bind.app.description}绑定的微信号${bind.info.nickname}吗？`, { okText: '解除' })){
                return;
            }
            // const newBind = [...this.bindInfo];
            // newBind.splice(idx, 1);
            this.bindInfo = null;
            await api.bindWeixinWithPatient(bind.appid, null, patientId);
            this.loadBindInfo();
        }

        componentWillMount() {
            this.loadBindInfo();
        }

        render() {
            if (!this.bindInfo) {
                return <Spin/>;
            } else if (!this.bindInfo.length) {
                return <div>未绑定</div>
                // return <div>{this.bindInfo.error}</div>
            } else {
                return <div> {
                    this.bindInfo.map(bind => <div key={bind.openid} className="weixinIcon">
                        <Button size="small" onClick={() => this.unbind(bind)}>解除绑定</Button>
                        <span className="weixinName">{bind.app.description}：</span>
                        {
                            bind.info.headimgurl ?
                            <img src={bind.info.headimgurl.replace(/0$/, '46')}/>
                            :
                            <Icon type="question-circle-o" />
                        }
                        <span>{bind.info.nickname || '该用户已绑定但未关注公众号，无法获取信息'}</span>
                    </div>)
                } </div>
            }
        }
    }

    return PatientBindInfo;
}
