export default function timeout(time) {
    return new Promise((fulfill) => {
        setTimeout(fulfill, time);
    });
};
