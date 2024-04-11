function generateDataForTablesConcat(dataIn1_csv, dataIn2_csv,dataOut1_csv,axis = 0){
    //axis = 0时为纵向拼接，axis = 1时为横向拼接
    let m1 = [[]],m2 = [[]],m3 = [[]]
    let inColors2 = []
    if(axis === 0){
        // for(let col = 0;col < Math.min(dataIn1_csv[0].length,4);col++){
        //     m1[0].push(dataIn1_csv[0][col])
        //     m2[0].push(dataIn2_csv[0][col])
        //     m3[0].push(dataOut1_csv[0][col])
        // }
    
        // for(let row = 1;row < Math.min(4,dataIn1_csv.length);row++){
        //     let tempRow = []
        //     for(let col = 0;col < m1[0].length;col++){
        //         tempRow.push('')
        //     }
        //     m1.push(tempRow)
        //     m3.push(tempRow)
        // }
    
        // for(let row = 1;row < Math.min(4,dataIn2_csv.length);row++){
        //     let tempRow = []
        //     for(let col = 0;col < m2[0].length;col++){
        //         tempRow.push('')
        //     }
        //     m2.push(tempRow)
        //     m3.push(tempRow)
        // }
    
        // for(let row = 1;row < m2.length;row++){
        //     inColors2.push(m1.length - 2 + row)
        // }
        for(let col = 0;col < Math.min(dataIn1_csv[0].length,4);col++){
            m1[0].push(dataIn1_csv[0][col])
            m2[0].push(dataIn2_csv[0][col])
            m3[0].push(dataOut1_csv[0][col])
        }
    
        for(let row = 1;row < Math.min(3,dataIn1_csv.length);row++){
            let tempRow = []
            for(let col = 0;col < m1[0].length;col++){
                tempRow.push('')
            }
            m1.push(tempRow)
            m3.push(tempRow)
        }
    
        for(let row = 1;row < Math.min(2,dataIn2_csv.length);row++){
            let tempRow = []
            for(let col = 0;col < m2[0].length;col++){
                tempRow.push('')
            }
            m2.push(tempRow)
            m3.push(tempRow)
        }
    
        for(let row = 1;row < m2.length;row++){
            inColors2.push(m1.length - 2 + row)
        }
    }else{
        for(let col = 0;col < Math.min(dataIn1_csv[0].length,3);col++){
            m1[0].push(dataIn1_csv[0][col])
            m3[0].push(dataIn1_csv[0][col])
        }
        for(let col = 0;col < Math.min(dataIn1_csv[0].length,3);col++){
            m2[0].push(dataIn2_csv[0][col])
            m3[0].push(dataIn2_csv[0][col])
        }

        for(let row = 1;row < Math.min(4,Math.min(dataIn1_csv.length,dataIn2_csv.length));row++){
            let tempRow1 = []
            let tempRow2 = []
            let tempRow3 = []
            for(let col = 0;col < m1[0].length;col++){
                tempRow1.push('')
                tempRow3.push('')
            }
            for(let col = 0;col < m2[0].length;col++){
                tempRow2.push('')
                tempRow3.push('')
            }

            m1.push(tempRow1)
            m2.push(tempRow2)
            m3.push(tempRow3)
        }
    }
   
    return {m1,m2,m3,inColors2}
}

function generateDataForSummarize_python(dataIn1_csv,dataOut1_csv){
    let m1 = [[]],m2 = [[]];
    for(let col = 0;col < Math.min(4,dataIn1_csv[0].length);col++){
        m1[0].push(dataIn1_csv[0][col])
        m2[0].push(dataOut1_csv[0][col])
    }
    for(let row = 1;row <= Math.min(2,dataIn1_csv.length - 1) ;row++){
        let tempRow = []
        for(let col = 0;col < Math.min(4,dataIn1_csv[0].length);col++){
            tempRow.push("")
        }
        m1.push(tempRow)
        m2.push(tempRow)
    }
    m2.push(dataOut1_csv[dataOut1_csv.length - 1])
    return {m1,m2}
}
export {generateDataForTablesConcat,generateDataForSummarize_python}