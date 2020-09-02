const FAMILY_HISTORY_FROM = "FamilyHistoryFrom"

export default function familyHistoryForm (state = {}, action) {
  switch (action.type) {
    case FAMILY_HISTORY_FROM:
      state = { ...state, ...action.fields}
      break
    default:
      break
  }
  return state
}

export function renewFamilyHistoryForm (fields) {
  return { type: FAMILY_HISTORY_FROM, fields }
}
