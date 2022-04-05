import * as d3 from 'd3'
import { WIDTH, HEIGHT, NODE_WIDTH, NODE_HEIGHT, NODE_PADDING } from './constants'
import katex from 'katex'

export default function main(content, data) {

    return Tree(data.nodes, {
        label: d => d.id,
        title: (d, n) => `${n.ancestors().reverse().map(d => d.data.name).join(".")}`, // hover text
        width: 1152,
        content,
        nonCanonicalLinks: data.nonCanonicalLinks,
        textColor: '#bbb',
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
    r = 3, // radius of nodes
    padding = 1, // horizontal padding for first and last column
    fill = "MediumSeaGreen", // fill for nodes
    stroke = "#aaa", // stroke for links
    strokeWidth = 1.5, // stroke width for links
    strokeOpacity = 0.4, // stroke opacity for links
    strokeLinejoin, // stroke line join for links
    strokeLinecap, // stroke line cap for links
    content,
    nonCanonicalLinks,
    textColor = 'white',
  } = {}) {
    // If id and parentId options are specified, or the path option, use d3.stratify
    // to convert tabular data to a hierarchy; otherwise we assume that the data is
    // specified as an object {children} with nested objects (a.k.a. the “flare.json”
    // format), and use d3.hierarchy.
    const root = path != null ? d3.stratify().path(path)(data)
        : id != null || parentId != null ? d3.stratify().id(id).parentId(parentId)(data)
        : d3.hierarchy(data, children);
  
    // Sort the nodes.
    if (sort != null) root.sort(sort);
  
    // Compute the layout.
    // const dx = 100;
    // const dy = WIDTH / (root.height + padding);
    const dx = NODE_HEIGHT + 50
    const dy = NODE_WIDTH + 50
    tree().nodeSize([dx, dy])(root);
  
    // Center the tree.
    let x0 = Infinity;
    let x1 = -x0;
    root.each(d => {
      if (d.x > x1) x1 = d.x;
      if (d.x < x0) x0 = d.x;
    });
  
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
  

    node.append("rect")
        .attr("fill", d => d.children ? stroke : fill)
        .attr("width", NODE_WIDTH)
        .attr("height", NODE_HEIGHT)
        .attr("dy", -dy/2)
  
    if (title != null) node.append("title")
        .text(d => title(d.data, d));
  
    node.each(function (d) {
        // text
        const p = d3.select(this)
            .append('foreignObject')
                .attr('width', NODE_WIDTH - 2*NODE_PADDING)
                .attr('height', NODE_HEIGHT - 2*NODE_PADDING)
                .attr('x', NODE_PADDING)
                .attr('y', NODE_PADDING)
                .append('xhtml:p')
        
        for (const { kind, text } of d.data.textChunks) {
            const span = p.append('span')

            if (kind == 'text') span.text(text)
            else katex.render(text, span.node())
        }
    })

    return content.node();
  }