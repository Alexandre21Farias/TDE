#include <stdio.h>
#include <string.h>
#include "login.h"
#include "utils.h"

int fazerLogin() {
    char senhaDigitada[50];
    int tentativas = 3;

    printf("==========================================\n");
    printf("       ACESSO RESTRITO AO SISTEMA         \n");
    printf("==========================================\n");
	
    while (tentativas > 0) {
        printf("Digite a senha de administrador: ");
        lerString(senhaDigitada, sizeof(senhaDigitada));

        if (strcmp(senhaDigitada, SENHA_SISTEMA) == 0) {
            printf("\nLogin realizado com sucesso!\n");
            return 1;
        } else {
            tentativas--;
            printf("Senha incorreta! Tentativas restantes: %d\n\n", tentativas);
        }
    }
    return 0;
}
