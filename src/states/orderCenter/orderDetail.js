import { combineReducers, bindActionCreators } from 'redux'
import { connect as reduxConnect } from 'react-redux'
import { message } from 'antd'
import { resetMiddleware } from '../../helpers/reducers';
import { apiActionCreator,
  getOrderDetails as getOrderDetailsApi,
  getPatient
} from '../../api'

const ORDERD_DETAIL = 'orderCenter.getOrderDetail'
const RESET = 'orderCenter.getOrderDetail.RESET'


export default resetMiddleware(RESET)(combineReducers({
    orderDetail: (state = {}, action) => {
        switch (action.type) {
      		case ORDERD_DETAIL:
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

export const searchOrderDetail = apiActionCreator(ORDERD_DETAIL, async (ctx, orderId) => {
    try{
        const order = await getOrderDetailsApi(ctx, orderId);
        if (order.patient && order.patient.id) {
            const patient = await getPatient(ctx, order.patient.id);
            order.patient.info = patient;
        }
        return order;
    }catch(e){
        message.error(e.message)
        console.log(e.message)
    }

});

export const resetOrderDetail = resetMiddleware.actionCreator(RESET);


export const connect = reduxConnect(
    state => ({
        ...state.orderCenter.orderDetail,
    }),
    dispatch => bindActionCreators({
        searchOrderDetail,
        resetOrderDetail,
    }, dispatch)
)
