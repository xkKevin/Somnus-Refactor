import * as d3 from 'd3'
import {drawIcon} from "../utils/common/icon"
import {drawOperationName} from "../utils/common/operationName";
import {drawTableForRow} from "../utils/common/createTableForRow";
import {fontSize, svgSize,showOperation} from "../config/config";
import {drawPcentBar} from '../utils/common/pcentBar'

function combine_tables_extend_axis0(m1,m2,m3,rule,t1_name,t2_name,t3_name, inColors2,name,showTableName,pos,xPercents,yPercents){
    if(!showTableName){
        t1_name = ''
        t2_name = ''
        t3_name = ''
    }

    let width = svgSize.width
    let height = svgSize.height
    let colWidth = width / (Math.max(m1[0].length,m2[0].length) + m3[0].length + 1)
    let colHeight = showOperation ? height / (m1.length + m2.length + 4.5) : height / (m1.length + m2.length + 4)
    let colFontSize = fontSize.colFontSize
    let cellFontSize = fontSize.cellFontSize

    const g = d3.select(`#mainsvg`).append('g')
        .attr('transform',`translate(${pos[0]},${pos[1]})`)
        .attr("id",`glyph${name}`)
    g.append('rect')
    .attr('x',-10)
    .attr('y',0)
    .attr('width',parseInt(width) + 20)
    .attr('height',parseInt(height))
    .attr('stroke','gray')
    .attr('fill','transparent')
    .attr('class',`glyph_${name}`)
    g.append("path")
    .attr("d",`M${parseInt(width) / 2 - 4},${parseInt(height)} L${parseInt(width) / 2 + 4},${parseInt(height)}`)
    .attr('fill','none')
    .attr('stroke','white')
    .attr('stroke-width',"1px")
    // .attr('class',`glyph_${name}`)
    g.append("path")
    .attr("d",`M${parseInt(width) / 2 - 4},${parseInt(height)} L${parseInt(width) / 2},${parseInt(height) + 4} L${parseInt(width) / 2 + 4},${parseInt(height)}`)
    // .attr('d',"M0,0 L8,4 L0,8 L4,4 L0,0")
    .attr('fill','white')
    .attr('stroke','gray')
    .attr('stroke-width',"1px")
    .style("stroke-linecap", "round")
    .attr('class',`glyph_${name}`)
    drawTableForRow(g,m1,[0, colHeight],colWidth,colHeight,t1_name,colFontSize,cellFontSize)
    drawPcentBar(g,[0, colHeight],m1[0].length * colWidth,m1.length * colHeight,colHeight,xPercents[0],yPercents[0])
    drawTableForRow(g,m2,[0, 2.5 * colHeight + m1.length * colHeight],colWidth,colHeight,t2_name,colFontSize,cellFontSize,inColors2)
    drawPcentBar(g,[0, 2.5 * colHeight + m1.length * colHeight],m2[0].length * colWidth,m2.length * colHeight,colHeight,xPercents[1],yPercents[1])
   
    let arrowUrl = require('../../images/arrow.svg')
    drawIcon(g,[(m1[0].length + 0.1) * colWidth,(1 + m1.length / 2) * colHeight - colHeight / 2 + colHeight * 2],0.8 * colWidth, colHeight,arrowUrl)

    drawTableForRow(g,m3,[(m1[0].length + 1) * colWidth,2 * colHeight],colWidth,colHeight,t3_name,colFontSize,cellFontSize)
    drawPcentBar(g,[(m1[0].length + 1) * colWidth,2 * colHeight],m3[0].length * colWidth,m3.length * colHeight,colHeight,xPercents[2],yPercents[2])

    let yOfLine = (m1.length + m2.length + 3) * colHeight
    if(showOperation)drawOperationName(g,[width / 2,yOfLine],`${rule}`,'1.2em',colFontSize)
}

function combine_tables_extend_axis1(m1,m2,m3,rule,t1_name,t2_name,t3_name, inColors2,name,showTableName,pos,xPercents,yPercents){
    if(!showTableName){
        t1_name = ''
        t2_name = ''
        t3_name = ''
    }

    let width = svgSize.width
    let height = svgSize.height
    let colWidth = width / (Math.max(m1[0].length,m2[0].length) + m3[0].length + 1)
    let colHeight = showOperation ? height / (m1.length + m2.length + 4.5) : height / (m1.length + m2.length + 4)
    let colFontSize = fontSize.colFontSize
    let cellFontSize = fontSize.cellFontSize

    const g = d3.select(`#mainsvg`).append('g')
        .attr('transform',`translate(${pos[0]},${pos[1]})`)
        .attr("id",`glyph${name}`)
    g.append('rect')
    .attr('x',-10)
    .attr('y',0)
    .attr('width',parseInt(width) + 20)
    .attr('height',parseInt(height))
    .attr('stroke','gray')
    .attr('fill','transparent')
    .attr('class',`glyph_${name}`)
    g.append("path")
    .attr("d",`M${parseInt(width) / 2 - 4},${parseInt(height)} L${parseInt(width) / 2 + 4},${parseInt(height)}`)
    .attr('fill','none')
    .attr('stroke','white')
    .attr('stroke-width',"1px")
    // .attr('class',`glyph_${name}`)
    g.append("path")
    .attr("d",`M${parseInt(width) / 2 - 4},${parseInt(height)} L${parseInt(width) / 2},${parseInt(height) + 4} L${parseInt(width) / 2 + 4},${parseInt(height)}`)
    // .attr('d',"M0,0 L8,4 L0,8 L4,4 L0,0")
    .attr('fill','white')
    .attr('stroke','gray')
    .attr('stroke-width',"1px")
    .style("stroke-linecap", "round")
    .attr('class',`glyph_${name}`)
    drawTableForRow(g,m1,[0, colHeight],colWidth,colHeight,t1_name,colFontSize,cellFontSize)
    drawPcentBar(g,[0, colHeight],m1[0].length * colWidth,m1.length * colHeight,colHeight,xPercents[0],yPercents[0])
    drawTableForRow(g,m2,[0, 2.5 * colHeight + m1.length * colHeight],colWidth,colHeight,t2_name,colFontSize,cellFontSize,inColors2)
    drawPcentBar(g,[0, 2.5 * colHeight + m1.length * colHeight],m2[0].length * colWidth,m2.length * colHeight,colHeight,xPercents[1],yPercents[1])
   
    let arrowUrl = require('../../images/arrow.svg')
    drawIcon(g,[(m1[0].length + 0.1) * colWidth,(1 + m1.length / 2) * colHeight - colHeight / 2 + colHeight * 2],0.8 * colWidth, colHeight,arrowUrl)

    drawTableForRow(g,m3,[(m1[0].length + 1) * colWidth,2 * colHeight],colWidth,colHeight,t3_name,colFontSize,cellFontSize)
    drawPcentBar(g,[(m1[0].length + 1) * colWidth,2 * colHeight],m3[0].length * colWidth,m3.length * colHeight,colHeight,xPercents[2],yPercents[2])

    let yOfLine = (m1.length + m2.length + 3) * colHeight
    if(showOperation)drawOperationName(g,[width / 2,yOfLine],`${rule}`,'1.2em',colFontSize)
}
export {combine_tables_extend_axis0,combine_tables_extend_axis1}
