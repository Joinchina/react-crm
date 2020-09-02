import { apiActionCreator, getgroupOffices as getOfficesApi } from '../../api';
import { combineReducers } from 'redux';

const ACTION_NAME = 'components.selectOffice';

function reduceList(state = {}, action) {
    if (action.type === ACTION_NAME) {
        state = {
            status: action.status,
            payload: action.payload,
        }
    }
    return state;
}

function reduceTree(state = {}, action) {
    if (action.type === ACTION_NAME) {
        if (action.status === 'fulfilled') {
            const data = action.payload;
            const map = {};
            const roots = [];
            data.forEach(item => {
                map[item.id] = item;
                item.label = item.name
                item.key = item.id
                item.value = item.id
            });
            data.forEach(item => {
                let p = map[item.parentId];
                if (p) {
                    p.children = p.children || [];
                    p.children.push(item);
                } else {
                    roots.push(item);
                }
            });
            return {
                status: action.status,
                payload: {
                    list: data,
                    tree: roots
                },
            };
        }
        return {
            status: action.status,
            payload: action.payload,
        }
    }
    return state;
}

export default combineReducers({
    tree: reduceTree,
    list: reduceList
});

export const getOffices = apiActionCreator(ACTION_NAME, async (ctx) => {
    return await getOfficesApi(ctx);
});
