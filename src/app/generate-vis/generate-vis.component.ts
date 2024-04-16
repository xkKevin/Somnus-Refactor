import { AfterViewInit, Component } from '@angular/core';
import * as d3 from 'd3';

import {genVis} from '@assets/js/genVis';
import {format_data} from "@assets/js/format2Somnus"
// import * as data from '@assets/data/spark_output.json'
import * as data from '@assets/data/sql_output.json'
// import * as data from '@assets/data/somnus.json';

@Component({
  selector: 'app-generate-vis',
  templateUrl: './generate-vis.component.html',
  styleUrl: './generate-vis.component.css'
})
export class GenerateVisComponent implements AfterViewInit {
  ngAfterViewInit(): void {

  const width = window.innerWidth;
  const height = window.innerHeight - 70;

  const svg =  d3.select("svg")
    .attr("id", "mainsvg")
    .attr('width', width)
    .attr('height', height);

    // drawBarChart()

    // genVis(data.dsl, data.data_df)
    var somnus_data = format_data(data)
    genVis(somnus_data.dsl, somnus_data.data_df)

  }
}
