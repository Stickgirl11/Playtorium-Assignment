import { useState } from 'react'

function parsePositiveInteger(rawValue) {
  const cleaned = rawValue.replace(/\D/g, '') // Strip non-digits
  return cleaned === '' ? null : parseInt(cleaned, 10)
}

const InputNumber = ({ onChange, placeholder }) => {
  const [value, setValue] = useState('')
  const handleChange = (e) => {
    const raw = e.target.value
    const parsed = parsePositiveInteger(raw)

    setValue(raw.replace(/\D/g, '')) // Display only digits
    if (parsed !== null) {
      onChange?.(parsed)
    }
  }

  return (
    <input
      type="text"
      value={value}
      onChange={handleChange}
      placeholder={placeholder}
      className="h-[36px] w-48 px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
  )
}
export default InputNumber
