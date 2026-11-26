
import { useEffect, useState } from 'react'
import './VendorRegistrationForm.css'

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'

const MAX_FILE_SIZE = 5 * 1024 * 1024

const allowedFileTypes = [
  'application/pdf',
  'image/jpeg',
  'image/png',
]

const allowedExtensions = ['.pdf', '.jpg', '.jpeg', '.png']

function DocumentPreview({ file, onClose }) {
  const [previewUrl, setPreviewUrl] = useState('')

  useEffect(() => {
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)

    return () => URL.revokeObjectURL(url)
  }, [file])

  const isPdf =
    file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')

  return (
    <div
      className="vendor-document-preview-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <section
        className="vendor-document-preview"
        role="dialog"
        aria-modal="true"
        aria-label={`Preview ${file.name}`}
      >
        <div className="vendor-document-preview-heading">
          <strong>{file.name}</strong>
          <button type="button" onClick={onClose} aria-label="Close preview">
            Close
          </button>
        </div>
        {previewUrl &&
          (isPdf ? (
            <iframe src={previewUrl} title={`Preview of ${file.name}`} />
          ) : (
            <img src={previewUrl} alt={`Preview of ${file.name}`} />
          ))}
      </section>
    </div>
  )
}

const formSections = [
  {
    title: 'Company details',
    fields: [
      { name: 'companyName', label: 'Company Name', required: true },
      { name: 'displayName', label: 'Display Name', required: true },
      { name: 'website', label: 'Website', type: 'url' },
      {
        name: 'currencyCode',
        label: 'Currency Code',
        type: 'select',
        options: ['INR', 'USD', 'AED', 'EUR'],
      },
      {
        name: 'sourceOfSupply',
        label: 'Source Of Supply',
        type: 'select',
        options: [
          'Rajasthan',
          'Gujarat',
          'Maharashtra',
          'Karnataka',
          'Delhi',
          'Other',
        ],
      },
    ],
  },
  {
    title: 'Primary contact',
    fields: [
      {
        name: 'salutation',
        label: 'Salutation',
        type: 'select',
        options: ['Mr.', 'Ms.', 'Mrs.', 'Dr.'],
      },
      { name: 'firstName', label: 'First Name', required: true },
      { name: 'lastName', label: 'Last Name' },
      {
        name: 'email',
        label: 'Email ID',
        type: 'email',
        required: true,
        readOnly: true,
      },
      { name: 'phone', label: 'Phone', type: 'tel' },
      {
        name: 'mobilePhone',
        label: 'Mobile Phone',
        type: 'tel',
        required: true,
      },
      { name: 'department', label: 'Department' },
      { name: 'designation', label: 'Designation' },
    ],
  },
  {
    title: 'Tax details',
    fields: [
      {
        name: 'gstTreatment',
        label: 'GST Treatment',
        type: 'select',
        required: true,
        options: [
          'Registered Business - Regular',
          'Registered Business - Composition',
          'Unregistered Business',
          'Overseas',
        ],
      },
      { name: 'gstin', label: 'GST Identification Number (GSTIN)' },
      { name: 'panNumber', label: 'PAN Number', required: true },
      { name: 'tdsSectionCode', label: 'TDS Section Code' },
      { name: 'exemptionReason', label: 'Exemption Reason' },
    ],
  },
  {
    title: 'Billing address',
    fields: [
      { name: 'billingAttention', label: 'Billing Attention' },
      {
        name: 'billingAddress',
        label: 'Billing Address',
        required: true,
      },
      { name: 'billingStreet2', label: 'Billing Street 2' },
      { name: 'billingCity', label: 'Billing City', required: true },
      { name: 'billingState', label: 'Billing State', required: true },
      { name: 'billingCountry', label: 'Billing Country' },
      {
        name: 'billingCode',
        label: 'Billing PIN Code',
        required: true,
      },
      { name: 'billingPhone', label: 'Billing Phone', type: 'tel' },
    ],
  },
  {
    title: 'Shipping address',
    fields: [
      { name: 'shippingAttention', label: 'Shipping Attention' },
      { name: 'shippingAddress', label: 'Shipping Address' },
      { name: 'shippingCity', label: 'Shipping City' },
      { name: 'shippingState', label: 'Shipping State' },
      { name: 'shippingCountry', label: 'Shipping Country' },
      { name: 'shippingCode', label: 'Shipping PIN Code' },
      { name: 'shippingPhone', label: 'Shipping Phone', type: 'tel' },
    ],
  },
  {
    title: 'Payment & bank',
    fields: [
      {
        name: 'paymentTerms',
        label: 'Payment Terms',
        type: 'select',
        options: [
          'Due on receipt',
          'Net 15',
          'Net 30',
          'Net 45',
          'Net 60',
        ],
      },
      { name: 'bankName', label: 'Bank Name', required: true },
      {
        name: 'bankAccountNumber',
        label: 'Bank Account Number',
        required: true,
      },
      { name: 'beneficiary', label: 'Beneficiary', required: true },
      {
        name: 'routingNumber',
        label: 'IFSC / Routing Number',
        required: true,
      },
      { name: 'notes', label: 'Notes', type: 'textarea' },
    ],
  },
  {
    title: 'Documents',
    fields: [
      {
        name: 'gstCertificate',
        label: 'GST Certificate (PDF, JPG, JPEG, PNG)',
        type: 'file',
        accept: '.pdf,.jpg,.jpeg,.png',
        required: true,
      },
      {
        name: 'panCard',
        label: 'PAN Card (PDF, JPG, JPEG, PNG)',
        type: 'file',
        accept: '.pdf,.jpg,.jpeg,.png',
        required: true,
      },
      {
        name: 'cancelledCheque',
        label: 'Cancelled Cheque (PDF, JPG, JPEG, PNG)',
        type: 'file',
        accept: '.pdf,.jpg,.jpeg,.png',
        required: true,
      },
    ],
  },
]

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]$/
const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/
const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/

const requiredFields = [
  'companyName',
  'displayName',
  'firstName',
  'email',
  'mobilePhone',
  'gstTreatment',
  'panNumber',
  'billingAddress',
  'billingCity',
  'billingState',
  'billingCode',
  'bankName',
  'bankAccountNumber',
  'beneficiary',
  'routingNumber',
  'gstCertificate',
  'panCard',
  'cancelledCheque',
]

const validateField = (name, value) => {
  const val = String(value ?? '').trim()

  if (requiredFields.includes(name) && !val) {
    return 'This field is required.'
  }

  if (!val) return ''

  switch (name) {
    case 'companyName':
    case 'displayName':
    case 'firstName':
    case 'lastName':
    case 'bankName':
    case 'beneficiary':
      if (val.length < 2) {
        return 'Must contain at least 2 characters.'
      }

      if (val.length > 100) {
        return 'Cannot exceed 100 characters.'
      }

      if (!/^[a-zA-Z\s.'&,()-]+$/.test(val)) {
        return 'Please enter valid text.'
      }
      break

    case 'email':
      if (!emailRegex.test(val)) {
        return 'Please enter a valid email address.'
      }
      break

    case 'phone':
    case 'mobilePhone':
    case 'billingPhone':
    case 'shippingPhone': {
      const digits = val.replace(/\D/g, '')

      if (digits.length < 10 || digits.length > 15) {
        return 'Enter a valid phone number (10–15 digits).'
      }
      break
    }

    case 'website':
      try {
        const url = new URL(val)

        if (!['http:', 'https:'].includes(url.protocol)) {
          return 'Enter a valid website URL.'
        }
      } catch {
        return 'Enter a valid URL (e.g. https://example.com).'
      }
      break

    case 'panNumber':
      if (!panRegex.test(val.toUpperCase())) {
        return 'Enter a valid PAN (e.g. ABCDE1234F).'
      }
      break

    case 'gstin':
      if (!gstinRegex.test(val.toUpperCase())) {
        return 'Enter a valid 15-character GSTIN.'
      }
      break

    case 'billingCode':
    case 'shippingCode':
      if (!/^[0-9]{6}$/.test(val)) {
        return 'Enter a valid 6-digit PIN code.'
      }
      break

    case 'bankAccountNumber':
      if (!/^[0-9]{9,18}$/.test(val)) {
        return 'Account number must contain 9–18 digits.'
      }
      break

    case 'routingNumber':
      if (!ifscRegex.test(val.toUpperCase())) {
        return 'Enter a valid 11-character IFSC code.'
      }
      break

    case 'billingAddress':
      if (val.length < 5) {
        return 'Address must contain at least 5 characters.'
      }
      break

    case 'billingCity':
    case 'billingState':
      if (val.length < 2) {
        return 'Enter a valid location.'
      }
      break

    default:
      break
  }

  return ''
}

export default function VendorRegistrationForm({
  token,
  email,
  registrationToken,
}) {
  const [formData, setFormData] = useState({
    email: email || '',
  })

  const [documents, setDocuments] = useState({
    gstCertificate: null,
    panCard: null,
    cancelledCheque: null,
  })
  const [previewDocument, setPreviewDocument] = useState(null)

  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  // Handle text and file inputs
  const handleChange = (e) => {
    const { name, value, type, files } = e.target

    if (type === 'file') {
      const file = files?.[0]

      if (!file) return

      const extension = `.${file.name
        .split('.')
        .pop()
        .toLowerCase()}`

      if (
        !allowedFileTypes.includes(file.type) ||
        !allowedExtensions.includes(extension)
      ) {
        setDocuments((prev) => ({
          ...prev,
          [name]: null,
        }))

        setErrors((prev) => ({
          ...prev,
          [name]: 'Only PDF, JPG, JPEG and PNG files are allowed.',
        }))

        e.target.value = ''
        return
      }

      if (file.size > MAX_FILE_SIZE) {
        setDocuments((prev) => ({
          ...prev,
          [name]: null,
        }))

        setErrors((prev) => ({
          ...prev,
          [name]: 'File size must not exceed 5MB.',
        }))

        e.target.value = ''
        return
      }

      setDocuments((prev) => ({
        ...prev,
        [name]: file,
      }))

      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }))

      setTouched((prev) => ({
        ...prev,
        [name]: true,
      }))

      e.target.value = ''
      return
    }

    let updatedValue = value

    if (['panNumber', 'gstin', 'routingNumber'].includes(name)) {
      updatedValue = value.toUpperCase()
    }

    if (
      [
        'phone',
        'mobilePhone',
        'billingPhone',
        'shippingPhone',
        'billingCode',
        'shippingCode',
        'bankAccountNumber',
      ].includes(name)
    ) {
      updatedValue = value.replace(/\D/g, '')
    }

    setFormData((prev) => ({
      ...prev,
      [name]: updatedValue,
    }))

    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }))

    setErrors((prev) => ({
      ...prev,
      [name]: validateField(name, updatedValue),
    }))
  }

  // Handle blur validation
  const handleBlur = (e) => {
    const { name, value, type } = e.target

    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }))

    if (type === 'file') {
      const file = documents[name]

      setErrors((prev) => ({
        ...prev,
        [name]: file ? '' : 'This field is required.',
      }))

      return
    }

    setErrors((prev) => ({
      ...prev,
      [name]: validateField(name, value),
    }))
  }

  // Validate complete form
  const validateForm = () => {
    const newErrors = {}

    formSections.forEach((section) => {
      section.fields.forEach((field) => {
        if (field.type === 'file') {
          const file = documents[field.name]

          if (field.required && !file) {
            newErrors[field.name] = 'This field is required.'
          }

          return
        }

        const message = validateField(
          field.name,
          formData[field.name]
        )

        if (message) {
          newErrors[field.name] = message
        }
      })
    })

    setErrors(newErrors)

    const allTouched = {}

    formSections.forEach((section) => {
      section.fields.forEach((field) => {
        allTouched[field.name] = true
      })
    })

    setTouched(allTouched)

    return Object.keys(newErrors).length === 0
  }

  // Submit registration
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!validateForm()) {
      setError('Please correct the highlighted fields before submitting.')
      return
    }

    if (!token) {
      setError('Invitation token is missing.')
      return
    }

    if (!registrationToken) {
      setError(
        'Registration authorization is missing. Please verify OTP again.'
      )
      return
    }

    try {
      setSubmitting(true)

      const payload = new FormData()

      // Append registration data
      payload.append(
        'registrationData',
        JSON.stringify(formData)
      )

      // Append documents
      payload.append(
        'gstCertificate',
        documents.gstCertificate
      )

      payload.append(
        'panCard',
        documents.panCard
      )

      payload.append(
        'cancelledCheque',
        documents.cancelledCheque
      )

      const response = await fetch(
        `${API_BASE_URL}/invitations/${token}/submit`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${registrationToken}`,
          },
          body: payload,
        }
      )

      const result = await response.json()

      if (!response.ok) {
        throw new Error(
          result.message || 'Registration submission failed.'
        )
      }

      setSuccess(true)
    } catch (err) {
      setError(
        err.message || 'Unable to submit registration.'
      )
    } finally {
      setSubmitting(false)
    }
  }

  // Success screen
  if (success) {
    return (
      <div className="vendor-registration-success">
        <div className="success-icon">✓</div>
        <h2>Registration submitted successfully!</h2>
        <p>Your vendor details have been received.</p>
      </div>
    )
  }

  return (
    <form
      className="vendor-registration-form"
      onSubmit={handleSubmit}
      noValidate
    >
      {formSections.map((section) => (
        <fieldset
          className="vendor-form-section"
          key={section.title}
        >
          <legend>{section.title}</legend>

          <div className="vendor-form-grid">
            {section.fields.map((field) => {
              const fieldError =
                touched[field.name] && errors[field.name]

              return (
                <div
                  className={`vendor-form-group ${
                    fieldError ? 'has-error' : ''
                  }${
                    field.type === 'textarea'
                      ? ' vendor-form-group-wide'
                      : ''
                  }`}
                  key={field.name}
                >
                  <label htmlFor={field.name}>
                    {field.label}
                    {field.required && <span> *</span>}
                  </label>

                  {field.type === 'file' ? (
                    <>
                      <input
                        id={field.name}
                        name={field.name}
                        type="file"
                        accept={field.accept}
                        onChange={handleChange}
                        className="vendor-document-input"
                      />
                      <div className="vendor-document-control">
                        <span className="vendor-document-name">
                          {documents[field.name]?.name || 'No file selected'}
                        </span>
                        {documents[field.name] && (
                          <button
                            type="button"
                            className="vendor-document-view"
                            onClick={() =>
                              setPreviewDocument(documents[field.name])
                            }
                          >
                            View
                          </button>
                        )}
                        <label
                          className="vendor-document-upload"
                          htmlFor={field.name}
                        >
                          {documents[field.name] ? 'Re-upload' : 'Upload'}
                        </label>
                      </div>
                    </>
                  ) : field.type === 'select' ? (
                    <select
                      id={field.name}
                      name={field.name}
                      value={formData[field.name] || ''}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    >
                      <option value="">
                        Select {field.label}
                      </option>

                      {field.options.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  ) : field.type === 'textarea' ? (
                    <textarea
                      id={field.name}
                      name={field.name}
                      value={formData[field.name] || ''}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      rows={3}
                    />
                  ) : (
                    <input
                      id={field.name}
                      name={field.name}
                      type={field.type || 'text'}
                      value={formData[field.name] || ''}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      maxLength={
                        field.name === 'gstin'
                          ? 15
                          : field.name === 'panNumber'
                            ? 10
                            : field.name === 'routingNumber'
                              ? 11
                              : ['billingCode', 'shippingCode'].includes(
                                  field.name
                                )
                                ? 6
                                : undefined
                      }
                      readOnly={field.readOnly || false}
                    />
                  )}

                  {fieldError && (
                    <small className="vendor-field-error">
                      {errors[field.name]}
                    </small>
                  )}
                </div>
              )
            })}
          </div>
        </fieldset>
      ))}

      {error && (
        <div className="invite-message invite-message-error">
          {error}
        </div>
      )}

      <div className="vendor-form-actions">
        <button
          type="submit"
          className="invite-submit-btn"
          disabled={submitting}
        >
          {submitting ? 'Submitting...' : 'Submit Registration'}
        </button>
      </div>

      {previewDocument && (
        <DocumentPreview
          file={previewDocument}
          onClose={() => setPreviewDocument(null)}
        />
      )}
    </form>
  )
}
