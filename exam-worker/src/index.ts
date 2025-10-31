// File: exam-worker/src/index.ts

import { Hono } from 'hono';
import { cors } from 'hono/cors'; // <-- MỚI: Import middleware CORS
import { createClient } from '@supabase/supabase-js';

type Env = {
    TELEGRAM_BOT_TOKEN: string;
    TELEGRAM_CHANNEL_ID: string;
    SUPABASE_URL: string;
    SUPABASE_ANON_KEY: string;
}

// --- TELEGRAM API TYPES ---
interface TelegramErrorResponse {
	ok: false;
	description: string;
	error_code: number;
}

// For getFile
interface TelegramGetFileSuccessResponse {
	ok: true;
	result: {
		file_path: string;
	};
}
type TelegramGetFileResponse = TelegramGetFileSuccessResponse | TelegramErrorResponse;

// For sendDocument
interface TelegramSendDocumentSuccessResponse {
	ok: true;
	result: {
		document: {
			file_id: string;
		};
	};
}
type TelegramSendDocumentResponse = TelegramSendDocumentSuccessResponse | TelegramErrorResponse;

const app = new Hono<{ Bindings: Env }>();

// --- MIDDLEWARE ---
// MỚI: Áp dụng CORS cho tất cả các route /api/*
// Điều này sẽ thêm các header như 'Access-Control-Allow-Origin: *' vào response
// Giúp trình duyệt ở localhost:3000 có thể gọi API này.
app.use('/api/*', cors());


// --- ROUTES (Không thay đổi logic bên trong) ---

app.get('/api/exams', async (c) => {
    try {
        const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_ANON_KEY);
        const { data, error } = await supabase
            .from('exams')
            .select('id, created_at, title, subject, grade, year, status')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Supabase select error:', error);
            return c.json({ error: 'Could not fetch exams' }, 500);
        }
        return c.json(data);
    } catch (e: any) {
        return c.json({ error: e.message }, 500);
    }
});

app.get('/api/download/:id', async (c) => {
    try {
        const examId = c.req.param('id');
        const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_ANON_KEY);
        const { data: exam, error } = await supabase
            .from('exams')
            .select('telegram_file_id, title, subject')
            .eq('id', examId)
            .single();

        if (error || !exam) {
            return c.json({ error: 'Exam not found' }, 404);
        }
        const getFileUrl = `https://api.telegram.org/bot${c.env.TELEGRAM_BOT_TOKEN}/getFile?file_id=${exam.telegram_file_id}`;
        const fileInfoResponse = await fetch(getFileUrl);
        const fileInfo = (await fileInfoResponse.json()) as TelegramGetFileResponse;
        if (!fileInfo.ok) {
            // Log the actual error from Telegram for better debugging
            console.error(`Telegram API Error: ${fileInfo.description}`);
            return c.json({ error: 'Could not retrieve file info' }, 500);
        }
        const filePath = fileInfo.result.file_path;
        const fileDownloadUrl = `https://api.telegram.org/file/bot${c.env.TELEGRAM_BOT_TOKEN}/${filePath}`;
        const fileResponse = await fetch(fileDownloadUrl);
        const response = new Response(fileResponse.body, fileResponse);
        const fileExtension = filePath.split('.').pop() || 'pdf';
        const friendlyFilename = `${exam.subject} ${exam.title}.${fileExtension}`.replace(/[^a-z0-9\.\-\s]/gi, '_');
        response.headers.set('Content-Disposition', `attachment; filename="${friendlyFilename}"`);
        return response;
    } catch (e: any) {
        return c.json({ error: e.message }, 500);
    }
});

app.post('/api/upload', async (c) => {
    // ... logic cũ, không cần thay đổi
    try {
        const formData = await c.req.formData();
        const file = formData.get('document');
        const title = formData.get('title') || 'Untitled';
        const subject = formData.get('subject') || 'General';
        const grade = parseInt(formData.get('grade')?.toString() || '12', 10);
        const year = parseInt(formData.get('year')?.toString() || new Date().getFullYear().toString(), 10);
        if (!file || !(file instanceof File)) {
            return c.json({ error: 'File "document" is required.' }, 400);
        }
        const tgFormData = new FormData();
        tgFormData.append('chat_id', c.env.TELEGRAM_CHANNEL_ID);
        tgFormData.append('document', file);
        const tgResponse = await fetch(`https://api.telegram.org/bot${c.env.TELEGRAM_BOT_TOKEN}/sendDocument`, {
            method: 'POST',
            body: tgFormData,
        });
        const tgResult = (await tgResponse.json()) as TelegramSendDocumentResponse;
        if (!tgResult.ok) {
            return c.json({ error: `Telegram API Error: ${tgResult.description}` }, 500);
        }
        const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_ANON_KEY);
        const { data, error } = await supabase.from('exams').insert({
            title: title, subject: subject, grade: grade, year: year,
            telegram_file_id: tgResult.result.document.file_id,
        }).select().single();
        if (error) {
            return c.json({ error: `Failed to save metadata: ${error.message}` }, 500);
        }
        return c.json({ message: 'Success', examData: data }, 201);
    } catch (e: any) {
        return c.json({ error: e.message }, 500);
    }
});

export default app;