import {
    apiActionCreator,
    getPotentialCustome as getPotentialCustomeApi,
    getHealthRecords as getHealthRecordsApi,
    getDrugRequirements as getDrugRequirementsApi,
    getContacts as getContactsApi,
    getDrugRecord as getDrugRecordApi,
    putPatient as putPatientApi,
    putPotentialCustome as putPotentialCustomeApi,
    putPatientStatus as putPatientStatusApi,
    putHealthRecords as putHealthRecordsApi,
    checkPhoneNumber, checkIdCardNo, checkAccountNo, checkMemberCard,
    getPotentialCustomMatching as getPotentialCustomMatchingApi,
    getDoctorsByHospitalId,
    getHospital,
    getPatient as getPatientApi,
    getIntegal,
} from '../../api';
import { resetMiddleware } from '../../helpers/reducers';

const CUSTOMER_DETAILS = 'CUSTOMER_DETAILS';
const UPDATE_CUSTOMER_DETAILS = 'UPDATE_CUSTOMER_DETAILS';
const CHECK_PHONE_NUMBER = 'customerCenter.customerDetails.checkPhoneNumber';
const CHECK_IDCARD = 'customerCenter.customerDetails.checkIdCard';
const CHECK_ACCOUNT_NO = 'customerCenter.customerDetails.checkAccountNo';
const CHECK_MEMBER_CARD = 'customerCenter.customerDetails.checkMemberCard';
const MATCHING = 'customerCenter.customerDetails.matching';
const GET_DOCTORS_BY_HOSPITAL_ID = 'customerCenter.customerDetails.getDoctorsByHospitalId';
const RESET = 'customerCenter.customerDetails.reset';
const GET_HOSPITAL = 'GET_HOSPITAL'
const GET_PATIENT = 'GET_PATIENT';
const GET_INTEGAL = 'GET_INTEGAL'
const customerDetails = (state = {}, action) => {
    switch (action.type) {
    case CUSTOMER_DETAILS:
        return {
            ...state, status: action.status, result: action.payload, customerDetailData: action,
        };
    case UPDATE_CUSTOMER_DETAILS:
        return {
            ...state, updateState: action.status, updateResult: action.payload, postResult: action,
        };
    case CHECK_PHONE_NUMBER:
        return { ...state, checkPhoneNumber: action };
    case CHECK_IDCARD:
        return { ...state, checkIdCard: action };
    case CHECK_ACCOUNT_NO:
        return { ...state, checkAccountNo: action };
    case CHECK_MEMBER_CARD:
        return { ...state, checkMemberCard: action };
    case MATCHING:
        return { ...state, matchingStatus: action.status, matchingResult: action.payload };
    case GET_DOCTORS_BY_HOSPITAL_ID:
        return { ...state, doctors: action };
    case RESET:
        return {};
    case GET_HOSPITAL:
        return { ...state, getHospitalStatus: action.status, getHospitalResult: action }
    case GET_PATIENT:
        return { ...state, getPatientResult: action };
    case GET_INTEGAL:
        return { ...state, getIntegal: action };
    default:
        return state;
    }
};

export default resetMiddleware(RESET)(customerDetails);

export const resetCustomerDetails = resetMiddleware.actionCreator(RESET);

export function patientAction(id) {
    return apiActionCreator(CUSTOMER_DETAILS,
        getPatientApi)(id);
}

export function potentialCustomeAction(id) {
    return apiActionCreator(CUSTOMER_DETAILS,
        getPotentialCustomeApi)(id);
}

export function healthRecordsAction(id) {
    return apiActionCreator(CUSTOMER_DETAILS,
        getHealthRecordsApi)(id);
}

export function drugRequirementsAction(skip, limit, customerId) {
    return apiActionCreator(CUSTOMER_DETAILS,
        getDrugRequirementsApi)(skip, limit, customerId);
}

export function contactsAction(customerId) {
    return apiActionCreator(CUSTOMER_DETAILS,
        getContactsApi)(customerId);
}

export function drugRecordAction(skip, limit, customerId, baseDrugId) {
    return apiActionCreator(CUSTOMER_DETAILS,
        getDrugRecordApi)(skip, limit, customerId, baseDrugId);
}

export function updatePatientAction(id, data) {
    return apiActionCreator(UPDATE_CUSTOMER_DETAILS,
        putPatientApi)(id, data);
}

export function updatePotentialCustomeAction(id, data) {
    return apiActionCreator(UPDATE_CUSTOMER_DETAILS,
        putPotentialCustomeApi)(id, data);
}

export function updatePatientStatusAction(id, data) {
    return apiActionCreator(UPDATE_CUSTOMER_DETAILS,
        putPatientStatusApi)(id, data);
}


export function updateHealthRecordsAction(id, data) {
    return apiActionCreator(UPDATE_CUSTOMER_DETAILS,
        putHealthRecordsApi)(id, data);
}

export function potentialCustomMatchingAction(id, params) {
    return apiActionCreator(MATCHING,
        getPotentialCustomMatchingApi)(id, params);
}

export const checkPhoneNumberAction = apiActionCreator(
    CHECK_PHONE_NUMBER,
    checkPhoneNumber,
    { mapArgumentsToParams: phoneNumber => ({ phoneNumber }) },
);

export const checkIdCardAction = apiActionCreator(
    CHECK_IDCARD,
    checkIdCardNo,
    { mapArgumentsToParams: IdCard => ({ IdCard }) },
);

export const getPatientAction = apiActionCreator(
    GET_PATIENT,
    getPatientApi,
    { mapArgumentsToParams: patientId => ({ patientId }) },
);

export const checkAccountNoAction = apiActionCreator(
    CHECK_ACCOUNT_NO,
    checkAccountNo,
    { mapArgumentsToParams: accountNo => ({ accountNo }) },
);

export const checkMemberCardAction = apiActionCreator(
    CHECK_MEMBER_CARD,
    checkMemberCard,
    { mapArgumentsToParams: memberCard => ({ memberCard }) },
);

export const getHospitalAction = apiActionCreator(GET_HOSPITAL, getHospital);

export const getDoctorsByHospitalIdAction = apiActionCreator(
    GET_DOCTORS_BY_HOSPITAL_ID,
    getDoctorsByHospitalId,
    { mapArgumentsToParams: hospitalId => ({ hospitalId }) },
);

export const getIntegalAction = apiActionCreator(
    GET_INTEGAL,
    getIntegal,
    { mapArgumentsToParams: patientId => ({ patientId }) },
)
