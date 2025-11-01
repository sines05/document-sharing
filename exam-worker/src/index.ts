// File: exam-worker/src/index.ts

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { createClient } from '@supabase/supabase-js';

// --- TYPE DEFINITIONS ---

type Env = {
    SUPABASE_URL: string;
    SUPABASE_ANON_KEY: string;
    TELEGRAM_BOT_TOKEN: string;
    TELEGRAM_CHANNEL_ID: string;
}

interface TelegramErrorResponse {
	ok: false;
	description: string;
	error_code: number;
}

interface TelegramGetFileSuccessResponse {
	ok: true;
	result: { file_path: string };
}
type TelegramGetFileResponse = TelegramGetFileSuccessResponse | TelegramErrorResponse;

interface TelegramSendDocumentSuccessResponse {
	ok: true;
	result: { document: { file_id: string } };
}
type TelegramSendDocumentResponse = TelegramSendDocumentSuccessResponse | TelegramErrorResponse;

const getFileTypeEnum = (mimeType: string): 'PDF' | 'DOCX' | 'PPTX' | 'ZIP' | null => {
    if (mimeType === 'application/pdf') return 'PDF';
    if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') return 'DOCX';
    if (mimeType === 'application/vnd.openxmlformats-officedocument.presentationml.presentation') return 'PPTX';
    if (mimeType === 'application/zip' || mimeType === 'application/x-zip-compressed') return 'ZIP';
    return null;
};


// --- HONO APP INITIALIZATION ---

const app = new Hono<{ Bindings: Env }>();
app.use('/api/*', cors());


// --- API ROUTES ---

app.get('/api/universities', async (c) => {
    try {
        const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_ANON_KEY);
        const { data, error } = await supabase.from('universities').select('id, name, abbreviation').order('name', { ascending: true });
        if (error) throw error;
        return c.json(data);
    } catch (e: any) {
        console.error('Exception fetching universities:', e.message);
        return c.json({ error: 'An unexpected error occurred' }, 500);
    }
});

app.get('/api/documents', async (c) => {
    try {
        const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_ANON_KEY);
        const page = parseInt(c.req.query('page') || '1', 10);
        const limit = parseInt(c.req.query('limit') || '10', 10);
        const universityIdentifier = c.req.query('universityId') || null;
        const searchTerm = c.req.query('searchTerm') || '';
        const offset = (page - 1) * limit;

        let universityUUID = null;

        if (universityIdentifier) {
            const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(universityIdentifier);
            if (isUUID) {
                universityUUID = universityIdentifier;
            } else {
                const { data: uniData, error: uniError } = await supabase
                    .from('universities')
                    .select('id')
                    .eq('abbreviation', universityIdentifier)
                    .single();
                if (uniError) {
                    console.warn(`Could not find university with abbreviation: ${universityIdentifier}. Error: ${uniError.message}`);
                } else if (uniData) {
                    universityUUID = uniData.id;
                }
            }
        }

        // Build the query using the JS client library instead of RPC
        let query = supabase
            .from('documents')
            .select(
                `
                id, title, description, created_at,
                courses!inner ( name, code, university_id ),
                lecturers ( name )
            `,
                { count: 'exact' }
            );

        query = query.eq('status', 'approved');

        if (universityUUID) {
            query = query.eq('courses.university_id', universityUUID);
        }

        if (searchTerm) {
            const searchString = `%${searchTerm}%`;
            // Case-insensitive search across multiple fields
            query = query.or(
                `title.ilike.${searchString},` +
                `description.ilike.${searchString},` +
                `courses.name.ilike.${searchString},` +
                `lecturers.name.ilike.${searchString}`
            );
        }

        query = query.order('created_at', { ascending: false }).range(offset, offset + limit - 1);

        const { data, error, count } = await query;

        if (error) throw error;

        const formattedData = data.map((doc: any) => ({
            id: doc.id,
            title: doc.title,
            description: doc.description,
            createdAt: doc.created_at,
            courseName: doc.courses?.name,
            courseCode: doc.courses?.code,
            lecturerName: doc.lecturers?.name,
            universityId: doc.courses?.university_id,
            sections: [],
        }));

        return c.json({
            data: formattedData,
            totalPages: Math.ceil((count || 0) / limit),
            currentPage: page,
        });
    } catch (e: any) {
        console.error('Exception fetching documents:', e.message);
        return c.json({ error: 'An unexpected error occurred' }, 500);
    }
});

app.get('/api/documents/:id', async (c) => {
    try {
        const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_ANON_KEY);
        const documentId = c.req.param('id');

        const { data, error } = await supabase
            .from('documents')
            .select(`id, title, description, created_at, courses (name, code, university_id), lecturers (name), document_sections (id, title, document_files (id, name, file_type, size_kb))`)
            .eq('id', documentId)
            .eq('status', 'approved')
            .single();

        if (error || !data) throw error || new Error('Document not found');

        const doc: any = data;
        const formattedData = {
            id: doc.id,
            title: doc.title,
            description: doc.description,
            createdAt: doc.created_at,
            courseName: doc.courses?.name,
            courseCode: doc.courses?.code,
            lecturerName: doc.lecturers?.name,
            universityId: doc.courses?.university_id,
            sections: doc.document_sections.map((section: any) => ({
                title: section.title,
                files: section.document_files.map((file: any) => ({
                    id: file.id,
                    name: file.name,
                    // IMPORTANT: The URL now points to our new download endpoint
                    url: `/api/download/file/${file.id}`,
                    fileType: file.file_type,
                    size: file.size_kb,
                })),
            })),
        };

        return c.json(formattedData);
    } catch (e: any) {
        console.error('Exception fetching document detail:', e.message);
        return c.json({ error: 'Document not found or an error occurred' }, 404);
    }
});

app.post('/api/documents', async (c) => {
    try {
        const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_ANON_KEY);
        const formData = await c.req.formData();
        const uploaderIp = c.req.header('cf-connecting-ip');

        const title = formData.get('title')?.toString();
        const courseName = formData.get('courseName')?.toString();
        const universityId = formData.get('universityId')?.toString();
        // The frontend now sends sections as `sections[0][title]`, `sections[0][files]`, etc.
        // We need to parse this structure.
        const sections: { title: string; files: File[] }[] = [];
        for (const key of formData.keys()) {
            const match = key.match(/sections\[(\d+)\]\[(title|files)\]/);
            if (match) {
                const index = parseInt(match[1], 10);
                const property = match[2];
                if (!sections[index]) {
                    sections[index] = { title: '', files: [] };
                }
                if (property === 'title') {
                    sections[index].title = formData.get(key)?.toString() || '';
                } else if (property === 'files') {
                    const files = formData.getAll(key).filter((f): f is File => f instanceof File);
                    sections[index].files.push(...files);
                }
            }
        }

        if (!title || !courseName || !universityId || sections.length === 0 || sections.some(s => !s.title || s.files.length === 0)) {
            return c.json({ error: 'Missing required fields, or a section is missing a title or files.' }, 400);
        }

        // --- Get or Create Course and Lecturer (same as before) ---
        let { data: course } = await supabase.from('courses').select('id').eq('name', courseName).eq('university_id', universityId).maybeSingle();
        if (!course) {
            const { data: newCourse, error } = await supabase.from('courses').insert({ name: courseName, code: formData.get('courseCode')?.toString(), university_id: universityId }).select('id').single();
            if (error) throw new Error(`Failed to create course: ${error.message}`);
            course = newCourse;
        }
        let lecturerId = null;
        const lecturerName = formData.get('lecturerName')?.toString();
        if (lecturerName) {
            let { data: lecturer } = await supabase.from('lecturers').select('id').eq('name', lecturerName).eq('university_id', universityId).maybeSingle();
            if (!lecturer) {
                const { data: newLecturer, error } = await supabase.from('lecturers').insert({ name: lecturerName, university_id: universityId }).select('id').single();
                if (error) throw new Error(`Failed to create lecturer: ${error.message}`);
                lecturer = newLecturer;
            }
            lecturerId = lecturer.id;
        }

        // --- Insert Document record ---
        const { data: document, error: docError } = await supabase.from('documents').insert({ title, description: formData.get('description')?.toString(), course_id: course.id, lecturer_id: lecturerId, uploader_ip: uploaderIp, status: 'pending' }).select('id').single();
        if (docError) throw new Error(`Failed to create document record: ${docError.message}`);

        // --- Loop through sections, create records, and upload files ---
        for (const sectionData of sections) {
            const { data: section, error: secError } = await supabase.from('document_sections').insert({ document_id: document.id, title: sectionData.title }).select('id').single();
            if (secError) throw new Error(`Failed to create section record: ${secError.message}`);

            for (const file of sectionData.files) {
                const fileType = getFileTypeEnum(file.type);
                if (!fileType) continue;

                const tgFormData = new FormData();
                tgFormData.append('chat_id', c.env.TELEGRAM_CHANNEL_ID);
                tgFormData.append('document', file);

                const tgResponse = await fetch(`https://api.telegram.org/bot${c.env.TELEGRAM_BOT_TOKEN}/sendDocument`, {
                    method: 'POST',
                    body: tgFormData,
                });
                const tgResult = (await tgResponse.json()) as TelegramSendDocumentResponse;
                if (!tgResult.ok) throw new Error(`Telegram API Error: ${tgResult.description}`);

                const { error: fileDbError } = await supabase.from('document_files').insert({
                    section_id: section.id,
                    name: file.name,
                    telegram_file_id: tgResult.result.document.file_id,
                    file_type: fileType,
                    size_kb: Math.round(file.size / 1024),
                });
                if (fileDbError) throw new Error(`Failed to save file metadata for "${file.name}": ${fileDbError.message}`);
            }
        }

        return c.json({ message: 'Upload successful, pending review.', documentId: document.id }, 201);
    } catch (e: any) {
        console.error('Exception during document upload:', e.message);
        return c.json({ error: e.message || 'An unexpected error occurred during upload' }, 500);
    }
});

// --- NEW: File Download Endpoint ---
app.get('/api/download/file/:fileId', async (c) => {
    try {
        const fileId = c.req.param('fileId');
        const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_ANON_KEY);

        const { data: fileInfo, error } = await supabase
            .from('document_files')
            .select('name, telegram_file_id')
            .eq('id', fileId)
            .single();
        
        if (error || !fileInfo) throw new Error('File not found in database');

        const getFileUrl = `https://api.telegram.org/bot${c.env.TELEGRAM_BOT_TOKEN}/getFile?file_id=${fileInfo.telegram_file_id}`;
        const tgFileApiResponse = await fetch(getFileUrl);
        const tgFileInfo = (await tgFileApiResponse.json()) as TelegramGetFileResponse;
        if (!tgFileInfo.ok) throw new Error(`Telegram getFile Error: ${tgFileInfo.description}`);

        const fileDownloadUrl = `https://api.telegram.org/file/bot${c.env.TELEGRAM_BOT_TOKEN}/${tgFileInfo.result.file_path}`;
        const fileResponse = await fetch(fileDownloadUrl);

        const response = new Response(fileResponse.body, fileResponse);
        response.headers.set('Content-Disposition', `attachment; filename="${fileInfo.name}"`);
        return response;

    } catch (e: any) {
        console.error('Exception during file download:', e.message);
        return c.json({ error: e.message || 'Could not download file' }, 500);
    }
});

// Reviews endpoint (RPC call) - no changes needed here
app.get('/api/reviews', async (c) => {
    try {
        const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_ANON_KEY);
        const universityIdentifier = c.req.query('universityId');
        const searchTerm = c.req.query('searchTerm');

        let universityUUID = null;
        if (universityIdentifier) {
            // Regex to check if the identifier is in UUID format.
            const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(universityIdentifier);

            if (isUUID) {
                universityUUID = universityIdentifier;
            } else {
                // If it's not a UUID, assume it's an abbreviation and look it up.
                const { data: uniData, error: uniError } = await supabase
                    .from('universities')
                    .select('id')
                    .eq('abbreviation', universityIdentifier)
                    .single();

                if (uniError) {
                    // Log the error but don't block the request. The search will just not be filtered by university.
                    console.error(`Could not find university with abbreviation: ${universityIdentifier}`);
                } else if (uniData) {
                    universityUUID = uniData.id;
                }
            }
        }
        
        const rpcParams: { university_id_filter?: string; search_term_filter?: string } = {};
        if (universityUUID) rpcParams.university_id_filter = universityUUID;
        if (searchTerm) rpcParams.search_term_filter = searchTerm;

        const { data, error } = await supabase.rpc('get_reviews_by_lecturer', rpcParams);
        if (error) throw error;
        return c.json(data);
    } catch (e: any) {
        console.error('Exception fetching reviews:', e.message);
        return c.json({ error: 'An unexpected error occurred' }, 500);
    }
});

export default app;