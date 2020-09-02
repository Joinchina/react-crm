
import { apiActionCreator, getMedicine } from '../api'

const RESET_DRUGS = 'smartSelectForMedicine.RESET_DRUGS'
const SET_VALUE = 'smartSelectForMedicine.setValue'

export default function smartSelectForMedicine(state = {}, action){
  //console.log('smartSelectSingle action', action)
  switch(action.type){
    case SET_VALUE:
      let payload = state.payload ? state.payload : []
      if(action.params.skip == 0){
        payload = action.payload ? action.payload : []
      }else if(action.payload){
        payload = payload.concat(action.payload)
      }
      //noMore = action.status == 'fulfilled' && action.payload.length) ? true : state.noMore
      state = { ...action, payload}
      break
    case RESET_DRUGS:
      state = {}
      break
    default:
      break
  }
  return state
}

export const getMedicineAction = apiActionCreator(SET_VALUE, getMedicine, { mapArgumentsToParams: (keyWord, skip, limit, hospitalId, patientId)=>{ return {keyWord, skip, limit, hospitalId, patientId} } })
export const getThrottleMedicineAction = apiActionCreator(SET_VALUE, getMedicine, { throttle: 300, mapArgumentsToParams: (keyWord, skip, limit, hospitalId)=>{ return {keyWord, skip, limit, hospitalId} } })
export function resetDrugsAction(val) {
    return {
        type: RESET_DRUGS,
    }
}
