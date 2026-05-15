const firebaseConfig = {
    apiKey: "AIzaSyBp40COK29MmCZFP8xQclkSTc3WlUMFX2M",
    authDomain: "myincubator-5ea4c.firebaseapp.com",
    databaseURL: "https://myincubator-5ea4c-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "myincubator-5ea4c",
    storageBucket: "myincubator-5ea4c.firebasestorage.app",
    messagingSenderId: "484232471727",
    appId: "1:484232471727:web:7cbd288b614b383c94605a",
    measurementId: "G-41CY6G61YJ"
};

firebase.initializeApp(firebaseConfig);
const database = firebase.database();
const auth = firebase.auth();

// --- 1. ฟังข้อมูล Real-time (ดึงค่ามาโชว์บนหน้าเว็บ) ---
function watchIncubatorData() {
    // ดึงอุณหภูมิและความชื้น (Current)
    database.ref('Current/Temp').on('value', (s) => document.getElementById('temp-val').innerText = s.val() || "--");
    database.ref('Current/Humi').on('value', (s) => document.getElementById('humi-val').innerText = s.val() || "--");

    // ดึงสถานะโหมด (Settings/ManualMode)
    database.ref('Settings/ManualMode').on('value', (s) => {
        const isManual = s.val();
        const el = document.getElementById('work-mode-status');
        if (el) {
            el.innerText = isManual ? "MANUAL" : "AUTO";
            el.style.color = isManual ? "orange" : "#007bff";
        }
    });

    // --- ส่วนที่แก้ไข: ดึงค่าจาก Settings มาโชว์สถานะทันที ---
    // สถานะไฟ (Heater) - ดึงจาก Settings/ManualLight
    database.ref('Settings/ManualLight').on('value', (s) => {
        const val = s.val(); // ค่าเป็น true หรือ false
        const el = document.getElementById('light-status');
        if (el) {
            el.innerText = val ? "ON" : "OFF";
            el.style.color = val ? "green" : "gray";
        }
    });

    // สถานะพัดลม (Fan) - ดึงจาก Settings/ManualFan
    database.ref('Settings/ManualFan').on('value', (s) => {
        const val = s.val(); // ค่าเป็น true หรือ false
        const el = document.getElementById('fan-status');
        if (el) {
            el.innerText = val ? "ON" : "OFF";
            el.style.color = val ? "green" : "gray";
        }
    });
}

// --- 2. ฟังก์ชันสั่งงาน (ส่งค่าไป Firebase) ---
function controlDevice(type, action) {
    let path = "";
    let value = (action === 'ON' || action === 'MANUAL'); // แปลงปุ่มกดเป็น true/false

    if (type === 'WorkMode') path = "Settings/ManualMode";
    else if (type === 'LightStatus') path = "Settings/ManualLight";
    else if (type === 'FanStatus') path = "Settings/ManualFan";

    if (path !== "") {
        console.log("ส่งค่าไปที่:", path, "ค่า:", value);
        database.ref(path).set(value)
            .then(() => console.log("Firebase อัปเดตแล้ว"))
            .catch(err => alert("เกิดข้อผิดพลาด: " + err.message));
    }
}

// --- 3. ฟังก์ชันอื่นๆ ---
function logout() { auth.signOut().then(() => window.location.href = "login.html"); }

function loadDailySummary() {
    // โหลดตารางและกราฟ (ถ้ามี)
    console.log("ระบบพร้อมทำงาน");
}

auth.onAuthStateChanged((user) => {
    if (user) watchIncubatorData();
    else if (!window.location.pathname.includes("login.html")) window.location.href = "login.html";
});