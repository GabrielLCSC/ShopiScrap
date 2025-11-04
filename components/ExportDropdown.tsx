"use client"

import { useState, useRef, useEffect, useCallback } from "react"

interface ExportDropdownProps {
  onExportJSON: () => void
  onExportCSV: () => void
  className?: string
  onOpenChange?: (isOpen: boolean) => void
}

export default function ExportDropdown({ onExportJSON, onExportCSV, className = "", onOpenChange }: ExportDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [openUpward, setOpenUpward] = useState(false)
  const [alignLeft, setAlignLeft] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  const handleToggle = () => {
    const newState = !isOpen
    setIsOpen(newState)
    onOpenChange?.(newState)
  }

  const handleClose = useCallback(() => {
    setIsOpen(false)
    onOpenChange?.(false)
  }, [onOpenChange])

  // Détecter la position et ajuster l'ouverture du dropdown
  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      const spaceBelow = window.innerHeight - rect.bottom
      const spaceAbove = rect.top
      const dropdownHeight = 180 // Hauteur approximative du dropdown
      const dropdownWidth = 192 // w-48 = 12rem = 192px
      
      // Si pas assez d'espace en bas, ouvrir vers le haut
      setOpenUpward(spaceBelow < dropdownHeight && spaceAbove > spaceBelow)
      
      // Si pas assez d'espace à droite, aligner à gauche
      const spaceRight = window.innerWidth - rect.right
      setAlignLeft(spaceRight < dropdownWidth)
    }
  }, [isOpen])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        handleClose()
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [handleClose])

  return (
    <div className={`relative ${className}`} ref={dropdownRef} style={{ zIndex: 9999 }}>
      <button
        ref={buttonRef}
        onClick={handleToggle}
        className="w-full px-6 py-3 rounded-xl gradient-green text-white font-semibold shadow-lg hover:shadow-xl hover:brightness-110 transition-all duration-300 flex items-center justify-center gap-2"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        Exporter
        <svg 
          className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div 
          className={`absolute w-48 bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden animate-scale-in ${
            openUpward ? 'bottom-full mb-2' : 'top-full mt-2'
          } ${
            alignLeft ? 'left-0' : 'right-0'
          }`} 
          style={{ zIndex: 10000 }}
        >
          <button
            onClick={() => {
              onExportJSON()
              handleClose()
            }}
            className="w-full px-4 py-3 text-left hover:bg-[#A8D8EA]/20 transition-colors flex items-center gap-3 text-slate-700 hover:text-[#7BB5D8]"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            <div>
              <p className="font-semibold">JSON</p>
              <p className="text-xs text-slate-500">Format structuré</p>
            </div>
          </button>

          <div className="border-t border-white/30"></div>

          <button
            onClick={() => {
              onExportCSV()
              handleClose()
            }}
            className="w-full px-4 py-3 text-left hover:bg-[#A8D8EA]/20 transition-colors flex items-center gap-3 text-slate-700 hover:text-[#7BB5D8]"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <div>
              <p className="font-semibold">CSV</p>
              <p className="text-xs text-slate-500">Excel compatible</p>
            </div>
          </button>
        </div>
      )}
    </div>
  )
}

