/*
    Badly-coded module to make some mock data

    - Badly coded because of the crappy use of scope
*/

import { sample, shuffle } from 'lodash'

const LINK_KINDS = ['definition', 'support', 'elaboration']
const SOFT_MAX_ID_THRESHOLD = 50

export default function main({maxNumChildren=3, minNumNodes=10, maxNumNodes=20, pRandomLink=0.1}) {
    const nodes = []

    let currId = 0
    populateNodes(nodes, maxNumChildren=maxNumChildren)

    // ensure node size within [minNodes, maxNodes]
    if (nodes.length < minNumNodes || nodes.length > maxNumNodes)
        return main({maxNumChildren, minNumNodes, maxNumNodes, pRandomLink})

    const links = mkLinks(nodes, pRandomLink)


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

function mkLinks(nodes, pRandomLink) {
    const links = []

    const mkLink = (source, target) => ({
        source,
        target,
        kind: sample(LINK_KINDS),
        // kind: 'definition',
    })

    nodes.forEach(({ id, children }) => {
        for (let child of children) {
            links.push(mkLink(id, child.id))

            const p = Math.random()
            if (p < pRandomLink) {
                const link = mkLink(id, Math.floor(Math.random() * nodes.length))
                links.push(link)
            }
        }
    })

    return shuffle(links)
}