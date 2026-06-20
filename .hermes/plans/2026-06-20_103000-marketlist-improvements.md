# Marketlist — Plano de Melhorias

> **Para implementar:** Use `delegate_task` com tasks do plano, uma por vez. Cada fase é autônoma e pode ser implementada separadamente.

**Goal:** Transformar o Marketlist num app mais seguro, robusto, offline-first e com melhor experiência do usuário.

**Arquitetura:** Melhorias incrementais no código existente — sem refactor total. Cada fase é independente e pode ser implantada separadamente.

**Tech Stack:** React Native / Expo 51, Firebase Auth + Firestore, TypeScript, NativeWind, Victory Native

---

## 📋 Sumário das Fases

| # | Fase | Esforço | Impacto |
|---|---|---|---|
| 1 | Segurança: credenciais em variáveis de ambiente | 🟢 30min | 🔥 Crítico |
| 2 | Limpeza de código morto | 🟢 20min | 🧹 Manutenção |
| 3 | Modo Offline | 🟡 2h | ⭐ Alto |
| 4 | Exportar/Compartilhar listas (PDF) | 🟡 3h | ⭐ Alto |
| 5 | Dark Mode | 🟡 2h | 🎨 UX |
| 6 | Sugestão inteligente de produtos | 🟡 2h | 🤖 Smart |
| 7 | Testes automatizados | 🟡 3h | 🛡️ Qualidade |

---

## Fase 1: 🔐 Segurança — Credenciais em Variáveis de Ambiente

**Objetivo:** Remover API keys hardcoded do código fonte.

**Arquivos:**
- Modificar: `src/database/firebaseConfig.ts`
- Modificar: `src/database/supabase.ts`
- Criar: `.env`
- Modificar: `app.json` (adicionar `extra.eas.build.env`)
- Modificar: `.gitignore` (adicionar `.env`)

### Task 1.1: Instalar react-native-dotenv

```
npm install react-native-dotenv
```

Adicionar ao `babel.config.js`:
```js
plugins: [['module:react-native-dotenv', { moduleName: '@env', path: '.env' }]]
```

### Task 1.2: Criar `.env` com as variáveis

```
FIREBASE_API_KEY=AIzaSy...Ar_s
FIREBASE_AUTH_DOMAIN=marketlist-26e37.firebaseapp.com
FIREBASE_PROJECT_ID=marketlist-26e37
FIREBASE_STORAGE_BUCKET=marketlist-26e37.appspot.com
FIREBASE_MESSAGING_SENDER_ID=41443072478
FIREBASE_APP_ID=1:41443072478:web:8e2e7bb60828e0eaaee54f
SUPABASE_URL=https://lxxahwthtcwknouccfrb.supabase.co
SUPABASE_ANON_KEY=eyJhbG...Rt_M
```

### Task 1.3: Atualizar `firebaseConfig.ts`

```ts
import { FIREBASE_API_KEY, FIREBASE_AUTH_DOMAIN, FIREBASE_PROJECT_ID, FIREBASE_STORAGE_BUCKET, FIREBASE_MESSAGING_SENDER_ID, FIREBASE_APP_ID } from '@env';

const firebaseConfig = {
  apiKey: FIREBASE_API_KEY,
  authDomain: FIREBASE_AUTH_DOMAIN,
  projectId: FIREBASE_PROJECT_ID,
  storageBucket: FIREBASE_STORAGE_BUCKET,
  messagingSenderId: FIREBASE_MESSAGING_SENDER_ID,
  appId: FIREBASE_APP_ID,
};
```

### Task 1.4: Atualizar `.gitignore`

Adicionar:
```
.env
.env.*
!.env.example
```

Criar `.env.example` com valores placeholder.

### Task 1.5: Adicionar tipagem para o `@env`

Criar ou modificar `env.d.ts`:
```ts
declare module '@env' {
  export const FIREBASE_API_KEY: string;
  export const FIREBASE_AUTH_DOMAIN: string;
  // ... todas as variáveis
}
```

**Verificação:** `npx tsc --noEmit` sem erros. App continua rodando normalmente.

---

## Fase 2: 🧹 Limpeza de Código Morto

**Objetivo:** Remover arquivos não utilizados, configuração órfã e código legado.

### Task 2.1: Remover integração Supabase (não utilizada)

- `src/database/supabase.ts` — Não é importado em nenhum lugar.
- Dependency: `@supabase/supabase-js`, `react-native-url-polyfill`

Remover do `package.json`:
```json
"@supabase/supabase-js": "^2.45.3",
"react-native-url-polyfill": "^2.0.0",
```

Rodar `npm uninstall @supabase/supabase-js react-native-url-polyfill`

### Task 2.2: Remover componente ShoppingList legado

`src/components/shoppingList/index.tsx` usa `route.params` do React Navigation antigo. O app atual usa Expo Router. Verificar se é importado em algum lugar — se não, remover.

### Task 2.3: Remover import não utilizado no Dashboard

No `src/app/(tabs)/dashboard/index.tsx`:
- `RotateInDownLeft` do reanimated — importado mas não usado (linha 28)

**Verificação:** App compila sem warnings. `npx tsc --noEmit` limpo.

---

## Fase 3: 📡 Modo Offline

**Objetivo:** App funciona sem internet — dados em cache local, sincroniza quando online.

### Task 3.1: Habilitar Firestore persistência offline

No `firebaseConfig.ts`, após inicializar o Firestore:
```ts
import { initializeFirestore, enableMultiTabIndexedDbPersistence, CACHE_SIZE_UNLIMITED } from 'firebase/firestore';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

const app = initializeApp(firebaseConfig);

// Auth com persistência
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

// Firestore com cache offline
const db = initializeFirestore(app, {
  cacheSizeBytes: CACHE_SIZE_UNLIMITED,
});
enableMultiTabIndexedDbPersistence(db).catch((err) => {
  if (err.code === 'failed-precondition') {
    console.warn('Offline: múltiplas abas abertas');
  } else if (err.code === 'unimplemented') {
    console.warn('Offline: browser não suporta');
  }
});
```

### Task 3.2: Indicador de conectividade

Criar hook `src/hooks/useNetworkStatus.ts`:

```ts
import { useState, useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';

export function useNetworkStatus() {
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    const unsub = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected ?? true);
    });
    return () => unsub();
  }, []);

  return isConnected;
}
```

### Task 3.3: Banner visual de "offline"

Criar `src/components/OfflineBanner.tsx`:

```tsx
import { View, Text } from 'react-native';
import { useNetworkStatus } from '@/src/hooks/useNetworkStatus';

export default function OfflineBanner() {
  const isConnected = useNetworkStatus();
  if (isConnected) return null;

  return (
    <View className="bg-yellow-500 px-4 py-2">
      <Text className="text-white text-center font-semibold">
        Você está offline — as alterações serão sincronizadas quando conectar
      </Text>
    </View>
  );
}
```

Inserir no `_layout.tsx` principal (dentro do `Stack`).

### Task 3.4: Cache de produtos e listas no AsyncStorage

Para que o catálogo de produtos funcione offline, salvar no AsyncStorage após cada fetch e carregar do cache quando offline.

Hook `src/hooks/useOfflineCache.ts`:
```ts
import AsyncStorage from '@react-native-async-storage/async-storage';

export async function cacheData(key: string, data: any) {
  await AsyncStorage.setItem(`cache_${key}`, JSON.stringify({
    data,
    timestamp: Date.now(),
  }));
}

export async function getCachedData(key: string, maxAgeMs = 3600000) {
  const raw = await AsyncStorage.getItem(`cache_${key}`);
  if (!raw) return null;
  const { data, timestamp } = JSON.parse(raw);
  if (Date.now() - timestamp > maxAgeMs) return null; // cache expirado
  return data;
}
```

**Verificação:** Desligar Wi-Fi, app continua funcional com dados em cache.

---

## Fase 4: 📤 Exportar / Compartilhar Listas

**Objetivo:** Gerar PDF da lista de compras e compartilhar via share sheet.

### Task 4.1: Adicionar dependências

```bash
npx expo install expo-sharing expo-file-system
npm install react-native-html-to-pdf
```

### Task 4.2: Criar função de exportação

`src/utils/exportList.ts`:

```ts
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

interface ExportItem {
  name: string;
  quantity: number;
  price: number;
}

export async function exportListAsHtml(listName: string, items: ExportItem[], total: number): Promise<string> {
  const itemsHtml = items
    .map((item) => `
      <tr>
        <td>${item.name}</td>
        <td style="text-align:center">${item.quantity}</td>
        <td style="text-align:right">R$ ${(item.price * item.quantity).toFixed(2)}</td>
      </tr>
    `)
    .join('');

  const html = `
    <html>
    <head><meta charset="utf-8"><style>
      body { font-family: Arial; padding: 20px; }
      h1 { color: #7e22ce; }
      table { width: 100%; border-collapse: collapse; }
      th { background: #7e22ce; color: white; padding: 8px; }
      td { padding: 8px; border-bottom: 1px solid #ddd; }
      .total { font-size: 18px; font-weight: bold; text-align: right; margin-top: 16px; }
    </style></head>
    <body>
      <h1>${listName}</h1>
      <table>
        <tr><th>Produto</th><th>Qtd</th><th>Valor</th></tr>
        ${itemsHtml}
      </table>
      <div class="total">Total: R$ ${total.toFixed(2)}</div>
    </body>
    </html>
  `;

  const filePath = `${FileSystem.cacheDirectory}${listName.replace(/\s+/g, '_')}.html`;
  await FileSystem.writeAsStringAsync(filePath, html);
  return filePath;
}

export async function shareFile(filePath: string) {
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(filePath);
  }
}
```

### Task 4.3: Adicionar botão "Compartilhar" na tela da lista

Em `src/app/list/[id].tsx`, adicionar botão ao lado de "Finalizar compras" no header:

```tsx
<TouchableOpacity onPress={handleShare}>
  <Ionicons name="share-outline" size={22} color="white" />
</TouchableOpacity>
```

Função `handleShare`:
```ts
const handleShare = async () => {
  const filePath = await exportListAsHtml(listName, products, total);
  await shareFile(filePath);
};
```

**Verificação:** Botão de compartilhar abre o share sheet nativo com o arquivo.

---

## Fase 5: 🌗 Dark Mode

**Objetivo:** Suporte a tema escuro seguindo a preferência do sistema.

### Task 5.1: Criar ThemeContext

`src/contexts/ThemeContext.tsx`:

```tsx
import React, { createContext, useContext, useMemo } from 'react';
import { useColorScheme } from 'react-native';

type Theme = 'light' | 'dark';

const ThemeContext = createContext<{ theme: Theme; colors: typeof lightColors }>({
  theme: 'light',
  colors: lightColors,
});

export const lightColors = {
  background: '#FFFFFF',
  card: '#F3F4F6',
  text: '#000000',
  textSecondary: '#6B7280',
  primary: '#7e22ce',
  primaryLight: '#ac24db',
  border: '#E5E7EB',
  success: '#86EFAC',
  danger: '#EF4444',
};

export const darkColors = {
  background: '#1F1F1F',
  card: '#2D2D2D',
  text: '#F9FAFB',
  textSecondary: '#9CA3AF',
  primary: '#A855F7',
  primaryLight: '#C084FC',
  border: '#404040',
  success: '#166534',
  danger: '#DC2626',
};

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const colorScheme = useColorScheme();
  const colors = colorScheme === 'dark' ? darkColors : lightColors;
  const theme = colorScheme ?? 'light';

  const value = useMemo(() => ({ theme, colors }), [theme, colors]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
```

### Task 5.2: Envolver o app com ThemeProvider

Em `src/app/_layout.tsx`:
```tsx
import { ThemeProvider } from '@/src/contexts/ThemeContext';

export default function RootLayout() {
  // ...
  return (
    <ThemeProvider>
      <Stack>...</Stack>
    </ThemeProvider>
  );
}
```

### Task 5.3: Atualizar cores nos componentes

Criar hook `useThemeColor` e substituir cores fixas nos principais componentes:

Em vez de `className="text-purple-700"`:
```tsx
const { colors } = useTheme();
<Text style={{ color: colors.primary }}>Texto</Text>
```

**Componentes a priorizar:**
- `Header` — bg muda para `colors.card` no dark
- `Container` — bg muda para `colors.background`
- `Dashboard/index.tsx` — gráfico e listas
- `list/[id].tsx` — itens e inputs
- `login.tsx` — tela de login
- `products.tsx` — catálogo

### Task 5.4: Atualizar NativeWind

Adicionar ao `tailwind.config.js` suporte a dark mode:
```js
module.exports = {
  // ...
  darkMode: 'class', // ou 'media' para system preference
}
```

Usar classes `dark:` do NativeWind onde possível (TypeScript puro sem hook):
```tsx
<View className="bg-white dark:bg-gray-900">
```

**Verificação:** Alternar o tema do sistema — app segue a mudança.

---

## Fase 6: 🤖 Sugestão Inteligente de Produtos

**Objetivo:** Ao digitar no campo de busca de produtos, sugerir os itens mais comprados daquela lista.

### Task 6.1: Registrar histórico de produtos adicionados

No Firestore, ao adicionar um produto a uma lista, incrementar um contador no documento do produto:
```
products/{id} {
  name: "Arroz",
  usageCount: 47,  // ← novo campo
  lastUsed: Timestamp,
}
```

### Task 6.2: Ordenar produtos por frequência de uso

No modal de adicionar produtos (`list/[id].tsx`), ordenar `availableProducts` por `usageCount` descendente:

```ts
const sortedProducts = [...availableProducts].sort((a, b) => {
  if (searchQuery) return 0; // não ordenar quando buscando
  return (b.usageCount || 0) - (a.usageCount || 0);
});
```

### Task 6.3: Seção "Mais Usados" no topo

Modificar o `SectionList` para incluir uma seção fixa "🔥 Mais usados" com os top 5 produtos.

**Verificação:** Produtos mais usados aparecem primeiro na lista de seleção.

---

## Fase 7: 🧪 Testes Automatizados

**Objetivo:** Garantir estabilidade com testes unitários e de componente.

### Task 7.1: Configurar ambiente de testes

O `package.json` já tem jest preset `jest-expo`. Criar `src/utils/__tests__/` e `src/components/__tests__/`.

Adicionar ao `jest.config.js` (ou no `package.json`):
```json
"jest": {
  "preset": "jest-expo",
  "transformIgnorePatterns": [
    "node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@sentry/react-native|native-base|react-native-svg|@shopify/react-native-skia|victory-native)/)"
  ]
}
```

### Task 7.2: Testar utilitários

`src/utils/__tests__/exportList.test.ts`:
- Gerar HTML com dados mock
- Verificar se o HTML contém nome da lista, itens, total

`src/utils/__tests__/offlineCache.test.ts` (com AsyncStorage mock):
- Salvar e recuperar do cache
- Verificar expiração

### Task 7.3: Testar hooks customizados

`src/hooks/__tests__/useNetworkStatus.test.ts` (com NetInfo mock):
- Retorna `true` quando online
- Retorna `false` quando offline

### Task 7.4: Testar componentes críticos

`src/components/__tests__/Header.test.tsx`:
- Renderiza título
- Mostra ícone de voltar quando não é Dashboard
- Chama `signOut` ao clicar no ícone de sair

`src/components/__tests__/OfflineBanner.test.tsx`:
- Não renderiza quando online
- Renderiza banner amarelo quando offline

**Verificação:** `npm test` roda todos os testes com sucesso.

---

## 📐 Estrutura Final Esperada

```
src/
├── app/
├── components/
│   ├── __tests__/
│   ├── OfflineBanner.tsx          # [NOVO]
│   └── ...
├── contexts/
│   └── ThemeContext.tsx            # [NOVO]
├── database/
│   ├── firebaseConfig.ts          # MODIFICADO
│   └── supabase.ts                # REMOVIDO
├── hooks/
│   ├── __tests__/
│   ├── useNetworkStatus.ts        # [NOVO]
│   └── useOfflineCache.ts         # [NOVO]
├── utils/
│   ├── __tests__/
│   ├── exportList.ts              # [NOVO]
│   └── ...
├── assets/
└── ...
.env                                # [NOVO]
.env.example                        # [NOVO]
```

---

## ⚠️ Riscos e Considerações

| Risco | Mitigação |
|---|---|
| **Firebase offline pode conflitar com múltiplas abas** | Usar `enableMultiTabIndexedDbPersistence` ou fallback para single-tab |
| **Dark Mode com NativeWind puro vs inline styles** | Priorizar `useTheme()` hook onde NativeWind `dark:` não cobre |
| **Compatibilidade de PDF em iOS/Android** | Usar HTML + Share como fallback universal |
| **Performance do Firestore offline** | Limitar cache a 100MB (`CACHE_SIZE_UNLIMITED` controlado) |
| **Regressão visual** | Cada fase deve ser testada visualmente no simulador antes de passar |

---

## 🚀 Ordem de Implementação Recomendada

```
Fase 1 (Segurança)     → ✅ Crítico, fazer primeiro
Fase 2 (Limpeza)       → ✅ Rápido, faz junto com Fase 1
Fase 3 (Offline)       → ⭐ Maior impacto para usuário
Fase 4 (Exportar)      → ⭐ Ótimo para compartilhamento
Fase 5 (Dark Mode)     → 🎨 UX, depende de Fase 2
Fase 6 (Sugestões)     → 🤖 Smart, usa dados existentes
Fase 7 (Testes)        → 🛡️ Pode ser feito em paralelo
```

**Pronto para começar?** Posso implementar fase por fase usando `delegate_task` — cada fase como uma task isolada com seu próprio contexto.
