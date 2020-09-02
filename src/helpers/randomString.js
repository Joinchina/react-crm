const CACHE_SIZE = 16;
const cache = [];
export default function randomString(){
    let val = Math.random().toString(36).substr(-4);
    while (cache.indexOf(val) >= 0) {
        val = Math.random().toString(36).substr(-4);
    }
    cache.push(val);
    if (cache.length > CACHE_SIZE) {
        cache.shift();
    }
    return val;
}
