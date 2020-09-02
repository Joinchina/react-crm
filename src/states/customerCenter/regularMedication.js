import { apiActionCreator, getHistoricalDrugs, getRegularMedication, postRegularMedication, deleteRegularMedication, getPatient, getOrdersByPatient  } from '../../api'
import { reduceAsyncAction, resetMiddleware } from '../../helpers/reducers';
const RENEW_FORM_DATA = 'customerCenter.regularMedication.renewFormData'
const POST_REGULAR = 'customerCenter.regularMedication.postRegularMedication'
const GET_REGULAR = 'customerCenter.regularMedication.getRegularMedication'
const DELETE_RECORD = 'customerCenter.regularMedication.deleteRegularMedication';
const GET_PATIENT = 'customerCenter.regularMedication.getPatient'
const GET_HISTORICAL_Drugs = 'customerCenter.regularMedication.getHistoricalDrugs'
const GET_PATIENT_DRUG_PROMPT = 'customerCenter.regularMedication.getPatientDrugPrompt'
const GET_PATIENT_ORDER = 'customerCenter.regularMedication.GET_PATIENT_ORDER'
const POST_REGULAR_DRUGS = 'customerCenter.regularMedication.POST_REGULAR_DRUGS'
const initialState = {
  formData:{},
  getPatientResult: {},
  postRegularMedicationResult:{},
  getRegularMedicationResult:{},
  getPatientOrderResult: {},
  editStatus: false
}

export default function customerDetailsRegular(state = initialState, action){
  if(action.type === RENEW_FORM_DATA){
    state = { ...state, formData: {...state.formData, ...action.fields} }
  }else if(action.type === POST_REGULAR){
    state = { ...state, postRegularMedicationResult: action }
  }else if(action.type === POST_REGULAR_DRUGS){
    state = { ...state, postRegularMedicationDrugsResult: action }
  }else if(action.type === GET_REGULAR){
    state = {...state,  getRegularMedicationResult:action}
  }else if(action.type === GET_PATIENT_ORDER){
    state = { ...state, getPatientOrderResult: action }
  }else if(action.type === DELETE_RECORD){
    state = { ...state, getDeleteResult: action }
  }else if(action.type === GET_PATIENT){
    state = { ...state, getPatientResult: action }
  }else if(action.type === GET_HISTORICAL_Drugs){
    state = { ...state, getHistoricalDrugsResult: action }
  }
  return state
}

export function renewFormDataAction(fields){
  return {type: RENEW_FORM_DATA, fields}
}

export const deleteRegularAction = apiActionCreator(DELETE_RECORD, deleteRegularMedication, { mapArgumentsToParams: (patientId, id)=>{ return {patientId, id}} })
export const postRegularMedicationAction = apiActionCreator(POST_REGULAR, postRegularMedication, { mapArgumentsToParams: (patientId, data)=>{ return {patientId, data}} })
export const postRegularMedicationDrugsAction = apiActionCreator(POST_REGULAR_DRUGS, postRegularMedication, { mapArgumentsToParams: (patientId, data)=>{ return {patientId, data}} })
export const getRegularMedicationAction = apiActionCreator(GET_REGULAR, getRegularMedication, { mapArgumentsToParams: (patientId)=>{ return {patientId}} })
export const getPatientAction = apiActionCreator(GET_PATIENT, getPatient, { mapArgumentsToParams: (patientId)=>{ return {patientId}} })
export const getHistoricalDrugsAction = apiActionCreator(GET_HISTORICAL_Drugs, getHistoricalDrugs, {mapArgumentsToParams: (patientId)=>{ return {patientId} } })
export const getPatientOrderAction = apiActionCreator(GET_PATIENT_ORDER,  async (ctx, patientId, ids) => {
  return await getOrdersByPatient(ctx, patientId, ids)
})
