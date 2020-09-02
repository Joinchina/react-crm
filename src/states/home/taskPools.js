import { apiActionCreator,
  getUnhandledTask as getUnhandledTaskApi,
  getTaskPool,
  getMoreUnhandledTask as getMoreUnhandledTaskApi,
  handleTaskFromPool as handleTaskFromPoolApi } from '../../api'
import { reduceAsyncAction } from '../../helpers/reducers';
import asyncActionCreator from '../../helpers/asyncActionCreator';
import { combineReducers } from 'redux';
import moment from 'moment';

const HANDLE_NEXT_TASK = 'home.HANDLE_NEXT_TASK'
const GET_TASK_POOLS = 'home.GET_TASK_POOLS'
const GET_FAVOR_POOLS = 'home.GET_FAVOR_POOLS';
const SET_FAVOR_POOLS = 'home.SET_FAVOR_POOLS';

export default combineReducers({
    taskPools: reduceAsyncAction(GET_TASK_POOLS, { keepPreviousPayloadWhilePending: true }),
    handleTaskFromPoolResult: reduceAsyncAction(HANDLE_NEXT_TASK),
    favorTaskPools: reduceAsyncAction(GET_FAVOR_POOLS),
    setFavorTaskPoolsResult: reduceAsyncAction(SET_FAVOR_POOLS),
});

export const handleTaskFromPool = apiActionCreator(HANDLE_NEXT_TASK, async (ctx, id) => {
    return await handleTaskFromPoolApi(ctx, id);
}, {
    mapArgumentsToParams: (id) => id
});

export const getTaskPoolList = apiActionCreator(GET_TASK_POOLS, async (ctx, userId, limit, search, priorityTaskPoolIds) => {
    const r = await getTaskPool(ctx, {
        status: 1,
        userId,
        effective: 1,
        // name: search,
    });
    let list = r.list.sort((a, b) => {
        if (priorityTaskPoolIds) {
            const aIsPriority = priorityTaskPoolIds.indexOf(a.id) >= 0 ? 1 : 2;
            const bIsPriority = priorityTaskPoolIds.indexOf(b.id) >= 0 ? 1 : 2;
            if (aIsPriority !== bIsPriority) {
                return aIsPriority - bIsPriority; //id在优先列表中的项目排在前
            }
        }
        if (a.effectiveRule !== b.effectiveRule) {
            return b.effectiveRule - a.effectiveRule; //指定时间内有效排在长期有效之前
        }
        if (a.effectiveRule == 2 && a.endDate !== b.endDate) {
            return moment(a.endDate).valueOf() - moment(b.endDate).valueOf(); //有效期结束的早的排在前
        }
        return b.count - a.count; //数量多的排在前
    });
    const total = list.reduce((acc, val) => acc + val.count, 0);
    if (search) list = list.filter(item => item.name.indexOf(search) >= 0);
    const count = list.length;
    if (limit) list = list.slice(0, limit);
    const result = {
        list,
        count,
        sum: {
            count: total
        }
    };
    return result;
});

export const getFavorTaskPools = asyncActionCreator(GET_FAVOR_POOLS, async (userId) => {
    let pools;
    try {
        pools = JSON.parse(localStorage.getItem(`${userId}:favorTaskPools`) || '[]');
        if (!Array.isArray(pools)) {
            pools = [];
        }
    } catch (e) {
        pools = [];
    }
    return pools;
});

export const setFavorTaskPools = asyncActionCreator(SET_FAVOR_POOLS, async (userId, pools) => {
    localStorage.setItem(`${userId}:favorTaskPools`, JSON.stringify(pools));
});
