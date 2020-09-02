import { combineReducers, bindActionCreators } from 'redux'
import { connect as reduxConnect } from 'react-redux'
import { createReducer, apiActionCreator as tablePageApiActionCreator } from '../../components/common/table-page';
import { apiActionCreator,
    getAccountConfiguration,
    deleteAccountConfiguration,
} from '../../api'
import { resetMiddleware } from '../../helpers/reducers';

const SEARCH_ACCOUNT = 'configure.account.SEARCH_ACCOUNT';
const DELETE_ACCOUNT = 'configure.account.DELETE_ACCOUNT';
const RESET = 'configure.account.reset';

export default resetMiddleware(RESET)(combineReducers({
    account: createReducer(SEARCH_ACCOUNT),
    deleteStatus(state = {}, action) {
        if(action.type === DELETE_ACCOUNT) {
            state = {
                status: action.status,
                payload: action.payload,
            };
        }
        return state
    }
}));

export const searchAccount = tablePageApiActionCreator(SEARCH_ACCOUNT, getAccountConfiguration);
export const deleteAccount = apiActionCreator(DELETE_ACCOUNT, deleteAccountConfiguration)
export const resetAccount = resetMiddleware.actionCreator(RESET);

export const connect = reduxConnect(
    state => ({
        ...state.userConfigure.account,
    }),
    dispatch => bindActionCreators({
        searchAccount,
        deleteAccount,
        resetAccount,
    }, dispatch)
);
