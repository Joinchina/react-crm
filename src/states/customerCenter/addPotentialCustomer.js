import { apiActionCreator, getHospital, checkPhoneNumber, checkIdCard, checkAccountNo, postPotentialCustomerInfo, checkPotentialMatching } from '../../api'

const RENEW_FORM_DATA = 'customerCenter.addPotentialCustomer.renewFormData'
const CHECK_PHONE_NUMBER = 'customerCenter.addPotentialCustomer.checkPhoneNumber'
const CHECK_IDCARD = 'customerCenter.addPotentialCustomer.checkIdCard'
const CHECK_ACCOUNT_NO = 'customerCenter.addPotentialCustomer.checkAccountNo'
const CHECK_POTENTIAL_MATCHING = 'customerCenter.addPotentialCustomer.checkPotentialMatching'
const POST_CUSTOMER_INFO = 'customerCenter.addPotentialCustomer.postCustomerInfo'
const GET_HOSPITAL = 'customerCenter.addPotentialCustomer.getHospital'


const initialState = {
  formData:{},
  postForm:{},
  checkPhoneNumber:{},
  checkPotentialMatchingResult:{},
  getHospitalResult: {}
}

export default function addPotentialCustomer(state = initialState, action){
  if(action.type === RENEW_FORM_DATA){
    state = { ...state, formData: {...state.formData, ...action.fields} }
  }else if(action.type === CHECK_PHONE_NUMBER){
    state = { ...state, checkPhoneNumber: action }
  }else if(action.type === CHECK_IDCARD){
    state = { ...state, checkIdCard: action }
  }else if(action.type === CHECK_ACCOUNT_NO){
    state = { ...state, checkAccountNo: action }
  }else if(action.type === POST_CUSTOMER_INFO){
    state = { ...state, postForm: action }
  }else if(action.type === CHECK_POTENTIAL_MATCHING){
    state = { ...state, checkPotentialMatchingResult: action }
  }else if(action.type === GET_HOSPITAL){
    state = { ...state, getHospitalResult: action }
  }
  return state
}

export function renewFormDataAction(fields){
  return {type: RENEW_FORM_DATA, fields}
}

export const checkPhoneNumberAction = apiActionCreator(CHECK_PHONE_NUMBER, checkPhoneNumber, { mapArgumentsToParams: (phoneNumber)=>{ return {phoneNumber} }})
export const checkIdCardAction = apiActionCreator(CHECK_IDCARD, checkIdCard, { mapArgumentsToParams: (IdCard)=>{ return {IdCard} }})
export const checkAccountNoAction = apiActionCreator(CHECK_ACCOUNT_NO, checkAccountNo, { mapArgumentsToParams: (accountNo)=>{ return {accountNo} }})
export const postPotentialCustomerInfoAction = apiActionCreator(POST_CUSTOMER_INFO, postPotentialCustomerInfo, { mapArgumentsToParams: (data, actionType, isRenew)=>{ return {data, actionType, isRenew} }})
export const checkPotentialMatchingAction= apiActionCreator(CHECK_POTENTIAL_MATCHING, checkPotentialMatching, { mapArgumentsToParams: (params)=>{ return {params} }})
export const getHospitalAction = apiActionCreator(GET_HOSPITAL, getHospital)