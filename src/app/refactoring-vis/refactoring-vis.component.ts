import { AfterViewInit, Component } from '@angular/core';
import { gen_vis } from '@assets/refjs/gen_vis';
import { gen_data } from "@assets/refjs/gen_data";
import { gen_provenance, drawEdge, drawNode, getTableInfo} from "@assets/refjs/gen_provenance";
import * as data from '@assets/data/sql_output_copy.json';
import * as d3 from 'd3';

@Component({
  selector: 'app-refactoring-vis',
  templateUrl: './refactoring-vis.component.html',
  styleUrl: './refactoring-vis.component.css'
})
export class RefactoringVisComponent implements AfterViewInit {
  ngAfterViewInit(): void {

    const width = window.innerWidth;
    const height = window.innerHeight - 70;
    const svg = d3.select("svg")
      .attr("id", "mainsvg")
      .attr('width', width)
      .attr('height', height);

    var somnusdata = gen_data(data);
    var provenance_info = gen_provenance(somnusdata.dsl, somnusdata.data_df);

    // var specsToHandle = provenance_info.specsToHandle;
    // var nodePos = provenance_info.nodePos;

    // const g = d3.select(`#mainsvg`).append("g");
    // console.log("outname", specsToHandle)
    // drawEdge(g, specsToHandle, nodePos);
    // drawNode(g, specsToHandle, nodePos, getTableInfo(somnusdata.data_df));
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

    // gen_vis()


  }
}
