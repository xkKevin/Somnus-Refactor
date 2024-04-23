import { AfterViewInit, Component } from '@angular/core';
import { gen_vis } from '@assets/refjs/gen_vis';
import { gen_data } from "@assets/refjs/gen_data";
import { gen_provenance } from "@assets/refjs/gen_provenance";
import * as data from '@assets/data/sql_output.json';

@Component({
  selector: 'app-refactoring-vis',
  templateUrl: './refactoring-vis.component.html',
  styleUrl: './refactoring-vis.component.css'
})
export class RefactoringVisComponent implements AfterViewInit {
  ngAfterViewInit(): void {

    var somnusdata = gen_data(data)
    var nodePos = gen_provenance(somnusdata.dsl, somnusdata.data_df)
    // console.log(somnusdata)

    // gen_vis(data) {}
    // data.dsl
    // 1. 绘制provenance 可以参考老版本somnus 返回坐标 nodePos = gen_provenance(data.dsl)
    // drawEdge(g, specsToHandle, nodePos);
    // drawNode(g, specsToHandle, nodePos, getTableInfo(data.data_df));
    // 2. data.dsl, data.data_df 转化成 vis 配置  format_visdata
    // 2.1 生成可视化数据  gen_data()
    // 2.1 完成其余的 VIS 配置项
    // 3. gen_glyph()

    gen_vis()


  }
}
