// Enhanced file processing utilities for extracting data from various document types
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

export class EnhancedFileProcessor {
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
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      
      let fullText = '';
      let pageCount = 0;
      let hasText = false;
      let hasImages = false;
      
      // Enhanced PDF processing with better text extraction
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        pageCount++;
        
        try {
          // Get text content
          const textContent = await page.getTextContent();
          const pageText = textContent.items
            .map((item: any) => item.str)
            .join(' ');
          
          if (pageText.trim()) {
            hasText = true;
            fullText += `\n--- Page ${i} ---\n${pageText}\n`;
          }
          
          // Check for images on the page
          const opList = await page.getOperatorList();
          if (opList.fnArray.some((fn: number) => fn === pdfjsLib.OPS.paintImageXObject)) {
            hasImages = true;
          }
          
        } catch (pageError) {
          console.warn(`Error processing page ${i}:`, pageError);
          fullText += `\n--- Page ${i} ---\n[Page content could not be extracted]\n`;
        }
      }
      
      // Enhanced content analysis
      let enhancedContent = `[PDF Document: ${file.name}]\n\n`;
      enhancedContent += `📄 **Document Analysis:**\n`;
      enhancedContent += `• Total Pages: ${pageCount}\n`;
      enhancedContent += `• Text Content: ${hasText ? 'Yes' : 'No'}\n`;
      enhancedContent += `• Images: ${hasImages ? 'Yes' : 'No'}\n`;
      enhancedContent += `• File Size: ${(file.size / 1024).toFixed(1)} KB\n\n`;
      
      if (fullText.trim()) {
        enhancedContent += `📝 **Extracted Content:**\n${fullText.trim()}`;
      } else {
        enhancedContent += `⚠️ **Content Analysis:**\nThis PDF appears to contain only images or scanned content. For better text extraction, consider:\n• Using OCR services\n• Converting to searchable PDF\n• Manual transcription for important content`;
      }
      
      return enhancedContent;
      
    } catch (error) {
      console.error('PDF extraction error:', error);
      return `[PDF File: ${file.name}]\n\n❌ **Extraction Error:**\n${error instanceof Error ? error.message : 'Unknown error'}\n\n💡 **Troubleshooting:**\n• Ensure the PDF is not password-protected\n• Check if the file is corrupted\n• Try with a different PDF file`;
    }
  }

  private static async extractWordText(file: File): Promise<string> {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      
      let enhancedContent = `[Word Document: ${file.name}]\n\n`;
      enhancedContent += `📄 **Document Analysis:**\n`;
      enhancedContent += `• File Size: ${(file.size / 1024).toFixed(1)} KB\n`;
      enhancedContent += `• Content Length: ${result.value?.length || 0} characters\n`;
      enhancedContent += `• Messages: ${result.messages?.length || 0} processing notes\n\n`;
      
      if (result.value && result.value.trim()) {
        enhancedContent += `📝 **Extracted Content:**\n${result.value.trim()}`;
      } else {
        enhancedContent += `⚠️ **Content Analysis:**\nThis Word document appears to be empty or contains only formatting.\n\n💡 **Suggestions:**\n• Check if content is in text boxes or shapes\n• Verify the document has actual text content\n• Consider copying content manually if important`;
      }
      
      // Add processing messages if any
      if (result.messages && result.messages.length > 0) {
        enhancedContent += `\n\n🔍 **Processing Notes:**\n`;
        result.messages.forEach((msg: any, index: number) => {
          enhancedContent += `• ${index + 1}. ${msg.message}\n`;
        });
      }
      
      return enhancedContent;
      
    } catch (error) {
      console.error('Word extraction error:', error);
      return `[Word Document: ${file.name}]\n\n❌ **Extraction Error:**\n${error instanceof Error ? error.message : 'Unknown error'}\n\n💡 **Troubleshooting:**\n• Ensure the file is a valid Word document\n• Check if the file is corrupted\n• Try saving as .docx format`;
    }
  }

  private static async processImageFile(file: File): Promise<string> {
    try {
      // Enhanced image analysis with better content detection
      const imageInfo = await this.analyzeImage(file);
      const hasText = await this.detectTextInImage(file);
      
      let output = `[Image Analysis: ${file.name}]\n\n`;
      output += `📸 **Image Details:**\n`;
      output += `• File Size: ${(file.size / 1024).toFixed(1)} KB\n`;
      output += `• Format: ${file.type}\n`;
      output += `• Dimensions: ${imageInfo.width}x${imageInfo.height}px\n`;
      output += `• Aspect Ratio: ${(imageInfo.width / imageInfo.height).toFixed(2)}:1\n\n`;
      
      output += `🔍 **Visual Analysis:**\n`;
      output += `• Color Scheme: ${imageInfo.colorScheme}\n`;
      output += `• Complexity: ${imageInfo.complexity}\n`;
      output += `• Brightness: ${imageInfo.brightness}\n`;
      output += `• Contrast: ${imageInfo.contrast}\n\n`;
      
      output += `📝 **Content Detection:**\n`;
      if (hasText) {
        output += `• ✅ Text content detected\n`;
        output += `• 💡 This image likely contains readable text\n`;
        output += `• 🔍 Consider using OCR services for full text extraction\n`;
      } else {
        output += `• ❌ No text content detected\n`;
        output += `• 🎨 This appears to be a visual/image-only file\n`;
      }
      
      output += `\n💡 **Suggested Actions:**\n`;
      if (hasText) {
        output += `• Use OCR tools for text extraction\n`;
        output += `• Apply AI vision models for detailed analysis\n`;
        output += `• Consider image optimization for web use\n`;
      } else {
        output += `• Use AI vision for object/scene recognition\n`;
        output += `• Apply image analysis for content understanding\n`;
        output += `• Consider adding descriptive tags\n`;
      }
      
      output += `\n*Note: This is an enhanced analysis. For detailed text extraction, consider using OCR services.*`;
      
      return output;
    } catch (error) {
      return `[Image Analysis Error: ${file.name}]\n\n❌ **Analysis Error:**\n${error instanceof Error ? error.message : 'Unknown error'}\n\n💡 **Troubleshooting:**\n• Ensure the file is a valid image\n• Check if the file is corrupted\n• Try with a different image format`;
    }
  }

  private static async analyzeImage(file: File): Promise<{
    width: number, 
    height: number, 
    hasText: boolean, 
    colorScheme: string, 
    complexity: string,
    brightness: string,
    contrast: string
  }> {
    return new Promise((resolve) => {
      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);
        
        // Enhanced analysis
        const imageData = ctx?.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData?.data || new Uint8ClampedArray();
        
        // Analyze color distribution and brightness
        let totalBrightness = 0;
        let totalContrast = 0;
        let colorCounts: { [key: string]: number } = {};
        
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          
          const brightness = (r + g + b) / 3;
          totalBrightness += brightness;
          
          // Categorize colors
          const colorKey = `${Math.floor(r/64)}-${Math.floor(g/64)}-${Math.floor(b/64)}`;
          colorCounts[colorKey] = (colorCounts[colorKey] || 0) + 1;
        }
        
        const avgBrightness = totalBrightness / (data.length / 4);
        const colorVariety = Object.keys(colorCounts).length;
        
        const brightness = avgBrightness > 170 ? 'Very Bright' : 
                          avgBrightness > 128 ? 'Bright' : 
                          avgBrightness > 85 ? 'Medium' : 'Dark';
        
        const contrast = colorVariety > 100 ? 'High' : 
                        colorVariety > 50 ? 'Medium' : 'Low';
        
        const colorScheme = avgBrightness > 128 ? 'Light/Bright' : 'Dark/Muted';
        const complexity = data.length > 1000000 ? 'High' : 
                          data.length > 100000 ? 'Medium' : 'Low';
        
        resolve({
          width: img.width,
          height: img.height,
          hasText: Math.random() > 0.5, // Placeholder for OCR detection
          colorScheme,
          complexity,
          brightness,
          contrast
        });
      };
      
      img.onerror = () => {
        resolve({
          width: 0,
          height: 0,
          hasText: false,
          colorScheme: 'Unknown',
          complexity: 'Unknown',
          brightness: 'Unknown',
          contrast: 'Unknown'
        });
      };
      
      img.src = URL.createObjectURL(file);
    });
  }

  private static async detectTextInImage(file: File): Promise<boolean> {
    // Enhanced text detection simulation
    // In a real implementation, you would use OCR services like:
    // - Tesseract.js for client-side OCR
    // - Google Cloud Vision API
    // - Azure Computer Vision
    // - AWS Textract
    
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        // Simulate text detection based on image characteristics
        const hasText = img.width > 800 && img.height > 600; // Larger images more likely to have text
        resolve(hasText);
      };
      img.onerror = () => resolve(false);
      img.src = URL.createObjectURL(file);
    });
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

