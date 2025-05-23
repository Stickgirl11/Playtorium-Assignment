import { useState, useCallback, useMemo } from 'react'
import ShoppingList from '../src/components/templates/ShoppingList'
import ShoppingCateList from '../src/components/templates/ShoppingCateList'
import CampaignList from '../src/components/templates/CampaignList'

export default function Page() {
  const [shoppings, setShoppings] = useState([])
  const [campaigns, setCampaigns] = useState([])
  const [shoppingsCate, setShoppingsCate] = useState([])
  const [selecting, setSelecting] = useState(true)

  const totalPrice = useMemo(() => {
    const sum_price = shoppings.reduce((accumulator, { price }) => {
      return accumulator + price
    }, 0)
    return sum_price
  }, [shoppings])

  const discount = 0
  const finalPrice = 0

  const calculateFinalPrice = useCallback(() => {
    //todo call post api here
  }, [shoppings, campaigns])

  const disabledCalculateFinalPrice = useMemo(() => {
    return shoppings.length <= 0
  }, [shoppings])

  const showShoppingsCate = useMemo(() => {
    return campaigns.find(({ value }) => value === 3)
  }, [campaigns])

  const showDiscountByPoints = useMemo(() => {
    return campaigns.find(({ value }) => value === 4)
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
            setSelecting(true)
            setCampaigns(list)
          }}
        />
        {showShoppingsCate && (
          <ShoppingCateList
            shoppingsCate={shoppingsCate}
            setShoppingsCate={(list) => {
              setSelecting(true)
              setShoppingsCate(list)
            }}
          />
        )}
        {showDiscountByPoints && (
          <ShoppingCateList
            shoppingsCate={shoppingsCate}
            setShoppingsCate={(list) => {
              setSelecting(true)
              setShoppingsCate(list)
            }}
          />
        )}
      </div>
      <div id="total-price">
        <span>total price: </span>
        <span>{totalPrice}</span>
      </div>
      <button
        disabled={disabledCalculateFinalPrice}
        className={`px-4 py-2 rounded-xl transition-colors duration-200 shadow-md 
    ${
      disabledCalculateFinalPrice
        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
        : 'bg-pink-600 text-white hover:bg-pink-700 cursor-pointer'
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
            <span>{discount}</span>
          </div>
          <div id="final-price">
            <span>final price: </span>
            <span>${finalPrice}</span>
          </div>
        </>
      )}
    </div>
  )
}
