/* ============================================================
   ui.js
   ------------------------------------------------------------
   Everything that draws something on the screen lives here:
     - feedback messages (success / error alerts)
     - Bootstrap validation styling on form fields
     - patient table rendering
     - appointment table rendering
     - dashboard summary cards
   ============================================================ */

/* ------------------------------------------------------------
   SMALL HELPERS
   ------------------------------------------------------------ */

/**
 * Escapes text so that user input cannot break the HTML layout.
 * Example: "<b>" becomes "&lt;b&gt;"
 */
function escapeHtml(text) {
  if (text === null || text === undefined) {
    return "";
  }
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Turns "2026-10-05" into "Oct 05, 2026" for nicer display.
 * If the date cannot be read, the original text is returned.
 */
function formatDate(dateText) {
  if (!dateText) {
    return "";
  }
  const dateValue = new Date(dateText);
  if (isNaN(dateValue.getTime())) {
    return dateText;
  }
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const day = String(dateValue.getDate()).padStart(2, "0");
  return monthNames[dateValue.getMonth()] + " " + day + ", " + dateValue.getFullYear();
}

/**
 * Turns "14:30" into "2:30 PM".
 */
function formatTime(timeText) {
  if (!timeText) {
    return "";
  }
  const parts = String(timeText).split(":");
  let hour = parseInt(parts[0], 10);
  const minute = parts[1] || "00";

  if (isNaN(hour)) {
    return timeText;
  }

  const period = hour >= 12 ? "PM" : "AM";
  hour = hour % 12;
  if (hour === 0) {
    hour = 12;
  }
  return hour + ":" + minute + " " + period;
}

/** Returns the Bootstrap badge class that matches an appointment status. */
function getStatusBadgeClass(status) {
  if (status === "Completed") {
    return "badge-status badge-completed";
  }
  if (status === "Cancelled") {
    return "badge-status badge-cancelled";
  }
  return "badge-status badge-scheduled";
}

/* ------------------------------------------------------------
   FEEDBACK MESSAGES
   ------------------------------------------------------------ */

/**
 * Shows a coloured message box inside the element with id "alertArea".
 * type can be "success", "danger", "warning" or "info".
 */
function showMessage(message, type) {
  const alertArea = document.getElementById("alertArea");
  if (!alertArea) {
    return;
  }

  const alertType = type || "success";
  const icon = alertType === "success" ? "&#10004;" : "&#9888;";

  alertArea.innerHTML =
    '<div class="alert alert-' + alertType + ' alert-dismissible fade show" role="alert">' +
      '<span class="alert-icon">' + icon + "</span> " +
      escapeHtml(message) +
      '<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>' +
    "</div>";

  // Bring the message into view so the user notices it.
  alertArea.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

/** Removes any message currently shown. */
function clearMessage() {
  const alertArea = document.getElementById("alertArea");
  if (alertArea) {
    alertArea.innerHTML = "";
  }
}

/* ------------------------------------------------------------
   FORM VALIDATION STYLING (Bootstrap classes)
   ------------------------------------------------------------ */

/**
 * Removes all red/green validation styling from one form.
 */
function clearFieldErrors(formId) {
  const form = document.getElementById(formId);
  if (!form) {
    return;
  }

  const fields = form.querySelectorAll(".form-control, .form-select");
  fields.forEach(function (field) {
    field.classList.remove("is-invalid");
    field.classList.remove("is-valid");
  });

  const messages = form.querySelectorAll(".invalid-feedback");
  messages.forEach(function (messageBox) {
    messageBox.textContent = "";
  });
}

/**
 * Paints the invalid fields red and writes the error message under each one.
 * "errors" looks like { fullName: "Full name is required.", age: "..." }
 */
function showFieldErrors(formId, errors) {
  const form = document.getElementById(formId);
  if (!form) {
    return;
  }

  Object.keys(errors).forEach(function (fieldName) {
    const field = form.querySelector('[name="' + fieldName + '"]');
    if (!field) {
      return;
    }

    field.classList.remove("is-valid");
    field.classList.add("is-invalid");

    const messageBox = form.querySelector('[data-error-for="' + fieldName + '"]');
    if (messageBox) {
      messageBox.textContent = errors[fieldName];
    }
  });

  // Move the cursor to the first field that has a problem.
  const firstFieldName = Object.keys(errors)[0];
  const firstField = form.querySelector('[name="' + firstFieldName + '"]');
  if (firstField) {
    firstField.focus();
  }
}

/** Marks every field of a form as valid (green) after a successful save. */
function markFormValid(formId) {
  const form = document.getElementById(formId);
  if (!form) {
    return;
  }
  const fields = form.querySelectorAll(".form-control, .form-select");
  fields.forEach(function (field) {
    field.classList.remove("is-invalid");
  });
}

/* ------------------------------------------------------------
   PATIENT TABLE
   ------------------------------------------------------------ */

/**
 * Draws the patient table.
 * "patients" is the list to display (it may be a filtered search result).
 */
function renderPatientTable(patients) {
  const tableBody = document.getElementById("patientTableBody");
  const emptyMessage = document.getElementById("patientEmptyMessage");
  const countLabel = document.getElementById("patientCountLabel");

  if (!tableBody) {
    return;
  }

  tableBody.innerHTML = "";

  if (countLabel) {
    countLabel.textContent =
      patients.length + (patients.length === 1 ? " record" : " records");
  }

  // Nothing to show -> display the empty state instead of the table rows.
  if (patients.length === 0) {
    if (emptyMessage) {
      emptyMessage.classList.remove("d-none");
    }
    return;
  }

  if (emptyMessage) {
    emptyMessage.classList.add("d-none");
  }

  patients.forEach(function (patient) {
    const row = document.createElement("tr");
    row.innerHTML =
      "<td><span class='id-chip'>" + escapeHtml(patient.id) + "</span></td>" +
      "<td class='fw-semibold'>" + escapeHtml(patient.fullName) + "</td>" +
      "<td>" + escapeHtml(patient.age) + "</td>" +
      "<td>" + escapeHtml(patient.gender) + "</td>" +
      "<td>" + escapeHtml(patient.contact) + "</td>" +
      "<td class='text-end'>" +
        "<button type='button' class='btn btn-sm btn-outline-brand me-1' " +
          "data-action='view-patient' data-id='" + escapeHtml(patient.id) + "'>View</button>" +
        "<button type='button' class='btn btn-sm btn-outline-danger' " +
          "data-action='delete-patient' data-id='" + escapeHtml(patient.id) + "'>Delete</button>" +
      "</td>";
    tableBody.appendChild(row);
  });
}

/**
 * Fills and opens the "patient details" modal window.
 */
function showPatientDetails(patient) {
  const detailBody = document.getElementById("patientDetailBody");
  if (!detailBody || !patient) {
    return;
  }

  // Count how many appointments this patient has.
  const relatedAppointments = getAppointments().filter(function (appointment) {
    return appointment.patientId === patient.id;
  });

  detailBody.innerHTML =
    "<div class='detail-grid'>" +
      detailRow("Patient ID", patient.id) +
      detailRow("Full Name", patient.fullName) +
      detailRow("Age", patient.age) +
      detailRow("Gender", patient.gender) +
      detailRow("Contact Number", patient.contact) +
      detailRow("Date of Birth", formatDate(patient.dateOfBirth)) +
      detailRow("Address", patient.address) +
      detailRow("Medical Concern", patient.medicalConcern) +
      detailRow("Appointments", relatedAppointments.length) +
    "</div>";

  const modalElement = document.getElementById("patientDetailModal");
  if (modalElement && window.bootstrap) {
    const modal = bootstrap.Modal.getOrCreateInstance(modalElement);
    modal.show();
  }
}

/** Builds one label/value pair for the details modal. */
function detailRow(label, value) {
  return (
    "<div class='detail-item'>" +
      "<span class='detail-label'>" + escapeHtml(label) + "</span>" +
      "<span class='detail-value'>" + escapeHtml(value) + "</span>" +
    "</div>"
  );
}

/* ------------------------------------------------------------
   APPOINTMENT TABLE
   ------------------------------------------------------------ */

/**
 * Draws the appointment table.
 * The patient name is looked up from the patient records using patientId.
 */
function renderAppointmentTable(appointments) {
  const tableBody = document.getElementById("appointmentTableBody");
  const emptyMessage = document.getElementById("appointmentEmptyMessage");
  const countLabel = document.getElementById("appointmentCountLabel");

  if (!tableBody) {
    return;
  }

  tableBody.innerHTML = "";

  if (countLabel) {
    countLabel.textContent =
      appointments.length + (appointments.length === 1 ? " appointment" : " appointments");
  }

  if (appointments.length === 0) {
    if (emptyMessage) {
      emptyMessage.classList.remove("d-none");
    }
    return;
  }

  if (emptyMessage) {
    emptyMessage.classList.add("d-none");
  }

  appointments.forEach(function (appointment) {
    const patient = getPatientById(appointment.patientId);
    const patientName = patient ? patient.fullName : "Unknown patient";

    const row = document.createElement("tr");
    row.innerHTML =
      "<td><span class='id-chip'>" + escapeHtml(appointment.id) + "</span></td>" +
      "<td class='fw-semibold'>" + escapeHtml(patientName) +
        "<div class='small text-muted'>" + escapeHtml(appointment.patientId) + "</div></td>" +
      "<td class='nowrap'>" + escapeHtml(formatDate(appointment.date)) + "</td>" +
      "<td class='nowrap'>" + escapeHtml(formatTime(appointment.time)) + "</td>" +
      "<td>" + escapeHtml(appointment.doctor) + "</td>" +
      "<td>" + escapeHtml(appointment.reason) + "</td>" +
      "<td><span class='" + getStatusBadgeClass(appointment.status) + "'>" +
        escapeHtml(appointment.status) + "</span></td>" +
      "<td class='text-end'>" +
        "<select class='form-select form-select-sm status-select' " +
          "data-action='change-status' data-id='" + escapeHtml(appointment.id) + "' " +
          "aria-label='Update status for " + escapeHtml(appointment.id) + "'>" +
          buildStatusOptions(appointment.status) +
        "</select>" +
      "</td>";
    tableBody.appendChild(row);
  });
}

/** Builds the <option> list for the status dropdown, pre-selecting the current status. */
function buildStatusOptions(currentStatus) {
  const statuses = ["Scheduled", "Completed", "Cancelled"];
  let html = "";

  statuses.forEach(function (status) {
    const selected = status === currentStatus ? " selected" : "";
    html += "<option value='" + status + "'" + selected + ">" + status + "</option>";
  });

  return html;
}

/**
 * Fills the "Patient" dropdown on the appointment form with saved patients.
 */
function renderPatientOptions(selectElementId) {
  const select = document.getElementById(selectElementId);
  if (!select) {
    return;
  }

  const patients = getPatients();
  let html = "<option value=''>-- Select a patient --</option>";

  patients.forEach(function (patient) {
    html +=
      "<option value='" + escapeHtml(patient.id) + "'>" +
        escapeHtml(patient.id) + " - " + escapeHtml(patient.fullName) +
      "</option>";
  });

  select.innerHTML = html;

  // Warn the user when there is no patient to schedule for.
  const hint = document.getElementById("noPatientHint");
  if (hint) {
    if (patients.length === 0) {
      hint.classList.remove("d-none");
    } else {
      hint.classList.add("d-none");
    }
  }
}

/* ------------------------------------------------------------
   DASHBOARD
   ------------------------------------------------------------ */

/**
 * Updates the four summary cards and the recent appointment table
 * using whatever is currently stored in LocalStorage.
 */
function renderDashboard() {
  const patients = getPatients();
  const appointments = getAppointments();

  const scheduledCount = appointments.filter(function (appointment) {
    return appointment.status === "Scheduled";
  }).length;

  const completedCount = appointments.filter(function (appointment) {
    return appointment.status === "Completed";
  }).length;

  setTextIfPresent("totalPatients", patients.length);
  setTextIfPresent("totalAppointments", appointments.length);
  setTextIfPresent("scheduledAppointments", scheduledCount);
  setTextIfPresent("completedAppointments", completedCount);

  renderRecentAppointments(appointments);
}

/** Writes a value into an element only if that element exists on the page. */
function setTextIfPresent(elementId, value) {
  const element = document.getElementById(elementId);
  if (element) {
    element.textContent = value;
  }
}

/**
 * Shows the five most recently added appointments on the dashboard.
 */
function renderRecentAppointments(appointments) {
  const tableBody = document.getElementById("recentAppointmentsBody");
  const emptyMessage = document.getElementById("recentEmptyMessage");

  if (!tableBody) {
    return;
  }

  tableBody.innerHTML = "";

  // The newest records are at the end of the array, so copy and reverse it.
  const recent = appointments.slice().reverse().slice(0, 5);

  if (recent.length === 0) {
    if (emptyMessage) {
      emptyMessage.classList.remove("d-none");
    }
    return;
  }

  if (emptyMessage) {
    emptyMessage.classList.add("d-none");
  }

  recent.forEach(function (appointment) {
    const patient = getPatientById(appointment.patientId);
    const patientName = patient ? patient.fullName : "Unknown patient";

    const row = document.createElement("tr");
    row.innerHTML =
      "<td><span class='id-chip'>" + escapeHtml(appointment.id) + "</span></td>" +
      "<td class='fw-semibold'>" + escapeHtml(patientName) + "</td>" +
      "<td class='nowrap'>" + escapeHtml(formatDate(appointment.date)) + "</td>" +
      "<td class='nowrap'>" + escapeHtml(formatTime(appointment.time)) + "</td>" +
      "<td>" + escapeHtml(appointment.doctor) + "</td>" +
      "<td><span class='" + getStatusBadgeClass(appointment.status) + "'>" +
        escapeHtml(appointment.status) + "</span></td>";
    tableBody.appendChild(row);
  });
}