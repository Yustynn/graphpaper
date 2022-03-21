import { HEIGHT, WIDTH } from './constants'
import * as d3Hierarchy from 'd3-hierarchy'

const NODE_X_SPACING = 50
const NODE_Y_SPACING = 50

function getMaxDepthAndNumLeafNodes(node, depth=0) {
  if (node.children.length == 0) {
    return { numLeafNodes: 1, depth }
  }

  let maxDepth = depth
  let numLeafNodes = 0
  for (let child of node.children) {
    const res = getMaxDepthAndNumLeafNodes(child, depth+1)
    numLeafNodes += res.numLeafNodes
    maxDepth = Math.max(maxDepth, res.depth)
  }

  return { depth: maxDepth, numLeafNodes: numLeafNodes }

}

export default function main(content, data) {
  const { depth, numLeafNodes } = getMaxDepthAndNumLeafNodes(data)
  // Create the cluster layout:
  const cluster = d3Hierarchy.cluster()
    .size([NODE_X_SPACING * depth, NODE_Y_SPACING * numLeafNodes]);

  

  // Give the data to this cluster layout:
  const root = d3Hierarchy.hierarchy(data, function(d) {
      return d.children;
  });
  cluster(root);

  // add straight links between nodes
  content.selectAll('polyline')
    .data(root.descendants().slice(1))
    .enter()
      .append('polyline')
      .attr('points', d => {
        // not sure why I had to invert the coords, but I did.:w

        const [x, y] = [d.y, d.x]
        const [px, py] = [d.parent.y, d.parent.x]
        const points = [
          [x, y],
          [x, py],
          [px, py]
        ]

        return points
          .map(p => p.join(', '))
          .join(' ')
      })
      .attr('stroke', '#ccc')
      .attr('fill', 'none')


  // Add a circle for each node.
  content.selectAll("g")
      .data(root.descendants())
      .enter()
      .append("g")
      .attr("transform", function(d) {
          return "translate(" + d.y + "," + d.x + ")"
      })
      .append("circle")
        .attr("r", 7)
        .style("fill", "#69b3a2")
        .attr("stroke", "black")
        .style("stroke-width", 2)


}