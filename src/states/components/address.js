import { apiActionCreator,
    getProvinces as getProvincesApi,
    getCities as getCitiesApi,
    getAreas as getAreasApi
} from '../../api';
import { combineReducers, bindActionCreators } from 'redux';
import { reduceAsyncAction } from '../../helpers/reduceAsyncAction';
import { connect as reduxConnect } from 'react-redux';

const GET_PROVINCES = 'components.address.getProvinces';
const GET_CITIES = 'components.address.getCities';
const GET_AREAS = 'components.address.getAreas';

const reduceProvinces = reduceAsyncAction(GET_PROVINCES);
const reduceCity = reduceAsyncAction(GET_CITIES);
const reduceArea = reduceAsyncAction(GET_AREAS);

function reduceCities(state = {}, action) {
    if (action.type === GET_CITIES) {
        const provinceId = action.params;
        const newCities = reduceCity(state[provinceId], action);
        if (newCities !== state[provinceId]) {
            state = {
                ...state,
                [provinceId]: newCities
            };
        }
    }
    return state;
}

function reduceAreas(state = {}, action) {
    if (action.type === GET_AREAS) {
        const cityId = action.params;
        const newAreas = reduceArea(state[cityId], action);
        if (newAreas !== state[cityId]) {
            state = {
                ...state,
                [cityId]: newAreas
            };
        }
    }
    return state;
}

const reduceList = combineReducers({
    provinces: reduceProvinces,
    cities: reduceCities,
    areas: reduceAreas,
});

export default function reduceTree(state = {}, action) {
    if (action.type === GET_PROVINCES || action.type === GET_CITIES || action.type === GET_AREAS) {
        const list = reduceList(state.list, action);
        const tree = reduceProvinceTree(state.tree, list.provinces, list.cities, list.areas, action);
        if (list !== state.list || tree !== state.tree) {
            state = {
                ...state,
                list,
                tree
            };
        }
    }
    return state;

    function reduceProvinceTree(state = [], provinces, cities, areas, action){
        if (!provinces || provinces.status !== 'fulfilled') {
            return state.length === 0 ? state : [];
        }
        if (provinces.status === 'fulfilled') {
            let anyChange = state.length > provinces.payload.length;
            const newState = provinces.payload.map((p, i) => {
                if (!state[i]) {
                    anyChange = true;
                    return {
                        label: p.name,
                        value: p.id,
                        children: reduceCities(undefined, cities[p.id], areas, action),
                        isLeaf: false,
                        // loading: action.type === GET_CITIES && action.params === p.id && action.status === 'pending',
                    };
                }
                // let loading;
                // if (action.type === GET_CITIES && action.params === p.id) {
                //
                // }
                //  = state[i].loading;
                const newLabel = p.name;
                const newValue = p.id;
                const newChildren = reduceCities(state[i].children, cities[p.id], areas, action);
                if (newLabel !== state[i].label || newValue !== state[i].value || newChildren !== state[i].children) {
                    anyChange = true;
                    return {
                        label: newLabel,
                        value: newValue,
                        children: newChildren,
                        isLeaf: false,
                    };
                }
                return state[i];
            });
            return anyChange ? newState : state;
        }
        return state;
    }

    function reduceCities(state, cities, areas, action) {
        if (!cities || cities.status !== 'fulfilled') {
            return null;
        }
        if (!state) state = [];
        if (cities.status === 'fulfilled') {
            let anyChange = state.length > cities.payload.length;
            const newState = cities.payload.map((c, i) => {
                if (!state[i]) {
                    anyChange = true;
                    return {
                        label: c.name,
                        value: c.id,
                        children: reduceAreas(undefined, areas[c.id], action),
                        isLeaf: false,
                    }
                }
                const newLabel = c.name;
                const newValue = c.id;
                const newChildren = reduceAreas(state[i].children, areas[c.id], action);
                if (newLabel !== state[i].label || newValue !== state[i].value || newChildren !== state[i].children) {
                    anyChange = true;
                    return {
                        label: newLabel,
                        value: newValue,
                        children: newChildren,
                        isLeaf: false,
                    };
                }
                return state[i];
            });
            return anyChange ? newState : state;
        }
        return state;
    }

    function reduceAreas(state = [], areas, action) {
        if (!areas || areas.status !== 'fulfilled') {
            return null;
        }
        if (!state) state = [];
        if (areas.status === 'fulfilled') {
            let anyChange = state.length > areas.payload.length;
            const newState = areas.payload.map((c, i) => {
                if (!state[i]) {
                    anyChange = true;
                    return {
                        label: c.name,
                        value: c.id,
                        isLeaf: true,
                    }
                }
                const newLabel = c.name;
                const newValue = c.id;
                if (newLabel !== state[i].label || newValue !== state[i].value) {
                    anyChange = true;
                    return {
                        label: newLabel,
                        value: newValue,
                        isLeaf: true,
                    };
                }
                return state[i];
            });
            return anyChange ? newState : state;
        }
        return state;
    }
}

export const getProvinces = apiActionCreator(GET_PROVINCES, getProvincesApi);
export const getCities = apiActionCreator(GET_CITIES, getCitiesApi, {
    mapArgumentsToParams: provinceId => provinceId
});
export const getAreas = apiActionCreator(GET_AREAS, getAreasApi, {
    mapArgumentsToParams: (provinceId, cityId) => cityId
});

export const connect = reduxConnect(
    state => state.components.address,
    dispatch => bindActionCreators({
        getProvinces,
        getCities,
        getAreas,
    }, dispatch)
);
