import { combineReducers } from 'redux';
import groupInsurances from './groupInsuranceList';
import createPatientInsurance from './createPatientInsurance';
import insuranceOrderList from './insuranceOrderList';
import insuranceInfo from './insuranceInfo';
import revokeOrderInfo from './revokeOrderInfo';
import insuranceOrderInfo from './insuranceOrderInfo';

export default combineReducers({
    groupInsurances,
    createPatientInsurance,
    insuranceOrderList,
    insuranceInfo,
    revokeOrderInfo,
    insuranceOrderInfo
})
