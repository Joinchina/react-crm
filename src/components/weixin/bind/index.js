import React, { Component } from 'react';
import { Spin, Button, message } from 'antd';
import { Link } from 'react-router-dom';
import { confirm } from '../../common/MessageBox';
import CustomerCenter from '../../customerCenter/Customer';
import { withRouter } from 'react-router-dom';
import BindWeixinLink from './BindWeixinLink';
import mount, { prop, action } from '@wanhu/react-redux-mount';
import query from '@wanhu/react-redux-mount/query';
import api from '../../../api/api';
import alertError from '../../../decorators/alertError';
import './index.scss';

@mount('weixinBind')
class WeixinBind extends Component {

    @query({ onUpdate: 'loadBindInfo' })
    openid;

    @query({ onUpdate: 'loadBindInfo' })
    appid;

    @prop()
    bindInfo;

    @action()
    @alertError()
    async loadBindInfo() {
        this.bindInfo = null;
        let info;
        try {
            info = await api.getWeixinInfo(this.openid, this.appid);
        } catch (e) {
            if (e.status !== 404) {
                throw e;
            }
            this.bindInfo = {
                error: '无法获取微信号详情'
            };
            return;
        }
        const r = await api.getWeixinBindPatients(this.openid, this.appid);
        let patient;
        if (r.length) {
            const patientId = r[0];
            try {
                patient = await api.getPatient(patientId);
                patient.id = patientId;
            } catch (e) {
                if (e.code) {
                    let message = e.code === 406 ?
                        '该微信号已绑定会员，但你没有权限查看此会员'
                        :
                        `该微信号已绑定会员，但获取会员信息时出错：${e.message}。`;
                    patient = {
                        message,
                    }
                } else {
                    throw e;
                }
            }
        }
        this.bindInfo = {
            weixin: info,
            patient: patient
        };
    }

    @action()
    @alertError()
    async bind(patient, boundOpenId) {
        if (!boundOpenId) {
            if (!await confirm(`确认绑定微信号${this.bindInfo.weixin.nickname}到会员${patient.name}？`, {okText: '绑定'})){
                return;
            }
            await api.bindWeixinWithPatient(this.appid, this.openid, patient.id);
        } else {
            const weixinInfo = await api.getWeixinInfo(boundOpenId);
            if (!await confirm(`会员${patient.name}已绑定微信号${weixinInfo.nickname}，确认更换为新的微信号${this.bindInfo.weixin.nickname}？`, {okText: '更换'})){
                return;
            }
            await api.bindWeixinWithPatient(this.appid, this.openid, patient.id);
        }
        message.success(`绑定${this.bindInfo.weixin.nickname}的微信号已完成`);
        this.props.history.replace(`/customerDetails/${patient.id}/MemberInfor?r=${encodeURIComponent('/customerCenter')}`);
    }

    render() {
        if (!this.bindInfo) {
            return this.renderLoading();
        } else if (this.bindInfo.error) {
            return this.renderError();
        } else if (!this.bindInfo.patient) {
            return this.renderNotBound();
        } else {
            return this.renderBound();
        }
    }

    renderLoading() {
        return <div>
            <div>
                <Spin />正在加载微信绑定信息
            </div>
        </div>
    }

    renderError(){
        return <div>
            <div>
                { this.bindInfo.error }
            </div>
        </div>
    }

    renderNotBound() {
        return <div>
            <div className="weixinMsg">
                正在绑定微信号
                <div className="weixinHead">
                    <img src={this.bindInfo.weixin.headimgurl.replace(/0$/, '96')}/>
                    <span>{this.bindInfo.weixin.nickname}</span>
                </div>
            </div>
            <CustomerCenter
                renderCustomerOption={customer=>
                    <BindWeixinLink appid={this.appid} patientId={customer.id} onBind={(patientId, openid) => this.bind(customer, openid)} />
                }
            />
        </div>
    }

    renderBound() {
        const fullPath = `${this.props.location.pathname}${this.props.location.search}${this.props.location.hash}`;
        return <div>
            <div className="weixinHead">
                <img src={this.bindInfo.weixin.headimgurl.replace(/0$/, '96')}/>
                <span>{this.bindInfo.weixin.nickname}</span>
            </div>
            {   this.bindInfo.patient.id ?
                <div>
                    该微信号已绑定会员 <Link to={`/customerDetails/${this.bindInfo.patient.id}/MemberInfor?r=${encodeURIComponent(fullPath)}`}>{this.bindInfo.patient.name}</Link>
                </div>
                :
                <div>
                    {this.bindInfo.patient.message}
                </div>
            }
        </div>
    }
};

export default withRouter(WeixinBind);
