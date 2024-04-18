function getComponents(specs) {
  let fatherRec = makeFatherRec(specs);
  for (let idx = 0; idx < specs.length; idx++) {
    if (
      typeof specs[idx].input_table_file === "string" &&
      typeof specs[idx].output_table_file === "string"
    ) {
      fatherRec = mergeNode(
        fatherRec,
        specs[idx].input_table_file,
        specs[idx].output_table_file
      );
    } else if (typeof specs[idx].input_table_file === "string") {
      for (
        let fileIdx = 0;
        fileIdx < specs[idx].output_table_file.length;
        fileIdx++
      ) {
        fatherRec = mergeNode(
          fatherRec,
          specs[idx].input_table_file,
          specs[idx].output_table_file[fileIdx]
        );
      }
    } else {
      for (
        let fileIdx = 0;
        fileIdx < specs[idx].input_table_file.length;
        fileIdx++
      ) {
        fatherRec = mergeNode(
          fatherRec,
          specs[idx].input_table_file[fileIdx],
          specs[idx].output_table_file
        );
      }
    }
  }
  let nodes = {};
  let edges = {};
  //收集节点
  for (let key in fatherRec) {
    let root = findRoot(fatherRec, key);
    if (!nodes[root]) nodes[root] = [];
    nodes[root].push(key);
  }
  //收集边
  for (let idx = 0; idx < specs.length; idx++) {
    //经过上面的并查集操作之后，同一个spec的input和output file一定在有同一个root
    if (
      typeof specs[idx].input_table_file === "string" &&
      typeof specs[idx].output_table_file === "string"
    ) {
      let root = findRoot(fatherRec, specs[idx].input_table_file);
      if (!edges[root]) edges[root] = [];
      edges[root].push([
        specs[idx].input_table_file,
        specs[idx].output_table_file,
      ]);
    } else if (typeof specs[idx].input_table_file === "string") {
      let root = findRoot(fatherRec, specs[idx].input_table_file);
      if (!edges[root]) edges[root] = [];
      for (
        let fileIdx = 0;
        fileIdx < specs[idx].output_table_file.length;
        fileIdx++
      ) {
        edges[root].push([
          specs[idx].input_table_file,
          specs[idx].output_table_file[fileIdx],
        ]);
      }
    } else {
      let root = findRoot(fatherRec, specs[idx].output_table_file);
      if (!edges[root]) edges[root] = [];
      for (
        let fileIdx = 0;
        fileIdx < specs[idx].input_table_file.length;
        fileIdx++
      ) {
        edges[root].push([
          specs[idx].input_table_file[fileIdx],
          specs[idx].output_table_file,
        ]);
      }
    }
  }
  let groups = [];
  for (let keyNode in nodes) {
    groups.push({ key: keyNode, nodeGroup: nodes[keyNode] });
  }
  groups.sort(componentCmp);
  return { groups, edges };
}
