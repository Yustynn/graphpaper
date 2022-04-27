import * as d3 from 'd3'
import {
    NODE_WIDTH,
    NODE_HEIGHT,
    NODE_PADDING,
    NODE_COLORS,
    LINK_COLORS
} from './constants'
import store from './store'
import { setSelectedNode } from './storeActions'
import _ from 'lodash'
import Color from 'color'

export default function main(content, data, panel) {
    return Tree(data.nodes, data, panel, {
        label: d => d.id,
        title: (d, n) => `${n.ancestors().reverse().map(d => d.data.name).join(".")}`, // hover text
        width: 1152,
        content,
        nonCanonicalLinks: data.nonCanonicalLinks,
        canonicalLinks: data.canonicalLinks,
        textColor: '#bbb',
    })
}

function rootToNodeMap(root) {
    const map = new Map()
    traverse(root)

    store.nodeIdToTreeNode = map
    return map

    function traverse(node) {
        if (map.has(node.data.id)) return

        map.set(node.data.id, node)
        if (node.children) node.children.forEach(traverse)
    }
}

function processRawLinks(rawLinks, nodeMap) {
    return rawLinks.map(l => ({
        source: nodeMap.get(l.source),
        target: nodeMap.get(l.target),
        kind: l.kind
    }))
}

// adapted from https://observablehq.com/@d3/tree
function Tree(data, allData, panel, { // data is either tabular (array of objects) or hierarchy (nested objects)
    path, // as an alternative to id and parentId, returns an array identifier, imputing internal nodes
    id = Array.isArray(data) ? d => d.id : null, // if tabular data, given a d in data, returns a unique identifier (string)
    parentId = Array.isArray(data) ? d => d.parentId : null, // if tabular data, given a node d, returns its parent’s identifier
    children, // if hierarchical data, given a d in data, returns its children
    tree = d3.tree, // layout algorithm (typically d3.tree or d3.cluster)
    sort, // how to sort nodes prior to layout (e.g., (a, b) => d3.descending(a.height, b.height))
    linkD, // given a node d, its link (if any)
    linkTarget = "_blank", // the target attribute for links (if any)
    fill = NODE_COLORS.default, // fill for nodes
    stroke = "#aaa", // stroke for links
    strokeWidth = 3, // stroke width for links
    strokeLinejoin, // stroke line join for links
    strokeLinecap, // stroke line cap for links
    content,
    nonCanonicalLinks,
    canonicalLinks,
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
    const dx = NODE_HEIGHT + 50
    const dy = NODE_WIDTH + 100
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
        .attr("stroke-linecap", strokeLinecap)
        .attr("stroke-linejoin", strokeLinejoin)
        .attr("stroke-width", strokeWidth)

    const nodeMap = rootToNodeMap(root)
    const nonCanonicalLinksProcessed = processRawLinks(nonCanonicalLinks, nodeMap)
    const canonicalLinksProcessed = processRawLinks(canonicalLinks, nodeMap)
    const links = [...canonicalLinksProcessed, ...nonCanonicalLinksProcessed]

    // for node coloring
    const targetIdToLinkKinds = new Map()
    for (const { target, kind } of links) {
        const { id } = target.data
        if (!targetIdToLinkKinds.has(id)) targetIdToLinkKinds.set(id, [])

        targetIdToLinkKinds.get(id).push(kind)
    }

    function getNodeKind(node) {
        const kindCounter = {}
        if (!targetIdToLinkKinds.has(node.id)) return 'default'

        const kinds = targetIdToLinkKinds.get(node.id)
        for (const kind of kinds) {
            if (!kindCounter[kind]) kindCounter[kind] = 0
            kindCounter[kind] += 1
        }

        const entries = Object.entries(kindCounter)
        let [currKind, currMax] = entries[0]
        for (const [kind, count] in entries.slice(1)) {
            if (count > currMax) {
                currMax = count
                currKind = kind
            }
        }

        return currKind
    }

    const link = pathContainer
        .selectAll("path")
        .data(links)
        .join("path")
        .attr("d", d3.linkHorizontal()
            .x(d => d.y)
            .y(d => d.x))
            .attr('stroke', d => LINK_COLORS[d.kind])



    const node = content.append("g")
        .selectAll("a")
        .data(root.descendants())
        .join("a")
        .attr("xlink:href", linkD == null ? null : d => linkD(d.data, d))
        .attr("target", linkD == null ? null : linkTarget)
        .attr("transform", d => `translate(${d.y},${d.x})`);


    // make rectangle
    node.append("rect")
        // .attr("fill", d => d.children ? stroke : fill)
        .attr("fill", fill)
        .attr("width", NODE_WIDTH)
        .attr("height", NODE_HEIGHT)
        .attr("x", -NODE_WIDTH/2)
        .attr("y", -NODE_HEIGHT/2)
        .attr('id', d => `node-${d.data.id}`)
        .attr('class', n => getNodeKind(n.data))
        .attr('fill', n => {
            const raw = LINK_COLORS[getNodeKind(n.data)]
            return Color(raw).lighten(0.5).string()
        })

    // make label
    node.each(function (d) {
        // text
        const p = d3.select(this)
            .append('foreignObject')
            .attr('width', NODE_WIDTH - 2 * NODE_PADDING)
            .attr('height', NODE_HEIGHT - 2 * NODE_PADDING)
            .attr('x', NODE_PADDING - NODE_WIDTH/2)
            .attr('y', NODE_PADDING - NODE_HEIGHT/2)
            .append('xhtml:p')

        d.data.chunks.forEach(chunk => chunk.attachToD3Element(p))
    })

    setupNodeOnClick(node, link, allData, panel)

    return content.node();
}

function setupNodeOnClick(node, link, data, panel) {
    const linksData = [...data.nonCanonicalLinks, ...data.canonicalLinks]
    node
        .on('click', function (_, n) {
            setSelectedNode(n)
            panel.show()
            panel.update()
        })
}