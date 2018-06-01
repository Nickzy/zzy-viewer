# vue-viewer

> A Vue.js project

## Build Setup

``` bash
# install dependencies
npm install

# serve with hot reload at localhost:8080
npm run dev

# build for production with minification
npm run build
```

For detailed explanation on how things work, consult the [docs for vue-loader](http://vuejs.github.io/vue-loader).

### 组建属性
```
position 详情位置 (string)
list 图片列表 (array)
isHasSiderBar 是否展示详情默认false (boolan) (<template slot="siderbar"></template> 详情为插槽形式)
bottom 图片距离底部位置默认 10 (number)
top 图片距离顶部位置默认 30 (number)
fatherElement 图片父级节点 (element)

示例
import viewer from 'zzy-viewer'
Vue.use(viewer)
在 main.js 中安装即可全局引用
<viewer :fatherElement="farElement" :list="imageData" :isHasSiderBar="false" position="">
    <template slot="siderbar">
        <div>
            此为侧边栏详情
        </div>
    </template>
</viewer>
```
