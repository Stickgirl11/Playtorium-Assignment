import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Dropdown } from '../molecules'

const defaultPlaceholder = 'Select shoppings'

const ShoppingList = ({ shoppings, setShoppings }) => {
  const [options, setOptions] = useState([])

  const getList = useCallback(() => {
    fetch('/api/discount/shopping/list')
      .then((res) => {
        return res.json()
      })
      .then((data) => {
        const mapData = data.map(({ id, name, price, category }) => {
          return {
            value: id,
            label: `${name}: ${price} THB`,
            price,
            category,
          }
        })
        setOptions(mapData)
      })
  }, [setOptions])

  const handleSelect = useCallback(
    (list) => {
      if (list.length === 0) {
        setShoppings([])
        return
      }
      setShoppings(list)
    },
    [options],
  )

  const label = useMemo(() => {
    const displayLabel = shoppings
      .map(({ label }) => {
        return label
      })
      .join(' / ')

    if (displayLabel) {
      return displayLabel
    }
    return defaultPlaceholder
  }, [shoppings])

  useEffect(() => {
    getList()
  }, [])

  return (
    <Dropdown
      label={label}
      selectedValues={shoppings}
      options={options}
      onChange={(list) => handleSelect(list)}
    />
  )
}

export default ShoppingList
