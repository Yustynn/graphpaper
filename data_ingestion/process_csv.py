#!/usr/bin/env python

import pandas as pd
import numpy as np
import json

LINK_TYPE_MAP = {
    'd': 'definition',
    'el': 'elaboration',
    's': 'synonym',
    'su': 'support',
    'ex': 'example',
}

INPUT_PATH = './gsheets.csv'
OUTPUT_PATH = '../data/graph.json'

raw = pd.read_csv(INPUT_PATH)

nodes = []
links = []

node_ids = set()

# populate nodes and links
for r in raw.itertuples():
    node = {}
    node_links = []
    node_id = int(r[1])

    node['id']   = node_id
    node['text'] = r[2]
    context_name = r[3]

    if isinstance(node['text'], float):
        continue

    node_ids.add(node_id)

    if not isinstance(context_name, float):
        node['context_name'] = context_name

    # go through all possible link columns and populate the "links" list
    for i in range(4, len(r), 2):
        target_id_raw, kind_raw = r[i], r[i+1]
        if not isinstance(kind_raw, float):
            links.append({
                'source': node_id,
                'target': int(target_id_raw),
                'kind': LINK_TYPE_MAP[kind_raw]
            })

    nodes.append(node)

print(f"Num nodes: {len(nodes)}")
# strip out links with non-existent nodes (because they haven't been inputted into gsheets yet)
print(f"Original number of links: {len(links)}")
links = [l for l in links if l['target'] in node_ids]
print(f"Reduced number of links: {len(links)}")

# save
with open(OUTPUT_PATH, 'w') as f:
    json.dump({ 'nodes': nodes, 'links': links }, f)
