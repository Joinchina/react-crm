import Viewer from 'viewerjs';
import 'viewerjs/dist/viewer.css';
import 'viewerjs/dist/viewer.min.css';
/* 该文件中的 JSX 语法直接生成DOM节点，而不是React的虚拟DOM */
import React from './jsx-dom';

export default function view(images, options = {}) {
    return new Promise((fulfill) => {
        const root = (
            <div>
                {
                    images.map(img => (
                        <img src={img.url} alt={img.alt}/>
                    ))
                }
            </div>
        );
        const viewer = new Viewer(root, {
            ...options,
            fullscreen: true,
            ready: () => {
                viewer.show();
            },
            hidden: () => {
                viewer.destroy();
                fulfill();
            },
        });
        viewer.show();
    });
}
