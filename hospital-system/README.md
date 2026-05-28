# Sistema Hospitalar Híbrido Core

Este é um sistema hospitalar moderno e de alto padrão que funciona em arquitetura híbrida:
1. **Backend / Lógica em C**: Um console interativo robusto e modularizado para fins acadêmicos e auditorias de baixo nível.
2. **Interface Web Responsiva**: Uma aplicação web completa (HTML, CSS e JavaScript) com dashboard de ocupação de leitos em tempo real, painel de triagem e buscas.
3. **Servidor API Broker (Node.js)**: Um intermediador leve que serve os arquivos estáticos e expõe endpoints sincronizados com o banco de dados textual compartilhado.

---

## 📁 Estrutura do Projeto

* `/backend`: Códigos fonte em C modularizados.
* `/frontend`: Arquivos da interface gráfica Web (HTML, CSS, JavaScript).
* `/data`: Banco de dados compartilhado em arquivos de texto delimitados (`.txt`).
* `server.js`: Código do servidor Node.js que realiza a integração.

---

## 🛠️ Como Compilar e Rodar o Backend em C (CLI)

O código em C foi modularizado e limpo, podendo ser compilado por qualquer compilador padrão (GCC, Clang, MSVC) ou importado em IDEs como Code::Blocks e Dev-C++.

### Via Terminal (GCC):

Navegue até a pasta do projeto e execute:

```bash
# Compilar todos os arquivos do backend
gcc backend/*.c -o backend/hospital

# Executar o programa
./backend/hospital
```

Ao iniciar, o programa solicitará o acesso restrito. Use a senha administrativa padrão:
* **Senha:** `1234`

Você terá acesso a um menu completo de 10 opções (cadastros, internações, monitoramento de leitos por terminal, relatórios estatísticos e buscas). Qualquer ação de gravação atualizará imediatamente os arquivos em `/data`.

---

## 🌐 Como Executar a Interface Web (Front-end)

A interface Web comunica-se com os mesmos arquivos do banco de dados em C. Para iniciá-la:

1. Certifique-se de ter o [Node.js](https://nodejs.org/) instalado.
2. Com o terminal aberto na raiz da pasta `/hospital-system`, instale as dependências:
   ```bash
   npm install
   ```
3. Inicie o servidor local de desenvolvimento:
   ```bash
   npm run dev
   ```
   *(Ou `node server.js`)*
4. Abra o navegador de sua preferência e acesse:
   ```
   http://localhost:3000
   ```
5. Faça o login utilizando a senha padrão:
   * **Senha:** `1234`

---

## 🔄 Integração Híbrida em Funcionamento (Sincronização)

Como o backend em C e a API em Node.js acessam e atualizam o mesmo diretório de arquivos `/data`:
* Um paciente cadastrado pela tela do console C aparecerá **instantaneamente** ao recarregar a dashboard ou a lista de pacientes no navegador.
* Um leito alocado pelo mapa visual da interface Web ficará ocupado e refletirá **imediatamente** na opção `7 - Monitorar Ocupacao de Leitos` ou `10 - Relatorios Estatisticos` caso você execute o programa em C.
* Um registro de alta concedido pela interface Web ou pela CLI em C liberará o leito em ambas as frentes na mesma hora.
