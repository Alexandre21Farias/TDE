#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <time.h>
#include "arquivos.h"
#include "utils.h"

// Helper to open files checking principal and fallback paths
static FILE* abrirArquivo(const char* principal, const char* fallback, const char* modo) {
    FILE *f = fopen(principal, modo);
    if (f == NULL) {
        f = fopen(fallback, modo);
    }
    return f;
}

int carregarPacientes(Paciente *p) {
    FILE *arq = abrirArquivo(CAMINHO_PACIENTES, ALT_PACIENTES, "r");
    if (arq == NULL) {
        return 0;
    }

    int cont = 0;
    char linha[512];
    while (fgets(linha, sizeof(linha), arq) && cont < MAX_PACIENTES) {
        linha[strcspn(linha, "\r\n")] = '\0';
        if (strlen(linha) == 0) continue;

        char *token = strtok(linha, ";");
        if (!token) continue;
        p[cont].id = atoi(token);

        token = strtok(NULL, ";");
        if (token) strcpy(p[cont].nome, token);
        else strcpy(p[cont].nome, "");

        token = strtok(NULL, ";");
        if (token) p[cont].idade = atoi(token);
        else p[cont].idade = 0;

        token = strtok(NULL, ";");
        if (token) strcpy(p[cont].diagnostico, token);
        else strcpy(p[cont].diagnostico, "");

        token = strtok(NULL, ";");
        if (token) p[cont].leito = atoi(token);
        else p[cont].leito = 0;

        token = strtok(NULL, ";");
        if (token) p[cont].ativo = atoi(token);
        else p[cont].ativo = 0;

        token = strtok(NULL, ";");
        if (token) strcpy(p[cont].prioridade, token);
        else strcpy(p[cont].prioridade, "Verde");

        token = strtok(NULL, ";");
        if (token) strcpy(p[cont].data_cadastro, token);
        else strcpy(p[cont].data_cadastro, "N/A");

        cont++;
    }

    fclose(arq);
    return cont;
}

void salvarPacientes(Paciente *p, int total) {
    FILE *arq = abrirArquivo(CAMINHO_PACIENTES, ALT_PACIENTES, "w");
    if (arq == NULL) {
        printf("Erro ao salvar pacientes no arquivo!\n");
        return;
    }

    for (int i = 0; i < total; i++) {
        fprintf(arq, "%d;%s;%d;%s;%d;%d;%s;%s\n",
                p[i].id, p[i].nome, p[i].idade, p[i].diagnostico,
                p[i].leito, p[i].ativo, p[i].prioridade, p[i].data_cadastro);
    }

    fclose(arq);
}

int carregarMedicos(Medico *m) {
    FILE *arq = abrirArquivo(CAMINHO_MEDICOS, ALT_MEDICOS, "r");
    if (arq == NULL) {
        return 0;
    }

    int cont = 0;
    char linha[512];
    while (fgets(linha, sizeof(linha), arq) && cont < MAX_MEDICOS) {
        linha[strcspn(linha, "\r\n")] = '\0';
        if (strlen(linha) == 0) continue;

        char *token = strtok(linha, ";");
        if (!token) continue;
        m[cont].id = atoi(token);

        token = strtok(NULL, ";");
        if (token) strcpy(m[cont].nome, token);
        else strcpy(m[cont].nome, "");

        token = strtok(NULL, ";");
        if (token) strcpy(m[cont].especialidade, token);
        else strcpy(m[cont].especialidade, "");

        token = strtok(NULL, ";");
        if (token) strcpy(m[cont].crm, token);
        else strcpy(m[cont].crm, "");

        token = strtok(NULL, ";");
        if (token) strcpy(m[cont].escala, token);
        else strcpy(m[cont].escala, "");

        token = strtok(NULL, ";");
        if (token) m[cont].ativo = atoi(token);
        else m[cont].ativo = 0;

        cont++;
    }

    fclose(arq);
    return cont;
}

void salvarMedicos(Medico *m, int total) {
    FILE *arq = abrirArquivo(CAMINHO_MEDICOS, ALT_MEDICOS, "w");
    if (arq == NULL) {
        printf("Erro ao salvar medicos no arquivo!\n");
        return;
    }

    for (int i = 0; i < total; i++) {
        fprintf(arq, "%d;%s;%s;%s;%s;%d\n",
                m[i].id, m[i].nome, m[i].especialidade, m[i].crm, m[i].escala, m[i].ativo);
    }

    fclose(arq);
}

int carregarInternacoes(Internacao *in) {
    FILE *arq = abrirArquivo(CAMINHO_INTERNACOES, ALT_INTERNACOES, "r");
    if (arq == NULL) {
        return 0;
    }

    int cont = 0;
    char linha[512];
    while (fgets(linha, sizeof(linha), arq) && cont < MAX_INTERNACOES) {
        linha[strcspn(linha, "\r\n")] = '\0';
        if (strlen(linha) == 0) continue;

        char *token = strtok(linha, ";");
        if (!token) continue;
        in[cont].id = atoi(token);

        token = strtok(NULL, ";");
        if (token) in[cont].id_paciente = atoi(token);
        else in[cont].id_paciente = 0;

        token = strtok(NULL, ";");
        if (token) in[cont].id_medico = atoi(token);
        else in[cont].id_medico = 0;

        token = strtok(NULL, ";");
        if (token) in[cont].leito = atoi(token);
        else in[cont].leito = 0;

        token = strtok(NULL, ";");
        if (token) strcpy(in[cont].data_entrada, token);
        else strcpy(in[cont].data_entrada, "N/A");

        token = strtok(NULL, ";");
        if (token) strcpy(in[cont].data_saida, token);
        else strcpy(in[cont].data_saida, "N/A");

        token = strtok(NULL, ";");
        if (token) in[cont].status = atoi(token);
        else in[cont].status = 0;

        cont++;
    }

    fclose(arq);
    return cont;
}

void salvarInternacoes(Internacao *in, int total) {
    FILE *arq = abrirArquivo(CAMINHO_INTERNACOES, ALT_INTERNACOES, "w");
    if (arq == NULL) {
        printf("Erro ao salvar internacoes no arquivo!\n");
        return;
    }

    for (int i = 0; i < total; i++) {
        fprintf(arq, "%d;%d;%d;%d;%s;%s;%d\n",
                in[i].id, in[i].id_paciente, in[i].id_medico, in[i].leito,
                in[i].data_entrada, in[i].data_saida, in[i].status);
    }

    fclose(arq);
}

void registrarLog(const char *mensagem) {
    FILE *arq = abrirArquivo(CAMINHO_LOGS, ALT_LOGS, "a");
    if (arq == NULL) {
        return;
    }

    char strData[30];
    obterDataHoraAtual(strData);
    fprintf(arq, "[%s] %s\n", strData, mensagem);
    fclose(arq);
}
