
import React, { useState, useRef } from 'react';
import type { CardData } from './types';
import StudentIdCard from './components/StudentIdCard';
import TextInput from './components/TextInput';
import ImageUploader from './components/ImageUploader';
import { DownloadIcon, WordIcon } from './components/icons';

// Declare jsPDF, html2canvas, and docx from global scope
declare const jspdf: any;
declare const html2canvas: any;
declare const docx: any;

function App() {
  const [cardData, setCardData] = useState<CardData>({
    studentPhoto: null,
    schoolLogo: null,
    qrCode: null,
    schoolName: '',
    schoolAddress: '',
    studentName: '',
    studentClass: '',
    nisn: '',
    address: '',
    principalName: '',
    principalNip: '',
    notes: '',
  });

  const cardRef = useRef<HTMLDivElement>(null);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [isDownloadingWord, setIsDownloadingWord] = useState(false);

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCardData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCardData(prev => ({ ...prev, [name]: reader.result as string }));
      };
      reader.readAsDataURL(files[0]);
    }
  };
  
  const handleDownloadPdf = async () => {
    if (!cardRef.current) return;
    setIsDownloadingPdf(true);

    try {
        const { jsPDF } = jspdf;
        const canvas = await html2canvas(cardRef.current, {
            scale: 3,
            useCORS: true,
            backgroundColor: null,
        });

        const imgData = canvas.toDataURL('image/png');
        const cardWidthMm = 85.6;
        const cardHeightMm = 53.98;

        // For landscape, jsPDF swaps width and height, so we pass [height, width]
        const pdf = new jsPDF({
            orientation: 'landscape',
            unit: 'mm',
            format: [cardHeightMm, cardWidthMm],
        });

        pdf.addImage(imgData, 'PNG', 0, 0, cardWidthMm, cardHeightMm);
        const fileName = cardData.studentName ? `kartu-pelajar-${cardData.studentName.replace(/\s/g, '_')}.pdf` : 'kartu-pelajar.pdf';
        pdf.save(fileName);
    } catch (error) {
        console.error("Error generating PDF:", error);
        alert("Gagal membuat PDF. Silakan coba lagi.");
    } finally {
        setIsDownloadingPdf(false);
    }
};

  const handleDownloadWord = async () => {
    if (!cardRef.current) return;
    setIsDownloadingWord(true);

    try {
        const canvas = await html2canvas(cardRef.current, {
            scale: 3,
            useCORS: true,
            backgroundColor: null,
        });

        const imgData = canvas.toDataURL('image/png');
        // Extract base64 part
        const base64Data = imgData.split(',')[1];

        const { Document, Packer, Paragraph, ImageRun } = docx;

        // Create a new document
        // Card dimensions: ~512px width in design.
        const doc = new Document({
            sections: [{
                properties: {},
                children: [
                    new Paragraph({
                        children: [
                            new ImageRun({
                                data: base64Data,
                                transformation: {
                                    width: 512,
                                    height: 323,
                                },
                            }),
                        ],
                    }),
                ],
            }],
        });

        // Generate blob and download
        const blob = await Packer.toBlob(doc);
        const fileName = cardData.studentName ? `kartu-pelajar-${cardData.studentName.replace(/\s/g, '_')}.docx` : 'kartu-pelajar.docx';
        
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

    } catch (error) {
        console.error("Error generating Word:", error);
        alert("Gagal membuat Word. Pastikan koneksi internet lancar untuk memuat library.");
    } finally {
        setIsDownloadingWord(false);
    }
  };


  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-3xl font-bold text-gray-800">Generator Kartu Pelajar</h1>
          <p className="text-gray-600 mt-1">Buat kartu pelajar dengan desain profesional dan elegan.</p>
        </div>
      </header>

      <main className="container mx-auto p-4 lg:p-8">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          
          {/* Form Section */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-700 mb-6">Isi Data Kartu</h2>
            <div className="space-y-4">
              <TextInput label="Nama Sekolah" name="schoolName" value={cardData.schoolName} onChange={handleTextChange} placeholder="Contoh: SMA Negeri 1 Jakarta" />
              <TextInput label="Alamat Sekolah" name="schoolAddress" value={cardData.schoolAddress} onChange={handleTextChange} placeholder="Contoh: Jl. Budi Utomo No.7, Jakarta Pusat" />
              <TextInput label="Nama Lengkap Siswa" name="studentName" value={cardData.studentName} onChange={handleTextChange} placeholder="Contoh: Budi Santoso" />
              <TextInput label="Kelas" name="studentClass" value={cardData.studentClass} onChange={handleTextChange} placeholder="Contoh: XII IPA 1" />
              <TextInput label="NISN" name="nisn" value={cardData.nisn} onChange={handleTextChange} placeholder="Contoh: 0012345678" />
              <TextInput label="Alamat" name="address" value={cardData.address} onChange={handleTextChange} placeholder="Contoh: Jl. Merdeka No. 123" />
              <div className="grid md:grid-cols-2 gap-4">
                <ImageUploader label="Upload Logo Sekolah" name="schoolLogo" previewUrl={cardData.schoolLogo} onChange={handleImageChange} />
                <ImageUploader label="Upload Foto Siswa" name="studentPhoto" previewUrl={cardData.studentPhoto} onChange={handleImageChange} />
              </div>
              <ImageUploader label="Upload QR Code" name="qrCode" previewUrl={cardData.qrCode} onChange={handleImageChange} />
              <hr className="my-4"/>
              <TextInput label="Nama Kepala Sekolah" name="principalName" value={cardData.principalName} onChange={handleTextChange} placeholder="Contoh: Dr. H. Susilo, M.Pd" />
              <TextInput label="NIP Kepala Sekolah" name="principalNip" value={cardData.principalNip} onChange={handleTextChange} placeholder="Contoh: 196501011990031001" />
              <TextInput label="Catatan" name="notes" value={cardData.notes} onChange={handleTextChange} placeholder="Contoh: Kartu ini tidak dapat dipindahtangankan" />
            </div>
          </div>

          {/* Preview Section */}
          <div className="flex flex-col items-center">
            <h2 className="text-xl font-semibold text-gray-700 mb-6">Pratinjai Kartu</h2>
            <div className="flex justify-center items-start">
              <StudentIdCard data={cardData} cardRef={cardRef} />
            </div>
             <div className="mt-8 w-full max-w-xs flex flex-col gap-4">
                {/* PDF Button */}
                <button
                    onClick={handleDownloadPdf}
                    disabled={isDownloadingPdf || isDownloadingWord}
                    className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300 disabled:cursor-not-allowed transition-colors w-full"
                >
                    {isDownloadingPdf ? (
                        <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Memproses PDF...
                        </>
                    ) : (
                        <>
                            <DownloadIcon />
                            Unduh Kartu (PDF)
                        </>
                    )}
                </button>

                {/* Word Button */}
                <button
                    onClick={handleDownloadWord}
                    disabled={isDownloadingPdf || isDownloadingWord}
                    className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors w-full"
                >
                    {isDownloadingWord ? (
                        <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Memproses Word...
                        </>
                    ) : (
                        <>
                            <WordIcon />
                            Unduh Kartu (Word)
                        </>
                    )}
                </button>
             </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
