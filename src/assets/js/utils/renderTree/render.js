import { nodeSize, lineAttr } from '@assets/js/config/config'


function drawNode(g, specs, nodePos, specsInf) {
    let nodeName = []
    for (let idx = 0; idx < specs.length; idx++) {
        if (typeof(specs[idx].input_table_file) === "string") {
            nodeName.push(specs[idx].input_table_file)
        } else {
            specs[idx].input_table_file.forEach(element => {
                nodeName.push(element)
            })
        }

        if (typeof(specs[idx].output_table_file) === "string") {
            nodeName.push(specs[idx].output_table_file)
        } else {
            specs[idx].output_table_file.forEach(element => {
                nodeName.push(element)
            });
        }
    }

    nodeName = Array.from(new Set(nodeName))
        // console.log("nodeName: ",nodeName)
    for (let idx = 0; idx < nodeName.length; idx++) {

        let nodeRect = g.append('rect')
            .attr('x', nodePos[nodeName[idx]][0])
            .attr('y', nodePos[nodeName[idx]][1])
            .attr('width', nodeSize.width)
            .attr('height', nodeSize.height)
            // .attr('fill',nodeColor.background)
            .attr('fill', "transparent")
            .attr("stroke", "gray")
            .attr("stroke-width", "2")
            .attr('rx', `${nodeSize.height / 15}`)

        if (nodeName[idx][0] !== '*' && nodeName[idx][0] !== '#') {
            // nodeRect.on('click', function(event) {
            //         showTableFunc(nodeName[idx])
            //     })
                /*
                let firstIdx = 0
                for (let s = 0; s < nodeName[idx].length; s++) {
                    if (nodeName[idx][s] >= '0' && nodeName[idx][s] <= '9') {
                        firstIdx = s
                        break
                    }
                }
                console.log(firstIdx);
                */
            let firstIdx = 1
            let lastIdx = nodeName[idx].indexOf(" (")
            let lineNum
            if (lastIdx === -1) {
                firstIdx = nodeName[idx].indexOf("/") + 1
                lastIdx = nodeName[idx].indexOf(".csv")
                lineNum = "∅"
                nodeRect.attr('id', `node_${nodeName[idx].substring(firstIdx,lastIdx)}`)
            } else {
                lineNum = nodeName[idx].substring(1, lastIdx)
                nodeRect.attr('id', `node_${nodeName[idx].substring(0,lastIdx)}`)
            }

            let letterWidth = nodeSize.width / (lineNum.length + 2)
            let midInY = (nodeSize.height - letterWidth) / 2 + letterWidth
            g.append('text')
                .attr('x', nodePos[nodeName[idx]][0])
                .attr('y', nodePos[nodeName[idx]][1] + midInY)
                .attr('dx', nodeSize.width / 4)
                // .attr('dy',nodeSize.height / 7 * 2)
                .attr('text-anchor', 'middle')
                .attr('fill', 'balck')
                .attr('font-size', `${letterWidth}px`)
                .text(`L${lineNum}`)
                // .on('click', function(event) {
                //     showTableFunc(nodeName[idx])
                // })
                //以8个字符为临界点
            let letters = 8
            let font_size = nodeSize.width / 1.33 / letters
            let showText = ''

            if (letters + 1 >= specsInf[nodeName[idx]][0].length) { // 可显示9个字符
                showText = specsInf[nodeName[idx]][0]
            } else {
                showText = specsInf[nodeName[idx]][0].slice(0, letters - 1)
                showText += '…'
            }

            g.append('text')
                .attr('x', `${nodePos[nodeName[idx]][0] + nodeSize.width / 2}px`)
                .attr('y', nodePos[nodeName[idx]][1] + nodeSize.height / 2 - 5)
                .attr('text-anchor', 'start')
                .attr('fill', 'balck')
                .attr('font-size', `${font_size}px`)
                .text(showText)
                // .on('click', function(event) {
                //     showTableFunc(nodeName[idx])
                // })
                .append("svg:title")
                .text(specsInf[nodeName[idx]][0])
                // .on("mouseover",function(event){
                //     if(d3.select(`#table_name_${specsInf[nodeName[idx]][0]}`)['_groups'][0][0] === null){
                //         g.append('text')
                //         .attr('x',nodePos[nodeName[idx]][0])
                //         .attr('y',nodePos[nodeName[idx]][1])
                //         .attr('dx',1.1 * nodeSize.width)
                //         .attr('dy',1.1 * nodeSize.height)
                //         .attr('text-anchor', 'start')
                //         .attr('fill','balck')
                //         .attr('font-size',`${2 * nodeSize.width / letters}px`)
                //         .text(specsInf[nodeName[idx]][0])
                //         .attr("id",`table_name_${specsInf[nodeName[idx]][0]}`)
                //     }
                //     console.log("event",event)
                // })
                // .on("mouseout",function(event){
                //     g.select(`#table_name_${specsInf[nodeName[idx]][0]}`).remove()
                // })

            let rowsAndCols = `${specsInf[nodeName[idx]][1] - 1}R*${specsInf[nodeName[idx]][2]}C`
            let showRowsAndCols = ''
            if (letters + 1 >= rowsAndCols.length) {
                showRowsAndCols = rowsAndCols
            } else {
                showRowsAndCols = rowsAndCols.slice(0, letters - 1)
                showRowsAndCols += '…'
            }
            g.append('text')
                .attr('x', nodePos[nodeName[idx]][0] + nodeSize.width / 2)
                .attr('y', nodePos[nodeName[idx]][1] + nodeSize.height - 6)
                .attr('text-anchor', 'start')
                .attr('fill', 'gray')
                .attr('font-size', `${font_size}px`)
                .text(showRowsAndCols)
                // .on('click', function(event) {
                //     showTableFunc(nodeName[idx])
                // })
                .append("svg:title")
                .text(rowsAndCols)
                // .on("mouseover",function(event){
                //     if(d3.select(`#table_name_${specsInf[nodeName[idx]][0]}`)['_groups'][0][0] === null){
                //         g.append('text')
                //         .attr('x',nodePos[nodeName[idx]][0])
                //         .attr('y',nodePos[nodeName[idx]][1])
                //         .attr('dx',1.1 * nodeSize.width)
                //         .attr('dy',1.1 * nodeSize.height)
                //         .attr('text-anchor', 'start')
                //         .attr('fill','balck')
                //         .attr('font-size',`${2 * nodeSize.width / letters}px`)
                //         .text(specsInf[nodeName[idx]][0])
                //         .attr("id",`table_name_${specsInf[nodeName[idx]][0]}_show`)
                //     }
                //     console.log("event",event)
                // })
                // .on("mouseout",function(event){
                //     g.select(`#table_name_${specsInf[nodeName[idx]][0]}`).remove()
                // })
        } else {
            nodeRect.style('stroke-dasharray', '5,5');
            g.append('text')
                .attr('x', nodePos[nodeName[idx]][0])
                .attr('y', nodePos[nodeName[idx]][1])
                .attr('dx', nodeSize.width / 2)
                .attr('dy', nodeSize.height * 0.8)
                .attr('text-anchor', 'middle')
                .attr('fill', 'gray')
                .attr('font-size', `2em`)
                .text(`Ø`)
        }
    }
}

function drawEdge(g, specs, nodePos) {

    for (let idx = 0; idx < specs.length; idx++) {
        let defs = g.append("defs")
            .attr('class', `edge_${idx}`)
        let arrowMarker = defs.append("marker")
            .attr("id", `arrow_${idx}`)
            .attr("markerUnits", "strokeWidth")
            .attr("markerWidth", "10")
            .attr("markerHeight", "10")
            .attr("viewBox", "0 0 10 10")
            .attr("refX", "8")
            .attr("refY", "4")
            .attr("orient", "auto");
        let arrow_path = "M0,0 L8,4 L0,8 L4,4 L0,0";
        arrowMarker.append("path")
            .attr("d", arrow_path)
            .attr("fill", "gray")
            .attr('class', `arrow_${idx}`)

        let str = typeof(specs[idx].output_table_file) === 'string' ? specs[idx].output_table_file : specs[idx].output_table_file[0]
        let firstIdx = 0
        for (let s = 0; s < str.length; s++) {
            if (str[s] >= '0' && str[s] <= '9') {
                firstIdx = s
                break
            }
        }
        let lastIdx = str.indexOf("_") === -1 ? str.indexOf(".") : str.indexOf("_")
        let lineNum = parseInt(str.substring(firstIdx, lastIdx))

        if (typeof(specs[idx].input_table_file) === 'string' &&
            typeof(specs[idx].output_table_file) === 'string') {
            g.append('line')
                .attr('x1', nodePos[specs[idx].input_table_file][0] + nodeSize.width)
                .attr('y1', nodePos[specs[idx].input_table_file][1] + nodeSize.height / 2)
                .attr('x2', nodePos[specs[idx].output_table_file][0])
                .attr('y2', nodePos[specs[idx].output_table_file][1] + nodeSize.height / 2)
                .attr('stroke', lineAttr.color)
                .attr('stroke-width', lineAttr.strokeWidth)
                .attr("marker-end", `url(#arrow_${idx})`)
                .attr('class', `edge_${idx}`)
                // .on('click', function(event) {
                //     codeHighlight(lineNum)
                // })
        } else if (typeof(specs[idx].input_table_file) === 'string') {
            let meetingPosY = nodePos[specs[idx].input_table_file][1] + nodeSize.height / 2
            let meetingPosX = nodePos[specs[idx].input_table_file][0] + nodeSize.width +
                0.8 * (Math.min(nodePos[specs[idx].output_table_file[0]][0], nodePos[specs[idx].output_table_file[1]][0]) -
                    nodePos[specs[idx].input_table_file][0] - nodeSize.width)

            let str = typeof(specs[idx].output_table_file) === 'string' ? specs[idx].output_table_file : specs[idx].output_table_file[0]
            let firstIdx = 0
            for (let s = 0; s < str.length; s++) {
                if (str[s] >= '0' && str[s] <= '9') {
                    firstIdx = s
                    break
                }
            }
            let lastIdx = str.indexOf("_") === -1 ? str.indexOf(".") : str.indexOf("_")
            let lineNum = parseInt(str.substring(firstIdx, lastIdx))

            g.append("circle")
                .attr("cx", meetingPosX)
                .attr("cy", meetingPosY)
                .attr("r", 2 * lineAttr.strokeWidth)
                .style("fill", lineAttr.color)
                // .style("stroke", lineAttr.color)
                .attr('class', `edge_${idx}`)
                // .on('click', function(event) {
                //     codeHighlight(lineNum)
                // })

            g.append('line')
                .attr('x1', nodePos[specs[idx].input_table_file][0] + nodeSize.width)
                .attr('y1', nodePos[specs[idx].input_table_file][1] + nodeSize.height / 2)
                .attr('x2', meetingPosX)
                .attr('y2', meetingPosY)
                .attr('stroke', lineAttr.color)
                .attr('stroke-width', lineAttr.strokeWidth)
                .attr('class', `edge_${idx}`)
                // .on('click', function(event) {
                //     codeHighlight(lineNum)
                // })

            g.append('line')
                .attr('x1', meetingPosX)
                .attr('y1', meetingPosY)
                .attr('x2', nodePos[specs[idx].output_table_file[0]][0])
                .attr('y2', nodePos[specs[idx].output_table_file[0]][1] + nodeSize.height / 2)
                .attr('stroke', lineAttr.color)
                .attr('stroke-width', lineAttr.strokeWidth)
                .attr("marker-end", `url(#arrow_${idx})`)
                .attr('class', `edge_${idx}`)
                // .on('click', function(event) {
                //     codeHighlight(lineNum)
                // })

            g.append('line')
                .attr('x1', meetingPosX)
                .attr('y1', meetingPosY)
                .attr('x2', nodePos[specs[idx].output_table_file[1]][0])
                .attr('y2', nodePos[specs[idx].output_table_file[1]][1] + nodeSize.height / 2)
                .attr('stroke', lineAttr.color)
                .attr('stroke-width', lineAttr.strokeWidth)
                .attr("marker-end", `url(#arrow_${idx})`)
                .attr('class', `edge_${idx}`)
                // .on('click', function(event) {
                //     codeHighlight(lineNum)
                // })
        } else {
            let meetingPosY = nodePos[specs[idx].output_table_file][1] + nodeSize.height / 2
            let meetingPosX = Math.max(nodePos[specs[idx].input_table_file[0]][0], nodePos[specs[idx].input_table_file[1]][0]) +
                nodeSize.width + 0.2 * (nodePos[specs[idx].output_table_file][0] - nodeSize.width -
                    Math.max(nodePos[specs[idx].input_table_file[0]][0], nodePos[specs[idx].input_table_file[1]][0]))

            let str = typeof(specs[idx].output_table_file) === 'string' ? specs[idx].output_table_file : specs[idx].output_table_file[0]
            let firstIdx = 0
            for (let s = 0; s < str.length; s++) {
                if (str[s] >= '0' && str[s] <= '9') {
                    firstIdx = s
                    break
                }
            }
            let lastIdx = str.indexOf("_") === -1 ? str.indexOf(".") : str.indexOf("_")
            let lineNum = parseInt(str.substring(firstIdx, lastIdx))

            g.append("circle")
                .attr("cx", meetingPosX)
                .attr("cy", meetingPosY)
                .attr("r", 2 * lineAttr.strokeWidth)
                .style("fill", lineAttr.color)
                // .style("stroke", "black")
                .attr('class', `edge_${idx}`)
                // .on('click', function(event) {
                //     codeHighlight(lineNum)
                // })

            g.append('line')
                .attr('x1', nodePos[specs[idx].input_table_file[0]][0] + nodeSize.width)
                .attr('y1', nodePos[specs[idx].input_table_file[0]][1] + nodeSize.height / 2)
                .attr('x2', meetingPosX)
                .attr('y2', meetingPosY)
                .attr('stroke', lineAttr.color)
                .attr('stroke-width', lineAttr.strokeWidth)
                .attr('class', `edge_${idx}`)
                // .on('click', function(event) {
                //     codeHighlight(lineNum)
                // })

            g.append('line')
                .attr('x1', nodePos[specs[idx].input_table_file[1]][0] + nodeSize.width)
                .attr('y1', nodePos[specs[idx].input_table_file[1]][1] + nodeSize.height / 2)
                .attr('x2', meetingPosX)
                .attr('y2', meetingPosY)
                .attr('stroke', lineAttr.color)
                .attr('stroke-width', lineAttr.strokeWidth)
                .attr('class', `edge_${idx}`)
                // .on('click', function(event) {
                //     codeHighlight(lineNum)
                // })

            g.append('line')
                .attr('x1', meetingPosX)
                .attr('y1', meetingPosY)
                .attr('x2', nodePos[specs[idx].output_table_file][0])
                .attr('y2', nodePos[specs[idx].output_table_file][1] + nodeSize.height / 2)
                .attr('stroke', lineAttr.color)
                .attr('stroke-width', lineAttr.strokeWidth)
                .attr("marker-end", `url(#arrow_${idx})`)
                .attr('class', `edge_${idx}`)
                // .on('click', function(event) {
                //     codeHighlight(lineNum)
                // })
        }
    }

}

export { drawNode, drawEdge }
