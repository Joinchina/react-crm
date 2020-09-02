import { Component } from 'react';

const events = {
    onResize: 'resize',
};

export default function GlobalEventFactory(target) {
    return class GlobalEvent extends Component {
        componentDidMount() {
            Object.keys(events).forEach((propName) => {
                if (this.props[propName]) {
                    target.addEventListener(events[propName], this.props[propName]);
                }
            });
        }

        componentWillReceiveProps(newProps) {
            Object.keys(events).forEach((propName) => {
                if (this.props[propName] !== newProps[propName]) {
                    if (this.props[propName]) {
                        target.removeEventListener(events[propName], this.props[propName]);
                    }
                    if (newProps[propName]) {
                        target.addEventListener(events[propName], newProps[propName]);
                    }
                }
            });
        }

        componentWillUnmount() {
            Object.keys(events).forEach((propName) => {
                if (this.props[propName]) {
                    target.removeEventListener(events[propName], this.props[propName]);
                }
            });
        }

        render() {
            const { children } = this.props;
            if (children) {
                return children;
            }
            return null;
        }
    };
}

export const WindowEvent = GlobalEventFactory(window);
export const DocumentEvent = GlobalEventFactory(document);
export const BodyEvent = GlobalEventFactory(document.body);
