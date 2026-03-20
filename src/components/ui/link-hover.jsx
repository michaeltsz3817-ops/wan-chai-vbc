'use client'

import React, { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'

const DefaultImg = 'https://images.unsplash.com/photo-1592656094267-764a45159577?w=800&q=80'

const DefaultItems = [
  {
    imgUrl: 'https://images.unsplash.com/photo-1592656094267-764a45159577?w=800&q=80',
    title: 'Match Highlights',
  },
  {
    imgUrl: 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=800&q=80',
    title: 'Team Spirit',
  },
  {
    imgUrl: 'https://images.unsplash.com/photo-1547347690-360662657e4e?w=800&q=80',
    title: 'The Court',
  },
  {
    imgUrl: 'https://images.unsplash.com/photo-1511943063151-237cb0ef9ff2?w=800&q=80',
    title: 'Training Day',
  },
  {
    imgUrl: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&q=80',
    title: 'Champions',
  },
]

export default function ImageHover({ items = DefaultItems }) {
  const sectionRef = useRef(null)
  const previewContainerRef = useRef(null)
  const newImgRef = useRef(null)

  useGSAP(
    () => {
      if (!sectionRef.current) return
      const previewContainer = previewContainerRef.current
      const menuLinkItems = sectionRef.current.querySelectorAll('.menu-link-item')

      let lastHoveredIndex = null

      const handleMouseOver = (index) => {
        if (index !== lastHoveredIndex) {
          const imgContainer = document.createElement('div')
          imgContainer.classList.add(
            'temp-image',
            'absolute',
            'rotate-[-30deg]',
            '-left-1/2',
            'top-[125%]',
            'w-full',
            'h-full'
          )
          const img = document.createElement('img')
          img.src = items[index].imgUrl
          img.alt = ''
          img.classList.add('w-full', 'h-full', 'object-cover', 'rounded-3xl', 'shadow-2xl')
          imgContainer.appendChild(img)
          previewContainer.appendChild(imgContainer)

          gsap.to(imgContainer, {
            top: '0%',
            left: '0%',
            rotate: 0,
            duration: 1.25,
            ease: 'power3.out',
            onComplete: () => {
              gsap.delayedCall(2, () => {
                const allImgContainers = previewContainer.querySelectorAll('.temp-image')

                if (allImgContainers.length > 1) {
                  Array.from(allImgContainers)
                    .slice(0, -1)
                    .forEach((container) => {
                      setTimeout(() => {
                        container.remove()
                      }, 2000)
                    })
                }
              })
            },
          })

          lastHoveredIndex = index
        }
      }

      menuLinkItems.forEach((item, index) => {
        item.addEventListener('mouseover', () => handleMouseOver(index))
      })

      return () => {
        menuLinkItems.forEach((item, index) => {
          item.removeEventListener('mouseover', () => handleMouseOver(index))
        })
      }
    },
    { scope: sectionRef, dependencies: [items] }
  )

  return (
    <section
      ref={sectionRef}
      className='flex flex-col md:flex-row items-center gap-10 md:gap-16 py-10 md:py-20 h-[600px] md:h-[500px]'
    >
      <div className='flex-1 w-full'>
        <ul className='flex flex-col gap-4 md:gap-6 text-3xl md:text-5xl font-black italic tracking-tighter uppercase'>
          {items.map(({ title }) => (
            <li 
              key={title} 
              className='menu-link-item cursor-pointer transition-all duration-300 text-white/20 hover:text-emerald-400 hover:translate-x-4'
            >
              {title}
            </li>
          ))}
        </ul>
      </div>
      
      <div
        ref={previewContainerRef}
        className='relative w-full max-w-[280px] md:max-w-90 min-h-[350px] rotate-6 [clip-path:polygon(0_0,100%_0,100%_100%,0%_100%)]'
      >
        <img src={DefaultImg} className='h-full w-full object-cover rounded-3xl opacity-50' alt='' />

        <div
          ref={newImgRef}
          className='absolute top-[125%] -left-1/2 h-full w-full rotate-[-30deg]'
        >
          <img
            src={items[1].imgUrl}
            className='h-full w-full object-cover rounded-3xl'
            alt=''
          />
        </div>
      </div>
    </section>
  )
}
