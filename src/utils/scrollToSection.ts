export function scrollToSection(
  sectionId: string,
  behavior: ScrollBehavior = 'smooth',
): boolean {
  const target = document.getElementById(sectionId)

  if (!target) return false

  const scrollMarginTop = Number.parseFloat(
    window.getComputedStyle(target).scrollMarginTop,
  ) || 0
  const targetTop = target.getBoundingClientRect().top + window.scrollY - scrollMarginTop

  window.scrollTo({
    top: Math.max(0, targetTop),
    left: 0,
    behavior,
  })

  return true
}
