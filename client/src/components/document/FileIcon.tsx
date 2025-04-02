import { 
  FileText, Image, Archive, File, FileVideo, 
  FileAudio, PresentationIcon, FileJson, Code, FileSpreadsheet 
} from 'lucide-react';

interface FileIconProps {
  fileType: string;
  size?: number;
}

export function FileIcon({ fileType, size = 16 }: FileIconProps) {
  const iconClass = `w-${size === 16 ? '4' : size === 24 ? '6' : '10'} h-${size === 16 ? '4' : size === 24 ? '6' : '10'} ${size > 16 ? 'text-pink-500' : 'text-gray-500'}`;

  if (fileType.includes('spreadsheet') || fileType.includes('excel') || fileType.includes('xlsx')) {
    return <FileSpreadsheet className={iconClass} />;
  } else if (fileType.includes('presentation') || fileType.includes('powerpoint') || fileType.includes('pptx')) {
    return <PresentationIcon className={iconClass} />;
  } else if (fileType.includes('document') || fileType.includes('docx')) {
    return <FileText className={iconClass} />;
  } else if (fileType.includes('pdf')) {
    return <BookText className={iconClass} />;
  } else if (fileType.startsWith('image/')) {
    return <Image className={iconClass} />;
  } else if (fileType.includes('json') || fileType.includes('application/json')) {
    return <FileJson className={iconClass} />;
  } else if (
    fileType.includes('javascript') || 
    fileType.includes('html') || 
    fileType.includes('css') || 
    fileType.includes('xml') || 
    fileType.includes('text/plain')
  ) {
    return <Code className={iconClass} />;
  } else if (fileType.includes('zip') || fileType.includes('archive')) {
    return <Archive className={iconClass} />;
  } else if (fileType.includes('video')) {
    return <FileVideo className={iconClass} />;
  } else if (fileType.includes('audio')) {
    return <FileAudio className={iconClass} />;
  }
  
  return <File className={iconClass} />;
}
