import * as React from "react"
import { motion } from "framer-motion"

const DockIconButton = React.forwardRef(({ icon: Icon, label, onClick, active }, ref) => {
  return (
    <motion.button
      ref={ref}
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      className="relative flex flex-col items-center gap-1 px-3 py-2 transition-all duration-200"
    >
      <div className={`p-2 rounded-xl transition-all duration-200 ${active ? 'bg-[#FF4500] shadow-lg shadow-[#FF4500]/30' : 'bg-transparent'}`}>
        <Icon className={`w-5 h-5 ${active ? 'text-white' : 'text-[#555]'}`} />
      </div>
      <span className={`text-[8px] font-black uppercase tracking-widest ${active ? 'text-[#FF4500]' : 'text-[#444]'}`}>
        {label}
      </span>
    </motion.button>
  )
})
DockIconButton.displayName = "DockIconButton"

const Dock = React.forwardRef(({ items, className }, ref) => {
  return (
    <div ref={ref} className={`fixed bottom-0 left-0 right-0 z-[100] ${className || ''}`}>
      <div className="flex items-end justify-around px-2 pb-safe"
        style={{ background: 'linear-gradient(to top, #050505 80%, transparent)', borderTop: '1px solid #1a1a1a', paddingBottom: '12px', paddingTop: '8px' }}
      >
        {items.map((item, idx) => {
          if (item.type === 'special') {
            return (
              <motion.button
                key={item.label}
                whileTap={{ scale: 0.9 }}
                onClick={item.onClick}
                className="flex flex-col items-center gap-1"
              >
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-2xl shadow-[#FF4500]/40 -mt-5"
                  style={{ background: 'linear-gradient(135deg, #FF4500, #FF6A00)' }}
                >
                  <item.icon className="w-7 h-7 text-white" />
                </div>
                <span className="text-[8px] font-black uppercase tracking-widest text-[#FF4500]">{item.label}</span>
              </motion.button>
            )
          }
          return <DockIconButton key={item.label} {...item} />
        })}
      </div>
    </div>
  )
})
Dock.displayName = "Dock"

export { Dock }
