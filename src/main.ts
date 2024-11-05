import { program } from 'commander'
import { google } from 'googleapis'
import { type Asset, info, warn, err } from './globals'
import { updateAssets } from './scraper'
import { DateTime } from 'luxon'

/** Spreadsheet with the data to update */
const spreadsheetId = atob(atob('TVZkamQyTmpNREJmZVhnMFZVSmtUV2hWY0dabldVeHNkbEU1WHpOU05VUmpiMVJTVGxnNU1sRnBlbEU'))
/** Spreadsheet format starting row */
const spreadsheetStartRow = 1
/** Spreadsheet format code's column */
const spreadsheetCodeColumn = 0
/** Spreadsheet format PU PAR's column */
const spreadsheetValueColumn = 1
/** Spreadsheet format reference date's column */
const spreadsheetRefDateColumn = 2

async function main(): Promise<void> {
  program
    .name('debenture-nominal-price-scraper')
    .description("Scrap debenture's nominal price and update Google Spreadsheets")
    .requiredOption('-g, --google <credential>', 'Google Service Account JSON key stringified')
    .parse()

  const googleCredential: string = program.opts().google

  const auth = new google.auth.GoogleAuth({
    credentials: JSON.parse(googleCredential),
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  })

  info.log('📝 Getting Spreadsheet data')
  const assets: Asset[] = []
  const sheets = google.sheets({ version: 'v4', auth })

  try {
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'DataSheet' // Sheet name
    })
    const rows = res.data.values
    if (!Array.isArray(rows) || rows.length === 0) {
      err.log(`The spreadsheet '${spreadsheetId}' returned no data`)
      return undefined
    } else {
      for (let i = spreadsheetStartRow; i <= rows.length - 1; i++) {
        const code: string | undefined = rows[i][spreadsheetCodeColumn]
        const value: string | undefined = rows[i][spreadsheetValueColumn]
        const refDate: string | undefined = rows[i][spreadsheetRefDateColumn]
        if (typeof code === 'string') {
          assets.push({ code: code.toUpperCase(), value: typeof value !== 'undefined' ? value : '0,0000', refDate: typeof refDate !== 'undefined' ? DateTime.fromFormat(refDate, 'dd/MM/yyyy').toFormat('yyyy-MM-dd') : '' })
        }
      }
    }
  } catch (error) {
    err.log('Error getting the Spreadsheet data')
    if (error instanceof Error) err.log(error.message)
    else err.log(error)
    return
  }

  if (assets.length === 0) {
    warn.log('No assets found in the Spreadsheet')
    return
  }

  info.log('🏊 Scraping for market and asset value')

  const [updated, errors] = await updateAssets(assets)

  if (updated) {
    info.log('📝 Updating the Spreadsheet')
    try {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        auth,
        requestBody: {
          requests: [
            {
              updateCells: {
                range: {
                  sheetId: 0,
                  startRowIndex: spreadsheetStartRow,
                  endRowIndex: assets.length + 1,
                  startColumnIndex: spreadsheetCodeColumn,
                  endColumnIndex: 3
                },
                rows: assets.map(a => {
                  return {
                    values: [
                      { userEnteredValue: { stringValue: a.code } },
                      { userEnteredValue: { stringValue: a.value } },
                      { userEnteredValue: { stringValue: DateTime.fromFormat(a.refDate, 'yyyy-MM-dd').toFormat('dd/MM/yyyy') } }
                    ]
                  }
                }),
                fields: 'userEnteredValue'
              }
            }
          ]
        }
      })
    } catch (error) {
      err.log('Error setting the Spreadsheet data')
      if (error instanceof Error) err.log(error.message)
      else err.log(error)
      return
    }
  }

  info.log('🏁 Script is done')
  if (errors.length > 0) {
    throw new Error('Check errors thrown')
  }
}

main().catch(e => { throw e })
