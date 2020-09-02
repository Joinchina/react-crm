import { apiActionCreator, getDrugRequirements, postDrugRequirements, getPatient, getPotentialCustome as getPotentialPatient  } from '../../api'

const RENEW_FORM_DATA = 'customerCenter.customerDetails.medicineRequirment.renewFormData'
const POST_DRUG = 'customerCenter.customerDetails.medicineRequirment.postDrugRequirements'
const GET_DRUG = 'customerCenter.customerDetails.medicineRequirment.getDrugRequirements'
const GET_FORMAL_PATIENT = 'customerCenter.customerDetails.medicineRequirment.getFormalPatient'
const GET_POTENTIAL_PATIENT = 'customerCenter.customerDetails.medicineRequirment.getPotentialPatient'
const SET_EDIT_STATUS = 'customerCenter.customerDetails.medicineRequirment.setEditStatus'

const initialState = {
  formData:{},
  postDrugResult:{},
  getDrugResult:{},
  getFormalPatientResult:{},
  getPotentialPatientResult:{},
  editStatus: false
}

export default function customerDetailsContact(state = initialState, action){
  if(action.type === RENEW_FORM_DATA){
    state = { ...state, formData: {...state.formData, ...action.fields} }
  }else if(action.type === POST_DRUG){
    state = { ...state, postDrugResult: action }
  }else if(action.type === GET_DRUG){
    state = {
        ...state, 
        getDrugResult: {
            params: action.params,
            status: action.status,
            payload: action.status === 'pending' ? (state.getDrugResult && state.getDrugResult.payload) : action.payload,
        } 
    }
  }else if(action.type === SET_EDIT_STATUS){
    state = { ...state, editStatus: action.editStatus }
  }else if(action.type === GET_POTENTIAL_PATIENT){
    state = { ...state, getPotentialPatientResult: action }
  }else if(action.type === GET_FORMAL_PATIENT){
    state = { ...state, getFormalPatientResult: action }
  }
  return state
}

export function setEditStatusAction(editStatus){
  return {type: SET_EDIT_STATUS, editStatus}
}

export function renewFormDataAction(fields){
  return {type: RENEW_FORM_DATA, fields}
}

export const postDrugAction = apiActionCreator(POST_DRUG, postDrugRequirements, { mapArgumentsToParams: (patientId, data)=>{ return {patientId, data}} })
export const getDrugAction = apiActionCreator(GET_DRUG, getDrugRequirements, { mapArgumentsToParams: (patientId, pageSize, pageNumber)=>{ return {patientId, pageSize, pageNumber}} })
export const getPotentialPatientAction = apiActionCreator(GET_POTENTIAL_PATIENT, getPotentialPatient, { mapArgumentsToParams: (patientId)=>{ return {patientId}} })
export const getPatientAction = apiActionCreator(GET_FORMAL_PATIENT, getPatient, { mapArgumentsToParams: (patientId)=>{ return {patientId}} })
