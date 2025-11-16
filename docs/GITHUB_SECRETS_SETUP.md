# How to Set Up GitHub Secrets

This guide walks you through setting up GitHub Secrets for your CI/CD pipeline.

## Step-by-Step Instructions

### 1. Navigate to Your Repository

1. Go to your GitHub repository in a web browser
2. Make sure you're logged in and have admin/owner permissions

### 2. Access Secrets Settings

1. Click on the **Settings** tab (at the top of your repository)
2. In the left sidebar, scroll down to **Secrets and variables**
3. Click on **Actions** (under "Secrets and variables")

### 3. Add Your First Secret

1. Click the **New repository secret** button (green button, top right)
2. You'll see a form with two fields:
   - **Name**: The name of the secret (e.g., `TEST_EMAIL`)
   - **Secret**: The value of the secret (e.g., `test@test.lunary.app`)

### 4. Required Secrets for E2E Tests

Add these secrets one by one:

#### Secret 1: TEST_EMAIL

- **Name**: `TEST_EMAIL`
- **Secret**: Your test user email (e.g., `test@test.lunary.app`)
- Click **Add secret**

#### Secret 2: TEST_PASSWORD

- **Name**: `TEST_PASSWORD`
- **Secret**: Your test user password (e.g., `TestPassword123!`)
- Click **Add secret**

#### Secret 3: ADMIN_EMAIL (Optional)

- **Name**: `ADMIN_EMAIL`
- **Secret**: Your admin email (e.g., `admin@lunary.app`)
- Click **Add secret**

#### Secret 4: ADMIN_PASSWORD (Optional)

- **Name**: `ADMIN_PASSWORD`
- **Secret**: Your admin password
- Click **Add secret**

## Visual Guide

```
Repository Page
    ↓
[Settings] tab (top navigation)
    ↓
Left Sidebar → [Secrets and variables] → [Actions]
    ↓
[New repository secret] button (green, top right)
    ↓
Fill in Name and Secret → [Add secret]
```

## Important Notes

### Security Best Practices

1. **Never commit secrets to your repository**
   - Secrets should only be stored in GitHub Secrets
   - Never put them in `.env.local` files that get committed
   - Never put them in code comments or documentation

2. **Use strong passwords**
   - Even for test accounts, use secure passwords
   - Consider using randomly generated passwords

3. **Rotate secrets regularly**
   - Change passwords periodically
   - Update GitHub Secrets when you change passwords

4. **Limit access**
   - Only repository admins/owners can view/edit secrets
   - Secrets are encrypted and cannot be viewed after creation

### Alternative: Using Environment Variables

If you prefer to use `TEST_USER_EMAIL` instead of `TEST_EMAIL`, you can:

- Add `TEST_USER_EMAIL` instead of (or in addition to) `TEST_EMAIL`
- Add `TEST_USER_PASSWORD` instead of (or in addition to) `TEST_PASSWORD`

The workflows support both naming conventions, so either will work.

## Verifying Secrets Are Set

1. Go back to **Settings** → **Secrets and variables** → **Actions**
2. You should see a list of your secrets (names only, values are hidden)
3. You should see:
   - ✅ `TEST_EMAIL` (or `TEST_USER_EMAIL`)
   - ✅ `TEST_PASSWORD` (or `TEST_USER_PASSWORD`)
   - ✅ `ADMIN_EMAIL` (optional)
   - ✅ `ADMIN_PASSWORD` (optional)

## Testing Your Secrets

1. Push a commit or create a pull request
2. Go to the **Actions** tab in your repository
3. Click on the running workflow
4. Check the E2E tests job
5. If secrets are missing, you'll see errors in the logs
6. If secrets are set correctly, tests should run successfully

## Troubleshooting

### "Secret not found" Error

- Make sure you're adding secrets to the correct repository
- Verify the secret name matches exactly (case-sensitive)
- Check that you clicked "Add secret" after entering the value

### Tests Still Fail

- Verify the secret values match your local `.env.local` file
- Check that the email/password are correct
- Review the workflow logs for specific error messages

### Can't See Secrets Option

- You need admin/owner permissions on the repository
- Ask the repository owner to add you as a collaborator with admin access
- Or ask them to set up the secrets for you

## Quick Reference

| Secret Name                | Required    | Example Value           | Purpose                       |
| -------------------------- | ----------- | ----------------------- | ----------------------------- |
| `TEST_EMAIL`               | ✅ Yes      | `test@test.lunary.app`  | Test user email for E2E tests |
| `TEST_PASSWORD`            | ✅ Yes      | `TestPassword123!`      | Test user password            |
| `ADMIN_EMAIL`              | ⚠️ Optional | `admin@lunary.app`      | Admin user email              |
| `ADMIN_PASSWORD`           | ⚠️ Optional | `admin123`              | Admin user password           |
| `PLAYWRIGHT_TEST_BASE_URL` | ⚠️ Optional | `http://localhost:3000` | Custom test URL               |

## Next Steps

After setting up secrets:

1. ✅ Push a commit to trigger the workflow
2. ✅ Check the Actions tab to see if tests pass
3. ✅ Review test artifacts if tests fail
4. ✅ Update secrets if you change test credentials

Your CI/CD pipeline is now ready! 🚀
