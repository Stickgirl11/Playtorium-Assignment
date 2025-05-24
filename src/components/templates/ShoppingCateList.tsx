import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Dropdown } from '../molecules'

const defaultPlaceholder = 'Select shoppings cate'

const ShoppingCateList = ({ shoppings, shoppingsCate, setShoppingsCate }) => {
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
        setShoppingsCate([])
        return
      }
      const currentList = [{ ...current }]
      setShoppingsCate(currentList)
    },
    [options, shoppingsCate],
  )

  useEffect(() => {
    getList()
  }, [])

  const label = useMemo(() => {
    const displayLabel = shoppingsCate
      .map(({ label }) => {
        return label
      })
      .join(' / ')

    if (displayLabel) {
      return displayLabel
    }
    return defaultPlaceholder
  }, [shoppingsCate])

  return (
    <div>
      <Dropdown
        label={label}
        selectedValues={shoppingsCate}
        options={disabledOptionByShoppings}
        onChange={(list, currentSelect) => handleSelect(list, currentSelect)}
      />
      {shoppingsCate.length === 0 && <span className="text-red-300"> *required</span>}
    </div>
  )
}

export default ShoppingCateList
