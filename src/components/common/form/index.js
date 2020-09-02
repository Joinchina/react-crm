import './style.scss';
import { Form as AntdForm } from 'antd';
import fieldBuilder, { EditorSupports } from './fieldBuilder';
import formBuilder from './formBuilder';
import FieldDecorator from './FieldDecorator';
import Form from './Form';
import ViewOrEdit from './ViewOrEdit';
import RenderEditor from './RenderEditor';

export const FieldLabel = AntdForm.Item;
export { fieldBuilder, formBuilder, Form, FieldDecorator, ViewOrEdit, EditorSupports, RenderEditor };
