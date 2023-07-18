# Desafio Backend Developer NodeJS - Customer API

O objetivo deste desafio, foi o desenvolvimento de um mini projeto back-end. Construimos uma RESTful API para um sistema de cadastro de clientes, que permite salvar, atualizar e buscar clientes por ID.

# Requisitos de Negócio

Cadastro performático e seguro para os clientes. O escopo deste projeto é implementar o backend desse sistema, fornecendo uma RESTful API que suporte as seguintes operações:

- Salvar um cliente novo
- Atualizar um cliente existente
- Buscar um cliente por ID

Para garantir a segurança dos dados cadastrados, usamos uma API de terceiro, para autorização de acesso às operações disponíveis.

# Premissas e Restrições
## Stack

- NodeJS
- NestJS
- Axios
- Typescript


# Infraestrutura

Para armazenamento dos dados, utilizamos o Redis. A conexão da aplicação com o Redis foi feita utilizando a biblioteca ioredis. Recomendamos que você utilize um container local do Docker para executar o Redis. Utilizando os seguintes comandos para fazer isso via terminal

```
docker pull redis
docker run -d -p 6379:6379 redis
```

# Autenticação

Para realizar a autenticação nas operações de clientes, você deve utilizar a API de autenticação fornecida. O token obtido na resposta da API de autenticação deve ser utilizado no header `Authorization` das requisições feitas à Customer API.

# Instalação e execução
## Pré-requisitos
- Node.js(versão 16 ou superior)
- NPM(Node Packege Manager)
- Docker (para geração da imagem)

## Passos para instalação e execurção do projeto

Clone o repositório do projeto:

```
git clone https://github.com/lucweb/desafio-backend.git
cd desafio-backend
```

Instale as dependências do projeto:
```
npm install
```

configura a conexão com o Redis:

Certifique-se de que o Redis esteja em execução no endereço `localhost:6379` ou atualize a configuração no arquivo `src/.env` de acordo com as suas configurações.


Execute os testes:
```
npm run test
```

Inicie a aplicação:
```
npm run start
```
A aplicação estará disponível em `http://localhost:3000`.

# Geração da imagem Docker
Certifique-se de que o Docker esteja instalado e em execução.

## Ambiente de homlogacão

**ATENÇÃO**: Certifique as configurações do arquivo `.env`, o sucesso da geração depende dos dados informados.

No diretório raiz do projeto, crie a imagem Docker executando o seguinte comando:
```
docker build --pull --rm -f "Dockerfile" -t desafio-backend-homologation:latest "."
```

Execute a aplicação em um container Docker:
```
docker run -d -p 3000:3000 --name nome-do-container desafio-backend-homologation:latest 
```


## Ambiente de Produção

**ATENÇÃO**: Certifique as configurações do arquivo `.env.production`, o sucesso da geração depende dos dados informados.

No diretório raiz do projeto, crie a imagem Docker executando o seguinte comando:
```
docker build --pull --rm -f "Dockerfile.production" -t desafio-backend-production:latest "."
```

Execute a aplicação em um container Docker:
```
docker run -d -p 3000:3000 --name nome-do-container desafio-backend-production:latest 
```


# LICENSE
```
MIT License

Copyright (c) 2023
```