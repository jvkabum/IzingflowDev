import cron from 'node-cron';
import db from '../database'; // Ajuste o caminho conforme necessário
import { getDaysToClose } from '../services/SettingServices/ConfiguraFechamentoTicketService';

// Definir a interface do resultado da consulta
interface QueryResult {
    rowsAffected: number; // Supondo que o segundo item do retorno seja o número de linhas afetadas
}

const closePendingTickets = async () => {
    try {
        // Obter o número de dias para fechar os tickets
        const daysToClose = await getDaysToClose();
        
        // Verifica se o valor de daysToClose é válido
        if (daysToClose <= 0) {
            console.error("Configuração inválida de dias para fechamento. O valor de 'daysToClose' deve ser maior que 0.");
            return; // Evita o fechamento de tickets se o valor de dias for inválido
        }
        
        // Calcular a data limite para fechamento dos tickets
        const cutoffDate = new Date(Date.now() - daysToClose * 24 * 60 * 60 * 1000);

        // Fecha tickets que estão pendentes há mais do que o número de dias especificado
        const result = await db.query('UPDATE tickets SET status = $1 WHERE status = $2 AND updatedAt < $3', {
            replacements: ['closed', 'pending', cutoffDate],
        });

        // Asseverar que result[1] contém a informação que você espera (rowsAffected)
        const queryResult = result[1] as QueryResult;

        // Verificar se algum ticket foi atualizado
        if (queryResult.rowsAffected > 0) {
            console.log(`Fechamento automático realizado para ${queryResult.rowsAffected} ticket(s) pendente(s) há mais de ${daysToClose} dias.`);
        } else {
            console.log("Nenhum ticket pendente foi encontrado para fechamento.");
        }
    } catch (error) {
        // Tratamento de erro mais detalhado
        console.error("Erro ao fechar tickets pendentes:", error.message || error);
    }
};

// Configura a tarefa agendada para executar diariamente à meia-noite
const scheduleClosePendingTicketsJob = () => {
    cron.schedule('* * * * *', closePendingTickets); // Executa diariamente à meia-noite
};

// Exporte o job para ser utilizado em outros arquivos
export default scheduleClosePendingTicketsJob;
