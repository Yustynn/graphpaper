// Very crappily-coded module to make some mock data

const LINK_KINDS = ['definition', 'support', 'elaboration']
const SOFT_MAX_ID_THRESHOLD = 300

export default function main(maxNumChildren=3) {
    const nodes = []

    let currId = 0
    populateNodes(nodes, maxNumChildren=maxNumChildren)
    const links = mkLinks(nodes)

    return { nodes, links }

    function populateNodes(nodes, maxNumChildren=3, overrideNumChildren) {
        const id = currId++
        const text = `Node ID ${id}`

        const numChildren = overrideNumChildren ? overrideNumChildren : randInt(0, maxNumChildren)
        
        const children = []

        if (id < SOFT_MAX_ID_THRESHOLD) {
            for (let i = 0; i < numChildren; i++) {
                children.push(populateNodes(nodes, maxNumChildren))
            }
        }

        const node = { id, text, children }
        nodes.push(node)

        if (node.length == 1) return populateNodes(nodes, maxNumChildren, overrideNumChildren)

        return node
    }
}

function randInt(lo=0, hi=3) {
    const r = Math.random()

    for (let i = lo; i <= hi; i++) {
        const thresh = (i - lo + 1) / (hi - lo + 1)
        if (r <= thresh) return i
    }
}

function mkLinks(nodes) {
    const links = []

    nodes.forEach(({ id, children }) => {
        for (let child of children) {
            links.push({
                source: id,
                target: child.id,
                // kind: sample(LINK_KINDS),
                kind: 'definition',

            })
        }
    })

    return links
}