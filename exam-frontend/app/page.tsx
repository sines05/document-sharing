// File: src/app/page.tsx
import UploadForm from './UploadForm';
// Định nghĩa kiểu dữ liệu cho một đề thi
type Exam = {
  id: string;
  created_at: string;
  title: string;
  subject: string;
  grade: number;
  year: number;
};

// Hàm này sẽ chạy ở phía Server để lấy dữ liệu trước khi render trang
async function getExams(): Promise<Exam[]> {
  try {
    const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/exams`;
    const res = await fetch(apiUrl, { 
      // cache: 'no-store' giúp luôn lấy dữ liệu mới nhất
      cache: 'no-store' 
    });

    if (!res.ok) {
      throw new Error('Failed to fetch exams');
    }
    return res.json();
  } catch (error) {
    console.error("Error fetching exams:", error);
    return []; // Trả về mảng rỗng nếu có lỗi
  }
}


export default async function HomePage() {
  const exams = await getExams();
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  return (
    <main className="container mx-auto p-8">
      <h1 className="text-4xl font-bold mb-6">Trang Chia Sẻ Đề Thi</h1>
      
      {/* PHẦN UPLOAD - Sẽ làm ở bước sau */}
      <div className="bg-gray-100 p-6 rounded-lg mb-8">
         <h2 className="text-2xl font-semibold mb-4">Tải Lên Đề Thi Mới</h2>
         {/* Form upload sẽ ở đây */}
         <UploadForm />
      </div>

      {/* PHẦN DANH SÁCH ĐỀ THI */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold mb-4">Danh sách đề thi</h2>
        {exams.length > 0 ? (
          exams.map((exam) => (
            <div key={exam.id} className="p-4 border rounded-lg shadow-sm flex justify-between items-center">
              <div>
                <h3 className="text-xl font-semibold">{exam.title}</h3>
                <p className="text-gray-600">
                  Môn: {exam.subject} - Lớp: {exam.grade} - Năm: {exam.year}
                </p>
              </div>
              <a
                href={`${apiBaseUrl}/api/download/${exam.id}`}
                target="_blank" // Mở trong tab mới
                rel="noopener noreferrer"
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors"
              >
                Tải về
              </a>
            </div>
          ))
        ) : (
          <p>Chưa có đề thi nào được tải lên.</p>
        )}
      </div>
    </main>
  );
}