import pathToRegexp from 'path-to-regexp';

import Home from './components/home/Home'
import OrderCenter from './components/orderCenter/Order'
import HisOrderCenter from './components/orderCenter/HisOrder'
import OrderDetails from './components/orderCenter/OrderDetails'
import CustomerCenter from './components/customerCenter/Customer'
import CustomerDetails from './components/customerCenter/CustomerDetails'
import PotentialCustomer from './components/customerCenter/PotentialCustomer'
import PotentialCustomerDetails from './components/customerCenter/PotentialCustomerDetails'
import UsersConfigure from './components/configure/UsersConfigure'
import TaskList from './components/taskCenter/taskList';
import TaskPoolList from './components/taskCenter/taskPoolList';
import TaskPoolDetail from './components/taskCenter/taskPoolDetail';
import NewTask from './components/taskCenter/newTask';
import TaskDetail from './components/taskCenter/taskDetail';
import FrozenList from './components/taskCenter/frozenList';
import Account from './components/configure/account';
import SpareMoneyList from './components/toolcase/spareMoneyList';
import SpareMoneyDetail from './components/toolcase/spareMoneyDetail';
import ApplicationDetail from './components/toolcase/spareMoneyDetail/applicationDetail';
import IncomeList from './components/toolcase/Income';
import WeixinBind from './components/weixin/bind';
import PhysicalRecordDetail from './components/customerCenter/customerDetails/PhysicalRecord/PhysicalRecordDetail';
import ReservationCenter from './components/customerCenter/reservationCenter';
import ReservationDetail from './components/customerCenter/reservationCenter/ReservationDetail';
import OrderFill from './components/orderCenter/orderFill';
import OrderFillDetails from './components/orderCenter/orderFill/OrderFillDetails';
import GroupInsurance  from './components/insurance/GroupInsurance/GroupInsuranceList';
import GroupInsuranceInfo  from './components/insurance//GroupInsurance/GroupInsuranceInfo';
import InsuranceOrderList  from './components/insurance/InsuranceOrder/InsuranceOrderList';
import InsuranceOrderList2  from './components/insurance/InsuranceOrder2'; // 保险订单列表
import InsuranceOrderDetail  from './components/insurance/InsuranceOrder/InsuranceOrderDetail';
import InsuranceOrderInfo  from './components/insurance/InsuranceOrder/InsuranceOrderInfo';
import RevokeOrderInfo from './components/insurance/InsuranceOrder/RevokeOrderInfo'
import PointOrderList from './components/PointOrderCenter/PointOrderList'
import PointOrderDetail from './components/PointOrderCenter/PointOrderDetail'
import ActiveCodeList from './components/insurance/activeCode/activelist'
//体检卡
import MedicalCard from './components/medical/cardGroup/index'
import MedicalCardEnd from './components/medical/endGroup/index'
// 健康管理中心
import Healthy from './components/healthy/index'

export default generateRoute([
    {
        label: '首页',
        icon: 'icon-home',
        path: '/',
        exact: true,
        component: Home,
    },
    {
        label: '订单中心',
        labelShort: '订单',
        icon: 'icon-order',
        permission: 'order.view',
        children: [
            {
                label: '用药订单管理', path: '/orderCenter', permission: 'order.view', component: OrderCenter,
                children: [
                    { name: "订单详情", path: '/orderDetails/:orderId', permission: 'order.view', component: OrderDetails },
                ]
            },
            {
                label: 'HIS处方管理', path: '/hisOrderCenter', permission: 'order.view', component: HisOrderCenter,
            },
            {
                label: '包裹单管理', path: '/orderfills', permission: 'order.view', component: OrderFill,
                children: [
                    { name: "包裹单详情", path: '/orderfillDetails/:orderfillId', permission: 'order.view', component: OrderFillDetails },
                ]
            },
            {
                label: '积分兑换订单', path: '/pointOrders', permission: 'point.order.view', component: PointOrderList,
                children: [
                    { name: "订单详情", path: '/pointOrderDetail/:pointOrderId', permission: 'point.order.view', component: PointOrderDetail },
                ]
            },
        ]
    },

    {
        label: '会员中心',
        labelShort: '会员',
        icon: 'icon-client',
        permission: 'patient.view',
        children: [
            {
                label: '会员管理', path: '/customerCenter', component: CustomerCenter,
                permission: 'patient.view',
                children: [
                    { name: '会员详情', path: '/customerDetails/:customerId/:tab?', component: CustomerDetails },
                    { name: '订单详情', path: '/customerOrderDetails/:orderId/', component: OrderDetails },
                    { name: '体检表详情', path: '/physicalRecordDetail/:customerId/:orderId', component: PhysicalRecordDetail },
                ]
            },
            {
                label: '会员预约管理', path: '/customerReservationManagement', component: ReservationCenter,
                permission: 'patient.view',
                children: [
                    { name: '预约详情', path: '/reservationDetails/:reservationId', component: ReservationDetail },
                ]
            },
            {
                label: '话务资料管理', path: '/potentialCustomer', component: PotentialCustomer,
                permission: 'patient.view',
                children: [
                    { path: '/potentialCustomerDetails/:customerId/:tab', component: PotentialCustomerDetails },
                ]
            },
        ]
    },
    {
        label: '会员服务中心',
        labelShort: '会员服务',
        icon: 'icon-insurance',
        permission: { $any: ['groupInsurance.view', 'insurance.view','insurance:activation:codes'] },
        children: [
            {
                label: '投保单管理', path: '/groupInsurance', permission: 'groupInsurance.view', component: GroupInsurance,
                children: [
                    { name: "团体保险单详情", path: '/groupInsuranceDetail/:insuranceId', permission: 'groupInsurance.view', component: GroupInsuranceInfo },
                ]
            },{
                label: '会员服务管理', path: '/patientInsurance', permission: 'insurance.view', component: InsuranceOrderList,
                children: [
                    {
                         name: "团险个单详情", path: '/patientInsuranceDetail/:insuranceId', permission: 'insurance.view', component: InsuranceOrderDetail
                    },
                    {
                         name: "退款单详情", path: '/patientRevokeOrderDetail/:insuranceId', permission: 'insurance.view', component: RevokeOrderInfo
                    },
                    {
                         name: "保险单详情", path: '/patientInsuranceOrderInfo/:insuranceId', permission: 'insurance.view', component: InsuranceOrderInfo
                    }
                 ]
            },
            {
                label: '激活码管理', path: '/ActiveCodeList', permission: 'insurance:activation:codes', component: ActiveCodeList,
            },
            {
                label: '保险订单列表', path: '/InsuranceOrderList2', permission: 'insurance.view', component: InsuranceOrderList2,
            },

        ]
    },
    {
        label: '体检中心',
        labelShort: '体检',
        icon: 'icon-insurance',
        permission: { $any: ['hd:medicalexaminationcard:reportview', 'hd:medicalexaminationcard:view'] },
        children: [
            {
                label: '体检卡管理', path: '/medicalcard', permission: 'hd:medicalexaminationcard:view', component: MedicalCard,
            },
            {
                label: '体检结果管理', path: '/medicalcardend', permission: 'hd:medicalexaminationcard:reportview', component: MedicalCardEnd,
            }
        ]
    },
    {
        label: '健康中心',
        labelShort: '健康',
        icon: 'icon-client',
        permission:{$any: ['crm.task.view', 'crm.task_pool.view', 'crm.admin']},
        children: [
            { label: '健康中心', path: '/healthy', permission: {$any: ['crm.task.view', 'crm.task_pool.view', 'crm.admin']}, component: Healthy },
        ]
    },
    {
        label: '任务中心',
        labelShort: '任务',
        icon: 'icon-task',
        permission: { $any: ['crm.task.view', 'crm.task_pool.view', 'crm.admin'] },
        children: [
            {
                label: '任务管理', path: '/taskList', component: TaskList,
                permission: 'crm.task.view',
                children: [
                    { name: '新建任务', path: '/newtask/:tab?', permission: 'crm.task.view', component: NewTask },
                    { name: '任务详情', path: '/taskDetail/:taskId/:tab?', permission: 'crm.task.view', component: TaskDetail },
                    { name: '任务池详情', path: '/taskPool/:taskPoolId/task/:taskId', permission: 'crm.task.view', component: TaskDetail },
                    { name: '订单详情', path: '/taskOrderDetails/:orderId/', component: OrderDetails },
                ]
            },
            {
                label: '任务池管理', path: '/taskPoolList', component: TaskPoolList,
                permission: 'crm.task_pool.view',
                children: [
                    { path: '/taskPoolDetail/:taskPoolId', permission: 'crm.task_pool.view', component: TaskPoolDetail },
                ]
            },
            {
                label: '冻结管理',
                path: '/frozenList',
                permission: 'crm.admin',
                component: FrozenList
            },
        ]
    },
    {
        label: '业务工具',
        labelShort: '业务',
        icon: 'icon-toolcase',
        permission: { $any: [ 'billing.h_account.view', 'billing.inout.view', 'billing.inout.export'] },
        children: [
            {
                label: '备用金管理', path: '/spareMoneyList', permission: 'billing.h_account.view', component: SpareMoneyList,
                children: [
                    { path: '/spareMoneyDetail/:hospitalAccountId/:tab?', permission: 'billing.h_account.view', component: SpareMoneyDetail },
                    { path: '/applicationDetail/:hospitalAccountId/:depositId', permission: 'billing.h_account.view', component: ApplicationDetail},
                ]
            },
            {
                label: '收入管理', path: '/incomeList', permission: { $any: [ 'billing.inout.view', 'billing.inout.export'] }, component: IncomeList,
            },
        ]
    },
    {
        label: '配置中心',
        labelShort: '配置',
        icon: 'icon-configure',
        permission: 'crm.admin',
        children: [
            { label: '账号配置', path: '/account', permission: 'crm.admin', component: Account },
            { label: '用户组配置', path: '/usersConfigure', permission: 'crm.admin', component: UsersConfigure },
        ]
    },

    {
        path: '/weixin/bind',
        name: '绑定微信号',
        exact: true,
        component: WeixinBind,
        props: {
            bindWeixin: true
        }
    },
]);

let id;
function generateUniqueId(){
    id = (id || 0) + 1;
    return `${id}`;
}

function generateRoute(routes){
    return routes.map(r => ({
        ...r,
        id: generateUniqueId(),
        pathMatcher: r.path && pathToRegexp(r.path, [], { end: r.exact }),
        children: r.children && generateRoute(r.children),
    }));
}
