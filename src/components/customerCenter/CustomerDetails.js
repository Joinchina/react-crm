import React from 'react';
import { Row } from 'antd';
import { connectRouter } from '../../mixins/router';
import { connect as connectModal } from '../../mixins/modal';
import Title from '../common/Title';
/* eslint-disable-next-line import/no-cycle */
import NavigatorBreadcrumb from '../common/NavigatorBreadcrumb';
import HasPermission from '../common/HasPermission';
import EssentialInfor from './customerDetails/EssentialInfor';
import './customer.css';
import MemberInfor from './customerDetails/MemberInfor';
import MedicationOrder from './customerDetails/MedicationOrder';
import MedicationDemand from './customerDetails/MedicationDemand';
import MedicationRecord from './customerDetails/MedicationRecord';
import Contacts from './customerDetails/Contacts';
import HealthRecords from './customerDetails/HealthRecords';
import memoize from 'memoize-one';
import createHealthRecordComponents from './customerDetails/CreateHealthRecords';
import EditLog from './customerDetails/EditLog';
import BaseComponent from '../BaseComponent';
import CommunicationRecord from './customerDetails/CommunicationRecord';
import PhysicalRecord from './customerDetails/PhysicalRecord';
import RegularMedication from './customerDetails/RegularMedication';
import ReceiptInfo from './customerDetails/ReceiptInfo';
import ReserveRecord from './customerDetails/ReserveRecord';
import IntegralRecord from './customerDetails/IntegralRecord'
import { connect as reduxConnect } from '../../states/customerCenter/customerTabs';
import CreateOrderImg from '../../images/hearderMenuRegist.png';
import ReserveImg from '../../images/yuyue.png';
import InsuranceImg from '../../images/patientInsurance.png';
import IconCreateCCVDCheck from '../../images/createCCVDCheck.png';
import newQuestionnairePreCheckImg from '../../images/newQuestionnairePreCheck.png';
import LocaleProvider from '@wanhu/antd-legacy/lib/locale-provider';
import zh_CN from '@wanhu/antd-legacy/lib/locale-provider/zh_CN';
import api from '../../api/api';

const styles = {
    span: {
        fontWeight: 'normal',
        color: 'inherit',
        marginRight: 20,
    },
    breadcrumb: {
        width: 150,
        float: 'left',
    },
    linkImgArea: {
        width: 200,
        float: 'left',
    },
    linkImg: {
        width: 15,
        height: 15,
        marginRight: 10,
        verticalAlign: 'middle',
        cursor: 'pointer',
    },
};
@connectModal
class CustomerDetails extends BaseComponent {
    constructor(props) {
        super(props);
        this.customerId = this.props.match.params.customerId;
        this.tab = this.props.match.params.tab || 'EssentialInfor';
        this.state = {
            CCVDserviceList: [],
            preCheckserviceList: [],
            tabsMap: [
                { label: '基本信息', key: 'EssentialInfor' },
                { label: '预约记录', key: 'ReserveRecord' },
                { label: '用药订单', key: 'MedicationOrder' },
                { label: '用药需求', key: 'MedicationDemand' },
                { label: '联系人', key: 'Contacts' },
                // { label: '健康档案', key: 'HealthRecords' },
                // { label: '体检记录', key: 'PhysicalRecord' },
                { label: '会员日志', key: 'EditLog' },
                { label: '沟通记录', key: 'CommunicationRecord' },
                { label: '收件信息', key: 'ReceiptInfo' },
                { label: '会员信息', key: 'MemberInfor' },
                { label: '健康档案', key: 'CreateHealthRecords' },
                { label: '积分记录', key: 'IntegralRecord' },
            ],
        };
    }

    async componentWillMount() {
        this.props.getPatientAction(this.customerId);
        this.props.getRegularAction(this.customerId);
        const isService = await api.checkIsService(this.customerId);
        //校验是否有心脑血管疾病评估服务
        const CCVDserviceList = [...isService].filter(item => {
            const pro = item.products.filter(pro => pro.insuranceProductType === 3);
            return pro && pro.length > 0;
        });
        //校验是否有定制体检评估服务
        const preCheckserviceList = [...isService].filter(item => {
            const pro = item.products.filter(pro => pro.insuranceProductType === 2 && pro.needEvaluate == 1);
            return pro && pro.length > 0;
        });
        this.setState({ CCVDserviceList, preCheckserviceList });
    }

    componentWillUnmount() {
        this.props.resetTabsAction();
    }

    componentWillReceiveProps(nextProps) {
        const nextTab = nextProps.match.params.tab || 'EssentialInfor';
        if (this.customerId !== nextProps.match.params.customerId) {
            this.customerId = nextProps.match.params.customerId;
            this.tab = nextTab;
        } else if (this.tab !== nextTab) {
            this.tab = nextTab;
        }
        const { tabsMap } = this.state;
        if (this.props.patientDetail.status !== 'fulfilled' && nextProps.patientDetail.status === 'fulfilled') {
            const { isEstimatedPickup } = nextProps.patientDetail.payload;
            const arr = this.state.tabsMap;
            if (isEstimatedPickup) {
                if (!arr.some(o => o.key === 'RegularMedication')) {
                    const idx = arr.length - 1;
                    arr.splice(idx, 0, { label: '规律订药', key: 'RegularMedication' });
                    this.setState({ tabsMap: arr });
                }
            } else {
                if (nextTab === 'RegularMedication') {
                    this.props.router.set(
                        {
                            query: { r: this.props.router.query.r },
                            path: `/customerDetails/${this.customerId}/EssentialInfor`,
                        }, {
                        reset: true, replace: true,
                    },
                    );
                }
                if (arr.some(o => o.key === 'RegularMedication')) {
                    let index;
                    this.state.tabsMap.forEach((o, i) => {
                        if (o.key === 'RegularMedication') {
                            index = i;
                        }
                    });
                    this.setState({
                        tabsMap: [
                            ...tabsMap.slice(0, index),
                            ...tabsMap.slice(index + 1),
                        ],
                    });
                }
            }
        }
        // this.renderTab();
    }

    getHealthRecordComponents = memoize(createHealthRecordComponents);

    renderTab(Main, Print) {
        const props = { ...this.props, customerId: this.customerId, source: 'customerDetails' };
        switch (this.tab) {
            case 'EssentialInfor':
                return <EssentialInfor {...props} />;
            case 'ReserveRecord':
                return <ReserveRecord {...props} />;
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
            case 'PhysicalRecord':
                return <PhysicalRecord {...props} />;
            case 'EditLog':
                return <EditLog {...props} />;
            case 'CommunicationRecord':
                return <CommunicationRecord {...props} />;
            case 'RegularMedication':
                return <RegularMedication {...props} />;
            case 'ReceiptInfo':
                return <ReceiptInfo {...props} />;
            case 'CreateHealthRecords':
                return <div>
                    <LocaleProvider locale={zh_CN}>
                        <Main {...props} />
                    </LocaleProvider>
                    <Print {...props} />
                </div>;
            case 'IntegralRecord':
                return <IntegralRecord {...props} />
            default:
                return null;
        }
    }


    openTab(tab) {
        this.props.getPatientAction(this.customerId);
        this.props.getRegularAction(this.customerId);
        if (tab.key === 'CommunicationRecord') {
            this.props.router.set(
                {
                    query: { r: this.props.router.query.r, p: this.props.router.query.p },
                    path: `/customerDetails/${this.customerId}/${tab.key}`,
                }, {
                reset: true, replace: true,
            },
            );
            return;
        }
        this.props.router.set(
            {
                query: { r: this.props.router.query.r },
                path: `/customerDetails/${this.customerId}/${tab.key}`,
            }, {
            reset: true, replace: true,
        },
        );
    }

    get returnBack() {
        if (this.props.router.query.r && this.props.router.query.r.indexOf('/customerCenter') === 0) {
            return this.props.router.query.r;
        }
        return '/customerCenter';
    }

    render() {
        const { openModal } = this.props;
        const { preCheckserviceList, CCVDserviceList } = this.state;
        const patientId = this.customerId;
        let Save, PrintBar, Main, Print;
        if (this.tab === 'CreateHealthRecords') {
            const healthRecord = this.getHealthRecordComponents(this.customerId);
            Save = healthRecord.Save;
            PrintBar = healthRecord.PrintBar;
            Main = healthRecord.Main;
            Print = healthRecord.Print;
        }

        const defaultNavigateStack = [
            { label: '会员管理', url: '/customerCenter' },
            { label: '会员详情' },
        ];

        const { patientDetail } = this.props;
        let signStatus;
        if (patientDetail.status === 'fulfilled') {
            signStatus = patientDetail.payload.signStatus;
        }
        return (
            <div>
                <Row>
                    <NavigatorBreadcrumb
                        className="breadcrumb-box"
                        defaultNavigateStack={defaultNavigateStack}
                        style={styles.breadcrumb}
                    />
                    {
                        signStatus && signStatus !== 0 ? (
                            <div style={styles.linkImgArea}>
                                {/* eslint-disable */}
                                {/* jsx-a11y/click-events-have-key-events */}
                                <HasPermission match="order.edit">
                                    <img src={CreateOrderImg} style={styles.linkImg} onClick={() => openModal('createOrder', patientId)} alt="登记用药" title="登记用药" />
                                </HasPermission>
                                <HasPermission match="patient.edit">
                                    <img src={ReserveImg} style={styles.linkImg} onClick={() => openModal('addCustomerReserve', patientId)} alt="新建会员预约" title="新建会员预约" />
                                </HasPermission>
                                {/* <HasPermission match="insurance.edit">
                                    <img src={InsuranceImg} style={styles.linkImg} onClick={() => openModal('newPatientInsurance', patientId)} alt="登记会员服务" title="登记会员服务" />
                                </HasPermission> */}
                                {CCVDserviceList && CCVDserviceList.length > 0 ?
                                    <HasPermission match="patient.edit">
                                        <img src={IconCreateCCVDCheck} style={styles.linkImg} onClick={() => openModal('createCCVDCheck', patientId)} alt="新建心脑血管评估" title="新建心脑血管评估" />
                                    </HasPermission>
                                    : null}
                                {preCheckserviceList && preCheckserviceList.length > 0 ?
                                    <HasPermission match="patient.edit">
                                        <img src={newQuestionnairePreCheckImg} style={styles.linkImg} onClick={() => openModal('newQuestionnairePreCheck', patientId)} alt="新建定制体检评估" title="新建定制体检评估" />
                                    </HasPermission>
                                    : null}

                            </div>
                        ) : null
                    }
                </Row>
                <Title left={10}>
                    <div className="nav">
                        {this.state.tabsMap.map((tab, i) => (
                            <span style={styles.span} key={tab.key || i}>
                                {/* eslint-disable-next-line */}
                                <a className={this.tab === tab.key ? 'current' : null} onClick={() => this.openTab(tab)}>
                                    {tab.label}
                                </a>
                            </span>
                        ))}
                        {
                            this.tab === 'CreateHealthRecords'
                                ? (
                                    <span style={{ marginRight: 20 }}>
                                        <Save />
                                        <PrintBar />
                                    </span>
                                )
                                : null
                        }
                    </div>
                </Title>
                {
                    this.tab === 'CreateHealthRecords' ? this.renderTab(Main, Print) : this.renderTab()
                }
            </div>
        );
    }
}

export default connectRouter(reduxConnect(CustomerDetails));
