# Word Relationships Feature Documentation

**Date Implemented:** December 28, 2025  
**Feature Type:** Major Enhancement  
**Status:** ✅ Complete

---

## Overview

Added a comprehensive word relationships system that allows linking words together with typed relationships (singular/plural, synonyms, antonyms, etc.). The system is fully bidirectional - when you create a relationship, both words automatically link to each other with the appropriate reciprocal relationship type.

## Use Cases

- Link singular and plural forms (e.g., "mutu" ↔ "mitu")
- Connect synonyms and antonyms
- Show word variants and derived forms
- Create general "see also" references
- Build a semantic network of related vocabulary

---

## Technical Implementation

### 1. Database Model Changes

**File:** `backend/models/word.model.js`

Added new field to the Word schema:

```javascript
relatedWords: [{
    wordId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Word' 
    },
    word: { 
        type: String,
        required: true
    },
    relationshipType: { 
        type: String, 
        enum: ['singular', 'plural', 'synonym', 'antonym', 'variant', 'derived', 'see_also'],
        required: true
    }
}]
```

Also added timestamps:
```javascript
}, {
    timestamps: true
});
```

**Key Design Decisions:**
- Denormalized `word` field for performance (avoids extra lookups)
- Enum constraint ensures data consistency
- Array structure allows multiple relationships per word

---

### 2. Backend API

#### Controller Functions

**File:** `backend/controllers/word.controller.js`

##### `addWordRelationship(wordId, relatedWordId, relationshipType)`
Creates a bidirectional relationship between two words.

**Logic:**
1. Validates both word IDs
2. Checks for duplicate relationships
3. Adds relationship to first word
4. Automatically adds reciprocal relationship to second word
5. Saves both words

**Reciprocal Mapping:**
- singular ↔ plural
- synonym ↔ synonym
- antonym ↔ antonym
- variant ↔ variant
- derived ↔ derived
- see_also ↔ see_also

##### `removeWordRelationship(wordId, relatedWordId)`
Removes bidirectional relationship between two words.

**Logic:**
1. Validates both word IDs
2. Filters out relationships from both words
3. Saves both words

##### `getReciprocalType(type)`
Helper function that returns the reciprocal relationship type.

#### Routes

**File:** `backend/routes/word.route.js`

```javascript
// Add relationship
POST /api/words/:wordId/relationships
Body: { relatedWordId, relationshipType }

// Remove relationship
DELETE /api/words/:wordId/relationships/:relatedWordId
```

---

### 3. Frontend API Layer

**File:** `frontend/src/api/words/wordApi.js`

#### `useAddRelationshipEndpoint(wordId, relatedWordId, relationshipType)`
Calls the backend API to add a relationship.

**Parameters:**
- `wordId`: ID of the first word
- `relatedWordId`: ID of the word to relate to
- `relationshipType`: Type of relationship (singular, plural, etc.)

**Returns:** `{ success: boolean, message: string, data: object }`

#### `useRemoveRelationshipEndpoint(wordId, relatedWordId)`
Calls the backend API to remove a relationship.

**Parameters:**
- `wordId`: ID of the first word
- `relatedWordId`: ID of the related word to unlink

**Returns:** `{ success: boolean, message: string }`

---

### 4. State Management

**File:** `frontend/src/store/words.js`

#### `addRelationship(wordId, relatedWordId, relationshipType)`
Adds a relationship and updates the Zustand store.

**Logic:**
1. Calls API endpoint
2. Updates both affected words in the store
3. Updates selectedWord if it's one of the affected words
4. Returns success/error status

#### `removeRelationship(wordId, relatedWordId)`
Removes a relationship and refreshes the store.

**Logic:**
1. Calls API endpoint
2. Refreshes entire word list from backend
3. Updates selectedWord if affected
4. Returns success/error status

---

### 5. UI Components

#### WordContent Component

**File:** `frontend/src/components/WordContent.jsx`

**New Props:**
- `onWordClick(wordId)`: Callback when a related word is clicked

**Features:**
- Displays related words in a card with gray background
- Color-coded badges for each relationship type:
  - 🔵 Blue: singular/plural
  - 🟢 Green: synonym
  - 🔴 Red: antonym
  - 🟣 Purple: variant
  - 🟠 Orange: derived
  - ⚫ Gray: see_also
- Clickable links to navigate to related words
- Dark mode support
- Responsive layout

**UI Structure:**
```
┌─────────────────────────────────────┐
│ Related Words:                      │
│ ┌──────────┐                        │
│ │ Singular │ mutu                   │
│ └──────────┘                        │
│ ┌─────────┐                         │
│ │ Synonym │ mbuta                   │
│ └─────────┘                         │
└─────────────────────────────────────┘
```

#### AddRelationshipModal Component

**File:** `frontend/src/components/AddRelationshipModal.jsx` (NEW)

**Props:**
- `isOpen`: Modal visibility state
- `onClose`: Close handler
- `currentWord`: The word to add relationships to

**Features:**
1. **Relationship Type Selector**
   - Dropdown with 7 relationship types
   - Default: "See also"

2. **Word Search**
   - Real-time search input
   - Filters words by name and meaning
   - Case-insensitive

3. **Word Selector**
   - Dropdown showing filtered words
   - Format: "word - meaning (truncated)"
   - Limit: 50 results
   - Shows warning when limit reached

4. **Smart Features:**
   - Loading states during API calls
   - Toast notifications for success/error
   - Form validation
   - Auto-refresh after successful addition
   - Form reset on close

**Form Validation:**
- Relationship type is required
- Related word must be selected
- Cannot relate a word to itself (filtered out)

#### DetailPage Updates

**File:** `frontend/src/pages/DetailPage.jsx`

**New Features:**
1. "Add Relationship" button with link icon
2. Modal integration via `useDisclosure` hook
3. `handleWordClick()` function to navigate between related words
4. Horizontal button layout (Edit Word + Add Relationship)

**User Flow:**
```
1. View word detail page
2. Click "Add Relationship" button
3. Modal opens
4. Select relationship type
5. Search/select related word
6. Click "Add Relationship"
7. Toast notification appears
8. Modal closes
9. Related word appears in the list
10. Click related word to view its details
```

---

## Relationship Types Reference

| Type | Description | Example | Reciprocal |
|------|-------------|---------|------------|
| **singular** | Singular form of a word | mutu (person) | plural |
| **plural** | Plural form of a word | mitu (people) | singular |
| **synonym** | Word with similar meaning | mbuta (person) | synonym |
| **antonym** | Word with opposite meaning | malamu ↔ mabe | antonym |
| **variant** | Spelling/pronunciation variant | colour ↔ color | variant |
| **derived** | Word derived from another | teacher ← teach | derived |
| **see_also** | General reference | dog → puppy | see_also |

---

## API Endpoints

### Add Relationship

```http
POST /api/words/:wordId/relationships
Authorization: Bearer <token>
Content-Type: application/json

{
  "relatedWordId": "507f1f77bcf86cd799439011",
  "relationshipType": "plural"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Relationship added successfully",
  "data": {
    "word": { /* updated word object */ },
    "relatedWord": { /* updated related word object */ }
  }
}
```

### Remove Relationship

```http
DELETE /api/words/:wordId/relationships/:relatedWordId
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Relationship removed successfully"
}
```

---

## Error Handling

### Backend Errors

1. **Invalid Word ID**
   - Status: 400
   - Message: "Invalid word ID"

2. **Word Not Found**
   - Status: 404
   - Message: "Word not found"

3. **Duplicate Relationship**
   - Status: 400
   - Message: "Relationship already exists"

4. **Server Error**
   - Status: 500
   - Message: Error details

### Frontend Error Handling

- API errors are caught and displayed via toast notifications
- Loading states prevent duplicate submissions
- Form validation prevents invalid submissions
- Network errors fallback to error messages

---

## Database Migration Notes

**Important:** Existing words in the database do not have the `relatedWords` field. This is handled gracefully:

1. The field is optional in the schema
2. UI checks for existence before rendering
3. Empty arrays are initialized automatically when adding first relationship
4. No migration script needed - works with existing data

**If you want to add the field to existing documents:**

```javascript
// Optional migration script (not required)
db.words.updateMany(
  { relatedWords: { $exists: false } },
  { $set: { relatedWords: [] } }
);
```

---

## Testing Checklist

### Backend Tests
- [ ] Add relationship between two words
- [ ] Verify bidirectional creation
- [ ] Attempt duplicate relationship (should fail)
- [ ] Remove relationship
- [ ] Verify bidirectional removal
- [ ] Test with invalid word IDs
- [ ] Test all relationship types

### Frontend Tests
- [ ] Open relationship modal
- [ ] Search for words
- [ ] Add each relationship type
- [ ] Click related word links
- [ ] Verify navigation works
- [ ] Test in dark mode
- [ ] Verify toast notifications
- [ ] Test with no related words
- [ ] Test with multiple relationships

---

## Performance Considerations

1. **Denormalized Word Text**
   - Stores word text in relationship for quick display
   - Avoids additional database lookups
   - Trade-off: Slightly larger documents

2. **Word Selector Limit**
   - Limited to 50 results to prevent UI slowdown
   - Search functionality helps users find specific words

3. **Store Updates**
   - After adding relationship: Updates only affected words
   - After removing relationship: Refreshes entire list (ensures consistency)

---

## Future Enhancements

### Potential Improvements

1. **Relationship Management Page**
   - View all relationships for a word
   - Bulk remove relationships
   - Edit relationship types

2. **Relationship Validation**
   - Warn if adding conflicting relationships (e.g., both synonym and antonym)
   - Suggest existing relationships when adding new ones

3. **Advanced Search**
   - Filter by relationship type
   - Find words with no relationships
   - Visualize relationship networks

4. **Bulk Operations**
   - Import relationships from CSV/JSON
   - Export relationship data
   - Copy relationships from similar words

5. **Relationship Statistics**
   - Show most connected words
   - Identify orphaned words
   - Relationship type distribution

6. **Undo/Redo**
   - Track relationship changes
   - Allow reverting accidental removals

---

## Dependencies

### New Dependencies
None - uses existing packages (Chakra UI, Zustand, axios)

### Updated Files
- `backend/models/word.model.js` - Schema update
- `backend/controllers/word.controller.js` - New controller functions
- `backend/routes/word.route.js` - New routes
- `frontend/src/api/words/wordApi.js` - New API functions
- `frontend/src/store/words.js` - New store methods
- `frontend/src/components/WordContent.jsx` - UI updates
- `frontend/src/components/AddRelationshipModal.jsx` - New component
- `frontend/src/pages/DetailPage.jsx` - Button and modal integration

---

## Troubleshooting

### Issue: Relationships not showing
**Solution:** Ensure backend is restarted after model changes

### Issue: Modal not opening
**Solution:** Check that `useDisclosure` hook is properly imported from Chakra UI

### Issue: Cannot find related word
**Solution:** Use search functionality in the modal

### Issue: Relationship exists but not visible
**Solution:** Refresh the word list or navigate away and back

### Issue: "Invalid word ID" error
**Solution:** Ensure both words exist in the database with valid ObjectIds

---

## Git Commit Reference

**Previous Commit:** "adding words automatically with json file"  
**This Feature:** "Add word relationships system with bidirectional linking"

**Files Changed:** 8  
**Lines Added:** ~500  
**Lines Removed:** ~50

---

## Credits

**Implemented by:** GitHub Copilot (Agent Mode)  
**Date:** December 28, 2025  
**Implementation Time:** ~30 minutes  
**Approach:** Option 3 - Dedicated relatedWords field with Smart UI

---

## Notes

This implementation provides a solid foundation for building a semantic dictionary. The bidirectional nature ensures data consistency, and the color-coded UI makes relationship types immediately recognizable. The system is extensible - new relationship types can be added by simply updating the enum in the model and adding corresponding UI labels/colors.

The feature integrates seamlessly with the existing codebase and follows the established patterns (Zustand for state, Chakra UI for components, axios for API calls).
