const SET_VALUE = 'SmartSelectMultipleAsync.setValue'
import { apiActionCreator, callSmartComponentApi } from '../api'

export default function smartSelectMultiple(state = {}, action){
  //console.log('smartSelectSingle action', action)
  switch(action.type){
    case 'SmartSelectMultipleAsync.setValue':
      let temp = {}
      temp[action.params.resultId] = action.payload
      state = {...state, ...temp}
      break
    default:
      break
  }
  return state
}

export const getAsyncSmartSelectMultipleOptinsAction = apiActionCreator(SET_VALUE, callSmartComponentApi, { mapArgumentsToParams: (apiFuncName, resultId) => ({resultId}) })
