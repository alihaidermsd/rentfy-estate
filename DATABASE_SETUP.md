# Database Setup Instructions

## If you get "table does not exist" errors:

1. **Stop the dev server** (Ctrl+C)

2. **Reset and setup the database:**
   ```bash
   npx prisma db push --force-reset --accept-data-loss
   npx prisma generate
   npm run prisma:seed
   ```

3. **Clean Next.js cache:**
   ```bash
   Remove-Item -Recurse -Force .next
   ```

4. **Restart the dev server:**
   ```bash
   npm run dev
   ```

## Verification

The database should have:
- ✅ Users table with 5 test users
- ✅ Properties table with 2 test properties
- ✅ All other required tables

## Test Credentials

All passwords: `password123`
- Super Admin: superadmin@rentfy.com
- Admin: admin@rentfy.com
- Owner: owner@rentfy.com
- Agent: agent@rentfy.com
- User: user@rentfy.com

