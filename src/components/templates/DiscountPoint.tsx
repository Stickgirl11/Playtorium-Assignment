import React from 'react'
import { InputNumber } from '../molecules'

const DiscountPoint = ({ setPoints }) => {
  return (
    <div>
      <InputNumber placeholder={'Enter a point'} onChange={(p) => setPoints(p)} />
      <span> Points</span>
    </div>
  )
}

export default DiscountPoint
