import cron from 'node-cron';
import db from '../database'; // Ajuste o caminho conforme necessário
import { getDaysToClose } from '../services/SettingServices/ConfiguraFechamentoTicketService';

// Função para fechar tickets pendentes
const closePendingTickets = async () => {
    try {
        const daysToClose = await getDaysToClose();
        const cutoffDate = new Date(Date.now() - daysToClose * 24 * 60 * 60 * 1000);

        // Fecha tickets que estão pendentes há mais do que o número de dias especificado
            await db.query('UPDATE tickets SET status = $1 WHERE status = $2 AND updatedAt < $3', {
                replacements: ['closed', 'pending', cutoffDate],
            });
                    
        console.log(`Fechamento automático realizado para tickets pendentes há mais de ${daysToClose} dias.`);
    } catch (error) {
        console.error("Erro ao fechar tickets pendentes:", error);
    }
};

// Configura a tarefa agendada
const scheduleClosePendingTicketsJob = () => {
    cron.schedule('0 0 * * *', closePendingTickets); // Executa diariamente à meia-noite
};

export default scheduleClosePendingTicketsJob;
