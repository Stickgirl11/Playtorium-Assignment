import React from 'react'
import { InputNumber } from '../molecules'

const DiscountPoint = ({ points, setPoints }) => {
  return (
    <div>
      <InputNumber placeholder={'Enter a point'} onChange={(p) => setPoints(p)} />
      <span> Points</span>
      {!points && <span className="text-red-300"> *required</span>}
    </div>
  )
}

export default DiscountPoint
