import { extractCols } from "./common/extractContextualCols";


function generateDataForColumnRearrange(dataIn1_csv, dataOut1_csv, colsAfterArrange) {
    //暂定以索引方式传入列
    let colsBeforeArrange = Array.from(colsAfterArrange)
    colsBeforeArrange.sort()
    let contextualCols = extractCols(Array.from(dataIn1_csv[0]), colsBeforeArrange, colsAfterArrange)
    let m1 = [
            []
        ],
        m2 = [
            []
        ]
    let inColors = [],
        outColors = []
    colsBeforeArrange.forEach(idx => {
        m1[0].push(dataIn1_csv[0][idx])
        m2[0].push(dataIn1_csv[0][idx])
    })

    contextualCols.forEach(val => {
        m1[0].push(val)
        m2[0].push(val)
    })

    m1[0].sort(function(a, b) {
        return dataIn1_csv[0].indexOf(a) - dataIn1_csv[0].indexOf(b)
    })

    m2[0].sort(function(a, b) {
        return dataOut1_csv[0].indexOf(a) - dataOut1_csv[0].indexOf(b)
    })

    for (let row = 1; row <= Math.min(3, dataIn1_csv.length - 1); row++) {
        let tempRow = []
        for (let col = 0; col < m1[0].length; col++) {
            tempRow.push('')
        }
        m1.push(tempRow)
    }

    for (let row = 1; row <= Math.min(3, dataOut1_csv.length - 1); row++) {
        let tempRow = []
        for (let col = 0; col < m2[0].length; col++) {
            tempRow.push('')
        }
        m2.push(tempRow)
    }

    inColors = Array.from(new Array(m1[0].length), (x, i) => i)
    outColors = Array.from(new Array(m2[0].length), (x, i) => i)
    for (let col = 0; col < m2[0].length; col++) {
        outColors[col] = m1[0].indexOf(m2[0][col])
    }
    return { m1, m2, inColors, outColors }
}

function generateDataForTableSort(dataIn1_csv, dataOut1_csv, sortedCol, order) {
    //暂定以索引方式传入列
    //sortedCol是一个数组
    const isAsc = order.indexOf("desc") === -1 // 是否是升序
    let contextualCols = extractCols(Array.from(dataIn1_csv[0]), sortedCol, sortedCol)

    let m1 = [
            []
        ],
        m2 = [
            []
        ]
    sortedCol.forEach(idx => {
        m1[0].push(dataIn1_csv[0][idx])
        m2[0].push(dataIn1_csv[0][idx])
    })

    contextualCols.forEach(val => {
        m1[0].push(val)
        m2[0].push(val)
    })

    m1[0].sort(function(a, b) {
        return dataIn1_csv[0].indexOf(a) - dataIn1_csv[0].indexOf(b)
    })

    m2[0].sort(function(a, b) {
        return dataOut1_csv[0].indexOf(a) - dataOut1_csv[0].indexOf(b)
    })

    let colVals = []
    for (let row = 1; row < dataIn1_csv.length; row++) {
        colVals.push(dataIn1_csv[row][sortedCol[0]])
    }
    let uniqueVal = Array.from(new Set(colVals))
    let rows = []
    for (let idx = 0; idx < uniqueVal.length - 3; idx++) {
        let select_elems = uniqueVal.slice(idx, idx + 3)
        if (isAsc) {
            if (select_elems.toString() == select_elems.sort().toString()) {
                continue
            } else {
                rows.push(colVals.indexOf(uniqueVal[idx]) + 1)
                rows.push(colVals.indexOf(uniqueVal[idx + 1]) + 1)
                rows.push(colVals.indexOf(uniqueVal[idx + 2]) + 1)
                break
            }
        } else {
            if (select_elems.toString() == select_elems.sort().reverse().toString()) {
                continue
            } else {
                rows.push(colVals.indexOf(uniqueVal[idx]) + 1)
                rows.push(colVals.indexOf(uniqueVal[idx + 1]) + 1)
                rows.push(colVals.indexOf(uniqueVal[idx + 2]) + 1)
                break
            }
        }
    }
    if (rows.length < 3) {
        for (let idx = 0; idx < uniqueVal.length; idx++) {
            rows.push(colVals.indexOf(uniqueVal[idx]) + 1)
        }
    }
    rows.sort()
    for (let row = 0; row < rows.length; row++) {
        let tempRow = []
        for (let col = 0; col < m1[0].length; col++) {
            if (m1[0][col] === dataIn1_csv[0][sortedCol[0]]) tempRow.push(dataIn1_csv[rows[row]][sortedCol[0]])
            else
                tempRow.push('')
        }
        m1.push(tempRow)
    }

    for (let row = 0; row < rows.length; row++) {
        let tempRow = []
        for (let col = 0; col < m2[0].length; col++) {
            if (m2[0][col] === dataIn1_csv[0][sortedCol[0]]) tempRow.push(dataIn1_csv[rows[row]][sortedCol[0]])
            else
                tempRow.push('')
        }
        m2.push(tempRow)
    }
    for (let col = 0; col < m1[0].length; col++)
        if (m1[0][col] !== dataIn1_csv[0][sortedCol[0]]) m1[0][col] = ''
    for (let col = 0; col < m2[0].length; col++)
        if (m2[0][col] !== dataOut1_csv[0][sortedCol[0]]) m2[0][col] = ''
    let colVal = [],
        colInM1 = 0
    for (let col = 0; col < m1[0].length; col++) {
        if (m1[0][col] === dataIn1_csv[0][sortedCol]) {
            colInM1 = col
            break
        }
    }
    for (let row = 1; row < m1.length; row++) {
        colVal.push(m1[row][colInM1])
    }
    let valBeforeSort = Array.from(colVal)
    if (isAsc) {
        //暂定为只对数值类型进行排序
        // colVal = colVal.sort(function(a, b) {
        //     return a - b
        // })
        colVal = colVal.sort()
    } else {
        // colVal = colVal.sort(function(a, b) {
        //     return b - a
        // })
        colVal = colVal.sort().reverse()
    }

    // console.log("sorted: ",colVal)

    for (let row = 1; row < m2.length; row++) {
        m2[row][colInM1] = colVal[row - 1]
    }
    for (let idx = 0; idx < valBeforeSort.length; idx++) {
        while (valBeforeSort.indexOf(valBeforeSort[idx]) !== idx) valBeforeSort[idx] += '_'
    }
    for (let idx = 0; idx < colVal.length; idx++) {
        while (colVal.indexOf(colVal[idx]) !== idx) colVal[idx] += '_'
    }
    let outColor = []
    for (let idx = 0; idx < colVal.length; idx++) {
        outColor.push(valBeforeSort.indexOf(colVal[idx]))
    }

    return { m1, m2, outColor }
}

function generateDataForFold(dataIn1_csv, dataOut1_csv, inExpOrImpCol, outExpOrImpCol) {

    let contextualCols = extractCols(Array.from(dataIn1_csv[0]), inExpOrImpCol, outExpOrImpCol)
    let m1 = [
            []
        ],
        m2 = [
            []
        ]
    inExpOrImpCol.forEach(idx => {
        m1[0].push(dataIn1_csv[0][idx])
    })
    outExpOrImpCol.forEach(idx => {
        m2[0].push(dataOut1_csv[0][idx])
    })
    contextualCols.forEach(val => {
        m1[0].push(val)
        m2[0].push(val)
    })

    m1[0].sort(function(a, b) {
        return dataIn1_csv[0].indexOf(a) - dataIn1_csv[0].indexOf(b)
    })
    m2[0].sort(function(a, b) {
        return dataOut1_csv[0].indexOf(a) - dataOut1_csv[0].indexOf(b)
    })

    //m1选取两列
    for (let row = 1; row <= 2; row++) {
        let tempRow = []
        for (let col = 0; col < dataIn1_csv[0].length; col++) {
            if (m1[0].indexOf(dataIn1_csv[0][col]) !== -1) tempRow.push(dataIn1_csv[row][col])
        }
        m1.push(tempRow)
    }

    if (contextualCols.length === 0) {
        for (let row = 1; row <= 2 * inExpOrImpCol.length; row++) {
            let tempRow = []
            tempRow = [m1[0][Math.floor((row - 1) / 2)], m1[row % 2 === 1 ? 1 : 2][Math.floor((row - 1) / 2)]]
                // for (let col = 0; col < m2[0].length; col++) {
                //     tempRow.push(m1)
                // }
            m2.push(tempRow)
        }
    } else {
        for (let row = 1; row <= 2 * inExpOrImpCol.length; row++) {
            let tempRow = []
            for (let col = 0; col < dataOut1_csv[0].length; col++) {
                if (m2[0].indexOf(dataOut1_csv[0][col]) !== -1) tempRow.push(dataOut1_csv[row][col])
            }
            m2.push(tempRow)
        }
    }

    // set max(data.length) = 6
    if (m2.length > 7) {
        let change_m1 = []
        let change_m2 = []
        let change_temp_m1 = []
        for (let row = 0; row <= 6; row++) {
            change_m2.push(m2[row])
        }
        for (let row = 0; row < m1.length; row++) {
            for (let col = 0; col < 3; col++) {
                change_temp_m1.push(m1[row][col])
            }
            change_m1.push(change_temp_m1)
            change_temp_m1 = []
        }
        m1 = change_m1
        m2 = change_m2
    }

    return { m1, m2 }
}

export { generateDataForTableSort, generateDataForColumnRearrange, generateDataForFold }