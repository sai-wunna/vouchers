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

// function getMonthByName(dateStr) {
//   const [year, monthIndex] = dateStr.split('-')
//   return `${monthNames[monthIndex - 1]} ${year}`
// }

function calculatePageDate(firstDate, lastDate) {
  const [y1, m1] = firstDate.split('-')
  const [y2, m2] = lastDate.split('-')
  if (y1 === y2 && m1 === m2) {
    return 'Sales Of This Month'
  } else if (y1 === y2) {
    return `From ${monthNames[m2 - 1]} to ${monthNames[m1 - 1]}`
  } else if (m1 === m2) {
    return 'Sales Of This Month'
  } else {
    return `From ${y2 + '-' + m2} to ${y1 + '-' + m1}`
  }
}

function getFormatDate() {
  const currentDate = new Date()

  const year = currentDate.getFullYear().toString().slice(-2) // Extract the last two digits of the year
  const month = (currentDate.getMonth() + 1).toString().padStart(2, '0') // Get month and pad with leading zero if necessary
  const day = currentDate.getDate().toString().padStart(2, '0') // Get day and pad with leading zero if necessary

  return year + '-' + month + '-' + day
}

export { getMonthName, calculatePageDate, getFormatDate }
