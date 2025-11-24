import React from 'react';
import type { CardData } from '../types';

interface StudentIdCardProps {
  data: CardData;
  cardRef: React.RefObject<HTMLDivElement>;
}

const StudentIdCard: React.FC<StudentIdCardProps> = ({ data, cardRef }) => {
  return (
    <div 
      ref={cardRef} 
      className="w-full aspect-[540/340] bg-white rounded-2xl shadow-xl flex flex-col font-sans overflow-hidden"
    >
      {/* Header Section */}
      <header className="bg-blue-900 text-white p-4 flex items-center gap-4">
        <div className="w-16 h-16 bg-white p-1 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0 shadow-md">
          <img
            src={data.schoolLogo || 'https://via.placeholder.com/64'}
            alt="School Logo"
            className="h-full w-full object-contain"
          />
        </div>
        <div className="text-left flex-grow min-w-0">
          <p className="text-sm font-semibold text-yellow-300 uppercase tracking-wide">Kartu Tanda Pelajar</p>
          <h1 className="text-xl font-bold text-white break-words">
            {data.schoolName || 'Nama Sekolah Anda'}
          </h1>
          <p className="text-xs text-blue-100 break-words">{data.schoolAddress || 'Alamat Sekolah'}</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative flex-grow flex items-center p-4 bg-blue-50">
        
        {/* Decorative Background Layer */}
        <div 
          className="absolute inset-0 z-0 opacity-40" 
          style={{
            backgroundImage: 'radial-gradient(circle at top left, rgba(66, 153, 225, 0.25) 0%, transparent 35%), radial-gradient(circle at bottom right, rgba(66, 153, 225, 0.25) 0%, transparent 35%)',
            backgroundSize: '150px 150px',
          }}
        ></div>

        {/* Watermark Layer */}
        {data.watermark && (
          <div className="absolute inset-0 flex justify-center items-end p-4 z-0">
            <img 
              src={data.watermark} 
              alt="Watermark" 
              className="max-h-36 w-auto object-contain opacity-10 pointer-events-none"
            />
          </div>
        )}

        {/* Content Layer */}
        <div className="relative z-10 flex items-start gap-4 w-full">
          <div className="w-28 h-36 bg-gray-200 rounded-lg overflow-hidden border-4 border-white shadow-md flex-shrink-0">
              <img
                  src={data.studentPhoto || 'https://via.placeholder.com/112x144'}
                  alt="Student"
                  className="w-full h-full object-cover"
              />
          </div>

          <div className="flex-1 text-left min-w-0">
              <h2 className="text-2xl font-bold text-blue-900 leading-tight break-words">{data.studentName || 'Nama Lengkap Siswa'}</h2>
              
              <div className="mt-2 space-y-1 text-md text-blue-800">
                  <div className="flex">
                      <p className="font-semibold w-20 text-blue-600">Kelas</p>
                      <p className="font-mono">: {data.studentClass || '...'}</p>
                  </div>
                   <div className="flex">
                      <p className="font-semibold w-20 text-blue-600">NISN</p>
                      <p className="font-mono">: {data.nisn || '...'}</p>
                  </div>
                   <div className="flex items-start">
                      <p className="font-semibold w-20 text-blue-600">Alamat</p>
                      <p className="font-mono break-words">: {data.studentAddress || '...'}</p>
                  </div>
              </div>
          </div>

          <div className="w-32 h-32 bg-white p-1 rounded-md flex items-center justify-center flex-shrink-0 self-center">
            <img
                src={data.qrCode || 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=Example'}
                alt="QR Code"
                className="w-full h-full object-contain"
            />
          </div>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="flex justify-between items-end p-3 text-xs bg-blue-100 text-blue-700">
          <div className="text-left max-w-[50%]">
              <p className="font-semibold text-blue-800">Catatan:</p>
              <p className="whitespace-pre-wrap leading-tight break-words">
                  {data.notes || 'Berlaku selama menjadi siswa.'}
              </p>
          </div>
          <div className="text-center flex-shrink-0">
              <p className="mb-1">
                {data.placeOfIssue || 'Tempat'}, {data.issueDate || 'dd'} {data.issueMonth || 'Bulan'} {data.issueYear || 'yyyy'}
              </p>
              <p>Kepala Sekolah</p>
              <div className="h-8"></div> {/* Signature Space */}
              <p className="font-bold text-blue-900 underline">
                  {data.headmasterName || '( Nama Kepala Sekolah )'}
              </p>
              <p>
                  NIP. {data.headmasterNip || '..............................'}
              </p>
          </div>
      </footer>
    </div>
  );
};

export default StudentIdCard;