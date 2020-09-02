import React, { Component } from 'react';
import mount, { prop, action } from '@wanhu/react-redux-mount';
import api from '../../../api/api';

import icon from './weixin.png';

const styles = {
    menuItemImg:{
      width: 15,
      height:15,
      'verticalAlign': 'middle'
    },
    a: {
        marginLeft: 8,
        cursor: 'pointer'
    }
};

@mount('BindWeixinLink', props => props.patientId)
export default class BindWeixinLink extends Component {

    @prop()
    bindInfo;

    @action()
    async loadBindInfo() {
        this.bindInfo = null;
        try {
            this.bindInfo = {
                openid: await api.getWeixinBindByPatientAndApp(this.props.appid, this.props.patientId)
            };
        } catch (e) {
            if (e.status !== 404) {
                throw e;
            }
            this.bindInfo = { openid: null };
        }
    }

    componentWillMount() {
        this.loadBindInfo();
    }

    onClick = () => {
        if (this.props.onBind) {
            this.props.onBind(this.props.patientId, this.bindInfo.openid);
        }
    }

    render() {
        if (!this.bindInfo) {
            return null;
        }
        let { style, bindInfo, patientId, dispatch, onBind, ...restProps } = this.props;
        style = style ? {
            ...styles.a,
            ...style
        } : styles.a;
        return <a style={style} {...restProps} onClick={this.onClick}>
            <img style={styles.menuItemImg} src={icon} alt='绑定微信'/>
        </a>
    }
};
