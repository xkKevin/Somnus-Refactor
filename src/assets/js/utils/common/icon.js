export function drawIcon(g,pos,width,height,urls) {
    g.append('image')
        .attr('href',urls)
        .attr('x',pos[0])
        .attr('y',pos[1] + 2)
        .attr('width',width)
        .attr('height',height)
}