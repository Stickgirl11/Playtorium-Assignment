import campaign_campaign_parameter from '../../../../public/relation/campaign-campaign_parameter.json'

import clonedeep from 'lodash.clonedeep'

enum CampaignId {
  FIXED_AMOUNT = 1,
  PERCENT_DISCOUNT = 2,
  PERCENT_DISCOUNT_BY_CATEGORY = 3,
  DISCOUNT_BY_POINTS = 4,
  SPECIAL_CAMPAIGN = 5,
}

function getTotalPrice(shoppings) {
  const sum_price = shoppings.reduce((accumulator, { price }) => {
    return accumulator + price
  }, 0)
  return sum_price
}

function getSortedByCampaignOrder(campaigns) {
  return campaigns.slice().sort((a, b) => a.category.id - b.category.id)
}

function calFixedAmount(final_price, item) {
  const parameters = clonedeep(clonedeep(campaign_campaign_parameter)).find(
    ({ id }) => id === item?.id,
  )?.parameters
  const discount = parameters?.find(({ key }) => key === 'amount')?.value ?? 0
  console.info("parameters <amount>: ", discount)
  const remain = final_price - discount

  return { discount, remain }
}

function calPercentDiscount(final_price, item) {
  const parameters = clonedeep(campaign_campaign_parameter).find(
    ({ id }) => id === item?.id,
  )?.parameters
  const percent = parameters?.find(({ key }) => key === 'percent')?.value ?? 0
  console.info("parameters <percent>: ", percent, "%")
  const discount = (percent / 100) * final_price
  const remain = final_price - discount

  return { discount, remain }
}

function calPercentDiscountByCategory(final_price, total_price, shoppings, shoppingsCate, item) {
  const parameters = clonedeep(campaign_campaign_parameter).find(
    ({ id }) => id === item?.id,
  )?.parameters
  const percent = parameters?.find(({ key }) => key === 'percent')?.value ?? 0
  console.info("parameters <percent>: ", percent, "%")

  const shoppingsCateId = shoppingsCate?.[0]?.id
  console.info("cal shoppingsCateId: ", shoppingsCateId)
  const shoppingFilterByCategory = shoppings?.filter(({ id }) => id === shoppingsCateId)
  console.info("cal shoppingFilterByCategory: ", shoppingFilterByCategory)
  const shoppingTargetCateTotalPrice = shoppingFilterByCategory?.reduce((total, { price }) => {
    return total + price
  }, 0)
  console.info("cal shoppingTargetCateTotalPrice: ", shoppingTargetCateTotalPrice)
  const categoryPercentShareByTotal = (shoppingTargetCateTotalPrice / total_price) * 100
  console.info("cal categoryPercentShareByTotal: ", categoryPercentShareByTotal)
  const percentByCategoryPercert = (percent * 100) / categoryPercentShareByTotal
  console.info("cal percentByCategoryPercert: ", percentByCategoryPercert)

  const discount = (percentByCategoryPercert / 100) * final_price
  const remain = final_price - discount

  return { discount, remain }
}

function calDiscountByPoints(final_price, points, item) {
  const parameters = clonedeep(campaign_campaign_parameter).find(
    ({ id }) => id === item?.id,
  )?.parameters
  const maxPricePercent =
    parameters?.find(({ key }) => key === 'max_price_percent')?.value ?? 0
  console.info("parameters <max_price_percent>: ", maxPricePercent)
  const onePointPrice =
    parameters?.find(({ key }) => key === 'one_point_price')?.value ?? 0
  console.info("parameters <one_point_price>: ", onePointPrice)

  const maxDiscount = final_price * (maxPricePercent / 100)
  console.info("cal maxDiscount: ", maxDiscount)
  const pointDiscount = points * onePointPrice
  console.info("cal pointDiscount: ", pointDiscount)
  const discount = Math.min(pointDiscount, maxDiscount)
  const remain = final_price - discount

  return { discount, remain }
}

function calSpecialCampaign(final_price, item) {
  const parameters = clonedeep(campaign_campaign_parameter).find(
    ({ id }) => id === item?.id,
  )?.parameters
  const every = parameters?.find(({ key }) => key === 'every')?.value ?? 0
  const discountEvery = parameters?.find(({ key }) => key === 'discount')?.value ?? 0
  console.info("parameters <every>: ", every)
  console.info("parameters <discount>: ", discountEvery)
  const discount = Math.floor(final_price / every) * discountEvery
  const remain = final_price - discount

  return { discount, remain }
}

export async function POST(req: Request) {
  const body = await req.json()
  try {
    const { shoppings, campaigns, shoppingsCate, points } = body
    console.info('shoppings --> ', shoppings.map(({ name }) => name))
    console.info('campaigns --> ', campaigns.map(({ name }) => name))
    console.info('shoppingsCate --> ', shoppingsCate.map(({ name }) => name))
    console.info('points --> ', points)


    //* step 1 get total price
    const total_price = getTotalPrice(shoppings)
    console.info('total price --> ', total_price)

    //* step 2 sort campaigns by order to execute discount
    const sorted_campaigns = getSortedByCampaignOrder(campaigns)
    console.info('sorted campaigns --> ', sorted_campaigns.map(({ name }) => name))

    //* step 3 calculate by campaign
    const price = sorted_campaigns.reduce(
      ({ discount_price, final_price }, item) => {
        if (item.id === CampaignId.FIXED_AMOUNT) {
          const { discount, remain } = calFixedAmount(final_price, item)
          console.info("---- campaign FIXED_AMOUNT --> discount: ", discount, " remain: ", remain)

          return { discount_price: discount_price + discount, final_price: remain - discount }
        }

        if (item.id === CampaignId.PERCENT_DISCOUNT) {
          const { discount, remain } = calPercentDiscount(final_price, item)
          console.info("campaign PERCENT_DISCOUNT --> discount: ", discount, " remain: ", remain)

          return { discount_price: discount_price + discount, final_price: remain }
        }

        if (item.id === CampaignId.PERCENT_DISCOUNT_BY_CATEGORY) {
          const { discount, remain } = calPercentDiscountByCategory(final_price, total_price, shoppings, shoppingsCate, item)
          console.info("---- campaign PERCENT_DISCOUNT_BY_CATEGORY --> discount: ", discount, " remain: ", remain)
          return { discount_price: discount_price + discount, final_price: remain }
        }


        if (item.id === CampaignId.DISCOUNT_BY_POINTS) {
          const { discount, remain } = calDiscountByPoints(final_price, points, item)
          console.info("---- campaign DISCOUNT_BY_POINTS --> discount: ", discount, " remain: ", remain)
          return { discount_price: discount_price + discount, final_price: remain }
        }

        if (item.id === CampaignId.SPECIAL_CAMPAIGN) {
          const { discount, remain } = calSpecialCampaign(final_price, item)
          console.info("---- campaign SPECIAL_CAMPAIGN --> discount: ", discount, " remain: ", remain)
          return { discount_price: discount_price + discount, final_price: remain }
        }
        return { discount_price, final_price }
      },
      { discount_price: 0, final_price: total_price },
    )
    console.info("final discount: ", price.discount_price, " final price: ", price.final_price)

    return Response.json(
      { discount_price: price.discount_price, final_price: price.final_price },
      { status: 200 },
    )
  } catch (error) {
    const message = 'calculate final price error'
    return Response.json({ message }, { status: 400, statusText: error })
  }
}
