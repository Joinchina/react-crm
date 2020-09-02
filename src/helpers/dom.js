export function closest(test) {
    return fromElem => {
        let e = fromElem;
        while (e) {
            if (test(e)) {
                return e;
            }
            e = e.parentElement;
        }
        return null;
    };
}

export function isTag(tagName) {
    tagName = tagName.toLowerCase();
    return elem => elem.tagName.toLowerCase() === tagName;
}

export function hasClass(className) {
    return elem => {
        if (!elem || !elem.className) return false;
        return (` ${elem.className} `).replace(/[\n\t]/g, " ").indexOf(` ${className} `) > -1;
    }
}

export const closestScrollableArea = node => closest(hasClass('ant-modal-wrap'))(node) || document.body;

export const closestAffix = node => closest(hasClass('ant-affix'))(node) || document.body;
