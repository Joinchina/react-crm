import {
    apiActionCreator,
    getCustomerQuick, // (ctx, where, skip, limit, count)
    getOrderCenter as getOrder, // (ctx, where, skip, limit, count)
    getTask, // (ctx, where, skip, limit, count, order)
} from '../api';
import { reduceAsyncAction, resetMiddleware } from '../helpers/reducers';

const GOLBAL_SEARCH = 'searchForm.doSearch';
const RESET_GLOBAL_SEARCH = 'searchForm.reset';

export default resetMiddleware(RESET_GLOBAL_SEARCH)(reduceAsyncAction(GOLBAL_SEARCH));

export const reset = resetMiddleware.actionCreator(RESET_GLOBAL_SEARCH);

export const search = apiActionCreator(GOLBAL_SEARCH, async (ctx, type, keyword) => {
    if (!keyword) {
        return {};
    }
    let r;
    switch (type) {
    case 'customer':
        r = await getCustomerQuick(ctx,
            {
                search: keyword,
            }, 0, 11, 0);
        break;
    case 'order':
        r = await getOrder(ctx,
            {
                $or: [
                    { patientName: { $like: `%${keyword}%` } },
                    { idCard: keyword },
                    { orderNo: keyword },
                ],
            }, 0, 11, 0, [{ createDate: 'desc' }]);
        break;
    case 'task':
        r = await getTask(ctx,
            {
                $or: [
                    { contactsName: { $like: `%${keyword}%` } },
                    { content: { $like: `%${keyword}%` } },
                    { charge: { $like: `%${keyword}%` } },
                ],
            },
            0, 11, 0, [{ updateDate: 'desc' }]);
        break;
    default:
        return {};
    }
    return {
        list: r.list || [],
    };
}, { throttle: 500, mapArgumentsToParams: (type, keyword) => keyword });
