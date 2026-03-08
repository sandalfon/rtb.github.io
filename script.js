/* PACES */

const pace630 = [
  "00:06:25",
  "00:06:31",
  "00:06:40",
  "00:06:31",
  "00:06:29",
  "00:06:34",
  "00:06:30",
  "00:06:26",
  "00:06:29",
  "00:06:17",
  "00:06:37",
  "00:06:40",
  "00:06:29",
  "00:06:35",
  "00:06:37",
  "00:06:30",
  "00:06:29",
  "00:06:20",
  "00:06:34",
  "00:06:27",
  "00:06:32",
  "00:06:25",
  "00:06:27",
  "00:06:19",
  "00:06:36",
  "00:06:32",
  "00:06:27",
  "00:06:28",
  "00:06:31",
  "00:06:30",
  "00:06:32",
  "00:06:31",
  "00:06:33",
  "00:06:27",
  "00:06:31",
  "00:06:31",
  "00:06:31",
  "00:06:32",
  "00:06:29",
  "00:06:34",
  "00:06:33",
  "00:06:45",
  "00:03:16",
];

const pace615 = [
  "00:06:10",
  "00:06:16",
  "00:06:25",
  "00:06:16",
  "00:06:14",
  "00:06:18",
  "00:06:15",
  "00:06:11",
  "00:06:14",
  "00:06:03",
  "00:06:21",
  "00:06:24",
  "00:06:14",
  "00:06:20",
  "00:06:21",
  "00:06:15",
  "00:06:14",
  "00:06:06",
  "00:06:19",
  "00:06:12",
  "00:06:17",
  "00:06:10",
  "00:06:12",
  "00:06:05",
  "00:06:20",
  "00:06:17",
  "00:06:12",
  "00:06:13",
  "00:06:16",
  "00:06:15",
  "00:06:17",
  "00:06:16",
  "00:06:18",
  "00:06:12",
  "00:06:16",
  "00:06:16",
  "00:06:16",
  "00:06:17",
  "00:06:14",
  "00:06:18",
  "00:06:18",
  "00:06:29",
  "00:03:09",
];

let pace = pace630;

const tbody = document.querySelector("#table tbody");

/* TABLE */

function buildTable() {
  tbody.innerHTML = "";

  let saved = JSON.parse(localStorage.getItem("marathonData") || "{}");

  for (let i = 0; i < 43; i++) {
    let row = document.createElement("tr");
    let km = i + 1;

    if (km == 10) row.classList.add("km10");
    if (km == 21) row.classList.add("km21");
    if (km == 30) row.classList.add("km30");
    if (km == 40) row.classList.add("km40");

    let delay = saved[i]?.delay || "00:00:00";
    let rav = saved[i]?.rav || "non";
    let note = saved[i]?.note || "";

    row.innerHTML = `

<td>${km}</td>

<td class="pace">${pace[i]}</td>

<td class="cumul"></td>

<td class="passage"></td>

<td>
<input type="time" step="1" class="delay" data-km="${i}" value="${delay}">
</td>

<td>
<select class="rav" data-km="${i}">
<option ${rav == "non" ? "selected" : ""}>non</option>
<option ${rav == "plan A" ? "selected" : ""}>plan A</option>
<option ${rav == "plan B" ? "selected" : ""}>plan B</option>
</select>
</td>

<td>
<input class="note" data-km="${i}" value="${note}">
</td>
`;

    tbody.appendChild(row);
  }

  updateTimes();
  saveListeners();
}
/* TEMPS */

function toSec(t) {
  if (!t) return 0;

  let a = t.split(":");

  if (a.length === 2) {
    return +a[0] * 60 + +a[1];
  }

  return +a[0] * 3600 + +a[1] * 60 + +a[2];
}

function format(s) {
  let h = Math.floor(s / 3600);
  let m = Math.floor((s % 3600) / 60);
  let ss = s % 60;

  return [h, m, ss].map((v) => String(v).padStart(2, "0")).join(":");
}

function updateTimes() {
  let start = document.getElementById("startTime").value;
  if (!start) return;

  let [h, m] = start.split(":");

  let base = new Date();
  base.setHours(h);
  base.setMinutes(m);
  base.setSeconds(0);

  let cumul = 0;

  tbody.querySelectorAll("tr").forEach((r, i) => {
    let temps = toSec(pace[i]);

    let delayValue = r.querySelector(".delay").value;
    let delay = toSec(delayValue);

    cumul += temps + delay;

    r.querySelector(".cumul").innerText = format(cumul);

    let t = new Date(base.getTime() + cumul * 1000);

    r.querySelector(".passage").innerText = t.toTimeString().slice(0, 8);
  });

  updateObservateurTimes();
}
/* ---------- PACE BUTTONS ---------- */

document.getElementById("pace615").onclick = () => {
  pace = pace615;
  buildTable();
};

document.getElementById("pace630").onclick = () => {
  pace = pace630;
  buildTable();
};

/* SAUVEGARDE */

function saveListeners() {
  document.querySelectorAll(".delay,.rav,.note").forEach((el) => {
    el.addEventListener("change", saveData);
  });
}

function saveData() {
  let data = {};

  tbody.querySelectorAll("tr").forEach((r, i) => {
    data[i] = {
      delay: r.querySelector(".delay").value,
      rav: r.querySelector(".rav").value,
      note: r.querySelector(".note").value,
    };
  });

  localStorage.setItem("marathonData", JSON.stringify(data));

  updateTimes();
}

/* MODE COURSE */

function updateCourse() {
  let now = new Date();

  document.getElementById("courseTime").innerText = now
    .toTimeString()
    .slice(0, 8);

  let start = document.getElementById("startTime").value;
  if (!start) return;

  let [h, m] = start.split(":");

  let s = new Date();

  s.setHours(h);
  s.setMinutes(m);
  s.setSeconds(0);

  let elapsed = (now - s) / 1000;

  let cumul = 0;
  let km = 0;
  let ravitos = [];

  tbody.querySelectorAll("tr").forEach((r, i) => {
    let d = parseInt(r.querySelector(".delay").value) || 0;

    cumul += toSec(pace[i]) + d;

    let rav = r.querySelector(".rav").value;
    let note = r.querySelector(".note").value;
    let time = r.querySelector(".passage").innerText;

    if (elapsed > cumul) km = i + 1;

    if (rav != "non") {
      ravitos.push({ km: i + 1, rav, note, time, cumul });
    }
  });

  document.getElementById("courseKm").innerText = "KM " + km;

  let html = "";

  ravitos.forEach((r) => {
    let cls =
      r.cumul > elapsed && !html.includes("next") ? "ravito next" : "ravito";

    html += `<div class="${cls}">
KM ${r.km} - ${r.rav} ${r.note} ${r.time}
</div>`;
  });

  document.getElementById("ravitoList").innerHTML = html;

  updateObservateur(km);
}

/* OBSERVATEUR */

function updateObservateur(km) {
  let now = new Date();

  document.getElementById("obsTime").innerText = now.toTimeString().slice(0, 8);

  document.getElementById("obsKm").innerText = "KM " + km;

  highlightObservateur(km);
}

function highlightObservateur(km) {
  let rows = document.querySelectorAll("#obsTable tbody tr");

  rows.forEach((r) => {
    r.classList.remove("current");

    let rowKm = parseInt(r.dataset.km);

    if (rowKm >= km && !document.querySelector("#obsTable tr.current")) {
      r.classList.add("current");
    }
  });
}

/* CSV */

function buildObservateurTable() {
  fetch("https://sandalfon.github.io/rtb/followup.csv")
    .then((r) => r.text())
    .then((text) => {
      let lines = text.trim().split(/\r?\n/);

      let sep = lines[0].includes(";") ? ";" : ",";

      let headers = lines[0].split(sep).map((h) => h.trim());

      let tbody = document.querySelector("#obsTable tbody");

      tbody.innerHTML = "";

      for (let i = 1; i < lines.length; i++) {
        let cols = lines[i].split(sep).map((c) => c.trim());

        let tr = document.createElement("tr");

        headers.forEach((h, index) => {
          let td = document.createElement("td");

          if (h == "Temps G") {
            td.classList.add("obsTime");
          } else {
            td.innerText = cols[index] || "";
          }

          tr.appendChild(td);
        });

        tr.dataset.km = cols[0];

        tbody.appendChild(tr);
      }
    });
}

/* MAJ TEMPS OBSERVATEUR */

function updateObservateurTimes() {
  let rows = document.querySelectorAll("#obsTable tbody tr");

  rows.forEach((r) => {
    let km = parseInt(r.dataset.km);

    let tableRow = document.querySelectorAll("#table tbody tr")[km - 1];

    if (!tableRow) return;

    let passage = tableRow.querySelector(".passage").innerText;

    let cell = r.querySelector(".obsTime");

    if (cell) cell.innerText = passage;
  });
}

/* URL */

function loadUrl() {
  let url = document.getElementById("customUrl").value;

  document.getElementById("urlFrame").src = url;

  localStorage.setItem("customUrl", url);
}

function resetUrl() {
  localStorage.removeItem("customUrl");

  document.getElementById("urlFrame").src = "";
}

/* TABS */

function showTab(id) {
  document
    .querySelectorAll(".tab")
    .forEach((t) => t.classList.remove("active"));

  document.getElementById(id).classList.add("active");
}

/* INIT */

window.onload = () => {
  buildTable();

  buildObservateurTable();
};

setInterval(updateCourse, 1000);
