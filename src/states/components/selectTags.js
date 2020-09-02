import { apiActionCreator, getTags as getTagsApi } from '../../api';

const ACTION_NAME = 'components.selectTags';

export default function reduce(state = {}, action){
    if (action.type === ACTION_NAME) {
        const key = action.params;
        state = {
            ...state,
            [key]: {
                status: action.status,
                payload: action.status === 'fulfilled' ? action.payload.map(tag => ({
                    ...tag,
                    editable: 1
                })) : action.payload,
            }
        }
    }
    return state;
}

export const getTags = apiActionCreator(ACTION_NAME, async (ctx, dataRange, key) => {
    return await getTagsApi(ctx, dataRange);
}, {
    mapArgumentsToParams: (dataRange, key) => key
});
