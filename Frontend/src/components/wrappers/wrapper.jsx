import { cn } from "@/utils.js/cn";

const Wrapper = ({
  className = "",
  variant = "bottomSection",
  children

}) => 
{
  const variants = 
  {
    full: "xl:py-12 lg:py-10 py-8" ,
    top: "xl:pt-12 lg:pt-10 pt-8",
    bottom: "xl:pb-12 lg:pb-10 pb-8",
    section: "xl:py-6 lg:py-5 py-4",
    bottomSection: "xl:pb-6 lg:pb-5 pb-4",
    bottomSmall: "py-12 sm:py-16 md:py-20",
  }
  const baseClass = "";

  return (
    <div className={cn(baseClass, className, variants[variant])}>{children}</div>
  )
}

export default Wrapper