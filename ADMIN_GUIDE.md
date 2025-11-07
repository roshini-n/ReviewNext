# Admin Dashboard Access Guide

## Overview
The ReviewNext application includes a comprehensive admin dashboard for managing users, reviews, products, analytics, and system settings. This guide explains how to access and use the admin features.

## How to Access the Admin Dashboard

### 1. Admin Account Setup
To access the admin dashboard, you need to register with one of the designated admin email addresses:

**Default Admin Emails:**
- `admin@example.com`
- `roshininaguru12@gmail.com` 
- `admin@reviewnext.com`
- `super@admin.com`

### 2. Registration Process
1. Go to the registration page: `http://localhost:4201/register`
2. Register using one of the admin email addresses
3. Complete the email verification process
4. Log in to your account

### 3. Accessing the Dashboard

Once logged in with an admin account, you can access the admin dashboard in multiple ways:

#### Option 1: Navbar Admin Button (Desktop)
- Look for the red "Admin" button in the top navigation bar
- Click the button to navigate to the admin dashboard

#### Option 2: Mobile Menu (Mobile Devices)
- Tap the hamburger menu (three lines) in the top-left corner
- Look for "Admin Dashboard" in the Account section
- Tap to navigate to the admin dashboard

#### Option 3: User Dashboard Button
- Go to your user dashboard (`/dashboard`)
- Look for the prominent red "Admin Dashboard" button
- Click to access the admin features

#### Option 4: Direct URL
- Navigate directly to: `http://localhost:4201/admin`

## Admin Dashboard Features

### 1. Admin Analytics (`/admin/analytics`)
- **User Statistics**: Total users, active users, new registrations
- **Content Statistics**: Reviews, ratings, products by category
- **Engagement Metrics**: User activity trends
- **Visual Charts**: Interactive charts for data visualization

### 2. User Management (`/admin/users`)
- **User List**: View all registered users
- **User Details**: Access detailed user information
- **User Actions**: Edit, suspend, or delete user accounts
- **Search & Filter**: Find specific users quickly

### 3. Review Management (`/admin/reviews`)
- **Review Moderation**: View and moderate all reviews
- **Edit Reviews**: Modify inappropriate or incorrect reviews
- **Delete Reviews**: Remove spam or policy-violating reviews
- **User Review History**: Track review patterns

### 4. Product Management (`/admin/products`)
- **Product Catalog**: View all products across categories
- **Product Editing**: Modify product information
- **Product Deletion**: Remove duplicate or inappropriate products
- **Category Statistics**: Track products by category
- **Bulk Actions**: Perform actions on multiple products

### 5. System Settings (`/admin/settings`)
- **Data Export**: Export user, review, and product data
- **System Information**: View application statistics
- **External Links**: Access Firebase Console, Analytics
- **Maintenance Tools**: System logs and documentation

## Security Features

### Role-Based Access Control
- Only registered admin emails can access admin features
- Admin guard protects all admin routes
- Automatic redirection for non-admin users

### Navigation Protection
- Admin buttons only visible to admin users
- Failed admin access redirects to user dashboard
- Session-based admin verification

## Troubleshooting

### Can't See Admin Button?
1. **Check Email**: Ensure you're logged in with an admin email
2. **Clear Cache**: Clear browser cache and reload
3. **Re-login**: Log out and log back in
4. **Check Console**: Open browser dev tools for error messages

### Admin Dashboard Not Loading?
1. **Check URL**: Ensure you're accessing the correct URL
2. **Admin Guard**: Verify admin email is correctly configured
3. **Network**: Check internet connection for Firebase access
4. **Console Errors**: Check browser console for JavaScript errors

### Adding New Admin Users
To add a new admin email:
1. Edit the `AdminAuthService` in `/src/app/services/admin-auth.service.ts`
2. Add the new email to the `adminEmails` array
3. Rebuild and redeploy the application

## Development Notes

### Admin Service Location
- Service: `/src/app/services/admin-auth.service.ts`
- Guard: `/src/app/guards/admin.guard.ts`
- Routes: `/src/app/app.routes.ts` (admin section)

### Customizing Admin Access
You can modify admin access by:
1. **Email-based**: Edit the admin emails list
2. **Role-based**: Implement user roles in Firestore
3. **Permission-based**: Add granular permissions system

### Admin Components
- **Dashboard**: `/src/app/components/admin/admin-dashboard/`
- **Analytics**: `/src/app/components/admin/admin-analytics/`
- **Users**: `/src/app/components/admin/admin-users/`
- **Reviews**: `/src/app/components/admin/admin-reviews/`
- **Products**: `/src/app/components/admin/admin-products/`
- **Settings**: `/src/app/components/admin/admin-settings/`

## Support

If you encounter issues with admin access:
1. Check the browser console for errors
2. Verify Firebase configuration
3. Ensure admin email is correctly configured
4. Contact the development team for assistance

---

**Note**: Admin access is critical for platform management. Ensure only trusted users have admin email addresses and regularly audit admin activities.
