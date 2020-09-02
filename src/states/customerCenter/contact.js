import { apiActionCreator, getPatientContact, putPatientContact } from '../../api'

const RENEW_FORM_DATA = 'customerCenter.customerDetails.contact.renewFormData'
const PUT_CONTACT = 'customerCenter.customerDetails.contact.putContact'
const GET_CONTACT = 'customerCenter.customerDetails.contact.getContact'
const SET_EDIT_STATUS = 'customerCenter.customerDetails.contact.setEditStatus'

const initialState = {
  formData:{},
  putContactResult:{},
  getContactResult:{},
  editStatus: false
}

export default function customerDetailsContact(state = initialState, action){
  if(action.type === RENEW_FORM_DATA){
    state = { ...state, formData: {...state.formData, ...action.fields} }
  }else if(action.type === PUT_CONTACT){
    state = { ...state, putContactResult: action }
  }else if(action.type === GET_CONTACT){
    state = { ...state, getContactResult: action }
  }else if(action.type === SET_EDIT_STATUS){
    state = { ...state, editStatus: action.editStatus }
  }
  return state
}

export function setEditStatusAction(editStatus){
  return {type: SET_EDIT_STATUS, editStatus}
}

export function renewFormDataAction(fields){
  return {type: RENEW_FORM_DATA, fields}
}

export const putPatientContactAction = apiActionCreator(PUT_CONTACT, putPatientContact, { mapArgumentsToParams: (patientId, data)=>{ return {patientId, data} } })
export const getPatientContactAction = apiActionCreator(GET_CONTACT, getPatientContact, { mapArgumentsToParams: (patientId)=>{ return {patientId} } })
