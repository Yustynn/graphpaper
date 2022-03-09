import yaml from 'yaml'
const GRAPH_DATA_PATH = './data/graph.yaml'
async function main() {
  const data = await fetch(GRAPH_DATA_PATH)
    .then(r => r.text())
    .then(yaml.parse)

  console.log(data)
}

main()