import { getHospital, apiActionCreator, checkPhoneNo, checkIdCardNo, checkMemberCardNo,checkBusinessCode, postCustomerInfo, getDoctorsByHospitalId, checkContractNo, getPotentialCustome as getPotentialPatient, searchPatientCount, getDrugRequirements,getPatientContact } from '../../api'
import { resetMiddleware } from '../../helpers/reducers';

const RENEW_FORM_DATA = 'customerCenter.addCustomer.renewFormData'
const CHECK_PHONE_NO = 'customerCenter.addCustomer.checkPhoneNo'
const CHECK_IDCARD_NO = 'customerCenter.addCustomer.checkIdCard'
const CHECK_ACCOUNT_NO = 'customerCenter.addCustomer.checkMemberCardNo'
const CHECK_BUSSINESS_CODE = 'customerCenter.addCustomer.checkBusinessCode'
const CHECK_CONTRACT_NO = 'customerCenter.addCustomer.checkContractNo'
const POST_CUSTOMER_INFO = 'customerCenter.addCustomer.postCustomerInfo'
const GET_DOCTORS_BY_HOSPITAL_ID = 'customerCenter.addCustomer.getDoctorsByHospitalId'
const GET_POTENTIAL_PATIENT = 'customerCenter.addCustomer.getPotentialPatient'
const GET_HOSPITAL = 'customerCenter.addCustomer.getHospital'
const GET_PATIENT_COUNT = 'GET_PATIENT_COUNT'
const RESET = "customerCenter.addCustomer.reset"
const GET_DRUG_REQUIREMENTS = 'customerCenter.addCustomer.getDrugRequirements'
const GET_PATIENT_CONTACT = 'customerCenter.addCustomer.getPatientContact'

const initialState = {
  formData:{},
  postForm:{},
  doctors: {},
  getPotentialPatientResult: {},
  checkPhoneNoResult:{},
  checkContractNoResult: {},
  checkIdCardNoResult:{},
  checkMemberCardNoResult:{},
  checkBusinessCodeResult:{},
  checkPhoneNoResult:{},
  getHospitalResult:{},
  getDrugRequirements: {},
  getPatientContact: {},
}

export default resetMiddleware(RESET)((state = initialState, action) => {
  if(action.type === RENEW_FORM_DATA){
    state = { ...state, formData: {...state.formData, ...action.fields} }
  }else if(action.type === CHECK_PHONE_NO){
    state = { ...state, checkPhoneNoResult: action }
  }else if(action.type === CHECK_IDCARD_NO){
    state = { ...state, checkIdCardNoResult: action }
  }else if(action.type === CHECK_ACCOUNT_NO){
    state = { ...state, checkMemberCardNoResult: action }
  }else if(action.type === CHECK_BUSSINESS_CODE){
    state = { ...state, checkBusinessCodeResult: action }
  }else if(action.type === POST_CUSTOMER_INFO){
    state = { ...state, postForm: action }
  }else if(action.type === GET_DOCTORS_BY_HOSPITAL_ID){
    state = { ...state, doctors: action }
  }else if(action.type === CHECK_CONTRACT_NO){
    state = { ...state, checkContractNoResult: action }
  }else if(action.type === GET_POTENTIAL_PATIENT){
    state = { ...state, getPotentialPatientResult: action }
  }else if(action.type === GET_HOSPITAL){
    state = { ...state, getHospitalResult: action }
  }else if(action.type === GET_PATIENT_COUNT){
    state = { ...state, getPatientCount: action }
  }else if(action.type === GET_DRUG_REQUIREMENTS){
    state = {
        ...state,
        getDrugRequirements: {
            params: action.params,
            status: action.status,
            payload: action.status === 'pending' ? (state.getDrugRequirements && state.getDrugRequirements.payload) : action.payload,
        }
    }
  }else if(action.type === GET_PATIENT_CONTACT) {
    state = {
      ...state,
      getPatientContact: {
          params: action.params,
          status: action.status,
          payload: action.status === 'pending' ? (state.getPatientContact && state.getPatientContact.payload) : action.payload,
      }
    }
  }
  return state
});

export function resetAction() {
    return {
        type: RESET
    }
}

export function renewFormDataAction(fields){
  return {type: RENEW_FORM_DATA, fields}
}

export const checkContractNoAction = apiActionCreator(CHECK_CONTRACT_NO, checkContractNo, { mapArgumentsToParams: (contractNo)=>{ return {contractNo} } })
export const checkPhoneNumberAction = apiActionCreator(CHECK_PHONE_NO, checkPhoneNo, { mapArgumentsToParams: (phoneNumber)=>{ return {phoneNumber} } })
export const checkIdCardAction = apiActionCreator(CHECK_IDCARD_NO, checkIdCardNo, { mapArgumentsToParams: (IdCard)=>{ return {IdCard} } })
export const checkMemberCardNoAction = apiActionCreator(CHECK_ACCOUNT_NO, checkMemberCardNo, { mapArgumentsToParams: (accountNo)=>{ return {accountNo} } })
export const checkBusinessCodeAction = apiActionCreator(CHECK_BUSSINESS_CODE, checkBusinessCode, { mapArgumentsToParams: (bussinessCode)=>{ return {bussinessCode} } })
export const postCustomerInfoAction = apiActionCreator(POST_CUSTOMER_INFO, postCustomerInfo, { mapArgumentsToParams: (data, actionType)=>{ return {data, actionType} }})
export const getDoctorsByHospitalIdAction = apiActionCreator(GET_DOCTORS_BY_HOSPITAL_ID, getDoctorsByHospitalId, { mapArgumentsToParams: (hospitalId)=>{ return {hospitalId} }})
export const getPotentialPatientAction = apiActionCreator(GET_POTENTIAL_PATIENT, getPotentialPatient, { mapArgumentsToParams: (patientId)=>{ return {patientId} }})
export const getHospitalAction = apiActionCreator(GET_HOSPITAL, getHospital)
export const getPatientCountAction = apiActionCreator(GET_PATIENT_COUNT, async (ctx, ...args) => {
  return await searchPatientCount(ctx, ...args);
})
export const getDrugRequirementsAction = apiActionCreator(GET_DRUG_REQUIREMENTS, getDrugRequirements, { mapArgumentsToParams: (patientId, pageSize, pageNumber)=>{ return {patientId, pageSize, pageNumber}} })
export const getPatientContactsAction = apiActionCreator(GET_PATIENT_CONTACT, getPatientContact, { mapArgumentsToParams: (patientId)=>{ return {patientId} } })
