import { useState, useCallback, useMemo } from 'react'
import ShoppingList from '../src/components/templates/ShoppingList'
import ShoppingCateList from '../src/components/templates/ShoppingCateList'
import CampaignList from '../src/components/templates/CampaignList'
import DiscountPoint from '../src/components/templates/DiscountPoint'

enum CampaignId {
  FIXED_AMOUNT = 1,
  PERCENT_DISCOUNT = 2,
  PERCENT_DISCOUNT_BY_CATEGORY = 3,
  DISCOUNT_BY_POINTS = 4,
  SPECIAL_CAMPAIGN = 5,
}

export default function Page() {
  const [shoppings, setShoppings] = useState([])
  const [campaigns, setCampaigns] = useState([])
  const [shoppingsCate, setShoppingsCate] = useState([]) //* for campaign PERCENT_DISCOUNT_BY_CATEGORY
  const [points, setPoints] = useState(0) //* for campaign DISCOUNT_BY_POINTS
  const [selecting, setSelecting] = useState(true)
  const [result, setResult] = useState({
    discount_price: 0,
    final_price: 0,
  })

  const totalPrice = useMemo(() => {
    const sum_price = shoppings.reduce((accumulator, { price }) => {
      return accumulator + price
    }, 0)
    return sum_price
  }, [shoppings])

  const calculateFinalPrice = useCallback(async () => {
    const mapShoppings = shoppings.map(({ value, label, price, category }) => {
      return {
        id: value,
        name: label,
        price,
        category,
      }
    })
    const mapCampaigns = campaigns.map(({ value, label, category }) => {
      return {
        id: value,
        name: label,
        category,
      }
    })
    const mapShoppingsCate = shoppingsCate.map(({ value, label }) => {
      return {
        id: value,
        name: label,
      }
    })

    const response = await fetch('/api/discount/calculate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        shoppings: mapShoppings,
        campaigns: mapCampaigns,
        shoppingsCate: mapShoppingsCate,
        points,
      }),
    })

    const result = await response.json()
    setResult({
      discount_price: result?.discount_price ?? 0,
      final_price: result?.final_price ?? 0,
    })
  }, [shoppings, campaigns, shoppingsCate, points, setResult])

  const showCalculateFinalPrice = useMemo(() => {
    const selectedShopping = shoppings.length > 0
    if (selectedShopping) {
      const selectedCampaign = campaigns.length > 0
      if (selectedCampaign) {
        const selectedCampaign_3 = campaigns.some(
          ({ value }) => value === CampaignId.PERCENT_DISCOUNT_BY_CATEGORY,
        )
        const selectedShoppingCate = shoppingsCate.length !== 0
        if (selectedCampaign_3 && !selectedShoppingCate) {
          return false
        }

        const selectedCampaign_4 = campaigns.some(
          ({ value }) => value === CampaignId.DISCOUNT_BY_POINTS,
        )
        const selectedPoints = points > 0
        if (selectedCampaign_4 && !selectedPoints) {
          return false
        }
        return true
      }
      return true
    }
    return false
  }, [shoppings, campaigns, shoppingsCate, points])

  const showShoppingsCate = useMemo(() => {
    return campaigns.find(
      ({ value }) => value === CampaignId.PERCENT_DISCOUNT_BY_CATEGORY,
    )
  }, [campaigns])

  const showDiscountByPoints = useMemo(() => {
    return campaigns.find(({ value }) => value === CampaignId.DISCOUNT_BY_POINTS)
  }, [campaigns])

  return (
    <div className="p-8 pl-48 flex flex-col gap-4">
      <div>
        <ShoppingList
          shoppings={shoppings}
          setShoppings={(list) => {
            setSelecting(true)
            setShoppings(list)
          }}
        />
      </div>
      <div className="flex gap-5">
        <CampaignList
          campaigns={campaigns}
          setCampaigns={(list) => {
            if (list.length === 0) {
              setCampaigns([])
              setSelecting(true)
              return
            }
            const prevList = campaigns.map(({ value }) => value)
            const currentList = list.map(({ value }) => value)
            const latestList = prevList.filter((value) => !currentList.includes(value))

            const resetShoppingsCate = latestList.find(
              (value) => value === CampaignId.PERCENT_DISCOUNT_BY_CATEGORY,
            )
            if (resetShoppingsCate) {
              setShoppingsCate([])
            }

            const resetDiscountPoints = latestList.find(
              (value) => value === CampaignId.DISCOUNT_BY_POINTS,
            )
            if (resetDiscountPoints) {
              setPoints(0)
            }

            setSelecting(true)
            setCampaigns(list)
          }}
        />
        {showShoppingsCate && (
          <ShoppingCateList
            shoppings={shoppings}
            shoppingsCate={shoppingsCate}
            setShoppingsCate={(list) => {
              setSelecting(true)
              setShoppingsCate(list)
            }}
          />
        )}
        {showDiscountByPoints && (
          <DiscountPoint
            setPoints={(p) => {
              setSelecting(true)
              setPoints(p)
            }}
          />
        )}
      </div>
      <div id="total-price">
        <span>total price: </span>
        <span>{totalPrice}</span>
      </div>
      <button
        disabled={!showCalculateFinalPrice}
        className={`w-[300px] px-4 py-2 rounded-xl transition-colors duration-200 shadow-md 
    ${
      !showCalculateFinalPrice
        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
        : 'bg-yellow-400 text-white hover:bg-yellow-500 cursor-pointer'
    }`}
        onClick={() => {
          setSelecting(false)
          calculateFinalPrice()
        }}
      >
        click to calculate final price
      </button>
      {!selecting && (
        <>
          <div id="discount">
            <span>discount: </span>
            <span>{result.discount_price}</span>
          </div>
          <div id="final-price">
            <span>final price: </span>
            <span>{result.final_price}</span>
          </div>
        </>
      )}
      {!selecting && (
        <button
          className={
            'w-[300px] px-4 py-2 rounded-xl transition-colors duration-200 shadow-md bg-pink-600 text-white hover:bg-pink-700 cursor-pointer'
          }
          onClick={() => {
            alert('order complete')
          }}
        >
          สั่งสินค้า
        </button>
      )}
    </div>
  )
}
