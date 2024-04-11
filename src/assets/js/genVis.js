import * as d3 from "d3";
import ELK from "elkjs";
import { create_table } from "@/assets/js/glyph/createTables";
import { create_row, create_row_insert } from "@/assets/js/glyph/createRows";
import { delete_table } from "@/assets/js/glyph/deleteTables";
import {
  create_column,
  create_column_create,
} from "@/assets/js/glyph/createColumns";
import {
  delete_column,
  delete_dropna,
  delete_duplicate,
} from "@/assets/js/glyph/deleteColumns";
import {
  delete_duplicate_row_partColumn,
  delete_filter,
  delete_row,
} from "@/assets/js/glyph/deleteRows";
import {
  transform_tables_fold,
  transform_tables_rearrange,
  transform_tables_sort,
  transform_tables_unfold,
} from "@/assets/js/glyph/transformTables";
import {
  transform_columns_mutate,
  transform_columns_replace_na,
} from "@/assets/js/glyph/transformColumns";
import { combine_columns_merge } from "@/assets/js/glyph/combineColumns";
import {
  combine_rows_interpolate,
  combine_rows_sum,
} from "@/assets/js/glyph/combineRows";
import { transform_rows_edit } from "@/assets/js/glyph/transformRows";
import {
  separate_tables_decompose,
  separate_tables_split,
  separate_tables_subset,
} from "@/assets/js/glyph/separateTables";
import { separate_columns } from "@/assets/js/glyph/separateColumns";
import { separate_rows } from "@/assets/js/glyph/separateRows";
import {
  combine_tables_extend,
  combine_tables_full_join,
  combine_tables_inner_join,
  combine_tables_left_join,
} from "@/assets/js/glyph/combineTables";
import { generateDataForCreateTable } from "@/assets/js/utils/genDataForCreateTables";
import {
  generateData,
  generateDataForCreateColumns,
  generateDataForCreateColumns_create,
  generateDataForCreateColumns_extract,
} from "@/assets/js/utils/genDataForCreateColumns";
import { generateDataForInsertRows } from "@/assets/js/utils/genDataForCreateRows";
import {
  generateDataForDeleteColumn,
  generateDataForDeleteNaColumn,
  generateDataForKeepColumns,
} from "@/assets/js/utils/genDataForDeleteColumns";
import { getDuplicatedColumns } from "@/assets/js/utils/common/getDuplicatedColumns";
import {
  generateDataForDeleteDuplicateRows,
  generateDataForFilterRow,
  generateDataForRows,
} from "@/assets/js/utils/genDataForDeleteRows";
import {
  generateDataForColumnRearrange,
  generateDataForFold,
  generateDataForTableSort,
} from "@/assets/js/utils/genDataForTransformTable";
import {
  generateDataForColumnRename,
  generateDataForMutate_cover,
  generateDataForReplace,
} from "@/assets/js/utils/genDataForTransformColumns";
import { generateDataForMergeColumns } from "@/assets/js/utils/genDataForCombineColumns";
import {
  generateDataForGroupSummarize,
  generateDataForRowInterpolate,
} from "@/assets/js/utils/genDataForCombineRows";
import { generateDataForEditRow } from "@/assets/js/utils/genDataForTransformRows";
import {
  generateDataForSeparateDecompose,
  generateDataForSeparateDecompose_q,
  generateDataForSeparateSplit,
  generateDataForSeparateSubset,
} from "@/assets/js/utils/genDataForSeparateTables";
import { generateDataForSeparateColumn } from "@/assets/js/utils/genDataForSeparateColumns";
import { generateDataForSeparateRows } from "@/assets/js/utils/genDataForSeparateRows";
import {
  generateDataForFullJoin_2,
  generateDataForInnerJoin,
  generateDataForLeftJoin_2,
  generateDataForTablesExtend_withExplicitCol,
} from "@/assets/js/utils/genDataForCombineTables";
import { identical_operation } from "@/assets/js/glyph/identicalOperation";
import { getGraphs } from "@/assets/js/utils/renderTree/getLayout";
import { drawNode, drawEdge } from "@/assets/js/utils/renderTree/render";
import { getComponents } from "@/assets/js/utils/renderTree/getComponents";
import { svgSize, nodeSize } from "@/assets/js/config/config";

import {
  generateDataForTablesConcat,
  generateDataForSummarize_python,
} from "@/assets/js/utils/generateDataForPython";
import {
  combine_tables_extend_axis0,
  combine_tables_extend_axis1,
} from "@/assets/js/glyph/glyphs_for_python";

function getTableInfo(data_df) {
  var tableInf = {};
  for (var dfn in data_df) {
    tableInf[dfn] = [dfn, data_df[dfn].length, data_df[dfn][0].length];
  }
  return tableInf;
}

function genVis(dsl, data_df) {
  console.log(dsl, data_df);
  var specsToHandle = Array.from(dsl);
  for (let idx = 0; idx < specsToHandle.length; idx++) {
    if (specsToHandle[idx].type === "separate_tables_decompose") {
      specsToHandle[idx].output_table_file = specsToHandle[
        idx
      ].output_table_file.slice(
        0,
        Math.min(2, specsToHandle[idx].output_table_file.length)
      );
      specsToHandle[idx].output_table_name = specsToHandle[
        idx
      ].output_table_name.slice(
        0,
        Math.min(2, specsToHandle[idx].output_table_name.length)
      );
    }
  }

  let nullInfileCount = "*",
    nullOutfileCount = "#";
  specsToHandle.forEach((spec) => {
    if (!spec.input_table_file) {
      spec["input_table_file"] = nullInfileCount;
      nullInfileCount += "*";
    }
    if (!spec.output_table_file) {
      spec["output_table_file"] = nullOutfileCount;
      nullOutfileCount += "#";
    }
  });

  let { groups, edges } = getComponents(specsToHandle);

  let graphs = getGraphs(groups, edges);

  console.log(graphs);

  let svgWidth = 0,
    svgHeight = 0;

  let nodePos = {};
  // const ELK = require("elkjs");

  // const elk = new ELK();

  // const graph = {
  //   id: "root",
  //   layoutOptions: { "elk.algorithm": "layered" },
  //   children: [
  //     { id: "n1", width: 30, height: 30 },
  //     { id: "n2", width: 30, height: 30 },
  //     { id: "n3", width: 30, height: 30 },
  //   ],
  //   edges: [
  //     { id: "e1", sources: ["n1"], targets: ["n2"] },
  //     { id: "e2", sources: ["n1"], targets: ["n3"] },
  //   ],
  // };

  // elk.layout(graphs[0]).then(console.log).catch(console.error);

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
        })
        .then(() => {
          resolve();
        });
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

    console.log(specsToHandle, nodePos);
    const g = d3.select("#mainsvg").append("g");
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
          svgSize.height / 2
            ? svgSize.height / 2
            : 0;
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
          let col = 0;
          col < transform_specs[i].input_explicit_col.length;
          col++
        ) {
          input_explicit_col.push(
            dataIn1_csv[0].indexOf(transform_specs[i].input_explicit_col[col])
          );
        }
      }
      if (transform_specs[i].output_explicit_col) {
        for (
          let col = 0;
          col < transform_specs[i].output_explicit_col.length;
          col++
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
            let col = 0;
            col < transform_specs[i].input_implicit_col.length;
            col++
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
      switch (transform_specs[i].type) {
        case "create_tables":
          res = generateDataForCreateTable(dataOut1_csv);
          create_table(
            res,
            rule,
            output_table_name,
            i,
            true,
            pos,
            res[0].length / dataOut1_csv[0].length,
            (res.length - row_diff) / (dataOut1_csv.length - row_diff)
          );
          break;
        // case "create_columns_merge":
        //     res = generateDataForCreateColumns(
        //         dataIn1_csv,
        //         dataOut1_csv,
        //         input_explicit_col,
        //         output_explicit_col
        //     );
        //     create_column(
        //         res.m1,
        //         res.m2,
        //         rule,
        //         input_table_name,
        //         output_table_name,
        //         input_explicit_col,
        //         i,
        //         true,
        //         pos, [
        //             res.m1[0].length / dataIn1_csv[0].length,
        //             res.m2[0].length / dataOut1_csv[0].length,
        //         ], [
        //             (res.m1.length - row_diff) / (dataIn1_csv.length - row_diff),
        //             (res.m2.length - row_diff) / (dataOut1_csv.length - row_diff),
        //         ]
        //     );
        //     break;
        // case "create_columns_extract":
        //     res = generateDataForCreateColumns_extract(
        //         dataIn1_csv,
        //         dataOut1_csv,
        //         input_explicit_col,
        //         output_explicit_col
        //     );
        //     create_column(
        //         res.m1,
        //         res.m2,
        //         rule,
        //         input_table_name,
        //         output_table_name,
        //         input_explicit_col,
        //         i,
        //         true,
        //         pos, [
        //             res.m1[0].length / dataIn1_csv[0].length,
        //             res.m2[0].length / dataOut1_csv[0].length,
        //         ], [
        //             (res.m1.length - row_diff) / (dataIn1_csv.length - row_diff),
        //             (res.m2.length - row_diff) / (dataOut1_csv.length - row_diff),
        //         ]
        //     );
        //     break;
        case "create_columns_mutate":
        case "create_columns_extract":
        case "create_columns_merge":
          res = generateData(
            dataIn1_csv,
            dataOut1_csv,
            input_explicit_col.concat(input_implicit_col),
            output_explicit_col
          );
          if (
            transform_specs[i].input_table_file === "L6 (wb_tens).csv" &&
            transform_specs[i].output_table_file === "L7 (wb_tens).csv"
          ) {
            res.m1[2][1] = "M";
            res.m1[3][1] = "H";

            res.m2[2][1] = "M";
            res.m2[3][1] = "H";
            res.m2[2][2] = "16";
            res.m2[3][2] = "17";
          }
          create_column(
            res.m1,
            res.m2,
            rule,
            input_table_name,
            output_table_name,
            res.inExp,
            res.outExp,
            i,
            true, // vm.show_table_name
            pos,
            [
              res.m1[0].length / dataIn1_csv[0].length,
              res.m2[0].length / dataOut1_csv[0].length,
            ],
            [
              (res.m1.length - row_diff) / (dataIn1_csv.length - row_diff),
              (res.m2.length - row_diff) / (dataOut1_csv.length - row_diff),
            ]
          );
          break;
        case "create_columns_create":
          res = generateDataForCreateColumns_create(
            dataIn1_csv,
            dataOut1_csv,
            output_explicit_col
          );
          create_column_create(
            res.m1,
            res.m2,
            rule,
            input_table_name,
            output_table_name,
            i,
            true,
            pos,
            [
              res.m1[0].length / dataIn1_csv[0].length,
              res.m2[0].length / dataOut1_csv[0].length,
            ],
            [
              (res.m1.length - row_diff) / (dataIn1_csv.length - row_diff),
              (res.m2.length - row_diff) / (dataOut1_csv.length - row_diff),
            ]
          );
          break;
        case "create_rows_create":
          let m1 = [],
            m2 = [];
          for (let row = 0; row <= Math.min(2, dataIn1_csv.length - 1); row++) {
            let tempRow = [];
            for (let col = 0; col < Math.min(3, dataIn1_csv[0].length); col++) {
              tempRow.push("");
            }
            m1.push(tempRow);
            m2.push(tempRow);
          }
          m2.push(dataOut1_csv[dataOut1_csv.length - 1]);
          create_row(
            m1,
            m2,
            rule,
            input_table_name,
            output_table_name,
            1,
            i,
            true,
            pos,
            [
              m1[0].length / dataIn1_csv[0].length,
              m2[0].length / dataOut1_csv[0].length,
            ],
            [
              (m1.length - row_diff) / (dataIn1_csv.length - row_diff),
              (m2.length - row_diff) / (dataOut1_csv.length - row_diff),
            ]
          );
          break;
        case "create_rows_insert":
          res = generateDataForInsertRows(
            dataIn1_csv,
            dataOut1_csv,
            output_explicit_row[0]
          );
          create_row_insert(
            res.m1,
            res.m2,
            rule,
            input_table_name,
            output_table_name,
            res.inColors,
            res.outColors,
            res.inIdx,
            res.outIdx,
            i,
            true,
            pos,
            [
              res.m1[0].length / dataIn1_csv[0].length,
              res.m2[0].length / dataOut1_csv[0].length,
            ],
            [
              (res.m1.length - row_diff) / (dataIn1_csv.length - row_diff),
              (res.m2.length - row_diff) / (dataOut1_csv.length - row_diff),
            ]
          );
          break;
        case "delete_tables":
          res = generateData(dataIn1_csv, dataOut1_csv, [], []);
          delete_table(
            res.m1,
            rule,
            input_table_name,
            i,
            true,
            pos,
            [res.m1[0].length / dataIn1_csv[0].length],
            [(res.m1.length - row_diff) / (dataIn1_csv.length - row_diff)]
          );
          break;
        case "delete_columns_select_keep":
          res = generateDataForKeepColumns(
            dataIn1_csv,
            dataOut1_csv,
            input_explicit_col
          );

          delete_column(
            res.m1,
            res.m2,
            rule,
            input_table_name,
            output_table_name,
            res.outColors,
            i,
            true,
            pos,
            [
              res.m1[0].length / dataIn1_csv[0].length,
              res.m2[0].length / dataOut1_csv[0].length,
            ],
            [
              (res.m1.length - row_diff) / (dataIn1_csv.length - row_diff),
              (res.m2.length - row_diff) / (dataOut1_csv.length - row_diff),
            ]
          );
          break;
        case "delete_columns_select_remove":
          res = generateDataForDeleteColumn(
            dataIn1_csv,
            dataOut1_csv,
            input_explicit_col
          );
          // console.log(res);
          delete_column(
            res.m1,
            res.m2,
            rule,
            input_table_name,
            output_table_name,
            res.outColors,
            i,
            true,
            pos,
            [
              res.m1[0].length / dataIn1_csv[0].length,
              res.m2[0].length / dataOut1_csv[0].length,
            ],
            [
              (res.m1.length - row_diff) / (dataIn1_csv.length - row_diff),
              (res.m2.length - row_diff) / (dataOut1_csv.length - row_diff),
            ]
          );
          break;
        case "delete_columns_duplicate":
          let dupCols = getDuplicatedColumns(dataIn1_csv);
          res = generateData(dataIn1_csv, dataOut1_csv, dupCols, [dupCols[0]]);
          let curCol = [];
          dupCols.forEach((value, idx) => {
            curCol.push(res.m1[0].indexOf(dataIn1_csv[0][value]));
          });
          delete_duplicate(
            res.m1,
            res.m2,
            curCol,
            rule,
            input_table_name,
            output_table_name,
            i,
            true,
            pos,
            [
              res.m1[0].length / dataIn1_csv[0].length,
              res.m2[0].length / dataOut1_csv[0].length,
            ],
            [
              (res.m1.length - row_diff) / (dataIn1_csv.length - row_diff),
              (res.m2.length - row_diff) / (dataOut1_csv.length - row_diff),
            ]
          );
          break;
        case "delete_columns_dropna":
          res = generateDataForDeleteNaColumn(dataIn1_csv, dataOut1_csv);
          delete_dropna(
            res.m1,
            res.m2,
            rule,
            input_table_name,
            output_table_name,
            res.inColors,
            res.outColors,
            [res.Row, res.Col],
            i,
            true,
            pos,
            [
              res.m1[0].length / dataIn1_csv[0].length,
              res.m2[0].length / dataOut1_csv[0].length,
            ],
            [
              (res.m1.length - row_diff) / (dataIn1_csv.length - row_diff),
              (res.m2.length - row_diff) / (dataOut1_csv.length - row_diff),
            ]
          );
          break;
        case "delete_rows_filter":
          res = generateDataForRows(
            dataIn1_csv,
            dataOut1_csv,
            input_explicit_col
          );

          delete_row(
            res.m1,
            res.m2,
            rule,
            input_table_name,
            output_table_name,
            res.outColors,
            i,
            true,
            pos,
            [
              res.m1[0].length / dataIn1_csv[0].length,
              res.m2[0].length / dataOut1_csv[0].length,
            ],
            [
              (res.m1.length - row_diff) / (dataIn1_csv.length - row_diff),
              (res.m2.length - row_diff) / (dataOut1_csv.length - row_diff),
            ]
          );
          break;
        // case 'delete_rows_filter_keep':
        //   res = generateDataForFilterRowKeep(dataIn1_csv,dataOut1_csv,input_explicit_row)
        //   delete_row_keep(res.m1,res.m2,rule,input_table_name,output_table_name,res.inIndex,res.outIndex,res.inColors,res.outColors)
        //   break

        case "delete_rows_deduplicate":
          if (input_explicit_col.length === 0)
            input_explicit_col = Array.from(
              new Array(dataIn1_csv[0].length),
              (x, i) => i
            );
          res = generateDataForDeleteDuplicateRows(
            dataIn1_csv,
            dataOut1_csv,
            input_explicit_col
          );
          // console.log(
          //   "partition: ",
          //   res.m2[0].length / dataOut1_csv[0].length
          // );
          delete_duplicate_row_partColumn(
            res.m1,
            res.m2,
            rule,
            input_table_name,
            output_table_name,
            res.inColors,
            res.outColors,
            i,
            true,
            pos,
            [
              res.m1[0].length / dataIn1_csv[0].length,
              res.m2[0].length / dataOut1_csv[0].length,
            ],
            [
              (res.m1.length - row_diff) / (dataIn1_csv.length - row_diff),
              (res.m2.length - row_diff) / (dataOut1_csv.length - row_diff),
            ]
          );
          break;
        case "delete_rows_slice":
          res = generateDataForFilterRow(
            dataIn1_csv,
            dataOut1_csv,
            input_explicit_col[0]
          );
          delete_filter(
            res.m1,
            res.m2,
            rule,
            input_table_name,
            output_table_name,
            res.outColors,
            i,
            true,
            pos,
            [
              res.m1[0].length / dataIn1_csv[0].length,
              res.m2[0].length / dataOut1_csv[0].length,
            ],
            [
              (res.m1.length - row_diff) / (dataIn1_csv.length - row_diff),
              (res.m2.length - row_diff) / (dataOut1_csv.length - row_diff),
            ]
          );
          break;
        case "transform_tables_rearrange":
          res = generateDataForColumnRearrange(
            dataIn1_csv,
            dataOut1_csv,
            output_explicit_col
          );
          transform_tables_rearrange(
            res.m1,
            res.m2,
            rule,
            input_table_name,
            output_table_name,
            res.inColors,
            res.outColors,
            i,
            true,
            pos,
            [
              res.m1[0].length / dataIn1_csv[0].length,
              res.m2[0].length / dataOut1_csv[0].length,
            ],
            [
              (res.m1.length - row_diff) / (dataIn1_csv.length - row_diff),
              (res.m2.length - row_diff) / (dataOut1_csv.length - row_diff),
            ]
          );
          break;
        case "transform_tables_sort":
          // 暂定为只对数值类型进行排序
          res = generateDataForTableSort(
            dataIn1_csv,
            dataOut1_csv,
            input_explicit_col,
            rule
          );

          transform_tables_sort(
            res.m1,
            res.m2,
            rule,
            input_table_name,
            output_table_name,
            res.outColor,
            i,
            true,
            pos,
            [
              res.m1[0].length / dataIn1_csv[0].length,
              res.m2[0].length / dataOut1_csv[0].length,
            ],
            [
              (res.m1.length - row_diff) / (dataIn1_csv.length - row_diff),
              (res.m2.length - row_diff) / (dataOut1_csv.length - row_diff),
            ]
          );
          break;
        case "transform_columns_replace_na":
          res = generateDataForReplace(
            dataIn1_csv,
            dataOut1_csv,
            input_explicit_col
          );
          transform_columns_replace_na(
            res.m1,
            res.m2,
            rule,
            input_table_name,
            output_table_name,
            input_explicit_col,
            res.naRow,
            i,
            true,
            pos,
            [
              res.m1[0].length / dataIn1_csv[0].length,
              res.m2[0].length / dataOut1_csv[0].length,
            ],
            [
              (res.m1.length - row_diff) / (dataIn1_csv.length - row_diff),
              (res.m2.length - row_diff) / (dataOut1_csv.length - row_diff),
            ]
          );
          break;
        case "transform_columns_replace":
          //没有实现阴影效果
          res = generateDataForReplace(
            dataIn1_csv,
            dataOut1_csv,
            input_explicit_col,
            replace_value
          );
          transform_columns_replace_na(
            res.m1,
            res.m2,
            rule,
            input_table_name,
            output_table_name,
            input_explicit_col,
            res.naRow,
            i,
            true,
            pos,
            [
              res.m1[0].length / dataIn1_csv[0].length,
              res.m2[0].length / dataOut1_csv[0].length,
            ],
            [
              (res.m1.length - row_diff) / (dataIn1_csv.length - row_diff),
              (res.m2.length - row_diff) / (dataOut1_csv.length - row_diff),
            ]
          );
          break;
        case "transform_columns_mutate":
          res = generateDataForMutate_cover(
            dataIn1_csv,
            dataOut1_csv,
            input_explicit_col,
            output_explicit_col
          );
          transform_columns_mutate(
            res.m1,
            res.m2,
            rule,
            input_table_name,
            output_table_name,
            res.inExp,
            res.outExp,
            i,
            true,
            pos,
            [
              res.m1[0].length / dataIn1_csv[0].length,
              res.m2[0].length / dataOut1_csv[0].length,
            ],
            [
              (res.m1.length - row_diff) / (dataIn1_csv.length - row_diff),
              (res.m2.length - row_diff) / (dataOut1_csv.length - row_diff),
            ]
          );
          break;
        case "transform_columns_extract":
        case "transform_columns_merge":
          res = generateDataForMutate_cover(
            dataIn1_csv,
            dataOut1_csv,
            input_explicit_col,
            output_explicit_col
          );
          transform_columns_mutate(
            res.m1,
            res.m2,
            rule,
            input_table_name,
            output_table_name,
            res.inExp,
            res.outExp,
            i,
            true,
            pos,
            [
              res.m1[0].length / dataIn1_csv[0].length,
              res.m2[0].length / dataOut1_csv[0].length,
            ],
            [
              (res.m1.length - row_diff) / (dataIn1_csv.length - row_diff),
              (res.m2.length - row_diff) / (dataOut1_csv.length - row_diff),
            ]
          );
          break;
        // case "transform_columns_merge":
        //     res = generateDataForMutate_cover(
        //         dataIn1_csv,
        //         dataOut1_csv,
        //         input_explicit_col,
        //         output_explicit_col
        //     );
        //     transform_columns_mutate(
        //         res.m1,
        //         res.m2,
        //         rule,
        //         input_table_name,
        //         output_table_name,
        //         input_explicit_col,
        //         output_explicit_col,
        //         i,
        //         true,
        //         pos, [
        //             res.m1[0].length / dataIn1_csv[0].length,
        //             res.m2[0].length / dataOut1_csv[0].length,
        //         ], [
        //             (res.m1.length - row_diff) / (dataIn1_csv.length - row_diff),
        //             (res.m2.length - row_diff) / (dataOut1_csv.length - row_diff),
        //         ]
        //     );
        //     break;
        case "transform_columns_rename":
          res = generateDataForColumnRename(
            dataIn1_csv,
            dataOut1_csv,
            input_explicit_col
          );
          transform_columns_mutate(
            res.m1,
            res.m2,
            rule,
            input_table_name,
            output_table_name,
            res.expAfter,
            res.expAfter,
            i,
            true,
            pos,
            [
              res.m1[0].length / dataIn1_csv[0].length,
              res.m2[0].length / dataOut1_csv[0].length,
            ],
            [
              (res.m1.length - row_diff) / (dataIn1_csv.length - row_diff),
              (res.m2.length - row_diff) / (dataOut1_csv.length - row_diff),
            ]
          );
          break;
        case "combine_columns_merge":
          res = generateDataForMergeColumns(
            dataIn1_csv,
            dataOut1_csv,
            input_explicit_col.sort(),
            output_explicit_col
          );
          combine_columns_merge(
            res.m1,
            res.m2,
            rule,
            input_table_name,
            output_table_name,
            res.newInExpOrImp,
            res.newOutExpOrImp,
            res.outColors,
            i,
            true,
            pos,
            [
              res.m1[0].length / dataIn1_csv[0].length,
              res.m2[0].length / dataOut1_csv[0].length,
            ],
            [
              (res.m1.length - row_diff) / (dataIn1_csv.length - row_diff),
              (res.m2.length - row_diff) / (dataOut1_csv.length - row_diff),
            ]
          );
          break;
        case "combine_columns_mutate":
          res = generateDataForMergeColumns(
            dataIn1_csv,
            dataOut1_csv,
            input_explicit_col,
            output_explicit_col
          );
          combine_columns_merge(
            res.m1,
            res.m2,
            rule,
            input_table_name,
            output_table_name,
            res.newInExpOrImp,
            res.newOutExpOrImp,
            res.outColors,
            i,
            true,
            pos,
            [
              res.m1[0].length / dataIn1_csv[0].length,
              res.m2[0].length / dataOut1_csv[0].length,
            ],
            [
              (res.m1.length - row_diff) / (dataIn1_csv.length - row_diff),
              (res.m2.length - row_diff) / (dataOut1_csv.length - row_diff),
            ]
          );
          break;
        // case 'combine_rows_sum':
        //   res = generateDataForRowsSum(dataIn1_csv,dataOut1_csv)
        //   combine_rows_sum(res.m1,res.m2,rule,input_table_name,output_table_name,i,true)
        //   break
        case "combine_rows_summarize":
          //这个操作再看看
          res = generateDataForGroupSummarize(
            dataIn1_csv,
            dataOut1_csv,
            input_explicit_col,
            input_implicit_col,
            output_explicit_col
            // input_implicit_col
          );
          // console.log("summarize res: ",res)
          if (
            input_table_name === "bailey" &&
            input_explicit_col.length === 1 &&
            dataIn1_csv[0][input_explicit_col[0]] === "OWNERNME1"
          ) {
            (res.m1[1][0] = ""),
              (res.m1[1][1] = "WILLIAMS  JILL S"),
              (res.m1[1][2] = "");
            res.m1.push(["", "JENKINS  MAZIE HEIRS", ""]);
            res.m1.push(["", "RUSHING JR & RUSHING TRUSTEES", ""]);
            (res.m2[1][0] = "WILLIAMS  JILL S"), (res.m2[1][1] = "1");
            res.m2[2] = ["JENKINS  MAZIE HEIRS", "1"];
            res.m2[3] = ["RUSHING JR & RUSHING TRUSTEES", "4"];
          }
          // res.m2[1][0] = 'WILLIAMS  JILL S',res.m2[1][1] = "3209.61"
          // res.m2[2][0] = 'JENKINS  MAZIE HEIRS',res.m2[2][1] = "2242.1"
          // res.m2[3][0] = 'RUSHING JR & RUSHING TRUSTEES',res.m2[3][1] = "8837.51"
          combine_rows_sum(
            res.m1,
            res.m2,
            rule,
            input_table_name,
            output_table_name,
            i,
            true,
            pos,
            [
              res.m1[0].length / dataIn1_csv[0].length,
              res.m2[0].length / dataOut1_csv[0].length,
            ],
            [
              (res.m1.length - row_diff) / (dataIn1_csv.length - row_diff),
              (res.m2.length - row_diff) / (dataOut1_csv.length - row_diff),
            ],
            res.outColor
          );
          break;
        case "combine_rows_interpolate":
          res = generateDataForRowInterpolate(
            dataIn1_csv,
            dataOut1_csv,
            input_explicit_col
          );
          combine_rows_interpolate(
            res.m1,
            res.m2,
            rule,
            input_table_name,
            output_table_name,
            res.naPos,
            i,
            true,
            pos,
            [
              res.m1[0].length / dataIn1_csv[0].length,
              res.m2[0].length / dataOut1_csv[0].length,
            ],
            [
              (res.m1.length - row_diff) / (dataIn1_csv.length - row_diff),
              (res.m2.length - row_diff) / (dataOut1_csv.length - row_diff),
            ]
          );
          break;
        case "transform_rows_edit":
          res = generateDataForEditRow(
            dataIn1_csv,
            dataOut1_csv,
            input_explicit_row
          );
          transform_rows_edit(
            res.m1,
            res.m2,
            rule,
            input_table_name,
            output_table_name,
            res.rowIndex,
            i,
            true,
            pos,
            [
              res.m1[0].length / dataIn1_csv[0].length,
              res.m2[0].length / dataOut1_csv[0].length,
            ],
            [
              (res.m1.length - row_diff) / (dataIn1_csv.length - row_diff),
              (res.m2.length - row_diff) / (dataOut1_csv.length - row_diff),
            ]
          );
          break;
        case "separate_tables_subset":
          res = generateDataForSeparateSubset(
            dataIn1_csv,
            dataOut1_csv,
            input_explicit_col
          );
          separate_tables_subset(
            res.m1,
            res.m2,
            res.m3,
            rule,
            input_table_name,
            output_table_name,
            output_table_name2,
            res.outColor1,
            res.outColor2,
            i,
            true,
            pos,
            [
              res.m1[0].length / dataIn1_csv[0].length,
              res.m2[0].length / dataIn2_csv[0].length,
              res.m3[0].length / dataOut1_csv[0].length,
            ],
            [
              (res.m1.length - row_diff) / (dataIn1_csv.length - row_diff),
              (res.m2.length - row_diff) / (dataIn2_csv - row_diff),
              (res.m3.length - row_diff) / (dataOut1_csv.length - row_diff),
            ]
          );
          break;
        case "separate_tables_decompose":
          res = generateDataForSeparateDecompose(
            dataIn1_csv,
            input_explicit_col
          );
          let x_Percents = res.m1[0].length / dataIn1_csv[0].length;
          // for (let idx = 0; idx < res.tables.length; idx++) {
          //   // console.log(res.tables[idx]);
          //   xPercents.push(xPercents[0]);
          //   yPercents.push((res.tables[idx].length-1)/(tableInf[output_tables[idx].length-1]));
          // }

          separate_tables_decompose(
            res.m1,
            res.tables,
            rule,
            input_table_name,
            [output_table_name, output_table_name2],
            i,
            true,
            pos,
            [x_Percents, x_Percents, x_Percents],
            [
              (res.m1.length - row_diff) / (dataIn1_csv.length - row_diff),
              (res.tables[0].length - row_diff) /
                (dataOut1_csv.length - row_diff),
              (res.tables[1].length - row_diff) /
                (dataOut2_csv.length - row_diff),
            ]
          );
          break;
        case "separate_tables_decompose_q":
          res = generateDataForSeparateDecompose_q(
            dataIn1_csv,
            dataOut1_csv,
            dataOut2_csv,
            input_explicit_col
          );
          separate_tables_subset(
            res.m1,
            res.m2,
            res.m3,
            rule,
            input_table_name,
            output_table_name,
            output_table_name2,
            res.outColor1,
            res.outColor2,
            i,
            true,
            pos,
            [
              res.m1[0].length / dataIn1_csv[0].length,
              res.m2[0].length / dataOu1_csv[0].length,
              res.m3[0].length / dataOut2_csv[0].length,
            ],
            [
              (res.m1.length - row_diff) / (dataIn1_csv.length - row_diff),
              (res.m2.length - row_diff) / (dataOu1_csv.length - row_diff),
              (res.m3.length - row_diff) / (dataOut2_csv.length - row_diff),
            ]
          );
          break;
        case "separate_tables_split":
          res = generateDataForSeparateSplit(
            dataIn1_csv,
            input_explicit_col,
            input_implicit_col
          );
          separate_tables_split(
            res.m1,
            res.m2,
            res.m3,
            rule,
            input_table_name,
            output_table_name,
            output_table_name2,
            res.colors1,
            res.colors2,
            i,
            true,
            pos,
            [
              res.m1[0].length / dataIn1_csv[0].length,
              res.m2[0].length / dataOu1_csv[0].length,
              res.m3[0].length / dataOut2_csv[0].length,
            ],
            [
              (res.m1.length - row_diff) / (dataIn1_csv.length - row_diff),
              (res.m2.length - row_diff) / (dataOu1_csv - row_diff),
              (res.m3.length - row_diff) / (dataOut2_csv.length - row_diff),
            ]
          );
          break;
        case "separate_columns":
          res = generateDataForSeparateColumn(
            dataIn1_csv,
            dataOut1_csv,
            input_explicit_col,
            output_explicit_col
          );
          separate_columns(
            res.m1,
            res.m2,
            rule,
            input_table_name,
            output_table_name,
            res.inExp,
            res.outExp,
            i,
            true,
            pos,
            [
              res.m1[0].length / dataIn1_csv[0].length,
              res.m2[0].length / dataOut1_csv[0].length,
            ],
            [
              (res.m1.length - row_diff) / (dataIn1_csv.length - row_diff),
              (res.m2.length - row_diff) / (dataOut1_csv.length - row_diff),
            ]
          );
          break;
        case "separate_rows":
          res = generateDataForSeparateRows(
            dataIn1_csv,
            dataOut1_csv,
            input_explicit_col
          );
          separate_rows(
            res.m1,
            res.m2,
            rule,
            input_table_name,
            output_table_name,
            res.outColors,
            i,
            true,
            pos,
            [
              res.m1[0].length / dataIn1_csv[0].length,
              res.m2[0].length / dataOut1_csv[0].length,
            ],
            [
              (res.m1.length - row_diff) / (dataIn1_csv.length - row_diff),
              (res.m2.length - row_diff) / (dataOut1_csv.length - row_diff),
            ]
          );
          break;
        case "combine_tables_extend":
          res = {};
          if (!transform_specs[i].input_explicit_col) {
            // res = generateDataForTablesExtend(
            //   dataIn1_csv,
            //   dataIn2_csv,
            //   dataOut1_csv
            // );
            // console.log("res: ",res)

            let sameColName = "";
            for (let col = 0; col < dataIn1_csv[0].length; col++) {
              if (dataIn2_csv[0].indexOf(dataIn1_csv[0][col]) !== -1) {
                sameColName = dataIn1_csv[0][col];
                res = generateDataForTablesExtend_withExplicitCol(
                  dataIn1_csv,
                  dataIn2_csv,
                  dataOut1_csv,
                  [sameColName]
                );
                break;
              }
            }
          } else {
            res = generateDataForTablesExtend_withExplicitCol(
              dataIn1_csv,
              dataIn2_csv,
              dataOut1_csv,
              transform_specs[i].input_explicit_col
            );
          }
          combine_tables_extend(
            res.m1,
            res.m2,
            res.m3,
            rule,
            input_table_name,
            input_table_name2,
            output_table_name,
            res.inColors1,
            res.inColors2,
            res.outColors,
            i,
            true,
            pos,
            [
              res.m1[0].length / dataIn1_csv[0].length,
              res.m2[0].length / dataIn2_csv[0].length,
              res.m3[0].length / dataOut1_csv[0].length,
            ],
            [
              (res.m1.length - row_diff) / (dataIn1_csv.length - row_diff),
              (res.m2.length - row_diff) / (dataIn2_csv.length - row_diff),
              (res.m3.length - row_diff) / (dataOut1_csv.length - row_diff),
            ]
          );
          break;
        case "combine_tables_left_join":
          //需要确定空值的表示形式，暂时以''表示空值
          res = generateDataForLeftJoin_2(
            dataIn1_csv,
            dataIn2_csv,
            dataOut1_csv,
            input_explicit_col,
            "NA"
          );
          combine_tables_left_join(
            res.m1,
            res.m2,
            res.m3,
            rule,
            input_table_name,
            input_table_name2,
            output_table_name,
            res.naCol,
            res.naPos,
            res.inColor1,
            res.inColor2,
            res.outColor,
            i,
            true,
            pos,
            [
              res.m1[0].length / dataIn1_csv[0].length,
              res.m2[0].length / dataIn2_csv[0].length,
              res.m3[0].length / dataOut1_csv[0].length,
            ],
            [
              (res.m1.length - row_diff) / (dataIn1_csv.length - row_diff),
              (res.m2.length - row_diff) / (dataIn2_csv.length - row_diff),
              (res.m3.length - row_diff) / (dataOut1_csv.length - row_diff),
            ]
          );
          break;
        case "combine_tables_full_join":
          res = generateDataForFullJoin_2(
            dataIn1_csv,
            dataIn2_csv,
            dataOut1_csv,
            input_explicit_col,
            "NA"
          );
          combine_tables_full_join(
            res.m1,
            res.m2,
            res.m3,
            rule,
            input_table_name,
            input_table_name2,
            output_table_name,
            res.naCol,
            res.naPos,
            res.inColor1,
            res.inColor2,
            res.outColor,
            i,
            true,
            pos,
            [
              res.m1[0].length / dataIn1_csv[0].length,
              res.m2[0].length / dataIn2_csv[0].length,
              res.m3[0].length / dataOut1_csv[0].length,
            ],
            [
              (res.m1.length - row_diff) / (dataIn1_csv.length - row_diff),
              (res.m2.length - row_diff) / (dataIn2_csv.length - row_diff),
              (res.m3.length - row_diff) / (dataOut1_csv.length - row_diff),
            ]
          ),
            true;
          break;
        case "combine_tables_inner_join":
          res = generateDataForInnerJoin(
            dataIn1_csv,
            dataIn2_csv,
            dataOut1_csv,
            input_explicit_col,
            "NA"
          );
          if (
            input_table_name === "r27_input2" &&
            input_table_name2 === "TBL_4" &&
            output_table_name === "TBL_1"
          ) {
            res.m1 = [
              ["id", "clnt"],
              ["", "6"],
              ["", "5"],
            ];
            res.m2 = [
              ["clnt", "mean.order"],
              ["1", ""],
            ];
            res.m3 = [
              ["id", "clnt", "mean.order"],
              ["", "6", ""],
              ["", "5", ""],
            ];
            res.inColors2 = [2];
            res.outColor = [0, 1];
          }
          combine_tables_inner_join(
            res.m1,
            res.m2,
            res.m3,
            rule,
            input_table_name,
            input_table_name2,
            output_table_name,
            res.inColors2,
            res.outColor,
            i,
            true,
            pos,
            [
              res.m1[0].length / dataIn1_csv[0].length,
              res.m2[0].length / dataIn2_csv[0].length,
              res.m3[0].length / dataOut1_csv[0].length,
            ],
            [
              (res.m1.length - row_diff) / (dataIn1_csv.length - row_diff),
              (res.m2.length - row_diff) / (dataIn2_csv.length - row_diff),
              (res.m3.length - row_diff) / (dataOut1_csv.length - row_diff),
            ]
          );
          break;
        case "transform_tables_fold":
          res = generateDataForFold(
            dataIn1_csv,
            dataOut1_csv,
            input_explicit_col,
            output_explicit_col
          );
          transform_tables_fold(
            res.m1,
            res.m2,
            rule,
            input_table_name,
            output_table_name,
            input_explicit_col.length,
            i,
            true,
            pos,
            [
              res.m1[0].length / dataIn1_csv[0].length,
              res.m2[0].length / dataOut1_csv[0].length,
            ],
            [
              (res.m1.length - row_diff) / (dataIn1_csv.length - row_diff),
              (res.m2.length - row_diff) / (dataOut1_csv.length - row_diff),
            ]
          );
          break;
        case "transform_tables_unfold":
          output_explicit_col = [];
          for (let col = 0; col < dataOut1_csv[0].length; col++) {
            if (dataIn1_csv[0].indexOf(dataOut1_csv[0][col]) === -1) {
              output_explicit_col.push(col);
            }
          }

          let diffVals = new Set();
          for (let row = 1; row < dataIn1_csv.length; row++) {
            diffVals.add(dataIn1_csv[row][input_explicit_col[0]]);
          }
          res = generateDataForFold(
            dataOut1_csv,
            dataIn1_csv,
            output_explicit_col,
            input_explicit_col
          );
          transform_tables_unfold(
            res.m2,
            res.m1,
            rule,
            input_table_name,
            output_table_name,
            diffVals.size,
            i,
            true,
            pos,
            [
              res.m2[0].length / dataIn1_csv[0].length,
              res.m1[0].length / dataOut1_csv[0].length,
            ],
            [
              (res.m2.length - row_diff) / (dataIn1_csv.length - row_diff),
              (res.m1.length - row_diff) / (dataOut1_csv.length - row_diff),
            ]
          );
          break;
        case "identical_operation":
          identical_operation(pos, i, rule);
          break;

        case "combine_tables_extend_column":
          res = generateDataForTablesConcat(
            dataIn1_csv,
            dataIn2_csv,
            dataOut1_csv,
            1
          );
          combine_tables_extend_axis1(
            res.m1,
            res.m2,
            res.m3,
            rule,
            input_table_name,
            input_table_name2,
            output_table_name,
            res.inColors2,
            i,
            true,
            pos,
            [
              res.m1[0].length / dataIn1_csv[0].length,
              res.m2[0].length / dataIn2_csv[0].length,
              res.m3[0].length / dataOut1_csv[0].length,
            ],
            [
              (res.m1.length - row_diff) / (dataIn1_csv.length - row_diff),
              (res.m2.length - row_diff) / (dataIn2_csv.length - row_diff),
              (res.m3.length - row_diff) / (dataOut1_csv.length - row_diff),
            ]
          );
          break;
        case "combine_tables_extend_row":
          res = generateDataForTablesConcat(
            dataIn1_csv,
            dataIn2_csv,
            dataOut1_csv,
            0
          );
          combine_tables_extend_axis0(
            res.m1,
            res.m2,
            res.m3,
            rule,
            input_table_name,
            input_table_name2,
            output_table_name,
            res.inColors2,
            i,
            true,
            pos,
            [
              res.m1[0].length / dataIn1_csv[0].length,
              res.m2[0].length / dataIn2_csv[0].length,
              res.m3[0].length / dataOut1_csv[0].length,
            ],
            [
              (res.m1.length - row_diff) / (dataIn1_csv.length - row_diff),
              (res.m2.length - row_diff) / (dataIn2_csv.length - row_diff),
              (res.m3.length - row_diff) / (dataOut1_csv.length - row_diff),
            ]
          );
          break;
        // case 'combine_tables_concat_python':
        //   res = generateDataForTablesConcat(dataIn1_csv, dataIn2_csv,dataOut1_csv,axis)
        //   if(axis === 1){
        //     combine_tables_extend_axis1(
        //       res.m1,
        //       res.m2,
        //       res.m3,
        //       rule,
        //       input_table_name,
        //       input_table_name2,
        //       output_table_name,
        //       res.inColors2,
        //       i,
        //       true,
        //       pos,
        //       [res.m1[0].length / dataIn1_csv[0].length, res.m2[0].length / dataIn2_csv[0].length, res.m3[0].length / dataOut1_csv[0].length],
        //       [(res.m1.length-row_diff) / (dataIn1_csv.length-row_diff), (res.m2.length-row_diff) / (dataIn2_csv.length-row_diff), (res.m3.length-row_diff) / (dataOut1_csv.length-row_diff)]
        //     );
        //   }else{
        //     combine_tables_extend_axis0(
        //       res.m1,
        //       res.m2,
        //       res.m3,
        //       rule,
        //       input_table_name,
        //       input_table_name2,
        //       output_table_name,
        //       res.inColors2,
        //       i,
        //       true,
        //       pos,
        //       [res.m1[0].length / dataIn1_csv[0].length, res.m2[0].length / dataIn2_csv[0].length, res.m3[0].length / dataOut1_csv[0].length],
        //       [(res.m1.length-row_diff) / (dataIn1_csv.length-row_diff), (res.m2.length-row_diff) / (dataIn2_csv.length-row_diff), (res.m3.length-row_diff) / (dataOut1_csv.length-row_diff)]
        //     );
        //   }
        // break;
        case "create_rows_summarize":
          res = generateDataForSummarize_python(dataIn1_csv, dataOut1_csv);
          create_row(
            res.m1,
            res.m2,
            rule,
            input_table_name,
            output_table_name,
            1,
            i,
            true,
            pos,
            [
              res.m1[0].length / dataIn1_csv[0].length,
              res.m2[0].length / dataOut1_csv[0].length,
            ],
            [
              (res.m1.length - row_diff) / (dataIn1_csv.length - row_diff),
              (res.m2.length - row_diff) / (dataOut1_csv.length - row_diff),
            ]
          );
          break;
      }
    }

    svgPanZoom("#mainsvg");
    // let g = drawSvgAndEdge(specsToHandle, nodePos, "100%", "100%");
    // preparation(specsToHandle, nodePos, table_path);
  });
}

function drawBarChart() {
  const data = [10, 20, 30, 40, 50];

  const svg = d3.select("svg");

  const xScale = d3
    .scaleBand()
    .domain(data.map((d, i) => i))
    .range([0, 400])
    .padding(0.1);

  const yScale = d3
    .scaleLinear()
    .domain([0, d3.max(data)])
    .range([200, 0]);

  svg
    .selectAll("rect")
    .data(data)
    .enter()
    .append("rect")
    .attr("x", (d, i) => xScale(i))
    .attr("y", (d) => yScale(d))
    .attr("width", xScale.bandwidth())
    .attr("height", (d) => 200 - yScale(d))
    .attr("fill", "steelblue");

  svgPanZoom("#mainsvg");
}

export { drawBarChart, genVis };
