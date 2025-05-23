import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Dropdown } from '../atoms'

const CampaignList = ({ campaigns, setCampaigns }) => {
  const [label, setLabel] = useState('select campaigns')
  const [options, setOptions] = useState<any>([])

  const getList = useCallback(() => {
    fetch('/api/campaign/list')
      .then((res) => {
        return res.json()
      })
      .then((data) => {
        const mapData = data.map(({ id, name, category }) => {
          return {
            value: id,
            label: name,
            category,
            disabled: false,
          }
        })
        setOptions(mapData)
      })
  }, [setOptions])

  const handleSelect = useCallback(
    (list) => {
      setCampaigns(list)

      const campaignIdList = list.map(({ value }) => value)
      const categoryIdList = list.map(({ category }) => category?.id)

      //* for apply disabled same campaign category
      const disabledDupCateOptions: any = options.map((option: any) => {
        const { value, category } = option
        const notSelectedList = !campaignIdList.includes(value)

        if (notSelectedList) {
          const duplicateCategory = categoryIdList.includes(category?.id)
          if (duplicateCategory) {
            return {
              ...option,
              disabled: true,
            }
          }
        }
        return {
          ...option,
          disabled: false,
        }
      })
      setOptions(disabledDupCateOptions)

      //* for display selected label in dropdown
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
      selectedValues={campaigns}
      options={options}
      onChange={(list) => handleSelect(list)}
    />
  )
}

export default CampaignList
