import { useState } from 'react'

const InputNumber = ({ onChange, placeholder }) => {
  const [value, setValue] = useState(0)
  const handleChange = (e) => {
    const raw = e.target.value
    const digitsOnly = raw.replace(/\D/g, '')
    const sanitized = digitsOnly === '' ? 0 : parseInt(digitsOnly, 10)

    setValue(sanitized) // Display only digits
    onChange?.(sanitized)
  }

  return (
    <input
      type="text"
      value={value ?? 0}
      onChange={handleChange}
      placeholder={placeholder}
      className="h-[36px] w-48 px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
  )
}
export default InputNumber
