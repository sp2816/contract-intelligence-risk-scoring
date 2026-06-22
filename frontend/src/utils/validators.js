/**
 * validators.js
 * Pure client-side validation helpers.
 * Each returns an error string or empty string (no error).
 */

// ─── Primitives ──────────────────────────────────────────────────────────────

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function validateEmail(value) {
  const v = (value ?? '').trim()
  if (!v) return 'Email address is required.'
  if (!EMAIL_RE.test(v)) return 'Please enter a valid email address.'
  return ''
}

export function validatePassword(value) {
  const v = value ?? ''
  if (!v) return 'Password is required.'
  if (v.length < 8) return 'Password must be at least 8 characters.'
  return ''
}

export function validateFullName(value) {
  const v = (value ?? '').trim()
  if (!v) return 'Full name is required.'
  if (v.length < 2) return 'Name must be at least 2 characters.'
  return ''
}

export function validateOrganization(value) {
  const v = (value ?? '').trim()
  if (!v) return 'Organization name is required.'
  return ''
}

export function validateConfirmPassword(password, confirmPassword) {
  if (!confirmPassword) return 'Please confirm your password.'
  if (password !== confirmPassword) return 'Passwords do not match.'
  return ''
}

export function validateTermsAccepted(accepted) {
  return accepted ? '' : 'You must agree to the terms and conditions.'
}

// ─── Password strength ─────────────────────────────────────────────────────

export function getPasswordStrength(password) {
  const checks = {
    minLength: (password ?? '').length >= 10,
    uppercase: /[A-Z]/.test(password ?? ''),
    lowercase: /[a-z]/.test(password ?? ''),
    number: /\d/.test(password ?? ''),
    symbol: /[^A-Za-z0-9]/.test(password ?? ''),
  }
  const passed = Object.values(checks).filter(Boolean).length
  return { checks, score: passed, maxScore: 5 }
}

// ─── Composite validators ────────────────────────────────────────────────────

/**
 * Validate a login form. Returns { isValid, errors }.
 * `errors` is a map of field → error message (only for fields with errors).
 */
export function validateLoginForm({ email, password }) {
  const errors = {}

  const emailErr = validateEmail(email)
  if (emailErr) errors.email = emailErr

  const passErr = validatePassword(password)
  if (passErr) errors.password = passErr

  return { isValid: Object.keys(errors).length === 0, errors }
}

/**
 * Validate a registration form. Returns { isValid, errors }.
 */
export function validateRegisterForm({
  fullName,
  email,
  organization,
  password,
  confirmPassword,
  acceptedTerms,
}) {
  const errors = {}

  const nameErr = validateFullName(fullName)
  if (nameErr) errors.fullName = nameErr

  const emailErr = validateEmail(email)
  if (emailErr) errors.email = emailErr

  const orgErr = validateOrganization(organization)
  if (orgErr) errors.organization = orgErr

  const passErr = validatePassword(password)
  if (passErr) errors.password = passErr

  // Extra strength enforcement for registration
  if (!passErr && password.length < 10) {
    errors.password = 'Password must be at least 10 characters for registration.'
  }

  const confirmErr = validateConfirmPassword(password, confirmPassword)
  if (confirmErr) errors.confirmPassword = confirmErr

  const termsErr = validateTermsAccepted(acceptedTerms)
  if (termsErr) errors.terms = termsErr

  return { isValid: Object.keys(errors).length === 0, errors }
}

// ─── File upload validation ─────────────────────────────────────────────────

const ALLOWED_CONTRACT_EXTENSIONS = ['pdf', 'docx', 'doc', 'txt']
const MAX_CONTRACT_FILE_SIZE = 15 * 1024 * 1024 // 15 MB

/**
 * Validate a contract file before uploading.
 * @param {File|null} file
 * @returns {{ isValid: boolean, error: string }}
 */
export function validateContractFile(file) {
  if (!file) {
    return { isValid: false, error: 'No file selected.' }
  }

  // Extension check
  const ext = file.name.split('.').pop()?.toLowerCase()
  if (!ext || !ALLOWED_CONTRACT_EXTENSIONS.includes(ext)) {
    return {
      isValid: false,
      error: `Unsupported file type: .${ext || '(none)'}. Allowed: ${ALLOWED_CONTRACT_EXTENSIONS.join(', ')}.`,
    }
  }

  // Size check
  if (file.size > MAX_CONTRACT_FILE_SIZE) {
    const maxMB = MAX_CONTRACT_FILE_SIZE / (1024 * 1024)
    const fileMB = (file.size / (1024 * 1024)).toFixed(1)
    return {
      isValid: false,
      error: `File exceeds the ${maxMB} MB limit (${fileMB} MB).`,
    }
  }

  // Empty file check
  if (file.size === 0) {
    return { isValid: false, error: 'Uploaded file is empty.' }
  }

  return { isValid: true, error: '' }
}
