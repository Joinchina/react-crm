import { combineReducers, bindActionCreators } from 'redux';
import { connect as reduxConnect } from 'react-redux'
import { createReducer, apiActionCreator} from '../../components/common/table-page';
import { resetMiddleware } from '../../helpers/reducers';
import { reduceAsyncAction } from '../../helpers/reduceAsyncAction';
import { getReservation as getReservationApi,
    operateReservation as operateReservationApi, uploadActionCreator} from '../../api'

const SEARCH_CUSTOMER = 'reservationRecord.reservation.searchOrder';
const RESET = 'reservationRecord.reservation.reset';
const OPERATE_RESERVATION = 'reservationRecord.reservation.operatereservation';
const UPDATE_IMPORT_STATUS = 'reservationRecord.reservation.UPDATE_IMPORT_STATUS';

export default resetMiddleware(RESET)(combineReducers({
    reservationList: createReducer(SEARCH_CUSTOMER),
    importResult: reduceAsyncAction(UPDATE_IMPORT_STATUS),
    // operateReservation(state = {}, action) {
    //     if (action.type === OPERATE_RESERVATION) {
    //         state = {
    //             status: action.status,
    //         };
    //     }
    //     return state;
    // },
}));

export const searchReservationList = apiActionCreator(
    SEARCH_CUSTOMER, async (ctx, where, skip, limit) => {
        return await getReservationApi(ctx, where, skip, limit)
    }
);

export const operateReservationAction = apiActionCreator(
    OPERATE_RESERVATION, async (ctx, id,updateStatus,str) => {
        return await operateReservationApi(ctx, id,updateStatus );
    }
);
export const updateImportStatus = uploadActionCreator(UPDATE_IMPORT_STATUS);
export const resetReservationList = resetMiddleware.actionCreator(RESET);
export const connect = reduxConnect(
    state => ({
        reservationList: state.reservationRecord.reservationList,
        importResult:state.reservationRecord.importResult,
    }),
    dispatch => bindActionCreators({
        searchReservationList,
        resetReservationList,
        operateReservationAction,
        updateImportStatus,
    }, dispatch)
)
