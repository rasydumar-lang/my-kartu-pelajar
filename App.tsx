
import React, { useState, useRef } from 'react';
import type { CardData } from './types';
import StudentIdCard from './components/StudentIdCard';
import TextInput from './components/TextInput';
import ImageUploader from './components/ImageUploader';
import { DownloadIcon, WordIcon, PrintIcon } from './components/icons';

// Declare jsPDF, html2canvas, and docx from global scope
declare const jspdf: any;
declare const html2canvas: any;
declare const docx: any;

type PreviewSize = 'semua' | 'kiriKanan' | 'atasBawah';

function App() {
  const [cardData, setCardData] = useState<CardData>({
    studentPhoto: null,
    schoolLogo: null,
    schoolName: '',
    schoolAddress: '',
    studentName: '',
    studentClass: '',
    nisn: '',
    studentAddress: '',
    headmasterName: '',
    headmasterNip: '',
    notes: 'Berlaku selama menjadi siswa.',
    qrCode: null,
    watermark: null,
    placeOfIssue: '',
    issueDate: '',
    issueMonth: '',
    issueYear: '',
  });

  const cardRef = useRef<HTMLDivElement>(null);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [isDownloadingWord, setIsDownloadingWord] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [previewSize, setPreviewSize] = useState<PreviewSize>('semua');

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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

        const pdf = new jsPDF({
            orientation: 'landscape',
            unit: 'mm',
            format: [cardWidthMm, cardHeightMm],
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
        const base64Data = imgData.split(',')[1];

        const { Document, Packer, Paragraph, ImageRun } = docx;
        
        const cardWidthPx = 540;
        const cardHeightPx = 340;

        const doc = new Document({
            sections: [{
                properties: {},
                children: [
                    new Paragraph({
                        children: [
                            new ImageRun({
                                data: base64Data,
                                transformation: {
                                    width: cardWidthPx,
                                    height: cardHeightPx,
                                },
                            }),
                        ],
                    }),
                ],
            }],
        });

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

  const handlePrint = async () => {
    if (!cardRef.current) return;
    setIsPrinting(true);

    try {
        const canvas = await html2canvas(cardRef.current, {
            scale: 3,
            useCORS: true,
            backgroundColor: null,
        });

        const imgData = canvas.toDataURL('image/png');
        const printWindow = window.open('', '_blank');
        
        if (printWindow) {
            printWindow.document.write(`
                <html>
                    <head>
                        <title>Cetak Kartu Pelajar</title>
                        <style>
                            @page { size: auto; margin: 0; }
                            body { margin: 0; display: flex; justify-content: center; align-items: center; height: 100vh; }
                            img { max-width: 100%; max-height: 100%; object-fit: contain; }
                        </style>
                    </head>
                    <body>
                        <img src="${imgData}" />
                        <script>
                            window.onload = () => {
                                window.print();
                                setTimeout(() => window.close(), 100); // Close after print dialog
                            };
                        </script>
                    </body>
                </html>
            `);
            printWindow.document.close();
        } else {
            alert("Gagal membuka jendela cetak. Pastikan pop-up diizinkan untuk situs ini.");
        }
    } catch (error) {
        console.error("Error printing:", error);
        alert("Gagal menyiapkan kartu untuk dicetak. Silakan coba lagi.");
    } finally {
        setIsPrinting(false);
    }
  };

  const previewSizeClasses: Record<PreviewSize, string> = {
    semua: 'max-w-[540px]',
    kiriKanan: 'w-full',
    atasBawah: 'max-w-sm',
  };

  const sizeOptions: { key: PreviewSize; label: string }[] = [
    { key: 'atasBawah', label: 'Penuh Semua Lebar Bawah' },
    { key: 'kiriKanan', label: 'Penuh Lebar Kiri & Kanan' },
    { key: 'semua', label: 'Penuh Semua' },
  ];

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
              <TextInput label="Alamat Sekolah" name="schoolAddress" value={cardData.schoolAddress} onChange={handleTextChange} placeholder="Contoh: Jl. Jenderal Sudirman No. 1" />
              <TextInput label="Nama Lengkap Siswa" name="studentName" value={cardData.studentName} onChange={handleTextChange} placeholder="Contoh: Budi Santoso" />
              <TextInput label="Kelas" name="studentClass" value={cardData.studentClass} onChange={handleTextChange} placeholder="Contoh: XII IPA 1" />
              <TextInput label="NISN" name="nisn" value={cardData.nisn} onChange={handleTextChange} placeholder="Contoh: 0012345678" />
              <TextInput label="Alamat Siswa" name="studentAddress" value={cardData.studentAddress} onChange={handleTextChange} placeholder="Contoh: Jl. Merdeka No. 10, Jakarta" />
              <TextInput label="Nama Kepala Sekolah" name="headmasterName" value={cardData.headmasterName} onChange={handleTextChange} placeholder="Contoh: Drs. H. Muhammad, M.Pd" />
              <TextInput label="NIP Kepala Sekolah" name="headmasterNip" value={cardData.headmasterNip} onChange={handleTextChange} placeholder="Contoh: 196801011994031009" />
              <TextInput label="Tempat Cetak" name="placeOfIssue" value={cardData.placeOfIssue} onChange={handleTextChange} placeholder="Contoh: Jakarta" />
              <div className="grid grid-cols-3 gap-4">
                <TextInput label="Tanggal" name="issueDate" value={cardData.issueDate} onChange={handleTextChange} placeholder="Contoh: 28" />
                <TextInput label="Bulan" name="issueMonth" value={cardData.issueMonth} onChange={handleTextChange} placeholder="Contoh: Oktober" />
                <TextInput label="Tahun" name="issueYear" value={cardData.issueYear} onChange={handleTextChange} placeholder="Contoh: 2024" />
              </div>
               <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                  Catatan
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  value={cardData.notes}
                  onChange={handleTextChange}
                  placeholder="Contoh: Berlaku selama menjadi siswa."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"
                />
              </div>
              <div className="grid md:grid-cols-2 gap-4 pt-2">
                <ImageUploader label="Upload Logo Sekolah" name="schoolLogo" previewUrl={cardData.schoolLogo} onChange={handleImageChange} />
                <ImageUploader label="Upload Foto Siswa (3x4)" name="studentPhoto" previewUrl={cardData.studentPhoto} onChange={handleImageChange} />
                <ImageUploader label="Upload QR Code" name="qrCode" previewUrl={cardData.qrCode} onChange={handleImageChange} />
                <ImageUploader label="Upload Watermark" name="watermark" previewUrl={cardData.watermark} onChange={handleImageChange} />
              </div>
            </div>
          </div>

          {/* Preview Section */}
          <div className="flex flex-col items-center">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Pratinjau Kartu</h2>

            <div className="w-full flex justify-center mb-4 bg-gray-200 p-1 rounded-lg">
                {sizeOptions.map(({ key, label }) => (
                    <button
                        key={key}
                        onClick={() => setPreviewSize(key)}
                        className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors w-full ${
                            previewSize === key
                                ? 'bg-white text-indigo-700 shadow'
                                : 'text-gray-600 hover:bg-gray-300'
                        }`}
                    >
                        {label}
                    </button>
                ))}
            </div>
            
            <div className={`w-full transition-all duration-300 ease-in-out mb-8 ${previewSizeClasses[previewSize]}`}>
                <StudentIdCard data={cardData} cardRef={cardRef} />
            </div>

             <div className="w-full max-w-xs flex flex-col gap-4">
                <button
                    onClick={handleDownloadPdf}
                    disabled={isDownloadingPdf || isDownloadingWord || isPrinting}
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

                <button
                    onClick={handleDownloadWord}
                    disabled={isDownloadingPdf || isDownloadingWord || isPrinting}
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
                
                <button
                    onClick={handlePrint}
                    disabled={isDownloadingPdf || isDownloadingWord || isPrinting}
                    className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-green-300 disabled:cursor-not-allowed transition-colors w-full"
                >
                    {isPrinting ? (
                        <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Mencetak...
                        </>
                    ) : (
                        <>
                            <PrintIcon />
                            Cetak Kartu
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
