import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.clientWidth < MOBILE_BREAKPOINT
    }
    return false
  })

  React.useEffect(() => {
    const checkMobile = () => {
      const width = document.documentElement.clientWidth
      setIsMobile(width < MOBILE_BREAKPOINT)
    }
    
    checkMobile()
    
    window.addEventListener("resize", checkMobile)
    document.addEventListener("visibilitychange", checkMobile)
    
    const interval = setInterval(checkMobile, 1000)
    
    return () => {
      window.removeEventListener("resize", checkMobile)
      document.removeEventListener("visibilitychange", checkMobile)
      clearInterval(interval)
    }
  }, [])

  return isMobile
}
