import { Modal } from 'antd';

export function confirm(message, opts) {
    return new Promise((fulfill, reject) => {
        Modal.confirm({
            ...opts,
            content: message,
            onOk: () => fulfill(true),
            onCancel: () => fulfill(false),
        });
    });
}