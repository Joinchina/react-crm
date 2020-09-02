import { apiActionCreator, getDisease as getDiseasesApi } from '../../api';
import { reduceAsyncAction } from '../../helpers/reduceAsyncAction';

const ACTION_NAME = 'components.selectMultipleDiseases';

export default reduceAsyncAction(ACTION_NAME);

export const getDiseases = apiActionCreator(ACTION_NAME, getDiseasesApi);
