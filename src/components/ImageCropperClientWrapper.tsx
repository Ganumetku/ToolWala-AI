"use client";

import React from 'react';
import dynamic from 'next/dynamic';
import ImageUploadPlaceholder from './ImageUploadPlaceholder';

const ImageCropperEngine = dynamic(
  () => import('./ImageCropperEngine'),
  {
    ssr: false,
    loading: () => <ImageUploadPlaceholder />
  }
);

interface ImageCropperClientWrapperProps {
  toolSlug: string;
  title: string;
  description: string;
  presets: any[];
}

export default function ImageCropperClientWrapper(props: ImageCropperClientWrapperProps) {
  return <ImageCropperEngine {...props} />;
}
