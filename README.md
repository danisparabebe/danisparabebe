# Danis Para Bebê - Plataforma de Enxovais Personalizados 🍼

## 🎯 Visão Geral

Plataforma completa de e-commerce para venda de enxovais personalizados de luxo. Sistema permite que clientes montem enxovais personalizados (produto + tecido + bordado + nome do bebê), vejam preço em tempo real, e finalizem a compra com Stripe.

## ✨ Funcionalidades

### Homepage (`/`)
- Hero section premium com animações Framer Motion
- Seção "Como Funciona" com 3 passos visuais
- Galeria de produtos mais vendidos
- Design responsivo mobile-first
- Gradientes e animações sofisticadas

### Configurador de Enxoval (`/montar-enxoval`)
Wizard de 5 passos com state management via Zustand:

1. **Escolha do Produto**: Grid visual com 6 produtos base
2. **Seleção de Tecido**: Swatches circulares com 6 opções de tecido
3. **Escolha do Bordado**: Cards com 6 designs de bordado
4. **Personalização**: Input com prévia do nome em fonte cursiva (Dancing Script)
5. **Resumo**: Card elegante com todos os detalhes e preço total

### Checkout & Pagamento
- Integração completa com Stripe Checkout
- Firebase para persistência de pedidos
- Webhook para atualização automática de status
- Placeholder para automação n8n/WhatsApp
- Página de sucesso pós-pagamento

## 🛠 Stack Tecnológica

- **Framework**: Next.js 14 (App Router) + TypeScript
- **Estilização**: Tailwind CSS com design system customizado
- **Animações**: Framer Motion
- **UI**: Lucide React Icons
- **Estado**: Zustand com localStorage persistence
- **Banco**: Firebase Firestore
- **Pagamento**: Stripe
- **Fontes**: Google Fonts (Playfair Display, Nunito, Dancing Script)

## 🎨 Design System

```css
--creme: #EFE9C3    /* Background */
--rosa: #F082A3     /* Primary/Actions */
--azul: #C4D5F1     /* Secondary */
```

- **Tipografia**: Playfair Display (headings), Nunito (body)
- **Bordas**: `rounded-3xl` em todos os elementos
- **Estética**: "Soft Luxury" - fofo mas premium

## 🚀 Início Rápido

### 1. Instalar Dependências
```bash
npm install
```

### 2. Configurar Variáveis de Ambiente
Crie `.env.local` baseado em `ENV_SETUP.md`:

```env
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=sua_chave
NEXT_PUBLIC_FIREBASE_PROJECT_ID=seu_projeto_id
# ... (ver ENV_SETUP.md para detalhes completos)

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### 3. Executar em Desenvolvimento
```bash
npm run dev
```

Acesse: `http://localhost:3000`

### 4. Limpar Cache TypeScript (se necessário)
```bash
Remove-Item -Recurse -Force .next
npm run build
```

## 🔗 Integrações

### Firebase Firestore
Coleções criadas automaticamente:
- `orders`: Pedidos com status (pending, paid, processing, completed)

### Stripe
- **Modo**: Test mode por padrão
- **Moeda**: BRL (Real Brasileiro)
- **Webhook Events**: `checkout.session.completed`

**Cartão de Teste**:
```
Número: 4242 4242 4242 4242
Data: Qualquer data futura
CVC: Qualquer 3 dígitos
```

### n8n (Placeholder)
Adicione sua URL de webhook em `.env.local` para automação WhatsApp.
Local do código: `src/app/api/webhooks/checkout/route.ts` (linha 46)

## 📱 Responsividade

- **Mobile First**: Otimizado para celulares (90% dos usuários)
- **Breakpoints**: sm (640px), md (768px), lg (1024px)
- **Progress Stepper**: Versão compacta no mobile, completa no desktop

## 🎯 Próximos Passos

1. **Imagens Reais**: Substituir emojis por fotos reais dos produtos
2. **Firebase Auth**: Adicionar login de clientes
3. **Admin Panel**: Dashboard para gerenciar pedidos
4. **Email**: Confirmações automáticas por email
5. **n8n**: Ativar automação WhatsApp

---

**Desenvolvido com ❤️ usando Next.js 14, Tailwind CSS e Framer Motion**
