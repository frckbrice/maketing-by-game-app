# Firestore Index Requirements

The following composite indexes are required for the application to work properly:

## Games Collection Indexes

### Index 1: Games by Status and Creation Date
- **Collection:** `games`
- **Fields:**
  - `status` (Ascending)
  - `createdAt` (Descending)
  - `__name__` (Descending)

**Firebase Console URL:**
```
https://console.firebase.google.com/v1/r/project/lottery-app-91c88/firestore/indexes?create_composite=Ck9wcm9qZWN0cy9sb3R0ZXJ5LWFwcC05MWM4OC9kYXRhYmFzZXMvKGRlZmF1bHQpL2NvbGxlY3Rpb25Hcm91cHMvZ2FtZXMvaW5kZXhlcy9fEAEaCgoGc3RhdHVzEAEaDQoJY3JlYXRlZEF0EAIaDAoIX19uYW1lX18QAg
```

**CLI Command:**
```bash
firebase firestore:indexes --add-collection games --add-field status --add-field createdAt:desc
```

## Vendor Applications Collection Indexes

### Index 2: Vendor Applications by User ID and Submitted Date
- **Collection:** `vendorApplications`
- **Fields:**
  - `userId` (Ascending)
  - `submittedAt` (Descending)
  - `__name__` (Descending)

**Firebase Console URL:**
```
https://console.firebase.google.com/v1/r/project/lottery-app-91c88/firestore/indexes?create_composite=Clxwcm9qZWN0cy9sb3R0ZXJ5LWFwcC05MWM4OC9kYXRhYmFzZXMvKGRlZmF1bHQpL2NvbGxlY3Rpb25Hcm91cHMvdmVuZG9yQXBwbGljYXRpb25zL2luZGV4ZXMvXxABGgoKBnVzZXJJZBABGg8KC3N1Ym1pdHRlZEF0EAIaDAoIX19uYW1lX18QAg
```

**CLI Command:**
```bash
firebase firestore:indexes --add-collection vendorApplications --add-field userId --add-field submittedAt:desc
```

## How to Create Indexes

### Method 1: Firebase Console (Recommended)
1. Click on the URLs provided above
2. Review the index configuration
3. Click "Create Index"
4. Wait for index creation to complete (usually takes a few minutes)

### Method 2: Firebase CLI
```bash
# Install Firebase CLI if not already installed
npm install -g firebase-tools

# Login to Firebase
firebase login

# Create indexes using firestore.indexes.json file
firebase deploy --only firestore:indexes
```

### Method 3: firestore.indexes.json File
Create a `firestore.indexes.json` file in your project root:

```json
{
  "indexes": [
    {
      "collectionGroup": "games",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "status",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "createdAt",
          "order": "DESCENDING"
        }
      ]
    },
    {
      "collectionGroup": "vendorApplications",
      "queryScope": "COLLECTION", 
      "fields": [
        {
          "fieldPath": "userId",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "submittedAt",
          "order": "DESCENDING"
        }
      ]
    }
  ],
  "fieldOverrides": []
}
```

Then run:
```bash
firebase deploy --only firestore:indexes
```

## Additional Recommended Indexes

### Games Collection
```json
{
  "collectionGroup": "games",
  "queryScope": "COLLECTION",
  "fields": [
    {"fieldPath": "status", "order": "ASCENDING"},
    {"fieldPath": "category", "order": "ASCENDING"},
    {"fieldPath": "createdAt", "order": "DESCENDING"}
  ]
},
{
  "collectionGroup": "games", 
  "queryScope": "COLLECTION",
  "fields": [
    {"fieldPath": "featured", "order": "ASCENDING"},
    {"fieldPath": "createdAt", "order": "DESCENDING"}
  ]
}
```

### Users Collection
```json
{
  "collectionGroup": "users",
  "queryScope": "COLLECTION", 
  "fields": [
    {"fieldPath": "role", "order": "ASCENDING"},
    {"fieldPath": "createdAt", "order": "DESCENDING"}
  ]
}
```

## Verification

After creating the indexes, verify they're working by:

1. Checking the Firebase Console > Firestore > Indexes tab
2. Ensuring all indexes show "Enabled" status
3. Testing the application to confirm queries work without errors
4. Monitoring the console for any additional index requirements

## Troubleshooting

If you encounter "index required" errors:

1. Copy the provided URL from the error message
2. Open it in your browser (must be logged into Firebase Console)
3. Click "Create Index"
4. Wait for the index to be created
5. Refresh your application

## Performance Notes

- Indexes improve query performance but consume storage space
- Each index adds write overhead to document operations
- Monitor index usage in Firebase Console to optimize
- Remove unused indexes to reduce costs and improve write performance