# 🗄️ Database Setup Guide

This guide will help you set up a PostgreSQL database for authentication and conversation history features.

## 📋 Database Schema

The app uses 3 tables:
- **users** - User accounts (email, password, name)
- **conversations** - Chat conversations
- **messages** - Individual messages in conversations

---

## Option 1: Local PostgreSQL (Recommended for Development)

### 📦 Install PostgreSQL on Fedora

```bash
# Install PostgreSQL
sudo dnf install postgresql postgresql-server postgresql-contrib

# Initialize the database
sudo postgresql-setup --initdb

# Start and enable PostgreSQL service
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Check status
sudo systemctl status postgresql
```

### 🔧 Configure PostgreSQL

1. **Switch to postgres user:**
```bash
sudo -i -u postgres
```

2. **Create database and user:**
```bash
# Open PostgreSQL prompt
psql

# In the PostgreSQL prompt:
CREATE DATABASE solveforge;
CREATE USER solveforge_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE solveforge TO solveforge_user;

# Grant schema permissions (PostgreSQL 15+)
\c solveforge
GRANT ALL ON SCHEMA public TO solveforge_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO solveforge_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO solveforge_user;

# Exit
\q
exit
```

3. **Update `.env.local`:**
```bash
# Add this line to your .env.local file
DATABASE_URL=postgresql://solveforge_user:your_secure_password@localhost:5432/solveforge

# Keep your existing Gemini key
GEMINI_API_KEY=AIzaSyBfNp1ko-wOpI1tCakMJF7uUt8YFQJtU_4
```

4. **Create database tables:**
```bash
cd "/home/languid/Downloads/.zapzap_temp/solveforge-ai-co-pilot (1)"
npm run db:push
```

5. **Restart the dev server:**
```bash
npm run dev
```

---

## Option 2: Docker PostgreSQL (Easier, Isolated)

### 📦 Using Docker Compose

1. **Install Docker (if not installed):**
```bash
# On Fedora
sudo dnf install docker docker-compose
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker $USER
# Log out and back in for group changes
```

2. **Create `docker-compose.yml` in your project root:**
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    container_name: solveforge-db
    environment:
      POSTGRES_DB: solveforge
      POSTGRES_USER: solveforge_user
      POSTGRES_PASSWORD: dev_password_123
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

volumes:
  postgres_data:
```

3. **Start the database:**
```bash
docker-compose up -d
```

4. **Update `.env.local`:**
```bash
DATABASE_URL=postgresql://solveforge_user:dev_password_123@localhost:5432/solveforge
GEMINI_API_KEY=AIzaSyBfNp1ko-wOpI1tCakMJF7uUt8YFQJtU_4
```

5. **Create tables:**
```bash
npm run db:push
```

6. **Restart dev server:**
```bash
npm run dev
```

### Docker Commands:
```bash
# Start database
docker-compose up -d

# Stop database
docker-compose down

# View logs
docker-compose logs -f postgres

# Access PostgreSQL shell
docker exec -it solveforge-db psql -U solveforge_user -d solveforge
```

---

## Option 3: Cloud Database (Free Tiers)

### 🌐 Neon (Recommended - Free, Easy)

1. Go to [neon.tech](https://neon.tech)
2. Sign up for free account
3. Create a new project
4. Copy the connection string
5. Add to `.env.local`:
```bash
DATABASE_URL=postgresql://user:password@host.neon.tech/dbname?sslmode=require
GEMINI_API_KEY=AIzaSyBfNp1ko-wOpI1tCakMJF7uUt8YFQJtU_4
```
6. Run: `npm run db:push`

### 🐘 Supabase (Free Tier)

1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Go to Settings → Database → Connection String
4. Copy the connection pooler string
5. Add to `.env.local`:
```bash
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT].supabase.co:5432/postgres
GEMINI_API_KEY=AIzaSyBfNp1ko-wOpI1tCakMJF7uUt8YFQJtU_4
```
6. Run: `npm run db:push`

### 🚀 Railway (Free Tier)

1. Go to [railway.app](https://railway.app)
2. Create new project → Add PostgreSQL
3. Copy the DATABASE_URL from variables
4. Add to `.env.local`
5. Run: `npm run db:push`

---

## ✅ Verify Database Setup

After setting up, verify everything works:

```bash
# Check if tables were created
npm run db:push

# Expected output:
# Using 'postgresql' driver for database
# ... migrations applied successfully
```

### Test the Connection:

1. Start dev server: `npm run dev`
2. You should see:
```
Server running on http://localhost:3001
✅ Database connected successfully
```

3. Open `http://localhost:5000` in browser
4. Try registering a new account (if you added auth UI)

---

## 🔍 Troubleshooting

### "Connection refused" Error
```bash
# Check if PostgreSQL is running
sudo systemctl status postgresql

# Start it if stopped
sudo systemctl start postgresql
```

### "Permission denied" Error
```bash
# Fix PostgreSQL authentication
sudo nano /var/lib/pgsql/data/pg_hba.conf

# Change this line:
local   all             all                                     peer

# To:
local   all             all                                     md5

# Restart PostgreSQL
sudo systemctl restart postgresql
```

### "Database does not exist"
```bash
# Recreate the database
sudo -i -u postgres
psql
CREATE DATABASE solveforge;
\q
exit
```

### Can't connect to Docker PostgreSQL
```bash
# Check if container is running
docker ps

# Restart container
docker-compose restart postgres

# Check logs
docker-compose logs postgres
```

---

## 📊 Database Management Tools

### Command Line:
```bash
# Local PostgreSQL
psql -U solveforge_user -d solveforge

# Docker PostgreSQL
docker exec -it solveforge-db psql -U solveforge_user -d solveforge
```

### GUI Tools:

1. **pgAdmin** (Full-featured)
   - Download: https://www.pgadmin.org/
   ```bash
   sudo dnf install pgadmin4
   ```

2. **DBeaver** (Multi-database)
   - Download: https://dbeaver.io/

3. **TablePlus** (Modern, Sleek)
   - Download: https://tableplus.com/

---

## 🗑️ Reset Database

If you need to start fresh:

```bash
# Drop and recreate database
sudo -i -u postgres
psql
DROP DATABASE solveforge;
CREATE DATABASE solveforge;
GRANT ALL PRIVILEGES ON DATABASE solveforge TO solveforge_user;
\c solveforge
GRANT ALL ON SCHEMA public TO solveforge_user;
\q
exit

# Recreate tables
npm run db:push
```

---

## 🔒 Security Best Practices

1. **Never commit database credentials**
   - `.env.local` is already in `.gitignore`
   
2. **Use strong passwords** in production

3. **For production:**
   - Use environment variables
   - Enable SSL/TLS
   - Set up regular backups
   - Use connection pooling

4. **Rotate passwords regularly**

---

## 📈 Next Steps

After database setup:

1. ✅ Restart dev server
2. ✅ Register a test account
3. ✅ Create conversations
4. ✅ Test message history
5. ✅ Verify data persistence

---

## 🆘 Still Having Issues?

Common issues and solutions:

1. **Port 5432 already in use**
   ```bash
   # Find what's using the port
   sudo lsof -i :5432
   
   # Kill the process or use different port
   ```

2. **Can't connect after restart**
   - Check `.env.local` has correct DATABASE_URL
   - Restart both database and dev server

3. **Tables not created**
   - Run `npm run db:push` again
   - Check for errors in output

---

## 📝 Quick Start (TL;DR)

**Fastest option - Docker:**
```bash
# 1. Create docker-compose.yml (see Option 2)
docker-compose up -d

# 2. Add to .env.local
echo "DATABASE_URL=postgresql://solveforge_user:dev_password_123@localhost:5432/solveforge" >> .env.local

# 3. Create tables
npm run db:push

# 4. Restart server
npm run dev
```

Done! Database is ready. 🎉
