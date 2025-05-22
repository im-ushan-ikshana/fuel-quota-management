# How to Set Up and Run Prisma

## For Windows Users (Step-by-Step)

### 1. Open a terminal and go to the `backend` folder:

If you're using Git Bash or Command Prompt:

```bash
cd backend
```

### 2. Copy the environment file:

In Git Bash:

```bash
cp .env.example .env
```

If you're using Command Prompt or PowerShell:

```powershell
copy .env.example .env
```

### 3. Edit the `.env` file:

Open the file in your text editor (e.g., VS Code):

```powershell
code .env
```

Or open with Notepad:

```powershell
notepad .env
```

Find this line:

```
DATABASE_URL="mysql://username:password@localhost:3306/your_db_name"
```

Replace the placeholders:

* `username` → your MySQL username (e.g., `root`)
* `password` → your MySQL password
* `your_db_name` → the actual database name you're using

Example:

```
DATABASE_URL="mysql://root:mySecret123@localhost:3306/smart_timetable_db"
```

Save and close the file.

### 4. Install dependencies:

Make sure you're still inside the `backend` folder:

```bash
npm install
```

### 5. Generate the Prisma client:

```bash
npx prisma generate
```

### 6. Run the database migrations:

```bash
npx prisma migrate dev --name init
```

### 7. (Optional) Open Prisma Studio to view your database:

```bash
npx prisma studio
```

---

## For Linux Users (TL;DR)

```bash
cd backend
cp .env.example .env
# Edit .env using nano, vim, or your preferred editor
# Update DATABASE_URL with your MySQL credentials
npm install
npx prisma generate
npx prisma migrate dev --name init
npx prisma studio  # Optional
```
