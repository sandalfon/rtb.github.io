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
<div style="display:flex;gap:4px;align-items:center">
<button class="delayMinus" data-km="${i}">-10</button>
<input type="text" class="delay" data-km="${i}" value="${delay}" style="width:90px">
<button class="delayPlus" data-km="${i}">+10</button>
</div>
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
</td>`;

    tbody.appendChild(row);
  }

  updateTimes();
  saveListeners();
}

/* DELAY BUTTONS */

document.addEventListener("click", (e) => {
  if (
    e.target.classList.contains("delayPlus") ||
    e.target.classList.contains("delayMinus")
  ) {
    let km = e.target.dataset.km;

    let input = document.querySelector('.delay[data-km="' + km + '"]');

    let sec = toSec(input.value);

    if (e.target.classList.contains("delayPlus")) {
      sec += 10;
    } else {
      sec -= 10;
    }

    input.value = secToTime(sec);

    updateTimes();
    saveData();
  }
});

/* TEMPS */

function toSec(t) {
  if (!t) return 0;

  let sign = 1;

  if (t.startsWith("-")) {
    sign = -1;
    t = t.substring(1);
  }

  if (t.startsWith("+")) {
    t = t.substring(1);
  }

  let a = t.split(":");

  let sec = (+a[0] || 0) * 3600 + (+a[1] || 0) * 60 + (+a[2] || 0);

  return sec * sign;
}

function secToTime(sec) {
  let sign = "";

  if (sec < 0) {
    sign = "-";
    sec = Math.abs(sec);
  }

  let h = Math.floor(sec / 3600);
  let m = Math.floor((sec % 3600) / 60);
  let s = sec % 60;

  return (
    sign +
    String(h).padStart(2, "0") +
    ":" +
    String(m).padStart(2, "0") +
    ":" +
    String(s).padStart(2, "0")
  );
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
  updateCourse();
  updateObservateurCountdown();
}

/* PACE BUTTONS */

document.getElementById("pace615").onclick = () => {
  pace = pace615;
  buildTable();
};

document.getElementById("pace630").onclick = () => {
  pace = pace630;
  buildTable();
};

/* SAVE */

function saveListeners() {
  document.querySelectorAll(".delay,.rav,.note").forEach((el) => {
    el.addEventListener("input", saveData);
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

function updateObservateur(km) {
  highlightObservateur(km);

  updateObservateurCountdown();
}

/* COURSE MODE */

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
    let d = toSec(r.querySelector(".delay").value);

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

    html += `<div class="${cls}">KM ${r.km} - ${r.rav} ${r.note} ${r.time}</div>`;
  });

  document.getElementById("ravitoList").innerHTML = html;

  updateObservateur(km);
}

/* OBSERVATEUR */

function updateObservateur(km) {
  highlightObservateur(km);
}

function highlightObservateur(km) {
  let rows = document.querySelectorAll("#obsTable tbody tr");

  let targetRow = null;
  let bestKm = Infinity;

  rows.forEach((r) => {
    let rowKm = parseInt(r.dataset.km);

    if (rowKm >= km && rowKm < bestKm) {
      bestKm = rowKm;
      targetRow = r;
    }
  });

  if (targetRow) {
    targetRow.scrollIntoView({ block: "center" });
  }
}

/* UPDATE OBSERVATEUR TIMES */

function updateObservateurTimes() {
  let rows = document.querySelectorAll("#obsTable tbody tr");

  // Get start time for KM 0
  let startTimeVal = document.getElementById("startTime").value;
  let baseTimeStr = "--:--:--";
  if (startTimeVal) {
    let [h, m] = startTimeVal.split(":");
    let base = new Date();
    base.setHours(h);
    base.setMinutes(m);
    base.setSeconds(0);
    baseTimeStr = base.toTimeString().slice(0, 8);
  }

  rows.forEach((r) => {
    let km = parseInt(r.dataset.km);

    let cell = r.querySelector(".obsTime");
    if (!cell) return;

    if (km === 0) {
      cell.innerText = baseTimeStr;
      return;
    }

    let tableRow = document.querySelectorAll("#table tbody tr")[km - 1];

    if (!tableRow) return;

    let passage = tableRow.querySelector(".passage").innerText;

    cell.innerText = passage;
  });
}

/* CSV */

function buildObservateurTable() {
  fetch("https://sandalfon.github.io/rtb/followup.csv")
    .then((r) => r.text())
    .then((text) => {
      let lines = text.trim().split(/\r?\n/);

      let sep = lines[0].includes(";") ? ";" : ",";

      let csvHeaders = lines[0].split(sep).map((h) => h.trim());

      let tbody = document.querySelector("#obsTable tbody");

      tbody.innerHTML = "";

      // Order of columns expected in the HTML table
      const targetHeaders = [
        "KM",
        "Lieu",
        "Temps G",
        "Délai L",
        "Ligne",
        "Station",
        "Commentaire",
      ];

      for (let i = 1; i < lines.length; i++) {
        let cols = lines[i].split(sep).map((c) => c.trim());

        let rowData = {};
        csvHeaders.forEach((h, idx) => {
          rowData[h] = cols[idx];
        });

        let tr = document.createElement("tr");

        targetHeaders.forEach((th) => {
          let td = document.createElement("td");

          if (th === "Temps G") {
            td.classList.add("obsTime");
          } else {
            // Map 'Commentaire' to 'sCommentaire' or 'Commentaire'
            let value = rowData[th];
            if (value === undefined && th === "Commentaire") {
              value = rowData["sCommentaire"];
            }
            td.innerText = value || "";
          }

          tr.appendChild(td);
        });

        tr.dataset.km = rowData["KM"] || cols[0];

        tbody.appendChild(tr);
      }
      updateTimes();
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

let lastNotifKm = -1;

function updateObservateurCountdown() {
  let now = new Date();

  let rows = document.querySelectorAll("#obsTable tbody tr");

  let nextRow = null;
  let nextTime = null;

  rows.forEach((r, index) => {
    r.style.background = "";
    if (index === 0) return;
    let cell = r.querySelector(".obsTime");
    if (!cell) return;

    let t = cell.innerText.trim();
    if (!t) return;

    let [h, m, s] = t.split(":");

    let target = new Date();
    target.setHours(h);
    target.setMinutes(m);
    target.setSeconds(s);

    if (target > now) {
      if (nextTime === null || target < nextTime) {
        nextTime = target;
        nextRow = r;
      }
    }
  });

  if (!nextRow) {
    document.getElementById("obsNextCountdown").innerText = "terminé";
    return;
  }

  let diff = Math.floor((nextTime - now) / 1000);

  // Vibration and Notification at 2 minutes
  let km = nextRow.dataset.km;
  if (diff <= 120 && diff > 115 && lastNotifKm !== km) {
    if (navigator.vibrate) {
      navigator.vibrate([500, 200, 500]);
    }
    if (Notification.permission === "granted") {
      new Notification("Plan Marathon", {
        body: `Arrivée au KM ${km} dans 2 minutes !`,
      });
    }
    lastNotifKm = km;
  }

  let mm = Math.floor(diff / 60);
  let ss = diff % 60;

  const block = document.getElementById("obsNextBlock");

  let color = "red";
  if (diff > 600) {
    color = "yellow";
  } else if (diff > 300) {
    color = "orange";
  }

  block.style.background = color;
  nextRow.style.background = color;

  let lieu = nextRow.cells[1]?.innerText || "";

  document.getElementById("obsNextKm").innerText = "KM " + nextRow.dataset.km + " - " + lieu;

  document.getElementById("obsNextTime").innerText = nextTime
    .toTimeString()
    .slice(0, 8);

  document.getElementById("obsNextCountdown").innerText =
    String(mm).padStart(2, "0") + ":" + String(ss).padStart(2, "0");
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

  // Ask for notification permission
  if ("Notification" in window && Notification.permission !== "denied") {
    Notification.requestPermission();
  }

  const startInput = document.getElementById("startTime");
  const startBtn = document.getElementById("startNow");

  // recalcul automatique quand l'heure de départ change
  if (startInput) {
    startInput.addEventListener("change", () => {
      updateTimes();
    });

    startInput.addEventListener("input", () => {
      updateTimes();
    });
  }

  // bouton START : met l'heure actuelle
  if (startBtn && startInput) {
    startBtn.addEventListener("click", () => {
      const now = new Date();

      const h = String(now.getHours()).padStart(2, "0");
      const m = String(now.getMinutes()).padStart(2, "0");

      startInput.value = `${h}:${m}`;

      updateTimes();
      });
      }
      };

      if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("sw.js");
      }

      setInterval(updateCourse, 1000);
      setInterval(updateObservateurCountdown, 1000);

