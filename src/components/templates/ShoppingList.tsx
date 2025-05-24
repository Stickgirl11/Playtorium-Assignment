import React, { useCallback, useEffect, useState } from 'react'
import { Dropdown } from '../molecules'

const defaultPlaceholder = 'select shoppings'

const ShoppingList = ({ shoppings, setShoppings }) => {
  const [label, setLabel] = useState(defaultPlaceholder)
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
        setLabel(defaultPlaceholder)
        setShoppings([])
        return
      }
      setShoppings(list)

      //* display shopping label
      const displayLabel = list
        .map(({ label }) => {
          return label
        })
        .join(' / ')

      if (displayLabel) {
        setLabel(displayLabel)
      }
    },
    [options],
  )

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
