const PERSONAL_HISTORY_FROM = "PersonalHistoryFrom"

export default function personalHistoryForm (state = {}, action) {
  switch (action.type) {
    case PERSONAL_HISTORY_FROM:
      state = { ...state, ...action.fields}
      break
    default:
      break
  }
  return state
}

export function renewPersonalHistoryForm (fields) {
  return { type: PERSONAL_HISTORY_FROM, fields }
}
