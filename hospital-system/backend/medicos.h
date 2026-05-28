#ifndef MEDICOS_H
#define MEDICOS_H

#define MAX_MEDICOS 50

typedef struct {
    int id;
    char nome[100];
    char especialidade[100];
    char crm[20];
    char escala[100]; // Ex: Segunda a Sexta 08-16h
    int ativo; // 1 = Ativo, 0 = Inativo
} Medico;

void cadastrarMedico(Medico *m, int *total);
void listarMedicos(Medico *m, int total);
void buscarMedico(Medico *m, int total);

#endif
