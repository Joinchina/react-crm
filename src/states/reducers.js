import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';
import mount from '@wanhu/react-redux-mount';
import header from './header';
import navMenu from './navMenu';
import home from './home';
import auth from './auth';
import searchForm from './searchForm';
import smartSelectSingle from './smartSelectSingle';
import smartSelectMultiple from './smartSelectMultiple';
import smartCascaderTerritory from './smartCascaderTerritory';
import smartSelectBoxForInsurance from './smartSelectBoxForInsurance';
import smartSelectForMedicine from './smartSelectForMedicine';
import orderCenter from './orderCenter';
import customerDetailsContact from './customerCenter/contact';
import customerDetailsDrug from './customerCenter/medicineRequirment';
import customerDetailsRegular from './customerCenter/regularMedication';
import customerList from './customerCenter/customer';
import potentialCustomer from './customerCenter/potentialCustomer';
import customerDetails from './customerCenter/customerDetails';
import essentialInfoForm from './customerCenter/essentialInfoForm';
import memberInfoForm from './customerCenter/memberInfoForm';
import addCustomer from './customerCenter/addCustomer';
import addPotentialCustomer from './customerCenter/addPotentialCustomer';
import addMedicineRegister from './customerCenter/addMedicineRegister';
import customerLog from './customerCenter/customerLog';
import debuggerReducerProxy from '../debugger/state';
import userConfigure from './configure';
import customerDetailsMedicalRecord from './customerCenter/medicalRecord';
import taskCenter from './taskCenter';
import components from './components';
import toolcase from './toolcase';
import version from './version';
import mountReducer from './mount';
import communicationRecord from './customerCenter/communicationRecord';
import integralRecord from './customerCenter/integralRecord';
import communicationDetail from './customerCenter/newCommunicationRecord';
import physicalRecord from './customerCenter/physicalRecord';
import physicalRecordDetail from './customerCenter/physicalRecordDetail';
import newPhysicalRecordModal from './customerCenter/newPhysicalRecordModal';
import customerTabs from './customerCenter/customerTabs';
import reservationRecord from './reservationRecord/reservation';
import reservationDetails from './reservationRecord/reservationDetails';
import message from './message';
import insurance from './insurance';
import pointOrder from './pointOrder';
import check from './check';

mount.routerRoot = 'routerReducer';

export default debuggerReducerProxy(combineReducers({
    auth,
    header,
    home,
    navMenu,
    routerReducer,
    searchForm,
    smartSelectSingle,
    smartSelectMultiple,
    smartCascaderTerritory,
    smartSelectBoxForInsurance,
    smartSelectForMedicine,
    orderCenter,
    customerList,
    addCustomer,
    addPotentialCustomer,
    addMedicineRegister,
    potentialCustomer,
    customerDetails,
    customerDetailsContact,
    customerDetailsDrug,
    customerDetailsRegular,
    essentialInfoForm,
    memberInfoForm,
    userConfigure,
    taskCenter,
    components,
    customerDetailsMedicalRecord,
    toolcase,
    version,
    customerLog,
    communicationRecord,
    integralRecord,
    communicationDetail,
    physicalRecord,
    physicalRecordDetail,
    newPhysicalRecordModal,
    customerTabs,
    reservationRecord,
    reservationDetails,
    message,
    insurance,
    pointOrder,
    check,
    ...mountReducer,
}));
