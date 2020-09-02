import React from 'react';
import { shallow } from 'enzyme';
import sinon from 'sinon';
import { expect } from 'chai';

import SmartInput from '../../../../src/components/common/SmartInput';
import NotEditableField from '../../../../src/components/common/NotEditableField';
import { Input } from 'antd'

describe('<SmartInput />', () => {
    it('renders NotEditableField in no edit state', () => {
        const onToggle = sinon.spy();
        const component = shallow(<SmartInput switchState={onToggle} editStatus={false} notEditableOnly={false} />);
        const label = component.find(NotEditableField);
        expect(label).to.have.length(1);
    });

    it('passes switchState and notEditableOnly prop to NotEditableField', () => {
        const onToggle = sinon.spy();
        const props1 = shallow(<SmartInput switchState={onToggle} editStatus={false} notEditableOnly={false} />)
            .find(NotEditableField)
            .props();
        expect(props1.switchState).to.equal(onToggle);
        expect(props1.notEditableOnly).to.be.false;
        const props2 = shallow(<SmartInput switchState={onToggle} editStatus={false} notEditableOnly={true} />)
            .find(NotEditableField)
            .props();
        expect(props2.switchState).to.equal(onToggle);
        expect(props2.notEditableOnly).to.be.true;
    });

    it("renders input and no NotEditableField in edit state", () => {
        const onToggle = sinon.spy();
        const component = shallow(<SmartInput switchState={onToggle} editStatus={true} notEditableOnly={false} value="123456"/>);
        expect(component.find(NotEditableField)).to.have.length(0);
        const input = component.find(Input);
        expect(input).to.have.length(1);
        expect(input.props().value).to.equal('123456');
    });
});
