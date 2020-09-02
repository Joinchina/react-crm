import contextCreator from './contextCreator';
import * as functions from './index';

const context = contextCreator();
const api = {};
for (const key in functions) {
    api[key] = functions[key].bind(context, context);
}

export default api;
