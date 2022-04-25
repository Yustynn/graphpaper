import _ from 'lodash'

export default function main(data) {
    data = _.cloneDeep(data)
    addChildren(data)
    addParents(data)
    addDepth(data)
    addCanonicalParent(data)

    console.log(data)


    return {
        ...partitionLinksByCanon(data),
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
        if (!mapping.get(target)) debugger;
        node.children.push(mapping.get(target))
    }
}

function addParents(data) {
    // must only be run after addChildren

    function traverse(node) {
        for (const child of node.children) {
            if (!child.parents) child.parents = []
            if (child.parents.includes(node)) continue
            child.parents.push(node)

            traverse(child)
        }
    }
    return traverse(data.nodes.find(n => n.id == 0))

}

function addDepth(data) {
    function traverse(node, depth) {
        let shouldTraverse = true

        if (node.depth == undefined) node.depth = depth
        else {
            if (node.depth > depth) node.depth = depth
            else shouldTraverse = false
        }

        if (shouldTraverse) {
            for (const child of node.children) {
                traverse(child, node.depth + 1)
            }
        }
    }

    return traverse(data.nodes.find(n => n.id == 0), 0)
}

function addCanonicalParent(data) {
    // must only be run after addParents and addDepth

    function traverse(node) {
        for (const child of node.children) {
            // skip if canonical parent already defined
            if (child.canonicalParent != undefined) continue

            // no parent (root)
            if (child.parents.length == 0) {
                child.canonicalParent = null
            }
            // only one parent
            else if (child.parents.length == 1) {
                child.canonicalParent = child.parents[0]
            }
            // >= 1 parent
            else {
                // choose parent with lowest depth
                child.canonicalParent = _.minBy(child.parents, n => n.depth)
            }

            traverse(child)
        }
    }

    return traverse(data.nodes.find(n => n.id == 0), 0)
}

function partitionLinksByCanon(data) {
    // must only be run after addCanonicalParents

    const { nodes, links } = data
    const idToNode = new Map()
    populateIdToNode(nodes.find(n => n.id == 0))

    const canonicalLinks = links.filter(l => idToNode.get(l.target).canonicalParent.id == l.source)
    const nonCanonicalLinks = links.filter(l => idToNode.get(l.target).canonicalParent.id != l.source)

    return { canonicalLinks, nonCanonicalLinks }

    function populateIdToNode(node) {
        if (idToNode.has(node.id)) return

        idToNode.set(node.id, node)
        node.children.forEach(populateIdToNode)
    }

}