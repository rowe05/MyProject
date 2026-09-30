/* ============================================================
   validation.js
   ------------------------------------------------------------
   Reusable client-side validation functions.

   Every validator returns an object shaped like:
     { valid: true }                          -> input is fine
     { valid: false, message: "reason..." }   -> input is wrong

   The form validators return:
     { valid: false, errors: { fieldName: "message", ... } }
   ============================================================ */

/* ------------------------------------------------------------
   SMALL SINGLE-FIELD VALIDATORS
   ------------------------------------------------------------ */

/** Text must not be empty or only spaces. */
function validateRequiredText(value, fieldLabel) {
  if (value === null || value === undefined || String(value).trim() === "") {
    return { valid: false, message: fieldLabel + " is required." };
  }
  return { valid: true };
}

/** Age must be a whole number between 0 and 120. */
function validateAge(value) {
  if (String(value).trim() === "") {
    return { valid: false, message: "Age is required." };
  }

  const age = Number(value);

  if (isNaN(age)) {
    return { valid: false, message: "Age must be a valid number." };
  }
  if (!Number.isInteger(age)) {
    return { valid: false, message: "Age must be a whole number." };
  }
  if (age < 0 || age > 120) {
    return { valid: false, message: "Age must be between 0 and 120." };
  }
  return { valid: true };
}

/** Gender must be one of the allowed choices. */
function validateGender(value) {
  const allowedGenders = ["Male", "Female", "Other"];
  if (!value || allowedGenders.indexOf(value) === -1) {
    return { valid: false, message: "Please select a gender." };
  }
  return { valid: true };
}

/**
 * Contact number must be digits only, 7 to 15 characters long.
 * Spaces and dashes typed by the user are ignored during the check.
 */
function validateContactNumber(value) {
  const cleaned = String(value).trim().replace(/[\s-]/g, "");

  if (cleaned === "") {
    return { valid: false, message: "Contact number is required." };
  }
  if (!/^[0-9]+$/.test(cleaned)) {
    return { valid: false, message: "Contact number must contain digits only." };
  }
  if (cleaned.length < 7 || cleaned.length > 15) {
    return { valid: false, message: "Contact number must be 7 to 15 digits." };
  }
  return { valid: true };
}

/** Date of birth must exist and must not be in the future. */
function validateDateOfBirth(value) {
  if (!value) {
    return { valid: false, message: "Date of birth is required." };
  }

  const chosenDate = new Date(value);
  const today = new Date();

  if (isNaN(chosenDate.getTime())) {
    return { valid: false, message: "Please enter a valid date of birth." };
  }
  if (chosenDate > today) {
    return { valid: false, message: "Date of birth cannot be in the future." };
  }
  return { valid: true };
}

/** Appointment date must be chosen and must be a real date. */
function validateAppointmentDate(value) {
  if (!value) {
    return { valid: false, message: "Appointment date is required." };
  }

  const chosenDate = new Date(value);
  if (isNaN(chosenDate.getTime())) {
    return { valid: false, message: "Please enter a valid appointment date." };
  }
  return { valid: true };
}

/** Appointment time must be chosen. */
function validateAppointmentTime(value) {
  if (!value) {
    return { valid: false, message: "Appointment time is required." };
  }
  return { valid: true };
}

/** The selected patient must already exist in LocalStorage. */
function validatePatientExists(patientId) {
  if (!patientId) {
    return { valid: false, message: "Please select a patient." };
  }
  if (getPatientById(patientId) === null) {
    return { valid: false, message: "The selected patient does not exist." };
  }
  return { valid: true };
}

/** Appointment status must be one of the three allowed values. */
function validateAppointmentStatus(value) {
  const allowedStatuses = ["Scheduled", "Completed", "Cancelled"];
  if (!value || allowedStatuses.indexOf(value) === -1) {
    return { valid: false, message: "Please select an appointment status." };
  }
  return { valid: true };
}

/* ------------------------------------------------------------
   WHOLE-FORM VALIDATORS
   ------------------------------------------------------------ */

/**
 * Checks a complete patient object before it is saved.
 * Returns { valid: true } or { valid: false, errors: {...} }
 */
function validatePatientForm(patient) {
  const errors = {};

  const nameCheck = validateRequiredText(patient.fullName, "Full name");
  if (!nameCheck.valid) {
    errors.fullName = nameCheck.message;
  }

  const ageCheck = validateAge(patient.age);
  if (!ageCheck.valid) {
    errors.age = ageCheck.message;
  }

  const genderCheck = validateGender(patient.gender);
  if (!genderCheck.valid) {
    errors.gender = genderCheck.message;
  }

  const contactCheck = validateContactNumber(patient.contact);
  if (!contactCheck.valid) {
    errors.contact = contactCheck.message;
  }

  const addressCheck = validateRequiredText(patient.address, "Address");
  if (!addressCheck.valid) {
    errors.address = addressCheck.message;
  }

  const birthCheck = validateDateOfBirth(patient.dateOfBirth);
  if (!birthCheck.valid) {
    errors.dateOfBirth = birthCheck.message;
  }

  const concernCheck = validateRequiredText(
    patient.medicalConcern,
    "Medical concern / reason for visit"
  );
  if (!concernCheck.valid) {
    errors.medicalConcern = concernCheck.message;
  }

  const hasErrors = Object.keys(errors).length > 0;
  return hasErrors ? { valid: false, errors: errors } : { valid: true };
}

/**
 * Checks a complete appointment object before it is saved.
 * Returns { valid: true } or { valid: false, errors: {...} }
 */
function validateAppointmentForm(appointment) {
  const errors = {};

  const patientCheck = validatePatientExists(appointment.patientId);
  if (!patientCheck.valid) {
    errors.patientId = patientCheck.message;
  }

  const dateCheck = validateAppointmentDate(appointment.date);
  if (!dateCheck.valid) {
    errors.date = dateCheck.message;
  }

  const timeCheck = validateAppointmentTime(appointment.time);
  if (!timeCheck.valid) {
    errors.time = timeCheck.message;
  }

  const doctorCheck = validateRequiredText(
    appointment.doctor,
    "Doctor / healthcare staff"
  );
  if (!doctorCheck.valid) {
    errors.doctor = doctorCheck.message;
  }

  const reasonCheck = validateRequiredText(
    appointment.reason,
    "Reason for visit"
  );
  if (!reasonCheck.valid) {
    errors.reason = reasonCheck.message;
  }

  const statusCheck = validateAppointmentStatus(appointment.status);
  if (!statusCheck.valid) {
    errors.status = statusCheck.message;
  }

  const hasErrors = Object.keys(errors).length > 0;
  return hasErrors ? { valid: false, errors: errors } : { valid: true };
}