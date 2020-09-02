import { apiActionCreator,
  getWorkload as getWorkloadApi,
} from '../../api';
import { reduceAsyncAction } from '../../helpers/reducers';

const WORKLOADS = 'home.WORKLOADS';

export default reduceAsyncAction(WORKLOADS);

export const workloadStatisticsAction = apiActionCreator(WORKLOADS, getWorkloadApi);
