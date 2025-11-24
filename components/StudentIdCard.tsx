import React from 'react';
import type { CardData } from '../types';

interface StudentIdCardProps {
  data: CardData;
  cardRef: React.RefObject<HTMLDivElement>;
}

const StudentIdCard: React.FC<StudentIdCardProps> = ({ data, cardRef }) => {
  return (
    // Card container with gradient background - Adjusted height for correct KTP aspect ratio (85.6 / 53.98 ≈ 1.5857)
    // 512px / 1.5857 ≈ 323px
    <div 
      ref={cardRef} 
      className="w-[512px] h-[323px] bg-gradient-to-br from-blue-100 via-white to-cyan-100 rounded-2xl shadow-2xl p-4 flex flex-col font-sans transform scale-90 md:scale-100 origin-top overflow-hidden"
    >
      {/* Header with solid color background */}
      <div className="flex items-center p-3 bg-blue-800 rounded-lg -mt-1 -mx-1">
        <div className="bg-white p-1 rounded-md">
            <img
            src={data.schoolLogo || 'https://via.placeholder.com/50'}
            alt="School Logo"
            className="h-10 w-10 object-contain"
            />
        </div>
        <div className="text-left ml-3">
          <p className="text-sm font-semibold text-blue-200 uppercase tracking-wider">Kartu Tanda Pelajar</p>
          <h1 className="text-lg font-bold text-white leading-tight">
            {data.schoolName || 'Nama Sekolah'}
          </h1>
          <p className="text-xs text-blue-200 leading-tight">{data.schoolAddress || 'Alamat Sekolah'}</p>
        </div>
      </div>

      {/* Body */}
      <div className="flex-grow flex flex-col pt-4">
        <div className="flex-grow flex gap-4">
            {/* Left column: Photo */}
            <div className="flex flex-col justify-start items-center w-36 flex-shrink-0 pl-2">
                <div className="w-32 h-40 bg-gray-200 rounded-lg overflow-hidden border-4 border-blue-200 shadow-md">
                    <img
                        src={data.studentPhoto || 'https://via.placeholder.com/128x160'}
                        alt="Student"
                        className="w-full h-full object-cover"
                    />
                </div>
            </div>

            {/* Right column: Details, QR, Signature */}
            <div className="flex-1 flex flex-col pr-2 pb-1 text-left">
                {/* Details */}
                <div className="mt-1">
                    <h2 className="text-2xl font-bold text-blue-900 leading-tight">{data.studentName || 'Nama Lengkap Siswa'}</h2>
                    <div className="mt-2 text-sm text-gray-700 space-y-1">
                      <p><span className="font-semibold w-12 inline-block text-gray-500">NISN</span>: {data.nisn || '0012345678'}</p>
                      <p><span className="font-semibold w-12 inline-block text-gray-500">Kelas</span>: {data.studentClass || 'XII IPA 1'}</p>
                      <p><span className="font-semibold w-12 inline-block text-gray-500">Alamat</span>: {data.address || 'Jl. Merdeka No. 123'}</p>
                    </div>
                </div>

                {/* QR and Signature (pushed to bottom) */}
                <div className="flex-grow flex items-end justify-between gap-4">
                    {data.qrCode ? (
                        <div className="w-28 h-28 bg-white rounded-md overflow-hidden p-1 flex justify-center items-center">
                            <img 
                                src={data.qrCode}
                                alt="QR Code"
                                className="w-full h-full object-contain filter brightness-110 contrast-125"
                            />
                        </div>
                    ) : (
                        <div className="w-28 h-28 flex-shrink-0"></div> // Placeholder to maintain layout
                    )}
                    
                     <div className="text-center text-xs text-gray-700 w-48">
                        <p>Mengetahui,</p>
                        <p>Kepala Sekolah</p>
                        <div className="h-8"></div>
                        <p className="font-bold border-b border-gray-700 w-full text-center">{data.principalName || 'Nama Kepala Sekolah'}</p>
                        <p>NIP. {data.principalNip || '19XXXXXXXX XXXXXX X XXX'}</p>
                    </div>
                </div>
            </div>
        </div>
        {/* Notes section at the bottom of the card */}
        <div className="px-2">
          <p className="text-[10px] text-gray-500 italic">
              <strong>Catatan:</strong> {data.notes || 'Kartu ini milik sekolah dan tidak dapat dipindahtangankan.'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default StudentIdCard;
