#ifndef PACIENTES_H
#define PACIENTES_H

#define MAX_PACIENTES 100

typedef struct {
    int id;
    char nome[100];
    int idade;
    char diagnostico[200];
    int leito;
    int ativo; // 1 = Internado, 0 = Inativo (Alta)
    char prioridade[20]; // Verde, Amarelo, Vermelho
    char data_cadastro[20]; // AAAA-MM-DD
} Paciente;

void cadastrarPaciente(Paciente *p, int *total);
void listarPacientes(Paciente *p, int total);
void buscarPaciente(Paciente *p, int total);

#endif
