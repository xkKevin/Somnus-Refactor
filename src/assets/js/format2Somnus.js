// glyph设计：https://shimo.im/docs/ppGhvvjdtwDprg8K

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

function convert2SomnusSpec(dsl) {
  var somnus_dsl = [];

  somnus_dsl = [
    {
      input_explicit_col: ["order_date"],
      input_table_file: "orders",
      input_table_name: "orders",
      operation_rule: "Keep rows where order_date >= 2024-01-01",
      output_table_file: "orders_filter_0",
      output_table_name: "orders_filter_0",
      type: "delete_rows_filter",
    },
    {
      type: "create_columns_mutate",
      input_table_file: "orders_filter_0",
      output_table_file: "orders_filter_0_add_1",
      input_table_name: "orders_filter_0",
      output_table_name: "orders_filter_0_add_1",
      input_explicit_col: ["amount1", "amount2"],
      output_explicit_col: ["amount1 + amount2"],
      operation_rule: "Mutate: 'amount1 + amount2'",
    },
    {
      type: "transform_columns_rename",
      input_table_file: "orders_filter_0_add_1",
      output_table_file: "orders_filter_0_add_1_biz_rename_2",
      input_table_name: "orders_filter_0_add_1",
      output_table_name: "orders_filter_0_add_1_biz_rename_2",
      input_explicit_col: ["amount1 + amount2"],
      output_explicit_col: ["total_amount"],
      operation_rule: "Change Name:total_amount=amount1 + amount2",
    },
    {
      type: "delete_columns_select_keep",
      input_table_file: "orders_filter_0_add_1_biz_rename_2",
      output_table_file: "subquery",
      input_table_name: "orders_filter_0_add_1_biz_rename_2",
      output_table_name: "subquery",
      input_explicit_col: ["product_name", "total_amount"],
      operation_rule: 'Keep Column: "product_name", "total_amount"',
    },
    {
      input_explicit_col: ["total_amount"],
      input_table_file: "subquery",
      input_table_name: "subquery",
      operation_rule: "Keep rows where total_amount > 200",
      output_table_file: "subquery_filter_4",
      output_table_name: "subquery_filter_4",
      type: "delete_rows_filter",
    },
    {
      type: "create_columns_mutate",
      input_table_file: "subquery_filter_4",
      output_table_file: "subquery_filter_4_trim_5",
      input_table_name: "subquery_filter_4",
      output_table_name: "subquery_filter_4_trim_5",
      input_explicit_col: ["product_name"],
      output_explicit_col: ["trim(product_name)"],
      operation_rule: "Mutate: trim(product_name)",
    },
    {
      type: "create_columns_mutate",
      input_table_file: "subquery_filter_4_trim_5",
      output_table_file: "subquery_filter_4_trim_5_round_6",
      input_table_name: "subquery_filter_4_trim_5",
      output_table_name: "subquery_filter_4_trim_5_round_6",
      input_explicit_col: ["total_amount"],
      output_explicit_col: ["ROUND(total_amount, 1)"],
      operation_rule: "Mutate: ROUND(total_amount, 1)",
    },
  ];
  return somnus_dsl;
}

function format_data(data) {
  var somnus_data = { dsl: convert2SomnusSpec(data.dsl), data_df: {} };

  for (const dfi in data.data_df) {
    somnus_data.data_df[dfi] = convert2TableArray(data.data_df[dfi]);
  }

  return somnus_data;
}

export { format_data };
