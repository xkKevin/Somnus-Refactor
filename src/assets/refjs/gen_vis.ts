import * as d3 from 'd3';
import { draw_glyph } from '@assets/refjs/gen_glyph'
import { VisData, TransformType, Arrange, SortType } from '@assets/refjs/interface'

export function gen_vis() {
  const width = window.innerWidth;
  const height = window.innerHeight - 100;

  const mainsvg = d3.select("svg")
    .attr("id", "mainsvg")
    .attr('width', width)
    .attr('height', height);

  let visData: VisData[] = [{
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
  visData.forEach((vis, i) => {
    draw_glyph(i, { x: i * 260, y: 200 }, vis)
  })

  let visData2: VisData[] = [{
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

  visData2.forEach((vis, i) => {
    draw_glyph(i, { x: i * 260, y: 400 }, vis)
  })

  //@ts-ignore
  svgPanZoom("#mainsvg");
}
