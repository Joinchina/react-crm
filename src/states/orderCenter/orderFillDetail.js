import { combineReducers, bindActionCreators } from 'redux'
import { connect as reduxConnect } from 'react-redux'
import { resetMiddleware } from '../../helpers/reducers';
import { apiActionCreator,
  getOrderFill as getOrderFillApi,
  getPatient
} from '../../api'

const ORDERFILL_DETAIL = 'orderCenter.getOrderFillDetail'
const RESET = 'orderCenter.getOrderFillDetail.RESET'


export default resetMiddleware(RESET)(combineReducers({
    orderFillDetail: (state = {}, action) => {
        switch (action.type) {
      		case ORDERFILL_DETAIL:
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

export const searchOrderDetail = apiActionCreator(ORDERFILL_DETAIL, async (ctx, orderId) => {
    const order = await getOrderFillApi(ctx, orderId);
    if (order.patient && order.patient.id) {
        const patient = await getPatient(ctx, order.patient.id);
        order.patient.info = patient;
    }
    return order;
});

export const resetOrderDetail = resetMiddleware.actionCreator(RESET);


export const connect = reduxConnect(
    state => ({
        ...state.orderCenter.orderFillDetail,
    }),
    dispatch => bindActionCreators({
        searchOrderDetail,
        resetOrderDetail,
    }, dispatch)
)
