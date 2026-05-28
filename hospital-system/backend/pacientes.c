#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <time.h>
#include "pacientes.h"
#include "utils.h"

void cadastrarPaciente(Paciente *p, int *total) {
    p->id = *total + 1;
    
    printf("\n--- CADASTRAR NOVO PACIENTE ---\n");
    printf("Nome Completo: ");
    lerString(p->nome, sizeof(p->nome));

    printf("Idade: ");
    scanf("%d", &p->idade);
    limparBuffer();

    printf("Diagnostico: ");
    lerString(p->diagnostico, sizeof(p->diagnostico));

    printf("Numero do Leito: ");
    scanf("%d", &p->leito);
    limparBuffer();

    // Prioridade com validação simples
    int opPrioridade;
    do {
        printf("Classificacao de Risco / Prioridade:\n1 - Verde (Pouco Urgente)\n2 - Amarelo (Urgente)\n3 - Vermelho (Emergencia)\nEscolha: ");
        scanf("%d", &opPrioridade);
        limparBuffer();
        if (opPrioridade == 1) strcpy(p->prioridade, "Verde");
        else if (opPrioridade == 2) strcpy(p->prioridade, "Amarelo");
        else if (opPrioridade == 3) strcpy(p->prioridade, "Vermelho");
        else printf("Opcao invalida!\n");
    } while (opPrioridade < 1 || opPrioridade > 3);

    // Data de cadastro automática ou digitada
    obterDataAtual(p->data_cadastro);

    p->ativo = 1;
    (*total)++;
    
    printf("\nPaciente '%s' cadastrado com sucesso no leito %d (Prioridade: %s)!\n", p->nome, p->leito, p->prioridade);
}

void listarPacientes(Paciente *p, int total) {
    int ativos = 0;
    printf("\n=================================================================================\n");
    printf("                       RELATORIO DE PACIENTES INTERNADOS                         \n");
    printf("=================================================================================\n");
    printf("%-4s | %-20s | %-5s | %-6s | %-10s | %-12s | %s\n", 
           "ID", "Nome", "Idade", "Leito", "Prioridade", "Data Cad.", "Diagnostico");
    printf("---------------------------------------------------------------------------------\n");
    for (int i = 0; i < total; i++) {
        if (p[i].ativo) {
            printf("%-4d | %-20.20s | %-5d | %-6d | %-10s | %-12s | %s\n",
                    p[i].id, p[i].nome, p[i].idade, p[i].leito, p[i].prioridade, p[i].data_cadastro, p[i].diagnostico);
            ativos++;
        }
    }
    if (ativos == 0) {
        printf("Nenhum paciente internado no momento.\n");
    }
    printf("=================================================================================\n");
}

void buscarPaciente(Paciente *p, int total) {
    char nomeBusca[100];
    int achou = 0;

    printf("\nDigite o nome completo para busca: ");
    lerString(nomeBusca, sizeof(nomeBusca));

    for (int i = 0; i < total; i++) {
        if (strcmp(p[i].nome, nomeBusca) == 0) {
            printf("\n--- REGISTRO LOCALIZADO ---\n");
            printf("ID: %d\nNome: %s\nIdade: %d anos\nLeito: %d\nPrioridade: %s\nData Entrada: %s\nDiagnostico: %s\nStatus: %s\n", 
                   p[i].id, p[i].nome, p[i].idade, p[i].leito, p[i].prioridade, p[i].data_cadastro, p[i].diagnostico, p[i].ativo ? "Internado" : "Alta");
            printf("---------------------------\n");
            achou = 1;
            break;
        }
    }
    
    if (!achou) {
        printf("\nPaciente '%s' nao encontrado no sistema.\n", nomeBusca);
    }
}
