function countStarsAnimate($starCounter, stars) {
  let counter = 0
  $starCounter.classList.add('star-counting')
  const intervalId = setInterval(() => {
    if (counter > stars) {
      clearInterval(intervalId)
      $starCounter.textContent = `${stars.toLocaleString()} stars`
      $starCounter.classList.remove('star-counting')
      return
    }
    $starCounter.textContent = `${calValue(counter)} stars`
  })
  function calValue(num) {
    if (num > 9999) {
      counter += 1000
      return num.toLocaleString()
    } else if (num > 999) {
      counter += 100
      return num.toLocaleString()
    } else {
      counter += 10
      return num.toLocaleString()
    }
  }
}

export default countStarsAnimate
