import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import copy from 'copy-to-clipboard';
import QRCode from 'qrcode'
import {
    Button, Form, Row, Col, Select, Modal, Alert, DatePicker, Icon, Upload, Tag, Spin, Radio, Switch,
} from 'antd';
import message from '@wanhu/antd-legacy/lib/message'
import moment from 'moment';
import { connectRouter } from '../../mixins/router';
import { ViewOrEdit } from '../common/form';
import api from '../../api/api';
import Header from '../header_new/Header';
import './index.less'

const styles = {
    header: {
        top: 0,
        left: 0,
        width: '100%',
        height: 60,
        backgroundColor: 'white',
        borderBottom: '1px solid #d6d9dd',
        zIndex: 1000,
        lineHeight: '60px',
        marginBottom: 20,
        position: 'fixed'
    },
    box: {
        marginTop: 50,
        position: 'relative'
    },
    row: {
        marginRight: -20,
        marginLeft: 0,
        minHeight: 150
    },
    col: {
        minHeight: 130,
        marginBottom: 20,
    },
    colBox: {
        backgroundColor: 'white',
        minHeight: 130,
        marginRight: 20,
        padding: '18px 20px',
        position: 'relative',
    },
    colTitle: {
        color: '#169f85',
        fontSize: 18
    },
    colContent: {
        fontSize: 14,
        marginTop: 10,
    },
    colContent_2: {
        fontSize: 14,
        marginTop: 10,
        display: 'flex',
        flexDirection: 'row',
    },
    flex_col_box:{
        display: 'flex',
        flexDirection: 'column',
        maxWidth: '70vw'
    },
    box_item_4: {
        marginTop: 38,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    }
}

function timeout(time) {
    return new Promise(fulfill => setTimeout(fulfill, time));
}

class InsurancePackagePage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            codeList: [],
        }
    }

    async componentDidMount(){
        await this.setPromise({ loading: true})
        try{
            const userInfo = await api.getUserInfo()
            const insurance_list = await api.getUserInsuranceList(userInfo.user);
            let il = []
            insurance_list && insurance_list.length && insurance_list.map(async (i, index) => {
                if(i.qrCodeAddress){
                    const iul = await QRCode.toDataURL(i.qrCodeAddress);
                    if(iul){
                        il.push(iul)
                    }
                }
            })
            await timeout(300)
            this.setState({
                codeList: il,
                loading: false,
                insurance_list,
                cIdCode: insurance_list && insurance_list.length && insurance_list[0].qrCodeAddress.slice(insurance_list[0].qrCodeAddress.indexOf('=') + 1)
            })
        }catch(err){
            message.error(err.message)
            this.setState({
                loading: false
            })
        }
    }

    copyThisUrl(data) {
        if(!data){
            message.error('复制失败');
            return;
        }
        if(copy(data)){
            message.success('复制成功');
        }else{
            message.error('复制失败');
        }
    }

    setPromise(data) {
        return new Promise((resolve, reject) => {
            this.setState(data, resolve)
        })
    }

    render() {
        const { codeList, loading, insurance_list } = this.state;
        return (
            <div style={{ width: '100%', overflow: 'hidden'}}>
                <header style={styles.header}>
                    <Header />
                </header>
                <div style={{ marginTop: 72 }}>
                    {insurance_list ? insurance_list.map((i, index) => {
                        const insurances = i.insurancePackagePros[0].products.map(item => item.productName) || [];
                        return (
                            <Row style={styles.row} key={index}>
                                <div style={styles.col} className='new_insurance_sty'>
                                    <div className='tasksColBox' style={styles.colBox}>
                                        <div style={styles.colTitle}>
                                            {i.insurancePackageName}
                                        </div>
                                        <div style={styles.colContent}>
                                            年龄范围：{`${i.ageRange[0]}-${i.ageRange[1]}`}
                                        </div>
                                        <div style={styles.colContent_2}>
                                            <p style={{ minWidth: '19vw' }}>服务产品：</p>
                                            <div style={styles.flex_col_box}>
                                                {
                                                    insurances.length ? insurances.map(item => {
                                                        return (
                                                            <p style={{ wordBreak: 'break-all' }}>{item}</p>
                                                        )
                                                    }) : null
                                                }
                                            </div>
                                        </div>
                                        <div style={styles.box_item_4}>
                                            <div style={{ padding: '10px', border: '1px solid #E8E8E8' }}>
                                                <img src={codeList.length && codeList[index] || ''} width='110px' height='110px' />
                                            </div>
                                            <span style={{ fontSize: '14px', color: '#666666', marginBottom: 24, marginTop: 12}}>长按二维码保存</span>
                                            <a style={{ textDecoration: 'underline', color: '#418DC7', fontSize: 14 }} onClick={() => this.copyThisUrl(i.qrCodeAddress)}>复制下单链接</a>
                                        </div>
                                        <span>分销渠道编码：{this.state.cIdCode !== 'null' && this.state.cIdCode ? this.state.cIdCode : ''}</span>
                                    </div>
                                </div>
                            </Row>
                        )
                    }) : <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '88vh' }}><Spin spinning={loading} /></div>}
                </div>
            </div>
        )
    }
}

export default InsurancePackagePage;
