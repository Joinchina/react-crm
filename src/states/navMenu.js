const SET_MENU_EXPANDED = 'SET_MENU_EXPANDED';
const SET_RIGHT_PANEL_WIDTH = 'navMenu.SET_RIGHT_PANEL_WIDTH';

export default function reduceNavMenu(state = {}, action) {
    if (action.type === SET_MENU_EXPANDED) {
        state = { 
            ...state,
            expanded: action.payload
        };
    }
    if (action.type === SET_RIGHT_PANEL_WIDTH) {
        state = {
            ...state,
            rightPanelWidth: action.payload
        }
    }
    return state;
}

export function setMenuExpanded(isExpanded) {
    return {
        type: SET_MENU_EXPANDED,
        payload: isExpanded
    };
}

export function setRightPanelWidth(width) {
    return {
        type: SET_RIGHT_PANEL_WIDTH,
        payload: width
    };
}
