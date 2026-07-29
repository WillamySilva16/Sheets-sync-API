const cron = require('node-cron');
const { runColaboradoresSync } = require('../services/syncService');
const logger = require('../config/logger');

/**
 * Agenda a sincronizacao automatica usando node-cron.
 * Padrao no .env: "0 8,17 * * *" -> roda as 08:00 e as 17:00 (Brasilia),
 * igual ao horario que voce ja usa no PrimeBuilder CSV Importer.
 *
 * Isso e equivalente ao que o Ofelia faz nos seus containers Docker -
 * aqui o agendamento mora dentro do proprio processo Node.
 */
function startScheduledSync() {
  const schedule = process.env.SYNC_CRON_SCHEDULE || '0 8,17 * * *';

  if (!cron.validate(schedule)) {
    logger.warn('Expressao cron invalida, sincronizacao automatica desativada', { schedule });
    return;
  }

  cron.schedule(schedule, async () => {
    logger.info('Iniciando sincronizacao agendada de colaboradores');
    try {
      const result = await runColaboradoresSync();
      logger.info('Sincronizacao agendada concluida', result);
    } catch (err) {
      logger.error('Sincronizacao agendada falhou', { error: err.message });
    }
  }, { timezone: process.env.TZ || 'America/Sao_Paulo' });

  logger.info('Job de sincronizacao agendado', { schedule });
}

module.exports = { startScheduledSync };
