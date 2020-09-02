import { combineReducers, bindActionCreators } from 'redux'
import { connect as reduxConnect } from 'react-redux'
import { createReducer, apiActionCreator as tablePageApiActionCreator } from '../../components/common/table-page';
import { apiActionCreator, getMessageList, getMessageCount,
    readMessage, deleteMessage } from '../../api'
import { resetMiddleware } from '../../helpers/reducers';

const SEARCH_MESSAGE = 'message.messageCenter.SEARCH_MESSAGE'
const RESET = 'message.messageCenter.reset';
const SEARCH_MESSAGE_COUNT = 'message.messageCenter.SEARCH_MESSAGE_COUNT';
const DELETE_MESSAGE = 'message.messageCenter.DELETE_MESSAGE';
const READ_MESSAGE = 'message.messageCenter.READ_MESSAGE';

export default combineReducers({
    messageList: resetMiddleware(RESET)(createReducer(SEARCH_MESSAGE)),
    messageCount: (state = {}, action) => {
        switch (action.type) {
      		case SEARCH_MESSAGE_COUNT:
                return {
                    status: action.status,
                    payload: action.payload,
                    params: action.params,
                }
            default:
                return state
        }
    },
    deleteStatus(state = {}, action) {
        if (action.type === DELETE_MESSAGE) {
            state = {
                status: action.status,
                payload: action.payload,
                params: action.params
            };
        }
        return state;
    },
    readStatus(state = {}, action) {
        if (action.type === READ_MESSAGE) {
            state = {
                status: action.status,
                payload: action.payload,
                params: action.params
            };
        }
        return state;
    },

});

export const resetMessage = resetMiddleware.actionCreator(RESET);

export const searchMessage = tablePageApiActionCreator(
    SEARCH_MESSAGE, getMessageList
);
export const searchMessageCount = apiActionCreator(
    SEARCH_MESSAGE_COUNT, getMessageCount
);
export const readMessageById = apiActionCreator(
    READ_MESSAGE, readMessage
);
export const deleteMessageById = apiActionCreator(
    DELETE_MESSAGE, deleteMessage
);

export const connect = reduxConnect(
    state => ({
        auth: state.auth.payload,
        messageCenter: state.message.messageCenter.messageList,
        messageCount: state.message.messageCenter.messageCount,
        deleteStatus: state.message.messageCenter.deleteStatus,
        readStatus: state.message.messageCenter.readStatus,
    }),
    dispatch => bindActionCreators({
        resetMessage,
        searchMessage,
        searchMessageCount,
        deleteMessageById,
        readMessageById,
    }, dispatch)
);
