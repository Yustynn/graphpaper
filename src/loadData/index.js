import store from '../store'
import { GRAPH_DATA_PATH } from '../constants';
import { Chunk, } from './ChunkClasses'
import * as d3 from 'd3'

export default async function loadData() {
    const data = await d3.json(GRAPH_DATA_PATH);

    // for now, just remove context
    data.nodes = data.nodes.map(n => {
        if (!n.text) return n

        n.context = (n.text.match(/%.*?%/g) || [])
            .map(t => t.split('|')[0].slice(1))
        n.text = n.text.replaceAll(/%(.+?)\|/g, '').replaceAll('%', '')
        n.chunks = Chunk.mkTextAndLatexChunks(n.text)

        return n
    })

    store.data = data

    return data
}