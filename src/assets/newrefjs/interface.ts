interface Rect {
  x: number,
  y: number
}

interface Table {
  data: Array<string[]>,
  name: string,
  color: number[],
  scale: Rect,  // 表格 bar 的行列百分比
  linkCol?: number[], // 哪些列需要高亮，连接
  sortCol?: SortType[]  // 有没有排序的列
}

enum Arrange {  // 表中的行列颜色encoding方向
  Row,
  Col
}

enum SortType {
  Asc,  // 升序
  Desc  // 降序
}

interface VisData {
  in: Array<Table>   // 输入表
  out: Array<Table>,  // 输出表
  rule: string,
  type: TransformType,
  arrange: Arrange,  // 表中的行列颜色encoding方向
}

enum TransformType {
  CreateTables,
  CreateColumns,
  CreateRows,
  DeleteTables,
  DeleteColumns,
  DeleteRows,
  TransformTables,
  SeparateTables,
  CombineTables,

  // 以下弃用
  // TransformColumns,
  // TransformRows,
  // SeparateColumns,
  // SeparateRows,
  // CombineColumns,
  // CombineRows,
  // Identical
}

enum GenDataType {
  FirstRows,
  DeleteRows,
  CreateRows,
  Sort,
}

interface GenTblCols {
  all: string[],
  explicit: string[], // explicit的列表示列名和列的单元格内容都会显示在glyph上
  implicit: string[], // implicit的列仅列名会显示在glyph上
  context: string[] // context的列在glyph上不会有任何内容
}


interface TblNum {
  in: number[],
  out: number[]
}

export { VisData, TransformType, Arrange, Table, TblNum, Rect, SortType, GenDataType, GenTblCols}
