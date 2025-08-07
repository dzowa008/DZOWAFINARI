// File processing utilities for extracting data from various document types
import { Note } from '../types';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import mammoth from 'mammoth';
import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export interface ProcessedFile {
  name: string;
  type: string;
  size: number;
  content: string;
  extractedText?: string;
  metadata?: Record<string, any>;
  thumbnail?: string;
  duration?: number; // for audio/video files
}

export class FileProcessor {
  private static readonly SUPPORTED_TYPES = {
    text: ['.txt', '.md', '.rtf'],
    document: ['.pdf', '.doc', '.docx', '.odt'],
    spreadsheet: ['.xls', '.xlsx', '.csv', '.ods'],
    presentation: ['.ppt', '.pptx', '.odp'],
    image: ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg'],
    audio: ['.mp3', '.wav', '.ogg', '.m4a', '.flac', '.aac'],
    video: ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm', '.mkv'],
    code: ['.js', '.ts', '.jsx', '.tsx', '.py', '.java', '.cpp', '.c', '.html', '.css', '.json', '.xml', '.yaml', '.yml'],
    archive: ['.zip', '.rar', '.7z', '.tar', '.gz']
  };

  static async processFile(file: File): Promise<ProcessedFile> {
    const extension = this.getFileExtension(file.name);
    const fileType = this.getFileType(extension);
    
    let extractedText = '';
    let metadata: Record<string, any> = {
      originalName: file.name,
      size: file.size,
      lastModified: new Date(file.lastModified),
      type: file.type
    };

    try {
      switch (fileType) {
        case 'text':
          extractedText = await this.processTextFile(file);
          break;
        case 'document':
          extractedText = await this.processDocumentFile(file);
          break;
        case 'spreadsheet':
          extractedText = await this.processSpreadsheetFile(file);
          break;
        case 'image':
          extractedText = await this.processImageFile(file);
          metadata.thumbnail = await this.generateImageThumbnail(file);
          break;
        case 'audio':
          const audioData = await this.processAudioFile(file);
          extractedText = audioData.transcription || '';
          metadata.duration = audioData.duration;
          break;
        case 'video':
          const videoData = await this.processVideoFile(file);
          extractedText = videoData.transcription || '';
          metadata.duration = videoData.duration;
          metadata.thumbnail = videoData.thumbnail;
          break;
        case 'code':
          extractedText = await this.processCodeFile(file);
          break;
        case 'archive':
          extractedText = await this.processArchiveFile(file);
          break;
        default:
          extractedText = await this.processGenericFile(file);
      }
    } catch (error) {
      console.error('Error processing file:', error);
      extractedText = `Error processing file: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }

    return {
      name: file.name,
      type: fileType,
      size: file.size,
      content: extractedText,
      extractedText,
      metadata
    };
  }

  private static getFileExtension(filename: string): string {
    return filename.toLowerCase().substring(filename.lastIndexOf('.'));
  }

  private static getFileType(extension: string): string {
    for (const [type, extensions] of Object.entries(this.SUPPORTED_TYPES)) {
      if (extensions.includes(extension)) {
        return type;
      }
    }
    return 'unknown';
  }

  private static async processTextFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string || '');
      reader.onerror = () => reject(new Error('Failed to read text file'));
      reader.readAsText(file);
    });
  }

  private static async processDocumentFile(file: File): Promise<string> {
    const extension = this.getFileExtension(file.name);
    
    try {
      if (extension === '.pdf') {
        return await this.extractPDFText(file);
      } else if (extension === '.docx') {
        return await this.extractWordText(file);
      } else if (extension === '.doc') {
        return `Legacy .doc files are not supported. Please convert to .docx format.`;
      }
      
      return `Document content extraction not yet implemented for ${extension} files.`;
    } catch (error) {
      console.error('Error processing document:', error);
      return `Error extracting content from ${file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  }

  private static async extractPDFText(file: File): Promise<string> {
    try {
      const pdfjsLib = await import('pdfjs-dist');
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      
      let fullText = '';
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(' ');
        fullText += pageText + '\n';
      }
      
      return fullText.trim() || `[PDF File: ${file.name}]\n\nContent extracted but appears to be empty or contains only images.`;
    } catch (error) {
      console.error('PDF extraction error:', error);
      return `[PDF File: ${file.name}]\n\nError extracting text: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  }

  private static async extractWordText(file: File): Promise<string> {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      return result.value || `[Word Document: ${file.name}]\n\nDocument appears to be empty or content could not be extracted.`;
    } catch (error) {
      console.error('Word extraction error:', error);
      return `[Word Document: ${file.name}]\n\nError extracting text: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  }



  private static async processSpreadsheetFile(file: File): Promise<string> {
    const extension = this.getFileExtension(file.name);
    
    try {
      if (extension === '.csv') {
        return await this.processCSVFile(file);
      } else if (['.xls', '.xlsx'].includes(extension)) {
        return await this.processExcelFile(file);
      }
      
      return `[Spreadsheet File: ${file.name}]\n\nUnsupported spreadsheet format: ${extension}`;
    } catch (error) {
      console.error('Spreadsheet processing error:', error);
      return `[Spreadsheet File: ${file.name}]\n\nError processing file: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  }

  private static async processCSVFile(file: File): Promise<string> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const csvText = e.target?.result as string;
        Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            const data = results.data as any[];
            const preview = data.slice(0, 10);
            
            let output = `[CSV File: ${file.name}]\n\n`;
            output += `Total rows: ${data.length}\n`;
            output += `Columns: ${Object.keys(data[0] || {}).join(', ')}\n\n`;
            
            if (preview.length > 0) {
              output += 'Preview (first 10 rows):\n';
              preview.forEach((row, index) => {
                output += `Row ${index + 1}: ${JSON.stringify(row)}\n`;
              });
            }
            
            if (data.length > 10) {
              output += '\n... (additional rows truncated)';
            }
            
            resolve(output);
          },
          error: (error: any) => {
            resolve(`[CSV File: ${file.name}]\n\nError parsing CSV: ${error.message}`);
          }
        });
      };
      reader.readAsText(file);
    });
  }

  private static async processExcelFile(file: File): Promise<string> {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      
      let output = `[Excel File: ${file.name}]\n\n`;
      output += `Worksheets: ${workbook.SheetNames.join(', ')}\n\n`;
      
      // Process first worksheet
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      
      output += `Data from "${firstSheetName}" worksheet:\n`;
      const preview = jsonData.slice(0, 10);
      preview.forEach((row: any, index) => {
        output += `Row ${index + 1}: ${JSON.stringify(row)}\n`;
      });
      
      if (jsonData.length > 10) {
        output += '\n... (additional rows truncated)';
      }
      
      return output;
    } catch (error) {
      console.error('Excel processing error:', error);
      return `[Excel File: ${file.name}]\n\nError processing Excel file: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  }

  private static async processImageFile(file: File): Promise<string> {
    // Immediate image analysis simulation
    return `[Image Analysis for ${file.name}]\n\nImage dimensions: Analyzing...\nFile size: ${file.size} bytes\nFormat: ${file.type}\n\nThis is simulated image text extraction. In a real implementation, you would use OCR libraries like Tesseract.js to extract text from images, or AI services for image analysis.`;
  }

  private static async generateImageThumbnail(file: File): Promise<string> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          // Create thumbnail (150x150)
          canvas.width = 150;
          canvas.height = 150;
          
          const scale = Math.min(150 / img.width, 150 / img.height);
          const x = (150 - img.width * scale) / 2;
          const y = (150 - img.height * scale) / 2;
          
          ctx?.drawImage(img, x, y, img.width * scale, img.height * scale);
          resolve(canvas.toDataURL());
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  }

  private static async processAudioFile(file: File): Promise<{ transcription?: string; duration?: number }> {
    // Immediate audio transcription simulation
    const estimatedDuration = Math.floor(file.size / 16000); // Rough estimate
    return {
      transcription: `[Audio Transcription from ${file.name}]\n\nThis is simulated audio transcription. In a real implementation, you would use speech-to-text services like Web Speech API, Google Speech-to-Text, or OpenAI Whisper.\n\nEstimated duration: ${estimatedDuration} seconds\nFile size: ${file.size} bytes`,
      duration: estimatedDuration
    };
  }

  private static async processVideoFile(file: File): Promise<{ transcription?: string; duration?: number; thumbnail?: string }> {
    // Immediate video processing simulation
    const estimatedDuration = Math.floor(file.size / 100000); // Rough estimate
    return {
      transcription: `[Video Analysis from ${file.name}]\n\nThis is simulated video transcription and analysis. In a real implementation, you would extract audio for transcription and generate video thumbnails.\n\nEstimated duration: ${estimatedDuration} seconds\nFile size: ${file.size} bytes`,
      duration: estimatedDuration,
      thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDE1MCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxNTAiIGhlaWdodD0iMTUwIiBmaWxsPSIjMzMzIi8+Cjx0ZXh0IHg9Ijc1IiB5PSI3NSIgZmlsbD0iI2ZmZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSI+VmlkZW88L3RleHQ+Cjwvc3ZnPg=='
    };
  }

  private static async processCodeFile(file: File): Promise<string> {
    const text = await this.processTextFile(file);
    const extension = this.getFileExtension(file.name);
    const language = this.getLanguageFromExtension(extension);
    
    return `[Code File: ${file.name}]\nLanguage: ${language}\nLines: ${text.split('\n').length}\nSize: ${file.size} bytes\n\n${text}`;
  }

  private static getLanguageFromExtension(extension: string): string {
    const languageMap: Record<string, string> = {
      '.js': 'JavaScript',
      '.ts': 'TypeScript',
      '.jsx': 'React JSX',
      '.tsx': 'React TSX',
      '.py': 'Python',
      '.java': 'Java',
      '.cpp': 'C++',
      '.c': 'C',
      '.html': 'HTML',
      '.css': 'CSS',
      '.json': 'JSON',
      '.xml': 'XML',
      '.yaml': 'YAML',
      '.yml': 'YAML'
    };
    return languageMap[extension] || 'Unknown';
  }

  private static async processArchiveFile(file: File): Promise<string> {
    // Simulate archive analysis
    return `[Archive File: ${file.name}]\n\nThis is simulated archive analysis. In a real implementation, you would use libraries like JSZip to extract and analyze archive contents.\n\nFile size: ${file.size} bytes\nType: ${file.type}`;
  }

  private static async processGenericFile(file: File): Promise<string> {
    try {
      // Try to read as text first
      const text = await this.processTextFile(file);
      return `[Generic File: ${file.name}]\n\n${text}`;
    } catch {
      return `[Binary File: ${file.name}]\n\nThis appears to be a binary file that cannot be processed as text.\nFile size: ${file.size} bytes\nType: ${file.type}`;
    }
  }

  // Extract individual notes from file content
  static extractNotesFromContent(content: string, fileName: string): Array<{title: string, content: string}> {
    const notes: Array<{title: string, content: string}> = [];
    
    // Method 1: Split by markdown headers (# ## ###)
    const headerMatches = content.match(/^#{1,6}\s+(.+)$/gm);
    if (headerMatches && headerMatches.length > 1) {
      const sections = content.split(/^#{1,6}\s+/gm);
      for (let i = 1; i < sections.length; i++) {
        const headerMatch = headerMatches[i - 1];
        const title = headerMatch.replace(/^#{1,6}\s+/, '').trim();
        const sectionContent = sections[i].trim();
        if (sectionContent.length > 10) {
          notes.push({ title, content: sectionContent });
        }
      }
      return notes;
    }
    
    // Method 2: Split by numbered sections (1. 2. 3.)
    const numberedSections = content.split(/^\d+\.\s+/gm);
    if (numberedSections.length > 2) {
      for (let i = 1; i < numberedSections.length; i++) {
        const sectionContent = numberedSections[i].trim();
        const firstLine = sectionContent.split('\n')[0];
        const title = firstLine.length > 50 ? firstLine.substring(0, 50) + '...' : firstLine;
        if (sectionContent.length > 20) {
          notes.push({ 
            title: title || `Section ${i}`,
            content: sectionContent 
          });
        }
      }
      return notes;
    }
    
    // Method 3: Split by double line breaks (paragraphs)
    const paragraphs = content.split(/\n\s*\n/).filter(p => p.trim().length > 50);
    if (paragraphs.length > 1) {
      paragraphs.forEach((paragraph, index) => {
        const firstLine = paragraph.trim().split('\n')[0];
        const title = firstLine.length > 50 ? firstLine.substring(0, 50) + '...' : firstLine;
        notes.push({
          title: title || `Note ${index + 1} from ${fileName}`,
          content: paragraph.trim()
        });
      });
      return notes;
    }
    
    // Method 4: Split by bullet points or dashes
    const bulletSections = content.split(/^[-*•]\s+/gm);
    if (bulletSections.length > 2) {
      for (let i = 1; i < bulletSections.length; i++) {
        const sectionContent = bulletSections[i].trim();
        const firstLine = sectionContent.split('\n')[0];
        const title = firstLine.length > 50 ? firstLine.substring(0, 50) + '...' : firstLine;
        if (sectionContent.length > 20) {
          notes.push({ 
            title: title || `Item ${i}`,
            content: sectionContent 
          });
        }
      }
      return notes;
    }
    
    // Method 5: For CSV/Excel - each row as a note
    if (content.includes('Row 1:') || content.includes('Columns:')) {
      const rowMatches = content.match(/Row \d+: (.+)/g);
      if (rowMatches && rowMatches.length > 1) {
        rowMatches.forEach((row, index) => {
          const rowContent = row.replace(/Row \d+: /, '');
          try {
            const parsedRow = JSON.parse(rowContent);
            const title = Object.values(parsedRow)[0] as string || `Row ${index + 1}`;
            notes.push({
              title: title.toString().substring(0, 50),
              content: Object.entries(parsedRow)
                .map(([key, value]) => `${key}: ${value}`)
                .join('\n')
            });
          } catch {
            notes.push({
              title: `Row ${index + 1}`,
              content: rowContent
            });
          }
        });
        return notes;
      }
    }
    
    // Fallback: Split long content into chunks
    if (content.length > 1000) {
      const chunkSize = 800;
      const chunks = [];
      for (let i = 0; i < content.length; i += chunkSize) {
        chunks.push(content.substring(i, i + chunkSize));
      }
      
      chunks.forEach((chunk, index) => {
        const firstLine = chunk.trim().split('\n')[0];
        const title = firstLine.length > 50 ? firstLine.substring(0, 50) + '...' : firstLine;
        notes.push({
          title: title || `Part ${index + 1} from ${fileName}`,
          content: chunk.trim()
        });
      });
      return notes;
    }
    
    // Return single note if no structure found
    return [{
      title: fileName.replace(/\.[^/.]+$/, '') || 'Extracted Content',
      content: content
    }];
  }

  // Create multiple notes from extracted content within files
  static createNotesFromProcessedFile(processedFile: ProcessedFile, category: string = 'Uploads'): Note[] {
    const extractedNotes = this.extractNotesFromContent(processedFile.content, processedFile.name);
    if (!extractedNotes || extractedNotes.length === 0) {
      // No notes found, return empty array
      return [];
    }
    const now = new Date();
    const noteType = this.mapFileTypeToNoteType(processedFile.type);
    const baseFileName = processedFile.name.replace(/\.[^/.]+$/, '');
    
    return extractedNotes.map((extractedNote, index) => {
      const noteId = `file_${Date.now()}_${index}_${Math.random().toString(36).substr(2, 9)}`;
      
      return {
        id: noteId,
        title: extractedNote.title,
        content: extractedNote.content,
        type: noteType,
        tags: [
          processedFile.type, 
          'uploaded', 
          'extracted',
          baseFileName.toLowerCase().replace(/\s+/g, '-'),
          ...this.generateSmartTags(processedFile)
        ],
        category,
        createdAt: now,
        updatedAt: now,
        summary: this.generateSummary({ ...processedFile, content: extractedNote.content }),
        transcription: processedFile.type === 'audio' || processedFile.type === 'video' ? processedFile.extractedText : undefined,
        isStarred: false,
        fileUrl: processedFile.metadata?.thumbnail || undefined,
        duration: processedFile.metadata?.duration,
        // Add source file information
        sourceFile: processedFile.name,
        extractedFrom: `${baseFileName} (${extractedNotes.length > 1 ? `${index + 1} of ${extractedNotes.length}` : 'single note'})`
      };
    });
  }

  static createNoteFromProcessedFile(processedFile: ProcessedFile, category: string = 'Uploads'): Note {
    const now = new Date();
    const noteType = this.mapFileTypeToNoteType(processedFile.type);
    
    return {
      id: `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: processedFile.name,
      content: processedFile.content,
      type: noteType,
      tags: [processedFile.type, 'uploaded', ...this.generateSmartTags(processedFile)],
      category,
      createdAt: now,
      updatedAt: now,
      summary: this.generateSummary(processedFile),
      transcription: processedFile.type === 'audio' || processedFile.type === 'video' ? processedFile.extractedText : undefined,
      isStarred: false,
      fileUrl: processedFile.metadata?.thumbnail || undefined,
      duration: processedFile.metadata?.duration
    };
  }

  private static mapFileTypeToNoteType(fileType: string): Note['type'] {
    const typeMap: Record<string, Note['type']> = {
      'text': 'text',
      'document': 'document',
      'spreadsheet': 'document',
      'presentation': 'document',
      'code': 'text',
      'image': 'image',
      'audio': 'audio',
      'video': 'video'
    };
    return typeMap[fileType] || 'document';
  }

  private static generateSmartTags(processedFile: ProcessedFile): string[] {
    const tags: string[] = [];
    const content = processedFile.content.toLowerCase();
    
    // Add size-based tags
    if (processedFile.size > 10 * 1024 * 1024) tags.push('large-file');
    if (processedFile.size < 1024) tags.push('small-file');
    
    // Add content-based tags
    if (content.includes('meeting') || content.includes('agenda')) tags.push('meeting');
    if (content.includes('project') || content.includes('task')) tags.push('project');
    if (content.includes('research') || content.includes('study')) tags.push('research');
    if (content.includes('report') || content.includes('analysis')) tags.push('report');
    if (content.includes('presentation') || content.includes('slide')) tags.push('presentation');
    
    return tags;
  }

  private static generateSummary(processedFile: ProcessedFile): string {
    const content = processedFile.content;
    if (content.length <= 200) return content;
    
    // Simple extractive summary - take first 150 characters
    const summary = content.substring(0, 150).trim();
    return summary + (summary.length < content.length ? '...' : '');
  }
}
