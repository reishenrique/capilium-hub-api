### Instruções temporárias para execução

__Requisitos:__

A aplicação depende de uma instância do Redis para o funcionamento correto da fila (atualmente apenas a `email-queue`). Para configurar o Redis, utilizamos um `docker-compose` com um service configurado corretamente para ser executado. Certifique-se de que o __Docker Desktop__ esteja em execução. Então, execute o seguinte comando para subir o contâiner:

`docker-compose up -d` ou, se for a primeira vez que você está rodando, para buildar o contâiner `docker-compose up -d --build`.

----

__Estrutura de execução:__

A aplicação é dividida em duas partes: __capilium-hub-api__ e __queue__, além de uma biblioteca compartilhada (para centralização de código que pode ser utilizada em outras aplicações da api) com o nome de __shared__. Cada aplicação precisa ser executa em um terminal separado.

1. __Terminal 1:__ Execute o seguinte comando para rodar o core da aplicação:
`npm run start:dev capilium-hub-api` ou apenas `npm run start:dev` (O Nest entende que o core da aplicação é o módulo __capilium-hub-api__)

2. __Terminal 2:__ Em um novo terminal, execute o comando para iniciar a fila:
`npm run start:dev queue`

---

__Configuração do Envio de Emails (Nodemailer)__

Estamos utilizando o __Nodemailer__ para realizar testes de integração entre a fila e o módulo principal da aplicação. Para configurar o Nodemailer, siga estas instruções:

1. Acesse o site [Ethereal Email](https://ethereal.email/create)
2. No painel de configuração do Nodemailer, você encontrará suas credencias de teste, como __host, port, user e password__ que são usados.
3. Use o arquivo `.env.example` para identificar as variáveis de ambiente necessarias e crie seu `.env`

__Importante:__ As credencias fornecidas pelo Ethereal são temporárias e podem ser atualizadas depois de um tempo. Não se esqueça de atualizar as variáveis de ambiente com as novas credencias sempre que necessário ou loggar um erro de autenticação.

__Visualização dos E-mail enviados__

Para visualizar os e-mails enviados para o __Ethereal Email__, clique em Open Mailbox na tela de criação. Lá, você poderá conferir os e-mails de teste enviados e processados pela fila.