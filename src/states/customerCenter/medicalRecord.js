import { apiActionCreator, getHealthRecords, putHealthRecords, getPatient, getUserInfo, getPotentialCustome as getPotentialPatient ,getChronicDisease, getGrading} from '../../api'

const RENEW_FORM_DATA = 'customerCenter.customerDetails.medicalRecord.renewFormData'
const PUT_MEDICAL_RECORD = 'customerCenter.customerDetails.medicalRecord.putMedicalRecord'
const GET_MEDICAL_RECORD = 'customerCenter.customerDetails.medicalRecord.getMedicalRecord'
const SET_EDIT_STATUS = 'customerCenter.customerDetails.medicalRecord.setEditStatus'
const GET_POTENTIAL_PATIENT = 'customerCenter.customerDetails.medicalRecord.getPotentialPatient'
const GET_FORMAL_PATIENT = 'customerCenter.customerDetails.medicalRecord.getFormalPatient'
const GET_USER_INFO = 'GET_USER_INFO'
const GET_CHRONIC_DISEASE = 'GET_CHRONIC_DISEASE'
const GET_CHRONIC_DISEASE_GRADING = 'GET_CHRONIC_DISEASE_GRADING'
const initialState = {
  formData:{},
  putMedicalRecordResult:{},
  getMedicalRecordResult:{},
  getFormalPatientResult:{},
  getPotentialPatientResult:{},
  editStatus: false
}

export default function customerDetailsMedicalRecord(state = initialState, action){
  if(action.type === RENEW_FORM_DATA){
    state = { ...state, formData: {...state.formData, ...action.fields} }
  }else if(action.type === PUT_MEDICAL_RECORD){
    state = { ...state, putMedicalRecordResult: action }
  }else if(action.type === GET_MEDICAL_RECORD){
    state = { ...state, getMedicalRecordResult: action }
  }else if(action.type === SET_EDIT_STATUS){
    state = { ...state, editStatus: action.editStatus }
  }else if(action.type === GET_POTENTIAL_PATIENT){
    state = { ...state, getPotentialPatientResult: action }
  }else if(action.type === GET_FORMAL_PATIENT){
    state = { ...state, getFormalPatientResult: action }
  }else if(action.type === GET_USER_INFO){
    state = { ...state, getUserInfoResult: action }
  }else if(action.type === GET_CHRONIC_DISEASE){
    state = { ...state, getChronicDiseaseResult: action }
  }else if(action.type === GET_CHRONIC_DISEASE_GRADING){
    state = { ...state, getGradingResult: action }
  }
  return state
}

export function setEditStatusAction(editStatus){
  return {type: SET_EDIT_STATUS, editStatus}
}

export function renewFormDataAction(fields){
  return {type: RENEW_FORM_DATA, fields}
}

export const getUserInfoAction = apiActionCreator(GET_USER_INFO, async (ctx, ...args) => {
  const r = await getUserInfo(ctx, ...args);
  return {
      ...r,
  };
})

export const putMedicalRecord = apiActionCreator(PUT_MEDICAL_RECORD, putHealthRecords, { mapArgumentsToParams: (patientId, data)=>{ return {patientId, data} } })
export const getMedicalRecord = apiActionCreator(GET_MEDICAL_RECORD, getHealthRecords, { mapArgumentsToParams: (patientId)=>{ return {patientId} } })
export const getPotentialPatientAction = apiActionCreator(GET_POTENTIAL_PATIENT, getPotentialPatient, { mapArgumentsToParams: (patientId)=>{ return {patientId}} })
export const getFormalPatientAction = apiActionCreator(GET_FORMAL_PATIENT, getPatient, { mapArgumentsToParams: (patientId)=>{ return {patientId}} })
export const getChronicDiseaseAction = apiActionCreator(GET_CHRONIC_DISEASE, getChronicDisease, { mapArgumentsToParams: (diseaseId)=>{ return {diseaseId} } })
export const getGradingAction = apiActionCreator(GET_CHRONIC_DISEASE_GRADING, getGrading, { mapArgumentsToParams: (chronicDiseaseId)=>{ return {chronicDiseaseId} } })
