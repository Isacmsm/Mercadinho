# Mercadinho Esquina

Aplicativo de cadastro e gerenciamento de produtos desenvolvido com **Expo + React Native**, como atividade prática da disciplina.

---

## Telas e Fluxo do Codigo

### 1. Loja — Area do Cliente (`src/app/index.tsx`)

<img src="prints/tela-loja.png" width="280" alt="Tela Loja"/>

A tela principal que o cliente ve ao abrir o app. O fluxo de codigo funciona assim:

1. Ao entrar na aba, o hook `useFocusEffect` dispara `AsyncStorage.getItem("@crud_produtos")` e carrega todos os produtos salvos localmente.
2. Um `useMemo` filtra apenas os produtos com `status === "Ativo"` — produtos inativos cadastrados pelo vendedor nao aparecem aqui.
3. Um segundo `useMemo` aplica o filtro de categoria selecionado (pills horizontais no topo) e em seguida ordena a lista conforme o botao de ordenacao ativo: **Nome A-Z**, **Preco menor** ou **Preco maior**.
4. O `FlatList` renderiza cada produto com imagem (carregada via URL), nome, categoria, preco e descricao.
5. O botao **Adicionar ao Carrinho** chama `adicionarAoCarrinho(produto)`: le o carrinho atual do AsyncStorage (`@mercadinho:carrinho`), incrementa a quantidade se o produto ja existir ou insere um novo item, e salva de volta.

---

### 2. Gerenciar — Area do Vendedor (`src/app/vendedor.tsx`)

<img src="prints/tela-gerenciar.png" width="280" alt="Tela Gerenciar"/>

Painel administrativo completo. O fluxo:

1. Assim como a Loja, usa `useFocusEffect` para carregar os produtos ao entrar na aba.
2. O botao **+ Novo** abre um `ScrollView` de formulario (maxHeight 480px) com os campos: Nome, Categoria, Preco, Quantidade, Descricao, URL da Imagem e Status.
3. Ao salvar, a funcao `salvarProduto` executa tres camadas de validacao:
   - Campos obrigatorios (nome, preco, quantidade, imagem) — exibe `Alert` se vazio.
   - Preco e quantidade usam `keyboardType="numeric"` no input e `parseFloat`/`parseInt` ao salvar.
   - URL da imagem validada com Regex `/^https?:\/\/.+/i` — se invalida, a borda do campo fica vermelha e uma mensagem de erro aparece inline.
4. Se `idEditando` tiver valor, o produto existente e substituido na lista (`produtos.map`); caso contrario, e adicionado (`[...produtos, novoProduto]`).
5. A lista e salva no AsyncStorage e o estado local e atualizado simultaneamente.
6. Botao **Excluir**: usa `Platform.OS === "web"` para chamar `window.confirm` no navegador, ou `Alert.alert` com estilo `destructive` no celular — filtra o produto pelo `id` e salva a lista sem ele.
7. Filtro por categoria e ordenacao funcionam igual a tela Loja, porem exibem **todos** os produtos (ativos e inativos), para o vendedor ter visibilidade total do estoque.

---

### 3. Carrinho (`src/app/carrinho.tsx`)

<img src="prints/tela-carrinho.png" width="280" alt="Tela Carrinho"/>

Tela de compras do cliente. O fluxo:

1. `useFocusEffect` carrega os itens do AsyncStorage (`@mercadinho:carrinho`) toda vez que o usuario entra na aba — garantindo que novos itens adicionados na Loja aparecam imediatamente.
2. Cada item exibe nome, preco unitario, controles de quantidade (`+` e `-`) e subtotal.
3. Os botoes de quantidade chamam `atualizarQuantidade(id, delta)`: mapeia o array incrementando ou decrementando. Se a quantidade chegar a zero, o item e removido automaticamente via `.filter(item => item.quantidade > 0)`.
4. O total geral e calculado com `reduce` direto no render: `itens.reduce((soma, item) => soma + item.preco * item.quantidade, 0)`.
5. **Finalizar pedido** abre uma confirmacao com o valor total. Ao confirmar, `finalizarPedido`:
   - Remove `@mercadinho:carrinho` do AsyncStorage.
   - Limpa o estado local (`setItens([])`).
   - Exibe um `Alert` de sucesso.
   - Ao fechar o alerta, chama `router.push('/')` do Expo Router para retornar a tela Loja.

---

### 4. Perfil (`src/app/perfil.tsx`)

<img src="prints/tela-perfil.png" width="280" alt="Tela Perfil"/>

Tela de dados pessoais do usuario logado. O fluxo:

1. O `useAuth()` (Context API em `src/context/auth.tsx`) fornece o `usuario` logado e a funcao `logout`.
2. Ao montar, um `useEffect` le do AsyncStorage as chaves `@mercadinho:cartao:{usuario}` e `@mercadinho:endereco:{usuario}` — chaves por usuario para que cada conta tenha seus proprios dados.
3. Os campos de cartao usam mascaras de formatacao puras em string: numero do cartao agrupa em blocos de 4 digitos, validade insere `/` automaticamente e CEP insere `-` no quinto digito.
4. **Salvar** persiste o objeto no AsyncStorage com a chave do usuario atual.
5. **Sair da conta** chama `confirmarLogout()`:
   - No **celular**: `Alert.alert` com botoes Cancelar/Sair.
   - No **web**: `window.confirm` nativo do navegador.
   - Ao confirmar: `logout()` no AuthContext chama `setUsuario(null)` imediatamente (UI atualiza na hora) e depois limpa o AsyncStorage de sessao.
   - No `_layout.tsx`, um `useEffect` que observa `[usuario]` garante que apos o logout a tela de **Login** apareca diretamente — sem passar pela Splash novamente.

---

## Fluxo de Autenticacao

```
Abertura do app
      |
      v
  AnimatedSplashOverlay (600ms) ← animated-icon.tsx
      |
      v
  SplashScreen com logo (2.5s) ← splash-screen.tsx
      |                   |
      |            Sessao salva?
      |                   | sim
      v                   v
  LoginScreen ←→ RegistroScreen    AppTabs (usuario logado)
      |
  credenciais OK
      |
      v
  auth.tsx → AsyncStorage.setItem(@mercadinho:sessao)
      |
      v
  _layout.tsx detecta usuario != null → overlay some → AppTabs aparece
```

---

## Tecnologias

| Tecnologia | Uso |
|---|---|
| Expo 55 + React Native | Base do app (iOS, Android, Web) |
| Expo Router | Navegacao por arquivos |
| AsyncStorage | Persistencia local (produtos, carrinho, sessao, perfil) |
| React Native Reanimated | Animacoes de splash e icones |
| Context API | Estado global de autenticacao |
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

```bash
npm install
npx expo start
```

- `a` — emulador Android
- `i` — simulador iOS
- `w` — navegador Web
- QR Code — Expo Go no celular

---

## Integrantes

| Nome |
|---|
| Isac Manoel Soares Macedo |
| Guilherme Vasconcelos |

---

## Entregaveis (Atividade A1)

- [x] Codigo-fonte completo
- [x] Prints das telas
- [x] Relatorio (Relatorio_MercadinhoEsquina.docx)
- [x] Nome dos integrantes

**Data de entrega:** 01/04/2026
**Formulario:** https://forms.gle/T5uEmz7fNj4b6xrA9
