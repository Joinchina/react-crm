import { apiActionCreator, putPersonalHistory, getDisease } from '../../api'

const RENEW_FORM_DATA = 'customerCenter.customerDetails.contact.renewFormData'
const PUT_PERSONALHISTORY = 'customerCenter.customerDetails.personalHistory.putPersonalHistory'
const SET_EDIT_STATUS = 'customerCenter.customerDetails.personalHistory.setEditStatus'
const GET_DISEASE = 'customerCenter.customerDetails.personalHistory.getDisease'

const initialState = {
  formData: {},
  personalHistoryResult: {},
  diseasesResult: {},
  editStatus: false
}

export default function customerDetailsPersonalHistory(state = initialState, action){
  if(action.type === RENEW_FORM_DATA){
    state = { ...state, formData: {...state.formData, ...action.fields} }
  }else if(action.type === PUT_PERSONALHISTORY){
    state = { ...state, personalHistoryResult: action }
  }else if(action.type === SET_EDIT_STATUS){
    state = { ...state, editStatus: action.editStatus }
  }else if(action.type === GET_DISEASE){
    state = { ...state, diseasesResult: action }
  }
  return state
}

export function setEditStatusAction(editStatus){
  return {type: SET_EDIT_STATUS, editStatus}
}

export const putPersonalHistoryAction = apiActionCreator(PUT_PERSONALHISTORY, putPersonalHistory, { mapArgumentsToParams: (patientId, data)=>{ return {patientId, data} } })

export function getDiseaseAction () {
  return apiActionCreator(GET_DISEASE, getDisease)()
}
