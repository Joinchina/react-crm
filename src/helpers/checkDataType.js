export function isLagel(data, error){
  if(data){
    return data
  }else{
    error &&　console.error(error);
    return {}
  }
}

export function isArray(data, error){
  if(Array.isArray(data)){
    return data
  }else{
    error &&　console.error(error);
    return []
  }
}
