const SET_PROVINCE = 'SmartCascader.setProvince'
const SET_CITY = 'SmartCascader.setCity'
const SET_AREA = 'SmartCascader.setArea'
import { apiActionCreator, getProvinces, getCities, getAreas } from '../api'

export default function smartCascaderTerritory(state = {}, action){
  //console.log('smartCascader action', action)
  let tempOjb = {}
  switch(action.type){
    case SET_PROVINCE:
      if(action.status === 'fulfilled'){
        state = {...state, cn: parseProvinces(action.payload)}
      }else{
        state = {...state}
      }
      break
    case SET_CITY:
      tempOjb = {}
      action.payload = parseCities(action.payload)
      tempOjb[action.params.pid] = action
      state = {...state, ...tempOjb}
      break
    case SET_AREA:
      tempOjb = {}
      action.payload = parseArea(action.payload)
      tempOjb[action.params.cid] = action
      state = {...state, ...tempOjb}
      break
    default:
      break
  }
  return state
}

function parseProvinces(provinces){
  if(!provinces) return []
  return provinces.map(row => {
    return {value: row.id, label: row.name, isLeaf: false, level: 'p'}
  })
}

function parseCities(cities){
  if(!Array.isArray(cities)) return []
  cities = cities.map(row => {
    return {value: row.id, label: row.name, isLeaf: false, level: 'c'}
  })
  return cities
}

function parseArea(areas){
  if(!Array.isArray(areas)) return []
  areas = areas.map(row => {
    return {value: row.id, label: row.name, isLeaf: true, level: 'a'}
  })
  return areas
}

export const getProvincesAction = apiActionCreator(SET_PROVINCE, getProvinces)
export const getCitiesAction = apiActionCreator(SET_CITY, getCities, { mapArgumentsToParams: (provinceId) => ({pid: provinceId})})
export const getAreasAction = apiActionCreator(SET_AREA, getAreas, { mapArgumentsToParams: (provinceId, cityId) => ({pid:provinceId, cid: cityId})})
