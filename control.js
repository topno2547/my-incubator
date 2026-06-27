import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getDatabase,
  ref,
  onValue,
  update
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

// =========================
// Firebase config
// =========================
const firebaseConfig = {
  apiKey: "AIzaSyBp40COK29MmCZFP8xQclkSTc3WlUMFX2M",
  authDomain: "myincubator-5ea4c.firebaseapp.com",
  databaseURL: "https://myincubator-5ea4c-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "myincubator-5ea4c",
  storageBucket: "myincubator-5ea4c.firebasestorage.app",
  messagingSenderId: "484232471727",
  appId: "1:484232471727:web:66fec7c80917d2c794605a"
};

// =========================
// เริ่ม Firebase
// =========================
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// =========================
// element แสดงสถานะ
// =========================
const controlModeEl = document.getElementById("controlMode");
const controlFanEl = document.getElementById("controlFan");
const controlHeaterEl = document.getElementById("controlHeater");
const controlLightEl = document.getElementById("controlLight");
const dayCountEl = document.getElementById("dayCount");

// =========================
// element ปุ่ม
// =========================
const modeBtn = document.getElementById("modeBtn");
const fanBtn = document.getElementById("fanBtn");
const heaterBtn = document.getElementById("heaterBtn");
const lightBtn = document.getElementById("lightBtn");
const turnBtn = document.getElementById("turnBtn");
const startBtn = document.getElementById("startBtn");
const stopBtn = document.getElementById("stopBtn");
const resetDayBtn = document.getElementById("resetDayBtn");

// =========================
// path Firebase
// =========================
const controlRef = ref(db, "Control");
const statusRef = ref(db, "Status");

// =========================
// ตารางแปลภาษา
// =========================
const thaiText = {
  mode: {
    AUTO: "อัตโนมัติ",
    MANUAL: "ควบคุมเอง"
  },

  switch: {
    ON: "เปิด",
    OFF: "ปิด"
  }
};

// =========================
// เก็บข้อมูล Control ล่าสุด
// =========================
let controlData = {
  Fan: "OFF",
  Heater: "OFF",
  Light: "OFF",
  ResetDayCount: false,
  SetMode: "AUTO",
  Start: false,
  Stop: false,
  TurnNow: false
};

// =========================
// ฟังก์ชันเปลี่ยนสี ON/OFF
// =========================
function setOnOffStyle(el, value) {
  if (!el) return;

  el.textContent = thaiText.switch[value] ?? value ?? "--";
  el.classList.remove("green", "red", "orange", "blue");

  if (value === "ON") {
    el.classList.add("green");
  } else if (value === "OFF") {
    el.classList.add("red");
  }
}

// =========================
// ฟังก์ชันเปลี่ยนสี AUTO/MANUAL
// =========================
function setModeStyle(el, value) {
  if (!el) return;

  el.textContent = thaiText.mode[value] ?? value ?? "--";
  el.classList.remove("green", "red", "orange", "blue");

  if (value === "AUTO") {
    el.classList.add("green");
  } else if (value === "MANUAL") {
    el.classList.add("orange");
  }
}

// =========================
// เปิด/ปิดปุ่มตามโหมด
// MANUAL = กดได้
// AUTO = กดไม่ได้
// =========================
function updateManualButtons(mode) {
  const isManual = mode === "MANUAL";

  if (fanBtn) fanBtn.disabled = !isManual;
  if (heaterBtn) heaterBtn.disabled = !isManual;
  if (lightBtn) lightBtn.disabled = !isManual;
  if (turnBtn) turnBtn.disabled = !isManual;

  [fanBtn, heaterBtn, lightBtn, turnBtn].forEach((btn) => {
    if (!btn) return;

    if (isManual) {
      btn.classList.remove("disabled-btn");
    } else {
      btn.classList.add("disabled-btn");
    }
  });
}

// =========================
// อ่าน Control แบบ realtime
// =========================
onValue(controlRef, (snapshot) => {
  const data = snapshot.val();
  console.log("Control จาก Firebase:", data);

  if (data) {
    controlData = {
      Fan: data.Fan ?? "OFF",
      Heater: data.Heater ?? "OFF",
      Light: data.Light ?? "OFF",
      ResetDayCount: data.ResetDayCount ?? false,
      SetMode: data.SetMode ?? "AUTO",
      Start: data.Start ?? false,
      Stop: data.Stop ?? false,
      TurnNow: data.TurnNow ?? false
    };

    setModeStyle(controlModeEl, controlData.SetMode);
    updateManualButtons(controlData.SetMode);

    setOnOffStyle(controlFanEl, controlData.Fan);
    setOnOffStyle(controlHeaterEl, controlData.Heater);
    setOnOffStyle(controlLightEl, controlData.Light);
  } else {
    setModeStyle(controlModeEl, "--");
    setOnOffStyle(controlFanEl, "--");
    setOnOffStyle(controlHeaterEl, "--");
    setOnOffStyle(controlLightEl, "--");
    updateManualButtons("AUTO");
  }
});

// =========================
// อ่าน Status แบบ realtime
// =========================
onValue(statusRef, (snapshot) => {
  const data = snapshot.val();
  console.log("Status จาก Firebase:", data);

  if (data && data.DayCount !== undefined) {
    dayCountEl.textContent = `${data.DayCount} วัน`;
  } else {
    dayCountEl.textContent = "-- วัน";
  }
});

// =========================
// ฟังก์ชันเขียน Control
// =========================
async function writeControl(newValues) {
  try {
    await update(controlRef, newValues);
    console.log("อัปเดต Control สำเร็จ:", newValues);
  } catch (error) {
    console.error("เขียน Control ไม่สำเร็จ:", error);
    alert("ส่งคำสั่งไป Firebase ไม่สำเร็จ: " + error.message);
  }
}

// =========================
// ปุ่ม: สลับ AUTO / MANUAL
// =========================
if (modeBtn) {
  modeBtn.addEventListener("click", () => {
    const newMode = controlData.SetMode === "AUTO" ? "MANUAL" : "AUTO";
    writeControl({ SetMode: newMode });
  });
}

// =========================
// ปุ่ม: เปิด / ปิด พัดลม
// =========================
if (fanBtn) {
  fanBtn.addEventListener("click", () => {
    if (controlData.SetMode !== "MANUAL") {
      alert("ต้องเปลี่ยนเป็นโหมด MANUAL ก่อน");
      return;
    }

    const newFan = controlData.Fan === "ON" ? "OFF" : "ON";
    writeControl({ Fan: newFan });
  });
}

// =========================
// ปุ่ม: เปิด / ปิด ฮีตเตอร์
// =========================
if (heaterBtn) {
  heaterBtn.addEventListener("click", () => {
    if (controlData.SetMode !== "MANUAL") {
      alert("ต้องเปลี่ยนเป็นโหมด MANUAL ก่อน");
      return;
    }

    const newHeater = controlData.Heater === "ON" ? "OFF" : "ON";
    writeControl({ Heater: newHeater });
  });
}

// =========================
// ปุ่ม: เปิด / ปิด ไฟ
// =========================
if (lightBtn) {
  lightBtn.addEventListener("click", () => {
    if (controlData.SetMode !== "MANUAL") {
      alert("ต้องเปลี่ยนเป็นโหมด MANUAL ก่อน");
      return;
    }

    const newLight = controlData.Light === "ON" ? "OFF" : "ON";
    writeControl({ Light: newLight });
  });
}

// =========================
// ปุ่ม: กลับไข่ตอนนี้
// =========================
if (turnBtn) {
  turnBtn.addEventListener("click", async () => {
    if (controlData.SetMode !== "MANUAL") {
      alert("ต้องเปลี่ยนเป็นโหมด MANUAL ก่อน");
      return;
    }

    await writeControl({ TurnNow: true });

    setTimeout(() => {
      writeControl({ TurnNow: false });
    }, 1000);
  });
}

// =========================
// ปุ่ม: เริ่มฟัก
// =========================
if (startBtn) {
  startBtn.addEventListener("click", async () => {
    await writeControl({
      Start: true,
      Stop: false
    });

    setTimeout(() => {
      writeControl({ Start: false });
    }, 1000);
  });
}

// =========================
// ปุ่ม: หยุดฟัก
// =========================
if (stopBtn) {
  stopBtn.addEventListener("click", async () => {
    await writeControl({
      Stop: true,
      Start: false
    });

    setTimeout(() => {
      writeControl({ Stop: false });
    }, 1000);
  });
}

// =========================
// ปุ่ม: รีเซ็ตวันฟัก
// =========================
if (resetDayBtn) {
  resetDayBtn.addEventListener("click", async () => {
    const ok = confirm("ต้องการรีเซ็ตวันฟักใช่หรือไม่?");
    if (!ok) return;

    await writeControl({ ResetDayCount: true });

    setTimeout(() => {
      writeControl({ ResetDayCount: false });
    }, 1000);
  });
}