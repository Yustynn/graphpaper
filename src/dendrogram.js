import { HEIGHT, WIDTH } from './constants'
import * as d3Hierarchy from 'd3-hierarchy'

export default function main(content, data) {
  // Create the cluster layout:
  const cluster = d3Hierarchy.cluster()
    .size([HEIGHT, WIDTH]);
  

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