import * as d3 from 'd3'

export function getCsv(path, dataTables, table_file = "") {
    return new Promise((resolve, reject) => {
        d3.text(path).then(data => {
                let tempData = d3.csvParseRows(data)
                    /*
                    let reg = /_case\/(.*)\?a=/g
                    console.log(path);
                    let table_file = reg.exec(path)[1]
                    console.log(table_file);
                    */
                let id = 0;
                dataTables[table_file] = {
                    "tableData": tempData.slice(1), // splice 会改变原数组，应该使用 slice
                    "tableHead": tempData[0].map(value => [value, id++])
                }
                resolve(tempData)
            })
            // d3.dsv(",",path).then((data) => {
            //     let keys = data[0]
            //     let table = [[]]
            //     for(let key in keys){
            //         table[0].push(key)
            //     }
            //     for(let row = 1;row < data.length;row ++){
            //         let tempRow = []
            //         for(let idx = 0;idx < table[0].length;idx++){
            //             tempRow.push(data[row][table[0][idx]])
            //         }
            //         table.push(tempRow)
            //     }
            //     resolve(table)
            // });
    })
}