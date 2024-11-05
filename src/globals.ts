import { Print, color } from 'printaeu'

/** Asset data */
export interface Asset {
  /** Asset code */
  code: string
  /** Asset reference date */
  refDate: string
  /** Asset PU PAR value */
  value: string
}

export const info = Print.create()
info.preAppend(`[${color.cyan}INFO${color.reset}] `)
info.showDate()
export const warn = Print.create()
warn.preAppend(`[${color.yellow}WARN${color.reset}] `)
warn.showDate()
export const err = Print.create()
err.preAppend(`[${color.red}ERRO${color.reset}] `)
err.showDate()
