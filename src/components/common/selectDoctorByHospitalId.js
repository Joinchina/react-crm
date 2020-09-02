import { getDoctor } from '../../states/components/selectDoctor';
import { connectSelectSingle } from './BaseSelectSingle'

const cache = {};
export function forHospitalId(hospitalId) {
    let key;
    if (hospitalId === null || hospitalId === undefined) {
        key = "null";
    } else {
        key = `${hospitalId}`;
    }
    if (!cache[key]) {
        cache[key] = connectSelectSingle({
            mapStateToAsyncStatus: state => state.components.selectDoctor[key] || {},
            mapItemToLabel: item => item.name,
            mapItemToId: item => `${item.id}`,
            getOptionsActionCreator: () => getDoctor(key, hospitalId)
        });
    }
    return cache[key];
}

export const SelectDoctor = forHospitalId();
export default SelectDoctor;
SelectDoctor.forHospitalId = forHospitalId;
