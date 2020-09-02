import React, { Component } from 'react';

const parentStyle = {position:'relative'};
const aStyle = { position: 'absolute', width: 1, height: 1, display: 'block', background: 'rgba(0,0,0,0.01)', zIndex: -1 };

export default class ScrollIntoView extends Component {

    componentDidMount(){
        if (this.props.refScrollIntoView) {
            this.props.refScrollIntoView(this.scrollIntoView);
        }
        if (this.props.refScrollIntoViewIfNeeded) {
            this.props.refScrollIntoViewIfNeeded(this.scrollIntoViewIfNeeded);
        }
    }

    componentWillReceiveProps(props){
        if (props.refScrollIntoView) {
            props.refScrollIntoView(this.scrollIntoView);
        }
        if (props.refScrollIntoViewIfNeeded) {
            props.refScrollIntoViewIfNeeded(this.scrollIntoViewIfNeeded);
        }
    }

    scrollIntoView = (...args) => {
        if (this.elem) {
            this.elem.scrollIntoView(...args);
        }
    }

    scrollIntoViewIfNeeded = (...args) => {
        if (this.elem) {
            this.elem.scrollIntoViewIfNeeded(...args);
        }
    }

    onRef = (elem) => {
        this.elem = elem;
    }

    render() {
        const style = this.props.offset ? { ...aStyle, top: -this.props.offset } : aStyle;
        return <div style={parentStyle}>
            <a ref={this.onRef} style={style}></a>
        </div>;
    }
}
