import PropTypes from 'prop-types'
import React from 'react'

export const Counter = ({
  value,
  onIncrement,
  onDecrement,
  onIncrementAsync
}: {
  value: number
  onIncrement: any
  onDecrement: any
  onIncrementAsync: any
}) =>
  <div>
    <button onClick={onIncrementAsync}>
      Increment after 1 second
    </button>
    {' '}

    <button onClick={onIncrement}>
      Increment
        </button>
    {' '}
    <button onClick={onDecrement}>
      Decrement
        </button>
    <hr />
    <div>
      Clicked: {value} times
        </div>
  </div>

Counter.propTypes = {
  value: PropTypes.number.isRequired,
  onIncrement: PropTypes.func.isRequired,
  onDecrement: PropTypes.func.isRequired
}
