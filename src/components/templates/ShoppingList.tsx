import React, { useCallback, useEffect, useState } from 'react'
import { Dropdown } from '../atoms'

const ShoppingList = ({ shoppings, setShoppings }) => {
  const [label, setLabel] = useState('select shoppings')
  const [options, setOptions] = useState([])

  const getList = useCallback(() => {
    fetch('/api/shopping/list')
      .then((res) => {
        return res.json()
      })
      .then((data) => {
        const mapData = data.map(({ id, name, price }) => {
          return {
            value: id,
            label: `${name}: ${price} THB`,
            price,
          }
        })
        setOptions(mapData)
      })
  }, [setOptions])

  const handleSelect = useCallback(
    (list) => {
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
