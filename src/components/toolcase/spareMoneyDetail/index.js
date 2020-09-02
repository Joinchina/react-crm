import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link, Route } from 'react-router-dom';
import { Breadcrumb } from 'antd';
import { connectRouter } from '../../../mixins/router';

import Title from '../../common/Title';
import Stream from './stream';
import Application from './application'


class SpareMoneyDetail extends Component {
    constructor(props){
        super(props);
        this.hospitalAccountId = this.props.match.params.hospitalAccountId;
        this.tab = this.props.match.params.tab || 'stream';
        this.linkTitle = '备用金流水'
    }

    componentWillReceiveProps(props) {
        const nextTab = props.match.params.tab || 'stream';
        if (this.hospitalAccountId !== props.match.params.hospitalAccountId){
            this.hospitalAccountId = props.match.params.hospitalAccountId;
            this.tab = nextTab;
        } else if (this.tab !== nextTab) {
            this.tab = nextTab;
        }
        this.renderTab()
    }

    openStreamTab = () =>{
        this.props.router.set({
            query: { r: this.props.router.query.r },
            path: `/spareMoneyDetail/${this.hospitalAccountId}`
        }, { reset: true, replace: true })
    }

    openApplicationTab = () => {
        this.props.router.set({
            query: {r: this.props.router.query.r},
            path: `/spareMoneyDetail/${this.hospitalAccountId}/application`,
        }, {reset: true, replace: true});
    }

    renderTab(){
        switch (this.tab) {
            case 'stream':
            this.linkTitle = '备用金流水'
                return <Stream
                    hospitalAccountId={this.hospitalAccountId}/>;
            case 'application':
            this.linkTitle = '备用金申领单'
                return <Application
                    hospitalAccountId={this.hospitalAccountId} />;
            default:
                return null;
        }
    }

    get returnToSpareMoneyListUrl(){
        if (this.props.router.query.r && this.props.router.query.r.indexOf('/spareMoneyList') === 0) {
            return this.props.router.query.r;
        } else {
            return '/spareMoneyList';
        }
    }

    render() {
        return (
            <div>
                <Breadcrumb className='breadcrumb-box'>
                    <Breadcrumb.Item>
                        <Link to={this.returnToSpareMoneyListUrl}>备用金管理</Link>
                    </Breadcrumb.Item>
                    <Breadcrumb.Item>
                        {this.linkTitle}
                    </Breadcrumb.Item>
                </Breadcrumb>
                <Title left={10}>
                    <div className='nav'>
                        <span style={styles.span}>
                            <a className={this.tab === 'stream' ? 'current' : null} onClick={this.openStreamTab}>备用金流水</a>
                        </span>
                        <span style={styles.span}>
                            <a className={this.tab === 'application' ? 'current' : null} onClick={this.openApplicationTab}>备用金申领单</a>
                        </span>
                    </div>
                </Title>
                {this.renderTab()}
            </div>
        )
    }
}



const styles = {
    span:{
        fontWeight: 'normal',
        color: 'inherit',
        marginRight: 20
    }
}

export default connectRouter(SpareMoneyDetail)
