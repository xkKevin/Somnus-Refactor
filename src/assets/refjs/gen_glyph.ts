import * as d3 from 'd3';
import { fontSize, svgSize, showRule, tableRender } from "@assets/refjs/config";
import { VisData, TransformType, Arrange, Table, TblNum, Rect, SortType } from '@assets/refjs/interface'


function draw_highight_col(g, rowNum, hlCols, posi: Rect, shape: Rect, borderColor = '#92D882') {
  hlCols = Array.from(new Set(hlCols))
  let highlightCols = []
  let start = 0, end = 1
  let len = 0, midPoint = 0
  //在调用函数时已经进行了判断，保险起见，再函数内部再判断一次
  if (hlCols.length == 0) return { len, midPoint }

  if (hlCols.length == 1) highlightCols.push([hlCols[start], hlCols[end - 1]])
  while (start <= end && end < hlCols.length) {
    while ((start == end) || ((hlCols[end - 1] == hlCols[end] - 1) && (end < hlCols.length))) {
      end++
    }
    highlightCols.push([hlCols[start], hlCols[end - 1]])
    start = end
  }

  let rectStrokeWidth = tableRender.rectStrokeWidth

  for (let group = 0; group < highlightCols.length; group++) {
    //高亮框
    g.append('rect')
      .attr('width', (highlightCols[group][1] - highlightCols[group][0] + 1) * shape.x - rectStrokeWidth)
      .attr('height', shape.y * rowNum - rectStrokeWidth)
      .attr('stroke-width', `${rectStrokeWidth}px`)
      .attr('stroke', borderColor)
      .attr('fill', 'none')
      .attr('x', posi.x + highlightCols[group][0] * shape.x + rectStrokeWidth / 2)
      .attr('y', posi.y + rectStrokeWidth / 2)

    //每个组的竖线
    g.append("line")
      .attr("x1", posi.x + (highlightCols[group][1] + highlightCols[group][0] + 1) / 2 * shape.x)
      .attr("y1", posi.y + shape.y * rowNum + 3)
      .attr("x2", posi.x + (highlightCols[group][1] + highlightCols[group][0] + 1) / 2 * shape.x)
      .attr("y2", posi.y + shape.y * rowNum + (highlightCols.length === 1 ? shape.y : 0.5 * shape.y))
      .attr("stroke", tableRender.strokeColor)
      .attr("stroke-width", "1px")
      .style("stroke-dasharray", "4,4")
  }

  midPoint = posi.x + (highlightCols[0][1] + highlightCols[0][0] + 1) / 2 * shape.x
  //画表的水平线
  if (highlightCols.length != 1) {
    //把每一个组的竖线用水平线连起来
    g.append("line")
      .attr("x1", posi.x + (highlightCols[0][1] + highlightCols[0][0] + 1) / 2 * shape.x)
      .attr("y1", posi.y + shape.y * rowNum + 0.5 * shape.y)
      .attr("x2", posi.x + (highlightCols[highlightCols.length - 1][1] + highlightCols[highlightCols.length - 1][0] + 1) / 2 * shape.x)
      .attr("y2", posi.y + shape.y * rowNum + 0.5 * shape.y)
      .attr("stroke", tableRender.strokeColor)
      .attr("stroke-width", "1px")
      .style("stroke-dasharray", "4,4")
    let start = posi.x + (highlightCols[0][1] + highlightCols[0][0] + 1) / 2 * shape.x
    let end = posi.x + (highlightCols[highlightCols.length - 1][1] + highlightCols[highlightCols.length - 1][0] + 1) / 2 * shape.x
    midPoint = (start + end) / 2
    //连接组的水平线之下再画一条竖线
    g.append("line")
      .attr("x1", midPoint)
      .attr("y1", posi.y + shape.y * rowNum + 0.5 * shape.y)
      .attr("x2", midPoint)
      .attr("y2", posi.y + shape.y * rowNum + 1 * shape.y)
      .attr("stroke", tableRender.strokeColor)
      .attr("stroke-width", "1px")
      .style("stroke-dasharray", "4,4")
  }
  len = highlightCols.length
  return { len, midPoint }
}

function draw_line(g, startPosi: Rect, endPosi: Rect, dashed = false) {
  var line = g.append("line")
    .attr("x1", startPosi.x)
    .attr("y1", startPosi.y)
    .attr("x2", endPosi.x)
    .attr("y2", endPosi.y)
    .attr("stroke", tableRender.strokeColor)
    .attr("stroke-width", "1px")

  if (dashed)
    line.style("stroke-dasharray", "4,4")
}


function draw_scale_bar(g, posi: Rect, tblWidth, tblHeight, cellHeight, scale: Rect) {

  const thick_size = 8.2
  const half_thick_size = thick_size * 2.05

  g.append('rect')
    .attr('x', posi.x + tblWidth + 0.5)
    .attr('y', posi.y + cellHeight)
    .attr('width', cellHeight / thick_size)
    .attr('height', tblHeight - cellHeight)
    .attr('fill', "#767979")
    .attr('opacity', 0.3)
    // .attr('opacity',0.5)
    .attr('stroke-width', "0.5px")
    .attr('stroke', 'none')
    .attr('rx', cellHeight / half_thick_size)
    .attr('ry', cellHeight / half_thick_size)

  g.append('rect')
    .attr('x', posi.x + tblWidth + 0.5)
    .attr('y', posi.y + cellHeight)
    .attr('width', cellHeight / thick_size)
    .attr('height', scale.y * (tblHeight - cellHeight))
    .attr('fill', "#ABABAB")
    .attr('opacity', 0.8)
    .attr('rx', cellHeight / half_thick_size)
    .attr('rx', cellHeight / half_thick_size)


  g.append('rect')
    .attr('x', posi.x)
    .attr('y', posi.y + tblHeight + 0.5)
    .attr('width', tblWidth)
    .attr('height', cellHeight / thick_size)
    .attr('fill', "#767979")
    .attr('opacity', 0.3)
    .attr('stroke-width', "0.5px")
    .attr('stroke', 'none')
    .attr('rx', cellHeight / half_thick_size)
    .attr('rx', cellHeight / half_thick_size)

  g.append('rect')
    .attr('x', posi.x)
    .attr('y', posi.y + tblHeight + 0.5)
    .attr('width', scale.x * tblWidth)
    .attr('height', cellHeight / thick_size)
    .attr('fill', "#ABABAB")
    .attr('opacity', 0.8)
    .attr('rx', cellHeight / half_thick_size)
    .attr('rx', cellHeight / half_thick_size)
}

function draw_dash_rect(g, posi: Rect, shape: Rect, color = 'none') {
  g.append('rect')
    .attr('x', posi.x)
    .attr('y', posi.y)
    .attr('width', shape.x)
    .attr('height', shape.y)
    .attr('fill', color)
    .attr("stroke", tableRender.strokeColor)
    .attr("stroke-width", "1px")
    .style("stroke-dasharray", "4,4")
}

function draw_icon(g, url: string, posi: Rect, shape: Rect, space: Rect = shape) {
  g.append('image')
    .attr('href', url)
    .attr('x', posi.x)
    .attr('y', posi.y)
    .attr('width', shape.x)
    .attr('height', shape.y)
    .attr('transform', `translate(${(space.x - shape.x) / 2}, ${(space.y - shape.y) / 2})`)
}

function draw_text(g, text: string, maxLetter: number, fontSize: number, posi: Rect, space: Rect, anchor = 'middle', fill = 'white') {

  let content_g = g.append('text')
    .attr('x', posi.x)
    .attr('y', posi.y)
    .attr('text-anchor', anchor)
    .attr('dominant-baseline', 'middle')
    .attr('transform', `translate(${space.x / 2}, ${space.y / 2})`)
    .attr('fill', fill)
    .attr('font-size', `${fontSize}px`)

  // 调整glyph内文本长度
  maxLetter = maxLetter * 0.8
  if (maxLetter >= text.length) {
    content_g.text(text)
  } else {
    content_g.text(text.slice(0, maxLetter - 1) + '…')
      .append("svg:title")
      .text(text)
  }

}

function draw_table(g, tbl: Table, arrange: Arrange, posi: Rect, shape: Rect) {
  // console.log(tbl, posi);

  let colors = tableRender.colors

  let matrix = tbl.data;
  let colColor = tbl.color;

  let cellFontSize = shape.x / 5
  let maxTblName = shape.x * matrix[0].length * 2.36 / cellFontSize
  let maxCellContent = shape.x * 1.6 / cellFontSize

  draw_text(g, tbl.name, maxTblName, cellFontSize, posi, { x: 0, y: - shape.y / 1.5 }, "start", "balck")

  let sortIndex = 0

  for (let row = 0; row < matrix.length; row++) {
    for (let col = 0; col < matrix[0].length; col++) {
      let color = tableRender.firstRowColor;
      if (row > 0) {
        if (arrange === Arrange.Col) color = colColor.length === 0 ? colors[col] : colors[colColor[col]]
        else color = colColor.length == 0 ? colors[row - 1] : colors[colColor[row - 1]]
      }

      let cellPosi: Rect = { x: posi.x + col * shape.x, y: posi.y + row * shape.y }

      g.append('rect')
        .attr('width', shape.x)
        .attr('height', shape.y)
        .attr('fill', color)
        .attr('opacity', tableRender.opacity)
        .attr('stroke-width', '1px')
        .attr('stroke', tableRender.strokeColor)
        .attr('x', cellPosi.x)
        .attr('y', cellPosi.y)

      if (matrix[row][col] != '')
        if (row == 0 && tbl.sortCol && tbl.sortCol.length) {

          let orderUrl = tbl.sortCol[sortIndex] === SortType.Asc ? 'assets/images/asc.svg' : 'assets/images/desc.svg'
          draw_icon(g, orderUrl, { x: cellPosi.x + shape.x - 0.33 * shape.x, y: cellPosi.y }, { x: 0.3 * shape.x, y: 0.4 * shape.y }, { x: 0.38 * shape.x, y: 1.4 * shape.y })

          draw_text(g, matrix[row][col], maxCellContent - 2, cellFontSize, cellPosi, { x: shape.x - 0.23 * shape.x, y: shape.y })
          sortIndex++

        } else { draw_text(g, matrix[row][col], maxCellContent, cellFontSize, cellPosi, shape) }
    }
  }

  draw_scale_bar(g, posi, tbl.data[0].length * shape.x, tbl.data.length * shape.y, shape.y, tbl.scale)
}



function compute_tbl_posi(colNum: TblNum, rowNum: TblNum, cellWidth: number, cellHeight: number) {
  // 返回 每张表的 位置
  let posi = {
    in: [],
    inColMax: 0,
    out: [],
    rowMax: 0,
  };

  let accHeight = cellHeight
  rowNum.in.forEach(trn => {
    posi.in.push({ x: 0, y: accHeight })
    accHeight += cellHeight * trn
  })

  posi.inColMax = d3.max(colNum.in) * cellWidth
  posi.rowMax = accHeight

  let startOut = posi.inColMax + cellWidth
  accHeight = cellHeight
  rowNum.out.forEach(trn => {
    posi.out.push({ x: startOut, y: accHeight })
    accHeight += cellHeight * trn
  })

  posi.rowMax = d3.max([posi.rowMax, accHeight]) - cellHeight

  return posi
}



export function draw_glyph(step: number, posi: Rect, vis: VisData) {

  let width = svgSize.width
  let height = svgSize.height


  const g = d3.select(`#mainsvg`).append('g')
    .attr('transform', `translate(${posi.x},${posi.y})`)
    .attr("id", `glyph${step}`)

  { // 绘制 Glyph 的外边框
    g.append('rect')
      .attr('x', -10)
      .attr('y', 0)
      .attr('width', parseInt(width) + 20)
      .attr('height', parseInt(height))
      .attr('stroke', 'gray')
      .attr('fill', 'transparent')
      .attr('class', `glyph_${step}`)
    g.append("path")
      .attr("d", `M${parseInt(width) / 2 - 4},${parseInt(height)} L${parseInt(width) / 2 + 4},${parseInt(height)}`)
      .attr('fill', 'none')
      .attr('stroke', 'white')
      .attr('stroke-width', "1px")
    // .attr('class',`glyph_${name}`)
    g.append("path")
      .attr("d", `M${parseInt(width) / 2 - 4},${parseInt(height)} L${parseInt(width) / 2},${parseInt(height) + 4} L${parseInt(width) / 2 + 4},${parseInt(height)}`)
      .attr('fill', 'white')
      .attr('stroke', 'gray')
      .attr('stroke-width', "1px")
      .style("stroke-linecap", "round")
      .attr('class', `glyph_${step}`)
  }


  let colNum: TblNum = {
    in: vis.in.map((tbl: Table) => tbl.data[0].length),
    out: vis.out.map((tbl: Table) => tbl.data[0].length)
  }

  let rowNum: TblNum = {
    in: vis.in.map((tbl: Table) => tbl.data.length + 1),
    out: vis.out.map((tbl: Table) => tbl.data.length + 1)
  }

  // 以下6种转换类型设计到 虚线框和加号
  switch (vis.type) {
    case TransformType.CreateColumns:
      colNum.in = colNum.out
      break
    case TransformType.CreateRows:
      rowNum.in = rowNum.out
      break
    case TransformType.CreateTables:
      rowNum.in = rowNum.out
      colNum.in = colNum.out
      break
    case TransformType.DeleteColumns:
      colNum.out = colNum.in
      break
    case TransformType.DeleteRows:
      rowNum.out = rowNum.in
      break
    case TransformType.DeleteTables:
      rowNum.out = rowNum.in
      colNum.out = colNum.in
      break
  }

  let cellWidth = width / (d3.max(colNum.in) + d3.max(colNum.out) + 1);
  let cellHeight = height / (d3.max([d3.sum(rowNum.in), d3.sum(rowNum.out)]) + (showRule ? 2 : 1));

  let tblPosi = compute_tbl_posi(colNum, rowNum, cellWidth, cellHeight)

  let arrowUrl = 'assets/images/arrow.svg'
  let arrow_width = d3.min([3.4 * Math.sqrt(cellWidth), cellWidth - 2])
  draw_icon(g, arrowUrl, { x: tblPosi.inColMax + 1, y: cellHeight + 1 }, { x: arrow_width, y: arrow_width }, { x: cellWidth, y: tblPosi.rowMax - cellHeight })

  let plusUrl = 'assets/images/add.svg'

  let leftG = g.append("g"), rightG = g.append("g");

  let emptyDashPosi: Rect, rectShape: Rect
  let scaleIcon = 0.55
  let tmpG = leftG;
  switch (vis.type) {
    case TransformType.CreateColumns:
      emptyDashPosi = { x: vis.in[0].data[0].length * cellWidth, y: cellHeight }
      rectShape = { x: tblPosi.inColMax - emptyDashPosi.x, y: tblPosi.rowMax - cellHeight }
      break
    case TransformType.CreateRows:
      emptyDashPosi = { x: 0, y: (vis.in[0].data.length + 1) * cellHeight }
      rectShape = { x: tblPosi.inColMax, y: tblPosi.rowMax - emptyDashPosi.y }
      break
    case TransformType.CreateTables:
      emptyDashPosi = { x: 0, y: cellHeight }
      rectShape = { x: tblPosi.inColMax, y: tblPosi.rowMax - cellHeight }
      break
    case TransformType.DeleteColumns:
      emptyDashPosi = { x: tblPosi.inColMax + (1 + vis.out[0].data[0].length) * cellWidth, y: cellHeight }
      rectShape = { x: tblPosi.inColMax - vis.out[0].data[0].length * cellWidth, y: tblPosi.rowMax - cellHeight }
      tmpG = rightG
      break
    case TransformType.DeleteRows:
      emptyDashPosi = { x: tblPosi.inColMax + cellWidth, y: (vis.out[0].data.length + 1) * cellHeight }
      rectShape = { x: tblPosi.inColMax, y: tblPosi.rowMax - emptyDashPosi.y }
      tmpG = rightG
      break
    case TransformType.DeleteTables:
      emptyDashPosi = { x: tblPosi.inColMax + cellWidth, y: cellHeight }
      rectShape = { x: tblPosi.inColMax, y: tblPosi.rowMax - cellHeight }
      break
  }
  if (emptyDashPosi) {
    draw_dash_rect(tmpG, emptyDashPosi, rectShape)
    if (vis.type < 3) {
      draw_icon(tmpG, plusUrl, emptyDashPosi, { x: scaleIcon * rectShape.x, y: scaleIcon * rectShape.y }, rectShape)
    }
  }

  let inColLenAndMid, outColLenAndMid;
  vis.in.forEach((tbl: Table, ti: number) => {
    draw_table(leftG, tbl, vis.arrange, tblPosi.in[ti], { x: cellWidth, y: cellHeight })
    if (tbl.linkCol && tbl.linkCol.length) {
      inColLenAndMid = draw_highight_col(leftG, tbl.data.length, tbl.linkCol, tblPosi.in[ti], { x: cellWidth, y: cellHeight })
    }
  })
  let yOfLine: number = tblPosi.rowMax + cellHeight
  vis.out.forEach((tbl: Table, ti: number) => {
    draw_table(rightG, tbl, vis.arrange, tblPosi.out[ti], { x: cellWidth, y: cellHeight })
    if (tbl.linkCol && tbl.linkCol.length) {
      if (inColLenAndMid.len !== 0) {
        outColLenAndMid = draw_highight_col(rightG, tbl.data.length, tbl.linkCol, tblPosi.out[ti], { x: cellWidth, y: cellHeight })
        if ((tbl.data.length + 1) * cellHeight < tblPosi.rowMax) {
          draw_line(g, { x: outColLenAndMid.midPoint, y: yOfLine }, { x: outColLenAndMid.midPoint, y: yOfLine - (tblPosi.rowMax - (tbl.data.length + 1) * cellHeight) }, true)
        }
        draw_line(g, { x: inColLenAndMid.midPoint, y: yOfLine }, { x: outColLenAndMid.midPoint, y: yOfLine }, true)
      }
    }
  })

  if (showRule) {
    let maxLetter = width * 2.36 / fontSize.ruleFontSize - 4
    draw_text(g, vis.rule, maxLetter, fontSize.ruleFontSize, { x: width / 2, y: height - 14 + 0.4 * tblPosi.rowMax / cellHeight }, { x: 0, y: 0 }, "middle", "black")
  }

  let svgBox;
  if (d3.sum(rowNum.in) > d3.sum(rowNum.out)) {
    svgBox = rightG.node().getBBox()
    rightG.attr('transform', `translate(0, ${(tblPosi.rowMax - svgBox.height) / 2})`)
  } else if (d3.sum(rowNum.in) < d3.sum(rowNum.out)) {
    svgBox = leftG.node().getBBox()
    leftG.attr('transform', `translate(0, ${(tblPosi.rowMax - svgBox.height) / 2})`)
  }

}
