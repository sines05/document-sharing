// File: src/app/UploadForm.tsx
'use client'; // Đánh dấu đây là Client Component vì nó có tương tác (useState, form events)

import { useState, FormEvent } from 'react';

export default function UploadForm() {
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsUploading(true);
    setMessage('');
    setError('');

    const form = event.currentTarget;
    const formData = new FormData(form);
    const file = formData.get('document') as File;

    if (!file || file.size === 0) {
        setError('Vui lòng chọn một file để tải lên.');
        setIsUploading(false);
        return;
    }

    try {
      const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/upload`;
      const response = await fetch(apiUrl, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Có lỗi xảy ra khi tải lên.');
      }
      
      setMessage(`Tải lên thành công! ID đề thi: ${result.examData.id}`);
      form.reset(); // Xóa các trường trong form
      // Lý tưởng nhất là sẽ tự động reload lại danh sách đề thi
      window.location.reload(); 

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="title" className="block font-medium">Tên đề thi:</label>
        <input type="text" id="title" name="title" required className="w-full border p-2 rounded" />
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div>
            <label htmlFor="subject" className="block font-medium">Môn:</label>
            <input type="text" id="subject" name="subject" required className="w-full border p-2 rounded" />
        </div>
        <div>
            <label htmlFor="grade" className="block font-medium">Lớp:</label>
            <input type="number" id="grade" name="grade" required className="w-full border p-2 rounded" />
        </div>
        <div>
            <label htmlFor="year" className="block font-medium">Năm:</label>
            <input type="number" id="year" name="year" required className="w-full border p-2 rounded" />
        </div>
      </div>
      <div>
        <label htmlFor="document" className="block font-medium">Chọn file (PDF, DOCX...):</label>
        <input type="file" id="document" name="document" required className="w-full border p-2 rounded" />
      </div>
      
      <button 
        type="submit" 
        disabled={isUploading}
        className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded disabled:bg-gray-400"
      >
        {isUploading ? 'Đang tải lên...' : 'Tải Lên'}
      </button>

      {message && <p className="text-green-600 mt-2">{message}</p>}
      {error && <p className="text-red-600 mt-2">{error}</p>}
    </form>
  );
}