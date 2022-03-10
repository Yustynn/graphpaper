import * as d3Fetch from 'd3-fetch'
import { GRAPH_DATA_PATH } from './constants';
import store from './store'

export default async function loadData() {
    const data = await d3Fetch.json(GRAPH_DATA_PATH);

    // for now, just remove context
    data.nodes = data.nodes.map(n => {
        if (!n.text) return n

        n.text = n.text.replaceAll(/%(.+?)\|/g, '').replaceAll('%', '')
        n.textChunks = mkTextChunks(n.text)

        return n
    })

    store.data = data

    return data
}

function mkTextChunks(text) {
    // this is a hacky solution to help render latex :(

    const matches = text.match(/\$.*?\$/g)
    let chunks = [{ text, kind: 'text'}]

    if (matches === null) return chunks

    for (let match of matches) {
        const processedChunks = []
        for (let chunk of chunks) {
            if (chunk.kind != 'text') {
                processedChunks.push(chunk)
                continue
            }
            const currChunks = chunk.text.split(match)

            for (let currChunk of currChunks.slice(0, currChunks.length-1)) {
                processedChunks.push({ text: currChunk, kind: 'text' })
                processedChunks.push({text: match.replaceAll('$', ''), kind: 'latex'})
            }
            processedChunks.push({ text: currChunks[currChunks.length-1], kind: 'text' })
        }
        chunks = processedChunks
    }

    return chunks
}
