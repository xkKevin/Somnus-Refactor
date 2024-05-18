import { VisData } from "@assets/newrefjs/interface";

export function get_components(specs: VisData[]) {
  let fatherRec = makeFatherRec(specs);
  specs.forEach((spi) => {
    for (let in_i = 0; in_i < spi.in.length; in_i++) {
      for (let out_i = 0; out_i < spi.out.length; out_i++) {
        fatherRec = mergeNode(
          fatherRec,
          spi.in[in_i].name,
          spi.out[out_i].name
        );
      }
    }
  });

  let nodes = {};
  let edges = {};
  //收集节点
  for (let key in fatherRec) {
    let root = findRoot(fatherRec, key);
    if (!nodes[root]) nodes[root] = [];
    nodes[root].push(key);
  }
  //收集边
  specs.forEach((spi) => {
    //经过上面的并查集操作之后，同一个spec的input和output file一定在有同一个root
    if (spi.in.length === 1) {
      let root = findRoot(fatherRec, spi.in[0].name);
      if (!edges[root]) edges[root] = [];
      spi.out.forEach((out_i) => {
        edges[root].push([spi.in[0].name, out_i.name]);
      });
    } else {
      let root = findRoot(fatherRec, spi.out[0].name);
      if (!edges[root]) edges[root] = [];
      spi.in.forEach((in_i) => {
        edges[root].push([in_i.name, spi.out[0].name]);
      });
    }
  });

  let groups = [];
  for (let keyNode in nodes) {
    groups.push({ key: keyNode, nodeGroup: nodes[keyNode] });
  }
  //@ts-ignore
  groups.sort(componentCmp);
  return { groups, edges };
}

function makeFatherRec(specs) {
  let fatherRec = {};
  specs.forEach((spi) => {
    spi.in.forEach((in_i) => {
      if (!fatherRec[in_i.name]) fatherRec[in_i.name] = in_i.name;
    });
    spi.out.forEach((out_i) => {
      if (!fatherRec[out_i.name]) fatherRec[out_i.name] = out_i.name;
    });
  });

  return fatherRec;
}

function findRoot(fatherRec, tbl) {
  while (fatherRec[tbl] !== tbl) {
    tbl = fatherRec[tbl];
  }
  return tbl;
}

function mergeNode(fatherRec, tbl1, tbl2) {
  let root1 = findRoot(fatherRec, tbl1);
  let root2 = findRoot(fatherRec, tbl2);
  if (root1 !== root2) {
    fatherRec[root2] = root1;
  }
  return fatherRec;
}

function componentCmp(group1, group2) {
  let nodes1 = group1.nodeGroup;
  let nodes2 = group2.nodeGroup;
  return findMinRow(Object.values(nodes1)) < findMinRow(Object.values(nodes2));
}

function findMinRow(nodeArr) {
  let minRow = 0;
  nodeArr.forEach((tableName) => {
    let rowNumber = parseInt(tableName.replace(/[^0-9]/gi, ""), 10);
    if (rowNumber) {
      if (minRow === 0 || minRow > rowNumber) {
        minRow = rowNumber;
      }
    }
  });
  return minRow;
}
