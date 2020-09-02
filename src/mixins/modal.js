import React from 'react';
import propTypes from 'prop-types';
import querystring from 'querystring';
import blacklist from 'blacklist';

/*
 * 给组件添加以下属性：
 *   * currentModal:string                当前显示的弹窗,
 *   * openModal:function(name:string)    打开一个弹窗
 *   * closeModal:function()              关闭当前的弹窗
 */
export default function connectModalHelper(Component) {

    function render(props, context){
        const router = context.router;
        const path = router.route.location.pathname;
        let qs = router.route.location.search;
        if (qs && qs[0] === '?') {
            qs = qs.slice(1);
        }
        const query = querystring.parse(qs);
        const currentModal = query.modal;
        const currentModalParam = query.modalParam;
        const closeModal = () => {
            const q = blacklist(query, 'modal', 'modalParam');
            const s = querystring.stringify(q);
            if (s) {
                router.history.push(`${path}?${s}`);
            } else {
                router.history.push(`${path}`);
            }
        }
        const openModal = (modal, modalParam) => {
            const q = blacklist(query, 'modal', 'modalParam');
            if (modal !== null && modal !== undefined && modal !== '') {
                q.modal = modal;
            }
            if (modalParam !== null && modalParam !== undefined && modalParam !== '') {
                q.modalParam = modalParam;
            }
            router.history.push(`${path}?${querystring.stringify(q)}`);
        }

        return <Component currentModal={currentModal} currentModalParam={currentModalParam} openModal={openModal} closeModal={closeModal} { ...props }/>
    }

    render.contextTypes = {
        router: propTypes.object.isRequired
    }

    return render;
}

export { connectModalHelper, connectModalHelper as connect };
