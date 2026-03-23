import * as React from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

const floatingAnimation = {
  initial: { y: 0 },
  animate: {
    y: [-2, 2, -2],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
}

const DockIconButton = React.forwardRef(({ icon: Icon, label, onClick, className, active }, ref) => {
  return (
    <motion.button
      ref={ref}
      whileHover={{ scale: 1.1, y: -2 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={cn(
        "relative group p-3 rounded-2xl transition-all duration-300",
        active ? "bg-emerald-500/10 text-emerald-400" : "hover:bg-white/5 text-gray-500 hover:text-gray-300",
        className
      )}
    >
      <Icon className={cn("w-5 h-5", active ? "text-emerald-400" : "")} />
      
      {/* Tooltip */}
      <span className={cn(
        "absolute -top-10 left-1/2 -translate-x-1/2",
        "px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest",
        "bg-[#050505]/90 text-white backdrop-blur-xl border border-white/10 shadow-2xl",
        "opacity-0 md:group-hover:opacity-100",
        "transition-all duration-300 whitespace-nowrap pointer-events-none md:translate-y-2 md:group-hover:translate-y-0"
      )}>
        {label}
      </span>

      {/* Active Dot */}
      {active && (
        <motion.div 
          layoutId="dock-dot"
          className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-emerald-500 rounded-full"
        />
      )}
    </motion.button>
  )
})
DockIconButton.displayName = "DockIconButton"

const Dock = React.forwardRef(({ items, className }, ref) => {
  return (
    <div ref={ref} className={cn("fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] scale-[0.9] origin-bottom md:scale-100", className)}>
      <motion.div
        initial="initial"
        animate="animate"
        variants={floatingAnimation}
        className={cn(
          "flex items-center gap-2 p-2 rounded-[32px]",
          "backdrop-blur-3xl border shadow-2xl",
          "bg-white/5 border-white/10",
          "hover:border-white/20 transition-all duration-300"
        )}
      >
        {items.map((item, idx) => {
          if (item.type === 'separator') {
            return <div key={`sep-${idx}`} className="w-[1px] h-6 bg-white/10 mx-1" />
          }
          if (item.type === 'special') {
             return (
                <button
                    key={item.label}
                    onClick={item.onClick}
                    className="w-14 h-14 bg-emerald-500 rounded-[22px] flex items-center justify-center shadow-2xl shadow-emerald-500/40 active:scale-95 transition-all hover:rotate-12 group mx-1"
                >
                    <item.icon className="w-8 h-8 text-white group-hover:scale-110 transition-transform" />
                </button>
             )
          }
          return (
            <DockIconButton key={item.label} {...item} />
          )
        })}
      </motion.div>
    </div>
  )
})
Dock.displayName = "Dock"

export { Dock }
