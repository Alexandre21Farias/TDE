#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#define MAX_PACIENTES 100
#define ARQUIVO_DADOS "hospital_dados.txt"
#define SENHA_SISTEMA "1234"

//Struct de dados do paciente
typedef struct {
    int id;
    char nome[50];
    int idade;
    char diagnostico[100];
    int leito;
    int ativo; 
} Paciente;

//Protótipos das funções
void menu();
void gerarEstatisticas(Paciente *p, int total); //Função Extra de Relatórios Estatísticos
int fazerLogin(); //Função Extra de Login de Sistema
void cadastrarPaciente(Paciente *p, int *total); // Uso de ponteiros
void listarPacientes(Paciente *p, int total);    // Relatórios 
void buscarPaciente(Paciente *p, int total);    // Buscas 
void salvarDados(Paciente *p, int total);       // Manipulação de Arquivos 
int carregarDados(Paciente *p);

int main() {
    //Verifica a senha antes de iniciar o sistema
    if (!fazerLogin()) {
        printf("\nSistema encerrado por falha na autenticacao.\n");
        return 0;
    }

    Paciente hospital[MAX_PACIENTES]; //Vetor de Structs
    int totalPacientes = 0;
    int opcao;

    totalPacientes = carregarDados(hospital);

    do {
        menu();
        printf("Escolha uma opcao: ");
        scanf("%d", &opcao);
        getchar(); 

        switch(opcao) {
            case 1:
                if (totalPacientes < MAX_PACIENTES) {
                    cadastrarPaciente(&hospital[totalPacientes], &totalPacientes);
                } else {
                    printf("\nALERTA: Capacidade maxima de leitos atingida!\n");
                }
                break;
            case 2:
                listarPacientes(hospital, totalPacientes);
                break;
            case 3:
                buscarPaciente(hospital, totalPacientes);
                break;
            case 4:
                salvarDados(hospital, totalPacientes);
                break;
            case 5:
                gerarEstatisticas(hospital, totalPacientes);
                break;
            case 0:
                printf("Finalizando o sistema... Ate logo!\n");
                break;
            default:
                printf("Opcao invalida! Tente novamente.\n");
        }
    } while(opcao != 0); 

    return 0;
}

//Implementação do Sistema com senha 
int fazerLogin() {
    char senhaDigitada[20];
    int tentativas = 3;

    printf("==========================================\n       ACESSO RESTRITO AO SISTEMA         \n==========================================\n");
	
    while (tentativas > 0) { //loop para fazer login
        printf("Digite a senha de administrador: ");
        scanf("%s", senhaDigitada);
        getchar();

        if (strcmp(senhaDigitada, SENHA_SISTEMA) == 0) { //Se a senha estiver correta, efetua o login
            printf("\nLogin realizado com sucesso!\n");
            return 1;
        } else {
            tentativas--;
            printf("Senha incorreta! Tentativas restantes: %d\n", tentativas); //Se não estiver correta, decrementa o numero de tentativas
        }
    }
    return 0;
}

void menu() {
    printf("\n==========================================\n           SISTEMA HOSPITALAR             \n==========================================\n1 - Cadastrar Paciente\n2 - Listar Pacientes (Relatorio)\n3 - Buscar Paciente por Nome\n4 - Salvar Dados em Arquivo\n5 - Relatorios Estatisticos (Extra)\n0 - Sair\n==========================================\n");
}

void cadastrarPaciente(Paciente *p, int *total) {
    p->id = *total + 1;
    
    printf("Nome do Paciente: ");
    fgets(p->nome, 50, stdin);
    strtok(p->nome, "\n");

    printf("Idade: ");
    scanf("%d", &p->idade);
    getchar();

    printf("Diagnostico: ");
    fgets(p->diagnostico, 100, stdin);
    strtok(p->diagnostico, "\n");

    printf("Numero do Leito: ");
    scanf("%d", &p->leito);
    
    p->ativo = 1;
    (*total)++; //Alterção de dados via ponteiro
    
    printf("\nPaciente cadastrado com sucesso no leito %d!\n", p->leito);
}

void listarPacientes(Paciente *p, int total) {
    if (total == 0) {
        printf("\nNenhum paciente internado no momento.\n");
        return;
    }

    printf("\n--- RELATORIO DE PACIENTES INTERNADOS ---\n");
    for (int i = 0; i < total; i++) {
        if (p[i].ativo) {
            printf("ID: %d | Nome: %-20s | Leito: %d | Idade: %d | Diagnostico: %s\n",
                    p[i].id, p[i].nome, p[i].leito, p[i].idade, p[i].diagnostico);
        }
    }
    printf("------------------------------------------\n");
}

void buscarPaciente(Paciente *p, int total) {
    char nomeBusca[50];
    int achou = 0;

    if (total == 0) {
        printf("\nNenhum paciente internado no momento.\n");
        return; 
    }

    printf("Digite o nome completo para busca: ");
    fgets(nomeBusca, 50, stdin);
    strtok(nomeBusca, "\n");

    for (int i = 0; i < total; i++) {
        if (strcmp(p[i].nome, nomeBusca) == 0) {
            printf("\n--- Registro Localizado ---\n");
            printf("ID: %d | Nome: %s\n", p[i].id, p[i].nome);
            printf("Idade: %d | Leito: %d\n", p[i].idade, p[i].leito);
            printf("Diagnostico: %s\n", p[i].diagnostico);
            printf("---------------------------\n");
            achou = 1;
            break;
        }
    }
    
    if (!achou) {
        printf("\nPaciente '%s' nao encontrado no sistema.\n", nomeBusca);
    }
}

void salvarDados(Paciente *p, int total) {
    FILE *arq = fopen(ARQUIVO_DADOS, "w"); 
    if (arq == NULL) {
        printf("Erro tecnico ao abrir o arquivo para salvar!\n");
        return;
    }

    for (int i = 0; i < total; i++) {
        fprintf(arq, "%d;%s;%d;%s;%d\n", 
                p[i].id, p[i].nome, p[i].idade, p[i].diagnostico, p[i].leito);
    }

    fclose(arq);
    printf("\nDados persistidos com sucesso no arquivo %s!\n", ARQUIVO_DADOS);
}

int carregarDados(Paciente *p) {
    FILE *arq = fopen(ARQUIVO_DADOS, "r");
    if (arq == NULL) return 0;

    int cont = 0;
    while (fscanf(arq, "%d;%[^;];%d;%[^;];%d\n", 
           &p[cont].id, p[cont].nome, &p[cont].idade, p[cont].diagnostico, &p[cont].leito) != EOF) {
        p[cont].ativo = 1;
        cont++;
    }

    fclose(arq);
    return cont;
}

void gerarEstatisticas(Paciente *p, int total) {
    if (total == 0) {
        printf("\nNao ha dados suficientes para gerar estatisticas.\n");
        return;
    }

    int somaIdades = 0;
    int indexMaisVelho = 0;

    for (int i = 0; i < total; i++) {
        somaIdades += p[i].idade;
        
        if (p[i].idade > p[indexMaisVelho].idade) {
            indexMaisVelho = i;
        }
    }

    float mediaIdade = (float)somaIdades / total;

    printf("\n========== RELATORIO ESTATISTICO ==========\nTotal de pacientes internados: %d\nMedia de idade dos pacientes: %.2f anos\nPaciente mais idoso: %s (%d anos)\nCapacidade de leitos ocupada: %d%%\n===========================================\n", total, mediaIdade, p[indexMaisVelho].nome, p[indexMaisVelho].idade, (total * 100) / MAX_PACIENTES);
}