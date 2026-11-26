export function validateVendorRegistration({ company, email }) {
  const errors = {}
  const trimmedCompany = company.trim()
  const trimmedEmail = email.trim()

  if (!trimmedCompany) {
    errors.company = 'Company name is required.'
  }

  if (!trimmedEmail) {
    errors.email = 'Vendor email is required.'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
    errors.email = 'Enter a valid email address.'
  }

  return errors
}
