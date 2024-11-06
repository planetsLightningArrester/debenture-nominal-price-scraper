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

/** Error due to scrap issues */
export class ScrapError extends Error {
  /** The asset code that was trying to be retrieved when the error happened */
  assetCode: string

  /**
   * Create a new `ScrapError`
   * @param message the error message
   * @param assetCode the code of the asset
   */
  constructor(message: string, assetCode: string) {
    super(message)
    this.assetCode = assetCode
  }
}

/** Log infos */
export const info = Print.create()
info.preAppend(`[${color.cyan}INFO${color.reset}] `)
info.showDate()
/** Log warnings */
export const warn = Print.create()
warn.preAppend(`[${color.yellow}WARN${color.reset}] `)
warn.showDate()
/** Log errors */
export const err = Print.create()
err.preAppend(`[${color.red}ERRO${color.reset}] `)
err.showDate()
