# Deploy Rápido - Vercel + Railway

## Passo a Passo Simplificado

### 1. Preparar o Código

```bash
cd c:/Users/Carlos/Documents/codigos/gemini

# Inicializar Git
git init
git add .
git commit -m "Initial commit - CoLiving Expense"
```

### 2. Criar Repositório no GitHub

1. Vá em https://github.com/new
2. Crie um repositório chamado `coliving-expense`
3. **NÃO** inicialize com README

```bash
git remote add origin https://github.com/SEU_USUARIO/coliving-expense.git
git branch -M main
git push -u origin main
```

### 3. Deploy do Backend (Railway)

1. Acesse https://railway.app
2. Login com GitHub
3. Clique em **"New Project"**
4. Selecione **"Deploy from GitHub repo"**
5. Escolha `coliving-expense`
6. Railway detectará automaticamente o backend
7. Clique em **"Add PostgreSQL"** (banco de dados gratuito)
8. Vá em **Variables** e adicione:
   - `JWT_SECRET`: `coliving-secret-2024-super-seguro`
   - `PORT`: `3001`
9. Em **Settings** > **Root Directory**: `backend`
10. Aguarde o deploy (2-3 minutos)
11. **Copie a URL** do seu backend (ex: `https://coliving-backend.railway.app`)

### 4. Deploy do Frontend (Vercel)

1. Acesse https://vercel.com
2. Login com GitHub
3. Clique em **"Add New Project"**
4. Selecione `coliving-expense`
5. Configure:
   - **Framework Preset**: Next.js
   - **Root Directory**: `frontend`
6. Em **Environment Variables**, adicione:
   - **Name**: `NEXT_PUBLIC_API_URL`
   - **Value**: `https://coliving-backend.railway.app` (URL do Railway)
7. Clique em **Deploy**
8. Aguarde (2-3 minutos)

### 5. Atualizar CORS no Backend

Após o deploy, você precisa permitir que o frontend acesse o backend.

Edite `backend/src/app.js` e atualize:

```javascript
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://seu-projeto.vercel.app' // Adicione sua URL da Vercel aqui
  ],
  credentials: true
}));
```

Faça commit e push:

```bash
git add .
git commit -m "Update CORS for production"
git push
```

Railway fará redeploy automaticamente.

### 6. Testar

Acesse `https://seu-projeto.vercel.app` e teste:
- ✅ Criar conta
- ✅ Fazer login
- ✅ Criar grupo
- ✅ Adicionar despesa

---

## Problemas Comuns

### ❌ Erro de CORS
**Solução**: Adicione a URL da Vercel no CORS do backend

### ❌ Erro de Database
**Solução**: Verifique se o PostgreSQL está conectado no Railway

### ❌ Erro 500 no Backend
**Solução**: Veja os logs no Railway Dashboard > Deployments > Logs

### ❌ Frontend não conecta ao Backend
**Solução**: Verifique se `NEXT_PUBLIC_API_URL` está correto na Vercel

---

## Custos

- **Railway**: $5 grátis/mês (suficiente para começar)
- **Vercel**: 100% gratuito para hobby projects
- **Total**: GRÁTIS para começar! 🎉

---

## Próximos Passos

1. ✅ Adicionar domínio personalizado
2. ✅ Configurar SSL (automático na Vercel/Railway)
3. ✅ Monitorar uso no dashboard
4. ✅ Adicionar mais features!
