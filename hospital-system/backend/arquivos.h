#ifndef ARQUIVOS_H
#define ARQUIVOS_H

#include "pacientes.h"
#include "medicos.h"
#include "internacoes.h"

// Caminhos dos arquivos de dados
#define CAMINHO_PACIENTES "data/pacientes.txt"
#define CAMINHO_MEDICOS "data/medicos.txt"
#define CAMINHO_INTERNACOES "data/internacoes.txt"
#define CAMINHO_LOGS "data/logs.txt"

// Caminhos alternativos (caso executado dentro de backend/)
#define ALT_PACIENTES "../data/pacientes.txt"
#define ALT_MEDICOS "../data/medicos.txt"
#define ALT_INTERNACOES "../data/internacoes.txt"
#define ALT_LOGS "../data/logs.txt"

int carregarPacientes(Paciente *p);
void salvarPacientes(Paciente *p, int total);

int carregarMedicos(Medico *m);
void salvarMedicos(Medico *m, int total);

int carregarInternacoes(Internacao *in);
void salvarInternacoes(Internacao *in, int total);

void registrarLog(const char *mensagem);

#endif
