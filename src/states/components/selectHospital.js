import { apiActionCreator, getHospital as getHospitalApi } from '../../api';
import { reduceAsyncAction } from '../../helpers/reduceAsyncAction';

const ACTION_NAME = 'components.selectHospital';
const reducer = reduceAsyncAction(ACTION_NAME);

export default function (state = {}, action) {
    if (action.type === ACTION_NAME) {
        const key = action.params;
        const newState = reducer(state[key], action);
        if (newState !== state[key]) {
            state = {
                ...state,
                [key]: newState
            };
        }
    }
    return state;
}

export const getHospital = apiActionCreator(ACTION_NAME, async (ctx, key, dataRange, logical, where) => {
    const r = await getHospitalApi(ctx, dataRange, logical, where);
    return r;
}, {
    mapArgumentsToParams: key => key
});
