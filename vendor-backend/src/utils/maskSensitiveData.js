
const maskValue = (value, visibleStart = 0, visibleEnd = 4) => {
  if (value === null || value === undefined) return ''

  const str = String(value)

  if (!str) return ''

  const maskedLength = Math.max(
    str.length - visibleStart - visibleEnd,
    0
  )

  return (
    str.slice(0, visibleStart) +
    '*'.repeat(maskedLength) +
    (visibleEnd ? str.slice(-visibleEnd) : '')
  )
}

export const prepareSensitiveData = (data) => {
  const result = { ...data }

  const rules = {
    panNumber: [5, 1],
    gstin: [2, 3],
    bankAccountNumber: [0, 4],
    phone: [0, 4],
    mobilePhone: [0, 4],
    billingPhone: [0, 4],
    shippingPhone: [0, 4],
    routingNumber: [4, 3],
  }

  Object.entries(rules).forEach(([field, [start, end]]) => {
    if (result[field] !== undefined && result[field] !== null) {
      const original = String(result[field])

      result[field] = {
        original,
        masked: maskValue(original, start, end),
      }
    }
  })

  return result
}

export const getMaskedRegistrationData = (data) => {
  const result = { ...data }

  Object.keys(result).forEach((key) => {
    const value = result[key]

    if (
      value &&
      typeof value === 'object' &&
      !Array.isArray(value) &&
      Object.prototype.hasOwnProperty.call(value, 'masked')
    ) {
      result[key] = value.masked
    }
  })

  return result
}
