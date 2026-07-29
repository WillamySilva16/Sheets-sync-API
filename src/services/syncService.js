const { getPool, sql, isDemoMode } = require('../config/db');
const { getSpreadsheet } = require('../config/sheets');
const logger = require('../config/logger');

/**
 * Dados de exemplo usados quando DEMO_MODE=true, so pra dar pra rodar
 * o projeto e testar os endpoints sem precisar de banco real.
 */
const MOCK_COLABORADORES = [
  { id: 1, nome: 'Ana Souza', cargo: 'Analista de RH', status: 'Ativo' },
  { id: 2, nome: 'Bruno Lima', cargo: 'Dev Backend', status: 'Ativo' },
  { id: 3, nome: 'Carla Dias', cargo: 'DevOps', status: 'Ferias' }
];

/**
 * Busca os dados de colaboradores no SQL Server.
 * Em modo demo, retorna dados mockados no lugar de bater no banco.
 */
async function fetchColaboradores() {
  if (isDemoMode()) {
    logger.info('DEMO_MODE ativo - usando dados mockados de colaboradores');
    return MOCK_COLABORADORES;
  }

  const pool = await getPool();
  const result = await pool
    .request()
    .query('SELECT ID, NOME, CARGO, STATUS FROM COLABORADORES ORDER BY NOME');

  return result.recordset;
}

/**
 * Sincroniza uma lista de linhas com uma aba (sheet) do Google Sheets:
 * limpa a aba e reescreve o cabecalho + dados. Mesma logica que voce
 * ja usa no Python com gspread (ws.clear() + ws.update()).
 */
async function syncToSheet({ sheetTitle, rows }) {
  if (isDemoMode()) {
    logger.info('DEMO_MODE ativo - simulando escrita no Google Sheets', {
      sheetTitle,
      linhas: rows.length
    });
    return { simulated: true, sheetTitle, linhas: rows.length };
  }

  if (!rows.length) {
    logger.warn('Nenhuma linha para sincronizar', { sheetTitle });
    return { sheetTitle, linhas: 0 };
  }

  const doc = await getSpreadsheet();
  let sheet = doc.sheetsByTitle[sheetTitle];

  const headers = Object.keys(rows[0]);

  if (!sheet) {
    sheet = await doc.addSheet({ title: sheetTitle, headerValues: headers });
  } else {
    await sheet.clear();
    await sheet.setHeaderRow(headers);
  }

  await sheet.addRows(rows);

  logger.info('Sincronizacao concluida', { sheetTitle, linhas: rows.length });
  return { sheetTitle, linhas: rows.length };
}

/**
 * Roda o pipeline completo: SQL Server -> Google Sheets.
 * E essa funcao que tanto a rota HTTP quanto o job agendado chamam.
 */
async function runColaboradoresSync() {
  const rows = await fetchColaboradores();
  return syncToSheet({ sheetTitle: 'Colaboradores', rows });
}

module.exports = { fetchColaboradores, syncToSheet, runColaboradoresSync };
