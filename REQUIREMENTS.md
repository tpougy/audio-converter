# OPUS TO MP3 CONVERTER - ESPECIFICAÇÃO DE REQUISITOS

## 1. VISÃO GERAL

### 1.1 Propósito
Progressive Web App para conversão local de arquivos de áudio .opus para .mp3, com integração nativa ao sistema de compartilhamento do Android.

### 1.2 Fluxo de Uso Principal
```
WhatsApp (áudio .opus) 
  → Menu "Compartilhar" do Android
  → Opus2MP3 PWA (conversão automática)
  → Menu "Compartilhar" com MP3
  → ChatGPT ou outro app
```

### 1.3 Princípios de Design
- **Privacidade**: Processamento 100% local, nenhum dado enviado a servidores
- **Simplicidade**: Interface de página única, fluxo direto e intuitivo
- **Performance**: Conversões rápidas com feedback visual contínuo
- **Confiabilidade**: Funciona offline após primeira instalação

---

## 2. REQUISITOS FUNCIONAIS

### 2.1 Conversão de Áudio

**RF-01: Conversão Local**
- O sistema deve converter arquivos .opus para .mp3 utilizando ffmpeg.wasm
- A conversão deve ocorrer inteiramente no navegador do usuário
- Qualidade de saída: 192 kbps
- Codec: MPEG Audio Layer 3 (MP3)
- O nome do arquivo de saída deve manter o nome original com extensão .mp3

**RF-02: Limite de Tamanho**
- Suportar arquivos de entrada até 100 MB
- Validar tamanho antes de iniciar conversão
- Exibir mensagem clara se o arquivo exceder o limite
- Não permitir conversão de arquivos acima do limite

**RF-03: Feedback de Progresso**
- Exibir progresso em tempo real durante a conversão
- Mostrar percentual de conclusão
- Indicar a etapa atual (carregando FFmpeg, convertendo, finalizando)
- Permitir que o usuário cancele a conversão em andamento

**RF-04: Gerenciamento de Memória**
- Limpar dados temporários após conclusão da conversão
- Liberar recursos ao cancelar conversão
- Não manter arquivos de entrada/saída em memória após o uso

### 2.2 Integração com Android

**RF-05: Web Share Target (CRÍTICO)**
- O PWA deve aparecer no menu "Compartilhar" do sistema Android
- Deve aceitar os seguintes tipos MIME:
  - `audio/opus`
  - `audio/ogg`
  - `audio/*`
- Receber arquivos compartilhados via POST multipart/form-data
- Processar arquivos recebidos automaticamente sem interação adicional

**RF-06: Fluxo de Compartilhamento Recebido**
- Ao receber um arquivo via share target:
  1. Carregar a interface do PWA
  2. Iniciar conversão automaticamente
  3. Exibir progresso
  4. Ao concluir, apresentar opções de compartilhar/baixar

**RF-07: Web Share API (Saída)**
- Implementar compartilhamento do MP3 convertido usando Web Share API
- Permitir compartilhar com qualquer app compatível no Android
- Incluir nome do arquivo e tipo MIME corretos
- Fornecer fallback de download direto caso Web Share não esteja disponível

### 2.3 Métodos de Input de Arquivo

**RF-08: Upload Manual**
- Botão de seleção de arquivo via file picker nativo
- Área de drag-and-drop para arrastar arquivos
- Validar tipo e tamanho do arquivo ao selecionar
- Exibir preview com informações do arquivo (nome, tamanho, duração se possível)

**RF-09: Validação de Entrada**
- Aceitar apenas arquivos de áudio válidos
- Verificar extensão e tipo MIME
- Detectar arquivos corrompidos ou inválidos antes de tentar conversão
- Exibir mensagens de erro específicas para cada tipo de problema

### 2.4 Interface do Usuário

**RF-10: Design Responsivo com Bootstrap 5**
- Interface mobile-first
- Adaptável a diferentes tamanhos de tela
- Utilizar componentes do Bootstrap 5:
  - Cards para organização de conteúdo
  - Progress bars para feedback visual
  - Buttons para ações
  - Alerts para mensagens de status/erro
  - Icons (Bootstrap Icons)

**RF-11: Estados da Interface**

O aplicativo deve apresentar claramente os seguintes estados:

1. **Estado Inicial (Aguardando Arquivo)**
   - Área de upload destacada
   - Instruções claras de como selecionar/arrastar arquivo
   - Ícone visual representando upload

2. **Estado Preview (Arquivo Carregado)**
   - Informações do arquivo selecionado (nome, tamanho, tipo)
   - Botão principal "Converter para MP3" em destaque
   - Opção de cancelar e selecionar outro arquivo

3. **Estado Carregando FFmpeg**
   - Indicador de loading
   - Mensagem "Carregando conversor..."
   - Barra de progresso (se aplicável)

4. **Estado Convertendo**
   - Barra de progresso animada
   - Percentual numérico de conclusão
   - Mensagem descritiva da etapa atual
   - Botão "Cancelar" disponível

5. **Estado Concluído**
   - Ícone de sucesso
   - Informações do arquivo convertido
   - Botões de ação:
     - "Compartilhar MP3" (primário)
     - "Baixar MP3" (secundário)
     - "Converter Outro Arquivo" (terciário)

6. **Estado de Erro**
   - Ícone de erro
   - Mensagem descritiva do problema
   - Botão "Tentar Novamente" ou "Selecionar Outro Arquivo"

**RF-12: Acessibilidade**
- Seguir WCAG 2.1 Level AA
- Suporte completo para navegação por teclado
- Labels e ARIA attributes apropriados
- Contraste de cores adequado
- Mensagens de erro associadas aos elementos relevantes

**RF-13: Idioma**
- Toda interface em português brasileiro
- Mensagens de erro em português claro e objetivo
- Termos técnicos traduzidos quando apropriado

---

## 3. REQUISITOS TÉCNICOS - PWA

### 3.1 Web App Manifest

**RT-01: Configuração Básica**
- Nome completo: "Opus to MP3 Converter"
- Nome curto: "Opus2MP3"
- Descrição clara e concisa
- Ícones em dois tamanhos:
  - 192x192 pixels
  - 512x512 pixels
  - Formato PNG
  - Purpose: "any maskable" para ambos

**RT-02: Comportamento PWA**
- Display mode: standalone (tela cheia, sem chrome do navegador)
- Orientação: portrait (preferencialmente)
- Theme color: Consistente com a identidade visual (sugestão: azul Bootstrap)
- Background color: Cor de fundo enquanto carrega
- Start URL: raiz do aplicativo

**RT-03: Web Share Target Configuration**
- Action: endpoint `/share`
- Method: POST
- Enctype: multipart/form-data
- Params:
  - Nome do campo: "audio"
  - Accept: array de tipos MIME de áudio

### 3.2 Service Worker

**RT-04: Funcionalidades Obrigatórias**
- Interceptar e cachear todos os assets estáticos (HTML, CSS, JS)
- Cachear arquivos do Bootstrap 5 (CSS, JS)
- Cachear bibliotecas do FFmpeg.wasm (WASM files)
- Permitir funcionamento offline completo após primeira visita
- Implementar estratégia de atualização (cache com fallback para network)

**RT-05: Tratamento de Share Target**
- Interceptar requisições POST para `/share`
- Extrair arquivo do FormData recebido
- Armazenar temporariamente o arquivo (Cache API ou IndexedDB)
- Redirecionar para a página principal passando indicador de compartilhamento
- Limpar storage temporário após processamento

**RT-06: Gerenciamento de Cache**
- Versionamento de cache para permitir atualizações
- Limpar versões antigas de cache ao atualizar
- Não cachear arquivos de áudio do usuário
- Estratégia Cache-First para assets, Network-First para dados dinâmicos

### 3.3 FFmpeg.wasm

**RT-07: Carregamento**
- Carregar FFmpeg.wasm de forma assíncrona
- Não bloquear interface durante carregamento inicial
- Usar CDN confiável ou bundle local
- Cachear arquivos WASM para uso offline
- Exibir progresso de carregamento ao usuário

**RT-08: Conversão**
- Utilizar biblioteca @ffmpeg/ffmpeg (versão mais recente estável)
- Parâmetros de conversão:
  - Input: arquivo .opus original
  - Output: MP3 com 192kbps
  - Codec: libmp3lame
- Capturar eventos de progresso para atualizar UI
- Capturar logs para debugging (apenas em desenvolvimento)
- Implementar timeout para conversões que travarem

**RT-09: Cleanup**
- Remover arquivos do filesystem virtual do FFmpeg após conversão
- Liberar memória do WASM
- Não acumular arquivos temporários
- Preparar para próxima conversão sem recarregar FFmpeg

### 3.4 TypeScript

**RT-10: Estrutura e Tipos**
- Código 100% TypeScript (não JavaScript)
- Definir interfaces para:
  - Arquivo de entrada (nome, tamanho, tipo, blob)
  - Resultado de conversão (sucesso, arquivo de saída, erro, tempo)
  - Estado de progresso (etapa, percentual, mensagem)
  - Dados de compartilhamento (arquivos, título, texto)
- Configuração strict do TypeScript habilitada
- Sem uso de `any` (usar `unknown` quando necessário)

**RT-11: Organização Modular**
- Separar lógica em módulos coesos:
  - Conversor (lógica FFmpeg)
  - Controlador de UI (gerenciamento de estados da interface)
  - Handler de compartilhamento (Web Share APIs)
  - Utilidades (validações, formatação)
- Exportar interfaces públicas claramente
- Documentar funções complexas com JSDoc

---

## 4. REQUISITOS DE DESEMPENHO

### 4.1 Tempos de Resposta

**RD-01: Carregamento Inicial**
- First Contentful Paint: < 1.5 segundos
- Time to Interactive: < 3 segundos
- Tamanho total do bundle: < 1 MB (excluindo FFmpeg WASM)

**RD-02: Conversão**
- Arquivo de 5 MB: conversão em < 30 segundos (dispositivo médio)
- Arquivo de 50 MB: conversão em < 5 minutos
- Progresso atualizado no mínimo a cada 1 segundo

**RD-03: Instalação PWA**
- Service Worker registra em < 2 segundos
- Todos os assets críticos cacheados na primeira visita
- Subsequentes carregamentos offline em < 1 segundo

### 4.2 Qualidade PWA

**RD-04: Lighthouse Audit**
- PWA Score: > 90
- Performance Score: > 80
- Accessibility Score: > 90
- Best Practices Score: > 90

---

## 5. REQUISITOS DE COMPATIBILIDADE

### 5.1 Navegadores e Versões

**RC-01: Android**
- Chrome 90+ (obrigatório)
- Firefox 88+ (desejável)
- Samsung Internet 14+ (desejável)
- Edge 91+ (desejável)

**RC-02: Desktop (para testes)**
- Chrome 90+
- Edge 91+

**RC-03: APIs Necessárias**
- Service Worker API
- Web Share Target API (Level 2)
- Web Share API
- File API
- WebAssembly
- Cache API ou IndexedDB

### 5.2 Fallbacks

**RC-04: Web Share API**
- Se não disponível, oferecer download direto
- Esconder botão "Compartilhar" automaticamente
- Mostrar apenas botão "Baixar"

**RC-05: Offline**
- Exibir mensagem clara se FFmpeg não puder carregar offline na primeira vez
- Após primeira carga bem-sucedida, tudo deve funcionar offline

---

## 6. REQUISITOS DE SEGURANÇA E PRIVACIDADE

### 6.1 Privacidade

**RS-01: Processamento Local**
- Nenhum arquivo deve ser enviado para servidores externos
- Toda conversão ocorre no navegador do usuário
- Não implementar analytics ou tracking
- Não coletar nenhum dado do usuário

**RS-02: Armazenamento Temporário**
- Arquivos temporários devem ser limpos imediatamente após uso
- Não persistir áudios do usuário em cache ou storage
- Apenas assets estáticos (código, WASM) devem ser persistidos

### 6.2 Segurança

**RS-03: HTTPS**
- Aplicativo deve ser servido exclusivamente via HTTPS
- Service Worker só funciona em HTTPS
- Manifest só é reconhecido em HTTPS

**RS-04: Validação de Input**
- Validar tipo MIME do arquivo recebido
- Validar tamanho antes de processar
- Não confiar em extensão de arquivo apenas
- Tratar graciosamente arquivos malformados

---

## 7. TRATAMENTO DE ERROS

### 7.1 Cenários de Erro e Respostas

| Cenário | Mensagem ao Usuário | Comportamento Esperado |
|---------|---------------------|------------------------|
| Arquivo > 100 MB | "Arquivo muito grande. O tamanho máximo é 100 MB." | Bloquear conversão, permitir selecionar outro |
| Formato não suportado | "Este formato não é suportado. Por favor, selecione um arquivo .opus ou .ogg" | Rejeitar arquivo, voltar ao estado inicial |
| Arquivo corrompido | "Não foi possível ler este arquivo. Ele pode estar corrompido." | Abortar conversão, permitir tentar outro |
| FFmpeg falha ao carregar | "Erro ao carregar o conversor. Verifique sua conexão com a internet e tente novamente." | Oferecer botão "Tentar Novamente" |
| Conversão falha | "Ocorreu um erro durante a conversão. Por favor, tente novamente." | Voltar ao estado inicial, permitir nova tentativa |
| Sem suporte Web Share | (Esconder botão silenciosamente) | Mostrar apenas opção de download |
| Memória insuficiente | "Memória insuficiente. Tente fechar outros aplicativos e converter novamente." | Limpar estado, voltar ao início |
| Timeout na conversão | "A conversão está demorando muito. O arquivo pode ser muito grande ou complexo." | Oferecer cancelar ou aguardar mais |

### 7.2 Logs e Debugging

**RE-01: Logs**
- Em produção: apenas erros críticos no console
- Em desenvolvimento: logs detalhados de cada etapa
- Não expor informações sensíveis em logs

---

## 8. CASOS DE USO DETALHADOS

### 8.1 Caso de Uso Principal: Compartilhamento do WhatsApp

**Pré-condições:**
- PWA instalado no dispositivo Android
- Usuário possui áudio .opus no WhatsApp

**Fluxo Normal:**
1. Usuário abre mensagem de áudio no WhatsApp
2. Toca no botão de compartilhar
3. Sistema Android exibe menu com apps disponíveis
4. "Opus2MP3" aparece na lista de opções
5. Usuário seleciona "Opus2MP3"
6. PWA abre instantaneamente
7. Interface mostra "Convertendo..." com barra de progresso
8. Conversão ocorre automaticamente em background
9. Ao concluir, interface mostra "Conversão Concluída!" com opções
10. Usuário toca em "Compartilhar MP3"
11. Sistema Android exibe menu de compartilhamento novamente
12. Usuário seleciona "ChatGPT"
13. Arquivo MP3 é enviado para ChatGPT

**Fluxos Alternativos:**
- **10a.** Usuário prefere baixar: Toca em "Baixar MP3", arquivo é salvo em Downloads
- **8a.** Conversão falha: Exibe erro, oferece tentar novamente

**Pós-condições:**
- Arquivo MP3 disponível no app de destino
- Memória do PWA limpa
- Interface pronta para nova conversão

### 8.2 Caso de Uso Secundário: Upload Manual

**Pré-condições:**
- PWA aberto (instalado ou via navegador)
- Usuário possui arquivo .opus no dispositivo

**Fluxo Normal:**
1. Usuário abre PWA diretamente
2. Interface mostra área de upload
3. Usuário clica em "Selecionar Arquivo" OU arrasta arquivo para área
4. File picker abre / Arquivo é dropado
5. Usuário seleciona arquivo .opus
6. Sistema valida arquivo (tipo, tamanho)
7. Interface mostra preview do arquivo com botão "Converter para MP3"
8. Usuário clica em "Converter para MP3"
9. FFmpeg carrega (se primeira vez)
10. Conversão inicia com feedback visual
11. Barra de progresso atualiza continuamente
12. Conversão finaliza
13. Interface exibe sucesso com botões de ação
14. Usuário escolhe compartilhar ou baixar

**Fluxos Alternativos:**
- **6a.** Arquivo inválido: Exibe erro específico, rejeita arquivo
- **6b.** Arquivo muito grande: Exibe limite, rejeita arquivo
- **10a.** Usuário cancela: Conversão aborta, volta ao estado inicial

---

## 9. ESTRUTURA DO PROJETO

### 9.1 Organização de Arquivos

O projeto deve ser organizado de forma modular e escalável:
```
opus-to-mp3-pwa/
├── index.html              # Página principal
├── manifest.json           # PWA manifest
├── sw.js                   # Service Worker
├── assets/
│   ├── icons/             # Ícones PWA (192, 512)
│   └── styles/
│       └── custom.css     # Estilos complementares ao Bootstrap
├── src/                   # Código TypeScript
│   ├── main.ts            # Entry point principal
│   ├── converter.ts       # Lógica de conversão FFmpeg
│   ├── ui-controller.ts   # Gerenciamento de UI
│   ├── share-handler.ts   # Web Share Target e Share API
│   ├── types.ts           # Interfaces TypeScript
│   └── utils.ts           # Funções utilitárias
├── package.json
├── tsconfig.json
├── README.md
└── .gitignore
```

### 9.2 Responsabilidades dos Módulos

**main.ts**
- Inicialização do app
- Registro do Service Worker
- Detecção de compartilhamento recebido
- Orquestração dos demais módulos

**converter.ts**
- Carregar e inicializar FFmpeg.wasm
- Executar conversão de opus para mp3
- Gerenciar eventos de progresso
- Cleanup de recursos

**ui-controller.ts**
- Gerenciar transições entre estados da UI
- Atualizar elementos da interface
- Lidar com interações do usuário
- Exibir mensagens e erros

**share-handler.ts**
- Processar arquivos recebidos via Web Share Target
- Implementar Web Share API para saída
- Fallback para download direto

**types.ts**
- Definições de tipos e interfaces TypeScript
- Sem lógica, apenas tipos

**utils.ts**
- Validação de arquivos
- Formatação de tamanhos
- Outras funções auxiliares

---

## 10. CHECKLIST DE ACEITAÇÃO

### 10.1 Funcionalidades Core

- [ ] Conversão .opus → .mp3 funciona corretamente
- [ ] Qualidade do MP3 é 192kbps
- [ ] Arquivos até 100MB são processados
- [ ] Arquivos > 100MB são rejeitados com mensagem clara
- [ ] Progresso é exibido em tempo real
- [ ] Conversão pode ser cancelada
- [ ] Memória é limpa após cada conversão

### 10.2 PWA

- [ ] Manifest.json configurado corretamente
- [ ] Ícones 192x192 e 512x512 presentes
- [ ] Service Worker registra sem erros
- [ ] Assets estáticos são cacheados
- [ ] FFmpeg WASM é cacheado
- [ ] App funciona 100% offline após primeira visita
- [ ] App é instalável via prompt do navegador
- [ ] App abre em modo standalone (sem chrome do navegador)

### 10.3 Integração Android

- [ ] PWA aparece no menu "Compartilhar" do Android
- [ ] Aceita arquivos .opus compartilhados
- [ ] Conversão inicia automaticamente após compartilhar
- [ ] Web Share API compartilha MP3 com sucesso
- [ ] Fluxo WhatsApp → App → ChatGPT funciona completamente

### 10.4 Interface

- [ ] Bootstrap 5 integrado e funcionando
- [ ] Interface responsiva em diferentes telas
- [ ] Todos os 6 estados da UI estão implementados
- [ ] Drag-and-drop funciona
- [ ] Seleção de arquivo via picker funciona
- [ ] Feedback visual em todas as ações
- [ ] Textos em português brasileiro
- [ ] Acessibilidade (navegação por teclado, ARIA)

### 10.5 Tratamento de Erros

- [ ] Arquivo inválido é rejeitado com mensagem apropriada
- [ ] Arquivo muito grande é rejeitado
- [ ] Conversão falhada exibe erro claro
- [ ] FFmpeg falha ao carregar é tratado
- [ ] Fallback de download quando Web Share indisponível

### 10.6 Performance

- [ ] Carregamento inicial < 3 segundos
- [ ] Conversão de 5MB < 30 segundos
- [ ] Lighthouse PWA score > 90
- [ ] Sem memory leaks após múltiplas conversões

### 10.7 Documentação

- [ ] README.md com instruções de instalação
- [ ] README.md com instruções de uso
- [ ] README.md com instruções de deploy
- [ ] Código TypeScript comentado onde necessário

---

## 11. CRITÉRIOS DE QUALIDADE

### 11.1 Código

- TypeScript com strict mode habilitado
- ESLint configurado e sem erros
- Prettier configurado para formatação consistente
- Código modular e reutilizável
- Funções com responsabilidade única
- Nomes descritivos e em inglês

### 11.2 Testes Manuais Obrigatórios

**Em Desktop (Chrome DevTools):**
1. Abrir em modo de dispositivo mobile
2. Verificar Lighthouse audit (PWA, Performance, Accessibility)
3. Testar offline no DevTools
4. Verificar Service Worker na aba Application
5. Testar conversão de arquivo local

**Em Android (Dispositivo Real):**
1. Instalar PWA via prompt
2. Verificar ícone na home screen
3. Abrir PWA instalado (deve estar em fullscreen)
4. Compartilhar áudio do WhatsApp com o app
5. Verificar conversão automática
6. Compartilhar MP3 resultante com ChatGPT
7. Testar offline (desativar wifi/dados)
8. Verificar que funciona offline

---

## 12. ENTREGÁVEIS

1. **Código-fonte completo** em TypeScript
2. **Assets**: Ícones PWA em tamanhos corretos
3. **manifest.json** funcional
4. **Service Worker** funcional
5. **README.md** com:
   - Descrição do projeto
   - Como instalar dependências
   - Como rodar em desenvolvimento
   - Como fazer build de produção
   - Como fazer deploy
   - Como testar no Android
6. **package.json** com scripts úteis (dev, build, preview)

---

## 13. NOTAS IMPORTANTES

### 13.1 Prioridades

**Prioridade Máxima (Deve funcionar perfeitamente):**
- Web Share Target API (aparecer no menu compartilhar)
- Conversão .opus → .mp3
- Funcionamento offline

**Prioridade Alta:**
- Interface responsiva e clara
- Tratamento de erros
- Performance adequada

**Prioridade Média:**
- Otimizações avançadas
- Animações suaves
- Logs detalhados

### 13.2 Melhorias Futuras (NÃO implementar agora)

- Suporte a outros formatos (AAC, M4A, WAV)
- Conversão em lote (múltiplos arquivos)
- Configuração de bitrate personalizável
- Dark mode
- Histórico de conversões
- Estatísticas de uso
- Configurações avançadas de conversão

### 13.3 Deploy

O aplicativo deve ser deployado em um serviço que suporte:
- HTTPS (obrigatório para PWA)
- Service Workers
- Configuração de headers corretos

Opção que será utilizada para deploy:
- GitHub Pages, com custom domain para HTTPS

---

**Versão**: 1.0
**Data**: Dezembro 2025
**Autor**: Thomaz
