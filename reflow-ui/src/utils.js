export const getPagePos = (el) => {
  let curleft = 0
  let curtop = 0
  if (el.offsetParent) {
    do {
      curleft += el.offsetLeft
      curtop += el.offsetTop
    } while (el = el.offsetParent)
  }
  return { x : curleft, y : curtop }
}
