import yaml from 'yaml'

const GRAPH_DATA_PATH = './data/graph.yaml'

export default async function loadGraphData() {
  const data = await fetch(GRAPH_DATA_PATH)
    .then(r => r.text())
    .then(yaml.parse)

  return data
}