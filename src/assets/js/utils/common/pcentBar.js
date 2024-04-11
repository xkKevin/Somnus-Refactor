// export function drawPcentBar(g,pos,glyphWidth,glyphHeight,cellHeight,xPercent,yPercent){
//     g.append('rect')
//     .attr('x',pos[0] + glyphWidth)
//     .attr('y',pos[1] + cellHeight)
//     .attr('width',cellHeight / 8)
//     .attr('height',glyphHeight - cellHeight)
//     .attr('fill','white')
//     // .attr('opacity',0.5)
//     .attr('stroke-width',"0.5px")
//     .attr('stroke','black')

//     g.append('rect')
//     .attr('x',pos[0] + glyphWidth)
//     .attr('y',pos[1] + cellHeight)
//     .attr('width',cellHeight / 8)
//     .attr('height',yPercent * (glyphHeight - cellHeight))
//     .attr('fill','gray')

//     g.append('rect')
//     .attr('x',pos[0])
//     .attr('y',pos[1] + glyphHeight)
//     .attr('width',glyphWidth)
//     .attr('height',cellHeight / 8)
//     .attr('fill','white')
//     // .attr('opacity',0.5)
//     .attr('stroke-width',"0.5px")
//     .attr('stroke','black')

//     g.append('rect')
//     .attr('x',pos[0])
//     .attr('y',pos[1] + glyphHeight)
//     .attr('width',xPercent * glyphWidth)
//     .attr('height',cellHeight / 8)
//     .attr('fill','gray')
// }

const thick_size = 8.2
const half_thick_size = thick_size * 2.05
export function drawPcentBar(g, pos, glyphWidth, glyphHeight, cellHeight, xPercent, yPercent) {
    // console.log(xPercent, yPercent);
    g.append('rect')
        .attr('x', pos[0] + glyphWidth + 0.5)
        .attr('y', pos[1] + cellHeight)
        .attr('width', cellHeight / thick_size)
        .attr('height', glyphHeight - cellHeight)
        .attr('fill', "#767979")
        .attr('opacity', 0.3)
        // .attr('opacity',0.5)
        .attr('stroke-width', "0.5px")
        .attr('stroke', 'none')
        .attr('rx', cellHeight / half_thick_size)
        .attr('ry', cellHeight / half_thick_size)

    g.append('rect')
        .attr('x', pos[0] + glyphWidth + 0.5)
        .attr('y', pos[1] + cellHeight)
        .attr('width', cellHeight / thick_size)
        .attr('height', yPercent * (glyphHeight - cellHeight))
        .attr('fill', "#ABABAB")
        .attr('opacity', 0.8)
        .attr('rx', cellHeight / half_thick_size)
        .attr('rx', cellHeight / half_thick_size)


    g.append('rect')
        .attr('x', pos[0])
        .attr('y', pos[1] + glyphHeight + 0.5)
        .attr('width', glyphWidth)
        .attr('height', cellHeight / thick_size)
        .attr('fill', "#767979")
        .attr('opacity', 0.3)
        .attr('stroke-width', "0.5px")
        .attr('stroke', 'none')
        .attr('rx', cellHeight / half_thick_size)
        .attr('rx', cellHeight / half_thick_size)

    g.append('rect')
        .attr('x', pos[0])
        .attr('y', pos[1] + glyphHeight + 0.5)
        .attr('width', xPercent * glyphWidth)
        .attr('height', cellHeight / thick_size)
        .attr('fill', "#ABABAB")
        .attr('opacity', 0.8)
        .attr('rx', cellHeight / half_thick_size)
        .attr('rx', cellHeight / half_thick_size)
}