/* eslint-disable
    react/no-unknown-property,
    react/jsx-one-expression-per-line,
    jsx-a11y/label-has-for,
    jsx-a11y/click-events-have-key-events,
    jsx-a11y/no-static-element-interactions,
    no-use-before-define,
    react/style-prop-object
*/
import Viewer from 'viewerjs';
import React from '../jsx-dom';
import Handsontable from '../lib';
import cellDecorator from '../cell-decorator';
import './upload-images.less';

function resizeUrl(url, width, height = width) {
    const split = url.indexOf('?') >= 0 ? '&' : '?';
    return `${url}${split}x-oss-process=image/resize,m_fill,h_${height},w_${width}`;
}

const cachedValue = Symbol(cachedValue);

function uploadImagesRenderer(hotInstance, td, row, column, prop, value = '', cellProperties) {
    cellDecorator(hotInstance, td, row, column, prop, value, cellProperties);
    if (td[cachedValue] === value) {
        return;
    }
    /* eslint-disable-next-line no-param-reassign */
    td[cachedValue] = value;
    const images = (value || '').split('|').map(url => url && ({
        thumb: resizeUrl(url, 55),
        url,
    })).filter(a => a);

    const { onUploadImage } = cellProperties;

    function render() {
        Handsontable.dom.empty(td);
        const displayImages = [];
        /* eslint-disable-next-line guard-for-in, no-restricted-syntax */
        for (const index in images) {
            const img = images[index];
            if (displayImages.length < 2) {
                displayImages.push({
                    ...img,
                    index,
                });
            } else {
                displayImages.push({
                    ...images[images.length - 1],
                    count: images.length - 3,
                    index: images.length - 1,
                });
                break;
            }
        }
        td.appendChild((
            <div class="ht-antd-upload-images-cell">
                {
                    displayImages.map((img) => {
                        let content;
                        if (img.loading) {
                            content = <div class="ht-antd-upload-images-loading"><div class="ant-spin ant-spin-spinning"><span class="ant-spin-dot ant-spin-dot-spin"><i /><i /><i /><i /></span></div></div>;
                        } else if (img.error) {
                            content = <div class="ht-antd-upload-images-error"><i theme="filled" class="anticon anticon-close-circle" /></div>;
                        } else {
                            content = null;
                        }
                        return (
                            <div
                                class="ht-antd-upload-images-img"
                                style={`background-image:url(${img.thumb || img.url})`}
                                onClick={() => view(img.index)}
                            >
                                {
                                    content
                                }
                                {
                                    img.count
                                        ? <span class="ht-antd-upload-images-count">{img.count}</span>
                                        : null
                                }
                                <span class="ht-antd-upload-images-del" onClick={event => del(event, img.index)}>
                                    <i class="anticon anticon-close" />
                                </span>
                            </div>
                        );
                    })
                }
                <label class={images.length > 0 ? null : 'only-one'}>
                    <i class="anticon anticon-plus" />
                    <input type="file" onChange={upload} />
                </label>
            </div>
        ));
    }

    function spliceAndRelease(arr, index, length, ...items) {
        for (const toRelease of arr.splice(index, length, ...items)) {
            if (toRelease && toRelease.release) {
                toRelease.release();
            }
        }
    }

    async function upload(event) {
        const input = event.target;
        const file = input.files[0];
        input.value = null;

        const tmpurl = URL.createObjectURL(file);
        images.push({
            url: tmpurl,
            loading: true,
            release: () => URL.revokeObjectURL(tmpurl),
        });
        const index = images.length - 1;
        render();

        try {
            const url = await onUploadImage(file);
            spliceAndRelease(images, index, 1, {
                url,
                thumb: resizeUrl(url, 55),
            });
            const newValue = images.map(img => img.url).join('|');
            hotInstance.setDataAtCell(row, column, newValue);
            render();
        } catch (e) {
            if (e.validate === false) {
                spliceAndRelease(images, index, 1);
            } else {
                spliceAndRelease(images, index, 1, {
                    url: tmpurl,
                    error: true,
                });
            }
            render();
            console.warn('upload error', e);
        }
    }

    function del(event, index) {
        spliceAndRelease(images, index, 1);
        const newValue = images.map(img => img.url).join('|');
        hotInstance.setDataAtCell(row, column, newValue);
        render();
        event.stopPropagation();
    }

    function view(index) {
        const root = (
            <div>
                {
                    images.map(img => (
                        <img src={img.url} alt="" />
                    ))
                }
            </div>
        );
        const viewer = new Viewer(root, {
            initialViewIndex: index,
            ready: () => {
                viewer.show();
            },
            hidden: () => {
                viewer.destroy();
            },
        });
        viewer.show();
    }

    render();
}

/* eslint-disable class-methods-use-this */

class NullEditor extends Handsontable.editors.BaseEditor {
    beginEditing(/* initialValue, event */) {}

    finishEditing() {}

    init() {}

    open() {}

    close() {}

    getValue() {}

    setValue() {}

    focus() {}
}

export default {
    editor: NullEditor,
    renderer: uploadImagesRenderer,
    className: 'ht-antd-upload-images',
};
