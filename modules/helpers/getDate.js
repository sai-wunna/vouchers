const dayNames = ['Sun', 'Mon', 'Tues', 'Wed', 'Thurs', 'Fri', 'Sat']
const monthNames = [
  'Jan',
  'Feb',
  'Mar',
  'April',
  'May',
  'June',
  'July',
  'Aug',
  'Sept',
  'Oct',
  'Nov',
  'Dec',
]

function getMonthName(dateStr) {
  const idx = parseInt(dateStr.split('-')[1])
  return monthNames[idx]
}
// return newer date first
function calculatePageDate(firstDate, lastDate) {
  const [y1, m1] = firstDate.split('-').map((item) => Number(item))
  const [y2, m2] = lastDate.split('-').map((item) => Number(item))

  if (y1 === y2 && m1 === m2) {
    return 'Sales Of This Month'
  } else if (y1 === y2) {
    return `${monthNames[m1 - 1]} - ${monthNames[m2 - 1]}`
  } else if (m1 === m2) {
    return 'Sales Of This Month'
  } else {
    return `${y1 + '/' + m1} - ${y2 + '/' + m2}`
  }
}

function getFormatDate() {
  const currentDate = new Date()

  const year = currentDate.getFullYear().toString()
  const month = (currentDate.getMonth() + 1).toString().padStart(2, '0') // Get month and pad with leading zero if necessary
  const day = currentDate.getDate().toString().padStart(2, '0') // Get day and pad with leading zero if necessary

  return year + '-' + month + '-' + day
}

function getDayName() {
  const currentDayIdx = new Date().getDay()
  return dayNames[currentDayIdx]
}

export { getMonthName, calculatePageDate, getFormatDate, getDayName }
