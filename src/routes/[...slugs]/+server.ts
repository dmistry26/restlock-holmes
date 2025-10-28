// src/routes/[...slugs]/+server.ts
import app from '.';

interface WithRequest {
	request: Request;
}

export const fallback = ({ request }: WithRequest) => app.handle(request);
