'use client';

import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloudIcon, FileIcon, CloseIcon as XIcon } from './Icons';

const Dropzone = ({ onFileChange }: { onFileChange: (file: File | null) => void }) => {
  const [file, setFile] = useState<File | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const acceptedFile = acceptedFiles[0];
      setFile(acceptedFile);
      onFileChange(acceptedFile);
    }
  }, [onFileChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.png', '.jpg'], 'application/pdf': ['.pdf'] },
    multiple: false,
  });

  const removeFile = () => {
    setFile(null);
    onFileChange(null);
  };

  return (
    <div>
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${isDragActive ? 'border-purple-600 bg-purple-50' : 'border-gray-300 hover:border-purple-400'}`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center">
          <UploadCloudIcon className="w-12 h-12 text-gray-400" />
          {isDragActive ? (
            <p className="mt-2 text-gray-600">فایل را اینجا رها کنید...</p>
          ) : (
            <p className="mt-2 text-gray-600">فایل خود را بکشید و اینجا رها کنید، یا برای انتخاب کلیک کنید</p>
          )}
          <p className="text-xs text-gray-500 mt-1">PDF, PNG, JPG</p>
        </div>
      </div>
      {file && (
        <div className="mt-4 p-2 border rounded-lg flex justify-between items-center bg-gray-50">
          <div className="flex items-center gap-2">
            <FileIcon className="w-6 h-6 text-gray-600" />
            <span className="text-sm">{file.name}</span>
          </div>
          <button onClick={removeFile} className="p-1 rounded-full hover:bg-gray-200">
            <XIcon className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      )}
    </div>
  );
};

export default Dropzone; 