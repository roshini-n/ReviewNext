# Firebase Security Rules Configuration

This document contains the required Firebase security rules for the ReviewNext application.

## Firestore Security Rules

Apply these rules in the Firebase Console under **Firestore Database > Rules**:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Users collection - users can read any user but only update their own document
    match /users/{userId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && request.auth.uid == userId;
      allow update: if request.auth != null && request.auth.uid == userId;
      allow delete: if request.auth != null && request.auth.uid == userId;
    }
    
    // Add other collection rules as needed
    // Example for reviews, ratings, etc.
  }
}
```

## Firebase Storage Security Rules

Apply these rules in the Firebase Console under **Storage > Rules**:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    
    // Profile photos - users can only upload/update/delete their own profile photo
    match /profilePhotos/{userId}.{extension} {
      // Allow read access to all authenticated users
      allow read: if request.auth != null;
      
      // Allow write (upload/update/delete) only to the owner
      allow write: if request.auth != null 
                   && request.auth.uid == userId
                   && request.resource.size < 5 * 1024 * 1024  // Max 5MB
                   && request.resource.contentType.matches('image/.*');  // Only images
    }
    
    // Fallback - deny all other access
    match /{allPaths=**} {
      allow read, write: if false;
    }
  }
}
```

## How to Apply These Rules

### Firestore Rules
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to **Firestore Database** in the left sidebar
4. Click on the **Rules** tab
5. Copy and paste the Firestore rules above
6. Click **Publish**

### Storage Rules
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to **Storage** in the left sidebar
4. Click on the **Rules** tab
5. Copy and paste the Storage rules above
6. Click **Publish**

## Rule Explanations

### Firestore Rules
- **Users collection**: 
  - Any authenticated user can read user profiles
  - Users can only create/update/delete their own user document
  - The `userId` in the path must match `request.auth.uid`

### Storage Rules
- **Profile Photos**:
  - Stored at path: `profilePhotos/{userId}.{extension}`
  - Only authenticated users can read profile photos
  - Users can only upload/update/delete their own profile photo
  - File size limited to 5MB
  - Only image files are allowed (JPEG, PNG, GIF, WebP)

## Testing

After applying the rules, test the following:

1. **Upload a profile photo** - Should succeed for your own profile
2. **Try to upload to another user's path** - Should fail (403 Forbidden)
3. **Try to upload a file > 5MB** - Should fail
4. **Try to upload a non-image file** - Should fail
5. **Read another user's profile photo** - Should succeed if authenticated

## Troubleshooting

If you encounter permission errors:

1. **Check authentication**: Ensure the user is logged in (`request.auth != null`)
2. **Check user ID match**: Verify that `request.auth.uid` matches the `userId` in the path
3. **Check file size**: Ensure uploaded files are under 5MB
4. **Check file type**: Ensure uploaded files are valid image types
5. **Check rules deployment**: Verify rules were published successfully in Firebase Console

## Additional Security Considerations

- Consider adding rate limiting for uploads
- Consider adding virus scanning for uploaded files (Firebase Extensions)
- Consider adding image optimization/resizing (Firebase Extensions)
- Monitor Storage usage and set up billing alerts
