import React, { useCallback, useEffect, useState } from 'react'
import { Dropdown } from '../molecules'

const ShoppingCateList = ({ shoppingsCate, setShoppingsCate }) => {
  const [label, setLabel] = useState('select shoppings cate')
  const [options, setOptions] = useState([])

  const getList = useCallback(() => {
    fetch('/api/discount/shopping/category/list')
      .then((res) => {
        return res.json()
      })
      .then((data) => {
        const mapData = data.map(({ id, name }) => {
          return {
            value: id,
            label: name,
          }
        })
        setOptions(mapData)
      })
  }, [setOptions])

  const handleSelect = useCallback(
    (list) => {
      setShoppingsCate(list)

      //* display shopping label
      const displayLabel = list
        .map(({ label }) => {
          return label
        })
        .join('')

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
      selectedValues={shoppingsCate}
      options={options}
      onChange={(list) => handleSelect(list)}
    />
  )
}

export default ShoppingCateList
