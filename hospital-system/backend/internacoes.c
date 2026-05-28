#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include "internacoes.h"
#include "utils.h"

void internarPaciente(Paciente *p, int totalPacientes, Medico *m, int totalMedicos, Internacao *internacoes, int *totalInternacoes) {
    if (totalPacientes == 0) {
        printf("\nErro: Nenhum paciente cadastrado para internacao.\n");
        return;
    }
    if (totalMedicos == 0) {
        printf("\nErro: Nenhum medico cadastrado no sistema para acompanhamento.\n");
        return;
    }

    int idPac, idMed, leitoDigitado;
    int indexPac = -1, indexMed = -1;

    printf("\n--- NOVA INTERNACAO HOSPITALAR ---\n");
    printf("Digite o ID do Paciente: ");
    scanf("%d", &idPac);
    limparBuffer();

    for (int i = 0; i < totalPacientes; i++) {
        if (p[i].id == idPac) {
            indexPac = i;
            break;
        }
    }

    if (indexPac == -1) {
        printf("Paciente com ID %d nao encontrado.\n", idPac);
        return;
    }

    if (p[indexPac].ativo == 1) {
        printf("Aviso: O paciente '%s' ja esta internado no leito %d.\n", p[indexPac].nome, p[indexPac].leito);
        return;
    }

    printf("Digite o ID do Medico Responsavel: ");
    scanf("%d", &idMed);
    limparBuffer();

    for (int i = 0; i < totalMedicos; i++) {
        if (m[i].id == idMed && m[i].ativo == 1) {
            indexMed = i;
            break;
        }
    }

    if (indexMed == -1) {
        printf("Medico ativo com ID %d nao encontrado.\n", idMed);
        return;
    }

    printf("Digite o Numero do Leito de Destino: ");
    scanf("%d", &leitoDigitado);
    limparBuffer();

    // Validar se leito está ocupado
    for (int i = 0; i < totalPacientes; i++) {
        if (p[i].ativo == 1 && p[i].leito == leitoDigitado) {
            printf("Erro: O leito %d ja esta ocupado por '%s'!\n", leitoDigitado, p[i].nome);
            return;
        }
    }

    // Atualizar paciente
    p[indexPac].ativo = 1;
    p[indexPac].leito = leitoDigitado;

    // Criar registro de internação
    internacoes[*totalInternacoes].id = *totalInternacoes + 1;
    internacoes[*totalInternacoes].id_paciente = idPac;
    internacoes[*totalInternacoes].id_medico = idMed;
    internacoes[*totalInternacoes].leito = leitoDigitado;
    obterDataAtual(internacoes[*totalInternacoes].data_entrada);
    strcpy(internacoes[*totalInternacoes].data_saida, "N/A");
    internacoes[*totalInternacoes].status = 1; // Ativa
    (*totalInternacoes)++;

    printf("\nInternacao registrada com sucesso! Paciente '%s' alocado no leito %d sob cuidados do(a) %s.\n", 
           p[indexPac].nome, leitoDigitado, m[indexMed].nome);
}

void darAltaPaciente(Paciente *p, int totalPacientes, Internacao *internacoes, int totalInternacoes) {
    if (totalPacientes == 0) {
        printf("\nNenhum paciente cadastrado no sistema.\n");
        return;
    }

    int idPac;
    int indexPac = -1;

    printf("\n--- REGISTRAR ALTA HOSPITALAR ---\n");
    printf("Digite o ID do Paciente para dar alta: ");
    scanf("%d", &idPac);
    limparBuffer();

    for (int i = 0; i < totalPacientes; i++) {
        if (p[i].id == idPac) {
            indexPac = i;
            break;
        }
    }

    if (indexPac == -1) {
        printf("Paciente com ID %d nao encontrado.\n", idPac);
        return;
    }

    if (p[indexPac].ativo == 0) {
        printf("Aviso: O paciente '%s' ja esta de alta ou nao esta internado.\n", p[indexPac].nome);
        return;
    }

    // Dar alta
    p[indexPac].ativo = 0;
    int leitoLivre = p[indexPac].leito;

    // Atualizar a internação correspondente
    int atualizouInternacao = 0;
    for (int i = totalInternacoes - 1; i >= 0; i--) {
        if (internacoes[i].id_paciente == idPac && internacoes[i].status == 1) {
            internacoes[i].status = 0;
            obterDataAtual(internacoes[i].data_saida);
            atualizouInternacao = 1;
            break;
        }
    }

    printf("\nAlta registrada com sucesso! Leito %d esta agora livre.\n", leitoLivre);
    if (!atualizouInternacao) {
        printf("Nota: Registro de internacao ativa nao localizado no historico, status do paciente atualizado.\n");
    }
}

void monitorarLeitos(Paciente *p, int totalPacientes) {
    printf("\n======================================================\n");
    printf("                  MONITORAMENTO DE LEITOS             \n");
    printf("======================================================\n");
    
    int ocupados = 0;
    for (int i = 0; i < totalPacientes; i++) {
        if (p[i].ativo) {
            printf("Leito %-4d: OCUPADO por %-20.20s | Gravidade: %s\n", 
                   p[i].leito, p[i].nome, p[i].prioridade);
            ocupados++;
        }
    }
    
    if (ocupados == 0) {
        printf("Todos os leitos estao desocupados no momento.\n");
    } else {
        printf("------------------------------------------------------\n");
        printf("Total de leitos ocupados: %d\n", ocupados);
    }
    printf("======================================================\n");
}
