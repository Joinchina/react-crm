import { combineReducers, bindActionCreators } from 'redux'
import { connect as reduxConnect } from 'react-redux'
import { resetMiddleware } from '../../helpers/reducers';
import { apiActionCreator,
  getReservationDetail as getReservationApi,
} from '../../api'

const RESERVATION_DETAIL = 'reservationDetails.getDetail'
const RESET = 'reservationDetails.RESET'


export default resetMiddleware(RESET)(combineReducers({
    reservationDetail: (state = {}, action) => {
        switch (action.type) {
              case RESERVATION_DETAIL:
                return {
                    status: action.status,
                    payload: action.payload,
                    params: action.params,
                }
            default:
                return state
        }
    }

}))

export const searchReservationDetail = apiActionCreator(RESERVATION_DETAIL, async (ctx, id) => {
    const r = await getReservationApi(ctx, id);
    return r;
});

export const resetReservationDetail = resetMiddleware.actionCreator(RESET);


export const connect = reduxConnect(
    state => ({
        ...state.reservationDetails        
    }),
    dispatch => bindActionCreators({
        searchReservationDetail,
        resetReservationDetail,
    }, dispatch)
)
