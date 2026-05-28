#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include "medicos.h"
#include "utils.h"

void cadastrarMedico(Medico *m, int *total) {
    m->id = *total + 1;
    
    printf("\n--- CADASTRAR NOVO MEDICO ---\n");
    printf("Nome do Medico: ");
    lerString(m->nome, sizeof(m->nome));

    printf("Especialidade: ");
    lerString(m->especialidade, sizeof(m->especialidade));

    printf("CRM: ");
    lerString(m->crm, sizeof(m->crm));

    printf("Escala de Trabalho: ");
    lerString(m->escala, sizeof(m->escala));

    m->ativo = 1;
    (*total)++;
    
    printf("\nMedico '%s' cadastrado com sucesso (CRM: %s)!\n", m->nome, m->crm);
}

void listarMedicos(Medico *m, int total) {
    int ativos = 0;
    printf("\n=================================================================================\n");
    printf("                         RELATORIO DE MEDICOS CADASTRADOS                        \n");
    printf("=================================================================================\n");
    printf("%-4s | %-20s | %-15s | %-12s | %s\n", 
           "ID", "Nome", "Especialidade", "CRM", "Escala de Trabalho");
    printf("---------------------------------------------------------------------------------\n");
    for (int i = 0; i < total; i++) {
        if (m[i].ativo) {
            printf("%-4d | %-20.20s | %-15.15s | %-12s | %s\n",
                    m[i].id, m[i].nome, m[i].especialidade, m[i].crm, m[i].escala);
            ativos++;
        }
    }
    if (ativos == 0) {
        printf("Nenhum medico cadastrado no momento.\n");
    }
    printf("=================================================================================\n");
}

void buscarMedico(Medico *m, int total) {
    char nomeBusca[100];
    int achou = 0;

    printf("\nDigite o nome completo do medico para busca: ");
    lerString(nomeBusca, sizeof(nomeBusca));

    for (int i = 0; i < total; i++) {
        if (strcmp(m[i].nome, nomeBusca) == 0) {
            printf("\n--- REGISTRO LOCALIZADO ---\n");
            printf("ID: %d\nNome: %s\nEspecialidade: %s\nCRM: %s\nEscala: %s\nStatus: %s\n", 
                   m[i].id, m[i].nome, m[i].especialidade, m[i].crm, m[i].escala, m[i].ativo ? "Ativo" : "Inativo");
            printf("---------------------------\n");
            achou = 1;
            break;
        }
    }
    
    if (!achou) {
        printf("\nMedico '%s' nao encontrado no sistema.\n", nomeBusca);
    }
}
