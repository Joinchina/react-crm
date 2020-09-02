import { combineReducers, bindActionCreators } from 'redux'
import { connect as reduxConnect } from 'react-redux'
import { apiActionCreator,
    getApplicationDetail,
} from '../../api'
import { resetMiddleware } from '../../helpers/reducers';

const SEARCH_APPLICATION_DETAIL = 'toolcase.applicationDetail.SEARCH_APPLICATION_DETAIL'
const RESET = 'toolcase.applicationDetail.RESET'

export default resetMiddleware(RESET)(combineReducers({
    applicationDetail: (state = {}, action) => {
        if(action.type === SEARCH_APPLICATION_DETAIL) {
            state = {
                status: action.status,
                payload: action.payload,
                params: action.params,
            }
        }
        return state
    }
}))

export const searchApplicationDetail = apiActionCreator(SEARCH_APPLICATION_DETAIL, getApplicationDetail)
export const resetApplicationDetail = resetMiddleware.actionCreator(RESET);

export const connect = reduxConnect(
    state => ({
        ...state.toolcase.applicationDetail,
    }),
    dispatch => bindActionCreators({
        searchApplicationDetail,
        resetApplicationDetail,
    }, dispatch)
)
