# Opus to MP3 Converter (PWA)

Progressive Web App para conversão local de arquivos de áudio `.opus` para `.mp3`, com integração nativa ao sistema de compartilhamento do Android.

## Funcionalidades

- Conversão de áudio `.opus`/`.ogg` para `.mp3` (192kbps)
- Processamento 100% local no navegador usando FFmpeg.wasm
- Integração com Web Share Target API (aparece no menu "Compartilhar" do Android)
- Funciona offline após a primeira instalação
- Interface responsiva com Bootstrap 5
- Suporte a drag-and-drop

## Fluxo de Uso Principal

```
WhatsApp (áudio .opus)
  → Menu "Compartilhar" do Android
  → Opus2MP3 PWA (conversão automática)
  → Menu "Compartilhar" com MP3
  → ChatGPT ou outro app
```

## Requisitos

- Node.js 18+
- npm ou yarn

## Instalação

```bash
# Clone o repositório
git clone <url-do-repositorio>
cd opus-to-mp3-pwa

# Instale as dependências
npm install

# Gere os ícones PWA
npm run generate-icons
```

## Desenvolvimento

```bash
# Inicie o servidor de desenvolvimento
npm run dev
```

O app estará disponível em `http://localhost:5173`

**Nota**: Para testar funcionalidades PWA completas (Service Worker, Share Target), é necessário usar HTTPS. O Vite configura automaticamente os headers necessários para o FFmpeg.wasm funcionar.

## Build de Produção

```bash
# Gere a build de produção
npm run build

# Preview da build
npm run preview
```

Os arquivos de produção serão gerados na pasta `dist/`.

## Deploy

O app deve ser hospedado em um servidor com HTTPS. Opções recomendadas:

### GitHub Pages

1. Configure o repositório no GitHub
2. Ative GitHub Pages nas configurações
3. Configure um domínio customizado para HTTPS

### Netlify / Vercel

1. Conecte o repositório
2. Configure o comando de build: `npm run build`
3. Configure a pasta de publicação: `dist`

### Configurações Importantes para Deploy

O servidor deve suportar os seguintes headers para o FFmpeg.wasm funcionar:

```
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Embedder-Policy: require-corp
```

## Testando no Android

1. Acesse o app via HTTPS no navegador Chrome do Android
2. O navegador exibirá um banner para instalar o PWA
3. Após instalar, o app aparecerá no menu "Compartilhar" do sistema
4. Compartilhe um áudio do WhatsApp com o app
5. A conversão iniciará automaticamente
6. Compartilhe ou baixe o MP3 resultante

## Estrutura do Projeto

```
opus-to-mp3-pwa/
├── index.html              # Página principal
├── public/
│   ├── manifest.json       # PWA manifest
│   ├── sw.js               # Service Worker
│   └── assets/
│       ├── icons/          # Ícones PWA
│       └── styles/         # CSS
├── src/
│   ├── main.ts             # Entry point
│   ├── converter.ts        # Lógica FFmpeg
│   ├── ui-controller.ts    # Gerenciamento de UI
│   ├── share-handler.ts    # Web Share APIs
│   ├── types.ts            # Interfaces TypeScript
│   └── utils.ts            # Funções auxiliares
├── assets/
│   ├── icons/              # Ícone SVG fonte
│   └── styles/             # CSS fonte
├── scripts/
│   └── generate-icons.js   # Gerador de ícones PNG
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## Tecnologias

- **Frontend**: HTML5, Bootstrap 5, TypeScript
- **Conversão**: FFmpeg.wasm
- **PWA**: Service Worker, Web App Manifest
- **Build**: Vite
- **APIs**: Web Share Target API, Web Share API, File API

## Limitações

- Tamanho máximo de arquivo: 100 MB
- Formatos de entrada: `.opus`, `.ogg`
- Formato de saída: MP3 192kbps
- Web Share Target API requer Android + Chrome

## Privacidade

- Nenhum dado é enviado a servidores externos
- Toda conversão ocorre localmente no navegador
- Arquivos temporários são limpos após o uso
- Não há analytics ou tracking

## Licença

MIT
