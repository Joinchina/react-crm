import { combineReducers, bindActionCreators } from 'redux';
import { connect as reduxConnect } from 'react-redux'
import { createReducer, apiActionCreator} from '../../components/common/table-page';
import { resetMiddleware } from '../../helpers/reducers';
import { reduceAsyncAction } from '../../helpers/reduceAsyncAction';
import { uploadActionCreator,
    getPotentialCustomer } from '../../api'

const SEARCH_POTENTIAL_CUSTOMER = 'customerCenter.potentialCustomer.SEARCH_POTENTIAL_CUSTOMER'
const RESET = 'customerCenter.potentialCustomer.reset'
const UPDATE_IMPORT_STATUS = 'customerCenter.potentialCustomer.UPDATE_IMPORT_STATUS';

  export default resetMiddleware(RESET)(combineReducers({
      potentialCustomerList: createReducer(SEARCH_POTENTIAL_CUSTOMER),
      importResult: reduceAsyncAction(UPDATE_IMPORT_STATUS),
  }));

export const searchPotentialCustomerList = apiActionCreator(
    SEARCH_POTENTIAL_CUSTOMER, getPotentialCustomer
);
export const resetpotentialCustomerList = resetMiddleware.actionCreator(RESET);
export const updateImportStatus = uploadActionCreator(UPDATE_IMPORT_STATUS);

  export const connect = reduxConnect(
      state => state.potentialCustomer,
      dispatch => bindActionCreators({
          searchPotentialCustomerList,
          resetpotentialCustomerList,
          updateImportStatus,
      }, dispatch)
  )
