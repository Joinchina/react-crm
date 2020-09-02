import { combineReducers, bindActionCreators } from 'redux';
import { connect as reduxConnect } from 'react-redux';
import { apiActionCreator, getVersion, postVersion } from '../api';

const GET_VERSION = 'version.GET_VERSION';
const SET_VISABLE = 'version.SET_VISABLE';
const UPDATE = 'version.update';


export default combineReducers({
    version: (state = {}, action) => {
        if(action.type === GET_VERSION) {
            state = {
                status: action.status,
                payload: action.payload,
            }
        }
        return state;
    },
    visible: (state = false, action) => {
        if(action.type === SET_VISABLE) {
            state = action.payload
        }
        return state;
    },
    updateStatus: (state = {}, action) => {
        if(action.type === UPDATE) {
            state = {
                status: action.status,
                payload: action.payload,
            }
        }
        return state;
    }
})

export const getVersionIns = apiActionCreator(GET_VERSION, getVersion)
export const updateVersion = apiActionCreator(UPDATE, postVersion)
export const setModalVisable = (val) => ({
    type: SET_VISABLE,
    payload: val,
})



export const connect = reduxConnect(
    state => ({
        version: state.version.version,
        visible: state.version.visible,
        updateStatus: state.version.updateStatus,
    }),
    dispatch => bindActionCreators({
        getVersionIns,
        setModalVisable,
        updateVersion,
    }, dispatch)
);
