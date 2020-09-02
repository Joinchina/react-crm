import { getHospital } from '../../states/components/selectHospital';
import { connectSelectSingle } from './BaseSelectSingle'
import hash from 'object-hash';

const forDataRangeCache = {};

function forDataRange(dataRange, logical, where) {
    const r = { dataRange, logical, where }
    let key;
    if ((dataRange === null || dataRange === undefined) &&
        (logical === null || logical === undefined) &&
        (where === null || where === undefined)
    ) {
        key = 'null';
    } else {
        key = `${hash(r)}`;
    }
    if (!forDataRangeCache[key]) {
        forDataRangeCache[key] = connectSelectSingle({
            mapStateToAsyncStatus: state => ({
                status: state.components.selectHospital[key] && state.components.selectHospital[key].status,
                payload: state.components.selectHospital[key] && state.components.selectHospital[key].payload
            }),
            mapItemToLabel: item => item.name,
            mapItemToId: item => `${item.id}`,
            getOptionsActionCreator: () => getHospital(key, dataRange, logical, where)
        });
    }
    return forDataRangeCache[key];
}

const defaultComponent = forDataRange();
defaultComponent.forDataRange = forDataRange;
export default defaultComponent;
export { defaultComponent as SelectSingleHospital };
