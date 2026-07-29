const fs = require('fs');
const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');
const logger = require('./logger');
const { isDemoMode } = require('./db');

/**
 * Retorna uma instancia autenticada da planilha do Google Sheets.
 * Equivalente ao gspread.authorize() + open_by_key() que voce ja usa em Python.
 */
async function getSpreadsheet() {
  if (isDemoMode()) return null;

  const keyPath = process.env.GOOGLE_SERVICE_ACCOUNT_KEY_PATH;
  const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;

  if (!fs.existsSync(keyPath)) {
    throw new Error(`Arquivo de credenciais nao encontrado em ${keyPath}`);
  }

  const credentials = JSON.parse(fs.readFileSync(keyPath, 'utf-8'));

  const jwt = new JWT({
    email: credentials.client_email,
    key: credentials.private_key,
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });

  const doc = new GoogleSpreadsheet(spreadsheetId, jwt);
  await doc.loadInfo();

  logger.info('Conectado ao Google Sheets', { title: doc.title });
  return doc;
}

module.exports = { getSpreadsheet };
