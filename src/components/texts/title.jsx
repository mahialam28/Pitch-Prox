import { cn } from "@/utils.js/cn"

const Title = ({
  className ="", 
  variant="regular", 
  children
}) => 
{

  const variants = 
  {
    large: "xl:text-[60px] lg:text-4xl text-3xl xl:leading-[110%] md:leading-10",
    regular: "xl:text-[34px] lg:text-3xl text-2xl ",
    small: "md:text-[22px] text-xl"
  }
  const baseClass = `font-bold text-dark-black font-secondary text tracking-wide`
  return (
    <p className={cn(baseClass, className, variants[variant])}>{children}</p>
  )
}

export default Title