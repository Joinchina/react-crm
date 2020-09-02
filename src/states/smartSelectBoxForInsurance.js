const SET_VALUE = 'smartSelectBoxForInsurance.setValue'
import { apiActionCreator, getInsurance } from '../api'

export default function smartSelectBoxForInsurance(state = {}, action){
  //console.log('smartSelectSingle action', action)
  switch(action.type){
    case SET_VALUE:
      state = { buttonOptions: action.payload }
      break
    default:
      break
  }
  return state
}

export const getButtonOptionsAction = apiActionCreator(SET_VALUE, getInsurance)
