import { Component } from 'react';
import { createPortal } from 'react-dom';
import propTypes from 'prop-types';
import './index.less';

function factory(className) {
    return class PrintOnly extends Component {
        static propTypes = {
            children: propTypes.node.isRequired,
        }

        componentDidMount() {
            this.element = window.document.createElement('div');
            this.element.className = className;
            window.document.body.append(this.element);
            this.forceUpdate();
        }

        componentWillUnmount() {
            window.document.body.removeChild(this.element);
        }

        render() {
            if (!this.element) return null;
            const { children } = this.props;
            return createPortal(children, this.element);
        }
    };
}

export const PrintOnly = factory('print-only printable');
export const Printable = factory('printable');

export function printSimulate() {
    if (document.body.className.indexOf('print-simulate') >= 0) {
        document.body.className = document.body.className.replace('print-simulate', '');
    } else {
        document.body.className += ' print-simulate';
    }
}

window.printSimulate = printSimulate;
