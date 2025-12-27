# CipherSQLStudio - Data Flow Diagram

## User Journey: Execute SQL Query

```
[User Interface] → [Backend API] → [Database] → [Response] → [UI Update]
```

### Detailed Flow:

1. **User Action**: User clicks "Execute Query" button
   ↓
2. **Frontend Processing**: 
   - Validate query input
   - Show loading state
   - Send POST request to `/api/queries/execute`
   ↓
3. **Backend API Processing**:
   - Receive query request
   - Sanitize SQL query (security check)
   - Create user workspace schema in PostgreSQL
   ↓
4. **Database Operations**:
   - Create isolated schema: `workspace_userId_assignmentId`
   - Set search path to user workspace
   - Create tables with sample data from MongoDB assignment
   - Execute user's SQL query
   ↓
5. **Result Processing**:
   - Format query results
   - Calculate execution time
   - Save user progress to MongoDB (optional)
   ↓
6. **API Response**:
   - Return JSON with query results or error
   - Include execution metadata
   ↓
7. **Frontend Update**:
   - Hide loading state
   - Display results in formatted table
   - Show success/error message
   - Update UI state

## Component Interactions:

### Assignment Loading Flow:
```
AssignmentList → API → MongoDB → Assignment Data → UI Render
```

### Hint Generation Flow:
```
User Request → Backend → LLM API (OpenAI/Gemini) → Hint Response → UI Display
```

### Sample Data Flow:
```
Assignment ID → MongoDB Query → Table Schemas → PostgreSQL Setup → UI Preview
```

## Security Measures:

1. **Query Sanitization**: Remove dangerous SQL commands (DROP, DELETE, etc.)
2. **Schema Isolation**: Each user gets isolated workspace
3. **Rate Limiting**: Prevent API abuse
4. **Input Validation**: Validate all user inputs
5. **CORS Protection**: Restrict frontend origins

## Error Handling:

- Network errors → User-friendly error messages
- SQL syntax errors → Detailed error feedback
- Database connection issues → Graceful fallback
- API timeouts → Retry mechanisms

## Performance Optimizations:

- Connection pooling for PostgreSQL
- Caching for assignment data
- Lazy loading for large result sets
- Debounced query validation

---

*Note: This diagram represents the core data flow. The actual implementation includes additional error handling, validation, and optimization layers.*