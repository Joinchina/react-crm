import { combineReducers } from 'redux';

import selectSystemUser from './selectSystemUser';
import selectSystemUserGroup from './selectSystemUserGroup';
import selectTaskType from './selectTaskType';
import selectHospital from './selectHospital';
import selectMultipleDiseases from './selectMultipleDiseases';
import selectTags from './selectTags';
import selectTagsForQuery from './selectTagsForQuery';
import selectTaskRespondStatus from './selectTaskRespondStatus';
import selectOffice from './selectOffice';
import selectDoctor from './selectDoctor';
import selectSinglePatientAsync from './selectSinglePatientAsync';

import address from './address';

export default combineReducers({
    selectSystemUser,
    selectSystemUserGroup,
    selectTaskType,
    selectHospital,
    selectMultipleDiseases,
    selectTags,
    selectTagsForQuery,
    selectTaskRespondStatus,
    address,
    selectOffice,
    selectDoctor,
    selectSinglePatientAsync,
});
