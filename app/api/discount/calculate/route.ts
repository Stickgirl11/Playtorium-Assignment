import campaign_campaign_parameter from '../../../../public/relation/cam-cam_cate-cam-param.json'

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
  console.info('- [parameters] <amount>: ', discount)
  const remain = final_price - discount

  return { discount, remain }
}

function calPercentDiscount(final_price, item) {
  const parameters = clonedeep(campaign_campaign_parameter).find(
    ({ id }) => id === item?.id,
  )?.parameters
  const percent = parameters?.find(({ key }) => key === 'percent')?.value ?? 0
  console.info('- [parameters] <percent>: ', percent, '%')
  const discount = (percent / 100) * final_price
  const remain = final_price - discount

  return { discount, remain }
}

function calPercentDiscountByCategory(
  final_price,
  total_price,
  shoppings,
  shoppingsCate,
  item,
) {
  const parameters = clonedeep(campaign_campaign_parameter).find(
    ({ id }) => id === item?.id,
  )?.parameters
  const percent = parameters?.find(({ key }) => key === 'percent')?.value ?? 0
  console.info('- [parameters] <percent>: ', percent, '%')


  //* step1: find share shopping cate to total price
  const shoppingsCateId = shoppingsCate.map(({ id })=> id)
  console.info('- [cal] shoppingsCateId: ', shoppingsCateId)
  const shoppingCategory = shoppings?.filter(({ category }) => shoppingsCateId.includes(category?.id))
  console.info('- [cal] shoppingCategory: ', shoppingCategory.map(({ name, category})=> `${name} ${category?.name}`))
  const shoppingCatePrice = shoppingCategory?.reduce(
    (total, { price }) => {
      return total + price
    },
    0,
  )
  console.info('- [cal] shoppingCatePrice: ', shoppingCatePrice)
  console.info('- [cal] total price: ', total_price)
  const categoryShare = (shoppingCatePrice / total_price) * 100
  console.info('- [cal] categoryShare: ', categoryShare,"%")
  const floorCategoryPercent = Math.round(categoryShare)
  console.info('- [result step 1] floorCategoryPercent: ', floorCategoryPercent,"%")

  //* step2: cal share price from current price 
  const categorySharePrice= (floorCategoryPercent/100) * final_price   
  console.info('- [result step 2] categorySharePrice: ', categorySharePrice)


  //* step3: cal category discount price from category share price 
  const floatDiscount = (percent / 100) * categorySharePrice
  console.info('- [cal] floatDiscount: ', floatDiscount)
  const discount = Math.round(floatDiscount)
  console.info('- [result step 3] floor discount: ', discount)
  const remain = final_price - discount 

  return { discount, remain }
}

function calDiscountByPoints(final_price, points, item) {
  const parameters = clonedeep(campaign_campaign_parameter).find(
    ({ id }) => id === item?.id,
  )?.parameters
  const maxPricePercent =
    parameters?.find(({ key }) => key === 'max_price_percent')?.value ?? 0
  console.info('- [parameters] <max_price_percent>: ', maxPricePercent, '%')
  const onePointPrice =
    parameters?.find(({ key }) => key === 'one_point_price')?.value ?? 0
  console.info('- [parameters] <one_point_price>: ', onePointPrice)

  const maxDiscount = final_price * (maxPricePercent / 100)
  console.info('- [cal] maxDiscount: ', maxDiscount)
  const pointDiscount = points * onePointPrice
  console.info('- [cal] pointDiscount: ', pointDiscount)
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
  console.info('- [parameters] <every>: ', every)
  console.info('- [parameters] <discount>: ', discountEvery)
  const discount = Math.floor(final_price / every) * discountEvery
  const remain = final_price - discount

  return { discount, remain }
}

export async function POST(req: Request) {
  const body = await req.json()
  try {
    console.info('\n========== 🧮 START CALCULATION ==========')
    const { shoppings, campaigns, shoppingsCate, points } = body
    console.info('Request Body Received: ')
    console.info('- shoppings : ', shoppings.map(({ name})=> name))
    console.info('- campaigns : ', campaigns.map(({ name})=> name))
    console.info('- shoppingsCate : ', shoppingsCate)
    console.info('- points : ', points)

    console.info('--------- prepare data ---------')
    const total_price = getTotalPrice(shoppings)
    console.info('- total price --> ', total_price)
    const sorted_campaigns = getSortedByCampaignOrder(campaigns)
    console.info(
      '- sorted campaigns --> ',
      sorted_campaigns.map(({ name }) => name),
    )

    console.info('--------- discount campaign ---------')
    const price = sorted_campaigns.reduce(
      ({ discount_price, final_price }, item) => {
        if (item.id === CampaignId.FIXED_AMOUNT) {
          const { discount, remain } = calFixedAmount(final_price, item)
          console.info(
            '1.campaign FIXED_AMOUNT ',
            'start: ',
            final_price,
            'discount: ',
            discount,
            ' remain: ',
            remain,
          )

          return {
            discount_price: discount_price + discount,
            final_price: remain,
          }
        }

        if (item.id === CampaignId.PERCENT_DISCOUNT) {
          const { discount, remain } = calPercentDiscount(final_price, item)
          console.info(
            '2.campaign PERCENT_DISCOUNT ',
            'start: ',
            final_price,
            'discount: ',
            discount,
            ' remain: ',
            remain,
          )

          return { discount_price: discount_price + discount, final_price: remain }
        }

        if (item.id === CampaignId.PERCENT_DISCOUNT_BY_CATEGORY) {
          const { discount, remain } = calPercentDiscountByCategory(
            final_price,
            total_price,
            shoppings,
            shoppingsCate,
            item,
          )
          console.info(
            '3.campaign PERCENT_DISCOUNT_BY_CATEGORY  ',
            'start: ',
            final_price,
            'discount: ',
            discount,
            ' remain: ',
            remain,
          )
          return { discount_price: discount_price + discount, final_price: remain }
        }

        if (item.id === CampaignId.DISCOUNT_BY_POINTS) {
          const { discount, remain } = calDiscountByPoints(final_price, points, item)
          console.info(
            '4.campaign DISCOUNT_BY_POINTS  ',
            'start: ',
            final_price,
            'discount: ',
            discount,
            ' remain: ',
            remain,
          )
          return { discount_price: discount_price + discount, final_price: remain }
        }

        if (item.id === CampaignId.SPECIAL_CAMPAIGN) {
          const { discount, remain } = calSpecialCampaign(final_price, item)
          console.info(
            '5.campaign SPECIAL_CAMPAIGN  ',
            'start: ',
            final_price,
            'discount: ',
            discount,
            ' remain: ',
            remain,
          )
          return { discount_price: discount_price + discount, final_price: remain }
        }
        return { discount_price, final_price }
      },
      { discount_price: 0, final_price: total_price },
    )

    console.info('--------- final result ---------')
    console.info(
      'final discount: ',
      price.discount_price,
      ' final price: ',
      price.final_price,
    )
    console.info('========== ✅ END CALCULATION ==========\n')

    return Response.json(
      { discount_price: price.discount_price, final_price: price.final_price },
      { status: 200 },
    )
  } catch (error) {
    console.error('\n========== ❌ ERROR IN CALCULATION ==========')
    console.error(error)
    console.error('===========================================\n')
    return Response.json(
      { message: '- [cal]culate final price error' },
      { status: 400, statusText: error },
    )
  }
}
