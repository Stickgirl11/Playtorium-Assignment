import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Dropdown } from '../molecules'

const defaultPlaceholder = 'select shoppings cate'

const ShoppingCateList = ({ shoppings, shoppingsCate, setShoppingsCate }) => {
  const [label, setLabel] = useState(defaultPlaceholder)
  const [options, setOptions] = useState([])

  const disabledOptionByShoppings = useMemo(() => {
    const flattenShoppingsCategory = shoppings.map(({ category }) => category?.id)
    return options.map((option: any) => {
      const isShoppingsCategorySelected = flattenShoppingsCategory.includes(option?.value)
      if (isShoppingsCategorySelected) {
        return { ...option, disabled: false }
      }

      return { ...option, disabled: true }
    })
  }, [options, shoppings])

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
            disabled: true,
          }
        })
        setOptions(mapData)
      })
  }, [setOptions])

  const handleSelect = useCallback(
    (list, current) => {
      if (list.length === 0) {
        setLabel(defaultPlaceholder)
        setShoppingsCate([])
        return
      }
      const currentList = [{ ...current }]
      setShoppingsCate(currentList)

      //* display shopping label
      const displayLabel = currentList
        .map(({ label }) => {
          return label
        })
        .join('')

      if (displayLabel) {
        setLabel(displayLabel)
      }
    },
    [options, shoppingsCate],
  )

  useEffect(() => {
    getList()
  }, [])

  return (
    <Dropdown
      label={label}
      selectedValues={shoppingsCate}
      options={disabledOptionByShoppings}
      onChange={(list, currentSelect) => handleSelect(list, currentSelect)}
    />
  )
}

export default ShoppingCateList
