const ESSENTIAL_INFO_FORM = "ESSENTIAL_INFO_FORM"
const CLEAR_ESSENTIAL_INFO_FORM = 'clear.essential.info.form'

export default function essentialInfoForm(state = {}, action){
  switch (action.type) {
    case ESSENTIAL_INFO_FORM:
      state = { ...state, ...action.fields}
      break
    case CLEAR_ESSENTIAL_INFO_FORM:
      state = {}
    default:
      break
  }
  return state
}

export function renewEssentialInfoForm (fields) {
  return {type: ESSENTIAL_INFO_FORM, fields}
}

export function clearEssentialInfoForm () {
  return {type: CLEAR_ESSENTIAL_INFO_FORM}
}
