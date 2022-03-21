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
  content.selectAll('line')
    .data(root.descendants().slice(1))
    .enter()
      .append('line')
      .attr('x1', d => d.parent.y)
      .attr('y1', d => d.parent.x)
      .attr('x2', d => d.y)
      .attr('y2', d => d.x)
      .attr('stroke', '#ccc')

  // Add curved links between nodes:
  // svg.selectAll('path')
  //   .data( root.descendants().slice(1) )
  //   .enter()
  //   .append('path')
  //   .attr("d", function(d) {
  //     // console.log(d)
  //       return "M" + d.y + "," + d.x
  //               + "C" + (d.parent.y + 50) + "," + d.x
  //               + " " + (d.parent.y + 50) + "," + d.parent.x // 50 and 150 are coordinates of inflexion, play with it to change links shape
  //               + " " + d.parent.y + "," + d.parent.x;
  //             })
  //   .style("fill", 'none')
  //   .attr("stroke", '#ccc')


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