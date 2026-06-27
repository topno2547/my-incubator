import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyBp40COK29MmCZFP8xQclkSTc3WlUMFX2M",
  authDomain: "myincubator-5ea4c.firebaseapp.com",
  databaseURL: "https://myincubator-5ea4c-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "myincubator-5ea4c",
  storageBucket: "myincubator-5ea4c.firebasestorage.app",
  messagingSenderId: "484232471727",
  appId: "1:484232471727:web:66fec7c80917d2c794605a"
};

// 1) เริ่มเชื่อม Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// 2) อ้าง element จากหน้าเว็บ
const tempEl = document.getElementById("temp");
const humiEl = document.getElementById("humi");
const updatedAtEl = document.getElementById("updatedAt");

const dayCountEl = document.getElementById("dayCount");
const systemStatusEl = document.getElementById("systemStatus");
const modeStatusEl = document.getElementById("modeStatus");
const fanStatusEl = document.getElementById("fanStatus");
const heaterStatusEl = document.getElementById("heaterStatus");
const turnMotorStatusEl = document.getElementById("turnMotorStatus");
const waterStatusEl = document.getElementById("waterStatus");
const controlModeEl = document.getElementById("controlMode");
const controlFanEl = document.getElementById("controlFan");
const controlHeaterEl = document.getElementById("controlHeater");
const controlLightEl = document.getElementById("controlLight");
const historyCanvas = document.getElementById("historyChart");
const showTempBtn = document.getElementById("showTempBtn");
const showHumiBtn = document.getElementById("showHumiBtn");
// 3) อ้าง path ใน Firebase
const currentRef = ref(db, "Current");
const statusRef = ref(db, "Status");

// =========================
// ตารางแปลค่าจาก Firebase -> ภาษาไทย
// =========================
const thaiText = {
  system: {
    RUNNING: "กำลังทำงาน",
    STOPPED: "หยุดทำงาน",
    ERROR: "ผิดพลาด"
  },

  mode: {
    AUTO: "อัตโนมัติ",
    MANUAL: "ควบคุมเอง"
  },

  switch: {
    ON: "เปิด",
    OFF: "ปิด"
  },

  turnMotor: {
    IDLE: "รอทำงาน",
    TURNING: "กำลังกลับไข่"
  },

  water: {
    OK: "ปกติ",
    LOW: "น้ำต่ำ"
  }
};


// ===============================
// อ่านข้อมูล Current
// ===============================
onValue(currentRef, (snapshot) => {
  const data = snapshot.val();

  if (data) {
    if (data.Temp !== undefined) {
      tempEl.textContent = `${data.Temp} °C`;
    } else {
      tempEl.textContent = "-- °C";
    }

    if (data.Humi !== undefined) {
      humiEl.textContent = `${data.Humi} %`;
    } else {
      humiEl.textContent = "-- %";
    }

    if (data.UpdatedAt !== undefined) {
      updatedAtEl.textContent = data.UpdatedAt;
    } else {
      updatedAtEl.textContent = "--";
    }
  } else {
    tempEl.textContent = "-- °C";
    humiEl.textContent = "-- %";
    updatedAtEl.textContent = "--";
  }
});

// ===============================
// อ่านข้อมูล Status
// ===============================
onValue(statusRef, (snapshot) => {
  const data = snapshot.val();

  if (data) {
    if (data.DayCount !== undefined) {
      dayCountEl.textContent = `${data.DayCount} วัน`;
    } else {
      dayCountEl.textContent = "--";
    }

    if (data.System !== undefined) {
      systemStatusEl.textContent = thaiText.system[data.System] ?? data.System;
    } else {
      systemStatusEl.textContent = "--";
    }

    if (data.Mode !== undefined) {
      modeStatusEl.textContent = thaiText.mode[data.Mode] ?? data.Mode;
    } else {
      modeStatusEl.textContent = "--";
    }

    if (data.Fan !== undefined) {
      fanStatusEl.textContent = thaiText.switch[data.Fan] ?? data.Fan;
    } else {
      fanStatusEl.textContent = "--";
    }

    if (data.Heater !== undefined) {
      heaterStatusEl.textContent = thaiText.switch[data.Heater] ?? data.Heater;
    } else {
      heaterStatusEl.textContent = "--";
    }

    if (data.TurnMotor !== undefined) {
      turnMotorStatusEl.textContent = thaiText.turnMotor[data.TurnMotor] ?? data.TurnMotor;
    } else {
      turnMotorStatusEl.textContent = "--";
    }

    if (data.Water !== undefined) {
      waterStatusEl.textContent = thaiText.water[data.Water] ?? data.Water;
    } else {
      waterStatusEl.textContent = "--";
    }
  } else {
    dayCountEl.textContent = "--";
    systemStatusEl.textContent = "--";
    modeStatusEl.textContent = "--";
    fanStatusEl.textContent = "--";
    heaterStatusEl.textContent = "--";
    turnMotorStatusEl.textContent = "--";
    waterStatusEl.textContent = "--";
  }
  function setOnOffStyle(el, value) {
  if (!el) return;

  el.textContent = value ?? "--";
  el.classList.remove("green", "red", "orange", "blue");

  if (value === "ON") {
    el.classList.add("green");
  } else if (value === "OFF") {
    el.classList.add("red");
  }
}
});
