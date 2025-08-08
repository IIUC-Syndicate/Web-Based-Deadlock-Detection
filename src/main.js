// Basic UI
function showSection(id) {
  document.getElementById('home').classList.add('hidden');
  document.getElementById('single').classList.add('hidden');
  document.getElementById('multi').classList.add('hidden');

  if (id === 'home') {
    document.getElementById('home').classList.remove('hidden');
    document.getElementById('back-btn').classList.add('hidden');
  } else {
    document.getElementById(id).classList.remove('hidden');
    document.getElementById('back-btn').classList.remove('hidden');
  }
}

function goHome() {
  showSection('home');

  var siProc = document.getElementById('si-processes');
  var siRes  = document.getElementById('si-resources');
  if (siProc) siProc.value = '';
  if (siRes)  siRes.value = '';

  clearSingleEdges();

  var miN = document.getElementById('mi-n');
  var miM = document.getElementById('mi-m');
  if (miN) miN.value = '';
  if (miM) miM.value = '';

  clearMultiMatrices();

  closeModal();
}

var backBtn = document.getElementById('back-btn');
if (backBtn) backBtn.onclick = function() { goHome(); };

// Modal
function showModal(html) {
  var modal = document.getElementById('modal');
  var content = document.getElementById('modal-content');
  if (!modal || !content) return;
  content.innerHTML = html;
  modal.classList.remove('hidden');
}
// function closeModal() {
//   var modal = document.getElementById('modal');
//   if (!modal) return;
//   modal.classList.add('hidden');
// }
function closeModalAndClearGraph() {

  if (network) {
    network.destroy();
    network = null;
  }
  
  const container = document.getElementById('graph-container');
  if (container) container.innerHTML = '';

  const modal = document.getElementById('modal');
  if (modal) modal.classList.add('hidden');
}


//  Single-instance Input 
var edgeCount = 0;

function addEdgeRow() {
  var container = document.getElementById('si-edges');
  if (!container) return;

  var idx = edgeCount;
  edgeCount = edgeCount + 1;

  var row = document.createElement('div');
  row.className = 'flex gap-2 items-center mb-2';
  row.id = 'edge-row-' + idx;

  var sel = document.createElement('select');
  sel.id = 'edge-type-' + idx;
  sel.className = 'bg-gray-700 border border-gray-600 rounded px-1 py-0.5';
  var o1 = document.createElement('option'); o1.value = 'request'; o1.text = 'Request (P→R)';
  var o2 = document.createElement('option'); o2.value = 'assignment'; o2.text = 'Assignment (R→P)';
  sel.appendChild(o1); sel.appendChild(o2);

  var fromIn = document.createElement('input');
  fromIn.id = 'edge-from-' + idx;
  fromIn.type = 'text';
  fromIn.placeholder = 'From';
  fromIn.className = 'bg-gray-700 border border-gray-600 rounded px-2 py-1 w-28';

  var arrow = document.createElement('span');
  arrow.className = 'text-gray-400';
  arrow.innerText = '→';

  var toIn = document.createElement('input');
  toIn.id = 'edge-to-' + idx;
  toIn.type = 'text';
  toIn.placeholder = 'To';
  toIn.className = 'bg-gray-700 border border-gray-600 rounded px-2 py-1 w-28';

  var del = document.createElement('button');
  del.className = 'text-red-500 hover:text-red-400 font-bold px-1';
  del.innerText = '×';
  del.onclick = function() { container.removeChild(row); };

  sel.onchange = function() {
    if (sel.value === 'request') {
      fromIn.placeholder = 'From';
      toIn.placeholder = 'To';
    } else {
      fromIn.placeholder = 'From';
      toIn.placeholder = 'To';
    }
  };

  row.appendChild(sel);
  row.appendChild(fromIn);
  row.appendChild(arrow);
  row.appendChild(toIn);
  row.appendChild(del);

  container.appendChild(row);
}

function clearSingleEdges() {
  edgeCount = 0;
  var container = document.getElementById('si-edges');
  if (container) container.innerHTML = '';
}


// detect Cycle

function detectCycle(procs, ress, edges) {
  var procSet = {};
  for (var i = 0; i < procs.length; i++) {
    var p = (procs[i] || '').trim();
    if (p === '') continue;
    procSet[p] = true;
  }

  var resSet = {};
  for (var i = 0; i < ress.length; i++) {
    var r = (ress[i] || '').trim();
    if (r === '') continue;
    resSet[r] = true;
  }

  var nodes = [];
  for (var i = 0; i < procs.length; i++) {
    var p = (procs[i] || '').trim();
    if (p && nodes.indexOf(p) === -1) nodes.push(p);
  }
  for (var i = 0; i < ress.length; i++) {
    var r = (ress[i] || '').trim();
    if (r && nodes.indexOf(r) === -1) nodes.push(r);
  }

  var adj = {};
  for (var i = 0; i < nodes.length; i++) adj[nodes[i]] = [];

  for (var e = 0; e < edges.length; e++) {
    var edge = edges[e];
    var t = (edge.type || '').trim();
    var a = (edge.from || '').trim();
    var b = (edge.to   || '').trim();

    if (t === 'request') {
      if (procSet[a] && resSet[b]) adj[a].push(b);
    } else if (t === 'assignment') {
      if (resSet[a] && procSet[b]) adj[a].push(b);
    }
  }

  var visited = {};
  var onStack = {};
  var parent  = {};
  var cycle   = [];

  function dfs(u) {
    visited[u] = true;
    onStack[u] = true;
    var neighbours = adj[u] || [];
    for (var i = 0; i < neighbours.length; i++) {
      var v = neighbours[i];
      if (!visited[v]) {
        parent[v] = u;
        if (dfs(v)) return true;
      } else if (onStack[v]) {
        var path = [v];
        var x = u;
        while (typeof x !== 'undefined' && x !== v) {
          path.push(x);
          x = parent[x];
        }
        path.reverse();
        cycle = path;
        return true;
      }
    }
    onStack[u] = false;
    return false;
  }

  for (var i = 0; i < procs.length; i++) {
    var start = (procs[i] || '').trim();
    if (!start) continue;
    if (!visited[start]) {
      if (dfs(start)) break;
    }
  }

  var result = [];
  for (var i = 0; i < cycle.length; i++) {
    var node = cycle[i];
    if (procSet[node]) {
      if (result.indexOf(node) === -1) result.push(node);
    }
  }

  drawGraphInModal(nodes, edges, result);

  result.sort(function(a,b){
    return parseInt(a.slice(1)) - parseInt(b.slice(1));
  })
  return result;

  
}

function checkSingle() {
  var procs = [];
  var rawP = document.getElementById('si-processes').value || '';
  var partsP = rawP.split(',');
  for (var i = 0; i < partsP.length; i++) {
    var s = partsP[i].trim();
    if (s) procs.push(s);
  }

  var ress = [];
  var rawR = document.getElementById('si-resources').value || '';
  var partsR = rawR.split(',');
  for (var i = 0; i < partsR.length; i++) {
    var s = partsR[i].trim();
    if (s) ress.push(s);
  }

  var edges = [];
  var container = document.getElementById('si-edges');
  if (container) {
    var rows = container.children;
    for (var r = 0; r < rows.length; r++) {
      var row = rows[r];
      var sel = row.querySelector('select');
      var inputs = row.querySelectorAll('input');
      if (!sel || inputs.length < 2) continue;
      var fromVal = inputs[0].value.trim();
      var toVal   = inputs[1].value.trim();
      if (!fromVal || !toVal) continue;
      edges.push({ type: sel.value, from: fromVal, to: toVal });
    }
  }

  var dead = detectCycle(procs, ress, edges);

  if (dead && dead.length > 0) {
    showModal(
      '<p class="text-red-400 font-bold text-xl">Deadlock Detected!</p>' +
      '<p>Processes in cycle: <strong>' + dead.join(', ') + '</strong></p>'
    );
  } else {
    showModal('<p class="text-green-400 font-bold text-xl">No Deadlock Found.</p>');
  }
}


// Multi-instance

function buildMatrices() {
  var n = parseInt(document.getElementById('mi-n').value, 10) || 0;
  var m = parseInt(document.getElementById('mi-m').value, 10) || 0;
  var container = document.getElementById('mi-matrices');
  container.innerHTML = '';

  if (n < 1 || m < 1) {
    showModal('<p class="text-red-400">Enter valid positive integers for processes and resources.</p>');
    return;
  }

  var availDiv = document.createElement('div');
  availDiv.innerHTML = '<p class="font-medium mt-4 text-gray-300">Available:</p>';
  var availTable = document.createElement('table');
  var tr = document.createElement('tr');
  for (var j = 0; j < m; j++) {
    var td = document.createElement('td');
    td.className = 'p-1';
    var inp = document.createElement('input');
    inp.type = 'number'; inp.min = '0'; inp.value = '0';
    inp.dataset.lbl = 'available-0-' + j;
    inp.className = 'w-16 bg-gray-700 border border-gray-600 rounded px-1 py-1 text-center';
    td.appendChild(inp);
    tr.appendChild(td);
  }
  availTable.appendChild(tr);
  availDiv.appendChild(availTable);
  container.appendChild(availDiv);

  function makeMatrix(label) {
    var sec = document.createElement('div');
    sec.innerHTML = '<p class="font-medium mt-4 text-gray-300">' + label + ':</p>';
    var table = document.createElement('table');
    for (var i = 0; i < n; i++) {
      var row = document.createElement('tr');
      for (var j = 0; j < m; j++) {
        var td = document.createElement('td');
        td.className = 'p-1';
        var inp = document.createElement('input');
        inp.type = 'number'; inp.min = '0'; inp.value = '0';
        inp.dataset.lbl = label.toLowerCase() + '-' + i + '-' + j; 
        inp.className = 'w-16 bg-gray-700 border border-gray-600 rounded px-1 py-1 text-center';
        td.appendChild(inp);
        row.appendChild(td);
      }
      table.appendChild(row);
    }
    sec.appendChild(table);
    container.appendChild(sec);
  }

  makeMatrix('Allocation');
  makeMatrix('Request');

  var checkBtn = document.getElementById('mi-check-btn');
  if (checkBtn) checkBtn.classList.remove('hidden');
}

function clearMultiMatrices() {
  var container = document.getElementById('mi-matrices');
  if (container) container.innerHTML = '';
  var checkBtn = document.getElementById('mi-check-btn');
  if (checkBtn) checkBtn.classList.add('hidden');
}

function checkMulti() {
  var n = parseInt(document.getElementById('mi-n').value, 10) || 0;
  var m = parseInt(document.getElementById('mi-m').value, 10) || 0;

  var avail = [];
  for (var j = 0; j < m; j++) {
    var el = document.querySelector('input[data-lbl="available-0-' + j + '"]');
    if (!el) { showModal('<p class="text-red-400">Matrix not generated correctly.</p>'); return; }
    avail.push(Math.max(0, Number(el.value) || 0));
  }

  var allocation = [];
  var request = [];
  for (var i = 0; i < n; i++) {
    var allocRow = [];
    var reqRow = [];
    for (var j = 0; j < m; j++) {
      var aEl = document.querySelector('input[data-lbl="allocation-' + i + '-' + j + '"]');
      var rEl = document.querySelector('input[data-lbl="request-'    + i + '-' + j + '"]');
      if (!aEl || !rEl) { showModal('<p class="text-red-400">Matrix fields missing. Regenerate matrices.</p>'); return; }
      allocRow.push(Math.max(0, Number(aEl.value) || 0));
      reqRow.push( Math.max(0, Number(rEl.value) || 0));
    }
    allocation.push(allocRow);
    request.push(reqRow);
  }

  // run detection
  var anir = detectMulti(avail, allocation, request);
  var dead = anir.result;
  var sequence = anir.sequence;
  if (dead.length > 0) {
    showModal(
      '<p class="text-red-400 font-bold text-xl">Deadlocked Processes:</p>' +
      '<p><strong>' + dead.join(', ') + '</strong></p>'
    );
  } else {
    showModal('<p class="text-green-400 font-bold text-xl">No Deadlock Found.</p>');

    drawPSG(sequence);
  }
}

// Multi-instance detection

function detectMulti(available, allocation, request) {
  var n = allocation.length;
  var m = available.length;
  var work = available.slice(); 
  var finish = [];
  for (var i = 0; i < n; i++) finish.push(false);

  for (var i = 0; i < n; i++) {
    var allZero = true;
    for (var j = 0; j < m; j++) {
      if (allocation[i][j] !== 0) { allZero = false; break; }
    }
    if (allZero) finish[i] = true;
  }

  var progress = true;
  var sequence = [];

  while (progress) {
    progress = false;
    for (var i = 0; i < n; i++) {
      if (finish[i]) continue;
      var can = true;
      for (var j = 0; j < m; j++) {
        if (request[i][j] > work[j]) { can = false; break; }
      }
      if (can) {
        for (var j = 0; j < m; j++) work[j] += allocation[i][j];
        finish[i] = true;
        sequence.push('P' + (i + 1));
        progress = true;
      }
    }
  }

  var result = [];
  for (var i = 0; i < n; i++) {
    if (!finish[i]) result.push('P' + (i + 1));
  }
  return {result,sequence};
}

let network = null;  // global network variable


function drawGraphInModal(nodes, edges, result) {

  const visNodes = nodes.map(nodeId => ({
  id: nodeId,
  label: nodeId,
  shape: 'ellipse',
  color: result.includes(nodeId) ? '#dc2626' : '#ffffffff'
  }));


  // Convert edges to vis.js format
  const visEdges = edges.map(e => ({
    from: e.from.trim(),
    to: e.to.trim(),
    color: { color: "white" },
    arrows: "to"
  }));

  // Create DataSets
  const nodesDataset = new vis.DataSet(visNodes);
  const edgesDataset = new vis.DataSet(visEdges);

  // Create network in modal container
  const container = document.getElementById("graph-container");
  const data = { nodes: nodesDataset, edges: edgesDataset };
  const options = {
    autoResize: true,
    physics: {
      enabled: true,
      stabilization: { iterations: 200 }
    },
    layout: {
      improvedLayout: true
    },
    edges: {
      smooth: true
    }
  };

  network = new vis.Network(container, data, options);


  setTimeout(() => {
    network.fit();
  }, 100);


  // Show the modal
  document.getElementById("modal").classList.remove("hidden");
}


function drawPSG(sequence) {
  if (!sequence || sequence.length === 0) return;

  const nodes = sequence.map(proc => ({
    id: proc,
    label: proc,
    shape: 'ellipse',
    color: '#3b82f6'  
  }));

  const edges = [];
  for (let i = 0; i < sequence.length - 1; i++) {
    edges.push({
      from: sequence[i],
      to: sequence[i + 1],
      arrows: 'to',
      color: '#2563eb',
      smooth: { type: 'cubicBezier' }
    });
  }

  const data = {
    nodes: new vis.DataSet(nodes),
    edges: new vis.DataSet(edges)
  };

  const options = {
    nodes: {
      font: { size: 18, color: '#fff' }
    },
    edges: {
      font: { align: 'top' },
      smooth: true
    },
    physics: false
  };

  const container = document.getElementById('graph-container');
  if (!container) return;

  network = new vis.Network(container, data, options);

}

goHome();
