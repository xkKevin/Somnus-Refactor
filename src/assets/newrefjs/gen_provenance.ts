import { VisData } from "@assets/newrefjs/interface";
import { get_components } from "@assets/newrefjs/get_components"
import { svgName, nodeSize, svgSize, lineAttr } from '@assets/newrefjs/config'

import * as d3 from "d3";
import ELK from "elkjs";


function get_graphs(nodeGroups, edgeGroups) {
  let graphs = []
  for (let node = 0; node < nodeGroups.length; node++) {
    let edgeCount = 1
    let graph = {
      id: "root",
      "layoutOptions": {
        "elk.padding": `[top=${parseInt(svgSize.height) + 20},left=50.0,bottom=0.0,right=35.0]`,
        "spacing.nodeNodeBetweenLayers": (parseInt(svgSize.width) + 40) * 1.2,
        // "spacing.edgeNodeBetweenLayers": "200.0",
        "nodePlacement.strategy": "NETWORK_SIMPLEX",
        "algorithm": "layered",
        "spacing.nodeNode": parseInt(svgSize.height) + 20,//control the gap in direction of y
      },
    }
    let children = [], edges = []
    nodeGroups[node].nodeGroup.forEach(nodeName => {
      children.push({ id: nodeName, width: nodeSize.width, height: nodeSize.height })
    })
    edgeGroups[nodeGroups[node].key].forEach(edge => {
      let tempEdge = { id: `e${edgeCount}`, sources: [edge[0]], targets: [edge[1]] }
      edges.push(tempEdge)
      edgeCount += 1
    })
    graph['children'] = children
    graph['edges'] = edges

    graphs.push(graph)
  }
  return graphs
}

function draw_edge(g, specs: VisData[], nodePos: { [key: string]: [number, number] }) {

  specs.forEach((spi, idx) => {
    let defs = g.append("defs")
      .attr('class', `edge_${idx}`)
    let arrowMarker = defs.append("marker")
      .attr("id", `arrow_${idx}`)
      .attr("markerUnits", "strokeWidth")
      .attr("markerWidth", "10")
      .attr("markerHeight", "10")
      .attr("viewBox", "0 0 10 10")
      .attr("refX", "8")
      .attr("refY", "4")
      .attr("orient", "auto");
    let arrow_path = "M0,0 L8,4 L0,8 L4,4 L0,0";
    arrowMarker.append("path")
      .attr("d", arrow_path)
      .attr("fill", "gray")
      .attr('class', `arrow_${idx}`)

    let str = spi.in[0].name
    let firstIdx = 0
    for (let s = 0; s < str.length; s++) {
      if (str[s] >= '0' && str[s] <= '9') {
        firstIdx = s
        break
      }
    }
    let lastIdx = str.indexOf("_") === -1 ? str.indexOf(".") : str.indexOf("_")
    let lineNum = parseInt(str.substring(firstIdx, lastIdx))

    if (spi.in.length === 1 && spi.out.length === 1) {
      g.append('line')
        .attr('x1', nodePos[spi.in[0].name][0] + nodeSize.width)
        .attr('y1', nodePos[spi.in[0].name][1] + nodeSize.height / 2)
        .attr('x2', nodePos[spi.out[0].name][0])
        .attr('y2', nodePos[spi.out[0].name][1] + nodeSize.height / 2)
        .attr('stroke', lineAttr.color)
        .attr('stroke-width', lineAttr.strokeWidth)
        .attr("marker-end", `url(#arrow_${idx})`)
        .attr('class', `edge_${idx}`)
      // .on('click', function(event) {
      //     codeHighlight(lineNum)
      // })
    } else {
      let meetingPosY: Number, meetingPosX: Number  // 节点坐标
      if (spi.in.length === 1) {
        meetingPosY = nodePos[spi.in[0].name][1] + nodeSize.height / 2
        meetingPosX = nodePos[spi.in[0].name][0] + nodeSize.width +
          0.8 * (Math.min(nodePos[spi.out[0].name][0], nodePos[spi.out[1].name][0]) -
            nodePos[spi.in[0].name][0] - nodeSize.width)
      } else {
        meetingPosY = nodePos[spi.out[0].name][1] + nodeSize.height / 2
        meetingPosX = Math.max(nodePos[spi.in[0].name][0], nodePos[spi.in[1].name][0]) +
          nodeSize.width + 0.2 * (nodePos[spi.out[0].name][0] - nodeSize.width -
            Math.max(nodePos[spi.in[0].name][0], nodePos[spi.in[1].name][0]))
      }

      let str = spi.out[0].name
      let firstIdx = 0
      for (let s = 0; s < str.length; s++) {
        if (str[s] >= '0' && str[s] <= '9') {
          firstIdx = s
          break
        }
      }
      let lastIdx = str.indexOf("_") === -1 ? str.indexOf(".") : str.indexOf("_")
      let lineNum = parseInt(str.substring(firstIdx, lastIdx))

      g.append("circle")
        .attr("cx", meetingPosX)
        .attr("cy", meetingPosY)
        .attr("r", 2 * lineAttr.strokeWidth)
        .style("fill", lineAttr.color)
        // .style("stroke", lineAttr.color)
        .attr('class', `edge_${idx}`)
      // .on('click', function(event) {
      //     codeHighlight(lineNum)
      // })

      spi.in.forEach(tbl => {
        g.append('line')
          .attr('x1', nodePos[tbl.name][0] + nodeSize.width)
          .attr('y1', nodePos[tbl.name][1] + nodeSize.height / 2)
          .attr('x2', meetingPosX)
          .attr('y2', meetingPosY)
          .attr('stroke', lineAttr.color)
          .attr('stroke-width', lineAttr.strokeWidth)
          .attr('class', `edge_${idx}`)
        // .on('click', function(event) {
        //     codeHighlight(lineNum)
        // })
      })

      spi.out.forEach(tbl => {
        g.append('line')
          .attr('x1', meetingPosX)
          .attr('y1', meetingPosY)
          .attr('x2', nodePos[tbl.name][0])
          .attr('y2', nodePos[tbl.name][1] + nodeSize.height / 2)
          .attr('stroke', lineAttr.color)
          .attr('stroke-width', lineAttr.strokeWidth)
          .attr("marker-end", `url(#arrow_${idx})`)
          .attr('class', `edge_${idx}`)
        // .on('click', function(event) {
        //     codeHighlight(lineNum)
        // })
      })
    }
  })

}

function draw_node(g, specs: VisData[], nodePos: { [key: string]: [number, number] }) {
  let nodeName: Set<string> = new Set()
  let tableInfo: { [key: string]: [number, number, number] } = {}  // [step_id, row_num, col_num]
  specs.forEach((spi, idx) => {
    spi.in.forEach(tbl => {
      if (!nodeName.has(tbl.name)) {
        nodeName.add(tbl.name)
        let rows = Math.round((tbl.data.length - 1) / tbl.scale.y)
        let cols = Math.round(tbl.data[0].length / tbl.scale.x)
        tableInfo[tbl.name] = [idx, rows, cols]
      }
    })
    spi.out.forEach(tbl => {
      nodeName.add(tbl.name)
      let rows = Math.round((tbl.data.length - 1) / tbl.scale.y)
      let cols = Math.round(tbl.data[0].length / tbl.scale.x)
      tableInfo[tbl.name] = [idx + 1, rows, cols]
    })
  })

  // console.log(tableInfo);

  for (let node_i of nodeName) {

    let nodeRect = g.append('rect')
      .attr('x', nodePos[node_i][0])
      .attr('y', nodePos[node_i][1])
      .attr('width', nodeSize.width)
      .attr('height', nodeSize.height)
      // .attr('fill',nodeColor.background)
      .attr('fill', "transparent")
      .attr("stroke", "gray")
      .attr("stroke-width", "2")
      .attr('rx', `${nodeSize.height / 15}`)

    if (node_i[0] !== '*' && node_i[0] !== '#') {
      // nodeRect.on('click', function(event) {
      //         showTableFunc(node_i)
      //     })
      /*
      let firstIdx = 0
      for (let s = 0; s < node_i.length; s++) {
          if (node_i[s] >= '0' && node_i[s] <= '9') {
              firstIdx = s
              break
          }
      }
      console.log(firstIdx);
      */
      let firstIdx = 1
      let lastIdx = node_i.indexOf(" (")
      let lineNum
      if (lastIdx === -1) {
        firstIdx = node_i.indexOf("/") + 1
        lastIdx = node_i.indexOf(".csv")
        lineNum = tableInfo[node_i][0].toString() // "∅"
        nodeRect.attr('id', `node_${node_i.substring(firstIdx, lastIdx)}`)
      } else {
        lineNum = node_i.substring(1, lastIdx)
        nodeRect.attr('id', `node_${node_i.substring(0, lastIdx)}`)
      }

      let letterWidth = nodeSize.width / (lineNum.length + 4)
      g.append('text')
        .attr('x', nodePos[node_i][0])
        .attr('y', nodePos[node_i][1])
        // .attr('dx', nodeSize.width / 4)
        // .attr('dy',nodeSize.height / 7 * 2)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .attr('fill', 'balck')
        .attr('font-size', `${letterWidth}px`)
        .attr('transform', `translate(${nodeSize.width / 5.6}, ${nodeSize.height / 1.78})`)
        .text(`S${lineNum}`)
      // .on('click', function(event) {
      //     showTableFunc(node_i)
      // })
      //以8个字符为临界点
      let letters = 8
      let font_size = nodeSize.width / letters
      let showText = ''

      if (letters + 1 >= node_i.length) { // 可显示9个字符
        showText = node_i
      } else {
        showText = node_i.slice(0, letters - 1)
        showText += '…'
      }

      let right_txt_start = nodeSize.width / 2.85  // 右侧文本距离 Sx 的距离

      g.append('text')
        .attr('x', `${nodePos[node_i][0] + right_txt_start}px`)
        .attr('y', nodePos[node_i][1] + nodeSize.height / 2 - 4)
        .attr('text-anchor', 'start')
        .attr('fill', 'balck')
        .attr('font-size', `${font_size + 1}px`)
        .text(showText)
        // .on('click', function(event) {
        //     showTableFunc(node_i)
        // })
        .append("svg:title")
        .text(node_i)
      // .on("mouseover",function(event){
      //     if(d3.select(`#table_name_${specsInf[node_i][0]}`)['_groups'][0][0] === null){
      //         g.append('text')
      //         .attr('x',nodePos[node_i][0])
      //         .attr('y',nodePos[node_i][1])
      //         .attr('dx',1.1 * nodeSize.width)
      //         .attr('dy',1.1 * nodeSize.height)
      //         .attr('text-anchor', 'start')
      //         .attr('fill','balck')
      //         .attr('font-size',`${2 * nodeSize.width / letters}px`)
      //         .text(specsInf[node_i][0])
      //         .attr("id",`table_name_${specsInf[node_i][0]}`)
      //     }
      //     console.log("event",event)
      // })
      // .on("mouseout",function(event){
      //     g.select(`#table_name_${specsInf[node_i][0]}`).remove()
      // })

      let rowsAndCols = `${tableInfo[node_i][1]}R*${tableInfo[node_i][2]}C`
      let showRowsAndCols = ''
      if (letters + 1 >= rowsAndCols.length) {
        showRowsAndCols = rowsAndCols
      } else {
        showRowsAndCols = rowsAndCols.slice(0, letters - 1)
        showRowsAndCols += '…'
      }
      g.append('text')
        .attr('x', nodePos[node_i][0] + right_txt_start)
        .attr('y', nodePos[node_i][1] + nodeSize.height - 7)
        .attr('text-anchor', 'start')
        .attr('fill', 'gray')
        .attr('font-size', `${font_size}px`)
        .text(showRowsAndCols)
        // .on('click', function(event) {
        //     showTableFunc(node_i)
        // })
        .append("svg:title")
        .text(rowsAndCols)
      // .on("mouseover",function(event){
      //     if(d3.select(`#table_name_${specsInf[node_i][0]}`)['_groups'][0][0] === null){
      //         g.append('text')
      //         .attr('x',nodePos[node_i][0])
      //         .attr('y',nodePos[node_i][1])
      //         .attr('dx',1.1 * nodeSize.width)
      //         .attr('dy',1.1 * nodeSize.height)
      //         .attr('text-anchor', 'start')
      //         .attr('fill','balck')
      //         .attr('font-size',`${2 * nodeSize.width / letters}px`)
      //         .text(specsInf[node_i][0])
      //         .attr("id",`table_name_${specsInf[node_i][0]}_show`)
      //     }
      //     console.log("event",event)
      // })
      // .on("mouseout",function(event){
      //     g.select(`#table_name_${specsInf[node_i][0]}`).remove()
      // })
    } else {
      nodeRect.style('stroke-dasharray', '5,5');
      g.append('text')
        .attr('x', nodePos[node_i][0])
        .attr('y', nodePos[node_i][1])
        .attr('dx', nodeSize.width / 2)
        .attr('dy', nodeSize.height * 0.8)
        .attr('text-anchor', 'middle')
        .attr('fill', 'gray')
        .attr('font-size', `2em`)
        .text(`Ø`)
    }
  }
}

export function draw_provenance(visArray: VisData[]): Promise<{ [key: string]: [number, number] }> {
  return new Promise((resolve, reject) => {
    let { groups, edges } = get_components(visArray);
    let graphs = get_graphs(groups, edges);
    // console.log(graphs);

    let svgWidth = 0, svgHeight = 0;
    let nodePos: { [key: string]: [number, number] } = {};
    let proms: Promise<void>[] = [];

    for (let idx = 0; idx < graphs.length; idx++) {
      let tempElk = new Promise<void>((resolve, reject) => {
        let elk = new ELK();
        elk
          .layout(graphs[idx])
          .then((data) => {
            for (let idx = 0; idx < data.children.length; idx++) {
              nodePos[data.children[idx].id] = [
                data.children[idx].x,
                data.children[idx].y,
              ];
            }
            resolve();
          })
          .catch(reject);
      });
      proms.push(tempElk);
    }

    Promise.all(proms).then(() => {
      //在高度方向上给不同的component设置偏移量，由上一组的maxY确定
      let yOffset = 0;
      for (let group = 0; group < groups.length; group++) {
        let maxY = 0;
        groups[group].nodeGroup.forEach((tableName) => {
          maxY = Math.max(nodePos[tableName][1], maxY);
          nodePos[tableName][1] = nodePos[tableName][1] + yOffset;
          svgWidth = Math.max(svgWidth, nodePos[tableName][0]);
          svgHeight = Math.max(svgHeight, nodePos[tableName][1]);
        });
        yOffset = yOffset + maxY + 1.2 * parseInt(nodeSize.height);
      }
      const g = d3.select("#" + svgName).append("g");

      // console.log(nodePos);
      draw_edge(g, visArray, nodePos);
      draw_node(g, visArray, nodePos);
      resolve(nodePos);
    }).catch(reject);
  });
}

