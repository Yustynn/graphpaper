import * as d3Fetch from 'd3-fetch'
import * as d3 from 'd3'
import { GRAPH_DATA_PATH, CHUNK_TEXT, CHUNK_LATEX } from './constants';
import store from './store'
import katex from 'katex'

class Chunk {
    constructor(kind) {
        this.kind = kind
    }
}

class TextChunk extends Chunk {
    constructor(content) {
        super(CHUNK_TEXT)
        this.content = content
        this.htmlElement = d3.create('span').text(content).node()
    }
}

class LatexChunk extends Chunk {
    constructor(content) {
        super(CHUNK_LATEX)
        this.content = content
        this.htmlElement = d3.create('span').node()
        katex.render(content, this.htmlElement)
    }
}

export default async function loadData() {
    const data = await d3Fetch.json(GRAPH_DATA_PATH);

    // for now, just remove context
    data.nodes = data.nodes.map(n => {
        if (!n.text) return n

        n.context = (n.text.match(/%.*?%/g) || [])
            .map(t => t.split('|')[0].slice(1))
        n.text = n.text.replaceAll(/%(.+?)\|/g, '').replaceAll('%', '')
        n.chunks = mkChunks(n.text)

        return n
    })

    store.data = data

    return data
}

function mkChunks(text) {
    // The nearer the value of %cf|$f_A(x)$% to unity, the higher the grade of membership of %x|$x$% in %A|$A$%
    // this is a hacky solution to help render latex :(

    const matches = text.match(/\$.*?\$/g)
    let chunks = [new TextChunk(text)]

    if (matches === null) return chunks

    for (let match of matches) {
        const processedChunks = []
        for (let chunk of chunks) {
            if (chunk.kind != CHUNK_TEXT) {
                processedChunks.push(chunk)
                continue
            }
            const chunkFragments = chunk.content.split(match)

            for (let fragment of chunkFragments.slice(0, chunkFragments.length-1)) {
                processedChunks.push(new TextChunk(fragment))
                processedChunks.push(new LatexChunk(match.replaceAll('$', '')))
            }
            processedChunks.push(new TextChunk(chunkFragments[chunkFragments.length-1]))
        }
        chunks = processedChunks
    }

    console.log(chunks)
    return chunks
}
