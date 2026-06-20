const audioContext =
new (window.AudioContext || window.webkitAudioContext)();

function playStartSound(){
  const osc = audioContext.createOscillator();
  osc.frequency.value = 1000;
  osc.connect(audioContext.destination);
  osc.start();
  osc.stop(audioContext.currentTime + 0.1);
}

function playStopSound(){
  const osc = audioContext.createOscillator();
  osc.frequency.value = 500;
  osc.connect(audioContext.destination);
  osc.start();
  osc.stop(audioContext.currentTime + 0.2);
}

let running = false;
let startTime = 0;
let interval;

let records = JSON.parse(localStorage.getItem("records") || "[]");

function saveData(){
  localStorage.setItem("records", JSON.stringify(records));
}

function updateTimer(){
  const t = (performance.now() - startTime) / 1000;
  document.getElementById("time").textContent = t.toFixed(2);
}

function toggle(){

  if(!running){

    playStartSound();
    startTime = performance.now();

    interval = setInterval(updateTimer, 10);

    document.getElementById("btn").textContent = "STOP";
    running = true;

  }else{

    playStopSound();

    clearInterval(interval);

    document.getElementById("time").textContent = "0.00";

    document.getElementById("btn").textContent = "START";

    running = false;

    const name =
        document.getElementById("name").value.trim() || "未入力";

    const time =
        Number(((performance.now() - startTime) / 1000).toFixed(2));

    const id =
        Date.now().toString() + Math.random().toString(36).slice(2,8);

    records.push({id, name, time});

    saveData();
    updateTable();
    }
}

function updateTable(){

  const tbody = document.getElementById("records");
  tbody.innerHTML = "";

  // 表示は新しい順
  const list = records.slice().reverse();

  list.forEach((r,i)=>{

    const tr = document.createElement("tr");

    // ★Noは「元データ基準」で固定（重要）
    const no = records.findIndex(x => x.id === r.id) + 1;

    tr.innerHTML = `
      <td>${no}</td>
      <td>${r.name}</td>
      <td>${r.time.toFixed(2)}</td>
      <td>
        <button onclick="deleteRecord('${r.id}')">削除</button>
      </td>
    `;

    tbody.appendChild(tr);
  });

  if(records.length === 0){
  document.getElementById("avg").textContent = "0.00";
  document.getElementById("best").textContent = "0.00";

  const maxEl = document.getElementById("max");
  if(maxEl) maxEl.textContent = "0.00";

  return;
}

  const times = records.map(r => r.time);

  const avg = times.reduce((a,b)=>a+b,0) / times.length;
  const max = Math.max(...times);
  const min = Math.min(...times);

  document.getElementById("avg").textContent = avg.toFixed(2);
  document.getElementById("best").textContent = min.toFixed(2);

  const maxEl = document.getElementById("max");
  if(maxEl){
    maxEl.textContent = max.toFixed(2);
  }
}

function deleteRecord(id){

  records = records.filter(r => r.id !== id);

  saveData();
  updateTable();
}

function deleteLastRecord(){
  records.pop();
  saveData();
  updateTable();
}

function clearRecords(){
  if(!confirm("全部削除する？")) return;
  records = [];
  saveData();
  updateTable();
}

document.getElementById("btn").addEventListener("click", toggle);
document.getElementById("deleteBtn").addEventListener("click", deleteLastRecord);
document.getElementById("clearBtn").addEventListener("click", clearRecords);

document.addEventListener("keydown", e => {

  if(e.isComposing) return;

  const tag = document.activeElement.tagName;
  if(tag === "INPUT" || tag === "TEXTAREA") return;

  if(e.code === "Space"){
    e.preventDefault();
    toggle();
  }
});

updateTable();
