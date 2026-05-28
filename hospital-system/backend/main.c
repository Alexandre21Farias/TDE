#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include "pacientes.h"
#include "medicos.h"
#include "internacoes.h"
#include "login.h"
#include "arquivos.h"
#include "utils.h"

void exibirMenu() {
    printf("\n==========================================\n");
    printf("         SISTEMA HOSPITALAR HIBRIDO       \n");
    printf("==========================================\n");
    printf(" 1 - Cadastrar Paciente\n");
    printf(" 2 - Cadastrar Medico\n");
    printf(" 3 - Registrar Internacao (Alocar Leito)\n");
    printf(" 4 - Listar Pacientes Internados\n");
    printf(" 5 - Listar Medicos Cadastrados\n");
    printf(" 6 - Registrar Alta Hospitalar (Liberar Leito)\n");
    printf(" 7 - Monitorar Ocupacao de Leitos\n");
    printf(" 8 - Buscar Paciente por Nome\n");
    printf(" 9 - Buscar Medico por Nome\n");
    printf("10 - Relatorios Estatisticos da Unidade\n");
    printf(" 0 - Salvar e Sair\n");
    printf("==========================================\n");
}

void gerarRelatoriosEstatisticos(Paciente *pacientes, int totalPacientes) {
    if (totalPacientes == 0) {
        printf("\nNao ha dados suficientes para gerar estatisticas.\n");
        return;
    }

    int somaIdades = 0;
    int indexMaisVelho = 0;
    int ocupados = 0;
    int criticos = 0; // Vermelho
    int urgentes = 0; // Amarelo
    int leves = 0;    // Verde

    for (int i = 0; i < totalPacientes; i++) {
        if (pacientes[i].ativo) {
            somaIdades += pacientes[i].idade;
            ocupados++;
            
            if (pacientes[i].idade > pacientes[indexMaisVelho].idade) {
                indexMaisVelho = i;
            }

            if (strcmp(pacientes[i].prioridade, "Vermelho") == 0) criticos++;
            else if (strcmp(pacientes[i].prioridade, "Amarelo") == 0) urgentes++;
            else leves++;
        }
    }

    float mediaIdade = ocupados > 0 ? (float)somaIdades / ocupados : 0.0f;

    printf("\n========== RELATORIO ESTATISTICO HOSPITALAR ==========\n");
    printf("Total de pacientes cadastrados: %d\n", totalPacientes);
    printf("Pacientes internados atualmente: %d\n", ocupados);
    printf("Media de idade dos internados: %.2f anos\n", mediaIdade);
    if (ocupados > 0) {
        printf("Paciente internado mais idoso: %s (%d anos)\n", 
               pacientes[indexMaisVelho].nome, pacientes[indexMaisVelho].idade);
    }
    printf("\n--- Classificacao de Risco (Pacientes Internados) ---\n");
    printf("Emergencia (Vermelho): %d\n", criticos);
    printf("Urgente (Amarelo): %d\n", urgentes);
    printf("Pouco Urgente (Verde): %d\n", leves);
    printf("\nCapacidade de leitos ocupada: %d%% / %d leitos max.\n", 
           (ocupados * 100) / MAX_PACIENTES, MAX_PACIENTES);
    printf("=======================================================\n");
}

int main(int argc, char *argv[]) {
    Paciente hospital[MAX_PACIENTES];
    Medico medicos[MAX_MEDICOS];
    Internacao internacoes[MAX_INTERNACOES];

    int totalPacientes = 0;
    int totalMedicos = 0;
    int totalInternacoes = 0;

    // Carrega dados iniciais
    totalPacientes = carregarPacientes(hospital);
    totalMedicos = carregarMedicos(medicos);
    totalInternacoes = carregarInternacoes(internacoes);

    // Suporte a argumentos CLI opcionais para integrações diretas ou dumping
    if (argc > 1) {
        if (strcmp(argv[1], "--dump-pacientes") == 0) {
            for (int i = 0; i < totalPacientes; i++) {
                printf("%d;%s;%d;%s;%d;%d;%s;%s\n", 
                       hospital[i].id, hospital[i].nome, hospital[i].idade, hospital[i].diagnostico,
                       hospital[i].leito, hospital[i].ativo, hospital[i].prioridade, hospital[i].data_cadastro);
            }
            return 0;
        } else if (strcmp(argv[1], "--dump-medicos") == 0) {
            for (int i = 0; i < totalMedicos; i++) {
                printf("%d;%s;%s;%s;%s;%d\n", 
                       medicos[i].id, medicos[i].nome, medicos[i].especialidade, medicos[i].crm, medicos[i].escala, medicos[i].ativo);
            }
            return 0;
        } else if (strcmp(argv[1], "--dump-stats") == 0) {
            int ocupados = 0;
            for (int i = 0; i < totalPacientes; i++) {
                if (hospital[i].ativo) ocupados++;
            }
            printf("Total Pacientes:%d;Leitos Ocupados:%d;Leitos Livres:%d\n", 
                   totalPacientes, ocupados, MAX_PACIENTES - ocupados);
            return 0;
        }
    }

    // Modo CLI Interativo
    if (!fazerLogin()) {
        printf("\nSistema encerrado por falha na autenticacao.\n");
        registrarLog("Falha na tentativa de login administrativo no console.");
        return 0;
    }

    registrarLog("Login de administrador realizado com sucesso via CLI.");
    int opcao;

    do {
        exibirMenu();
        printf("Escolha uma opcao: ");
        if (scanf("%d", &opcao) != 1) {
            printf("Entrada invalida!\n");
            limparBuffer();
            continue;
        }
        limparBuffer(); 

        switch(opcao) {
            case 1:
                if (totalPacientes < MAX_PACIENTES) {
                    cadastrarPaciente(&hospital[totalPacientes], &totalPacientes);
                    salvarPacientes(hospital, totalPacientes);
                    char msg[150];
                    sprintf(msg, "Paciente '%s' (ID %d) cadastrado via CLI.", hospital[totalPacientes-1].nome, hospital[totalPacientes-1].id);
                    registrarLog(msg);
                } else {
                    printf("\nALERTA: Capacidade maxima de pacientes atingida!\n");
                }
                break;
            case 2:
                if (totalMedicos < MAX_MEDICOS) {
                    cadastrarMedico(&medicos[totalMedicos], &totalMedicos);
                    salvarMedicos(medicos, totalMedicos);
                    char msg[150];
                    sprintf(msg, "Medico '%s' (ID %d) cadastrado via CLI.", medicos[totalMedicos-1].nome, medicos[totalMedicos-1].id);
                    registrarLog(msg);
                } else {
                    printf("\nALERTA: Capacidade maxima de medicos atingida!\n");
                }
                break;
            case 3:
                internarPaciente(hospital, totalPacientes, medicos, totalMedicos, internacoes, &totalInternacoes);
                salvarPacientes(hospital, totalPacientes);
                salvarInternacoes(internacoes, totalInternacoes);
                registrarLog("Nova internacao hospitalar registrada via CLI.");
                break;
            case 4:
                listarPacientes(hospital, totalPacientes);
                break;
            case 5:
                listarMedicos(medicos, totalMedicos);
                break;
            case 6:
                darAltaPaciente(hospital, totalPacientes, internacoes, totalInternacoes);
                salvarPacientes(hospital, totalPacientes);
                salvarInternacoes(internacoes, totalInternacoes);
                registrarLog("Alta hospitalar concedida a paciente via CLI.");
                break;
            case 7:
                monitorarLeitos(hospital, totalPacientes);
                break;
            case 8:
                buscarPaciente(hospital, totalPacientes);
                break;
            case 9:
                buscarMedico(medicos, totalMedicos);
                break;
            case 10:
                gerarRelatoriosEstatisticos(hospital, totalPacientes);
                break;
            case 0:
                printf("\nSalvando registros pendentes...\n");
                salvarPacientes(hospital, totalPacientes);
                salvarMedicos(medicos, totalMedicos);
                salvarInternacoes(internacoes, totalInternacoes);
                printf("Finalizando o sistema... Ate logo!\n");
                registrarLog("Sistema hospitalar encerrado pelo console.");
                break;
            default:
                printf("Opcao invalida! Tente novamente.\n");
        }
    } while(opcao != 0); 

    return 0;
}
