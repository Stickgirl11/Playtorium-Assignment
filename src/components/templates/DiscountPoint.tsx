import React from 'react'
import { InputNumber } from '../molecules'

const DiscountPoint = ({ setPoints }) => {
  return (
    <div>
      <InputNumber placeholder={'Enter a point'} onChange={(p) => setPoints(p)} />
      <span> Points</span>
      <span className="text-red-300 ml-4 mr-2">*</span>
      <span className="font-light">The maximum discount is 20% of the total prices</span>
    </div>
  )
}

export default DiscountPoint
