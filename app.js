const express = require('express');
const app = express();
const server = require('http').Server(app);
app.use(express.json());
app.use(express.static('.'));
const io = require('socket.io')(server);
const fs = require('fs');

const port = 8000;

let nodes = [
  {
    id: 1,
    x_pos: 0.0,
    y_pos: 0.5,
    z_pos: 0.0,
    model_url: '/models/DamagedHelmet.glb',
  },
];

let links = [
];

function getNextNodeId() {
  let maxId = 0;
  for (const node of nodes) {
    if (node.id > maxId) {
      maxId = node.id;
    }
  }
  return maxId + 1;
}

function addNode(xPos, yPos, zPos, modelUrl) {
  const node = {
    id: getNextNodeId(),
    x_pos: xPos || 0.0,
    y_pos: yPos || 0.0,
    z_pos: zPos || 0.0,
    model_url: modelUrl || null,
  };
  nodes.push(node);
  return node;
}

function updateNode(id, xPos, yPos, zPos, modelUrl) {
  const index = nodes.findIndex(x => x.id == id);
  if (index >= 0) {
    const node = {
      id: nodes[index].id,
      x_pos: xPos !== undefined ? xPos : nodes[index].x_pos,
      y_pos: yPos !== undefined ? yPos : nodes[index].y_pos,
      z_pos: zPos !== undefined ? zPos : nodes[index].z_pos,
      model_url: modelUrl !== undefined ? modelUrl : nodes[index].model_url,
    };
    nodes[index] = node;
    return node;
  }
  return null;
};

function removeNode(id) {
  const index = nodes.findIndex(x => x.id === id);
  if (index >= 0) {
    nodes.splice(index, 1);
    return true;
  }
  return false;
}

function getNextLinkId() {
  let maxId = 0;
  for (const link of links) {
    if (link.id > maxId) {
      maxId = link.id;
    }
  }
  return maxId + 1;
}

function findLink(srcNodeId, dstNodeId) {
  return links.find(x => x.src_node_id === srcNodeId && x.dst_node_id === dstNodeId);
}

function addLink(srcNodeId, dstNodeId) {
  const link = {
    id: getNextLinkId(),
    src_node_id: srcNodeId,
    dst_node_id: dstNodeId,
  };
  links.push(link);
  return link;
}

function removeLink(id) {
  const index = links.findIndex(x => x.id === id);
  if (index >= 0) {
    links.splice(index, 1);
    return true;
  }
  return false;
}

function removeDependentLinks(id) {
  const removed = [];
  for (let index = links.length - 1; index >= 0; index--) {
    if (links[index].src_node_id === id || links[index].dst_node_id === id) {
      removed.push(links[index].id);
      links.splice(index, 1);
    }
  }
  return removed;
}

function sendJson(res, obj, status) {
  res.setHeader('Content-Type', 'application/json');
  res.status(status || 200);
  res.end(JSON.stringify(obj))
}

function sendError(res, msg, status) {
  const obj = { message: msg };
  sendJson(res, obj, status || 404);
}

app.get('/api/models', (req, res) => {
  const models = fs.readdirSync('./models').filter(x => x.endsWith('.glb')).map(x => '/models/' + x);
  sendJson(res, models, 200);
});

app.get('/api/nodes', (req, res) => {
  sendJson(res, nodes, 200);
});

app.get('/api/nodes/:id', (req, res) => {
  const id = Number.parseInt(req.params.id);
  const node = nodes.find(x => x.id === id);
  if (node) {
    sendJson(res, node, 200);
  } else {
    sendError(res, `Node ${id} does not exist`, 404);
  }
})

app.post('/api/nodes', (req, res) => {
  const { x_pos, y_pos, z_pos, model_url } = req.body;
  const node = addNode(x_pos, y_pos, z_pos, model_url);
  io.emit('node insert', node);
  sendJson(res, node, 201);
});

app.post('/api/nodes/:id', (req, res) => {
  const id = Number.parseInt(req.params.id);
  const { x_pos, y_pos, z_pos, model_url } = req.body;
  const node = updateNode(id, x_pos, y_pos, z_pos, model_url);
  if (node) {
    io.emit('node update', node);
    sendJson(res, node, 200);
  } else {
    sendError(res, `Node ${id} does not exist`, 404);
  }
});

app.delete('/api/nodes/:id', (req, res) => {
  const id = Number.parseInt(req.params.id);
  if (removeNode(id)) {
    for (const linkId of removeDependentLinks(id)) {
      io.emit('link delete', linkId);
    }
    io.emit('node delete', id);

    res.status(204);
    res.end();
  } else {
    sendError(res, `Node ${id} does not exist`, 404);
  }
});

app.get('/api/links', (req, res) => {
  sendJson(res, links, 200);
});

app.post('/api/links', (req, res) => {
  const { src_node_id, dst_node_id } = req.body;
  if (!src_node_id || !dst_node_id) {
    sendError(res, "'src_node_id' and 'dst_node_id' params are required", 400);
    return;
  }
  if (src_node_id == dst_node_id) {
    sendError(res, "'src_node_id' and 'dst_node_id' params must be different", 400);
    return;
  }

  const src_node = nodes.find(x => x.id === src_node_id);
  if (!src_node) {
    sendError(res, `Node ${src_node_id} does not exist`, 404);
    return;
  }
  const dst_node = nodes.find(x => x.id === dst_node_id);
  if (!dst_node) {
    sendError(res, `Node ${dst_node_id} does not exist`, 404);
    return;
  }

  const existingLink = findLink(src_node_id, dst_node_id);
  if (existingLink) {
    sendError(res, `A link already exists between nodes ${src_node_id} and ${dst_node_id}`, 400);
    return;
  }

  const link = addLink(src_node_id, dst_node_id);
  io.emit('link insert', link);
  sendJson(res, link, 201);
});

app.get('/api/links/:id', (req, res) => {
  const id = Number.parseInt(req.params.id);
  const link = links.find(x => x.id === id);
  if (link) {
    sendJson(res, link, 200);
  } else {
    sendError(res, `Link ${id} does not exist`, 404);
  }
});

app.delete('/api/links/:id', (req, res) => {
  const id = Number.parseInt(req.params.id);
  if (removeLink(id)) {
    io.emit('link delete', id);
    res.status(204);
    res.end();
  } else {
    sendError(res, `Link ${id} does not exist`, 404);
  }
});

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

server.listen(port, () => {
  console.log(`Listening on port ${port}.`);
});
