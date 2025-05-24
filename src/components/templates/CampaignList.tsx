import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Dropdown } from '../molecules'

const defaultPlaceholder = 'Select campaigns'

const CampaignList = ({ campaigns, setCampaigns }) => {
  const [options, setOptions] = useState<any>([])

  const getList = useCallback(() => {
    fetch('/api/discount/campaign/list')
      .then((res) => {
        return res.json()
      })
      .then((data) => {
        const mapData = data.map(({ id, name, category, parameters }) => {
          const parameters_display = parameters.map(
            ({ value, display_text, display_unit }) => {
              return display_text + value + display_unit
            },
          )
          return {
            value: id,
            label: `${name} - ${parameters_display}`,
            category,
            disabled: false,
          }
        })
        setOptions(mapData)
      })
  }, [setOptions])

  const handleSelect = useCallback(
    (list) => {
      if (list.length === 0) {
        setCampaigns([])
        setOptions([...options].map((option) => ({ ...option, disabled: false })))
        return
      }

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
    },
    [options],
  )

  const label = useMemo(() => {
    const displayLabel = campaigns
      .map(({ label }) => {
        return label
      })
      .join(' / ')

    if (displayLabel) {
      return displayLabel
    }
    return defaultPlaceholder
  }, [campaigns])

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
