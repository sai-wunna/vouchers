function hexToRgbArr(hex) {
  // Remove '#' from the beginning if present
  hex = hex.replace(/^#/, '')

  // Parse the hex string to get individual color components
  const r = parseInt(hex.substring(0, 2), 16)
  const g = parseInt(hex.substring(2, 4), 16)
  const b = parseInt(hex.substring(4, 6), 16)

  // Return the RGB values as an array
  return [r, g, b]
}

export { hexToRgbArr }
