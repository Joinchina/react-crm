import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Breadcrumb } from 'antd';
import { connectRouter } from '../../mixins/router';
import PropTypes from '../../helpers/prop-types';
import Title from '../common/Title';
import EssentialInfor from './customerDetails/EssentialInfor';
import './customer.css';
import MemberInfor from './customerDetails/MemberInfor';
import MedicationOrder from './customerDetails/MedicationOrder';
import MedicationDemand from './customerDetails/MedicationDemand';
import MedicationRecord from './customerDetails/MedicationRecord';
import Contacts from './customerDetails/Contacts';
import HealthRecords from './customerDetails/HealthRecords';

const tabsMap = [
    { label: '基本信息', key: 'EssentialInfor' },
    { label: '用药需求', key: 'MedicationDemand' },
    { label: '联系人', key: 'Contacts' },
];
const styles = {
    span: {
        fontWeight: 'normal',
        color: 'inherit',
        marginRight: 20,
    },
};

class PotentialCustomerDetails extends Component {
    static propTypes = {
        match: PropTypes.shape({
            params: PropTypes.object,
        }).isRequired,
        router: PropTypes.shape({
            query: PropTypes.object,
        }).isRequired,
    };

    constructor(props) {
        super(props);
        const { match } = this.props;
        this.customerId = match.params.customerId;
        this.tab = match.params.tab || 'EssentialInfor';
    }

    componentWillReceiveProps(props) {
        const { match } = props;
        const nextTab = match.params.tab || 'EssentialInfor';
        if (this.customerId !== match.params.customerId) {
            this.customerId = match.params.customerId;
            this.tab = nextTab;
        } else if (this.tab !== nextTab) {
            this.tab = nextTab;
        }
        this.renderTab();
    }

    get returnBack() {
        const { router } = this.props;
        if (router.query.r && router.query.r.indexOf('/potentialCustomer') === 0) {
            return router.query.r;
        }
        return '/potentialCustomer';
    }

    openTab(tab) {
        const { router } = this.props;
        router.set(
            {
                query: { r: router.query.r },
                path: `/PotentialCustomerDetails/${this.customerId}/${tab.key}`,
            }, {
                reset: true, replace: true,
            },
        );
    }

    renderTab() {
        const props = { ...this.props, customerId: this.customerId, source: 'PotentialCustomerDetails' };
        switch (this.tab) {
        case 'EssentialInfor':
            return <EssentialInfor {...props} />;
        case 'MemberInfor':
            return <MemberInfor {...props} />;
        case 'MedicationOrder':
            return <MedicationOrder {...props} />;
        case 'MedicationDemand':
            return <MedicationDemand {...props} />;
        case 'MedicationRecord':
            return <MedicationRecord {...props} />;
        case 'Contacts':
            return <Contacts {...props} />;
        case 'HealthRecords':
            return <HealthRecords {...props} />;
        default:
            return null;
        }
    }

    render() {
        return (
            <div>
                <Breadcrumb className="breadcrumb-box">
                    <Breadcrumb.Item>
                        <Link to={this.returnBack}>
                            话务资料管理
                        </Link>
                    </Breadcrumb.Item>
                    <Breadcrumb.Item>
                        话务资料详情
                    </Breadcrumb.Item>
                </Breadcrumb>
                <Title left={10}>
                    <div className="nav">
                        {tabsMap.map((tab, i) => (
                            <span style={styles.span} key={tab.id || i}>
                                {/* eslint-disable-next-line */}
                                <a className={this.tab === tab.key ? 'current' : null} onClick={() => this.openTab(tab)}>
                                    {tab.label}
                                </a>
                            </span>))}
                    </div>
                </Title>
                {this.renderTab()}
            </div>
        );
    }
}

export default connectRouter(PotentialCustomerDetails);
