# Environment Configuration

## Development
- Copy `.env.example` to `.env`
- Update `VITE_API_BASE_URL` to match your backend API

## Environment Variables

### VITE_API_BASE_URL
The base URL for your backend API. Used for all authentication and data requests.

**Default:** `http://localhost:8080/api`

**Example:**
```
VITE_API_BASE_URL=http://localhost:8080/api
```

For production:
```
VITE_API_BASE_URL=https://api.yourdomain.com/api
```

## Note
After changing `.env` file, you need to restart the dev server for changes to take effect.
