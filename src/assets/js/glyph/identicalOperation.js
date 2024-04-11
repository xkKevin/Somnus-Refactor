import {fontSize, svgSize} from "../config/config";
import * as d3 from 'd3'
export function identical_operation(pos,name,rule) {

    let width = svgSize.width
    let height = svgSize.height

    let colHeight = height / 6
    let colFontSize = fontSize.colFontSize

    const g = d3.select(`#mainsvg`).append('g')
        .attr('transform',`translate(${pos[0]},${pos[1]})`)
        .attr("id",`glyph${name}`)
  
    let yOfLine = 3 * colHeight

    g.append("text")
        .text(rule)
        .attr("x", width / 2)
        .attr("y", yOfLine)
        .attr('text-anchor','middle')
        .attr('dy','1.2em')
        .attr('font-size',`${colFontSize * 2}px`)
}