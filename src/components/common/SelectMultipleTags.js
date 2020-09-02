/**
## 标签多选控件

```javascript
import SelectMultipleTags from '~/components/common/SelectMultipleTags';
```

### 基本用法

只需要传入` value` 和 `onChange` 属性即可。

* `value`：已选的标签列表，类型为：

  ```javascript
  [
    {
      id: '标签id',
      name: '标签名称',
      editable: 1, //是否允许移除此标签
      tagType: 1, //自动，2//手动
    },
    ...
  ]
  ```

* `onChange`：标签修改时的回调函数，类型为`function (value, tags)`，其中`value`为新的选中列表，类型与`value`属性相同，`tags`为全部的标签列表，但可能为空（从服务器读取标签列表未完成或失败，用户仍然能删除`value`中已有的标签，触发`onChange` ）


### 数据范围

使用`SelectMultipleTags.forDataRange(dataRange)`方法，构造一个特定`dataRange`的标签选择控件。

```javascript
render() {
    const SelectMultipleTagsForView = SelectMultipleTags.forDataRange(1);
    const SelectMultipleTagsForEdit = SelectMultipleTags.forDataRange(2);
    return <div>
        <SelectMultipleTagsForView />
        <SelectMultipleTagsForEdit />
    </div>
}
```

多次调用同一个 dataRange 会返回相同的组件：

```javascript
SelectMultipleTags.forDataRange(1) === SelectMultipleTags.forDataRange(1); //true
```

### 查看标签列表

使用`SelectMultipleTags.Viewer`可以用于只知道标签`id`的情况下，查看标签列表。支持下列属性：

* `value`：其类型与`SelectMultipleTags`中的`value`属性相同，不过允许列表项只有`id`字段，此时会自动从服务端获取标签列表并与`value`匹配显示。
* `wrapper`：显示标签列表的容器，默认为`"div"`。
* `renderItem`：当一个标签与服务端数据成功匹配时，渲染这个标签，类型为：`function(item, index)`，默认使用`item => <Tag color={item.tagType === 1 ? 'red' : null}>{item.name}</Tag>
* `renderNotFoundItem`：如果一个标签没有服务端的匹配项，渲染这个标签，类型与`renderItem`相同，默认使用`renderItem`的值。

需要数据范围时，使用`SelectMultipleTags.forDataRange(dataRange).Viewer`

```
render() {
    const tagList = [{id: 1}];
    return <SelectMultipleTags.Viewer value={tagList}/>
}
```
*/

import React, { Component } from 'react';
import { getTags } from '../../states/components/selectTags';
import { connectSelectMultiple } from './BaseSelectMultiple';
import { Tag } from 'antd';

const forDataRangeCache = {};

function createInstance(key, fetchData) {
    const BaseSelectMultipleTags = connectSelectMultiple({
        mapStateToAsyncStatus: state => state.components.selectTags[key] || {},
        mapItemToLabel: item => item.name,
        mapItemToOrder: item => item.key,
        // mapItemToOptionLabel: item => item.group ? `${item.group.name} ${item.name}` : item.name,
        mapItemToDisabled: item => !item.editable,
        mapItemToGroupId: item => item.group && item.group.id,
        mapItemToGroupLabel: item => item.group && item.group.name,
        mapItemToGroupOrder: item => item.group && item.group.key,
        mapItemToId: item => item.id,
        getOptionsActionCreator: fetchData
    });

    return class SelectMultipleTags extends Component {

        static Viewer = function SelectMultipleTagsViewer(props) {
            const renderItem = props.renderItem || (item => <Tag key={item.id} color={item.tagType === 1 ? 'red' : null}>{ item.name }</Tag>);
            return <BaseSelectMultipleTags.Viewer {...props} renderItem={renderItem}/>
        }

        onChange = (values, options) => {
            if (!Array.isArray(values)) {
                this.props.onChange(values);
                return;
            }
            if (!Array.isArray(options)) options = [];

            let newVal = [];
            const mutexGroup = {};
            for (let i = values.length - 1; i >= 0; i --) {
                const tag = options.find(tag => tag.id === values[i].id) || values[i];
                if (tag.group && tag.group.isMutex) {
                    if (mutexGroup[tag.group.id]) {
                        continue;
                    } else {
                        mutexGroup[tag.group.id] = true;
                    }
                }
                newVal.unshift(values[i]);
            }
            this.props.onChange(newVal, options);
        }

        render() {
            const { onChange, ...restProps } = this.props;
            return <BaseSelectMultipleTags {...restProps} onChange={this.onChange}/>
        }
    }
}


function forDataRange(dataRange) {
    let key;
    if (dataRange === null || dataRange === undefined) {
        key = 'null';
    }
    if (!forDataRangeCache[key]) {
        forDataRangeCache[key] = createInstance(key, () => getTags(dataRange, key));
    }
    return forDataRangeCache[key];
}

const defaultComponent = forDataRange();
defaultComponent.forDataRange = forDataRange;
export default defaultComponent;
export { defaultComponent as SelectMultipleTags };
