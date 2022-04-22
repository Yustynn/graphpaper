import * as d3 from 'd3'
import { CHUNK_TEXT, CHUNK_LATEX, CHUNK_CONTEXT } from '../constants';
import katex from 'katex'

export class Chunk {
    constructor(kind) {
        this.kind = kind
    }

    attachToD3Element(d3Element) {
        d3Element.node().append(this.htmlElement.cloneNode(true))
    }


    static mkChunks(text) {
        const matches = text.match(/%.*?%/g)

        if (matches === null) return Chunk.mkTextAndLatexChunks(text)

        const match = matches[0]
        let processedChunks = []
        const chunkFragments = text.split(match)
        for (let fragment of chunkFragments.slice(0, chunkFragments.length-1)) {
            processedChunks = processedChunks.concat(Chunk.mkChunks(fragment))
            processedChunks.push(new ContextChunk(match))
        }
        const lastFragment = chunkFragments[chunkFragments.length-1]
        if (lastFragment)
            processedChunks = processedChunks.concat(Chunk.mkChunks(lastFragment))

        return processedChunks
    }

    static mkTextAndLatexChunks(text) {
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

        return chunks
    }

}

export class TextChunk extends Chunk {
    constructor(content) {
        super(CHUNK_TEXT)
        this.content = content
        this.htmlElement = d3.create('span').text(content).node()
    }
}

export class LatexChunk extends Chunk {
    constructor(content) {
        super(CHUNK_LATEX)
        this.content = content
        this.htmlElement = d3.create('span').node()
        katex.render(content, this.htmlElement)
    }
}

export class ContextChunk extends Chunk {
    constructor(raw) {
        super(CHUNK_CONTEXT)

        const [contextName, content] = raw.slice(1, raw.length-1).split('|')
        this.contextName = contextName
        this.htmlElement = d3.create('span').classed('context-text', true).node()
        this.children = Chunk.mkTextAndLatexChunks(content || contextName) 

        this.children.forEach(n => this.htmlElement.append(n.htmlElement))
    }
}