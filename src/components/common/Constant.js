import { Component } from 'react';

export default class Constant extends Component {

    componentWillMount() {
        if (this.props.onChange && this.props.value !== this.props.constant) {
            this.props.onChange(this.props.constant);
        }
    }

    componentWillReceiveProps(props) {
        if (props.onChange && props.value !== props.constant) {
            props.onChange(props.constant);
        }
    }

    render(){
        return null;
    }
}
