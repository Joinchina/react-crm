const SET_MODAL_PAGE = 'app.header.setModalPage'
const defaultState = {
  modalPage: '',
  params: {}
}
export default function header(state = defaultState, action){
  switch(action.type){
    case SET_MODAL_PAGE:
      state = {...state, modalPage: action.modalPage, params: action.params}
      break
    default:
      break
  }
  return state
}

export function setModalPageAction(modalPage, params){
  return {type: SET_MODAL_PAGE, modalPage, params}
}
