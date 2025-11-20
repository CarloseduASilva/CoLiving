# Guia de Deploy - CoLiving Expense

Este guia mostra como fazer deploy do CoLiving Expense e deixá-lo online.

## Opções de Deploy

### 🚀 Opção 1: Vercel (Frontend) + Railway (Backend) - **RECOMENDADO**

Esta é a opção mais fácil e gratuita para começar.

#### Backend no Railway

1. **Criar conta no Railway**
   - Acesse https://railway.app
   - Faça login com GitHub

2. **Preparar o backend**
   
   Primeiro, vamos mudar o banco de dados de SQLite para PostgreSQL (Railway oferece PostgreSQL gratuito):

   ```bash
   cd backend
   npm install
   ```

   Edite `prisma/schema.prisma` e mude o datasource:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```

3. **Criar repositório no GitHub**
   
   ```bash
   cd c:/Users/Carlos/Documents/codigos/gemini
   git init
   git add .
   git commit -m "Initial commit"
   ```
   
   Crie um repositório no GitHub e faça push:
   ```bash
   git remote add origin https://github.com/SEU_USUARIO/coliving-expense.git
   git push -u origin main
   ```

4. **Deploy no Railway**
   - No Railway, clique em "New Project"
   - Selecione "Deploy from GitHub repo"
   - Escolha seu repositório
   - Clique em "Add variables" e adicione:
     - `JWT_SECRET`: `seu-secret-super-seguro-aqui`
     - `PORT`: `3001`
   - Railway vai detectar automaticamente o PostgreSQL
   - Clique em "Deploy"

5. **Rodar migrations**
   
   No Railway, vá em Settings > Deploy e adicione um comando de build:
   ```
   npm install && npx prisma generate && npx prisma migrate deploy
   ```

#### Frontend na Vercel

1. **Criar conta na Vercel**
   - Acesse https://vercel.com
   - Faça login com GitHub

2. **Deploy**
   - Clique em "Add New Project"
   - Selecione seu repositório do GitHub
   - Configure:
     - **Framework Preset**: Next.js
     - **Root Directory**: `frontend`
     - **Build Command**: `npm run build`
     - **Output Directory**: `.next`
   
3. **Variáveis de Ambiente**
   
   Adicione em Settings > Environment Variables:
   - `NEXT_PUBLIC_API_URL`: `https://seu-backend.railway.app` (copie a URL do Railway)

4. **Deploy**
   - Clique em "Deploy"
   - Aguarde o build finalizar

✅ **Pronto!** Seu app estará online em `https://seu-projeto.vercel.app`

---

### 🐳 Opção 2: Docker + VPS (DigitalOcean, AWS, etc.)

Para ter controle total, você pode usar Docker em um servidor VPS.

#### Preparar Docker

1. **Criar Dockerfile para o Backend**

```dockerfile
# backend/Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npx prisma generate

EXPOSE 3001

CMD ["npm", "run", "dev"]
```

2. **Criar Dockerfile para o Frontend**

```dockerfile
# frontend/Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

3. **Criar docker-compose.yml na raiz**

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: coliving
      POSTGRES_PASSWORD: senha-segura
      POSTGRES_DB: coliving_db
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  backend:
    build: ./backend
    ports:
      - "3001:3001"
    environment:
      DATABASE_URL: postgresql://coliving:senha-segura@postgres:5432/coliving_db
      JWT_SECRET: seu-secret-super-seguro
      PORT: 3001
    depends_on:
      - postgres
    command: sh -c "npx prisma migrate deploy && npm run dev"

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      NEXT_PUBLIC_API_URL: http://localhost:3001
    depends_on:
      - backend

volumes:
  postgres_data:
```

4. **Rodar localmente com Docker**

```bash
docker-compose up --build
```

5. **Deploy em VPS**

   - Alugue um VPS (DigitalOcean, AWS EC2, Linode, etc.)
   - Instale Docker e Docker Compose
   - Clone seu repositório
   - Configure as variáveis de ambiente
   - Execute `docker-compose up -d`
   - Configure Nginx como reverse proxy
   - Configure SSL com Let's Encrypt

---

### ☁️ Opção 3: Render (Tudo em um lugar)

Render oferece hospedagem gratuita para frontend e backend.

#### Backend

1. Acesse https://render.com
2. Crie um "New Web Service"
3. Conecte seu repositório GitHub
4. Configure:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install && npx prisma generate && npx prisma migrate deploy`
   - **Start Command**: `npm start`
5. Adicione PostgreSQL gratuito em "New PostgreSQL"
6. Adicione variáveis de ambiente:
   - `DATABASE_URL`: (será preenchido automaticamente pelo Render)
   - `JWT_SECRET`: seu-secret-seguro

#### Frontend

1. Crie um "New Static Site"
2. Configure:
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `.next`
3. Adicione variável:
   - `NEXT_PUBLIC_API_URL`: URL do seu backend no Render

---

### 🔥 Opção 4: Firebase (Google)

#### Backend
- Use Firebase Cloud Functions para a API
- Use Firestore como banco de dados

#### Frontend
- Use Firebase Hosting

---

## Preparações Necessárias

### 1. Atualizar CORS no Backend

Edite `backend/src/app.js`:

```javascript
const cors = require('cors');

app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://seu-dominio.vercel.app',
    'https://seu-dominio.com'
  ],
  credentials: true
}));
```

### 2. Mudar para PostgreSQL (Recomendado para produção)

**Atualizar `backend/prisma/schema.prisma`:**

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

**Instalar driver PostgreSQL:**

```bash
cd backend
npm install pg
```

**Rodar migrations:**

```bash
npx prisma migrate dev --name init
```

### 3. Variáveis de Ambiente de Produção

**Backend (.env):**
```env
DATABASE_URL="postgresql://user:password@host:5432/database"
JWT_SECRET="seu-secret-muito-seguro-e-aleatorio"
PORT=3001
NODE_ENV=production
```

**Frontend (.env.local):**
```env
NEXT_PUBLIC_API_URL=https://seu-backend.railway.app
```

### 4. Adicionar script de produção no Backend

Edite `backend/package.json`:

```json
{
  "scripts": {
    "dev": "node src/server.js",
    "start": "node src/server.js",
    "build": "npx prisma generate"
  }
}
```

---

## Checklist de Deploy

- [ ] Mudar de SQLite para PostgreSQL
- [ ] Configurar variáveis de ambiente
- [ ] Atualizar CORS para aceitar domínio de produção
- [ ] Criar repositório no GitHub
- [ ] Escolher plataforma de hospedagem
- [ ] Fazer deploy do backend
- [ ] Fazer deploy do frontend
- [ ] Testar autenticação
- [ ] Testar criação de grupos
- [ ] Testar adição de despesas
- [ ] Testar cálculo de saldos

---

## Custos Estimados

### Gratuito (Tier Free)
- **Vercel**: Frontend gratuito (100GB bandwidth/mês)
- **Railway**: $5 crédito/mês grátis (suficiente para começar)
- **Render**: Backend e DB gratuitos (com limitações)

### Pago (Produção)
- **VPS (DigitalOcean)**: $6-12/mês
- **Railway Pro**: $20/mês
- **Vercel Pro**: $20/mês
- **AWS/GCP**: Variável (pode começar grátis)

---

## Domínio Personalizado

1. **Comprar domínio**
   - Registro.br (Brasil): ~R$40/ano
   - Namecheap, GoDaddy: ~$10-15/ano

2. **Configurar DNS**
   - Na Vercel/Railway, adicione seu domínio
   - Configure os registros DNS (A, CNAME) conforme instruções da plataforma

---

## Monitoramento e Logs

- **Vercel**: Logs automáticos no dashboard
- **Railway**: Logs em tempo real no dashboard
- **Sentry**: Para tracking de erros (gratuito até 5k eventos/mês)
- **LogRocket**: Para session replay

---

## Próximos Passos Recomendados

1. ✅ Deploy básico (Vercel + Railway)
2. 📧 Adicionar email de confirmação
3. 🔐 Adicionar autenticação com Google/Facebook
4. 📱 Criar PWA (Progressive Web App)
5. 🔔 Adicionar notificações push
6. 💳 Integrar pagamentos (Stripe/PayPal)
7. 📊 Analytics (Google Analytics, Mixpanel)

---

## Suporte

Se tiver dúvidas durante o deploy:
- Documentação Vercel: https://vercel.com/docs
- Documentação Railway: https://docs.railway.app
- Documentação Render: https://render.com/docs
