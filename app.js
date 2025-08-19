// --- Utility Functions ---
function getData(key) {
  return JSON.parse(localStorage.getItem(key)) || [];
}
function saveData(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

// --- Add Patient ---
function addPatient() {
  const name = document.getElementById("name").value.trim();
  const age = document.getElementById("age").value.trim();
  const priority = document.getElementById("priority").value;

  if (!name || !age) {
    alert("Please enter patient details.");
    return;
  }

  const patient = { 
    name, 
    age, 
    priority, 
    dateAdded: new Date().toLocaleString() 
  };

  if (priority === "emergency") {
    let emergency = getData("emergency");
    emergency.push(patient);
    saveData("emergency", emergency);
  } else {
    let normal = getData("normal");
    normal.push(patient);
    saveData("normal", normal);
  }

  alert("Patient Added Successfully ✅");
  document.getElementById("name").value = "";
  document.getElementById("age").value = "";
  displayQueues();
  displayHistory();
}

// --- Serve Next Patient ---
function servePatient() {
  let emergency = getData("emergency");
  let normal = getData("normal");
  let history = getData("history");

  let served = null;

  if (emergency.length > 0) {
    served = emergency.shift();
    saveData("emergency", emergency);
  } else if (normal.length > 0) {
    served = normal.shift();
    saveData("normal", normal);
  }

  if (served) {
    served.servedAt = new Date().toLocaleString(); // Add served time
    history.unshift(served);
    saveData("history", history);
    displayQueues();
    displayHistory();
  } else {
    alert("No patients in queue.");
  }
}

// --- Delete Patient (only for queues) ---
function deletePatient(type, index) {
  let data = getData(type);
  if (index >= 0 && index < data.length) {
    data.splice(index, 1);
    saveData(type, data);
    displayQueues();
    displayHistory();
    alert("Patient Deleted ❌");
  }
}

// --- Clear All Patients (only for queues) ---
function clearAll(type) {
  if (confirm(`Are you sure you want to clear all patients from ${type}?`)) {
    saveData(type, []);
    displayQueues();
    displayHistory();
    alert(`${type} cleared 🗑️`);
  }
}

// --- Display Queues ---
function displayQueues() {
  const emergencyQueue = document.getElementById("emergencyQueue");
  const normalQueue = document.getElementById("normalQueue");

  if (emergencyQueue) {
    let emergency = getData("emergency");
    emergencyQueue.innerHTML =
      emergency.map((p, i) =>
        `<li class="p-2 bg-red-100 rounded flex justify-between items-center">
          <span>${p.name}, Age: ${p.age} <br><small>Added: ${p.dateAdded}</small></span>
          <button onclick="deletePatient('emergency', ${i})" class="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600">Delete</button>
        </li>`
      ).join("") +
      (emergency.length > 0
        ? `<button onclick="clearAll('emergency')" class="mt-2 bg-gray-700 text-white px-3 py-1 rounded hover:bg-gray-800">Clear All</button>`
        : "<li class='text-gray-500'>No patients</li>");
  }

  if (normalQueue) {
    let normal = getData("normal");
    normalQueue.innerHTML =
      normal.map((p, i) =>
        `<li class="p-2 bg-blue-100 rounded flex justify-between items-center">
          <span>${p.name}, Age: ${p.age} <br><small>Added: ${p.dateAdded}</small></span>
          <button onclick="deletePatient('normal', ${i})" class="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600">Delete</button>
        </li>`
      ).join("") +
      (normal.length > 0
        ? `<button onclick="clearAll('normal')" class="mt-2 bg-gray-700 text-white px-3 py-1 rounded hover:bg-gray-800">Clear All</button>`
        : "<li class='text-gray-500'>No patients</li>");
  }
}

// --- Display History (NO DELETE option) ---
function displayHistory() {
  const historyList = document.getElementById("history");
  if (historyList) {
    let history = getData("history");
    historyList.innerHTML =
      history.map((p, i) =>
        `<li class="p-2 bg-green-100 rounded">
          ${i + 1}. ${p.name}, Age: ${p.age}, Priority: ${p.priority} <br>
          <small>Added: ${p.dateAdded} | Served: ${p.servedAt || "Not served"}</small>
        </li>`
      ).join("") ||
      "<li class='text-gray-500'>No history yet</li>";
  }
}

// --- Search Patients ---
function searchPatients() {
  const query = document.getElementById("searchInput").value.trim().toLowerCase();
  const resultsList = document.getElementById("searchResults");

  if (!resultsList) return;
  if (!query) {
    resultsList.innerHTML = "<li class='text-gray-500'>Please enter a name.</li>";
    return;
  }

  let emergency = getData("emergency");
  let normal = getData("normal");
  let history = getData("history");

  let allPatients = [
    ...emergency.map(p => ({ ...p, location: "Emergency Queue" })),
    ...normal.map(p => ({ ...p, location: "Normal Queue" })),
    ...history.map(p => ({ ...p, location: "History" }))
  ];

  let matches = allPatients.filter(p => p.name.toLowerCase().includes(query));

  if (matches.length === 0) {
    resultsList.innerHTML = "<li class='text-red-500'>No matching patient found.</li>";
    return;
  }

  resultsList.innerHTML = matches.map(p =>
    `<li class="p-2 bg-yellow-100 rounded">
      ${p.name}, Age: ${p.age}, Priority: ${p.priority} <br>
      <small>Added: ${p.dateAdded}${p.servedAt ? " | Served: " + p.servedAt : ""}</small>
      → <span class="italic">${p.location}</span>
    </li>`
  ).join("");
}

