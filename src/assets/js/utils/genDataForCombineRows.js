import {extractCols} from "./common/extractContextualCols";

function generateDataForGroupSummarize(dataIn1_csv, dataOut1_csv, inExpCol, inImpCol, outExpOrImpCol){

    let contextualCols = extractCols(Array.from(dataIn1_csv[0]),inExpCol.concat(inImpCol),inExpCol.concat(inImpCol))
    let allCols = inExpCol.concat(inImpCol)
    let m1 = [[]],m2 = [[]]

    inExpCol.forEach(idx => {
        m1[0].push(dataIn1_csv[0][idx])
    })
    inImpCol.forEach(idx => {
        m1[0].push(dataIn1_csv[0][idx])
    })
    if(inImpCol.length === 0){
        if(dataOut1_csv[0].indexOf(dataIn1_csv[0][inExpCol[0]]) !== -1)m2[0].push(dataIn1_csv[0][inExpCol[0]])
    }else{
        m2[0].push(dataIn1_csv[0][inImpCol[0]])
    }
    
    outExpOrImpCol.forEach(idx => {
        m2[0].push(dataOut1_csv[0][idx])
    })

    contextualCols.forEach(val => {
        m1[0].push(val)
        // m2[0].push(val)
    })

    m1[0].sort(function(a,b){
        return dataIn1_csv[0].indexOf(a) - dataIn1_csv[0].indexOf(b)
    })
    m2[0].sort(function(a,b){
        return dataOut1_csv[0].indexOf(a) - dataOut1_csv[0].indexOf(b)
    })

    //2021/04/06

    let values1 = []
    for(let row = 1;row < dataIn1_csv.length;row++){
        values1.push(dataIn1_csv[row][inImpCol[0]])
    }
    let values1_unique = Array.from(new Set(values1))

    let values2 = []
    let outImpCol = dataOut1_csv[0].indexOf(dataIn1_csv[0][inImpCol[0]])
    for(let row = 1;row < dataOut1_csv.length;row++){
        values2.push(dataOut1_csv[row][outImpCol])
    }

    let rows1 = [],rows2 = []
    for(let idx = 0;idx < Math.min(values1_unique.length,3);idx++){
        rows1.push(values1.indexOf(values1_unique[idx]) + 1)
        rows2.push(values2.indexOf(values1_unique[idx]) + 1)
    }
    
    for(let row = 0;row < rows1.length;row++){
        let tempRow = []
        for(let col = 0;col < dataIn1_csv[0].length;col++){
            if(m1[0].indexOf(dataIn1_csv[0][col]) !== -1){
                // if(inExpOrImpCol.indexOf(col) !== -1)tempRow.push(dataIn1_csv[row][col])
                if(allCols.indexOf(col) !== -1){
                    if(dataIn1_csv[rows1[row]][col] !== '')tempRow.push(dataIn1_csv[rows1[row]][col])
                    else{
                        tempRow.push('NA')
                    }
                }
                else{
                    tempRow.push("")
                }
            }
        }
        m1.push(tempRow)
    }
    //

    //2021/04/06 delete
    // for(let row = 1;row < Math.min(dataIn1_csv.length,4);row++){
    //     let tempRow = []
    //     for(let col = 0;col < dataIn1_csv[0].length;col++){
    //         if(m1[0].indexOf(dataIn1_csv[0][col]) !== -1){
    //             // if(inExpOrImpCol.indexOf(col) !== -1)tempRow.push(dataIn1_csv[row][col])
    //             if(allCols.indexOf(col) !== -1)tempRow.push(dataIn1_csv[row][col])
    //             else{
    //                 tempRow.push("")
    //             }
    //         }
    //     }
    //     m1.push(tempRow)
    // }
    // let rows2 = []
    let values = []
    let col2 = inImpCol.length === 0 ? dataOut1_csv[0].indexOf(dataIn1_csv[0][inExpCol[0]]) : dataOut1_csv[0].indexOf(dataIn1_csv[0][inImpCol[0]])
    let col1 = inImpCol.length === 0 ? m1[0].indexOf(dataIn1_csv[0][inExpCol[0]]) : m1[0].indexOf(dataIn1_csv[0][inImpCol[0]])
    for(let row = 1;row < dataOut1_csv.length;row++){
        values.push(dataOut1_csv[row][col2])
    }
    
    // for(let row = 1;row < m1.length;row++){
    //     rows2.push(values.indexOf(m1[row][col1]) + 1)
    // }
    
    if(dataOut1_csv[0].indexOf(dataIn1_csv[0][inImpCol[0]]) === -1){
        rows2 = Array.from(new Array(Math.min(3,dataOut1_csv.length - 1)),(v,k) => k + 1)
    }

    for(let row = 0;row < rows2.length;row++){
        let tempRow = []
        for(let col = 0;col < dataOut1_csv[0].length;col++){
            if(m2[0].indexOf(dataOut1_csv[0][col]) !== -1){
                tempRow.push(dataOut1_csv[rows2[row]][col])
            }
        }
        m2.push(tempRow)
    }
    for(let col = 0;col < m1[0].length;col++){
        if(allCols.indexOf(dataIn1_csv[0].indexOf(m1[0][col])) === -1)m1[0][col] = ''
    }
    let outColor = []
    for(let col = 0;col < m2[0].length;col ++){
        let idx = m1[0].indexOf(m2[0][col])
        if(idx !== -1)outColor.push(m1[0].indexOf(m2[0][col]))
    }
    outColor.push(m1[0].length)
    // for(let col = 0;col < m2[0].length;col++){
    //     if(outExpOrImpCol.indexOf(dataOut1_csv[0].indexOf(m2[0][col])) === -1 && dat)m2[0][col] = ''
    // }
    // let rows1 = []
    // for(let row = 1;row < dataIn1_csv.length;row++){
    //     if(cmpRow(dataIn1_csv[row],dataOut1_csv[1]) || cmpRow(dataIn1_csv[row],dataOut1_csv[2])){
    //         rows1.push(row)
    //     }
    // }

    // for(let row = 0;row < rows1.length;row ++){
    //     let tempRow = []
    //     for(let col = 0;col < dataIn1_csv[0].length;col++){
    //         if(inExpOrImpCol.indexOf(col) !== -1)tempRow.push(dataIn1_csv[rows1[row]][col])
    //         else if(contextualCols.indexOf(dataIn1_csv[0][col]) !== -1) tempRow.push('')
    //     }
    //     m1.push(tempRow)
    // }

    // let allExpOrImp = Array.from(new Set(input_implict_col.concat(outExpOrImpCol).concat(inExpOrImpCol)))
    // for(let row = 1;row <= 2;row ++){
    //     let tempRow = []
    //     for(let col = 0;col < dataOut1_csv[0].length;col++){
    //         if(allExpOrImp.indexOf(col) !== -1)tempRow.push(dataOut1_csv[row][col])
    //         else if(contextualCols.indexOf(dataOut1_csv[0][col]) !== -1) tempRow.push('')
    //     }
    //     m2.push(tempRow)
    // }

    return {m1,m2,outColor}
}

function generateDataForRowInterpolate(dataIn1_csv, dataOut1_csv, inExpOrImpCol){
    //要求相邻范围内只能有一个空值

    let contextualCols = extractCols(Array.from(dataIn1_csv[0]),inExpOrImpCol,inExpOrImpCol)

    let m1 = [[]],m2 = [[]]
    inExpOrImpCol.forEach(idx => {
        m1[0].push(dataIn1_csv[0][idx])
        m2[0].push(dataOut1_csv[0][idx])
    })

    contextualCols.forEach(val => {
        m1[0].push(val)
        m2[0].push(val)
    })

    m1[0].sort(function(a,b){
        return dataIn1_csv[0].indexOf(a) - dataIn1_csv[0].indexOf(b)
    })
    m2[0].sort(function(a,b){
        return dataOut1_csv[0].indexOf(a) - dataOut1_csv[0].indexOf(b)
    })

    let naRow = 0,naCol = 0
    for(let row = 1;row < dataIn1_csv[0].length;row++){
        if(dataIn1_csv[row][inExpOrImpCol[0]] === ''){
            naRow = row
            break
        }
    }
    let rows = []
    if(naRow > 1 && naRow < dataIn1_csv.length - 1){
        rows = [naRow - 1,naRow,naRow + 1]
        naRow = 2
    }else if(naRow === 1){
        if(dataIn1_csv.length > 3){
            rows = [naRow,naRow + 1,naRow + 2]
            naRow = 1
        }else if(dataIn1_csv.length === 3){
            rows = [naRow,naRow + 1]
            naRow = 1
        }else{
            rows = [naRow]
            naRow = 1
        }
    }else{
        if(dataIn1_csv.length > 3){
            rows = [naRow - 2,naRow - 1,naRow]
            naRow = 4
        }else if(dataIn1_csv.length === 3){
            rows = [naRow - 1,naRow]
            naRow = 3
        }else{
            rows = [naRow]
            naRow = 2
        }
    }
    for(let row = 0;row < rows.length;row++){
        let tempRow1 = [],tempRow2 = []
        for(let col = 0;col < dataIn1_csv[0].length;col++){
            if(col === inExpOrImpCol[0]){
                tempRow1.push(dataIn1_csv[rows[row]][col])
                tempRow2.push(dataOut1_csv[rows[row]][col])
            }
            else if(m1[0].indexOf(dataIn1_csv[0][col]) !== -1){
                tempRow1.push('')
                tempRow2.push('')
            }
        }
        m1.push(tempRow1)
        m2.push(tempRow2)
    }
    for(let col = 0;col < m1[0].length;col++){
        if(m1[0][col] !== dataIn1_csv[0][inExpOrImpCol[0]]){
            m1[0][col] = ''
            m2[0][col] = ''
        }else{
            m2[0][col] = dataOut1_csv[0][inExpOrImpCol[0]]
        }
    }
    naCol = m1[0].indexOf(dataIn1_csv[0][inExpOrImpCol[0]])
    let naPos = [naRow,naCol]
    return {m1,m2,naPos}
}

export {generateDataForRowInterpolate,generateDataForGroupSummarize}