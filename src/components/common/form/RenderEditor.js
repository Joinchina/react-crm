import React, { Component } from 'react';

export default class RenderEditor extends Component {

    render (){
        const { type, ...rest } = this.props;
        const Type = type;
        return <Type {...rest}/>
    }
}
