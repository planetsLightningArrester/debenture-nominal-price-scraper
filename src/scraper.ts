import { parseFromString } from 'dom-parser'
import { request } from 'gaxios'
import { DateTime } from 'luxon'
import { type Asset, info, warn, err } from './globals'

/**
 * Updates assets using puppeteer
 * @param assets the assets to update
 * @returns whether any assets was updated
 */
export async function updateAssets(assets: Asset[]): Promise<[boolean, Error[]]> {
  // return await puppeteerScraper(assets)
  return await gaxiosScraper(assets)
}

/**
 * Updates assets using puppeteer
 * @param assets the assets to update
 * @returns whether any assets was updated
 */
// async function puppeteerScraper(assets: Asset[]): Promise<boolean> {
//   const today = DateTime.now().setZone('America/New_York').toFormat('yyyy-MM-dd')
//   if (typeof assets.find(requiredAsset => requiredAsset.refDate !== today) === 'undefined') {
//     warn.log('All assets are already up-to-date')
//     return false
//   }

//   const browser = await puppeteer.launch()
//   const page = await browser.newPage()

//   const baseUrl = atob(atob('YUhSMGNITTZMeTlrWVhSaExtRnVZbWx0WVM1amIyMHVZbkl2WkdWaVpXNTBkWEpsY3c9PQ'))

//   let somethingChanged = false
//   for await (const requiredAsset of assets) {
//     if (typeof requiredAsset !== 'undefined' && requiredAsset.refDate === today) {
//       warn.log(`Skipping already updated asset '${requiredAsset.code}'`)
//       continue
//     }

//     try {
//       await page.goto(`${baseUrl}/${requiredAsset.code}/caracteristicas`)
//     } catch (error) {
//       err.log(`Couldn't get the results for the asset '${requiredAsset.code}'. Make sure its code is correct`)
//       if (error instanceof Error) err.log(error.message)
//       else err.log(error)
//       continue
//     }

//     await page.setViewport({ width: 1080, height: 1024 })

//     info.log(`💰 Scraping for the nominal price of '${requiredAsset.code}'`)
//     await page.waitForSelector('.lower-card-item-value')
//     let gotTheValue = false
//     for await (const el of (await page.$$('.lower-card-item'))) {
//       // Find the title and extract the refDate
//       let refDate = await el.$eval('.lower-card-item-title', (title) => {
//         if (title.textContent !== null && title.textContent.includes('PU PAR')) {
//           return title.textContent.replace(/\n/g, ' ').replace(/.*ref\. +([\d/]+).*/, '$1')
//         } else return undefined
//       })

//       // If there's refDate, get the new value
//       if (typeof refDate !== 'undefined') {
//         refDate = DateTime.fromFormat(refDate, 'dd/MM/yyyy').toFormat('yyyy-MM-dd')
//         const newValue = (await el.$eval('.lower-card-item-value', (value) => value.textContent ?? value.textContent))
//         if (typeof newValue === 'string') {
//           gotTheValue = true
//           // Update value if already exist
//           info.log(`🔄 Updating asset => ${requiredAsset.code}: ${newValue} (${refDate})`)
//           requiredAsset.value = newValue
//           requiredAsset.refDate = refDate
//           somethingChanged = true
//         } else {
//           err.log(`Unexpected nominal price for '${requiredAsset.code}'`)
//         }
//         break
//       }
//     }
//     if (!gotTheValue) {
//       err.log(`Couldn't get PU PAR title in the page for '${requiredAsset.code}'`)
//     }
//   }
//   await browser.close()
//   return somethingChanged
// }

/**
 * Updates assets using gaxios
 * @param assets the assets to update
 * @returns whether any assets was updated
 */
async function gaxiosScraper(assets: Asset[]): Promise<[boolean, Error[]]> {
  const today = DateTime.now().setZone('America/New_York')
  const todayString = today.toFormat('yyyy-MM-dd')
  if (typeof assets.find(requiredAsset => requiredAsset.refDate !== todayString) === 'undefined') {
    warn.log('All assets are already up-to-date')
    return [false, []]
  }

  const baseUrl = atob(atob('YUhSMGNITTZMeTkzZDNjdVpHVmlaVzUwZFhKbGN5NWpiMjB1WW5JdlpYaHdiRzl5Wlc5emJtUXZZMjl1YzNWc2RHRmhaR0ZrYjNNdlpXMXBjM052WlhOa1pXUmxZbVZ1ZEhWeVpYTXZjSFZvYVhOMGIzSnBZMjlmY2k1aGMzQQ'))

  const errors: Error[] = []
  let somethingChanged = false
  const lastWeekString = today.minus({ week: 1 }).toFormat('dd/MM/yyyy').replace('/', '%2F')
  const nextWeekString = today.plus({ week: 1 }).toFormat('dd/MM/yyyy').replace('/', '%2F')
  for await (const requiredAsset of assets) {
    if (typeof requiredAsset !== 'undefined' && requiredAsset.refDate === todayString) {
      warn.log(`Skipping already updated asset '${requiredAsset.code}'`)
      continue
    }

    try {
      const response = await request({
        method: 'POST',
        url: baseUrl,
        data: `ativo=${requiredAsset.code.padEnd(10, '+')}&dt_ini=${lastWeekString}&dt_fim=${nextWeekString}`,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      })
      if (typeof response.data !== 'string') {
        const message = `Unknown data type for the asset '${requiredAsset.code}': ${response.data as string}`
        err.log(message)
        errors.push(new Error(message))
        continue
      }

      info.log(`💰 Scraping for the nominal price of '${requiredAsset.code}'`)

      // Getting DOM model
      const dom = parseFromString(response.data)
      const assetCell = dom.getElementsByTagName('td').find(e => e.textContent === requiredAsset.code)
      if (typeof assetCell === 'undefined') {
        const message = `Couldn't find a table with the element '${requiredAsset.code}'`
        err.log(message)
        errors.push(new Error(message))
        continue
      }
      const parentCell = assetCell.parentNode
      if (parentCell === null) {
        const message = `Couldn't find a table with the element '${requiredAsset.code}'`
        err.log(message)
        errors.push(new Error(message))
        continue
      }
      const refDateCell = parentCell.childNodes[1]
      if (refDateCell === null || typeof refDateCell === 'undefined') {
        const message = `The parent cell of the row should have childNodes[1] for asset '${requiredAsset.code}'`
        err.log(message)
        errors.push(new Error(message))
        continue
      }
      const refDate = DateTime.fromFormat(refDateCell.textContent, 'dd/MM/yyyy')
      if (!refDate.isValid) {
        const message = `Unexpected date format '${refDateCell.textContent}' for asset '${requiredAsset.code}'`
        err.log(message)
        errors.push(new Error(message))
        continue
      }
      const refDateString = refDate.toFormat('yyyy-MM-dd')

      const valueCell = parentCell.childNodes[5]
      if (valueCell === null || typeof valueCell === 'undefined') {
        const message = `The parent cell of the row should have childNodes[5] for asset '${requiredAsset.code}'`
        err.log(message)
        errors.push(new Error(message))
        continue
      }
      const value = valueCell.textContent
      if (value.match(/^\d{1,3}(\.\d{3})*,\d+/) === null) {
        const message = `Unexpected value format '${value}' for asset '${requiredAsset.code}'`
        err.log(message)
        errors.push(new Error(message))
        continue
      }

      // Update value if already exist
      info.log(`🔄 Updating asset => ${requiredAsset.code}: ${value} (${refDateString})`)
      requiredAsset.value = value
      requiredAsset.refDate = refDateString

      somethingChanged = true
    } catch (error) {
      let message = `Couldn't get the results for the asset '${requiredAsset.code}'. Make sure its code is correct`
      if (error instanceof Error) message = `${message}: ${error.message}`
      else message = `${message}: ${error as string}`
      err.log(message)
      errors.push(new Error(message))
      continue
    }
  }
  return [somethingChanged, errors]
}
