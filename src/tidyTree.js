import * as d3 from 'd3'

export default function main(content, data) {
    return Tree(data.nodes, {
        label: d => d.id,
        title: (d, n) => `${n.ancestors().reverse().map(d => d.data.name).join(".")}`, // hover text
        width: 1152,
        content,
        nonCanonicalLinks: data.nonCanonicalLinks
      })
}

function rootToNodeMap(root) {
    const map = new Map()
    traverse(root)

    return map

    function traverse(node) {
        if (map.has(node.data.id)) return

        map.set(node.data.id, node)
        if (node.children) node.children.forEach(traverse)
    }
}

function processNonCanonicalLinks(rawNonCanonicalLinks, nodeMap) {
    return rawNonCanonicalLinks.map(l => ({
        source: nodeMap.get(l.source),
        target: nodeMap.get(l.target),
        kind: l.kind

    }))
}

// adapted from https://observablehq.com/@d3/tree
function Tree(data, { // data is either tabular (array of objects) or hierarchy (nested objects)
    path, // as an alternative to id and parentId, returns an array identifier, imputing internal nodes
    id = Array.isArray(data) ? d => d.id : null, // if tabular data, given a d in data, returns a unique identifier (string)
    parentId = Array.isArray(data) ? d => d.parentId : null, // if tabular data, given a node d, returns its parent’s identifier
    children, // if hierarchical data, given a d in data, returns its children
    tree = d3.tree, // layout algorithm (typically d3.tree or d3.cluster)
    sort, // how to sort nodes prior to layout (e.g., (a, b) => d3.descending(a.height, b.height))
    label, // given a node d, returns the display name
    title, // given a node d, returns its hover text
    link, // given a node d, its link (if any)
    linkTarget = "_blank", // the target attribute for links (if any)
    width = 640, // outer width, in pixels
    height, // outer height, in pixels
    r = 3, // radius of nodes
    padding = 1, // horizontal padding for first and last column
    fill = "#999", // fill for nodes
    stroke = "#555", // stroke for links
    strokeWidth = 1.5, // stroke width for links
    strokeOpacity = 0.4, // stroke opacity for links
    strokeLinejoin, // stroke line join for links
    strokeLinecap, // stroke line cap for links
    content,
    nonCanonicalLinks,
  } = {}) {
    // If id and parentId options are specified, or the path option, use d3.stratify
    // to convert tabular data to a hierarchy; otherwise we assume that the data is
    // specified as an object {children} with nested objects (a.k.a. the “flare.json”
    // format), and use d3.hierarchy.
    const root = path != null ? d3.stratify().path(path)(data)
        : id != null || parentId != null ? d3.stratify().id(id).parentId(parentId)(data)
        : d3.hierarchy(data, children);
  
    // Compute labels and titles.
    const descendants = root.descendants();
    const L = label == null ? null : descendants.map(d => label(d.data, d));
  
    // Sort the nodes.
    if (sort != null) root.sort(sort);
  
    // Compute the layout.
    const dx = 10;
    const dy = width / (root.height + padding);
    tree().nodeSize([dx, dy])(root);
  
    // Center the tree.
    let x0 = Infinity;
    let x1 = -x0;
    root.each(d => {
      if (d.x > x1) x1 = d.x;
      if (d.x < x0) x0 = d.x;
    });
  
    // Compute the default height.
    if (height === undefined) height = x1 - x0 + dx * 2;

    console.log('root.links()', root.links())
  
  
    const pathContainer = content.append("g")
        .attr("fill", "none")
        .attr("stroke", stroke)
        .attr("stroke-opacity", strokeOpacity)
        .attr("stroke-linecap", strokeLinecap)
        .attr("stroke-linejoin", strokeLinejoin)
        .attr("stroke-width", strokeWidth)

    const nodeMap = rootToNodeMap(root)
    const nonCanonicalLinksProcessed = processNonCanonicalLinks(nonCanonicalLinks, nodeMap)
    console.log('nonCanonicalLinksProcessed', nonCanonicalLinksProcessed)

    pathContainer
      .selectAll("path")
        .data([...root.links(), ...nonCanonicalLinksProcessed])
        .join("path")
          .attr("d", d3.linkHorizontal()
              .x(d => d.y)
              .y(d => d.x));

    const node = content.append("g")
      .selectAll("a")
      .data(root.descendants())
      .join("a")
        .attr("xlink:href", link == null ? null : d => link(d.data, d))
        .attr("target", link == null ? null : linkTarget)
        .attr("transform", d => `translate(${d.y},${d.x})`);
  
    node.append("circle")
        .attr("fill", d => d.children ? stroke : fill)
        .attr("r", r);
  
    if (title != null) node.append("title")
        .text(d => title(d.data, d));
  
    if (L) node.append("text")
        .attr("dy", "0.32em")
        .attr("x", d => d.children ? -6 : 6)
        .attr("text-anchor", d => d.children ? "end" : "start")
        .text((d, i) => L[i])
        .call(text => text.clone(true))
        .attr("fill", "none")
  
    return content.node();
  }