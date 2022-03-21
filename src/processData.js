export default function main(data) {
    const nodes = [...data.nodes]
    const { links } = data
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

    return mapping.get(0)
}