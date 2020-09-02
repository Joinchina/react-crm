import React, { Component } from 'react';
import JsBarcode from 'jsbarcode'

class QrCode extends Component {
    constructor(props){
        super(props);
        this.barcode = undefined;
    }

    componentDidMount() {
        const { value } = this.props;
        JsBarcode(this.barcode, value, {
            displayValue: true,
            width: 1.8,
            height: 60,
            margin: 0,
        })
    }
    render() {
        return (
            <div className="barcode-box">
                <svg
                    ref={ref => {
                        this.barcode = ref
                    }}
                />
            </div>
        )
    }
}

export default QrCode;
