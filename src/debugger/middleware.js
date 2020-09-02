let middleware;
let getReport;
let getState;
let dispatch;
if (process.env.NODE_ENV === 'development') {
    const debugData = {};
    middleware = store => {
        debugData.preloadedState = store.getState();
        debugData.actions = [];
        getReport = () => {
            debugData.currentState = store.getState();
            return JSON.stringify(debugData);
        };
        getState = () => store.getState();
        dispatch = action => store.dispatch(action);
        return next => action => {
          if(typeof action === 'function'){
              debugData.actions.push(`function ${action.name}`);
          }
          else{
              debugData.actions.push(JSON.parse(JSON.stringify(action)));
          }
          return next(action);
        }
    };
}

export default middleware;
export { getReport, getState, dispatch };
