export function drawOperationName(g, pos, name, dy = '1.2em', colFontSize) {
    let showText = ''
    let max_letters = 36
    if (max_letters >= name.length) {
        showText = name
        g.append("text")
            .text(name)
            .attr("x", pos[0])
            .attr("y", pos[1])
            .attr('text-anchor', 'middle')
            .attr('dy', dy)
            .attr('font-size', `${colFontSize * 2}px`)
            .text(showText)
    } else {
        showText = name.slice(0, max_letters - 1)
        showText += '…'
        g.append("text")
            .text(name)
            .attr("x", pos[0])
            .attr("y", pos[1])
            .attr('text-anchor', 'middle')
            .attr('dy', dy)
            .attr('font-size', `${colFontSize * 2}px`)
            .text(showText)
            .append("svg:title")
            .text(name)
    }
}