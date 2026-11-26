
import { useState } from 'react'
import './CustomerList.css'

const initialCustomers = [
  {
    id: 'CUST-10021',
    name: 'Ananya Sharma',
    mobile: '98******10',
    email: 'an***@gmail.com',
    store: 'Jaipur - MI Road',
    updated: '2 Oct 2026, 7:40 pm',
  },
  {
    id: 'CUST-10022',
    name: 'Rohit Mehta',
    mobile: '91******80',
    email: 'ro***@outlook.com',
    store: 'Ahmedabad - CG Road',
    updated: '3 Aug 2026, 4:30 pm',
  },
  {
    id: 'CUST-10023',
    name: 'Priya Nair',
    mobile: '99******55',
    email: 'pr***@yahoo.in',
    store: 'Jaipur - MI Road',
    updated: '15 Oct 2026, 3:00 pm',
  },
  {
    id: 'CUST-10024',
    name: 'Kavya Agarwal',
    mobile: '98******00',
    email: 'ka***@gmail.com',
    store: 'Jaipur - MI Road',
    updated: '1 Apr 2026, 2:30 pm',
  },
  {
    id: 'CUST-10025',
    name: 'Arjun Reddy',
    mobile: '98******23',
    email: 'ar***@yahoo.in',
    store: 'Ahmedabad - CG Road',
    updated: '6 May 2026, 3:43 pm',
  },
]

export default function CustomerList() {
  const [customers, setCustomers] = useState(initialCustomers)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    email: '',
    store: '',
  })

  const [errors, setErrors] = useState({})

  const filteredCustomers = customers.filter((customer) =>
    [
      customer.name,
      customer.mobile,
      customer.email,
      customer.id,
    ].some((value) =>
      value.toLowerCase().includes(search.toLowerCase())
    )
  )

  const handleChange = (event) => {
    const { name, value } = event.target

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    setErrors((prev) => ({
      ...prev,
      [name]: '',
    }))
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Customer name is required'
    }

    if (!/^[0-9]{10}$/.test(formData.mobile)) {
      newErrors.mobile = 'Enter a valid 10-digit mobile number'
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Enter a valid email address'
    }

    if (!formData.store) {
      newErrors.store = 'Please select a store'
    }

    setErrors(newErrors)

    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (event) => {
    event.preventDefault()

    if (!validateForm()) return

    const newCustomer = {
      id: `CUST-${10021 + customers.length}`,
      name: formData.name.trim(),
      mobile: `${formData.mobile.slice(0, 2)}******${formData.mobile.slice(-2)}`,
      email: formData.email,
      store: formData.store,
      updated: new Date().toLocaleString('en-IN'),
    }

    setCustomers((prev) => [newCustomer, ...prev])

    setFormData({
      name: '',
      mobile: '',
      email: '',
      store: '',
    })

    setErrors({})
    setShowModal(false)
  }

  const closeModal = () => {
    setShowModal(false)
    setErrors({})
    setFormData({
      name: '',
      mobile: '',
      email: '',
      store: '',
    })
  }

  return (
    <div className="customer-page">

      {/* Page Header */}
      <div className="customer-header">
        <h2>Customers</h2>

        <button
          className="new-customer-btn"
          onClick={() => setShowModal(true)}
        >
          <span>＋</span> New customer
        </button>
      </div>

      {/* SRS References */}
      <div className="customer-references">
        <span>SRS v0.3 references:</span>
        <span className="reference-tag">P2 Customer Creation</span>
        <span className="reference-tag">CU-01 Search</span>
        <span className="reference-tag">CU-02 Create at POS</span>
        <span className="reference-tag">CU-03 Consent screen</span>
        <span className="reference-tag">Appx A Attributes</span>
      </div>

      {/* Customer Table */}
      <div className="customer-table-card">

        <div className="customer-search">
          <span>⌕</span>
          <input
            type="text"
            placeholder="Search by mobile, email, name or customer ID"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="customer-table-wrapper">
          <table className="customer-table">
            <thead>
              <tr>
                <th>CUSTOMER</th>
                <th>MOBILE</th>
                <th>EMAIL</th>
                <th>STORE</th>
                <th>UPDATED</th>
              </tr>
            </thead>

            <tbody>
              {filteredCustomers.length > 0 ? (
                filteredCustomers.map((customer) => (
                  <tr key={customer.id}>
                    <td>
                      <div className="customer-name">
                        {customer.name}
                      </div>
                      <div className="customer-id">
                        {customer.id}
                      </div>
                    </td>

                    <td>{customer.mobile}</td>
                    <td>{customer.email}</td>
                    <td>{customer.store}</td>
                    <td>{customer.updated}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="no-customers">
                    No customers found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="customer-count">
          Showing {filteredCustomers.length} of {customers.length} customers
        </div>
      </div>

      {/* New Customer Modal */}
      {showModal && (
        <div className="customer-modal-overlay">
          <div className="customer-modal">

            <div className="customer-modal-header">
              <div>
                <h3>New Customer</h3>
                <p>Add a new customer to your database.</p>
              </div>

              <button
                className="modal-close-btn"
                onClick={closeModal}
                type="button"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} noValidate>

              <div className="customer-form-group">
                <label>Customer Name *</label>
                <input
                  type="text"
                  name="name"
                  placeholder="Enter customer name"
                  value={formData.name}
                  onChange={handleChange}
                  autoFocus
                />
                {errors.name && (
                  <span className="customer-error">{errors.name}</span>
                )}
              </div>

              <div className="customer-form-group">
                <label>Mobile Number *</label>
                <input
                  type="tel"
                  name="mobile"
                  placeholder="Enter 10 digit mobile number"
                  value={formData.mobile}
                  onChange={handleChange}
                  maxLength={10}
                />
                {errors.mobile && (
                  <span className="customer-error">{errors.mobile}</span>
                )}
              </div>

              <div className="customer-form-group">
                <label>Email Address *</label>
                <input
                  type="email"
                  name="email"
                  placeholder="Enter email address"
                  value={formData.email}
                  onChange={handleChange}
                />
                {errors.email && (
                  <span className="customer-error">{errors.email}</span>
                )}
              </div>

              <div className="customer-form-group">
                <label>Store *</label>
                <select
                  name="store"
                  value={formData.store}
                  onChange={handleChange}
                >
                  <option value="">Select Store</option>
                  <option value="Jaipur - MI Road">
                    Jaipur - MI Road
                  </option>
                  <option value="Ahmedabad - CG Road">
                    Ahmedabad - CG Road
                  </option>
                </select>
                {errors.store && (
                  <span className="customer-error">{errors.store}</span>
                )}
              </div>

              <div className="customer-modal-actions">
                <button
                  type="button"
                  className="customer-cancel-btn"
                  onClick={closeModal}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="customer-save-btn"
                >
                  Create Customer
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  )
}
