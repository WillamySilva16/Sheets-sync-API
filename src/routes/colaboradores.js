const express = require('express');
const { fetchColaboradores, runColaboradoresSync } = require('../services/syncService');
const logger = require('../config/logger');

const router = express.Router();

// GET /colaboradores -> apenas consulta e retorna os dados (nao mexe na planilha)
router.get('/', async (req, res) => {
  try {
    const data = await fetchColaboradores();
    res.json({ total: data.length, data });
  } catch (err) {
    logger.error('Erro ao buscar colaboradores', { error: err.message });
    res.status(500).json({ error: 'Erro ao buscar colaboradores', detail: err.message });
  }
});

// POST /colaboradores/sync -> roda o pipeline SQL Server -> Google Sheets sob demanda
router.post('/sync', async (req, res) => {
  try {
    const result = await runColaboradoresSync();
    res.json({ status: 'ok', ...result });
  } catch (err) {
    logger.error('Erro ao sincronizar colaboradores', { error: err.message });
    res.status(500).json({ error: 'Erro ao sincronizar colaboradores', detail: err.message });
  }
});

module.exports = router;
