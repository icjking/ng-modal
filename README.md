# 模态框

# modal

## Dependencies

+ Angular >= 4.0.0 


## Usage

app.module.ts:

```ts
import { ModalModule } from 'src/app/components/modal';

@NgModule({
    declarations: [
        AppComponent
    ],
    imports: [
        ...
        ModalModule.forRoot(), // <- 这里引入，在功能Module引入即可，不一定要在AppModule, 这里作为样例
    ],
    providers: [],
    bootstrap: [AppComponent]
})
export class AppModule {}
```

You need either set  

全局引入modal.less

```none
@import "src/app/components/modal/modal.less";
```

demo.html:  
```
<button class="btn btn-linear-primary" (click)="createModal()">创建modal</button>
```

demo.ts:
```
import { ModalService } from 'src/app/components/modal';

constructor (private modal : ModalService) {}

/**
 * 创建modal
 */
createModal () {
    this.modal.dialog({
        title : '创建modal',
        data : {},
        template : TableComponent,
        confirmCallback : () => {
            // 确认后执行回调函数
        }
    });
}

其他实例请查看 `modal.service.ts`
```
