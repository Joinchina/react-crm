import { combineReducers, bindActionCreators } from 'redux'
import { connect as reduxConnect } from 'react-redux'
import { createReducer, apiActionCreator as tablePageApiActionCreator } from '../../components/common/table-page';
import { apiActionCreator,
    uploadActionCreator,
    getFrozen as getFrozenApi,
    deleteFrozen as deleteFrozenApi
} from '../../api';
import { reduceAsyncAction } from '../../helpers/reduceAsyncAction';
import { resetMiddleware } from '../../helpers/reducers';


const SEARCH_FROZEN = 'taskCenter.frozenList.SEARCH_FROZEN';
const DELETE_FROZEN = 'taskCenter.frozenList.DELETE_FROZEN';
const UPDATE_IMPORT_STATUS = 'taskCenter.frozenList.UPDATE_IMPORT_STATUS';
const RESET = 'taskCenter.frozenList.reset';

export default combineReducers({
    frozenList: resetMiddleware(RESET)(createReducer(SEARCH_FROZEN)),
    deleteStatus: reduceAsyncAction(DELETE_FROZEN),
    importResult: reduceAsyncAction(UPDATE_IMPORT_STATUS),
});

export const searchFrozen = tablePageApiActionCreator(SEARCH_FROZEN, getFrozenApi);
export const deleteFrozen = apiActionCreator(DELETE_FROZEN, deleteFrozenApi);
export const updateImportStatus = uploadActionCreator(UPDATE_IMPORT_STATUS);
export const resetFrozen = resetMiddleware.actionCreator(RESET);

export const connect = reduxConnect(
    state => state.taskCenter.frozenList,
    dispatch => bindActionCreators({
        searchFrozen,
        deleteFrozen,
        updateImportStatus,
        resetFrozen
    }, dispatch)
);
