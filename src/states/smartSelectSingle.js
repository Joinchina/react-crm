const SET_VALUE = 'SmartSelectSingleAsync.setValue'
import { apiActionCreator, callSmartComponentApi } from '../api'

export default function smartSelectSingle(state = {}, action){
  //console.log('smartSelectSingle action', action)
  let tempObj = {}
  switch(action.type){
    case SET_VALUE:
      tempObj = {}
      tempObj[action.params.requestId] = action
      state = {...state, ...tempObj}
      break
    default:
      break
  }
  return state
}

export const getAsyncSmartSelectSingleOptinsAction = apiActionCreator(SET_VALUE, callSmartComponentApi, { mapArgumentsToParams: (apiFuncName, requestId, keyWord) => ({requestId, keyWord}) })
export const getAsyncThrottleSmartSelectSingleOptinsAction = apiActionCreator(SET_VALUE, callSmartComponentApi, { throttle: 300, mapArgumentsToParams: (apiFuncName, requestId, keyWord) => ({requestId, keyWord}) })
