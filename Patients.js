/* ============================================================
   patients.js
   ------------------------------------------------------------
   Patient features:
     - reading the registration form
     - saving a new patient
     - refreshing the patient table
     - searching patient records
     - viewing and deleting a patient
   ============================================================ */

/* Holds the current search keyword so the table can be redrawn
   without losing what the user typed. */
let currentPatientSearch = "";

/* ------------------------------------------------------------
   FORM HANDLING
   ------------------------------------------------------------ */

/**
 * Reads the values typed into the patient registration form
 * and returns them as a patient object.
 */
function readPatientForm() {
  const form = document.getElementById("patientForm");

  return {
    id: form.elements["patientId"].value.trim(),
    fullName: form.elements["fullName"].value.trim(),
    age: form.elements["age"].value.trim(),
    gender: form.elements["gender"].value,
    contact: form.elements["contact"].value.trim(),
    address: form.elements["address"].value.trim(),
    dateOfBirth: form.elements["dateOfBirth"].value,
    medicalConcern: form.elements["medicalConcern"].value.trim()
  };
}

/**
 * Runs when the registration form is submitted.
 * Validates first, saves only when everything is correct.
 */
function handlePatientFormSubmit(event) {
  event.preventDefault();

  clearMessage();
  clearFieldErrors("patientForm");

  const patient = readPatientForm();
  const result = validatePatientForm(patient);

  // Something is wrong -> show the errors and stop here.
  if (!result.valid) {
    showFieldErrors("patientForm", result.errors);
    showMessage("Please correct the highlighted fields before saving.", "danger");
    return;
  }

  // Store the age as a real number instead of text.
  patient.age = Number(patient.age);

  const saved = addPatient(patient);

  if (!saved) {
    showMessage("The patient could not be saved. Please try again.", "danger");
    return;
  }

  showMessage(
    "Patient " + patient.fullName + " (" + patient.id + ") was registered successfully.",
    "success"
  );

  resetPatientForm();
  refreshPatientTable();
}

/**
 * Clears the form and prepares the next patient ID.
 */
function resetPatientForm() {
  const form = document.getElementById("patientForm");
  if (!form) {
    return;
  }

  form.reset();
  clearFieldErrors("patientForm");
  form.elements["patientId"].value = generatePatientId();
}

/* ------------------------------------------------------------
   TABLE AND SEARCH
   ------------------------------------------------------------ */

/**
 * Redraws the patient table using the current search keyword.
 */
function refreshPatientTable() {
  const patients = searchPatients(currentPatientSearch);
  renderPatientTable(patients);

  // A search that found nothing gets its own message.
  const noResultMessage = document.getElementById("noSearchResultMessage");
  if (noResultMessage) {
    const searching = currentPatientSearch !== "";
    if (searching && patients.length === 0) {
      noResultMessage.classList.remove("d-none");
    } else {
      noResultMessage.classList.add("d-none");
    }
  }

  // Hide the plain "no patients yet" state while a search is active.
  const emptyMessage = document.getElementById("patientEmptyMessage");
  if (emptyMessage && currentPatientSearch !== "") {
    emptyMessage.classList.add("d-none");
  }
}

/**
 * Returns the patients that match a keyword.
 * The keyword is compared against the patient ID, full name and contact number.
 * An empty keyword returns every patient.
 */
function searchPatients(keyword) {
  const patients = getPatients();
  const cleanKeyword = String(keyword || "").trim().toLowerCase();

  if (cleanKeyword === "") {
    return patients;
  }

  return patients.filter(function (patient) {
    const id = String(patient.id).toLowerCase();
    const name = String(patient.fullName).toLowerCase();
    const contact = String(patient.contact).toLowerCase();

    return (
      id.indexOf(cleanKeyword) !== -1 ||
      name.indexOf(cleanKeyword) !== -1 ||
      contact.indexOf(cleanKeyword) !== -1
    );
  });
}

/**
 * Runs whenever the user types in the search box.
 */
function handlePatientSearchInput(event) {
  currentPatientSearch = event.target.value;
  refreshPatientTable();
}

/**
 * Clears the search box and shows all patients again.
 */
function handleClearSearch() {
  const searchInput = document.getElementById("patientSearchInput");
  if (searchInput) {
    searchInput.value = "";
  }
  currentPatientSearch = "";
  refreshPatientTable();
}

/* ------------------------------------------------------------
   ROW ACTIONS (View / Delete)
   ------------------------------------------------------------ */

/**
 * Handles clicks inside the patient table.
 * One listener covers every row (this is called event delegation).
 */
function handlePatientTableClick(event) {
  const button = event.target.closest("button[data-action]");
  if (!button) {
    return;
  }

  const action = button.getAttribute("data-action");
  const patientId = button.getAttribute("data-id");

  if (action === "view-patient") {
    const patient = getPatientById(patientId);
    if (patient) {
      showPatientDetails(patient);
    } else {
      showMessage("That patient record could not be found.", "danger");
    }
  }

  if (action === "delete-patient") {
    removePatient(patientId);
  }
}

/**
 * Deletes a patient after asking the user to confirm.
 * Appointments that belong to the patient are removed as well,
 * so the appointment list never points to a missing patient.
 */
function removePatient(patientId) {
  const patient = getPatientById(patientId);
  if (!patient) {
    return;
  }

  const confirmed = window.confirm(
    "Delete patient " + patient.fullName + " (" + patient.id + ")?\n" +
    "Appointments linked to this patient will also be removed."
  );

  if (!confirmed) {
    return;
  }

  // Remove the appointments of this patient first.
  getAppointments().forEach(function (appointment) {
    if (appointment.patientId === patientId) {
      deleteAppointment(appointment.id);
    }
  });

  deletePatient(patientId);

  showMessage("Patient " + patient.id + " was deleted.", "warning");
  refreshPatientTable();
}

/* ------------------------------------------------------------
   PAGE START-UP
   ------------------------------------------------------------ */

/**
 * Prepares the patients page when it opens.
 */
function initPatientsPage() {
  const form = document.getElementById("patientForm");
  if (form) {
    form.elements["patientId"].value = generatePatientId();
  }
  refreshPatientTable();
}