const HEALTH_RECORDS_SIGN_FORM = "HEALTH_RECORDS_SIGN_FORM"

export default function healthRecordsSignForm (state = {}, action) {
  switch (action.type) {
    case HEALTH_RECORDS_SIGN_FORM:
      state = { ...state, ...action.fields}
      break
    default:
      break
  }
  return state
}

export function renewHealthRecordsSignForm (fields) {
  return { type: HEALTH_RECORDS_SIGN_FORM, fields }
}
