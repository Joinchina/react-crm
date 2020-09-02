const MEMBER_INFO_FORM = "MEMBER_INFO_FORM"
const RESET = 'memberInfoForm.reset'
import { resetMiddleware } from '../../helpers/reducers'

const memberInfoForm = function (state = {}, action) {
  switch (action.type) {
    case MEMBER_INFO_FORM:
      state = { ...state, ...action.fields}
      break
    case RESET:
      state = {}
      break
    default:
      break
  }
  return state
}

export default resetMiddleware(RESET)(memberInfoForm)

export const resetMemberInfoForm = resetMiddleware.actionCreator(RESET)

export function renewMemberInfoForm (fields) {
  return { type: MEMBER_INFO_FORM, fields }
}
