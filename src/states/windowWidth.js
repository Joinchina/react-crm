const RENEW_WINDOW_WIDTH = "RENEW_WINDOW_WIDTH"

export default function windowWidth(state = 0, action){
  switch(action.type){
    case RENEW_WINDOW_WIDTH:
      state = action.newWidth
      break
    default:
      break
  }
  return state
}

export function renewWindowWidth(newWidth){
  return {type: RENEW_WINDOW_WIDTH, newWidth}
}
