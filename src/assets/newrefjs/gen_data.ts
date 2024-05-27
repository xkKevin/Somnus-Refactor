import { GenDataType, GenTblCols, Table } from '@assets/newrefjs/interface'

function sortBySpecifiedColumn(data: string[][], columnName: string, sortOrder: 'asc' | 'desc'): string[][] {
  // 检查数据中是否包含列名
  const headers: string[] = data[0];
  const columnIndex: number = headers.indexOf(columnName);
  if (columnIndex === -1) {
    throw new Error(`Column "${columnName}" not found.`);
  }

  // 移除列名行，并复制剩余行以进行排序
  const rows: string[][] = data.slice(1).map(row => [...row]);

  // 定义一个辅助函数来获取排序值，根据数据类型进行处理
  const getSortValue = (row: string[], index: number): string | number | Date => {
    const value = row[index];
    if (typeof value === 'string') {
      // 如果是日期字符串，尝试转换为Date对象
      if (!isNaN(Date.parse(value))) {
        return new Date(value);
      }
      // 默认为字符串比较
      return value;
    } else if (typeof value === 'number') {
      // 数值比较
      return value;
    } else {
      // 其他类型，默认为字符串比较
      return String(value);
    }
  };

  // 执行排序
  rows.sort((a, b) => {
    const valueA = getSortValue(a, columnIndex);
    const valueB = getSortValue(b, columnIndex);

    if (valueA < valueB) {
      return sortOrder === 'asc' ? -1 : 1;
    } else if (valueA > valueB) {
      return sortOrder === 'asc' ? 1 : -1;
    } else {
      return 0;
    }
  });

  // 将排序后的行与列名行重新组合
  return [headers, ...rows];
}

function addElementToContext(cols: GenTblCols[]): void {
  for (const col of cols) {
    // 合并explicit，implicit，context中的所有元素到一个集合中，以便快速查找
    const existingSet = new Set([...col.explicit, ...col.implicit, ...col.context]);

    // 检查all数组的长度是否大于其他三个数组长度之和
    if (col.all.length > col.explicit.length + col.implicit.length + col.context.length) {
      // 寻找一个存在于all中但不在existingSet中的元素
      const elementToAdd = col.all.find(element => !existingSet.has(element));

      // 如果找到了这样的元素，则添加到context中
      if (elementToAdd) {
        col.context.push(elementToAdd);
      }
    }
  }
}

function arraysStrictEqual(a: any[], b: any[]): boolean {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (a.length !== b.length) return false;

  return a.every((val, index) => val === b[index]);
}

function mergeAndRemoveDuplicates(arr1: any[], arr2: any[]): any[] {
  // 合并两个数组
  const mergedArray = [...arr1, ...arr2];

  // 去除重复的元素
  const uniqueArray = new Set(mergedArray);
  const resultArray = Array.from(uniqueArray);

  return resultArray;
}

function union<T>(...sets: Set<T>[]): Set<T> {
  const unionSet = new Set<T>();
  for (const set of sets) {
    for (const item of set) {
      unionSet.add(item);
    }
  }
  return unionSet;
}

function intersection<T>(...sets: Set<T>[]): Set<T> {
  if (sets.length === 0) {
    return new Set<T>();
  }
  const intersectionSet = new Set<T>(sets[0]);
  for (const set of sets) {
    for (const item of intersectionSet) {
      if (!set.has(item)) {
        intersectionSet.delete(item);
      }
    }
  }
  return intersectionSet;
}

function difference<T>(setA: Set<T>, setB: Set<T>): Set<T> {
  const differenceSet = new Set<T>(setA);
  for (const item of setB) {
    differenceSet.delete(item);
  }
  return differenceSet;
}

const range = (start, end) => Array.from({ length: end - start }, (_, i) => start + i);

function findIndices(A: any[], B: any[]): number[] {
  const indices = [];

  for (let i = 0; i < B.length; i++) {
    const index = A.indexOf(B[i]);
    if (index >= 0)
      indices.push(index);
  }

  indices.sort((a, b) => a - b); // 按照从小到大排序

  return indices;
}


function glyph_cols_len(cols: GenTblCols): number {
  return cols.explicit.length + cols.implicit.length + cols.context.length
}

/**
 * 给glyph补全explicit，implicit列，以及填充context列
 */
function extract_glyph_cols(in_cols: GenTblCols[], out_cols: GenTblCols[]) {

  // 先互相把所有tables的explicit和implicit列引入进来
  let all_ex_cols = new Set()
  let all_im_cols = new Set()

  let cols = [...in_cols, ...out_cols]

  cols.forEach(c => {
    all_ex_cols = union(all_ex_cols, new Set(c.explicit))
    all_im_cols = union(all_im_cols, new Set(c.implicit))
  })

  // 开始为每一个表补充explicit和implicit列
  cols.forEach(c => {
    const all_cols_set = new Set(c.all)
    c.explicit = [...union(new Set(c.explicit), intersection(all_ex_cols, all_cols_set))] as string[]
    c.implicit = [...difference(union(new Set(c.implicit), intersection(all_im_cols, all_cols_set)), new Set(c.explicit))] as string[]
  })

  // 为每一张input表设置添加context的顺序
  let in_groups: number[][] = []
  let in_groups_flag = false
  in_cols.map((ic, index) => {
    const ex_im_cols_poi = findIndices(ic.all, [...ic.explicit, ...ic.implicit])
    let groups: number[][] = []
    let start = 0;
    for (const poi of ex_im_cols_poi) {
      groups.push(range(start, poi));
      start = poi + 1;
    }
    if (start < ic.all.length) {
      groups.push(range(start, ic.all.length));
    }
    let context_pool = []
    const groups_max_len = Math.max(...groups.map(g => g.length))
    if (groups_max_len > 0) in_groups_flag = true
    for (let i = 0; i < groups_max_len; i++) {
      for (let j = 0; j < groups.length; j++) {
        if (i < groups[j].length)
          context_pool.push(groups[j][i])
      }
    }
    in_groups.push(context_pool)
  })

  let out_all_cols = new Set()
  out_cols.forEach(c => {
    out_all_cols = union(out_all_cols, new Set(c.all))
  })

  let in_cols_len = in_cols.map(c => glyph_cols_len(c))
  let out_cols_len = out_cols.map(c => glyph_cols_len(c))
  let all_cols_len = [...in_cols_len, ...out_cols_len]

  while ((Math.max(...all_cols_len) < 3 || Math.min(...all_cols_len) <= 1) && in_groups_flag) {
    in_groups_flag = false
    const in_min_len = Math.min(...in_cols_len)
    in_cols_len.forEach((l, i) => {
      if (l === in_min_len) {
        in_groups[i].find((gi, index) => {
          if (out_all_cols.has(in_cols[i].all[gi])) {
            in_cols[i].context.push(in_cols[i].all[gi])
            out_cols.forEach(oc => {
              oc.context.push(in_cols[i].all[gi])
              oc.context = Array.from(new Set(oc.context))
            })
            in_groups[i].splice(index, 1) // 去掉该元素
            if (in_groups[i].length > 0) {
              in_groups_flag = true
            }
            return true
          }
          return false
        })
      }
    })
    // in_groups_flag = Math.max(...in_groups.map(g => g.length) > 0
    in_cols_len = in_cols.map(c => glyph_cols_len(c))
    out_cols_len = out_cols.map(c => glyph_cols_len(c))
    all_cols_len = [...in_cols_len, ...out_cols_len]
  }
}

// function gen_separate_tbl_data() { }
// function gen_combine_tbl_data() { }
// function gen_tr_tbl_data() { }


function gen_data(gen_type: GenDataType, tbls: { in: any[], out: any[] }, tbl_names: { in: string[], out: string[] }, cols: { in: GenTblCols[], out: GenTblCols[] }, show_col_name: boolean = true) {
  // let glyph_cols = extract_glyph_cols(Array.from(tbl[0]), cols)
  // console.log(glyph_cols);

  let in_glyph_cols = [...cols.in[0].explicit, ...cols.in[0].implicit, ...cols.in[0].context]
  const in_glyph_cols_poi = findIndices(cols.in[0].all, in_glyph_cols)
  in_glyph_cols = in_glyph_cols_poi.map(gp => cols.in[0].all[gp])
  const in_explicit_poi = findIndices(cols.in[0].all, cols.in[0].explicit)
  const in_ex_glyph_poi = in_explicit_poi.map(ep => in_glyph_cols_poi.indexOf(ep))
  const in_implicit_poi = findIndices(cols.in[0].all, cols.in[0].implicit)
  const in_im_glyph_poi = in_implicit_poi.map(ep => in_glyph_cols_poi.indexOf(ep))

  const in_col_names = new Array(in_glyph_cols_poi.length).fill("")
  if (show_col_name) {
    in_explicit_poi.forEach((p, index) => {
      in_col_names[in_ex_glyph_poi[index]] = tbls.in[0][0][p]
    })
    in_implicit_poi.forEach((p, index) => {
      in_col_names[in_im_glyph_poi[index]] = tbls.in[0][0][p]
    })
  }

  let out_glyph_cols = [...cols.out[0].explicit, ...cols.out[0].implicit, ...cols.out[0].context]
  const out_glyph_cols_poi = findIndices(cols.out[0].all, out_glyph_cols)
  out_glyph_cols = out_glyph_cols_poi.map(gp => cols.out[0].all[gp])
  const out_explicit_poi = findIndices(cols.out[0].all, cols.out[0].explicit)
  const out_ex_glyph_poi = out_explicit_poi.map(ep => out_glyph_cols_poi.indexOf(ep))
  const out_implicit_poi = findIndices(cols.out[0].all, cols.out[0].implicit)
  const out_im_glyph_poi = out_implicit_poi.map(ep => out_glyph_cols_poi.indexOf(ep))


  const out_col_names = new Array(out_glyph_cols_poi.length).fill("")

  if (show_col_name) {
    out_explicit_poi.forEach((p, index) => {
      out_col_names[out_ex_glyph_poi[index]] = tbls.out[0][0][p]
    })
    out_implicit_poi.forEach((p, index) => {
      out_col_names[out_im_glyph_poi[index]] = tbls.out[0][0][p]
    })
  }

  let in_tbl = [in_col_names], out_tbl = [out_col_names]
  let row_i = 1
  let glyph_row_tmp = [], glyph_out_tmp = []
  let in_index = [], out_index = []

  let inTable: Table, outTable: Table
  let out_link = []
  let index_tmp


  switch (gen_type) {
    case GenDataType.DeleteRows:
      while (in_tbl.length < 4 && in_tbl.length < tbls.in[0].length) {
        const row = tbls.in[0][row_i++]
        let glyph_row = Array(in_glyph_cols_poi.length).fill("")
        in_explicit_poi.forEach((p, index) => {
          glyph_row[in_ex_glyph_poi[index]] = row[p]
        })
        const out_r_i = tbls.out[0].findIndex(out_r => JSON.stringify(out_r) === JSON.stringify(row));
        if (out_r_i != -1) { // 输出表有这一行
          if (in_tbl.length < 3 || out_tbl.length < in_tbl.length) {
            in_tbl.push(glyph_row)
            out_tbl.push(glyph_row)
            out_index.push(in_index.length)
            in_index.push(in_index.length)
          } else if (glyph_row_tmp.length < 2) {
            glyph_row_tmp.push(glyph_row)
            glyph_out_tmp.push(true)
          }
        } else { // 输出表没有这一行
          if (out_tbl.length == in_tbl.length) {
            in_tbl.push(glyph_row)
            in_index.push(in_index.length)
          } else if (glyph_row_tmp.length < 2) {
            glyph_row_tmp.push(glyph_row)
            glyph_out_tmp.push(false)
          }
        }
      }
      if (in_tbl.length < 3 && glyph_row_tmp) {
        glyph_row_tmp.forEach((grt, index) => {
          in_tbl.push(grt)
          if (glyph_out_tmp[index]) {
            out_tbl.push(grt)
            out_index.push(in_index.length)
          }
          in_index.push(in_index.length)
        })
      }
      inTable = {
        data: in_tbl,
        name: tbl_names.in[0],
        color: in_index,
        scale: {
          x: in_glyph_cols.length / tbls.in[0][0].length,
          y: (in_tbl.length - 1) / (tbls.in[0].length - 1),
        }
      }

      outTable = {
        data: out_tbl,
        name: tbl_names.out[0],
        color: out_index,
        scale: {
          x: out_glyph_cols.length / tbls.out[0][0].length,
          y: (out_tbl.length - 1) / (tbls.out[0].length - 1),
        }
      }

      return { in: [inTable], out: [outTable] }

    case GenDataType.FirstRows:
      while (in_tbl.length < 4 && in_tbl.length < tbls.in[0].length) {
        let row = tbls.in[0][row_i]
        let glyph_row = Array(in_glyph_cols_poi.length).fill("")
        in_explicit_poi.forEach((p, index) => {
          glyph_row[in_ex_glyph_poi[index]] = row[p]
        })
        in_tbl.push(glyph_row)
        console.log(in_tbl);

        row = tbls.out[0][row_i]
        glyph_row = Array(out_glyph_cols_poi.length).fill("")
        out_explicit_poi.forEach((p, index) => {
          glyph_row[out_ex_glyph_poi[index]] = row[p]
        })

        out_tbl.push(glyph_row)

        row_i++
      }
<<<<<<< HEAD
      out_link = []
      if (arraysStrictEqual(in_ex_glyph_poi,out_ex_glyph_poi)) {
=======
      let out_link = []
      if (arraysStrictEqual(in_ex_glyph_poi, out_ex_glyph_poi)) {
>>>>>>> 422ac1f4098610127e4729bda929c3daf11398c2
        out_link = out_ex_glyph_poi
      } else {
        out_link = [...difference(new Set(out_ex_glyph_poi), new Set(in_ex_glyph_poi))]
      }
      inTable = {
        data: in_tbl,
        name: tbl_names.in[0],
        color: range(0, in_glyph_cols_poi.length),
        scale: {
          x: in_glyph_cols.length / tbls.in[0][0].length,
          y: (in_tbl.length - 1) / (tbls.in[0].length - 1),
        },
        linkCol: in_ex_glyph_poi
      }

      out_index = Array(out_glyph_cols_poi.length).fill(null)
      in_glyph_cols.forEach((gc, index) => {
        out_index[out_glyph_cols.indexOf(gc)] = index
      })
      index_tmp = in_glyph_cols.length
      out_index.forEach((oi, index) => {
        if (oi == null) {
          out_index[index] = index_tmp++
        }
      })
      outTable = {
        data: out_tbl,
        name: tbl_names.out[0],
        color: out_index,
        scale: {
          x: out_glyph_cols.length / tbls.out[0][0].length,
          y: (out_tbl.length - 1) / (tbls.out[0].length - 1),
        },
        // linkCol: [...difference(new Set(out_ex_glyph_poi), new Set(in_ex_glyph_poi))]
        linkCol: out_link
      }

      return { in: [inTable], out: [outTable] }

    case GenDataType.Sort:
      while (in_tbl.length < 4 && in_tbl.length < tbls.in[0].length) {
        let row = tbls.in[0][row_i]
        let glyph_row = Array(in_glyph_cols_poi.length).fill("")
        in_explicit_poi.forEach((p, index) => {
          glyph_row[in_ex_glyph_poi[index]] = row[p]
        })
        in_tbl.push(glyph_row)

        row = tbls.out[0][row_i]
        glyph_row = Array(out_glyph_cols_poi.length).fill("")
        out_explicit_poi.forEach((p, index) => {
          glyph_row[out_ex_glyph_poi[index]] = row[p]
        })

        out_tbl.push(glyph_row)

        row_i++
      }
      if (arraysStrictEqual(in_ex_glyph_poi,out_ex_glyph_poi)) {
        out_link = out_ex_glyph_poi
      } else {
        out_link = [...difference(new Set(out_ex_glyph_poi), new Set(in_ex_glyph_poi))]
      }
      inTable = {
        data: in_tbl,
        name: tbl_names.in[0],
        color: range(0, in_glyph_cols_poi.length),
        scale: {
          x: in_glyph_cols.length / tbls.in[0][0].length,
          y: (in_tbl.length - 1) / (tbls.in[0].length - 1),
        },
        linkCol: in_ex_glyph_poi
      }

      out_index = Array(out_glyph_cols_poi.length).fill(null)
      in_glyph_cols.forEach((gc, index) => {
        out_index[out_glyph_cols.indexOf(gc)] = index
      })
      index_tmp = in_glyph_cols.length
      out_index.forEach((oi, index) => {
        if (oi == null) {
          out_index[index] = index_tmp++
        }
      })
      outTable = {
        data: out_tbl,
        name: tbl_names.out[0],
        color: out_index,
        scale: {
          x: out_glyph_cols.length / tbls.out[0][0].length,
          y: (out_tbl.length - 1) / (tbls.out[0].length - 1),
        },
        // linkCol: [...difference(new Set(out_ex_glyph_poi), new Set(in_ex_glyph_poi))]
        linkCol: out_link
      }

      return { in: [inTable], out: [outTable] }

    default:
      return { in: [], out: [] }

  }
}


export { extract_glyph_cols, gen_data, addElementToContext, mergeAndRemoveDuplicates }
