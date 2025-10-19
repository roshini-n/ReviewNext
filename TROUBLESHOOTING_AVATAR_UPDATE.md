# Troubleshooting Avatar Update Issues

## Current Issue
Avatar not updating when clicking "Update Avatar" button.

## Debugging Steps

### 1. Open Browser Console
1. Press **F12** (or **Cmd+Option+I** on Mac)
2. Click on the **Console** tab
3. Clear the console (click the 🚫 icon)

### 2. Try Uploading an Avatar
1. Go to your profile page
2. Click on your avatar
3. Upload a photo OR select a preset avatar
4. Click "Update Avatar"
5. **Watch the console** for log messages

### 3. Check Console Messages

You should see these messages in order:

#### When Dialog Opens:
```
Opening avatar dialog with current image: [current avatar path]
```

#### When You Click "Update Avatar":
```
saveAvatar called
selectedAvatar: [path or null]
uploadedFile: [File object or null]
userId: [your user ID]
```

#### For Custom Photo Upload:
```
Starting upload for file: [filename]
Photo uploaded successfully, download URL: [Firebase Storage URL]
Closing dialog with URL: [URL]
```

#### For Preset Avatar:
```
Closing dialog with preset avatar: [assets/xxx.png]
```

#### After Dialog Closes:
```
Dialog closed with result: [URL or path]
Result type: string
Current userId: [your user ID]
Updating avatar for user: [userId] with path: [URL/path]
Avatar updated successfully in Firestore
Setting local image to: [URL/path]
```

## Common Issues & Solutions

### Issue 1: "User not authenticated" Error
**Console shows:** `User not authenticated`

**Solution:** 
- You're not logged in
- Log out and log back in
- Check Firebase Auth in browser DevTools → Application → IndexedDB

### Issue 2: Firebase Storage Permission Denied
**Console shows:** `Upload error` with code `storage/unauthorized`

**Solution:** Apply Firebase Storage rules from `FIREBASE_RULES.md`

```javascript
// Go to Firebase Console → Storage → Rules
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /profilePhotos/{userId}.{extension} {
      allow read: if request.auth != null;
      allow write: if request.auth != null 
                   && request.auth.uid == userId
                   && request.resource.size < 5 * 1024 * 1024
                   && request.resource.contentType.matches('image/.*');
    }
  }
}
```

### Issue 3: Firestore Permission Denied
**Console shows:** `Error updating avatar in Firestore` with code `permission-denied`

**Solution:** Apply Firestore rules from `FIREBASE_RULES.md`

```javascript
// Go to Firebase Console → Firestore → Rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read: if request.auth != null;
      allow create, update: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### Issue 4: File Too Large
**Console shows:** `File size too large. Maximum size is 5MB`

**Solution:**
- Choose a smaller image (< 5MB)
- Compress the image before uploading

### Issue 5: Invalid File Type
**Console shows:** `Invalid file type. Please upload an image`

**Solution:**
- Only upload: JPEG, PNG, GIF, or WebP files
- Don't upload: PDF, DOC, MP4, etc.

### Issue 6: Dialog Closes But Nothing Happens
**Console shows:** `Dialog closed without selection` or `No avatar path returned`

**Possible causes:**
1. **Button not wired correctly** - Check if `(click)="saveAvatar()"` is in the template
2. **Dialog closing without data** - Check if `dialogRef.close(...)` has the URL/path
3. **userId is null** - User not authenticated

**Solution:**
- Check the console logs to see which step fails
- Verify you're logged in
- Try a preset avatar first (simpler flow)

### Issue 7: Upload Succeeds But UI Doesn't Update
**Console shows:** `Avatar updated successfully` but image doesn't change

**Solution:**
- Hard refresh browser (Cmd+Shift+R)
- Check if `this.image` is being set correctly
- Check if navbar is using `observeUserById()` for live updates
- Clear browser cache

## Quick Test: Try Preset Avatar First

To isolate the issue, try a **preset avatar** first (not upload):

1. Click avatar → Select any preset (e.g., Robot) → Click "Update Avatar"
2. Check console for:
   ```
   Closing dialog with preset avatar: assets/robot.png
   Dialog closed with result: assets/robot.png
   Avatar updated successfully in Firestore
   ```
3. If this works, the issue is with **Storage upload**
4. If this doesn't work, the issue is with **Firestore update**

## Verify Firebase Rules Are Applied

### Check Storage Rules:
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **gamelogd**
3. Click **Storage** → **Rules** tab
4. Verify rules match `FIREBASE_RULES.md`
5. Click **Publish** if you made changes

### Check Firestore Rules:
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **gamelogd**
3. Click **Firestore Database** → **Rules** tab
4. Verify rules match `FIREBASE_RULES.md`
5. Click **Publish** if you made changes

## What to Share for Help

If still not working, share these console logs:

1. All messages from clicking "Update Avatar"
2. Any error messages (in red)
3. Screenshot of Firebase Storage rules
4. Screenshot of Firestore rules

## Next Steps

1. **Open browser console** (F12)
2. **Try updating avatar** and watch the logs
3. **Copy the console output** and share it
4. **Check Firebase rules** are applied correctly

The detailed logging will show exactly where the process is failing!
