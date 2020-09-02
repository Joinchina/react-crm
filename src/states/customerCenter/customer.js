import { combineReducers, bindActionCreators } from 'redux';
import { connect as reduxConnect } from 'react-redux'
import { createReducer, apiActionCreator} from '../../components/common/table-page';
import { resetMiddleware } from '../../helpers/reducers';

import { getCustomer as getCustomerApi, getLevel as getLevelApi } from '../../api'

const SEARCH_CUSTOMER = 'customerCenter.customer.searchOrder'
const RESET = 'customerCenter.customer.reset'
const GET_LEVEL = 'customerCenter.customer.getLevel'

export default resetMiddleware(RESET)(combineReducers({
    customerList: createReducer(SEARCH_CUSTOMER),
    levelList: createReducer(GET_LEVEL)
}));

export const searchCustomerList = apiActionCreator(
    SEARCH_CUSTOMER, async (ctx, where, skip, limit) => {
        return await getCustomerApi(ctx, where, skip, limit, 0, [{ createDate: "desc" }])
    }
);
export const getLevelList = apiActionCreator(
    GET_LEVEL, async (ctx) => {
        return await getLevelApi(ctx)
    }
)
export const resetCustomerList = resetMiddleware.actionCreator(RESET);

export const connect = reduxConnect(
    state => ({
        customerList: state.customerList.customerList,
        levelList: state.customerList.levelList
    }),
    dispatch => bindActionCreators({
        searchCustomerList,
        resetCustomerList,
        getLevelList,
    }, dispatch)
)
