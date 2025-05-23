task : 1.people added item -> 2.apply campaign discount -> 3.calculate final price

1. people added item
-  each item have category
[master-table] shopping_item_category (id, name)
    1 Clothing 
    2 Electronics 
    3 Accessories

- can select multiple item :
[main-table] shopping_item (id, name, price, shopping_item_category_id)
    1 T-Shirt 350 1
    2 Hat 250  1
    3 Hoodie 700 1
    4 Watch 850 2 
    5 Bag 640 3 
    6 Belt 230 3 

---------------
2.apply campaign discount (assume people can use whatever discount)
- campaign category (coupon > on top > seasonal)
[master-table] campaign_category (id, name, execution_order)
    1 coupon   1 
    2 on-top   2 
    3 seasonal 3

- can apply multiple (but only 1 per category)
[main-table] campaign (id, name, campaign_category_id)
    1 Fixed amount                            1         
    2 Percentage discount                     1
    3 Percentage discount by item category    2      
    4 Discount by points                      2      
    5 Special campaigns                       3    

- campaign have dynamic parameter
[table] campaign_parameter (id, key, value, campaign_id)
    1 amount     50 1 
    2 percent    10 2
    3 percent    15 3
    4 max_price_points 20 4 
    5 every      300 5 
    6 discount   40 5 

--------
3.calculate final price
[type] Payload {
    shopping : {
        list: []string
    },
    campaign: {
        list: []string,
        discount_by_item_category: ItemCategory,
        discount_by_point_count: number
    }
}
[util-function] getDiscountedPriceByAmount(price, amount) discountedprice{
    return price - amount 
}
[util-function] getDiscountedPriceByPercent(price, percent) discountedprice{
    return price * (percent / 100) // 20% = price * 0.8
}
[util-function] getSortedCampaignByCategory(campaign) sortedCampaign{
    return sorted
}
[util-function] getTotalShoppingItemsPrice(shopping_items) TotalPrice{
    return total price
}

[util-function] getDiscountPriceByCampaign(price, campaign) DiscountPrice{
    return discount price per campaign 

}

[main-function] calculate final price ({ shopping, campaigns }: Payload ) FinalPrice {
    sorted_campaigns = getSortedCampaignByCategory(campaigns.list)
    total_price = getSortedCampaignByCategory(shopping.list)
    final_price = totalPrice
    discounted_price = 0

    // iteration on sorted_campaign to discount totalprice by each applied campaign
    for item in campaign.list {
        discounted_price = discounted_price + getDiscountPriceByCampaign(total_price, item)
        final_price = final_price - discounted_price
    }

    return { total_price, final_price, discounted_price }
}

[WebUI]
1. item list (multiple dropdown)
2. campaign list (multiple dropdown) *hidden choice if same category has selected 
2.1 side dropdown *will show if selected campaign need side dropdown to complete logic
 2.1.1 Percentage discount by item (single dropdown with side-note describe) *must choose specific to discount entire category 
 2.1.2 Discount by points (integer number input with side-note describe)
3. apply calculation (button)
4. display final price (text)