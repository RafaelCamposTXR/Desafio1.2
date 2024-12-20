import CadastroDePacientes from './CadastroDePacientes.js'; // Importando a classe CadastroDePacientes
import Consulta from '../domain/Consulta.js';
import { DateTime } from "luxon";

class Agendamento {
  constructor(cadastroDePacientes) {
    if (!(cadastroDePacientes instanceof CadastroDePacientes)) {
      throw new Error('É necessário passar uma instância de CadastroDePacientes.');
    }
    this.agendamentos = [];
    this.cadastroDePacientes = cadastroDePacientes;
  }

  agendarConsulta(pacienteCpf, data, horaInicio, horaFim) {
    const paciente = this.cadastroDePacientes.pacientes.find(p => p.cpf === pacienteCpf);
    if (!paciente) {
      return { sucesso: false, mensagem: `Paciente com CPF ${pacienteCpf} não encontrado.` };
    }

    try {
      const consulta = new Consulta(paciente.nome, data, horaInicio, horaFim);

      consulta.validarHorario();
      consulta.validarData(DateTime.local());

      this.agendamentos.push(consulta);
      return { sucesso: true, mensagem: `Consulta agendada com sucesso para o paciente ${paciente.nome}.`, consulta };
    } catch (erro) {
      return { sucesso: false, mensagem: erro.message };
    }
  }

  excluirAgendamento(pacienteCpf, data) {
    const indice = this.agendamentos.findIndex(
      consulta => consulta.paciente === pacienteCpf && consulta.data === data
    );

    if (indice === -1) {
      return { sucesso: false, mensagem: 'Agendamento não encontrado.' };
    }

    const consultaRemovida = this.agendamentos.splice(indice, 1)[0];
    return { sucesso: true, mensagem: 'Consulta excluída com sucesso!', consulta: consultaRemovida };
  }

  listarAgenda() {
    if (this.agendamentos.length === 0) {
      return { sucesso: false, mensagem: 'Não há agendamentos.', agendamentos: [] };
    }

    return { sucesso: true, agendamentos: this.agendamentos };
  }

  listarAgendaPorPeriodo(dataInicio, dataFim) {
    // Converte dataInicio e dataFim para DateTime usando Luxon
    const inicio = DateTime.fromFormat(dataInicio, 'dd/MM/yyyy');
    const fim = DateTime.fromFormat(dataFim, 'dd/MM/yyyy');
  
    // Filtra os agendamentos no período informado
    const agendamentosNoPeriodo = this.agendamentos.filter(consulta => {
      // Converte a data da consulta para DateTime
      const dataConsulta = consulta.data;
  
      // Verifica se a data da consulta está dentro do intervalo
      return dataConsulta >= inicio && dataConsulta <= fim;
    });
  
    // Retorna o resultado baseado na quantidade de agendamentos encontrados
    if (agendamentosNoPeriodo.length === 0) {
      return { sucesso: false, mensagem: 'Nenhum agendamento encontrado no período informado.', agendamentos: [] };
    }
  
    return { sucesso: true, agendamentos: agendamentosNoPeriodo };
  }

  listarAgendamentoPorPaciente(pacienteCpf) {
    const agendamentosDoPaciente = this.agendamentos.filter(
      consulta => consulta.cpfPaciente === pacienteCpf
    );

    if (agendamentosDoPaciente.length === 0) {
      return { sucesso: false, mensagem: `Nenhum agendamento encontrado para o paciente com CPF ${pacienteCpf}.` };
    }

    return { sucesso: true, agendamentos: agendamentosDoPaciente };
  }
}

export default Agendamento;
