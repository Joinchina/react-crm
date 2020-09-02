import { combineReducers, bindActionCreators } from 'redux'
import { connect as reduxConnect } from 'react-redux'
import { createReducer, apiActionCreator as tablePageApiActionCreator } from '../../components/common/table-page';
import { apiActionCreator,
    getspareMoneyList,
} from '../../api'
import { resetMiddleware } from '../../helpers/reducers';

const SEARCH_SPAREMONEY = 'toolcase.spareMoneyList.SEARCH_SPAREMONEY'
const RESET = 'toolcase.spareMoneyList.reset';

export default resetMiddleware(RESET)(createReducer(SEARCH_SPAREMONEY));

export const searchSpareMoney = tablePageApiActionCreator(
    SEARCH_SPAREMONEY, getspareMoneyList
);

export const resetSpareMoney = resetMiddleware.actionCreator(RESET);

export const connect = reduxConnect(
    state => ({
        spareMoneyList: state.toolcase.spareMoneyList,
    }),
    dispatch => bindActionCreators({
        searchSpareMoney,
        resetSpareMoney,
    }, dispatch)
);
