#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <time.h>
#include "utils.h"

void limparBuffer() {
    int c;
    while ((c = getchar()) != '\n' && c != EOF);
}

void lerString(char *destino, int tamanho) {
    fgets(destino, tamanho, stdin);
    destino[strcspn(destino, "\r\n")] = '\0';
}

void obterDataAtual(char *destino) {
    time_t t = time(NULL);
    struct tm *tm_info = localtime(&t);
    strftime(destino, 20, "%Y-%m-%d", tm_info);
}

void obterDataHoraAtual(char *destino) {
    time_t t = time(NULL);
    struct tm *tm_info = localtime(&t);
    // Formato ISO8601 aproximado
    strftime(destino, 30, "%Y-%m-%dT%H:%M:%S-03:00", tm_info);
}
