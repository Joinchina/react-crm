import { apiActionCreator, getTaskAnswerStatusForTaskType } from '../../api';

const ACTION_NAME = 'components.selectTaskRespondStatus';

export default function reduce(state = {}, action){
    if (action.type === ACTION_NAME) {
        const key = action.params;
        state = {
            ...state,
            [key]: {
                status: action.status,
                payload: action.payload,
            }
        }
    }
    return state;
}

export const getTaskRespondStatus = apiActionCreator(ACTION_NAME, getTaskAnswerStatusForTaskType, {
    mapArgumentsToParams: (taskType) => taskType
});
