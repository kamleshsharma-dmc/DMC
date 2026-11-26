
import { useCallback, useEffect, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import {
  Download,
  Eye,
  ExternalLink,
  FileText,
  Image as ImageIcon,
  RefreshCw,
  X,
} from 'lucide-react'

import { validateVendorRegistration } from './validation'
import './VendorRegistration.css'

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'
).replace(/\/+$/, '')

// Format Date
function formatDate(date) {
  if (!date) return '-'

  const parsedDate = new Date(date)

  if (Number.isNaN(parsedDate.getTime())) {
    return '-'
  }

  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(parsedDate)
}

// Get Document URL
function getDocumentUrl(document) {
  const rawUrl =
    typeof document === 'string'
      ? document
      : document?.url ||
        document?.downloadUrl ||
        document?.fileUrl ||
        document?.path ||
        document?.location ||
        document?.href

  if (typeof rawUrl !== 'string' || !rawUrl.trim()) {
    return ''
  }

  try {
    const apiOrigin = new URL(
      API_BASE_URL,
      window.location.origin
    ).origin

    const url = new URL(rawUrl.trim(), `${apiOrigin}/`)

    if (!['http:', 'https:'].includes(url.protocol)) {
      return ''
    }

    return url.href
  } catch {
    return ''
  }
}

// Get Invitation Documents
function getInvitationDocuments(invitation) {
  const source = invitation.documents || {}

  const labels = {
    gstCertificate: 'GST Certificate',
    panCard: 'PAN Card',
    cancelledCheque: 'Cancelled Cheque',
  }

  return Object.entries(source)
    .map(([key, document]) => {
      const metadata =
        typeof document === 'object' && document !== null
          ? document
          : {}

      const url = getDocumentUrl(document)

      const fileName =
        metadata.originalName ||
        metadata.filename ||
        metadata.fileName ||
        metadata.name ||
        ''

      return {
        id: key,
        label: labels[key] || key,
        fileName: fileName || labels[key] || key,
        url,
        contentType:
          metadata.mimeType ||
          metadata.mimetype ||
          metadata.type ||
          '',
      }
    })
    .filter((document) => document.url)
}

// Document Preview
function VendorDocumentPreview({ document, onClose }) {
  const isImage =
    document.contentType.startsWith('image/') ||
    /\.(jpe?g|png|gif|webp)(?:$|[?#])/i.test(document.url)

  const isPdf =
    document.contentType === 'application/pdf' ||
    /\.pdf(?:$|[?#])/i.test(document.url)

  return (
    <div
      className="vendor-document-preview-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose()
        }
      }}
    >
      <section
        className="vendor-document-preview"
        role="dialog"
        aria-modal="true"
        aria-label={`Preview ${document.label}`}
      >
        <header className="vendor-document-preview-heading">
          <div className="vendor-preview-file-icon" aria-hidden="true">
            {isImage ? <ImageIcon size={20} /> : <FileText size={20} />}
          </div>

          <div className="vendor-preview-file-info">
            <span className="vendor-preview-eyebrow">DOCUMENT PREVIEW</span>
            <strong>{document.label}</strong>
            <span className="vendor-preview-file-name">
              {document.fileName}
            </span>
          </div>

          <div className="vendor-preview-actions">
            <a
              className="vendor-preview-original"
              href={document.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink size={15} aria-hidden="true" />
              Open original
            </a>

            <button
              type="button"
              className="vendor-preview-close"
              onClick={onClose}
              aria-label="Close preview"
            >
              <X size={18} />
            </button>
          </div>
        </header>

        <div className="vendor-document-preview-stage">
          {isImage ? (
            <img
              src={document.url}
              alt={document.label}
            />
          ) : isPdf ? (
            <iframe
              src={document.url}
              title={`Preview of ${document.label}`}
            />
          ) : (
            <div className="vendor-preview-unsupported">
              <FileText size={38} aria-hidden="true" />
              <strong>Preview not available</strong>
              <span>Open the original file to view this format.</span>
            </div>
          )}
        </div>

        <footer className="vendor-document-preview-footer">
          {isPdf ? 'PDF document' : isImage ? 'Image document' : 'Document'}
          <span>View-only preview</span>
        </footer>
      </section>
    </div>
  )
}

// Flatten Registration Data
function formatFieldLabel(label) {
  return String(label)
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/\b[a-z]/g, (letter) => letter.toUpperCase())
    .replace(/\bGstin\b/g, 'GSTIN')
    .replace(/\bGst\b/g, 'GST')
    .replace(/\bPan\b/g, 'PAN')
    .replace(/\bIfsc\b/g, 'IFSC')
    .replace(/\bTds\b/g, 'TDS')
    .replace(/\bId\b/g, 'ID')
    .replace(/\bPin\b/g, 'PIN')
}

function flattenRegistrationData(data, prefix = '') {
  if (Array.isArray(data)) {
    if (data.length === 0) {
      return [
        {
          label: formatFieldLabel(prefix || 'Registration data'),
          value: '-',
        },
      ]
    }

    return data.flatMap((value, index) =>
      flattenRegistrationData(
        value,
        `${prefix}[${index + 1}]`
      )
    )
  }

  if (data && typeof data === 'object') {
    const entries = Object.entries(data)

    if (entries.length === 0) {
      return [
        {
          label: formatFieldLabel(prefix || 'Registration data'),
          value: '-',
        },
      ]
    }

    return entries.flatMap(([key, value]) =>
      flattenRegistrationData(
        value,
        prefix ? `${prefix} / ${key}` : key
      )
    )
  }

  return [
    {
      label: formatFieldLabel(prefix || 'Registration data'),
      value:
        data === null || data === undefined || data === ''
          ? '-'
          : String(data),
    },
  ]
}

// Download Registration PDF
async function downloadRegistration(invite) {
  const { jsPDF } = await import('jspdf')

  const pdf = new jsPDF({
    unit: 'mm',
    format: 'a4',
  })

  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()

  const margin = 16
  const contentWidth = pageWidth - margin * 2
  const labelWidth = 56
  const valueWidth = contentWidth - labelWidth

  let y = margin
  let rowIndex = 0

  const addPage = () => {
    pdf.addPage()

    y = margin

    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(10)
    pdf.setTextColor(8, 92, 89)

    pdf.text(
      'Vendor registration details',
      margin,
      y
    )

    y += 9
  }

  const addSection = (title) => {
    if (y + 12 > pageHeight - margin) {
      addPage()
    }

    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(11)
    pdf.setTextColor(24, 55, 70)

    pdf.text(title, margin, y + 4)

    y += 8
  }

  const addRow = (label, value) => {
    const labelLines = pdf.splitTextToSize(
      String(label),
      labelWidth - 8
    )

    const valueLines = pdf.splitTextToSize(
      String(value ?? '-'),
      valueWidth - 8
    )

    const lineCount = Math.max(
      labelLines.length,
      valueLines.length
    )

    let lineIndex = 0

    while (lineIndex < lineCount) {
      if (pageHeight - margin - y < 10) {
        addPage()
      }

      const availableLines = Math.max(
        1,
        Math.floor((pageHeight - margin - y - 5) / 5)
      )

      const chunkSize = Math.min(
        availableLines,
        lineCount - lineIndex
      )

      const rowHeight = chunkSize * 5 + 5

      pdf.setFillColor(
        rowIndex % 2 === 0 ? 246 : 255,
        250,
        249
      )

      pdf.setDrawColor(220, 232, 231)

      pdf.roundedRect(
        margin,
        y,
        contentWidth,
        rowHeight,
        1.5,
        1.5,
        'FD'
      )

      pdf.setFont('helvetica', 'bold')
      pdf.setFontSize(9)
      pdf.setTextColor(82, 107, 120)

      const labelChunk = labelLines.slice(
        lineIndex,
        lineIndex + chunkSize
      )

      if (labelChunk.length > 0) {
        pdf.text(
          labelChunk,
          margin + 4,
          y + 5
        )
      }

      pdf.setFont('helvetica', 'normal')
      pdf.setTextColor(7, 52, 56)

      const valueChunk = valueLines.slice(
        lineIndex,
        lineIndex + chunkSize
      )

      if (valueChunk.length > 0) {
        pdf.text(
          valueChunk,
          margin + labelWidth + 4,
          y + 5
        )
      }

      y += rowHeight + 2
      lineIndex += chunkSize

      if (lineIndex < lineCount) {
        addPage()
      }
    }

    rowIndex += 1
  }

  // PDF Header
  pdf.setFillColor(230, 246, 243)

  pdf.roundedRect(
    margin,
    y,
    contentWidth,
    28,
    2,
    2,
    'F'
  )

  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(17)
  pdf.setTextColor(7, 52, 56)

  pdf.text(
    'Vendor Registration',
    margin + 6,
    y + 9
  )

  pdf.setFont('helvetica', 'normal')
  pdf.setFontSize(10)
  pdf.setTextColor(49, 84, 89)

  pdf.text(
    String(invite.company || 'Vendor'),
    margin + 6,
    y + 16
  )

  pdf.text(
    String(invite.email || ''),
    margin + 6,
    y + 22
  )

  y += 35

  // Invitation Details
  addSection('Invitation')

  ;[
    ['Invitation ID', invite.id],
    ['Company', invite.company],
    ['Email', invite.email],
    ['Issued', invite.issued],
    ['Expires', invite.expires],
    ['Status', invite.status],
  ].forEach(([label, value]) => {
    addRow(label, value || '-')
  })

  // Registration Details
  addSection('Registration data')

  flattenRegistrationData(invite.details).forEach(
    ({ label, value }) => {
      addRow(label, value)
    }
  )

  // Footer
  const totalPages = pdf.getNumberOfPages()

  for (let page = 1; page <= totalPages; page += 1) {
    pdf.setPage(page)

    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(8)
    pdf.setTextColor(113, 136, 138)

    pdf.text(
      `Page ${page} of ${totalPages}`,
      pageWidth - margin,
      pageHeight - 8,
      {
        align: 'right',
      }
    )
  }

  const fileName = `${invite.company || 'vendor'}-registration`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

  pdf.save(
    `${fileName || 'vendor-registration'}.pdf`
  )
}

// Main Component
export default function VendorRegistration() {
  // Dashboard Outlet Context
  const { inviteOpen, setInviteOpen } = useOutletContext()

  // States
  const [invites, setInvites] = useState([])
  const [selectedInvite, setSelectedInvite] = useState(null)

  const [company, setCompany] = useState('')
  const [email, setEmail] = useState('')

  const [errors, setErrors] = useState({})
  const [apiError, setApiError] = useState('')
  const [fetchError, setFetchError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [downloadError, setDownloadError] = useState('')

  const [viewingDocument, setViewingDocument] = useState(null)

  const [loading, setLoading] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(true)

  // Fetch Invitations API
  const fetchInvitations = useCallback(async () => {
    try {
      setFetchLoading(true)
      setFetchError('')

      const response = await fetch(
        `${API_BASE_URL}/invitations`
      )

      const result = await response.json()

      if (!response.ok) {
        throw new Error(
          result.message || 'Unable to fetch invitations'
        )
      }

      if (!Array.isArray(result.invitations)) {
        throw new Error('Invalid invitation API response')
      }

      const formattedData = result.invitations.map(
        (invitation, index) => ({
          id: invitation._id,
          serialNumber: index + 1,
          email: invitation.email || '-',
          company: invitation.companyName || '-',
          issued: formatDate(invitation.createdAt),
          expires: formatDate(invitation.expiresAt),
          status: invitation.status || 'Pending',
          details: invitation.registrationData || {},
          documents: getInvitationDocuments(invitation),
        })
      )

      setInvites(formattedData)
    } catch (error) {
      console.error('Fetch Invitations Error:', error)

      setFetchError(
        error.message || 'Unable to fetch invitations'
      )
    } finally {
      setFetchLoading(false)
    }
  }, [])

  // Initial API Call
  useEffect(() => {
    fetchInvitations()
  }, [fetchInvitations])

  // Close Modal
  const closeDialog = () => {
    setInviteOpen(false)
    setSelectedInvite(null)

    setDownloadError('')
    setViewingDocument(null)

    setCompany('')
    setEmail('')

    setErrors({})
    setApiError('')
    setSuccessMessage('')
  }

  // Create Vendor Invitation API
  const createInvite = async (event) => {
    event.preventDefault()

    setApiError('')
    setSuccessMessage('')

    // Frontend Validation
    const validationErrors = validateVendorRegistration({
      company,
      email,
    })

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    try {
      setLoading(true)

      const response = await fetch(
        `${API_BASE_URL}/invitations`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            companyName: company.trim(),
            email: email.trim().toLowerCase(),
          }),
        }
      )

      const result = await response.json()

      if (!response.ok) {
        throw new Error(
          result.message || 'Unable to send invitation'
        )
      }

      // Refresh invitation list
      await fetchInvitations()

      setSuccessMessage(
        result.message || 'Invitation email sent successfully'
      )

      // Reset Form
      setCompany('')
      setEmail('')
      setErrors({})

      // Close Modal
      setInviteOpen(false)
    } catch (error) {
      console.error('Invitation API Error:', error)

      setApiError(
        error.message || 'Something went wrong. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  const dialogInvite = selectedInvite

  return (
    <>
      {/* SRS References */}
      <div className="srs-references vendor-references">
        <span className="srs-label">
          SRS v0.3 references:
        </span>

        <span className="srs-tag">
          Email invitation + OTP verification
        </span>

        <span className="srs-tag">
          Link valid 7 days
        </span>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="dashboard-message">
          {successMessage}
        </div>
      )}

      {/* Invitation Log */}
      <section className="vendor-log-card">
        <div className="vendor-log-heading">
          <h2>Invitation log</h2>

          <button
            type="button"
            className="vendor-refresh-button"
            onClick={fetchInvitations}
            disabled={fetchLoading}
            aria-label={
              fetchLoading
                ? 'Refreshing invitations'
                : 'Refresh invitations'
            }
          >
            <RefreshCw
              className="vendor-refresh-icon"
              size={16}
              strokeWidth={2.2}
              aria-hidden="true"
            />

            {fetchLoading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>

        <div className="vendor-table-scroll">
          <table className="vendor-invitation-table">
            <thead>
              <tr>
                <th scope="col">Sr.No</th>
                <th scope="col">Email</th>
                <th scope="col">Company name</th>
                <th scope="col">Issued</th>
                <th scope="col">Expires</th>
                <th scope="col">Status</th>
                <th scope="col">
                  <span className="visually-hidden">
                    Actions
                  </span>
                </th>
              </tr>
            </thead>

            <tbody>
              {fetchLoading ? (
                <tr>
                  <td
                    colSpan="7"
                    className="vendor-empty-message"
                  >
                    Loading invitations...
                  </td>
                </tr>
              ) : fetchError ? (
                <tr>
                  <td
                    colSpan="7"
                    className="vendor-empty-message"
                  >
                    <span>{fetchError}</span>

                    <button
                      type="button"
                      onClick={fetchInvitations}
                    >
                      Retry
                    </button>
                  </td>
                </tr>
              ) : invites.length === 0 ? (
                <tr>
                  <td
                    colSpan="7"
                    className="vendor-empty-message"
                  >
                    No vendor invitations found.
                  </td>
                </tr>
              ) : (
                invites.map((invite) => (
                  <tr key={invite.id}>
                    <td className="vendor-invite-id">
                      {invite.serialNumber}
                    </td>

                    <td>{invite.email}</td>

                    <td>{invite.company}</td>

                    <td>{invite.issued}</td>

                    <td>{invite.expires}</td>

                    <td>
                      <span
                        className={`vendor-status vendor-status-${invite.status
                          .toLowerCase()
                          .replace(/\s+/g, '-')}`}
                      >
                        {invite.status}
                      </span>
                    </td>

                    <td>
                      {invite.status === 'Completed' && (
                        <button
                          type="button"
                          className="vendor-view-button"
                          onClick={() => {
                            setDownloadError('')
                            setViewingDocument(null)
                            setSelectedInvite(invite)
                          }}
                        >
                          <Eye size={16} />
                          <span>View</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <p className="vendor-prototype-note">
          Vendor invitations are sent through the backend email service.
        </p>
      </section>

      {/* Invite / View Details Modal */}
      {(inviteOpen || dialogInvite) && (
        <div
          className="vendor-dialog-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeDialog()
            }
          }}
        >
          <section
            className={`vendor-dialog${
              dialogInvite ? ' vendor-details-dialog' : ''
            }`}
            role="dialog"
            aria-modal="true"
            aria-labelledby="vendor-dialog-title"
          >
            {/* Modal Header */}
            <div className="vendor-dialog-heading">
              <div>
                <h2 id="vendor-dialog-title">
                  {dialogInvite
                    ? 'Invitation details'
                    : 'Invite a vendor'}
                </h2>

                <p>
                  {dialogInvite
                    ? 'Submitted vendor information is available in view-only mode.'
                    : 'An invitation email with a registration link will be sent to the vendor.'}
                </p>
              </div>

              <button
                type="button"
                className="vendor-dialog-close"
                onClick={closeDialog}
                aria-label="Close dialog"
              >
                <X size={18} />
              </button>
            </div>

            {/* API Error */}
            {apiError && (
              <div className="vendor-field-error">
                {apiError}
              </div>
            )}

            {/* View Invitation Details */}
            {dialogInvite ? (
              <>
                {/* Invitation Details */}
                <dl className="vendor-details">
                  <div>
                    <dt>Invite</dt>
                    <dd>{dialogInvite.id}</dd>
                  </div>

                  <div>
                    <dt>Company</dt>
                    <dd>{dialogInvite.company}</dd>
                  </div>

                  <div>
                    <dt>Email</dt>
                    <dd>{dialogInvite.email}</dd>
                  </div>

                  <div>
                    <dt>Issued</dt>
                    <dd>{dialogInvite.issued}</dd>
                  </div>

                  <div>
                    <dt>Expires</dt>
                    <dd>{dialogInvite.expires}</dd>
                  </div>

                  <div>
                    <dt>Status</dt>
                    <dd>{dialogInvite.status}</dd>
                  </div>
                </dl>

                {/* Registration Data */}
                <h3 className="vendor-details-title">
                  Registration data
                </h3>

                {dialogInvite.details &&
                typeof dialogInvite.details === 'object' &&
                Object.keys(dialogInvite.details).length > 0 ? (
                  <dl className="vendor-details vendor-registration-data">
                    {flattenRegistrationData(
                      dialogInvite.details
                    ).map(({ label, value }, index) => (
                      <div key={`${label}-${index}`}>
                        <dt>{label}</dt>
                        <dd>{value}</dd>
                      </div>
                    ))}
                  </dl>
                ) : (
                  <p className="vendor-no-details">
                    No registration data was returned by the API.
                  </p>
                )}

                {/* Documents */}
                <h3 className="vendor-details-title">
                  Documents
                </h3>

                {dialogInvite.documents.length > 0 ? (
                  <ul className="vendor-document-list">
                    {dialogInvite.documents.map((document) => (
                      <li key={document.id}>
                        <div>
                          <strong>{document.label}</strong>
                          <span>{document.fileName}</span>
                        </div>

                        <button
                          type="button"
                          className="vendor-document-open"
                          onClick={() => setViewingDocument(document)}
                        >
                          View Doc
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="vendor-no-details">
                    No documents were uploaded for this registration.
                  </p>
                )}

                {/* PDF Download */}
                <div className="vendor-dialog-actions vendor-details-actions">
                  <button
                    type="button"
                    className="vendor-download-button"
                    onClick={async () => {
                      setDownloadError('')

                      try {
                        await downloadRegistration(dialogInvite)
                      } catch (error) {
                        console.error('PDF download error:', error)

                        setDownloadError(
                          'Unable to generate the PDF. Please try again.'
                        )
                      }
                    }}
                  >
                    <Download
                      size={16}
                      aria-hidden="true"
                    />

                    Download PDF
                  </button>
                </div>

                {downloadError && (
                  <p
                    className="vendor-download-error"
                    role="alert"
                  >
                    {downloadError}
                  </p>
                )}

                {/* Document Preview */}
                {viewingDocument && (
                  <VendorDocumentPreview
                    document={viewingDocument}
                    onClose={() => setViewingDocument(null)}
                  />
                )}
              </>
            ) : (
              /* New Vendor Invitation Form */
              <form
                className="vendor-invite-form"
                onSubmit={createInvite}
                noValidate
              >
                {/* Company Name */}
                <label>
                  Company name

                  <input
                    type="text"
                    placeholder="Enter company name"
                    value={company}
                    onChange={(event) => {
                      setCompany(event.target.value)

                      setErrors((current) => ({
                        ...current,
                        company: '',
                      }))
                    }}
                    aria-invalid={Boolean(errors.company)}
                    required
                    autoFocus
                  />

                  {errors.company && (
                    <span className="vendor-field-error">
                      {errors.company}
                    </span>
                  )}
                </label>

                {/* Vendor Email */}
                <label>
                  Vendor email

                  <input
                    type="email"
                    placeholder="Enter vendor email"
                    value={email}
                    onChange={(event) => {
                      setEmail(event.target.value)

                      setErrors((current) => ({
                        ...current,
                        email: '',
                      }))
                    }}
                    aria-invalid={Boolean(errors.email)}
                    required
                  />

                  {errors.email && (
                    <span className="vendor-field-error">
                      {errors.email}
                    </span>
                  )}
                </label>

                {/* Modal Actions */}
                <div className="vendor-dialog-actions">
                  <button
                    type="button"
                    className="vendor-cancel-button"
                    onClick={closeDialog}
                    disabled={loading}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="vendor-submit-button"
                    disabled={loading}
                  >
                    {loading ? 'Sending...' : 'Send invite'}
                  </button>
                </div>
              </form>
            )}
          </section>
        </div>
      )}
    </>
  )
}
