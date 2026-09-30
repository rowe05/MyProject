/* ============================================================
   app.js
   ------------------------------------------------------------
   Application start-up.
   This file connects the other modules to the page:
   it decides which page is open and attaches the event listeners.

   Every page has an attribute on its <body> tag, for example:
       <body data-page="patients">
   ============================================================ */

/* ------------------------------------------------------------
   SAMPLE DATA (for demonstration and testing only)
   ------------------------------------------------------------
   These are fictional records. No real patient information is used.
   ------------------------------------------------------------ */

const SAMPLE_PATIENTS = [
  {
    id: "P001",
    fullName: "Juan Dela Cruz",
    age: 21,
    gender: "Male",
    contact: "09123456789",
    address: "Tagum City, Davao del Norte",
    dateOfBirth: "2005-01-15",
    medicalConcern: "General Consultation"
  },
  {
    id: "P002",
    fullName: "Maria Santos",
    age: 34,
    gender: "Female",
    contact: "09987654321",
    address: "Panabo City, Davao del Norte",
    dateOfBirth: "1992-06-02",
    medicalConcern: "Follow-up Check-up"
  },
  {
    id: "P003",
    fullName: "Pedro Reyes",
    age: 45,
    gender: "Male",
    contact: "09221234567",
    address: "Davao City, Davao del Sur",
    dateOfBirth: "1981-03-28",
    medicalConcern: "Routine Blood Pressure Monitoring"
  }
];

const SAMPLE_APPOINTMENTS = [
  {
    id: "A001",
    patientId: "P001",
    date: "2026-10-05",
    time: "09:00",
    doctor: "Dr. Santos",
    reason: "General Consultation",
    status: "Scheduled"
  },
  {
    id: "A002",
    patientId: "P002",
    date: "2026-10-06",
    time: "13:30",
    doctor: "Dr. Lim",
    reason: "Follow-up Check-up",
    status: "Completed"
  },
  {
    id: "A003",
    patientId: "P003",
    date: "2026-10-07",
    time: "10:15",
    doctor: "Dr. Garcia",
    reason: "Blood Pressure Monitoring",
    status: "Scheduled"
  }
];

/**
 * Loads the sample records into LocalStorage.
 * Existing records are replaced, so the user is asked to confirm first.
 */
function loadSampleData() {
  const confirmed = window.confirm(
    "Load sample data?\nThis will replace the patients and appointments currently saved."
  );
  if (!confirmed) {
    return;
  }

  localStorage.setItem("patients", JSON.stringify(SAMPLE_PATIENTS));
  localStorage.setItem("appointments", JSON.stringify(SAMPLE_APPOINTMENTS));

  showMessage("Sample data loaded. The dashboard has been updated.", "success");
  renderDashboard();
}

/**
 * Removes every saved record from LocalStorage.
 */
function clearAllData() {
  const confirmed = window.confirm(
    "Clear all data?\nAll saved patients and appointments will be removed."
  );
  if (!confirmed) {
    return;
  }

  localStorage.removeItem("patients");
  localStorage.removeItem("appointments");

  showMessage("All saved data has been cleared.", "warning");
  renderDashboard();
}

/* ------------------------------------------------------------
   PAGE SET-UP FUNCTIONS
   ------------------------------------------------------------ */

/** Dashboard page (index.html) */
function setupDashboardPage() {
  renderDashboard();

  const loadButton = document.getElementById("loadSampleDataButton");
  if (loadButton) {
    loadButton.addEventListener("click", loadSampleData);
  }

  const clearButton = document.getElementById("clearDataButton");
  if (clearButton) {
    clearButton.addEventListener("click", clearAllData);
  }
}

/** Patients page (patients.html) */
function setupPatientsPage() {
  initPatientsPage();

  const form = document.getElementById("patientForm");
  if (form) {
    form.addEventListener("submit", handlePatientFormSubmit);
  }

  const resetButton = document.getElementById("resetPatientFormButton");
  if (resetButton) {
    resetButton.addEventListener("click", function () {
      resetPatientForm();
      clearMessage();
    });
  }

  const searchInput = document.getElementById("patientSearchInput");
  if (searchInput) {
    searchInput.addEventListener("input", handlePatientSearchInput);
  }

  const clearSearchButton = document.getElementById("clearSearchButton");
  if (clearSearchButton) {
    clearSearchButton.addEventListener("click", handleClearSearch);
  }

  const tableBody = document.getElementById("patientTableBody");
  if (tableBody) {
    tableBody.addEventListener("click", handlePatientTableClick);
  }
}

/** Appointments page (appointments.html) */
function setupAppointmentsPage() {
  initAppointmentsPage();

  const form = document.getElementById("appointmentForm");
  if (form) {
    form.addEventListener("submit", handleAppointmentFormSubmit);
  }

  const resetButton = document.getElementById("resetAppointmentFormButton");
  if (resetButton) {
    resetButton.addEventListener("click", function () {
      resetAppointmentForm();
      clearMessage();
    });
  }

  const statusFilter = document.getElementById("statusFilterSelect");
  if (statusFilter) {
    statusFilter.addEventListener("change", handleStatusFilterChange);
  }

  const tableBody = document.getElementById("appointmentTableBody");
  if (tableBody) {
    tableBody.addEventListener("change", handleAppointmentStatusChange);
  }
}

/* ------------------------------------------------------------
   START THE APPLICATION
   ------------------------------------------------------------ */

document.addEventListener("DOMContentLoaded", function () {
  const page = document.body.getAttribute("data-page");

  if (page === "dashboard") {
    setupDashboardPage();
  } else if (page === "patients") {
    setupPatientsPage();
  } else if (page === "appointments") {
    setupAppointmentsPage();
  }
});