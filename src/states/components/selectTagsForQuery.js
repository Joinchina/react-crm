import { apiActionCreator, getTagsForQuery as getTagsForQueryApi } from '../../api';

const ACTION_NAME = 'components.selectTagsForQuery';

export default function reduce(state = {}, action) {
    if (action.type === ACTION_NAME) {
        const key = action.params;
        /* eslint-disable-next-line */
        state = {
            ...state,
            [key]: {
                status: action.status,
                payload: action.status === 'fulfilled' ? action.payload.map(tag => ({
                    ...tag,
                    editable: 1,
                })) : action.payload,
            },
        };
    }
    return state;
}

export const getTagsForQuery = apiActionCreator(ACTION_NAME, async (ctx, { where, dataRange }) => {
    const params = {
        where,
        dataRange,
    };
    const result = await getTagsForQueryApi(ctx, params);
    return result;
}, {
    mapArgumentsToParams: (dataRange, key) => key,
});
