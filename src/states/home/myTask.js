import {
    apiActionCreator,
    getTask as getTaskApi
} from '../../api';
import { reduceAsyncAction } from '../../helpers/reducers';
import moment from 'moment';

const MY_TASK = 'home.MY_TASK'

export default reduceAsyncAction(MY_TASK)

export const getTasks = apiActionCreator(MY_TASK, async (ctx, userId, limit) => {
    const r = await getTaskApi(ctx, {
        chargeId: userId,
        taskStatus: {
            $in: [0, 1]
        }
    }, 0, null, 0, [{ updateDate: "asc" }]);
    let list = r.list;
    list = list.map(item => ({
        ...item,
        isNearRelease: isNearRelease(item),
    }));
    list = list.filter(item => item.isNearRelease).concat(list.filter(item => !item.isNearRelease));
    list = limit ? list.slice(0, limit) : list;

    return {
        count: r.list.length,
        list: list
    };
});

function isNearRelease(task){
    if (!task.releaseDate) {
        return false;
    }
    const releaseDate = moment(task.releaseDate).set({hour: 0, minute: 0, seconds: 0, milliseconds: 0});
    if (!releaseDate.isValid()) return false;
    return releaseDate.diff(moment(), 'days') < 1;
}
