import { getTaskRespondStatus } from '../../states/components/selectTaskRespondStatus';
import { connectSelectSingle } from './BaseSelectSingle'

const forTaskTypeCache = {};

function forTaskType(taskType) {
    if (!forTaskTypeCache[taskType]) {
        forTaskTypeCache[taskType] = connectSelectSingle({
            mapStateToAsyncStatus: state => ({
                status: state.components.selectTaskRespondStatus[taskType] ?
                         state.components.selectTaskRespondStatus[taskType].status : null,
                payload: state.components.selectTaskRespondStatus[taskType] ?
                            (state.components.selectTaskRespondStatus[taskType].status === 'fulfilled' ?
                            state.components.selectTaskRespondStatus[taskType].payload.answerStatus :
                            state.components.selectTaskRespondStatus[taskType].payload)
                         : null
            }),
            mapItemToLabel: item => item.name,
            mapItemToId: item => item.id,
            getOptionsActionCreator: () => getTaskRespondStatus(taskType)
        });
    }
    return forTaskTypeCache[taskType];
}

export { forTaskType };
