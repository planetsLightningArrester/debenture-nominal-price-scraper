# 🏊‍♀️ Debenture nominal price scraper

Scraper to get debentures PU PAR (nominal prices) from a Google Spreadsheet list and update the Spreadsheet with the new values.

## 📰 Content

- [🏊‍♀️ Debenture nominal price scraper](#️-debenture-nominal-price-scraper)
  - [📰 Content](#-content)
  - [🔧 Setup](#-setup)
    - [☁️ Google Setup](#️-google-setup)
  - [📚 Usage](#-usage)
  - [🚀 Workflows](#-workflows)
    - [🏊 Scrap data](#-scrap-data)
  - [📖 Reference](#-reference)

## 🔧 Setup

### ☁️ Google Setup

To get info from Google Spreadsheets, you need a Google token. And to get a Google token, you need a Google project.

Go to your [Google Console](https://console.cloud.google.com/?hl=pt-br) and create a new project. Select your new project and click on `API and services` and select `Library`. Search for `Google Sheets` and enable it.

Once they're active, go back to your [Google Console](https://console.cloud.google.com/?hl=pt-br) and select `Credentials`. Click on the top-middle-ish button-ish `Create credentials` and select `Service Account`. Add an account name and grant access to project ownership (or the higher one). On the Service Accounts tab, click on the top-middle-ish button-ish `Keys` and create a JSON key. This key stringified is the script argument `-g <key>`. The last step is to grab the service account email on the upper tab `Details` and share the Spreadsheet with that email.

## 📚 Usage

Run `npm start` passing your Google Service Account JSON key stringified.

```bash
npm start -- --google '{"type": "service_account","project_id": ...'
```

## 🚀 Workflows

### [🏊 Scrap data](https://github.com/planetsLightningArrester/debenture-nominal-price-scraper/actions/workflows/scraper.yaml)

[![🏊 Scrap data](https://github.com/planetsLightningArrester/debenture-nominal-price-scraper/actions/workflows/scraper.yaml/badge.svg)](https://github.com/planetsLightningArrester/debenture-nominal-price-scraper/actions/workflows/scraper.yaml)

The workflow `.github/workflows/scraper.yaml` runs every 5 min from Monday to Friday checking for updates. The GH secrets `GOOGLE_SERVICE_ACCOUNT_JSON_KEY` is the token passed to the script as arguments.

## 📖 Reference

- [Google Service Account credential](https://github.com/googleapis/google-api-nodejs-client#service-account-credentials)
- [Google Sheets API](https://developers.google.com/sheets/api/)
