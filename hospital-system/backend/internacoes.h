#ifndef INTERNACOES_H
#define INTERNACOES_H

#include "pacientes.h"
#include "medicos.h"

#define MAX_INTERNACOES 200

typedef struct {
    int id;
    int id_paciente;
    int id_medico;
    int leito;
    char data_entrada[20];
    char data_saida[20];
    int status; // 1 = Em Andamento, 0 = Concluida (Alta)
} Internacao;

void internarPaciente(Paciente *p, int totalPacientes, Medico *m, int totalMedicos, Internacao *internacoes, int *totalInternacoes);
void darAltaPaciente(Paciente *p, int totalPacientes, Internacao *internacoes, int totalInternacoes);
void monitorarLeitos(Paciente *p, int totalPacientes);

#endif
