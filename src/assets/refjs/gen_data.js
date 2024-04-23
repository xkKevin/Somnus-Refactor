// glyph设计：https://shimo.im/docs/ppGhvvjdtwDprg8K

function isNumericConstant(str) {
    return /^\d+$/.test(str);
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
  
  function convert2SomnusSpec(dsl) {
    var somnus_dsl = [];
    for (const step of dsl) {
        switch (step.function_id) {
			// delete_rows_filter
            case "filter":
                var filterRule = ""
                var filterRuleCHN = ""
                if (step.keep == true) {
                    filterRule = "Keep rows where " + step.source_column 
                    filterRuleCHN = "保留 " + step.source_column + " 中"
                } else {
                    filterRule = "Delete rows where " + step.source_column 
                    filterRuleCHN = "删除 " + step.source_column + " 中"
                }
                switch (step.filter_type) {
                    case 'null':
                        filterRule += "is null"
                        filterRuleCHN += "为 null 的记录"
                        break
                    case 'not_null':
                        filterRule += "is not null"
                        filterRuleCHN += "不为 null 的记录"
                        break
                    case 'equals':
						filterRule += "is = " + step.arguments
                    	filterRuleCHN += " = " + step.arguments + "的记录"
                    	break
                    case 'not_equals':
                    	filterRule += "is <> " + step.arguments
                    	filterRuleCHN += " <> " + step.arguments + "的记录"
                    	break
					case 'start_with':
						filterRule += "is like %" + step.arguments
						filterRuleCHN += " 以 " + step.arguments + "开头的记录"
						break
					case 'end_with':
						filterRule += "is like " + step.arguments + "%"
						filterRuleCHN += " 以 " + step.arguments + "结尾的记录"
						break
					case 'contains':
						filterRule += "is like %" + step.arguments + "%"
						filterRuleCHN += " 包含 %" + step.arguments + "% 的记录"
						break
                    case 'greater_than':
                        if (step.equals1 == true) {
                        	filterRule += "is >= " + step.arguments
                        	filterRuleCHN += " >= " + step.arguments + "的记录"
                        } else {
                        	filterRule += "is > " + step.arguments
                        	filterRuleCHN += " > " + step.arguments + "的记录"
                        }
                        break
                    case "less_than":
                        if (step.equals1 == true) {
                        	filterRule += "is <= " + step.arguments
                        	filterRuleCHN += " <= " + step.arguments + "的记录"
                        } else {
                        	filterRule += "is < " + step.arguments
                        	filterRuleCHN += " < " + step.arguments + "的记录"
                        }
                        break
					case 'one_of':
						filterRule += " in ("
						filterRuleCHN += " 在集合 ("
						for (const item in step.arguments){
							filterRule += "'" + item + "'"
							filterRuleCHN += "'" + item + "'"
						}
						filterRule += ")"
						filterRuleCHN += ") 中"
						break
					case 'between':
						if (step.equals1 == true){
							filterRule += " >= " + step.left
							filterRuleCHN += " >= " + step.left
						} else {
							filterRule += " > " + step.left
							filterRuleCHN += " > " + step.left
						}
						if (step.equals2 == true){
							filterRule += "and <= " + step.right
							filterRuleCHN += "并且 <= " + step.right + " 的记录"
						} else {
							filterRule += " < " + step.right
							filterRuleCHN += "并且 < " + step.right + " 的记录"
						}
						break
					case 'between_and':
							filterRule += " between " + step.left + " and " + step.right
							filterRuleCHN += "在" + step.left + " 和 " + step.right + " 之间的记录"
						break
					case 'regexp':
						filterRule += "rlike '" + step.arguments + "'"
						filterRuleCHN += " 符合正则 '" + step.arguments + "' 的记录"
						break
					case 'not_regexp':
						filterRule += "not rlike '" + step.arguments + "'"
						filterRuleCHN += " 不符合正则 '" + step.arguments + "' 的记录"
						break
					default:
						filterRule += "Unknow rule"
						filterRuleCHN += "Unknow rule"
                }
                var filter_dsl = {
                    input_explicit_col: [step.source_column],
                    input_table_name: step.source_tables[0],
					input_table_file: step.source_tables[0],
                    operation_rule: filterRule,
                    operation_rule_chn: filterRuleCHN,
                    output_table_name: step.target_tables[0],
					output_table_file: step.target_tables[0],
                    type: "delete_rows_filter"
                }
				somnus_dsl.push(filter_dsl)
              break;
            // create_columns_mutate
			case "add":
				var source_column = []
				source_column.push(step.source_column)
				if (!isNumericConstant(step.arguments)) {
					source_column.push(step.arguments)
				}
				var mutate_dsl = {
                    input_explicit_col: source_column,
					input_table_file: step.source_tables[0],
                    input_table_name: step.source_tables[0],
                    operation_rule: "Mutate: " + step.target_column + " = " + step.source_column + " + " + step.arguments,
                    operation_rule_chn: step.target_column + "由" + step.source_column + " + " + step.arguments + "生成",
                    output_explicit_col: [step.target_column],
					output_table_name: step.target_tables[0],
					output_table_file: step.target_tables[0],
					type: "create_columns_mutate"
                }
				somnus_dsl.push(mutate_dsl)
				break;
			case "substract":
				var source_column = []
				source_column.push(step.source_column)
				if (!isNumericConstant(step.arguments)) {
					source_column.push(step.arguments)
				}
				var mutate_dsl = {
                    input_explicit_col: source_column,
                    input_table_name: step.source_tables[0],
					input_table_file: step.source_tables[0],
                    operation_rule: "Mutate: " + step.target_column + " = " + step.source_column + " - " + step.arguments,
                    operation_rule_chn: step.target_column + "由" + step.source_column + " - " + step.arguments + "生成",
                    output_explicit_col: [step.target_column],
					output_table_name: step.target_tables[0],
					output_table_file: step.target_tables[0],
					type: "create_columns_mutate"
                }
				somnus_dsl.push(mutate_dsl)
				break;
			case "multiply":
				var source_column = []
				source_column.push(step.source_column)
				if (!isNumericConstant(step.arguments)) {
					source_column.push(step.arguments)
				}
				var mutate_dsl = {
                    input_explicit_col: source_column,
                    input_table_name: step.source_tables[0],
					input_table_file: step.source_tables[0],
                    operation_rule: "Mutate: " + step.target_column + " = " + step.source_column + " * " + step.arguments,
                    operation_rule_chn: step.target_column + "由" + step.source_column + " * " + step.arguments + "生成",
                    output_explicit_col: [step.target_column],
					output_table_name: step.target_tables[0],
					output_table_file: step.target_tables[0],
					type: "create_columns_mutate"
                }
				somnus_dsl.push(mutate_dsl)
				break;
			case "division":
				var source_column = []
				source_column.push(step.source_column)
				if (!isNumericConstant(step.arguments)) {
					source_column.push(step.arguments)
				}
				var mutate_dsl = {
                    input_explicit_col: source_column,
                    input_table_name: step.source_tables[0],
					input_table_file: step.source_tables[0],
                    operation_rule: "Mutate: " + step.target_column + " = " + step.source_column + " / " + step.arguments,
                    operation_rule_chn: step.target_column + "由" + step.source_column + " / " + step.arguments + "生成",
                    output_explicit_col: [step.target_column],
					output_table_name: step.target_tables[0],
					output_table_file: step.target_tables[0],
					type: "create_columns_mutate"
                }
				somnus_dsl.push(mutate_dsl)
				break;
			case "trim":
				var mutate_dsl = {
					type: "create_columns_mutate",
					input_table_file: step.source_tables[0],
					output_table_file: step.target_tables[0],
					input_table_name: step.source_tables[0],
					output_table_name: step.target_tables[0],
					input_explicit_col: [step.source_column],
					output_explicit_col: [step.target_column],
					operation_rule: "Mutate: trim(" + step.source_column + ")",
					operation_rule_chn: "去除首尾空格: " + step.source_column
				}
				somnus_dsl.push(mutate_dsl)
				break;
			case "round":
				var mutate_dsl = {
					type: "create_columns_mutate",
					input_table_file: step.source_tables[0],
					output_table_file: step.target_tables[0],
					input_table_name: step.source_tables[0],
					output_table_name: step.target_tables[0],
					input_explicit_col: [step.source_column],
					output_explicit_col: [step.target_column],
					operation_rule: "Mutate: ROUND(" + step.source_column + ", " + step.arguments + ")",
					operation_rule_chn: "小数四舍五入: (" + step.source_column + ", " + step.arguments + ")"
				}
				somnus_dsl.push(mutate_dsl)
				break;
            // transform_columns_change_name
			case "biz_rename":
				switch (step.rename_type) {
					case "special_name":
						var source_columns = []
						var target_columns = []
						var rename_rule = "Change Name: "
						var rename_rule_chn = "修改列名: "
						for (const len in step.conditions) {
							source_columns.push(step.conditions[len].source_column)
							target_columns.push(step.conditions[len].target_column)
							rename_rule += step.conditions[len].target_column + " = " + step.conditions[len].source_column + "; "
							rename_rule_chn += step.conditions[len].target_column + " = " + step.conditions[len].source_column + "; "
						}
						var change_name_dsl = {
							type: "transform_columns_rename",
							input_table_file: step.source_tables[0],
							output_table_file: step.target_tables[0],
							input_table_name: step.source_tables[0],
							output_table_name: step.target_tables[0],
							input_explicit_col: source_columns,
							output_explicit_col: target_columns,
							operation_rule: rename_rule,
							operation_rule_chn: rename_rule_chn
						}
						somnus_dsl.push(change_name_dsl)
						break;
					case "add_prefix":
						var source_columns = []
						var target_columns = []
						var rename_rule = "Change Name: "
						var rename_rule_chn = "修改列名: "
						for (const len in step.conditions) {
							source_columns.push(step.conditions[len].source_column)
							var target_column = step.prefix + step.conditions[len].source_column
							target_columns.push(target_column)
							rename_rule += target_column + " = " + step.conditions[len].source_column + "; "
							rename_rule_chn += target_column + " = " + step.conditions[len].source_column + "; "
						}
						var change_name_dsl = {
							type: "transform_columns_rename",
							input_table_file: step.source_tables[0],
							output_table_file: step.target_tables[0],
							input_table_name: step.source_tables[0],
							output_table_name: step.target_tables[0],
							input_explicit_col: source_columns,
							output_explicit_col: target_columns,
							operation_rule: rename_rule,
							operation_rule_chn: rename_rule_chn
						}
						somnus_dsl.push(change_name_dsl)
						break;
					case "add_suffix":
						var source_columns = []
						var target_columns = []
						var rename_rule = "Change Name: "
						var rename_rule_chn = "修改列名: "
						for (const len in step.conditions) {
							source_columns.push(step.conditions[len].source_column)
							var target_column = step.conditions[len].source_column + step.suffix
							target_columns.push(target_column)
							rename_rule += target_column + " = " + step.conditions[len].source_column + "; "
							rename_rule_chn += target_column + " = " + step.conditions[len].source_column + "; "
						}
						var change_name_dsl = {
							type: "transform_columns_rename",
							input_table_file: step.source_tables[0],
							output_table_file: step.target_tables[0],
							input_table_name: step.source_tables[0],
							output_table_name: step.target_tables[0],
							input_explicit_col: source_columns,
							output_explicit_col: target_columns,
							operation_rule: rename_rule,
							operation_rule_chn: rename_rule_chn
						}
						somnus_dsl.push(change_name_dsl)
						break;
					default:
						console.log("Unknown change name type")
				}
              break;
            // delete_columns_select_keep
			case "keep_columns":
				var keep_rule = "Keep Column: ";
				var keep_rule_chn = "保留列: ";
				for (const len in step.source_columns) {
					if (len == step.source_columns.length - 1){
						keep_rule += "'" + step.source_columns[len] + "'";
						keep_rule_chn += "'" + step.source_columns[len] + "'";
					} else {
						keep_rule += "'" + step.source_columns[len] + "', ";
						keep_rule_chn += "'" + step.source_columns[len] + "', ";
					}
					
				}
				var keep_columns_dsl = {
					type: "delete_columns_select_keep",
					input_table_file: step.source_tables[0],
					output_table_file: step.target_tables[0],
					input_table_name: step.source_tables[0],
					output_table_name: step.target_tables[0],
					input_explicit_col: step.source_columns,
					operation_rule: keep_rule,
					operation_rule_chn: keep_rule_chn
				}
				somnus_dsl.push(keep_columns_dsl)
				break;
            // transform_tables_sort
			case "order_by":
				var sort_rule = "Sort: ";
				var sort_rule_chn = "排序列: ";
				if (step.asc == true) {
					sort_rule += "asc(" + step.source_column + ")";
					sort_rule_chn += "升序(" + step.source_column + ")";
				} else {
					sort_rule += "desc(" + step.source_column + ")";
					sort_rule_chn += "降序(" + step.source_column + ")";
				}
				var sort_dsl = {
					type: "transform_tables_sort",
					input_table_file: step.source_tables[0],
					output_table_file: step.target_tables[0],
					input_table_name: step.source_tables[0],
					output_table_name: step.target_tables[0],
					input_explicit_col: step.source_column,
					operation_rule: sort_rule,
					operation_rule_chn: sort_rule_chn
				}
				somnus_dsl.push(sort_dsl)
				break;
			default:
              console.log("Unknow transformation");
          }
    }
    // somnus_dsl = [
    //   {
    //     input_explicit_col: ["order_date"],
    //     input_table_file: "orders",
    //     input_table_name: "orders",
    //     operation_rule: "Keep rows where order_date >= 2024-01-01",
    //     output_table_file: "orders_filter_0",
    //     output_table_name: "orders_filter_0",
    //     type: "delete_rows_filter",
    //   },
    //   {
    //     type: "create_columns_mutate",
    //     input_table_file: "orders_filter_0",
    //     output_table_file: "orders_filter_0_add_1",
    //     input_table_name: "orders_filter_0",
    //     output_table_name: "orders_filter_0_add_1",
    //     input_explicit_col: ["amount1", "amount2"],
    //     output_explicit_col: ["amount1 + amount2"],
    //     operation_rule: "Mutate: 'amount1 + amount2'",
    //   },
    //   {
    //     type: "transform_columns_rename",
    //     input_table_file: "orders_filter_0_add_1",
    //     output_table_file: "orders_filter_0_add_1_biz_rename_2",
    //     input_table_name: "orders_filter_0_add_1",
    //     output_table_name: "orders_filter_0_add_1_biz_rename_2",
    //     input_explicit_col: ["amount1 + amount2"],
    //     output_explicit_col: ["total_amount"],
    //     operation_rule: "Change Name:total_amount=amount1 + amount2",
    //   },
    //   {
    //     type: "delete_columns_select_keep",
    //     input_table_file: "orders_filter_0_add_1_biz_rename_2",
    //     output_table_file: "subquery",
    //     input_table_name: "orders_filter_0_add_1_biz_rename_2",
    //     output_table_name: "subquery",
    //     input_explicit_col: ["product_name", "total_amount"],
    //     operation_rule: 'Keep Column: "product_name", "total_amount"',
    //   },
    //   {
    //     input_explicit_col: ["total_amount"],
    //     input_table_file: "subquery",
    //     input_table_name: "subquery",
    //     operation_rule: "Keep rows where total_amount > 200",
    //     output_table_file: "subquery_filter_4",
    //     output_table_name: "subquery_filter_4",
    //     type: "delete_rows_filter",
    //   },
    //   {
    //     type: "create_columns_mutate",
    //     input_table_file: "subquery_filter_4",
    //     output_table_file: "subquery_filter_4_trim_5",
    //     input_table_name: "subquery_filter_4",
    //     output_table_name: "subquery_filter_4_trim_5",
    //     input_explicit_col: ["product_name"],
    //     output_explicit_col: ["trim(product_name)"],
    //     operation_rule: "Mutate: trim(product_name)",
    //   },
    //   {
    //     type: "create_columns_mutate",
    //     input_table_file: "subquery_filter_4_trim_5",
    //     output_table_file: "subquery_filter_4_trim_5_round_6",
    //     input_table_name: "subquery_filter_4_trim_5",
    //     output_table_name: "subquery_filter_4_trim_5_round_6",
    //     input_explicit_col: ["total_amount"],
    //     output_explicit_col: ["ROUND(total_amount, 1)"],
    //     operation_rule: "Mutate: ROUND(total_amount, 1)",
    //   },
    // ];
    return somnus_dsl;
  }
  
  function gen_data(data) {
    var somnus_data = { dsl: convert2SomnusSpec(data.dsl), data_df: {} };
  
    for (const dfi in data.data_df) {
      somnus_data.data_df[dfi] = convert2TableArray(data.data_df[dfi]);
    }
  
    return somnus_data;
  }
  
  export { gen_data };
  