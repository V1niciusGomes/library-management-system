# Library Management System

Este é um sistema completo de gerenciamento de bibliotecas, desenvolvido como um projeto fullstack. Ele utiliza **Java** no backend e **React** no frontend, com suporte para execução local e em containers Docker. O objetivo do projeto é fornecer uma solução eficiente para gerenciar livros, usuários e empréstimos em uma biblioteca.

---

## 📂 Estrutura do Projeto

```plaintext
.
├── backend/                # Código-fonte do backend (Java, Spring Boot)
│   ├── src/                # Código-fonte principal e testes
│   ├── Dockerfile          # Configuração do Docker para o backend
│   └── pom.xml             # Gerenciamento de dependências (Maven)
├── frontend/               # Código-fonte do frontend (React, Vite)
│   ├── src/                # Componentes e estilos do frontend
│   ├── Dockerfile          # Configuração do Docker para o frontend
│   ├── package.json        # Gerenciamento de dependências (Node.js)
│   └── vite.config.js      # Configuração do Vite
├── docker-compose.yml      # Orquestração de serviços com Docker
├── Start-Dev.ps1           # Script para inicializar o ambiente de desenvolvimento
└── .vscode/                # Configurações do Visual Studio Code
```

🛠️ Tecnologias Utilizadas
Backend: Java 17+, Spring Boot, Maven
Frontend: React, Vite, JavaScript/TypeScript
Banco de Dados: MySQL (ou outro configurado no application.properties)
Docker: Para orquestração de serviços
