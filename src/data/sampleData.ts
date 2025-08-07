import { Note } from '../types';

export const sampleNotes: Note[] = [
  {
    id: '1',
    title: 'Meeting Notes - Q4 Planning',
    content: 'Discussed quarterly goals, budget allocation, and team expansion plans. Key decisions made regarding resource allocation and timeline adjustments.',
    type: 'text',
    tags: ['meeting', 'planning', 'Q4'],
    category: 'Work',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
    summary: 'Q4 planning meeting covering goals, budget, and team expansion with key decisions on resource allocation.',
    isStarred: true
  },
  {
    id: '2',
    title: 'Research Interview Audio',
    content: 'Audio recording of user interview session with key stakeholder discussing product feedback and feature requests.',
    type: 'audio',
    tags: ['research', 'interview', 'user-feedback'],
    category: 'Research',
    createdAt: new Date('2024-01-14'),
    updatedAt: new Date('2024-01-14'),
    transcription: 'User expressed satisfaction with current features but requested better search functionality and mobile app improvements.',
    summary: 'User interview revealing satisfaction with features and need for improved search and mobile experience.',
    isStarred: false
  },
  {
    id: '3',
    title: 'Product Demo Video',
    content: 'Screen recording of product demonstration showcasing new features and user workflows for stakeholder review.',
    type: 'video',
    tags: ['demo', 'product', 'presentation'],
    category: 'Marketing',
    createdAt: new Date('2024-01-13'),
    updatedAt: new Date('2024-01-13'),
    summary: 'Product demo showcasing key features and user workflows for stakeholder presentation.',
    isStarred: false
  },
  {
    id: '4',
    title: 'Technical Documentation',
    content: 'Comprehensive documentation for the new API endpoints and integration guidelines for third-party developers.',
    type: 'document',
    tags: ['documentation', 'api', 'technical'],
    category: 'Development',
    createdAt: new Date('2024-01-12'),
    updatedAt: new Date('2024-01-12'),
    summary: 'API documentation covering new endpoints and integration guidelines for developers.',
    isStarred: true
  },
  {
    id: '5',
    title: 'Weekly Team Standup',
    content: 'Team progress updates, blockers discussion, and sprint planning for the upcoming week.',
    type: 'text',
    tags: ['standup', 'team', 'agile'],
    category: 'Work',
    createdAt: new Date('2024-01-11'),
    updatedAt: new Date('2024-01-11'),
    summary: 'Weekly standup covering team progress, blockers, and sprint planning.',
    isStarred: false
  }
];