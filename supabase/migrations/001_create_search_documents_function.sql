DROP FUNCTION IF EXISTS public.search_documents(integer, integer, text, uuid);

CREATE OR REPLACE FUNCTION public.search_documents(
    p_limit integer,
    p_offset integer,
    p_search_term text,
    p_university_id uuid
)
RETURNS TABLE(
    id uuid,
    title text,
    description text,
    created_at timestamp with time zone,
    course_name text,
    course_code text,
    lecturer_name text,
    university_id uuid
)
LANGUAGE sql
AS $$
    SELECT
        d.id,
        d.title,
        d.description,
        d.created_at,
        c.name AS course_name,
        c.code AS course_code,
        l.name AS lecturer_name,
        c.university_id
    FROM
        documents d
    LEFT JOIN
        courses c ON d.course_id = c.id
    LEFT JOIN
        lecturers l ON d.lecturer_id = l.id
    WHERE
        d.status = 'approved'
        -- Filter by the university ID passed from the worker.
        -- If p_university_id is NULL, this condition is ignored.
        AND (p_university_id IS NULL OR c.university_id = p_university_id)
        AND (
            -- If search term is empty, return all documents (matching other filters).
            p_search_term IS NULL OR p_search_term = '' OR
            -- Combine searchable fields into a tsvector for full-text search.
            to_tsvector('simple', coalesce(d.title, '') || ' ' || coalesce(d.description, '') || ' ' || coalesce(c.name, '') || ' ' || coalesce(l.name, '')) @@ websearch_to_tsquery('simple', p_search_term)
        )
    ORDER BY
        -- Order by creation date to show newest first.
        d.created_at DESC
    LIMIT
        p_limit
    OFFSET
        p_offset;
$$;