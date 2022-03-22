export default function main(data) {
    addChildren(data)
    addParents(data)

    return {
        links: data.links,
        nodes: data.nodes.find(n => n.id == 0)
    }
}

function addChildren(data) {
    const { nodes, links } = data
    // assumes that root node has node.id == 0

    const mapping = new Map()
    for (let node of nodes) {
        mapping.set(node.id, node)
        node.children = []
    }

    for (let { source, target } of links) {
        const node = mapping.get(source)
        node.children.push(mapping.get(target))
    }
}

function addParents(data) {
    function traverse(node) {
        for (const child of node.children) {
            if (!child.parents) child.parents = []
            if (child.parents.includes(n => n.id == node.id)) continue
            child.parents.push(node)
            traverse(child)
        }
    }
    return traverse(data.nodes.find(n => n.id == 0))

}