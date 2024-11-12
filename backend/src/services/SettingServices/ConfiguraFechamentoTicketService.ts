import db from "../../database"; // Importe sua conexão com o banco de dados

// Definir interface para o resultado
interface ConfigResult {
  value: string;
}

export const getDaysToClose = async (): Promise<number> => {
  try {
    const result = await db.query('SELECT value FROM settings WHERE key = $1', {
      replacements: ['DAYS_TO_CLOSE_TICKET']
    });

    // Verificar o retorno correto do resultado
    if (result && result[0] && result[0][0]) {
      return parseInt((result[0][0] as ConfigResult)?.value) || 0;
    } else {
      // Caso o resultado não seja encontrado, retorne 0 por padrão
      return 0;
    }
  } catch (error) {
    // Tratar erro de consulta
    console.error('Erro ao recuperar a configuração DAYS_TO_CLOSE_TICKET:', error);
    return 0; // Caso haja erro, retorne 0 como fallback
  }
};

export const setDaysToClose = async (days: number): Promise<void> => {
  try {
    await db.query('UPDATE settings SET value = $1 WHERE key = $2', {
      replacements: [days, 'DAYS_TO_CLOSE_TICKET']
    });
  } catch (error) {
    // Tratar erro de atualização
    console.error('Erro ao atualizar DAYS_TO_CLOSE_TICKET:', error);
  }
};
