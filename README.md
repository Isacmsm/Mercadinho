# Mercadinho Esquina

Aplicativo de cadastro e gerenciamento de produtos desenvolvido com **Expo + React Native**, como atividade prática da disciplina.

---

## Funcionalidades

### Area do Cliente (Loja)
- Listagem de produtos ativos com imagem, nome, categoria, preco e descricao
- Filtro por categoria (pills horizontais dinamicas)
- Ordenacao por Nome A-Z, Preco menor e Preco maior
- Botao **Adicionar ao Carrinho** em cada produto

### Area do Vendedor (Gerenciar)
- CRUD completo: adicionar, editar e excluir produtos
- Formulario com campos: Nome, Categoria, Preco, Quantidade, Descricao, URL da Imagem e Status
- Validacoes: campos obrigatorios, preco/quantidade numericos, URL de imagem com Regex
- Filtro por categoria e ordenacao (mesmos da Loja)
- Confirmacao de exclusao nativa

### Carrinho
- Adicao de itens a partir da tela Loja
- Ajuste de quantidade e remocao de itens
- Calculo do total em tempo real
- Finalizacao de pedido com alerta de sucesso e retorno a Loja

### Perfil
- Exibicao do usuario logado
- Cadastro de cartao de pagamento (numero formatado)
- Cadastro de endereco de entrega (CEP formatado)
- Botao de sair da conta

### Autenticacao
- Tela de splash animada na abertura
- Cadastro de conta com validacao completa (nome, usuario, senha)
- Login com verificacao de credenciais
- Sessao persistente via AsyncStorage (permanece logado ao fechar o app)
- Logout instantaneo

---

## Tecnologias

| Tecnologia | Uso |
|---|---|
| Expo 55 + React Native | Base do app (iOS, Android, Web) |
| Expo Router | Navegacao por arquivos |
| AsyncStorage | Persistencia local (produtos, carrinho, sessao, perfil) |
| React Native Reanimated | Animacoes de splash e icones |
| React Navigation | Temas dark/light |
| TypeScript | Tipagem estatica |

---

## Estrutura do Projeto

```
src/
├── app/
│   ├── _layout.tsx        # Layout raiz com autenticacao
│   ├── index.tsx          # Tela Loja (cliente)
│   ├── vendedor.tsx       # Tela Gerenciar (CRUD)
│   ├── carrinho.tsx       # Tela Carrinho
│   └── perfil.tsx         # Tela Perfil
├── components/
│   ├── login-screen.tsx
│   ├── registro-screen.tsx
│   ├── splash-screen.tsx
│   ├── app-tabs.tsx       # Tabs nativas (iOS/Android)
│   └── app-tabs.web.tsx   # Tabs responsivas (Web)
├── context/
│   └── auth.tsx           # AuthContext (login, logout, sessao)
└── constants/
    └── theme.ts           # Cores, espacamentos, fontes
```

---

## Como rodar

**1. Instalar dependencias**
```bash
npm install
```

**2. Iniciar o app**
```bash
npx expo start
```

Apos iniciar, escolha a plataforma:
- Pressione `a` para abrir no emulador Android
- Pressione `i` para abrir no simulador iOS
- Pressione `w` para abrir no navegador (Web)
- Escaneie o QR Code com o **Expo Go** no celular

---

## Entregaveis (Atividade A1)

- [x] Codigo-fonte completo
- [ ] Prints das telas
- [ ] Relatorio com descricao do projeto e nome dos integrantes

**Data de entrega:** 01/04/2026
**Formulario:** https://forms.gle/T5uEmz7fNj4b6xrA9
