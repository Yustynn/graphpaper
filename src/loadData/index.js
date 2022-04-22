import store from '../store'
import { CHUNK_CONTEXT, GRAPH_DATA_PATH } from '../constants';
import { Chunk } from './ChunkClasses'
import * as d3 from 'd3'

export default async function loadData() {
    const data = await d3.json(GRAPH_DATA_PATH);

    // for now, just remove context
    data.nodes = data.nodes.map(n => {
        if (!n.text) return n

        n.chunks = Chunk.mkChunks(n.text)
        n.contextChunks = n.chunks.filter(c => c.kind == CHUNK_CONTEXT)

        return n
    })

    store.data = data

    return data
}