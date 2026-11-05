import { cn } from "@/utils.js/cn"

const Text = ({
  className = "",
  variant = "regular",
  children
}) => 
{

  const variants = 
  {
    large: "lg:text-xl text-lg",
    medium: "lg:text-lg, text-[16px]",
    regular: "xl:text-[16px] text-[15px]",
    small: "xl:text-sm text-[13px]",
    smaller: "xl:text-xs text-[11px]",
    extraSmall: "text-[8px]"
  }

  const baseClass =`tracking-wide text-medium-black font-primary`
  return (
    <p className={cn(baseClass, className, variants[variant])}>{children}</p>
  )
}

export default Text