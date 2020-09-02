import { apiActionCreator, getTaskType as getTaskTypeApi } from '../../api';
import { reduceAsyncAction } from '../../helpers/reduceAsyncAction';

const ACTION_NAME = 'components.selectSingleTaskType';

const reducer = reduceAsyncAction(ACTION_NAME);

export default function(state = {}, action) {
    const groupType = action.params && action.params.groupType || "default";
    return {
        ...state,
        [groupType]: reducer(state[groupType], action)
    };
}

export const getTaskType = apiActionCreator(ACTION_NAME, getTaskTypeApi, {
    mapArgumentsToParams: (groupType) => ({ groupType })
});