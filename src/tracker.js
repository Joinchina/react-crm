import { Modal } from 'antd';
import message from '@wanhu/antd-legacy/lib/message'

if (window.Raven) {
    const oldMessageError = message.error;
    const oldModalError = Modal.error;

    message.error = function messageError(msg, ...args) {
        try {
            window.Raven.captureMessage(msg, { level: 'warning' });
            console.info(`已上报错误：${msg}，报告代码为：${window.Raven.lastEventId()}`);
        } catch (e) {
            console.warn('raven error', e);
            // ignore Raven error
        }
        oldMessageError.call(this, msg, ...args);
    };

    Modal.error = function modalError(opts, ...args) {
        let msg;
        if (opts && typeof opts === 'object') {
            const { title, content, ...rest } = opts;
            msg = `${title}: ${content} (${JSON.stringify(rest)})`;
        } else {
            msg = JSON.stringify(msg) || 'NOMESSAGE';
        }
        try {
            window.Raven.captureMessage(msg, { level: 'warning' });
            console.info(`已上报错误：${msg}，报告代码为：${window.Raven.lastEventId()}`);
        } catch (e) {
            console.warn('raven error', e);
            // ignore Raven error
        }
        oldModalError.call(this, opts, ...args);
    };
}
