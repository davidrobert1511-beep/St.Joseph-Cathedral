const LS_KEY = "deathForms";

function getForms() {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY)) || [];
  } catch {
    return [];
  }
}

function setForms(arr) {
  localStorage.setItem(LS_KEY, JSON.stringify(arr));
}

// Save or update
document.getElementById("deathForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const idField = document.getElementById("recordId");
  let all = getForms();
  let data = { id: idField.value || Date.now().toString() };

  new FormData(this).forEach((v, k) => (data[k] = v));
  data.serial = document.getElementById("serial").value.trim();
  data.year = document.getElementById("year").value.trim();

  if (idField.value) {
    // update existing
    all = all.map((f) => (f.id === data.id ? data : f));
    alert("Record updated successfully!");
  } else {
    // new
    all.push(data);
    alert("Form saved successfully!");
  }

  setForms(all);
  resetForm();
  renderResults();
});

function resetForm() {
  document.getElementById("deathForm").reset();
  document.getElementById("recordId").value = "";
  document.getElementById("serial").value = "";
  document.getElementById("year").value = "";
}

// Search
const searchName = document.getElementById("searchName");
const searchSerial = document.getElementById("searchSerial");
const resultsDiv = document.getElementById("results");

document.getElementById("searchBtn").addEventListener("click", renderResults);
searchName.addEventListener("input", renderResults);
searchSerial.addEventListener("input", renderResults);

function renderResults() {
  const qName = searchName.value.trim().toLowerCase();
  const qSerial = searchSerial.value.trim().toLowerCase();
  const forms = getForms();

  const matches = forms.filter((f) => {
    const nameHit = qName ? (f.name || "").toLowerCase().includes(qName) : false;
    const serialHit = qSerial ? String(f.serial || "").toLowerCase().includes(qSerial) : false;
    return qName || qSerial ? nameHit || serialHit : true;
  });

  resultsDiv.innerHTML = matches.length
    ? `<p><b>${matches.length}</b> record(s) found.</p>`
    : "<p>No records found.</p>";

  matches.forEach((rec) => {
    const div = document.createElement("div");
    div.className = "result-card";
    div.innerHTML = `
      <p><b>Name / नाम:</b> ${rec.name || "-"} &nbsp; | &nbsp;
         <b>Serial / क्रमांक:</b> ${rec.serial || "-"} &nbsp; | &nbsp;
         <b>Year / वर्ष:</b> ${rec.year || "-"}</p>
      <button class="btn btn-print" onclick="printCertificate('${rec.id}')">Print</button>
      <button class="btn btn-edit" onclick="editCertificate('${rec.id}')">Edit</button>
      <button class="btn btn-delete" onclick="deleteCertificate('${rec.id}')">Delete</button>
    `;
    resultsDiv.appendChild(div);
  });
}

// Edit
function editCertificate(id) {
  const rec = getForms().find((r) => r.id === id);
  if (!rec) {
    alert("Record not found.");
    return;
  }

  document.getElementById("recordId").value = rec.id;
  document.getElementById("serial").value = rec.serial || "";
  document.getElementById("year").value = rec.year || "";

  const form = document.getElementById("deathForm");
  for (const [k, v] of Object.entries(rec)) {
    if (form.elements[k]) form.elements[k].value = v;
  }
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// Delete
function deleteCertificate(id) {
  if (!confirm("Are you sure you want to delete this record?")) return;
  let all = getForms().filter((r) => r.id !== id);
  setForms(all);
  renderResults();
  alert("Record deleted successfully!");
}

// Print
function printCertificate(id) {
  const rec = getForms().find((r) => r.id === id);
  if (!rec) {
    alert("Record not found.");
    return;
  }

  const w = window.open("", "_blank", "width=900,height=700");
  w.document.write(`
    <html><head><title>Death Certificate</title></head>
    <body style="font-family:'Times New Roman',serif; margin:40px;">
      <h2 style="text-align:center; text-decoration:underline;">DEATH CERTIFICATE <br> मृत्यु प्रमाण पत्र</h2>
      <h3 style="text-align:center;">ST. JOSEPH'S CATHEDRAL <br> सेंट जोसेफ कैथेड्रल</h3>
      <h3 style="text-align:center;">DIOCESE OF MEERUT <br> मेरठ धर्मप्रांत</h3>
      <hr>
      <p><center><b>Serial No. / क्रमांक:</b> ${rec.serial || ""} &nbsp;&nbsp;
         <b>Year / वर्ष:</b> ${rec.year || ""}</center></p>
      <hr>
      <p><b>Date of Death / मृत्यु की तिथि:</b> <U><font size=6>${rec.dateOfDeath || ""}</font></U></p>
      <p><b>Name of Deceased / मृतक का नाम:</b> <U><font size=6>${rec.name || ""}</font></U></p>
      <p><b>Sex / लिंग:</b> <U><font size=6>${rec.sex || ""}</font></U></p>
      <p><b>Father's Name / पिता का नाम:</b> <U><font size=6>${rec.fatherName || ""}</font></U></p>
      <p><b>Mother's Name / माता का नाम:</b> <U><font size=6>${rec.motherName || ""}</font></U></p>
      <p><b>Spouse's Name / पति/पत्नी का नाम:</b> <U><font size=6>${rec.spouseName || ""}</font></U></p>
      <p><b>Address / पता:</b> <U><font size=6>${rec.address || ""}</font></U></p>
      <p><b>Cause of Death / मृत्यु का कारण:</b> <U><font size=6>${rec.causeOfDeath || ""}</font></U></p>
      <p><b>Age at Death / मृत्यु के समय आयु:</b> <U><font size=6>${rec.age || ""}</font></U></p>
      <p><b>Minister's Name / मंत्री का नाम:</b> <U><font size=6>${rec.minister || ""}</font></U></p>

      <hr>
      <div style="display:flex; justify-content:space-between; margin-top:30px;">
        <br><br>
        <div>Parochial Seal <br> पेरोकियल सील</div>
        <div>Date / दिनांक</div>
        <div>Father-in-charge <br> प्रभारी फादर</div>
      </div>
      <script>window.print();<\/script>
    </body></html>
  `);
  w.document.close();
}

renderResults();
