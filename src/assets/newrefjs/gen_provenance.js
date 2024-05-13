import {
    getGraphs
} from "@assets/refjs/getLayout";
import {
    getComponents
} from "@assets/refjs/getComponents";
import {
    svgSize,
    nodeSize,
    lineAttr
} from "@assets/js/config/config";
import ELK from "elkjs";
import * as d3 from "d3";
import {
    draw_glyph
} from '@assets/refjs/gen_glyph'
import {
    TransformType,
    Arrange,
    SortType
} from '@assets/refjs/interface'

import {
    generateDataForDeleteDuplicateRows,
    generateDataForFilterRow,
    generateDataForRows,
} from "./selectData/genDataForDeleteRows";

import {
    generateData,
    generateDataForCreateColumns,
    generateDataForCreateColumns_create,
    generateDataForCreateColumns_extract,
} from "./selectData/genDataForCreateColumns";

import {
    generateDataForColumnRename,
    generateDataForMutate_cover,
    generateDataForReplace,
} from "./selectData/genDataForTransformColumns";

import {
    generateDataForDeleteColumn,
    generateDataForDeleteNaColumn,
    generateDataForKeepColumns,
} from "./selectData/genDataForDeleteColumns";
import {
    input
} from "@angular/core";


// function getComponents(specs) {
//   let fatherRec = makeFatherRec(specs);
//   for (let idx = 0; idx < specs.length; idx++) {
//     if (
//       typeof specs[idx].input_table_file === "string" &&
//       typeof specs[idx].output_table_file === "string"
//     ) {
//       fatherRec = mergeNode(
//         fatherRec,
//         specs[idx].input_table_file,
//         specs[idx].output_table_file
//       );
//     } else if (typeof specs[idx].input_table_file === "string") {
//       for (
//         let fileIdx = 0;
//         fileIdx < specs[idx].output_table_file.length;
//         fileIdx++
//       ) {
//         fatherRec = mergeNode(
//           fatherRec,
//           specs[idx].input_table_file,
//           specs[idx].output_table_file[fileIdx]
//         );
//       }
//     } else {
//       for (
//         let fileIdx = 0;
//         fileIdx < specs[idx].input_table_file.length;
//         fileIdx++
//       ) {
//         fatherRec = mergeNode(
//           fatherRec,
//           specs[idx].input_table_file[fileIdx],
//           specs[idx].output_table_file
//         );
//       }
//     }
//   }
//   let nodes = {};
//   let edges = {};
//   //收集节点
//   for (let key in fatherRec) {
//     let root = findRoot(fatherRec, key);
//     if (!nodes[root]) nodes[root] = [];
//     nodes[root].push(key);
//   }
//   //收集边
//   for (let idx = 0; idx < specs.length; idx++) {
//     //经过上面的并查集操作之后，同一个spec的input和output file一定在有同一个root
//     if (
//       typeof specs[idx].input_table_file === "string" &&
//       typeof specs[idx].output_table_file === "string"
//     ) {
//       let root = findRoot(fatherRec, specs[idx].input_table_file);
//       if (!edges[root]) edges[root] = [];
//       edges[root].push([
//         specs[idx].input_table_file,
//         specs[idx].output_table_file,
//       ]);
//     } else if (typeof specs[idx].input_table_file === "string") {
//       let root = findRoot(fatherRec, specs[idx].input_table_file);
//       if (!edges[root]) edges[root] = [];
//       for (
//         let fileIdx = 0;
//         fileIdx < specs[idx].output_table_file.length;
//         fileIdx++
//       ) {
//         edges[root].push([
//           specs[idx].input_table_file,
//           specs[idx].output_table_file[fileIdx],
//         ]);
//       }
//     } else {
//       let root = findRoot(fatherRec, specs[idx].output_table_file);
//       if (!edges[root]) edges[root] = [];
//       for (
//         let fileIdx = 0;
//         fileIdx < specs[idx].input_table_file.length;
//         fileIdx++
//       ) {
//         edges[root].push([
//           specs[idx].input_table_file[fileIdx],
//           specs[idx].output_table_file,
//         ]);
//       }
//     }
//   }
//   let groups = [];
//   for (let keyNode in nodes) {
//     groups.push({ key: keyNode, nodeGroup: nodes[keyNode] });
//   }
//   groups.sort(componentCmp);
//   return { groups, edges };
// }

function getTableInfo(data_df) {
    var tableInf = {};
    for (var dfn in data_df) {
        tableInf[dfn] = [dfn, data_df[dfn].length, data_df[dfn][0].length];
    }
    return tableInf;
}

function drawNode(g, specs, nodePos, specsInf) {
    let nodeName = []
    for (let idx = 0; idx < specs.length; idx++) {
        if (typeof (specs[idx].input_table_file) === "string") {
            nodeName.push(specs[idx].input_table_file)
        } else {
            specs[idx].input_table_file.forEach(element => {
                nodeName.push(element)
            })
        }

        if (typeof (specs[idx].output_table_file) === "string") {
            nodeName.push(specs[idx].output_table_file)
        } else {
            specs[idx].output_table_file.forEach(element => {
                nodeName.push(element)
            });
        }
    }

    nodeName = Array.from(new Set(nodeName))
    for (let idx = 0; idx < nodeName.length; idx++) {
        // console.log("idx:", idx);
        // console.log("nodeName:", nodeName[idx]);
        // console.log("nodePos:", nodePos[nodeName[idx]]);
        let nodeRect = g.append('rect')
            .attr('x', nodePos[nodeName[idx]][0])
            .attr('y', nodePos[nodeName[idx]][1])
            .attr('width', nodeSize.width)
            .attr('height', nodeSize.height)
            // .attr('fill',nodeColor.background)
            .attr('fill', "transparent")
            .attr("stroke", "gray")
            .attr("stroke-width", "2")
            .attr('rx', `${nodeSize.height / 15}`)

        if (nodeName[idx][0] !== '*' && nodeName[idx][0] !== '#') {
            // nodeRect.on('click', function(event) {
            //         showTableFunc(nodeName[idx])
            //     })
            /*
            let firstIdx = 0
            for (let s = 0; s < nodeName[idx].length; s++) {
                if (nodeName[idx][s] >= '0' && nodeName[idx][s] <= '9') {
                    firstIdx = s
                    break
                }
            }
            console.log(firstIdx);
            */
            let firstIdx = 1
            let lastIdx = nodeName[idx].indexOf(" (")
            let lineNum
            if (lastIdx === -1) {
                firstIdx = nodeName[idx].indexOf("/") + 1
                lastIdx = nodeName[idx].indexOf(".csv")
                lineNum = "∅"
                nodeRect.attr('id', `node_${nodeName[idx].substring(firstIdx, lastIdx)}`)
            } else {
                lineNum = nodeName[idx].substring(1, lastIdx)
                nodeRect.attr('id', `node_${nodeName[idx].substring(0, lastIdx)}`)
            }

            let letterWidth = nodeSize.width / (lineNum.length + 2)
            let midInY = (nodeSize.height - letterWidth) / 2 + letterWidth
            g.append('text')
                .attr('x', nodePos[nodeName[idx]][0])
                .attr('y', nodePos[nodeName[idx]][1] + midInY)
                .attr('dx', nodeSize.width / 4)
                // .attr('dy',nodeSize.height / 7 * 2)
                .attr('text-anchor', 'middle')
                .attr('fill', 'balck')
                .attr('font-size', `${letterWidth}px`)
                .text(`L${lineNum}`)
            // .on('click', function(event) {
            //     showTableFunc(nodeName[idx])
            // })
            //以8个字符为临界点
            let letters = 8
            let font_size = nodeSize.width / 1.33 / letters
            let showText = ''

            if (letters + 1 >= specsInf[nodeName[idx]][0].length) { // 可显示9个字符
                showText = specsInf[nodeName[idx]][0]
            } else {
                showText = specsInf[nodeName[idx]][0].slice(0, letters - 1)
                showText += '…'
            }

            g.append('text')
                .attr('x', `${nodePos[nodeName[idx]][0] + nodeSize.width / 2}px`)
                .attr('y', nodePos[nodeName[idx]][1] + nodeSize.height / 2 - 5)
                .attr('text-anchor', 'start')
                .attr('fill', 'balck')
                .attr('font-size', `${font_size}px`)
                .text(showText)
                // .on('click', function(event) {
                //     showTableFunc(nodeName[idx])
                // })
                .append("svg:title")
                .text(specsInf[nodeName[idx]][0])
            // .on("mouseover",function(event){
            //     if(d3.select(`#table_name_${specsInf[nodeName[idx]][0]}`)['_groups'][0][0] === null){
            //         g.append('text')
            //         .attr('x',nodePos[nodeName[idx]][0])
            //         .attr('y',nodePos[nodeName[idx]][1])
            //         .attr('dx',1.1 * nodeSize.width)
            //         .attr('dy',1.1 * nodeSize.height)
            //         .attr('text-anchor', 'start')
            //         .attr('fill','balck')
            //         .attr('font-size',`${2 * nodeSize.width / letters}px`)
            //         .text(specsInf[nodeName[idx]][0])
            //         .attr("id",`table_name_${specsInf[nodeName[idx]][0]}`)
            //     }
            //     console.log("event",event)
            // })
            // .on("mouseout",function(event){
            //     g.select(`#table_name_${specsInf[nodeName[idx]][0]}`).remove()
            // })

            let rowsAndCols = `${specsInf[nodeName[idx]][1] - 1}R*${specsInf[nodeName[idx]][2]}C`
            let showRowsAndCols = ''
            if (letters + 1 >= rowsAndCols.length) {
                showRowsAndCols = rowsAndCols
            } else {
                showRowsAndCols = rowsAndCols.slice(0, letters - 1)
                showRowsAndCols += '…'
            }
            g.append('text')
                .attr('x', nodePos[nodeName[idx]][0] + nodeSize.width / 2)
                .attr('y', nodePos[nodeName[idx]][1] + nodeSize.height - 6)
                .attr('text-anchor', 'start')
                .attr('fill', 'gray')
                .attr('font-size', `${font_size}px`)
                .text(showRowsAndCols)
                // .on('click', function(event) {
                //     showTableFunc(nodeName[idx])
                // })
                .append("svg:title")
                .text(rowsAndCols)
            // .on("mouseover",function(event){
            //     if(d3.select(`#table_name_${specsInf[nodeName[idx]][0]}`)['_groups'][0][0] === null){
            //         g.append('text')
            //         .attr('x',nodePos[nodeName[idx]][0])
            //         .attr('y',nodePos[nodeName[idx]][1])
            //         .attr('dx',1.1 * nodeSize.width)
            //         .attr('dy',1.1 * nodeSize.height)
            //         .attr('text-anchor', 'start')
            //         .attr('fill','balck')
            //         .attr('font-size',`${2 * nodeSize.width / letters}px`)
            //         .text(specsInf[nodeName[idx]][0])
            //         .attr("id",`table_name_${specsInf[nodeName[idx]][0]}_show`)
            //     }
            //     console.log("event",event)
            // })
            // .on("mouseout",function(event){
            //     g.select(`#table_name_${specsInf[nodeName[idx]][0]}`).remove()
            // })
        } else {
            nodeRect.style('stroke-dasharray', '5,5');
            g.append('text')
                .attr('x', nodePos[nodeName[idx]][0])
                .attr('y', nodePos[nodeName[idx]][1])
                .attr('dx', nodeSize.width / 2)
                .attr('dy', nodeSize.height * 0.8)
                .attr('text-anchor', 'middle')
                .attr('fill', 'gray')
                .attr('font-size', `2em`)
                .text(`Ø`)
        }
    }
}

function drawEdge(g, specs, nodePos) {

    for (let idx = 0; idx < specs.length; idx++) {
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

        let str = typeof (specs[idx].output_table_file) === 'string' ? specs[idx].output_table_file : specs[idx].output_table_file[0]
        let firstIdx = 0
        for (let s = 0; s < str.length; s++) {
            if (str[s] >= '0' && str[s] <= '9') {
                firstIdx = s
                break
            }
        }
        let lastIdx = str.indexOf("_") === -1 ? str.indexOf(".") : str.indexOf("_")
        let lineNum = parseInt(str.substring(firstIdx, lastIdx))

        if (typeof (specs[idx].input_table_file) === 'string' &&
            typeof (specs[idx].output_table_file) === 'string') {
            g.append('line')
                .attr('x1', nodePos[specs[idx].input_table_file][0] + nodeSize.width)
                .attr('y1', nodePos[specs[idx].input_table_file][1] + nodeSize.height / 2)
                .attr('x2', nodePos[specs[idx].output_table_file][0])
                .attr('y2', nodePos[specs[idx].output_table_file][1] + nodeSize.height / 2)
                .attr('stroke', lineAttr.color)
                .attr('stroke-width', lineAttr.strokeWidth)
                .attr("marker-end", `url(#arrow_${idx})`)
                .attr('class', `edge_${idx}`)
            // .on('click', function(event) {
            //     codeHighlight(lineNum)
            // })
        } else if (typeof (specs[idx].input_table_file) === 'string') {
            let meetingPosY = nodePos[specs[idx].input_table_file][1] + nodeSize.height / 2
            let meetingPosX = nodePos[specs[idx].input_table_file][0] + nodeSize.width +
                0.8 * (Math.min(nodePos[specs[idx].output_table_file[0]][0], nodePos[specs[idx].output_table_file[1]][0]) -
                    nodePos[specs[idx].input_table_file][0] - nodeSize.width)

            let str = typeof (specs[idx].output_table_file) === 'string' ? specs[idx].output_table_file : specs[idx].output_table_file[0]
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

            g.append('line')
                .attr('x1', nodePos[specs[idx].input_table_file][0] + nodeSize.width)
                .attr('y1', nodePos[specs[idx].input_table_file][1] + nodeSize.height / 2)
                .attr('x2', meetingPosX)
                .attr('y2', meetingPosY)
                .attr('stroke', lineAttr.color)
                .attr('stroke-width', lineAttr.strokeWidth)
                .attr('class', `edge_${idx}`)
            // .on('click', function(event) {
            //     codeHighlight(lineNum)
            // })

            g.append('line')
                .attr('x1', meetingPosX)
                .attr('y1', meetingPosY)
                .attr('x2', nodePos[specs[idx].output_table_file[0]][0])
                .attr('y2', nodePos[specs[idx].output_table_file[0]][1] + nodeSize.height / 2)
                .attr('stroke', lineAttr.color)
                .attr('stroke-width', lineAttr.strokeWidth)
                .attr("marker-end", `url(#arrow_${idx})`)
                .attr('class', `edge_${idx}`)
            // .on('click', function(event) {
            //     codeHighlight(lineNum)
            // })

            g.append('line')
                .attr('x1', meetingPosX)
                .attr('y1', meetingPosY)
                .attr('x2', nodePos[specs[idx].output_table_file[1]][0])
                .attr('y2', nodePos[specs[idx].output_table_file[1]][1] + nodeSize.height / 2)
                .attr('stroke', lineAttr.color)
                .attr('stroke-width', lineAttr.strokeWidth)
                .attr("marker-end", `url(#arrow_${idx})`)
                .attr('class', `edge_${idx}`)
            // .on('click', function(event) {
            //     codeHighlight(lineNum)
            // })
        } else {
            let meetingPosY = nodePos[specs[idx].output_table_file][1] + nodeSize.height / 2
            let meetingPosX = Math.max(nodePos[specs[idx].input_table_file[0]][0], nodePos[specs[idx].input_table_file[1]][0]) +
                nodeSize.width + 0.2 * (nodePos[specs[idx].output_table_file][0] - nodeSize.width -
                    Math.max(nodePos[specs[idx].input_table_file[0]][0], nodePos[specs[idx].input_table_file[1]][0]))

            let str = typeof (specs[idx].output_table_file) === 'string' ? specs[idx].output_table_file : specs[idx].output_table_file[0]
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
                // .style("stroke", "black")
                .attr('class', `edge_${idx}`)
            // .on('click', function(event) {
            //     codeHighlight(lineNum)
            // })

            g.append('line')
                .attr('x1', nodePos[specs[idx].input_table_file[0]][0] + nodeSize.width)
                .attr('y1', nodePos[specs[idx].input_table_file[0]][1] + nodeSize.height / 2)
                .attr('x2', meetingPosX)
                .attr('y2', meetingPosY)
                .attr('stroke', lineAttr.color)
                .attr('stroke-width', lineAttr.strokeWidth)
                .attr('class', `edge_${idx}`)
            // .on('click', function(event) {
            //     codeHighlight(lineNum)
            // })

            g.append('line')
                .attr('x1', nodePos[specs[idx].input_table_file[1]][0] + nodeSize.width)
                .attr('y1', nodePos[specs[idx].input_table_file[1]][1] + nodeSize.height / 2)
                .attr('x2', meetingPosX)
                .attr('y2', meetingPosY)
                .attr('stroke', lineAttr.color)
                .attr('stroke-width', lineAttr.strokeWidth)
                .attr('class', `edge_${idx}`)
            // .on('click', function(event) {
            //     codeHighlight(lineNum)
            // })

            g.append('line')
                .attr('x1', meetingPosX)
                .attr('y1', meetingPosY)
                .attr('x2', nodePos[specs[idx].output_table_file][0])
                .attr('y2', nodePos[specs[idx].output_table_file][1] + nodeSize.height / 2)
                .attr('stroke', lineAttr.color)
                .attr('stroke-width', lineAttr.strokeWidth)
                .attr("marker-end", `url(#arrow_${idx})`)
                .attr('class', `edge_${idx}`)
            // .on('click', function(event) {
            //     codeHighlight(lineNum)
            // })
        }
    }

}

function gen_provenance(dsl, data_df) {
  console.log(dsl)
    var specsToHandle = Array.from(dsl);
    for (let idx = 0; idx < specsToHandle.length; idx++) {
        if (specsToHandle[idx].type === "separate_tables_decompose") {
            specsToHandle[idx].output_table_file = specsToHandle[idx].output_table_file.slice(0, Math.min(2, specsToHandle[idx].output_table_file.length));
            specsToHandle[idx].output_table_name = specsToHandle[idx].output_table_name.slice(0, Math.min(2, specsToHandle[idx].output_table_name.length));
        }
    }
    let nullInfileCount = "*",
        nullOutfileCount = "#";
    specsToHandle.forEach((spec) => {
        if (!spec.input_table_file) {
            spec["input_table_file"] = nullInfileCount;
            nullInfileCount += "*";
            console.log(spec)
        }
        if (!spec.output_table_file) {
            spec["output_table_file"] = nullOutfileCount;
            nullOutfileCount += "#";
        }
    });
    let {
        groups,
        edges
    } = getComponents(specsToHandle);

    let graphs = getGraphs(groups, edges);

    let svgWidth = 0,
        svgHeight = 0;

    let nodePos = {};

    let proms = [];
    for (let idx = 0; idx < graphs.length; idx++) {
        let tempElk = new Promise((resolve, reject) => {
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
                }).then(() => {
                    resolve();
                });
        });
        proms.push(tempElk);
    }

    // console.log(tempElk)
    Promise.all(proms).then(() => {
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
        const g = d3.select(`#mainsvg`).append("g");
        drawEdge(g, specsToHandle, nodePos);
        drawNode(g, specsToHandle, nodePos, getTableInfo(data_df));
        let transform_specs = specsToHandle;
        for (let i = 0; i < transform_specs.length; i++) {
            let pos = [];
            if (
                typeof transform_specs[i].input_table_file === "string" &&
                typeof transform_specs[i].output_table_file === "string"
            ) {
                let dy =
                    Math.abs(
                        nodePos[transform_specs[i].input_table_file][1] -
                        nodePos[transform_specs[i].output_table_file][1]
                    ) >
                        svgSize.height / 2 ?
                        svgSize.height / 2 :
                        0;
                pos = [
                    (nodePos[transform_specs[i].input_table_file][0] +
                        nodeSize.width +
                        nodePos[transform_specs[i].output_table_file][0]) /
                    2 -
                    svgSize.width / 2,
                    (nodePos[transform_specs[i].input_table_file][1] +
                        nodeSize.height +
                        nodePos[transform_specs[i].output_table_file][1]) /
                    2 -
                    svgSize.height +
                    dy -
                    10,
                ];
            } else if (typeof transform_specs[i].input_table_file === "string") {
                let meetingPosY =
                    nodePos[transform_specs[i].input_table_file][1] + nodeSize.height / 2;
                let meetingPosX =
                    nodePos[transform_specs[i].input_table_file][0] +
                    nodeSize.width +
                    0.8 *
                    (Math.min(
                        nodePos[transform_specs[i].output_table_file[0]][0],
                        nodePos[transform_specs[i].output_table_file[1]][0]
                    ) -
                        nodePos[transform_specs[i].input_table_file][0] -
                        nodeSize.width);
                pos = [
                    (nodePos[transform_specs[i].input_table_file][0] +
                        nodeSize.width +
                        meetingPosX) /
                    2 -
                    svgSize.width / 2,
                    (nodePos[transform_specs[i].input_table_file][1] +
                        nodeSize.height / 2 +
                        meetingPosY) /
                    2 -
                    svgSize.height -
                    10,
                ];
            } else {
                let meetingPosY =
                    nodePos[transform_specs[i].output_table_file][1] +
                    nodeSize.height / 2;
                let meetingPosX =
                    Math.max(
                        nodePos[transform_specs[i].input_table_file[0]][0],
                        nodePos[transform_specs[i].input_table_file[1]][0]
                    ) +
                    nodeSize.width +
                    0.2 *
                    (nodePos[transform_specs[i].output_table_file][0] -
                        nodeSize.width -
                        Math.max(
                            nodePos[transform_specs[i].input_table_file[0]][0],
                            nodePos[transform_specs[i].input_table_file[1]][0]
                        ));
                pos = [
                    (nodePos[transform_specs[i].output_table_file][0] + meetingPosX) / 2 -
                    svgSize.width / 2,
                    (nodePos[transform_specs[i].output_table_file][1] +
                        nodeSize.height / 2 +
                        meetingPosY) /
                    2 -
                    svgSize.height -
                    10,
                ];
            }

            let rule = transform_specs[i].operation_rule;
            let dataIn1_csv, dataIn2_csv, dataOut1_csv, dataOut2_csv;
            let input_explicit_col = [],
                output_explicit_col = [];
            let input_explicit_row = [],
                output_explicit_row = [];
            let input_implicit_col = [];
            let input_table_name,
                output_table_name,
                input_table_name2,
                output_table_name2;
            let replace_value;
            let axis;
            let res;

            if (
                transform_specs[i].input_table_file &&
                transform_specs[i].input_table_file[0] !== "*"
            ) {
                if (typeof transform_specs[i].input_table_file === "string") {
                    dataIn1_csv = data_df[transform_specs[i].input_table_file];
                } else {
                    dataIn1_csv = data_df[transform_specs[i].input_table_file[0]];
                    if (transform_specs[i].input_table_file.length > 1)
                        dataIn2_csv = data_df[transform_specs[i].input_table_file[1]];
                }
            }
            if (
                transform_specs[i].output_table_file &&
                transform_specs[i].output_table_file[0] !== "#"
            ) {
                if (typeof transform_specs[i].output_table_file === "string") {
                    dataOut1_csv = data_df[transform_specs[i].output_table_file];
                } else {
                    dataOut1_csv = data_df[transform_specs[i].output_table_file[0]];
                    if (transform_specs[i].output_table_file.length > 1)
                        dataOut2_csv = data_df[transform_specs[i].output_table_file[1]];
                }
            }
            if (transform_specs[i].input_explicit_col) {
                for (
                    let col = 0; col < transform_specs[i].input_explicit_col.length; col++
                ) {
                    input_explicit_col.push(
                        dataIn1_csv[0].indexOf(transform_specs[i].input_explicit_col[col])
                    );
                }
            }
            if (transform_specs[i].output_explicit_col) {
                for (
                    let col = 0; col < transform_specs[i].output_explicit_col.length; col++
                ) {
                    output_explicit_col.push(
                        dataOut1_csv[0].indexOf(transform_specs[i].output_explicit_col[col])
                    );
                }
            }
            if (transform_specs[i].input_explicit_row) {
                input_explicit_row = transform_specs[i].input_explicit_row;
            }
            if (transform_specs[i].output_explicit_row) {
                output_explicit_row = transform_specs[i].output_explicit_row;
            }
            if (transform_specs[i].input_table_name) {
                if (typeof transform_specs[i].input_table_name === "string")
                    input_table_name = transform_specs[i].input_table_name;
                else {
                    input_table_name = transform_specs[i].input_table_name[0];
                    if (transform_specs[i].input_table_name.length > 1)
                        input_table_name2 = transform_specs[i].input_table_name[1];
                }
            }
            if (transform_specs[i].output_table_name) {
                if (typeof transform_specs[i].output_table_name === "string")
                    output_table_name = transform_specs[i].output_table_name;
                else {
                    output_table_name = transform_specs[i].output_table_name[0];
                    if (transform_specs[i].output_table_name.length > 1)
                        output_table_name2 = transform_specs[i].output_table_name[1];
                }
            }
            if (transform_specs[i].replace_value) {
                replace_value = transform_specs[i].replace_value;
            }
            if (transform_specs[i].input_implicit_col) {
                if (typeof transform_specs[i].input_implicit_col === "string") {
                    input_implicit_col = [
                        dataIn1_csv[0].indexOf(transform_specs[i].input_implicit_col),
                    ];
                } else {
                    for (
                        let col = 0; col < transform_specs[i].input_implicit_col.length; col++
                    ) {
                        input_implicit_col.push(
                            dataIn1_csv[0].indexOf(transform_specs[i].input_implicit_col[col])
                        );
                    }
                }
            }
            if (transform_specs[i].axis) {
                axis = parseInt(transform_specs[i].axis);
            }
            const row_diff = 1;

            let genVisArray = {};
            let inputColor = [];
            let outputColor = [];

            switch (transform_specs[i].type) {
                case "create_columns_mutate":
                case "create_columns_extract":
                case "create_columns_merge":
                    res = generateData(
                        dataIn1_csv,
                        dataOut1_csv,
                        input_explicit_col.concat(input_implicit_col),
                        output_explicit_col
                    );

                    genVisArray.rule = rule;
                    genVisArray.type = TransformType.CreateColumns;
                    genVisArray.arrange = Arrange.Col;

                    for (let idx = 0; idx < res.m1[0].length; idx++) {
                        // console.log(idx);
                        inputColor.push(idx)
                    }


                    for (let idx = 0; idx < res.m2[0].length; idx++) {
                        outputColor.push(idx)
                    }

                    genVisArray.in = [{
                        data: res.m1,
                        name: input_table_name,
                        color: inputColor,
                        scale: {
                            x: res.m1[0].length / dataIn1_csv[0].length,
                            y: (res.m1.length - row_diff) / (dataIn1_csv.length - row_diff)
                        },
                        linkCol: res.inExp
                    }];
                    genVisArray.out = [{
                        data: res.m2,
                        name: output_table_name,
                        color: outputColor,
                        scale: {
                            x: res.m2[0].length / dataOut1_csv[0].length,
                            y: (res.m2.length - row_diff) / (dataOut1_csv.length - row_diff)
                        },
                        linkCol: res.outExp
                    }];
                    break;
                case "transform_columns_rename":
                    // res = generateDataForColumnRename(
                    //     dataIn1_csv,
                    //     dataOut1_csv,
                    //     input_explicit_col
                    // );
                    res = generateData(
                        dataIn1_csv,
                        dataOut1_csv,
                        input_explicit_col.concat(input_implicit_col),
                        output_explicit_col
                    );

                    genVisArray.rule = rule;
                    genVisArray.type = TransformType.CreateColumns;
                    genVisArray.arrange = Arrange.Col;

                    for (let idx = 0; idx < res.m1[0].length; idx++) {
                        inputColor.push(idx)
                    }


                    for (let idx = 0; idx < res.m2[0].length; idx++) {
                        outputColor.push(idx)
                    }

                    genVisArray.in = [{
                        data: res.m1,
                        name: input_table_name,
                        color: inputColor,
                        scale: {
                            x: res.m1[0].length / dataIn1_csv[0].length,
                            y: (res.m1.length - row_diff) / (dataIn1_csv.length - row_diff)
                        },
                        linkCol: res.inExp
                    }];
                    genVisArray.out = [{
                        data: res.m2,
                        name: output_table_name,
                        color: outputColor,
                        scale: {
                            x: res.m2[0].length / dataOut1_csv[0].length,
                            y: (res.m2.length - row_diff) / (dataOut1_csv.length - row_diff)
                        },
                        linkCol: res.outExp
                    }];
                    break;
                case "delete_columns_select_keep":
                    res = generateDataForKeepColumns(
                        dataIn1_csv,
                        dataOut1_csv,
                        input_explicit_col
                    );

                    genVisArray.rule = rule;
                    genVisArray.type = TransformType.DeleteColumns;
                    genVisArray.arrange = Arrange.Col;

                    for (let idx = 0; idx < res.m1[0].length; idx++) {
                        inputColor.push(idx)
                    }

                    genVisArray.in = [{
                        data: res.m1,
                        name: input_table_name,
                        color: inputColor,
                        scale: {
                            x: res.m1[0].length / dataIn1_csv[0].length,
                            y: (res.m1.length - row_diff) / (dataIn1_csv.length - row_diff)
                        },
                        linkCol: res.expAfter
                    }];
                    genVisArray.out = [{
                        data: res.m2,
                        name: output_table_name,
                        color: res.outColors,
                        scale: {
                            x: res.m2[0].length / dataOut1_csv[0].length,
                            y: (res.m2.length - row_diff) / (dataOut1_csv.length - row_diff)
                        },
                        linkCol: res.expAfter
                    }];
                    break;
                case "delete_rows_filter":
                    res = generateDataForRows(
                        dataIn1_csv,
                        dataOut1_csv,
                        input_explicit_col
                    );

                    genVisArray.rule = rule;
                    genVisArray.type = TransformType.DeleteRows;
                    genVisArray.arrange = Arrange.Row;

                    // inputColor = []
                    for (let idx = 0; idx < res.m1.length - 1; idx++) {
                        inputColor.push(idx)
                    }

                    genVisArray.in = [{
                        data: res.m1,
                        name: input_table_name,
                        color: inputColor,
                        scale: {
                            x: res.m1[0].length / dataIn1_csv[0].length,
                            y: (res.m1.length - row_diff) / (dataIn1_csv.length - row_diff)
                        }
                    }];
                    genVisArray.out = [{
                        data: res.m2,
                        name: output_table_name,
                        color: res.outColors,
                        scale: {
                            x: res.m2[0].length / dataOut1_csv[0].length,
                            y: (res.m2.length - row_diff) / (dataOut1_csv.length - row_diff)
                        }
                    }];
                    break;
                default:
                    console.log("transformation type:",transform_specs[i].type);
            }
            draw_glyph(i, {
                x: pos[0],
                y: pos[1]
            }, genVisArray)

        }

        svgPanZoom(`#mainsvg`);
    });
    var provenance_info = {
        "nodePos": nodePos,
        "specsToHandle": specsToHandle
    }
    return provenance_info
}

export {
    gen_provenance,
    drawEdge,
    drawNode,
    getTableInfo
}
