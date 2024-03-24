function deepCopy(obj) {
  // Check if obj is null or not an object
  if (obj === null || typeof obj !== 'object') {
    return obj // Return the original value if it's not an object
  }

  // Create an empty object/array to store the copied properties
  const newObj = Array.isArray(obj) ? [] : {}

  // Iterate over each property in the object
  for (let key in obj) {
    // Check if the property is an own property (not inherited)
    if (obj.hasOwnProperty(key)) {
      // Recursively copy nested objects/arrays
      newObj[key] = deepCopy(obj[key])
    }
  }

  return newObj
}

export default deepCopy
