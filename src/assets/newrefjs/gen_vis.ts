// glyph设计：https://shimo.im/docs/ppGhvvjdtwDprg8K

import * as d3 from 'd3';
import { draw_glyph, draw_text } from '@assets/newrefjs/gen_glyph'
import { VisData, TransformType, Arrange, GenDataType, GenTblCols, Rect, SortType } from '@assets/newrefjs/interface'
import { gen_data, extract_glyph_cols, addElementToContext, mergeAndRemoveDuplicates } from "@assets/newrefjs/gen_data";
import { draw_provenance } from '@assets/newrefjs/gen_provenance'
import { svgName, svgSize, nodeSize } from '@assets/newrefjs/config'
import { Table } from '@assets/refjs/interface';

function sliceColArray<T>(colArray: T[], startElement: T, endElement: T): T[] {
  let startIndex: number;
  let endIndex: number;

  // 找到起始元素的索引
  startIndex = colArray.indexOf(startElement);
  if (startIndex === -1) {
    throw new Error(`起始元素 ${startElement} 在数组中不存在`);
  }

  // 找到结束元素的索引
  endIndex = colArray.indexOf(endElement);
  if (endIndex === -1) {
    throw new Error(`结束元素 ${endElement} 在数组中不存在`);
  }

  // 返回从起始索引到结束索引的切片，包含结束元素
  return colArray.slice(startIndex, endIndex + 1);
}

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
    let res = null
    let rule_column_list
    let source_column_list = []
    let target_column_list = []
    let temp_target_name = ""
    let concat_char = ""
    let join_table_name = ""
    let join_source_tables
    let join_info
    let join_columns = []

    // 根据操作类型生成rules并筛选data
    switch (step.function_id) {
      // 整列操作（保留字段）
      case "keep_columns":
        in_tbls = step.source_tables.map(tbl => data_df[tbl])
        out_tbls = step.target_tables.map(tbl => data_df[tbl])
        if ('source_columns' in step) {
          rule_column_list = step.source_columns.join(", ");
          rule.en = "Keep columns: " + rule_column_list;
          rule.cn = "保留列： " + rule_column_list;
          in_cols = [{
            all: Array.from(in_tbls[0][0]),
            explicit: [],
            implicit: step.source_columns,
            context: []
          }]
          out_cols = [{
            all: Array.from(out_tbls[0][0]),
            explicit: [],
            implicit: step.source_columns,
            context: []
          }]
        } else if ("start_column" in step && "end_column" in step) {
          rule.en = "Keep columns from " + step.start_column + " to " + step.end_column;
          rule.cn = "保留从 " + step.start_column + "到" + step.end_column + "的数据列";
          let source_column = []
          try {
            source_column = sliceColArray(Array.from(in_tbls[0][0]), step.start_column, step.end_column);
          } catch (error) {
            console.error(error);
          }
          in_cols = [{
            all: Array.from(in_tbls[0][0]),
            explicit: [],
            implicit: source_column,
            context: []
          }]
          out_cols = [{
            all: Array.from(out_tbls[0][0]),
            explicit: [],
            implicit: [],
            context: []
          }]
        } else {
          rule.en = "Keep all columns";
          rule.cn = "保留所有列";
          in_cols = [{
            all: Array.from(in_tbls[0][0]),
            explicit: [],
            implicit: Array.from(in_tbls[0][0]),
            context: []
          }]
          out_cols = [{
            all: Array.from(out_tbls[0][0]),
            explicit: [],
            implicit: [],
            context: []
          }]
        }

        extract_glyph_cols(in_cols, out_cols)
        if (in_cols[0].all.length > out_cols[0].all.length) {
          addElementToContext(in_cols)
        }

        visData.type = TransformType.DeleteColumns;
        visData.arrange = Arrange.Col;

        res = gen_data(GenDataType.FirstRows, { in: in_tbls, out: out_tbls }, { in: step.source_tables, out: step.target_tables }, { in: in_cols, out: out_cols })

        break;
      // 整列操作（删除字段）
      case "delete_columns":
        rule_column_list = step.source_columns.join(", ");
        rule.en = "Delete columns: " + rule_column_list;
        rule.cn = "删除列： " + rule_column_list;
        in_tbls = step.source_tables.map(tbl => data_df[tbl])
        out_tbls = step.target_tables.map(tbl => data_df[tbl])
        in_cols = [{
          all: Array.from(in_tbls[0][0]),
          explicit: [],
          implicit: step.source_column,
          context: []
        }]
        out_cols = [{
          all: Array.from(out_tbls[0][0]),
          explicit: [],
          implicit: [],
          context: []
        }]

        extract_glyph_cols(in_cols, out_cols)

        visData.type = TransformType.DeleteColumns;
        visData.arrange = Arrange.Col;

        res = gen_data(GenDataType.FirstRows, { in: in_tbls, out: out_tbls }, { in: step.source_tables, out: step.target_tables }, { in: in_cols, out: out_cols })

        break;
      // 重命名
      case "biz_rename":
        source_column_list = []
        target_column_list = []
        rule.en = "Rename: "
        rule.cn = "重命名： "
        switch (step.rename_type) {
          case "special_name":
            step.conditions.forEach((condition: any) => {
              source_column_list.push(condition.source_column);
              target_column_list.push(condition.target_column);
              rule.en += condition.source_column + " to " + condition.target_column + "; "
              rule.cn += condition.source_column + " 修改为 " + condition.target_column + "；"
            });

            break;
          case "add_prefix":
            step.source_columns.forEach((source_column: any) => {
              source_column_list.push(source_column);
              temp_target_name = step.prefix + source_column;
              target_column_list.push(temp_target_name);
              rule.en += source_column + " to " + temp_target_name + "; "
              rule.cn += source_column + " 修改为 " + temp_target_name + "；"
            });

            break;
          case "add_suffix":
            step.source_columns.forEach((source_column: any) => {
              source_column_list.push(source_column);
              temp_target_name = source_column + step.suffix;
              target_column_list.push(temp_target_name);
              rule.en += source_column + " to " + temp_target_name + "; "
              rule.cn += source_column + " 修改为 " + temp_target_name + "；"
            });

            break;
          default:
            console.log("Unknow Rename!");
        }
        in_tbls = step.source_tables.map(tbl => data_df[tbl])
        out_tbls = step.target_tables.map(tbl => data_df[tbl])
        in_cols = [{
          all: Array.from(in_tbls[0][0]),
          explicit: [],
          implicit: source_column_list,
          context: []
        }]
        out_cols = [{
          all: Array.from(out_tbls[0][0]),
          explicit: [],
          implicit: target_column_list,
          context: []
        }]

        extract_glyph_cols(in_cols, out_cols)
        // out_cols[0].context =[]

        if (in_cols[0].implicit.length > 1) {
          in_cols[0].implicit = in_cols[0].implicit.filter(item => !out_cols[0].implicit.includes(item));
        }

        // if (in_cols[0].all.length > out_cols[0].all.length) {
        //   addElementToContext(in_cols)
        // }

        visData.type = TransformType.DeleteColumns;
        visData.arrange = Arrange.Col;

        res = gen_data(GenDataType.FirstRows, { in: in_tbls, out: out_tbls }, { in: step.source_tables, out: step.target_tables }, { in: in_cols, out: out_cols })

        break;
      // 排序操作
      case "order_by":
        let sort_type = "";
        if (step.asc) {
          rule.en = "Sort " + step.source_column + " by asc";
          rule.cn = "对" + step.source_column + "进行升序排序";
          sort_type = "asc";
        } else {
          rule.en = "Sort " + step.source_column + " by desc";
          rule.cn = "对" + step.source_column + "进行降序排序";
          sort_type = "desc";
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
          explicit: [step.target_column],
          implicit: [],
          context: []
        }]

        extract_glyph_cols(in_cols, out_cols);

        visData.type = TransformType.TransformTables;
        visData.arrange = Arrange.Row;

        res = gen_data(GenDataType.Sort, { in: in_tbls, out: out_tbls }, { in: step.source_tables, out: step.target_tables }, { in: in_cols, out: out_cols }, undefined, step.source_column, sort_type);

        break;
      // 自定义表达式
      case "expression":
        console.log("expression");
        // console.log(step.values[0].expressions);
        rule_column_list = step.values[0].expressions.join(", ");
        rule.en = "Expressions(" + step.values[0].function_id + "): " + rule_column_list;
        rule.cn = "自定义表达式（" + step.values[0].function_id + "）：" + rule_column_list;

        break;
      // 类型转换（数字转字符/转整型/转浮点型）
      case "cast":
        switch (step.arguments) {
          case "STRING":
            rule.en = "Change Type: " + step.source_column + " to STRING";
            rule.cn = "类型转换：" + step.source_column + "转换为字符型";
            break;
          case "Bigint":
            rule.en = "Change Type: " + step.source_column + " to Bigint";
            rule.cn = "类型转换：" + step.source_column + "转换为整型";
            break;
          case "Double":
            rule.en = "Change Type: " + step.source_column + " to Double";
            rule.cn = "类型转换：" + step.source_column + "转换为浮点型";
            break;
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

        extract_glyph_cols(in_cols, out_cols);

        visData.type = TransformType.CreateColumns;
        visData.arrange = Arrange.Col;

        res = gen_data(GenDataType.FirstRows, { in: in_tbls, out: out_tbls }, { in: step.source_tables, out: step.target_tables }, { in: in_cols, out: out_cols });

        break;
      // 类型转换（日期转字符/整型）
      case "date2_string":
      case "date2_bigint":
        rule.en = "Change date column: " + step.source_column;
        rule.cn = "将日期型列：" + step.source_column;
        switch (step.function_id) {
          case "date2_string":
            rule.en += " to string, format as " + step.arguments;
            rule.cn += "转换为字符型，格式为" + step.arguments;
            break;
          case "date2_bigint":
            rule.en += " to bigint, format as " + step.arguments;
            rule.cn += "转换为整型，格式为" + step.arguments;
            break;
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

        extract_glyph_cols(in_cols, out_cols);

        visData.type = TransformType.CreateColumns;
        visData.arrange = Arrange.Col;

        res = gen_data(GenDataType.FirstRows, { in: in_tbls, out: out_tbls }, { in: step.source_tables, out: step.target_tables }, { in: in_cols, out: out_cols });

        break;
      // 类型转换（转日期/时间戳）
      case "string2_date":
      case "string2_timestamp":
        rule.en = "Change string column: " + step.source_column;
        rule.cn = "将字符型列：" + step.source_column;

        switch (step.function_id) {
          case "string2_date":
            rule.en += " to date, format as " + step.arguments;
            rule.cn += "转换为日期型，格式为" + step.arguments;
            break;
          case "string2_timestamp":
            rule.en += " to timestamp, format as " + step.arguments;
            rule.cn += "转换为时间戳，格式为" + step.arguments;
            break;
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

        extract_glyph_cols(in_cols, out_cols);

        visData.type = TransformType.CreateColumns;
        visData.arrange = Arrange.Col;

        res = gen_data(GenDataType.FirstRows, { in: in_tbls, out: out_tbls }, { in: step.source_tables, out: step.target_tables }, { in: in_cols, out: out_cols });

        break;
      // 格式化
      case "upper":
      case "lower":
      case "Initcap":
      case "trim":
      case "ltrim":
      case "rtrim":
      case "remove_quota":
      case "trim_all_space":
      case "lpad":
      case "rpad":
      case "repeat":
      case "reverse":
      case "regex":
      case "concat":
      case "concat_ws":
      case "substr":
        rule.en = "Format column: " + step.source_column;
        rule.cn = "格式化列：" + step.source_column;

        switch (step.function_id) {
          case "upper":
            rule.en += " to upper";
            rule.cn += "转换为大写";
            break;
          case "lower":
            rule.en += " to lower";
            rule.cn += "转换为小写";
            break;
          case "Initcap":
            rule.en += " to initcap";
            rule.cn += "转换为首字母大写";
            break;
          case "trim":
            rule.en += " trim";
            rule.cn += "去除首尾空格";
            break;
          case "ltrim":
            rule.en += " ltrim";
            rule.cn += "去除左边空格";
            break;
          case "rtrim":
            rule.en += " rtrim";
            rule.cn += "去除右边空格";
            break;
          case "remove_quota":
            rule.en += " remove_quota";
            rule.cn += "去除首尾引号";
            break;
          case "trim_all_space":
            rule.en += " trim_all_space";
            rule.cn += "去除所有空格";
            break;
          case "lpad":
            rule.en += " lpad" + step.len + " " + step.pad;
            rule.cn += "向左补齐" + step.len + "个" + step.pad;
            break;
          case "rpad":
            rule.en += " rpad" + step.len + " " + step.pad;
            rule.cn += "向右补齐" + step.len + "个" + step.pad;
            break;
          case "repeat":
            rule.en += " repeat" + step.arguments;
            rule.cn += "向右补齐" + step.arguments + "次";
            break;
          case "reverse":
            rule.en += " reverse";
            rule.cn += "逆转字符串";
            break;
          case "regex":
            rule.en += " is" + step.arguments;
            rule.cn += "判断是否符合" + step.arguments;
            break;
          case "concat":
            concat_char = step.arguments.join(", ")
            rule.en += " concat" + concat_char;
            rule.cn += "拼接字符串" + concat_char;
            break;
          case "concat_ws":
            concat_char = step.arguments.join(", ")
            rule.en += " concat" + concat_char + " by sep " + step.sep;
            rule.cn += "拼接字符串" + concat_char + "通过分隔符" + step.sep;
            break;
          case "substr":
            rule.en += " substr start from " + step.start + " with len " + step.len;
            rule.cn += "截取从第" + step.start + "开始的，长度为" + step.len + "的子串";
            break;
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
          explicit: step.target_columns,
          implicit: [],
          context: []
        }]

        extract_glyph_cols(in_cols, out_cols);


        visData.type = TransformType.CreateColumns;
        visData.arrange = Arrange.Col;

        res = gen_data(GenDataType.FirstRows, { in: in_tbls, out: out_tbls }, { in: step.source_tables, out: step.target_tables }, { in: in_cols, out: out_cols });

        break;
      // 计算（四则运算）
      case "add":
      case "subtract":
      case "multiply":
      case "division":
        rule.en = "Mutate: " + step.target_column + " = " + step.source_column;
        rule.cn = "计算: " + step.target_column + " = " + step.source_column;
        switch (step.function_id) {
          case "add":
            rule.en += " + " + step.arguments;
            rule.cn += " + " + step.arguments;
            break;
          case "subtract":
            rule.en += " - " + step.arguments;
            rule.cn += " - " + step.arguments;
            break;
          case "multiply":
            rule.en += " * " + step.arguments;
            rule.cn += " * " + step.arguments;
            break;
          case "division":
            rule.en += " / " + step.arguments;
            rule.cn += " / " + step.arguments;
            break;
        }

        in_tbls = step.source_tables.map(tbl => data_df[tbl])
        out_tbls = step.target_tables.map(tbl => data_df[tbl])
        in_cols = [{
          all: Array.from(in_tbls[0][0]),
          explicit: [step.source_column],
          implicit: [],
          context: []
        }]
        if (Array.from(in_tbls[0][0]).includes(step.arguments)) {
          in_cols[0].explicit.push(step.arguments)
        }

        out_cols = [{
          all: Array.from(out_tbls[0][0]),
          explicit: [step.target_column],
          implicit: [],
          context: []
        }]
        extract_glyph_cols(in_cols, out_cols)


        visData.type = TransformType.CreateColumns;
        visData.arrange = Arrange.Col;

        res = gen_data(GenDataType.FirstRows, { in: in_tbls, out: out_tbls }, { in: step.source_tables, out: step.target_tables }, { in: in_cols, out: out_cols })

        break
      // 数学函数计算
      case "length":
      case "ceil":
      case "floor":
      case "exp":
      case "ln":
      case "log10":
      case "log":
      case "pow":
      case "sqrt":
      case "factorial":
      case "cbrt":
      case "is_null":
      case "abs":
      case "positive":
      case "negative":
      case "sign":
      case "sin":
      case "asin":
      case "cos":
      case "acos":
      case "tan":
      case "atan":
      case "degrees":
      case "radians":
        rule.en = "Mutate: " + step.source_column;
        rule.cn = "计算：" + step.source_column;

        switch (step.function_id) {
          case "length":
            rule.en += " calculate length";
            rule.cn += "计算长度";
            break;
          case "ceil":
            rule.en += " ceil";
            rule.cn += "小数向上取整";
            break;
          case "floor":
            rule.en += " floor";
            rule.cn += "小数向下取整";
            break;
          case "exp":
            rule.en += " exp";
            rule.cn += "自然指数";
            break;
          case "ln":
            rule.en += " ln";
            rule.cn += "自然对数";
            break;
          case "log10":
            rule.en += " log10";
            rule.cn += "以10为底的对数";
            break;
          case "log":
            rule.en += " log" + step.arguments;
            rule.cn += "以" + step.arguments + "为底的对数";
            break;
          case "pow":
            rule.en += " pow" + step.arguments;
            rule.cn += step.arguments + "次幂";
            break;
          case "sqrt":
            rule.en += " sqrt";
            rule.cn += "平方根";
            break;
          case "factorial":
            rule.en += " factorial";
            rule.cn += "阶乘";
            break;
          case "cbrt":
            rule.en += " cbrt";
            rule.cn += "立方根";
            break;
          case "is_null":
            if (step.arguments == "Null") {
              rule.en += " is null";
              rule.cn += "是否为空";
            } else {
              rule.en += " is " + step.arguments;
              rule.cn += "是否为" + step.arguments;
            }
            break;
          case "abs":
            rule.en += " abs";
            rule.cn += "绝对值";
            break;
          case "positive":
            rule.en += " positive";
            rule.cn += "取正数";
            break;
          case "negative":
            rule.en += " negative";
            rule.cn += "取负数";
            break;
          case "sign":
            rule.en += " sign";
            rule.cn += "判断正负数";
            break;
          case "sin":
            rule.en += " sin";
            rule.cn += "正弦";
            break;
          case "asin":
            rule.en += " asin";
            rule.cn += "反正弦";
            break;
          case "cos":
            rule.en += " cos";
            rule.cn += "余弦";
            break;
          case "acos":
            rule.en += " acos";
            rule.cn += "反余弦";
            break;
          case "tan":
            rule.en += " tan";
            rule.cn += "正切";
            break;
          case "atan":
            rule.en += " atan";
            rule.cn += "反正切";
            break;
          case "degrees":
            rule.en += " degrees";
            rule.cn += "弧度转角度";
            break;
          case "radians":
            rule.en += " radians";
            rule.cn += "角度转弧度";
            break;
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

        extract_glyph_cols(in_cols, out_cols);

        visData.type = TransformType.CreateColumns;
        visData.arrange = Arrange.Col;

        res = gen_data(GenDataType.FirstRows, { in: in_tbls, out: out_tbls }, { in: step.source_tables, out: step.target_tables }, { in: in_cols, out: out_cols });

        break;
      // 派生列
      case "space":
      case "e":
      case "pi":
      case "rand":
      case "current_date":
      case "current_timestamp":
        rule_column_list = step.target_columns.join(", ")
        rule.en = "Mutate: " + "add column" + rule_column_list + " by ";
        rule.cn = "计算：" + "派生列" + rule_column_list;
        switch (step.function_id) {
          case "space":
            rule.en += step.arguments + "space";
            rule.cn += step.arguments + "个空格";
            break;
          case "e":
            rule.en += "e";
            rule.cn += "自然常数e";
            break;
          case "pi":
            rule.en += "pi";
            rule.cn += "π";
            break;
          case "rand":
            rule.en += "rand " + step.arguments;
            rule.cn += "随机数" + step.arguments;
            break;
          case "current_date":
            rule.en += "current_date";
            rule.cn += "当前日期";
            break;
          case "current_timestamp":
            rule.en += "current_timestamp";
            rule.cn += "当前时间";
            break;
        }

        in_tbls = step.source_tables.map(tbl => data_df[tbl])
        out_tbls = step.target_tables.map(tbl => data_df[tbl])
        in_cols = [{
          all: Array.from(in_tbls[0][0]),
          explicit: [],
          implicit: [],
          context: []
        }]
        out_cols = [{
          all: Array.from(out_tbls[0][0]),
          explicit: step.target_columns,
          implicit: [],
          context: []
        }]

        extract_glyph_cols(in_cols, out_cols);

        visData.type = TransformType.CreateColumns;
        visData.arrange = Arrange.Col;

        res = gen_data(GenDataType.FirstRows, { in: in_tbls, out: out_tbls }, { in: step.source_tables, out: step.target_tables }, { in: in_cols, out: out_cols });

        break;
      // 计算（小数四舍五入）
      case "round":
        rule.en = "Mutate: " + step.source_column + " round " + step.arguments;
        rule.cn = "计算：" + step.source_column + "四舍五入并保留" + step.arguments + "位小数";

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
          explicit: [step.source_column],
          implicit: [],
          context: []
        }]

        extract_glyph_cols(in_cols, out_cols);

        visData.type = TransformType.CreateColumns;
        visData.arrange = Arrange.Col;

        res = gen_data(GenDataType.FirstRows, { in: in_tbls, out: out_tbls }, { in: step.source_tables, out: step.target_tables }, { in: in_cols, out: out_cols });

        break;
      // 条件取值
      case "case_when":
        rule.en = "Case When:"
        rule.cn = "条件取值："
        switch (step.condition_type) {
          case "SINGLE_COLUMN":
            source_column_list = [step.source_column]
            step.conditions.forEach((condition: any) => {
              rule.en += " when " + step.source_column + " " + condition.operator + " " + condition.condition + ", " + step.target_column + " = " + condition.value;
              rule.cn += " 当" + step.source_column + " " + condition.operator + " " + condition.condition + "时，" + step.target_column + " = " + condition.value;
            })
            rule.en += " " + step.target_column + "default value: " + step.default_value;
            rule.cn = " " + step.source_column + "的默认值为" + step.default_value;
            break;
          case "EXPRESSION":
            step.conditions.forEach((condition: any) => {
              source_column_list.push(condition.column)
              rule.en += " when " + condition.column + " " + condition.operator + " " + condition.condition + ", " + step.target_column + " = " + condition.value;
              rule.cn += " 当" + condition.column + " " + condition.operator + " " + condition.condition + "时，" + step.target_column + " = " + condition.value;
            })
            rule.en += " " + step.target_column + "default value: " + step.default_value;
            rule.cn = " " + step.source_column + "的默认值为" + step.default_value;
            break;
        }

        in_tbls = step.source_tables.map(tbl => data_df[tbl])
        out_tbls = step.target_tables.map(tbl => data_df[tbl])
        in_cols = [{
          all: Array.from(in_tbls[0][0]),
          explicit: source_column_list,
          implicit: [],
          context: []
        }]
        out_cols = [{
          all: Array.from(out_tbls[0][0]),
          explicit: [step.target_column],
          implicit: [],
          context: []
        }]

        extract_glyph_cols(in_cols, out_cols);

        visData.type = TransformType.CreateColumns;
        visData.arrange = Arrange.Col;

        res = gen_data(GenDataType.FirstRows, { in: in_tbls, out: out_tbls }, { in: step.source_tables, out: step.target_tables }, { in: in_cols, out: out_cols });

        break;
      // 数据去重
      case "distinct":
        rule_column_list = step.source_columns.join(", ");
        rule.en = "Deduplicate: " + rule_column_list;
        rule.cn = "数据去重：" + rule_column_list;

        in_tbls = step.source_tables.map(tbl => data_df[tbl])
        out_tbls = step.target_tables.map(tbl => data_df[tbl])
        in_cols = [{
          all: Array.from(in_tbls[0][0]),
          explicit: step.source_columns,
          implicit: [],
          context: []
        }]
        out_cols = [{
          all: Array.from(out_tbls[0][0]),
          explicit: [],
          implicit: [],
          context: []
        }]

        extract_glyph_cols(in_cols, out_cols);

        visData.type = TransformType.DeleteRows;
        visData.arrange = Arrange.Row;

        res = gen_data(GenDataType.DeleteRows, { in: in_tbls, out: out_tbls }, { in: step.source_tables, out: step.target_tables }, { in: in_cols, out: out_cols });

        break;
      // 数据过滤
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

        visData.type = TransformType.DeleteRows;
        visData.arrange = Arrange.Row;

        res = gen_data(GenDataType.DeleteRows, { in: in_tbls, out: out_tbls }, { in: step.source_tables, out: step.target_tables }, { in: in_cols, out: out_cols })

        break
      // 空值填充
      case "if_null":
        rule_column_list = step.source_columns.join(", ");
        switch (step.replacement_type) {
          case "sum":
            rule.en = "Null fill: " + rule_column_list + " by sum";
            rule.cn = "通过求和填充空值：" + rule_column_list;
            break;
          case "rolling_sum":
            rule.en = "Null fill: " + rule_column_list + " by rolling_sum";
            rule.cn = "通过滚动求和填充空值：" + rule_column_list;
            if (step.order_by_type == "custom") {
              step.orders.forEach((order: any) => {
                if (order.asc) {
                  rule.en += "; sort " + order.source_column + " by asc";
                  rule.cn += "； 对" + order.source_column + "进行升序排序";
                } else {
                  rule.en += "; sort " + order.source_column + " by desc";
                  rule.cn += "； 对" + order.source_column + "进行降序排序";
                }
              })
            }
            break;
          case "custom":
            rule.en = "Null fill: " + rule_column_list + " fill " + step.arguments[0];
            rule.cn = "自定义填充空值：" + rule_column_list + "填充值为" + step.arguments[0];
            break;
        }

        in_tbls = step.source_tables.map(tbl => data_df[tbl])
        out_tbls = step.target_tables.map(tbl => data_df[tbl])
        in_cols = [{
          all: Array.from(in_tbls[0][0]),
          explicit: step.source_columns,
          implicit: [],
          context: []
        }]
        out_cols = [{
          all: Array.from(out_tbls[0][0]),
          explicit: [],
          implicit: [],
          context: []
        }]

        extract_glyph_cols(in_cols, out_cols);

        visData.type = TransformType.CreateColumns;
        visData.arrange = Arrange.Col;

        console.log(visData);
        res = gen_data(GenDataType.FirstRows, { in: in_tbls, out: out_tbls }, { in: step.source_tables, out: step.target_tables }, { in: in_cols, out: out_cols });

        break;
      // 数据替换
      case "biz_replace":
        in_tbls = step.source_tables.map(tbl => data_df[tbl])
        out_tbls = step.target_tables.map(tbl => data_df[tbl])
        in_cols = [{
          all: Array.from(in_tbls[0][0]),
          explicit: step.source_columns,
          implicit: [],
          context: []
        }]
        out_cols = [{
          all: Array.from(out_tbls[0][0]),
          explicit: [],
          implicit: [],
          context: []
        }]
        rule_column_list = step.source_columns.join(", ");
        switch (step.replace_type) {
          case "pattern":
            rule.en = "Replace: " + rule_column_list + "\'s " + step.pattern + " to " + step.value;
            rule.cn = "数值替换：" + rule_column_list + "中的" + step.pattern + " 为 " + step.value;
            break;
          case "DELIMITER":
            rule.en = "Replace: " + rule_column_list + " from " + step.start_delimiter + " to " + step.end_delimiter + " and replace it to " + step.value + " in " + step.target_columns;
            rule.cn = "数值替换：" + rule_column_list + "从字符" + step.start_delimiter + "到" + step.end_delimiter + "结束并替换为" + step.value + "生成" + step.target_columns;
            out_cols[0].explicit.push(step.target_columns)
            break;
        }

        extract_glyph_cols(in_cols, out_cols);

        visData.type = TransformType.CreateColumns;
        visData.arrange = Arrange.Col;

        res = gen_data(GenDataType.FirstRows, { in: in_tbls, out: out_tbls }, { in: step.source_tables, out: step.target_tables }, { in: in_cols, out: out_cols });

        break;
      // 数据提取
      case "extract":
        rule.en = "Extract: " + step.source_column + " by ";
        rule.cn = "数据提取：" + step.source_column + "通过";
        switch (step.match_type) {
          case "pattern":
            rule.en += "pattern " + step.pattern + " extract " + step.number + " rows";
            rule.cn += "正则表达式" + step.pattern + "提取" + step.number + "个数据";
            break;
          case "delimiter":
            rule.en += "delimiter start from " + step.start_delimiter + " to " + step.end_delimiter + " extract " + step.number + " rows";
            rule.cn += "指定分隔符从" + step.start_delimiter + "开始，到" + step.end_delimiter + "结束，提取" + step.number + "个数据";
            break;
          case "digital":
            rule.en += "digital, and extract " + step.number + " rows";
            rule.cn += "提取数字，提取" + step.number + "个数据";
            break;
          case "range":
            rule.en += "range start from " + step.start_position + " to " + step.end_position + " extract " + step.number + " rows";
            rule.cn += "指定下标从" + step.start_position + "开始，到" + step.end_position + "结束，提取" + step.number + "个数据";
            break;
          case "date":
            rule.en += "date, and extract " + step.property;
            rule.cn += "提取日期数据中的" + step.property;
            break;
          case "url":
            rule.en += "url, and extract " + step.url_key;
            rule.cn += "提取URL数据中的" + step.url_key;
            break;
          case "first_n":
            rule.en += "first " + step.char_number + " chars";
            rule.cn += "提取前" + step.char_number + "个字符";
            break;
          case "last_n":
            rule.en += "last " + step.char_number + " chars";
            rule.cn += "提取后" + step.char_number + "个字符";
            break;
        }

        in_tbls = step.source_tables.map(tbl => data_df[tbl])
        out_tbls = step.target_tables.map(tbl => data_df[tbl])
        in_cols = [{
          all: Array.from(in_tbls[0][0]),
          explicit: step.source_columns,
          implicit: [],
          context: []
        }]
        out_cols = [{
          all: Array.from(out_tbls[0][0]),
          explicit: [],
          implicit: [],
          context: []
        }]

        extract_glyph_cols(in_cols, out_cols);

        visData.type = TransformType.CreateColumns;
        visData.arrange = Arrange.Col;

        res = gen_data(GenDataType.FirstRows, { in: in_tbls, out: out_tbls }, { in: step.source_tables, out: step.target_tables }, { in: in_cols, out: out_cols });

        break;
      // 拆分列
      case "split":
        rule.en = "Split: " + step.source_column + " by ";
        rule.cn = "拆分列：" + step.source_column + "通过";
        rule_column_list = step.target_columns.join(", ");
        switch (step.split_type) {
          case "delimiter":
            rule.en += "delimiter " + step.delimiter + " to " + rule_column_list;
            rule.cn += "分隔符" + step.delimiter + "拆分为" + rule_column_list;
            break;
          case "between_delimiters":
            rule.en += "between delimiters start from " + step.before_delimiter + " to " + step.after_delimiter + " to " + rule_column_list;
            rule.cn += "分隔符区间，从" + step.before_delimiter + " 开始，到 " + step.after_delimiter + " 结束，拆分为 " + rule_column_list;
            break;
          case "multi_delimiters":
            let multi_delimiters = step.delimiters.join(", ");
            rule.en += "multi delimiters " + multi_delimiters + " to " + rule_column_list;
            rule.cn += "多个指定分隔符" + multi_delimiters + "拆分为" + rule_column_list;
            break;
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
          explicit: step.target_columns,
          implicit: [],
          context: []
        }]

        extract_glyph_cols(in_cols, out_cols);

        visData.type = TransformType.CreateColumns;
        visData.arrange = Arrange.Col;

        res = gen_data(GenDataType.FirstRows, { in: in_tbls, out: out_tbls }, { in: step.source_tables, out: step.target_tables }, { in: in_cols, out: out_cols });

        break;
      // 聚合函数
      case "aggregate":
        let group_by_list = step.group_by.join(", ");
        rule.en = "Aggregate " + group_by_list + " by ";
        rule.cn = "聚合" + group_by_list + "通过";
        let target_columns = []
        step.values.forEach((value: any) => {
          target_columns = mergeAndRemoveDuplicates(target_columns, value.expressions)
          let expression_rule = value.expressions.join(", ");
          switch (value.function_id) {
            case "sum":
              rule.en += "sum(" + expression_rule + "); ";
              rule.cn += "求合（" + expression_rule + "）；";
              break;
            case "sum_distinct":
              rule.en += "sum(distinct(" + expression_rule + ")); ";
              rule.cn += "去重求和（" + expression_rule + "）；";
              break;
            case "avg_distinct":
              rule.en += "avg(distinct(" + expression_rule + ")); ";
              rule.cn += "去重求平均（" + expression_rule + "）；";
              break;
            case "min":
              rule.en += "min(" + expression_rule + "); ";
              rule.cn += "最小值（" + expression_rule + "）；";
              break;
            case "max":
              rule.en += "max(" + expression_rule + "); ";
              rule.cn += "最大值（" + expression_rule + "）；";
              break;
            case "count":
              rule.en += "count(" + expression_rule + "); ";
              rule.cn += "计数（" + expression_rule + "）；";
              break;
            case "count_column":
              rule.en += "count_column(" + expression_rule + "); ";
              rule.cn += "非空计数（" + expression_rule + "）；";
              break;
            case "count_distinct":
              rule.en += "count(DISTINCT(" + expression_rule + ")); ";
              rule.cn += "去重计数（" + expression_rule + "）；";
              break;
            case "count_if":
              rule.en += "count_if(" + expression_rule + "); ";
              rule.cn += "条件计数（" + expression_rule + "）；";
              break;
            case "approx_count_distinct":
              rule.en += "approx_count_distinct(" + expression_rule + "); ";
              rule.cn += "近似唯一值计数（" + expression_rule + "）；";
              break;
            case "var_pop":
              rule.en += "var_pop(" + expression_rule + "); ";
              rule.cn += "方差（" + expression_rule + "）；";
              break;
            case "var_samp":
              rule.en += "var_samp(" + expression_rule + "); ";
              rule.cn += "样本方差（" + expression_rule + "）；";
              break;
            case "stddev_pop":
              rule.en += "stddev_pop(" + expression_rule + "); ";
              rule.cn += "标准差（" + expression_rule + "）；";
              break;
            case "stddev_samp":
              rule.en += "stddev_samp(" + expression_rule + "); ";
              rule.cn += "样本标准差（" + expression_rule + "）；";
              break;
          }
        })

        in_tbls = step.source_tables.map(tbl => data_df[tbl])
        out_tbls = step.target_tables.map(tbl => data_df[tbl])
        in_cols = [{
          all: Array.from(in_tbls[0][0]),
          explicit: step.group_by,
          implicit: [],
          context: []
        }]
        out_cols = [{
          all: Array.from(out_tbls[0][0]),
          explicit: target_columns,
          implicit: [],
          context: []
        }]

        extract_glyph_cols(in_cols, out_cols);

        visData.type = TransformType.TransformTables;
        visData.arrange = Arrange.Row;

        res = gen_data(GenDataType.Agg, { in: in_tbls, out: out_tbls }, { in: step.source_tables, out: step.target_tables }, { in: in_cols, out: out_cols });

        break;
      // 日期函数
      case "year":
      case "quarter":
      case "month":
      case "day":
      case "hour":
      case "minute":
      case "second":
      case "weekofyear":
        rule.en = "Date Function: "
        rule.cn = "日期函数："

        switch (step.function_id) {
          case "year":
            rule.en += "year(" + step.source_column + ")";
            rule.cn += "年（" + step.source_column + "）";
            break;
          case "quarter":
            rule.en += "quarter(" + step.source_column + ")";
            rule.cn += "季度（" + step.source_column + "）";
            break;
          case "month":
            rule.en += "month(" + step.source_column + ")";
            rule.cn += "月（" + step.source_column + "）";
            break;
          case "day":
            rule.en += "day(" + step.source_column + ")";
            rule.cn += "天（" + step.source_column + "）";
            break;
          case "hour":
            rule.en += "hour(" + step.source_column + ")";
            rule.cn += "时（" + step.source_column + "）";
            break;
          case "minute":
            rule.en += "minute(" + step.source_column + ")";
            rule.cn += "分（" + step.source_column + "）";
            break;
          case "second":
            rule.en += "second(" + step.source_column + ")";
            rule.cn += "秒（" + step.source_column + "）";
            break;
          case "weekofyear":
            rule.en += "weekofyear(" + step.source_column + ")";
            rule.cn += "日期周数（" + step.source_column + "）";
            break;
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
          explicit: step.target_columns,
          implicit: [],
          context: []
        }]

        extract_glyph_cols(in_cols, out_cols);


        visData.type = TransformType.CreateColumns;
        visData.arrange = Arrange.Col;

        res = gen_data(GenDataType.FirstRows, { in: in_tbls, out: out_tbls }, { in: step.source_tables, out: step.target_tables }, { in: in_cols, out: out_cols });

        break;
      // 日期计算
      case "date_add":
      case "date_sub":
      case "month_add":
        rule.en = "Date Function: "
        rule.cn = "日期函数："

        switch (step.function_id) {
          case "date_add":
            rule.en += "add date " + step.source_column + step.arguments + "days";
            rule.cn += "增加天数 " + step.source_column + step.arguments + "天";
            break;
          case "date_sub":
            rule.en += "sub date " + step.source_column + step.arguments + "days";
            rule.cn += "减少天数 " + step.source_column + step.arguments + "天";
            break;
          case "month_add":
            rule.en += "add month " + step.source_column + step.arguments + "months";
            rule.cn += "增加月份 " + step.source_column + step.arguments + "月";
            break;
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
          explicit: step.target_columns,
          implicit: [],
          context: []
        }]

        extract_glyph_cols(in_cols, out_cols);


        visData.type = TransformType.CreateColumns;
        visData.arrange = Arrange.Col;

        res = gen_data(GenDataType.FirstRows, { in: in_tbls, out: out_tbls }, { in: step.source_tables, out: step.target_tables }, { in: in_cols, out: out_cols });

        break;
      // 天数差值
      case "datediff":
        rule.en = "Diff Date: " + step.source_column + " and " + step.arguments;
        rule.cn = "比较日期" + step.source_column + " 和 " + step.arguments + "的天数差值";

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
          explicit: step.target_columns,
          implicit: [],
          context: []
        }]

        extract_glyph_cols(in_cols, out_cols);


        visData.type = TransformType.CreateColumns;
        visData.arrange = Arrange.Col;

        res = gen_data(GenDataType.FirstRows, { in: in_tbls, out: out_tbls }, { in: step.source_tables, out: step.target_tables }, { in: in_cols, out: out_cols });

        break;
      // 日期转换
      case "unix_timestamp2":
      case "to_date":
      case "to_timestamp":
      case "date_format":
        rule.en = "Change Date: " + step.source_column + " to " + step.arguments;
        rule.cn = "日期转换：" + step.source_column + " 转换为 " + step.arguments;

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
          explicit: step.target_columns,
          implicit: [],
          context: []
        }]

        extract_glyph_cols(in_cols, out_cols);


        visData.type = TransformType.CreateColumns;
        visData.arrange = Arrange.Col;

        res = gen_data(GenDataType.FirstRows, { in: in_tbls, out: out_tbls }, { in: step.source_tables, out: step.target_tables }, { in: in_cols, out: out_cols });

        break;
      // 多表Join
      case "join":
        rule.en = "Join: " + step.source_tables[0];
        rule.cn = "多表Join：" + step.source_tables[0];

        join_source_tables = step.source_tables

        step.join_parameters.forEach((parameter: any) => {
          if (parameter.alias == null) {
            join_table_name = parameter.table_name;
          } else {
            join_table_name = parameter.alias;
          }
          join_source_tables.push(join_table_name);
          join_info = parameter.join_keys[0];
          join_columns.push(join_info.left_col);
          join_columns.push(join_info.right_col);
          switch (parameter.join_type) {
            case "LEFT_JOIN":
            case "LOOK_UP":
              rule.en += " LEFT JOIN: ";
              rule.cn += "左联：";
              break;
            case "RIGHT_JOIN":
              rule.en += " RIGHT JOIN: ";
              rule.cn += "右联：";
              break;
            case "INNER_JOIN":
              rule.en += " INNER JOIN: ";
              rule.cn += "内联：";
              break;
            case "FULL_OUTER_JOIN":
              rule.en += " FULL OUTER JOIN: ";
              rule.cn += "全外连接：";
              break;
          }
          rule.en += join_table_name + " " + join_info.left_col + " " + join_info.condition + " " + join_info.right_col + ";";
          rule.cn += join_table_name + " " + join_info.left_col + " " + join_info.condition + " " + join_info.right_col + "；";
        })

        in_tbls = join_source_tables.map(tbl => data_df[tbl])
        out_tbls = step.target_tables.map(tbl => data_df[tbl])

        join_columns = Array.from(new Set(join_columns));
        
        in_cols = []
        join_source_tables.forEach((join_tbl: any, index: number) => {
          let join_single_cols: GenTblCols
          join_single_cols = {
            all: Array.from(in_tbls[index][0]),
            explicit: join_columns,
            implicit: [],
            context: []
          }
          in_cols.push(join_single_cols)
        })
        // let join_single_cols: GenTblCols
        // in_cols = [{
        //   all: Array.from(in_tbls[0][0]),
        //   explicit: join_columns,
        //   implicit: [],
        //   context: []
        // }]
        out_cols = [{
          all: Array.from(out_tbls[0][0]),
          explicit: [],
          implicit: [],
          context: []
        }]

        extract_glyph_cols(in_cols, out_cols);

        visData.type = TransformType.CombineTables;
        visData.arrange = Arrange.Row;

        res = gen_data(GenDataType.Join, { in: in_tbls, out: out_tbls }, { in: join_source_tables, out: step.target_tables }, { in: in_cols, out: out_cols });

        break;
    }

    if (res) {
      visData.in = res.in
      visData.out = res.out
    } else {
      // res为null，不生成glyph
      visData.in = step.source_tables.map(tbl => {
        return {
          data: data_df[tbl],
          name: tbl,
          color: [],
          scale: { x: 1, y: 1 }
        } as Table
      })
      visData.out = step.target_tables.map(tbl => {
        return {
          data: data_df[tbl],
          name: tbl,
          color: [],
          scale: { x: 1, y: 1 }
        } as Table
      })
      visData.type = TransformType.Others
      visData.arrange = Arrange.Row
    }
    visData.rule = rule[lang]
    visArray.push(visData)
  }
  return visArray
}

function get_glyph_posi(vis: VisData, nodePos): Rect {
  // 下面是在计算 glpyh 的坐标位置
  let pos: Rect = { x: 0, y: 0 }
  if (vis.in.length === 1 && vis.out.length === 1) {
    let dy = Math.abs(nodePos[vis.in[0].name][1] - nodePos[vis.out[0].name][1])
      > svgSize.height / 2 ? svgSize.height / 2 : 0;
    pos.x = (nodePos[vis.in[0].name][0] + nodeSize.width + nodePos[vis.out[0].name][0]) /
      2 - svgSize.width / 2;
    pos.y = (nodePos[vis.in[0].name][1] + nodeSize.height + nodePos[vis.out[0].name][1]) /
      2 - svgSize.height + dy - 10;
  } else if (vis.in.length === 1) {
    let meetingPosY = nodePos[vis.in[0].name][1] + nodeSize.height / 2;
    let meetingPosX = nodePos[vis.in[0].name][0] + nodeSize.width + 0.8 * (Math.min(nodePos[vis.out[0].name][0], nodePos[vis.out[1].name][0]) - nodePos[vis.in[0].name][0] - nodeSize.width);
    pos.x = (nodePos[vis.in[0].name][0] + nodeSize.width + meetingPosX) / 2 - svgSize.width / 2;
    pos.y = (nodePos[vis.in[0].name][1] + nodeSize.height / 2 + meetingPosY) / 2 - svgSize.height - 10;
  } else {
    let meetingPosY = nodePos[vis.out[0].name][1] + nodeSize.height / 2;
    let meetingPosX = Math.max(nodePos[vis.in[0].name][0], nodePos[vis.in[1].name][0]) +
      nodeSize.width + 0.2 * (nodePos[vis.out[0].name][0] - nodeSize.width - Math.max(nodePos[vis.in[0].name][0], nodePos[vis.in[1].name][0]));
    pos.x = (nodePos[vis.out[0].name][0] + meetingPosX) / 2 - svgSize.width / 2;
    pos.y = (nodePos[vis.out[0].name][1] + nodeSize.height / 2 + meetingPosY) / 2 - svgSize.height - 10;
  }
  return pos
}

export async function gen_vis(data: { "dsl": Array<any>, "data_df": any }, lang: "en" | "cn" = "en") {
  const width = window.innerWidth;
  const height = window.innerHeight - 100;

  // const somnus_svg = d3.select("body").append("svg")
  const somnus_svg = d3.select("svg")
    .attr("id", svgName)
    .attr('width', width)
    .attr('height', height);

  let data_df = {}
  for (const dfi in data.data_df) {
    data_df[dfi] = convert2TableArray(data.data_df[dfi]);
  }

  let visArray = dsl_vis_adapter(data.dsl, data_df, lang)
  // console.log(visArray);
  // visArray.forEach((vis, i) => {
  //   draw_glyph(somnus_svg, i, { x: i * 260, y: 200 }, vis)
  // })

  /* // 可以打开以下注释，查看更加丰富的例子
   let visArray2: VisData[] = [{
     in: [
       {
         data: [["amount1", "amount2"], ["100.2", "50.33"], ["75.12", "25"], ["200.1", "100"]],
         name: "tb1",
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
       name: "tb2",
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
         name: "tb2",
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
       name: "tb3",
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
         name: "tb1",
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
       name: "tb4",
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
         name: "tb4",
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
       name: "tb5",
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
         name: "tb3",
         color: [0, 1, 2],
         scale: {
           x: 0.2,
           y: 0.5
         }
       },
       {
         data: [["", "order_date"], ["", "2024-01-02"]],
         name: "tb5",
         color: [1],
         scale: {
           x: 0.2,
           y: 0.3
         }
       }
     ],
     out: [{
       data: [["", "order_date", ""], ["", "2024-01-02", ""]],
       name: "tb6",
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
         name: "tb6",
         color: [0, 1, 2],
         scale: {
           x: 0.2,
           y: 0.5
         }
       }
     ],
     out: [{
       data: [["amount1", "amount2", "amount123"], ["100.2", "50.33", "150.53"], ["75.12", "25", "100.12"], ["200.1", "100", "300.1"]],
       name: "tb7_5678Y",
       color: [0, 1, 2],
       scale: {
         x: 0.2,
         y: 0.3
       }
     },],
     rule: 'create_columns_mutatecreate_columns_mutatecr',
     type: TransformType.TransformTables,
     arrange: Arrange.Row
   }, {
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
       {
         data: [["", "n"], ["", "1"], ["", "2"]],
         name: "output2nput1, input1,input12,1234",
         color: [0, 1, 2],
         scale: {
           x: 0.2,
           y: 0.5
         }
       }
     ],
     out: [{
       data: [["12345678", "n"], ["", "6"], ["", "2"], ["", "1"]],
       name: "output2n",
       color: [2, 1, 0],
       scale: {
         x: 0.2,
         y: 0.3
       },
       sortCol: [SortType.Desc, SortType.Asc]
     }],
     rule: 'create_columns_mutatecreate_columns_mutatecr',
     type: TransformType.Others,
     arrange: Arrange.Row
   }]
   // try {
   //   const nodePos = await draw_provenance(visData2);
   //   console.log('Node positions:', nodePos);
   //   // 在这里使用 nodePos 进行进一步操作
   // } catch (error) {
   //   console.error('Error drawing provenance:', error);
   // }
   visArray = visArray2
   */

  const nodePos = await draw_provenance(visArray);

  visArray.forEach((vis, i) => {
    let pos = get_glyph_posi(vis, nodePos)
    if (vis.type === TransformType.Others) {
      draw_text(somnus_svg, vis.rule, 38, 15, pos, { x: svgSize.width, y: svgSize.height * 1.8 }, 'middle', 'black')
    } else {
      draw_glyph(somnus_svg, i, pos, vis)
    }
  })

  /*
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
