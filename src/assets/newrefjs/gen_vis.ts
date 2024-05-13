// glyph设计：https://shimo.im/docs/ppGhvvjdtwDprg8K

import * as d3 from 'd3';
import { draw_glyph } from '@assets/newrefjs/gen_glyph'
import { VisData, TransformType, Arrange, SortType, GenDataType, GenTblCols } from '@assets/newrefjs/interface'
import { gen_data, extract_glyph_cols } from "@assets/newrefjs/gen_data";

function convert2TableArray(tbl) {
  // 获取所有列名
  const columns = Object.keys(tbl[0]);

  // 构建二维数组，将列名作为第一行
  const tableArray = [columns];

  // 遍历订单数据，将每个订单的值存储为一个行数组，并添加到表数组中
  for (const ti of tbl) {
    const row = columns.map((column) => ti[column].toString());
    tableArray.push(row);
  }

  return tableArray;
}

function dsl_vis_adapter(dsl: Array<any>, data_df, lang: "en" | "cn" = "en"): VisData[] {
  let visArray: VisData[] = [];
  for (const step of dsl) {
    let visData: VisData = {} as VisData;
    let rule = { en: "", cn: "" }
    let in_tbls: any[], out_tbls: any[]
    let in_cols: GenTblCols[], out_cols: GenTblCols[]
    let res
    switch (step.function_id) {
      case "filter":
        if (step.keep == true) {
          rule.en = "Keep rows where " + step.source_column
          rule.cn = "保留 " + step.source_column + " 中"
        } else {
          rule.en = "Delete rows where " + step.source_column
          rule.cn = "删除 " + step.source_column + " 中"
        }
        switch (step.filter_type) {
          case 'null':
            rule.en += "is null"
            rule.cn += "为 null 的记录"
            break
          case 'not_null':
            rule.en += "is not null"
            rule.cn += "不为 null 的记录"
            break
          case 'equals':
            rule.en += "is = " + step.arguments
            rule.cn += " = " + step.arguments + "的记录"
            break
          case 'not_equals':
            rule.en += "is <> " + step.arguments
            rule.cn += " <> " + step.arguments + "的记录"
            break
          case "start_with":
            rule.en += "is like %" + step.arguments;
            rule.cn += " 以 " + step.arguments + "开头的记录";
            break;
          case "end_with":
            rule.en += "is like " + step.arguments + "%";
            rule.cn += " 以 " + step.arguments + "结尾的记录";
            break;
          case "contains":
            rule.en += "is like %" + step.arguments + "%";
            rule.cn += " 包含 %" + step.arguments + "% 的记录";
            break;
          case "greater_than":
            if (step.equals1 == true) {
              rule.en += "is >= " + step.arguments;
              rule.cn += " >= " + step.arguments + "的记录";
            } else {
              rule.en += "is > " + step.arguments;
              rule.cn += " > " + step.arguments + "的记录";
            }
            break;
          case "less_than":
            if (step.equals1 == true) {
              rule.en += "is <= " + step.arguments;
              rule.cn += " <= " + step.arguments + "的记录";
            } else {
              rule.en += "is < " + step.arguments;
              rule.cn += " < " + step.arguments + "的记录";
            }
            break;
          case "one_of":
            rule.en += " in (";
            rule.cn += " 在集合 (";
            for (const item in step.arguments) {
              rule.en += "'" + item + "'";
              rule.cn += "'" + item + "'";
            }
            rule.en += ")";
            rule.cn += ") 中";
            break;
          case "between":
            if (step.equals1 == true) {
              rule.en += " >= " + step.left;
              rule.cn += " >= " + step.left;
            } else {
              rule.en += " > " + step.left;
              rule.cn += " > " + step.left;
            }
            if (step.equals2 == true) {
              rule.en += "and <= " + step.right;
              rule.cn += "并且 <= " + step.right + " 的记录";
            } else {
              rule.en += " < " + step.right;
              rule.cn += "并且 < " + step.right + " 的记录";
            }
            break;
          case "between_and":
            rule.en += " between " + step.left + " and " + step.right;
            rule.cn +=
              "在" + step.left + " 和 " + step.right + " 之间的记录";
            break;
          case "regexp":
            rule.en += "rlike '" + step.arguments + "'";
            rule.cn += " 符合正则 '" + step.arguments + "' 的记录";
            break;
          case "not_regexp":
            rule.en += "not rlike '" + step.arguments + "'";
            rule.cn += " 不符合正则 '" + step.arguments + "' 的记录";
            break;
          default:
            rule.en += "Unknow rule";
            rule.cn += "Unknow rule";
        }

        in_tbls = step.source_tables.map(tbl => data_df[tbl])
        out_tbls = step.target_tables.map(tbl => data_df[tbl])
        in_cols = [{
          all: Array.from(in_tbls[0][0]),
          explicit: [step.source_column],
          implicit: [],
          context: []
        }]
        out_cols = [{
          all: Array.from(out_tbls[0][0]),
          explicit: [],
          implicit: [],
          context: []
        }]
        // let in_cols: GenTblCols<string>[] = [{
        //   all: ["a", "b", "c", "d", "e", "f"],
        //   explicit: ["e"],
        //   implicit: [],
        //   context: []
        // }]
        // let out_cols: GenTblCols<string>[] = [{
        //   all: ["a", "b", "c", "d", "e", "f"],
        //   explicit: [],
        //   implicit: [],
        //   context: []
        // }]
        extract_glyph_cols(in_cols, out_cols)
        // console.log(in_cols, out_cols);

        res = gen_data(GenDataType.DeleteRows, { in: in_tbls, out: out_tbls }, { in: step.source_tables, out: step.target_tables }, { in: in_cols, out: out_cols })
        visData.in = res.in
        visData.out = res.out
        visData.type = TransformType.DeleteRows;
        visData.arrange = Arrange.Row;
        visData.rule = rule[lang]
        visArray.push(visData)
        break

      case "add":
        rule.en = `Mutate: ${step.target_column} = ${step.source_column} + ${step.arguments}`
        rule.cn = `计算：${step.target_column} = ${step.source_column} + ${step.arguments}`

        in_tbls = step.source_tables.map(tbl => data_df[tbl])
        out_tbls = step.target_tables.map(tbl => data_df[tbl])
        in_cols = [{
          all: Array.from(in_tbls[0][0]),
          explicit: [step.source_column, step.arguments],
          implicit: [],
          context: []
        }]
        out_cols = [{
          all: Array.from(out_tbls[0][0]),
          explicit: [step.target_column],
          implicit: [],
          context: []
        }]
        extract_glyph_cols(in_cols, out_cols)
        // console.log(in_cols, out_cols);

        res = gen_data(GenDataType.FirstRows, { in: in_tbls, out: out_tbls }, { in: step.source_tables, out: step.target_tables }, { in: in_cols, out: out_cols })
        console.log(res);
        visData.in = res.in
        visData.out = res.out
        visData.type = TransformType.CreateColumns;
        visData.arrange = Arrange.Col;
        visData.rule = rule[lang]
        visArray.push(visData)
        break
    }

  }
  return visArray
}


export function gen_vis(data: { "dsl": Array<any>, "data_df": any }, lang: "en" | "cn" = "en") {
  const width = window.innerWidth;
  const height = window.innerHeight - 100;

  const somnus_svg = d3.select("body").append("svg")
    .attr("id", "somnus_svg")
    .attr('width', width)
    .attr('height', height);

  let data_df = {}
  for (const dfi in data.data_df) {
    data_df[dfi] = convert2TableArray(data.data_df[dfi]);
  }

  let visArray = dsl_vis_adapter(data.dsl, data_df, lang)
  visArray.forEach((vis, i) => {
    draw_glyph(somnus_svg, i, { x: i * 260, y: 200 }, vis)
  })

  /*
  let visData2: VisData[] = [{
    in: [
      {
        data: [["amount1", "amount2"], ["100.2", "50.33"], ["75.12", "25"], ["200.1", "100"]],
        name: "input1, input1,input12,23",
        color: [0, 1],
        scale: {
          x: 0.2,  // 展示出来的列数 / 原表的列数
          y: 0.5
        },
        linkCol: [0, 1]
      }
    ],
    out: [{
      data: [["amount1", "amount2", "amount123"], ["100.2", "50.33", "150.53"], ["75.12", "25", "100.12"], ["200.1", "100", "300.1"]],
      name: "output2nput1, input1,input12,1234",
      color: [0, 2, 2],
      scale: {
        x: 0.2,
        y: 0.3
      },
      linkCol: [1]
    }],
    rule: 'create_columns_mutatecreate_columns_mutatecr',
    type: TransformType.CreateColumns,
    arrange: Arrange.Col
  }, {
    in: [
      {
        data: [["amount1"], ["100.2"], ["75.12"], ["200.1"]],
        name: "input1, input1,input12,23",
        color: [0],
        scale: {
          x: 0.2,
          y: 0.5
        },
        linkCol: [0]
      }
    ],
    out: [{
      data: [["amount1", "amount2", "amount123"], ["100.2", "50.33", "150.53"], ["75.12", "25", "100.12"], ["200.1", "100", "300.1"]],
      name: "output2nput1, input1,input12,1234",
      color: [0, 1, 2],
      scale: {
        x: 0.2,
        y: 0.3
      },
      linkCol: [1, 2]
    }],
    rule: 'create_columns_mutatecreate_columns_mutatecr',
    type: TransformType.CreateColumns,
    arrange: Arrange.Col
  }, {
    in: [
      {
        data: [["", "product_name", "total_amount"], ["", "", ""], ["", "", ""], ["", "", ""]],
        name: "input1, input1,input12,23",
        color: [0, 1, 2],
        scale: {
          x: 0.2,
          y: 0.5
        },
        // linkCol: [0]
      }
    ],
    out: [{
      data: [["product_name", "total_amount"], ["", ""], ["", ""], ["", ""]],
      name: "output2nput1, input1,input12,1234",
      color: [1, 2],
      scale: {
        x: 0.2,
        y: 0.3
      },
      // linkCol: [0, 2]
    }],
    rule: 'create_columns_mutatecreate_columns_mutatecr',
    type: TransformType.DeleteColumns,
    arrange: Arrange.Col
  }, {
    in: [
      {
        data: [["", "order_date", ""], ["", "2024-01-02", ""], ["", "2024-01-03", ""], ["", "2023-01-07", ""]],
        name: "input1",
        color: [0, 1, 2],
        scale: {
          x: 0.2,
          y: 0.5
        },
        // linkCol: [0, 2]
      }
    ],
    out: [{
      data: [["", "order_date", ""], ["", "2024-01-02", ""], ["", "2024-01-03", ""]],
      name: "example_output",
      color: [2, 1, 0],
      scale: {
        x: 0.2,
        y: 0.3
      },
      // linkCol: [0]
    }],
    rule: 'Example Explanation',
    type: TransformType.DeleteRows,
    arrange: Arrange.Col
  }, {
    in: [
      {
        data: [["", "order_date", ""], ["", "2024-01-02", ""], ["", "2024-01-03", ""], ["", "2023-01-07", ""]],
        name: "input1, input1,input12,23",
        color: [0, 1, 2],
        scale: {
          x: 0.2,
          y: 0.5
        }
      },
      {
        data: [["", "order_date"], ["", "2024-01-02"]],
        name: "output2nput1, input1,input12,1234",
        color: [1],
        scale: {
          x: 0.2,
          y: 0.3
        }
      }
    ],
    out: [{
      data: [["", "order_date", ""], ["", "2024-01-02", ""]],
      name: "output2nput1, input1,input12,1234",
      color: [1],
      scale: {
        x: 0.2,
        y: 0.3
      }
    }],
    rule: 'create_columns_mutatecreate_columns_mutatecr',
    type: TransformType.CombineTables,
    arrange: Arrange.Row
  }, {
    in: [
      {
        data: [["amount1", "amount2", "amount123"], ["100.2", "50.33", "150.53"], ["75.12", "25", "100.12"]],
        name: "input1, input1,input12,23",
        color: [0, 1, 2],
        scale: {
          x: 0.2,
          y: 0.5
        }
      }
    ],
    out: [{
      data: [["amount1", "amount2", "amount123"], ["100.2", "50.33", "150.53"], ["75.12", "25", "100.12"], ["200.1", "100", "300.1"]],
      name: "output2nput1, input1,input12,1234",
      color: [0, 1, 2],
      scale: {
        x: 0.2,
        y: 0.3
      }
    }],
    rule: 'create_columns_mutatecreate_columns_mutatecr',
    type: TransformType.TransformTables,
    arrange: Arrange.Row
  }]
  visData2.forEach((vis, i) => {
    draw_glyph(somnus_svg, i, { x: i * 260, y: 200 }, vis)
  })

  let visData3: VisData[] = [{
    in: [
      {
        data: [["", "n"], ["", "1"], ["", "2"]],
        name: "input1, input1,input12,23",
        color: [0, 1, 2],
        scale: {
          x: 0.2,
          y: 0.5
        }
      }
    ],
    out: [{
      data: [["12345678", "n"], ["", "6"], ["", "2"], ["", "1"]],
      name: "output2nput1, input1,input12,1234",
      color: [2, 1, 0],
      scale: {
        x: 0.2,
        y: 0.3
      },
      sortCol: [SortType.Desc, SortType.Asc]
    }],
    rule: 'create_columns_mutatecreate_columns_mutatecr',
    type: TransformType.TransformTables,
    arrange: Arrange.Row
  }, {
    in: [
    ],
    out: [{
      data: [["12345678", "n"], ["", "6"], ["", "2"], ["", "1"]],
      name: "output2nput1, input1,input12,1234",
      color: [2, 1, 0],
      scale: {
        x: 0.2,
        y: 0.3
      }
    }],
    rule: 'create_columns_mutatecreate_columns_mutatecr',
    type: TransformType.CreateTables,
    arrange: Arrange.Col
  }, {
    in: [{
      data: [["12345678", "n"], ["", "6"], ["", "2"], ["", "1"]],
      name: "output2nput1, input1,input12,1234",
      color: [2, 1, 0],
      scale: {
        x: 0.2,
        y: 0.3
      }
    }, {
      data: [["", "n"], ["", "1"], ["", "2"]],
      name: "input1, input1,input12,23",
      color: [0, 1, 2],
      scale: {
        x: 0.2,
        y: 0.5
      }
    }
    ],
    out: [],
    rule: 'create_columns_mutatecreate_columns_mutatecr',
    type: TransformType.DeleteTables,
    arrange: Arrange.Row
  }, {
    in: [{
      data: [["", "", "total"], ["", "", "230"], ["", "", "64"], ["", "", "140"]],
      name: "output2nput1, input1,input12,1234",
      color: [2, 1, 0],
      scale: {
        x: 0.2,
        y: 0.3
      }
    }
    ],
    out: [{
      data: [["", "", "total"], ["", "", "230"]],
      name: "input1, input1,input12,23",
      color: [0, 1, 2],
      scale: {
        x: 0.2,
        y: 0.5
      }
    }],
    rule: 'create_columns_mutatecreate_columns_mutatecr',
    type: TransformType.DeleteRows,
    arrange: Arrange.Row
  }]

  visData3.forEach((vis, i) => {
    draw_glyph(somnus_svg, i, { x: i * 260, y: 400 }, vis)
  })
  */

  //@ts-ignore
  svgPanZoom("#somnus_svg");

}
