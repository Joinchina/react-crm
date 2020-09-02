import { combineReducers, bindActionCreators } from 'redux';
import { connect as reduxConnect } from 'react-redux';
import { createReducer, apiActionCreator as tablePageApiActionCreator } from '../../components/common/table-page';
import { resetMiddleware } from '../../helpers/reducers';

import {
    getIncomes as getIncomesApi,
} from '../../api';

const SEARCH_ORDER = 'toolcase.income.searchOrder';
const RESET = 'toolcase.income.reset';

export default resetMiddleware(RESET)(combineReducers({
    incomeList: createReducer(SEARCH_ORDER),
}));

export const searchOrder = tablePageApiActionCreator(
    SEARCH_ORDER, async (ctx, where, skip, limit) => {
        const list = await getIncomesApi(ctx, where, skip, limit);
        let data = [];
        list.list.forEach((item) => {
            if (!item.orderfillId) {
                data.push({
                    id: Date.now().toString() + Math.random().toString(),
                    children: [item],
                });
            } else {
                const mergeId = `${item.orderfillId}-${item.traAdjust}`;
                const existList = data.find(d => d.id === mergeId);
                if (!existList) {
                    data.push({
                        id: mergeId,
                        children: [item],
                    });
                } else {
                    existList.children.push(item);
                }
            }
        });

        data = data.map((group) => {
            if (group.children.length === 1) {
                return {
                    ...group.children[0],
                    id: group.id,
                };
            }
            return {
                ...group.children[0],
                id: group.id,
                children: group.children.slice(1).map((item, index) => ({
                    ...item,
                    id: `${group.id}-${index}`,
                })),
            };
        });

        return {
            list: data,
        };
    },
);

export const resetOrder = resetMiddleware.actionCreator(RESET);

export const connect = reduxConnect(
    state => ({
        incomeList: state.toolcase.incomeList.incomeList,
    }),
    dispatch => bindActionCreators({
        searchOrder,
        resetOrder,
    }, dispatch),
);
