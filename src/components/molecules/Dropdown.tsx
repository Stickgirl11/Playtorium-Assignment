import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'

export default function MultiDropdownMenu({
  label = 'please select',
  options,
  selectedValues,
  onChange,
}) {
  const handleSelect = (option) => {
    const { value, disabled } = option
    if (disabled) return

    const exists = selectedValues.some((v) => v.value === value)

    const newSelection = exists
      ? selectedValues.filter((v) => v.value !== value)
      : [...selectedValues, option]

    onChange(newSelection)
  }

  const getItemClasses = (isActive, isDisabled) => {
    if (isDisabled) return 'text-gray-400 cursor-not-allowed'
    if (isActive) return 'bg-gray-100 text-gray-900'
    return 'text-gray-700'
  }

  return (
    <Menu as="div" className="relative inline-block text-left">
      <div>
        <MenuButton className="inline-flex w-full justify-center gap-x-1.5 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-xs ring-1 ring-gray-300 ring-inset hover:bg-gray-50">
          {label}
        </MenuButton>
      </div>

      <MenuItems className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black/5 focus:outline-none">
        <div className="py-1">
          {options.map((option) => (
            <MenuItem as="div" key={option.value} disabled={option.disabled}>
              {({ active }) => {
                const listId = selectedValues.map(({ value }) => value)
                const isSelected = listId.includes(option.value)
                const itemClass = getItemClasses(active, option.disabled)

                const handleClick = (e) => {
                  e.preventDefault() // ✅ this stops auto-close
                  e.stopPropagation() // ✅ prevent bubbling up to trigger close
                  if (option?.disabled) return

                  handleSelect(option)
                }

                return (
                  <div
                    role="menuitem"
                    onClick={handleClick}
                    className={`flex w-full justify-between px-4 py-2 text-sm ${itemClass} ${
                      option?.disabled ? 'pointer-events-none' : 'cursor-pointer'
                    }`}
                  >
                    {option.label}
                    {!option?.disabled && isSelected && (
                      <span className="text-green-500 font-bold">✓</span>
                    )}
                  </div>
                )
              }}
            </MenuItem>
          ))}
        </div>
      </MenuItems>
    </Menu>
  )
}
