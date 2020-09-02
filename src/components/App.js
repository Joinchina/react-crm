import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route } from 'react-router-dom';
import { ConnectedRouter } from 'react-router-redux';
import { Modal } from 'antd';
import UserFeedButton from '@wanhu/user-feed';
import propTypes from '../helpers/prop-types';
import history from '../history';
import { setMenuExpanded } from '../states/navMenu';
import { getUserInfo } from '../states/auth';

import AsyncEvent from './common/AsyncEvent';
import QueryRoute from './common/QueryRoute';
import Menu from './menu/Menu';
import Header from './header/Header';
import CreateUserGroup from './configure/createGroup';
import NewTaskPool from './taskCenter/newTaskPool';
import QuickActivation from './taskCenter/quickActivation';
import NewFrozen from './taskCenter/newFrozen';
import NewAccount from './configure/newAccount';
import NewSpareMoney from './toolcase/newspareMoney';

import AddCustomer from './customerCenter/AddCustomer';
import AddPotentialCustomer from './customerCenter/AddPotentialCustomer';
import CreateOrder from './customerCenter/CreateOrder';
import OrderResult from './customerCenter/OrderResult';
import NewCommunicationRecord from './customerCenter/customerDetails/NewCommunicationRecord';
import NewPhysicalRecordModal from './customerCenter/customerDetails/PhysicalRecord/NewPhysicalRecordModal';
import AddCustomerReserve from './customerCenter/reservationCenter/AddCustomerReserve';
import OrderRefundModal from './orderCenter/orderRefundModal';
import CreatGroupInsurance from './insurance/GroupInsurance/CreatGroupInsurance';
import CreatePatientInsurance from './insurance/PatientInsurance/CreatePatientInsurance';
import PatientInsuranceResult from './insurance/PatientInsurance/PatientInsuranceResult';
import VersionComponent from './versionIns';
import MessageCenter from './message/messageCenter';

import CreateCCVDCheck from './checkList/CreateCCVDCheck';
import CreateCCVDCheckResult from './checkList/CreateCCVDCheckResult';

import NewQuestionnairePreCheck from './checkList/NewQuestionnairePreCheck';
import NewQuestionnairePreCheckResult from './checkList/NewQuestionnairePreCheckResult';

import InsurancePackagePage from './insurance_package_page';

import routes from '../routes';
import HasPermission, { Permissions, testPermission } from './common/HasPermission';
import BaiduTongji from './common/BaiduTongji';

const headerHeight = 60;
const menuWidth = 90;

const menuExpandWidth = 1280;

const styles = {
    appWrapper: {
        minWidth: 1000,
    },
    header: {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: headerHeight,
        backgroundColor: 'white',
        borderBottom: '1px solid #d6d9dd',
        zIndex: 1000,
    },
    nav: {
        position: 'fixed',
        top: 60,
        left: 0,
        width: menuWidth,
        bottom: 0,
        borderRight: '1px solid #d6d9dd',
        zIndex: 9,
        backgroundColor: 'white',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
    },
    navWide: {
        position: 'fixed',
        top: 60,
        left: 0,
        width: 240,
        bottom: 0,
        borderRight: '1px solid #d6d9dd',
        zIndex: 9,
        backgroundColor: 'white',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
    },
    scroller: {
        width: 270,
        overflowY: 'scroll',
        overflowX: 'hidden',
        height: '100%',
    },
    scrollerNarrow: {
        width: 120,
        overflowY: 'scroll',
        overflowX: 'hidden',
        height: '100%',
    },
    content: {
        padding: 20,
        paddingTop: 20 + headerHeight,
        marginLeft: menuWidth,
        paddingBottom: 59,
    },
    contentNarrow: {
        padding: 20,
        paddingTop: 20 + headerHeight,
        marginLeft: 240,
        paddingBottom: 59,
    },
    logo: {
        display: 'block-inline',

    },
    search: {
        display: 'block-inline',

    },
    moreMenu: {
        display: 'block-inline',

    },
    version: {
        cursor: 'pointer',
        padding: '10px 20px',
        width: 240,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        height: 61,
        position: 'absolute',
        bottom: 20,
        zIndex: 10000,
        borderTop: '1px solid #eee',
        backgroundColor: 'white',
    },
    versionNarrow: {
        cursor: 'pointer',
        padding: '10px 20px',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        width: 90,
        height: 61,
        position: 'absolute',
        bottom: 20,
        zIndex: 10000,
        borderTop: '1px solid #eee',
        backgroundColor: 'white',
    },
};


class App extends Component {
    static propTypes = {
        getUserInfo: propTypes.func.isRequired,
        rightPanelWidth: propTypes.number,
        expanded: propTypes.bool,
        setMenuExpanded: propTypes.func.isRequired,
        auth: propTypes.asyncResult(propTypes.shape({
            permissions: propTypes.shape({
                list: propTypes.array.isRequired,
                map: propTypes.object.isRequired,
            }),
        })).isRequired,
    };

    static defaultProps = {
        rightPanelWidth: 0,
        expanded: false,
    };

    componentWillMount() {
        const { getUserInfo } = this.props;
        this.resize();
        window.onresize = this.resize;
        getUserInfo();
    }

    componentDidUpdate(prevProps) {
        const { rightPanelWidth } = this.props;
        if (rightPanelWidth !== prevProps.rightPanelWidth) {
            this.resize();
        }
    }

    componentWillUnmount() {
        if (window.onresize === this.resize) {
            window.onresize = null;
        }
    }

    getUserInfoError = (err) => {
        Modal.error({
            title: '错误',
            content: err.status === 401 ? err.message : '获取用户信息失败，请重新登录',
            onOk() {
                window.location.href = '/user/logout';
            },
        });
    }

    resize = () => {
        const { rightPanelWidth = 0, expanded, setMenuExpanded } = this.props;
        const width = document.body.clientWidth - rightPanelWidth;
        if (width > menuExpandWidth && !expanded) {
            setMenuExpanded(true);
        } else if (width <= menuExpandWidth && expanded) {
            setMenuExpanded(false);
        }
    };

    renderRoutes() {
        const { auth } = this.props;
        const { permissions } = auth.payload;

        function* renderRoutesRec(routes) {
            for (const r of routes) {
                if (r.component) {
                    if (r.props) {
                        const Component = r.component;
                        if (testPermission(r.permission, permissions)) {
                            yield <Route
                                key={r.id}
                                path={r.path}
                                exact={r.exact}
                                render={() => <Component {...r.props} />}
                            />;
                        }
                    } else if (testPermission(r.permission, permissions)) {
                        yield <Route
                            key={r.id}
                            path={r.path}
                            exact={r.exact}
                            component={r.component}
                        />;
                    }
                }
                if (r.children) {
                    yield* renderRoutesRec(r.children);
                }
            }
        }

        return Array.from(renderRoutesRec(routes));
    }
    render() {
        const { auth, expanded, rightPanelWidth } = this.props;
        if (auth.status !== 'fulfilled') {
            return (
                <div>
                    <AsyncEvent async={auth} onReject={this.getUserInfoError} />
                </div>
            );
        }
        const contentStyle = {
            ...expanded ? styles.contentNarrow : styles.content,
            marginRight: rightPanelWidth || 0,
        };
        if(window.location.pathname === '/InsurancePackagePage'){
            return (
                <Permissions permissions={auth.payload.permissions}>
                    <ConnectedRouter history={history}>
                        <Route path='/InsurancePackagePage' component={InsurancePackagePage} />
                    </ConnectedRouter>
                </Permissions>
            )
        }
        return (
            <Permissions permissions={auth.payload.permissions}>
                <ConnectedRouter history={history}>
                    <div style={styles.appWrapper}>
                        <UserFeedButton />
                        <header style={styles.header}>
                            <Route render={({ location, match, history }) => (
                                <Header
                                    height={headerHeight}
                                    location={location}
                                    match={match}
                                    history={history}
                                />
                            )}
                            />
                        </header>
                        <nav style={expanded ? styles.navWide : styles.nav}>
                            <div style={expanded ? styles.scroller : styles.scrollerNarrow}>
                                <Route>
                                    {({ location }) => (
                                        <Menu
                                            style={{ flex: 1 }}
                                            location={location}
                                        />
                                    )}
                                </Route>
                                <VersionComponent
                                    style={expanded ? styles.version : styles.versionNarrow}
                                />
                            </div>
                        </nav>
                        <div style={contentStyle}>
                            <BaiduTongji />
                            { this.renderRoutes(routes) }
                            <HasPermission match="crm.task_pool.edit">
                                <QueryRoute query={{ modal: 'newTaskPool' }} component={NewTaskPool} />
                            </HasPermission>
                            <HasPermission match="crm.task.admin">
                                <QueryRoute query={{ modal: 'quickActivation' }} component={QuickActivation} />
                            </HasPermission>
                            <HasPermission match="crm.admin">
                                <QueryRoute query={{ modal: 'userGroup' }} component={CreateUserGroup} />
                            </HasPermission>
                            <HasPermission match="crm.admin">
                                <QueryRoute query={{ modal: 'newFrozen' }} component={NewFrozen} />
                            </HasPermission>
                            <HasPermission match="order.edit">
                                <QueryRoute query={{ modal: 'createOrder' }} component={CreateOrder} />
                            </HasPermission>
                            <HasPermission match="patient.edit">
                                <QueryRoute query={{ modal: 'addCustomer' }} component={AddCustomer} />
                            </HasPermission>
                            <HasPermission match="patient.edit">
                                <QueryRoute query={{ modal: 'addPotentialCustomer' }} component={AddPotentialCustomer} />
                            </HasPermission>
                            <HasPermission match="order.edit">
                                <QueryRoute query={{ modal: 'orderResult' }} component={OrderResult} />
                            </HasPermission>
                            <HasPermission match="crm.admin">
                                <QueryRoute query={{ modal: 'newAccount' }} component={NewAccount} />
                            </HasPermission>
                            <HasPermission match="billing.h_account.edit">
                                <QueryRoute query={{ modal: 'newSpareMoney' }} component={NewSpareMoney} />
                            </HasPermission>
                            <HasPermission match="order.edit">
                                <QueryRoute query={{ modal: 'orderRefundModal' }} component={OrderRefundModal} />
                            </HasPermission>
                            <HasPermission match="patient.edit">
                                <QueryRoute query={{ modal: 'newCommunicationRecord' }} component={NewCommunicationRecord} />
                            </HasPermission>
                            <HasPermission match="patient.edit">
                                <QueryRoute query={{ modal: 'newPhysicalRecord' }} component={NewPhysicalRecordModal} />
                            </HasPermission>
                            <HasPermission match="patient.edit">
                                <QueryRoute query={{ modal: 'addCustomerReserve' }} component={AddCustomerReserve} />
                            </HasPermission>
                            <HasPermission match="groupInsurance.edit">
                                <QueryRoute query={{ modal: 'newGroupInsurance' }} component={CreatGroupInsurance} />
                            </HasPermission>
                            <HasPermission match="insurance.edit">
                                <QueryRoute query={{ modal: 'newPatientInsurance' }} component={CreatePatientInsurance} />
                            </HasPermission>
                            <HasPermission match="insurance.edit">
                                <QueryRoute query={{ modal: 'patientInsuranceResult' }} component={PatientInsuranceResult} />
                            </HasPermission>
                            <HasPermission match="patient.edit">
                                <QueryRoute query={{ modal: 'createCCVDCheck' }} component={CreateCCVDCheck} />
                            </HasPermission>
                            <HasPermission match="patient.edit">
                                <QueryRoute query={{ modal: 'createCCVDCheckResult' }} component={CreateCCVDCheckResult} />
                            </HasPermission>
                            <HasPermission match="patient.edit">
                                <QueryRoute query={{ modal: 'newQuestionnairePreCheck' }} component={NewQuestionnairePreCheck} />
                            </HasPermission>
                            <HasPermission match="patient.edit">
                                <QueryRoute query={{ modal: 'newQuestionnairePreCheckResult' }} component={NewQuestionnairePreCheckResult} />
                            </HasPermission>
                            <QueryRoute query={{ modal: 'MessageCenter' }} component={MessageCenter} />
                        </div>
                    </div>
                </ConnectedRouter>
            </Permissions>
        );
    }
}

function select(state) {
    return {
        expanded: state.navMenu.expanded,
        rightPanelWidth: state.navMenu.rightPanelWidth,
        auth: state.auth,
    };
}

function mapDispachToProps(dispatch) {
    return bindActionCreators({ setMenuExpanded, getUserInfo }, dispatch);
}

export default connect(select, mapDispachToProps)(App);
