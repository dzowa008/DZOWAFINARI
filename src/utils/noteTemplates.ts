// Smart Note Templates for Better Structure and Readability

export interface NoteTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  template: string;
  tags: string[];
}

export const noteTemplates: NoteTemplate[] = [
  {
    id: 'meeting',
    name: '📅 Meeting Notes',
    description: 'Structured template for meeting notes',
    category: 'Work',
    template: `# Meeting Notes - [Meeting Title]

## 📋 Meeting Details
- **Date:** ${new Date().toLocaleDateString()}
- **Time:** [Start Time] - [End Time]
- **Attendees:** [List attendees]
- **Location/Platform:** [Location or video platform]

## 🎯 Agenda
1. [Agenda item 1]
2. [Agenda item 2]
3. [Agenda item 3]

## 📝 Discussion Points

### [Topic 1]
- Key points discussed
- Decisions made
- Concerns raised

### [Topic 2]
- Key points discussed
- Decisions made
- Concerns raised

## ✅ Action Items
- [ ] [Action item 1] - **Assigned to:** [Name] - **Due:** [Date]
- [ ] [Action item 2] - **Assigned to:** [Name] - **Due:** [Date]
- [ ] [Action item 3] - **Assigned to:** [Name] - **Due:** [Date]

## 📌 Key Decisions
1. [Decision 1]
2. [Decision 2]
3. [Decision 3]

## 🔄 Next Steps
- [Next step 1]
- [Next step 2]
- [Next step 3]

---
*Meeting notes created on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}*`,
    tags: ['meeting', 'work', 'notes', 'agenda']
  },
  
  {
    id: 'project',
    name: '🚀 Project Planning',
    description: 'Comprehensive project planning template',
    category: 'Work',
    template: `# 🚀 Project: [Project Name]

## 📊 Project Overview
- **Project Manager:** [Name]
- **Start Date:** [Date]
- **End Date:** [Date]
- **Status:** [Planning/In Progress/On Hold/Completed]
- **Priority:** [High/Medium/Low]

## 🎯 Project Goals
### Primary Objectives
1. [Objective 1]
2. [Objective 2]
3. [Objective 3]

### Success Metrics
- [Metric 1]: [Target]
- [Metric 2]: [Target]
- [Metric 3]: [Target]

## 👥 Team & Stakeholders
### Core Team
- **[Role]:** [Name] - [Contact]
- **[Role]:** [Name] - [Contact]
- **[Role]:** [Name] - [Contact]

### Stakeholders
- **[Stakeholder]:** [Name] - [Interest/Influence]

## 📋 Project Phases

### Phase 1: [Phase Name]
- **Duration:** [Timeline]
- **Deliverables:**
  - [Deliverable 1]
  - [Deliverable 2]
- **Key Tasks:**
  - [ ] [Task 1]
  - [ ] [Task 2]

### Phase 2: [Phase Name]
- **Duration:** [Timeline]
- **Deliverables:**
  - [Deliverable 1]
  - [Deliverable 2]
- **Key Tasks:**
  - [ ] [Task 1]
  - [ ] [Task 2]

## ⚠️ Risks & Mitigation
| Risk | Impact | Probability | Mitigation Strategy |
|------|--------|-------------|-------------------|
| [Risk 1] | [High/Med/Low] | [High/Med/Low] | [Strategy] |
| [Risk 2] | [High/Med/Low] | [High/Med/Low] | [Strategy] |

## 📈 Progress Tracking
- **Overall Progress:** [X]%
- **Current Phase:** [Phase Name]
- **Next Milestone:** [Milestone] - [Date]

## 📝 Notes & Updates
[Add project updates, changes, and important notes here]

---
*Project plan created on ${new Date().toLocaleDateString()}*`,
    tags: ['project', 'planning', 'work', 'management']
  },

  {
    id: 'research',
    name: '🔬 Research Notes',
    description: 'Academic and professional research template',
    category: 'Research',
    template: `# 🔬 Research: [Research Topic]

## 📚 Research Overview
- **Research Question:** [Main question being investigated]
- **Hypothesis:** [If applicable]
- **Research Type:** [Qualitative/Quantitative/Mixed]
- **Date Started:** ${new Date().toLocaleDateString()}

## 🎯 Objectives
1. [Primary objective]
2. [Secondary objective]
3. [Additional objective]

## 📖 Literature Review

### Key Sources
1. **[Author, Year]** - "[Title]"
   - **Key Findings:** [Summary]
   - **Relevance:** [How it relates to your research]
   - **Citation:** [Full citation]

2. **[Author, Year]** - "[Title]"
   - **Key Findings:** [Summary]
   - **Relevance:** [How it relates to your research]
   - **Citation:** [Full citation]

### Research Gaps
- [Gap 1]: [Description]
- [Gap 2]: [Description]

## 🔍 Methodology
- **Approach:** [Description of research approach]
- **Data Collection:** [Methods used]
- **Sample Size:** [If applicable]
- **Tools/Software:** [Research tools used]

## 📊 Findings & Analysis

### Key Findings
1. **[Finding 1]**
   - Evidence: [Supporting data/quotes]
   - Analysis: [Your interpretation]

2. **[Finding 2]**
   - Evidence: [Supporting data/quotes]
   - Analysis: [Your interpretation]

### Patterns & Themes
- **Theme 1:** [Description]
- **Theme 2:** [Description]
- **Theme 3:** [Description]

## 💡 Insights & Implications
- [Insight 1]
- [Insight 2]
- [Insight 3]

## 🔄 Next Steps
- [ ] [Next research step]
- [ ] [Analysis to complete]
- [ ] [Additional sources to review]

## 📝 Reflections
[Personal thoughts, challenges encountered, lessons learned]

---
*Research notes updated on ${new Date().toLocaleDateString()}*`,
    tags: ['research', 'academic', 'analysis', 'study']
  },

  {
    id: 'learning',
    name: '📚 Learning Notes',
    description: 'Structured learning and study template',
    category: 'Personal',
    template: `# 📚 Learning: [Topic/Course Name]

## 📋 Learning Overview
- **Subject:** [Main subject area]
- **Source:** [Book/Course/Video/Article]
- **Instructor/Author:** [Name]
- **Date:** ${new Date().toLocaleDateString()}
- **Difficulty:** [Beginner/Intermediate/Advanced]

## 🎯 Learning Objectives
By the end of this session, I will be able to:
1. [Objective 1]
2. [Objective 2]
3. [Objective 3]

## 📖 Key Concepts

### Concept 1: [Name]
- **Definition:** [Clear definition]
- **Example:** [Practical example]
- **Why it matters:** [Importance/application]

### Concept 2: [Name]
- **Definition:** [Clear definition]
- **Example:** [Practical example]
- **Why it matters:** [Importance/application]

## 💡 Key Takeaways
1. **[Takeaway 1]** - [Explanation]
2. **[Takeaway 2]** - [Explanation]
3. **[Takeaway 3]** - [Explanation]

## 🔗 Connections
- **Relates to:** [Previous knowledge/concepts]
- **Builds on:** [Foundation concepts]
- **Leads to:** [Next topics to explore]

## ❓ Questions & Clarifications
- [ ] [Question 1]
- [ ] [Question 2]
- [ ] [Question 3]

## 🎯 Practice & Application
### Exercises Completed
- [Exercise 1]: [Result/Learning]
- [Exercise 2]: [Result/Learning]

### Real-world Applications
- [Application 1]: [How to use this knowledge]
- [Application 2]: [How to use this knowledge]

## 📝 Summary
[Write a brief summary of what you learned in your own words]

## 🔄 Next Steps
- [ ] [Review specific concepts]
- [ ] [Practice exercises]
- [ ] [Explore related topics]

---
*Learning notes created on ${new Date().toLocaleDateString()}*`,
    tags: ['learning', 'study', 'education', 'notes']
  },

  {
    id: 'daily',
    name: '📅 Daily Journal',
    description: 'Daily reflection and planning template',
    category: 'Personal',
    template: `# 📅 Daily Journal - ${new Date().toLocaleDateString()}

## 🌅 Morning Reflection
- **Mood:** [How are you feeling?]
- **Energy Level:** [1-10]
- **Today's Focus:** [Main priority]

## 🎯 Today's Goals
### Must Do (Priority 1)
- [ ] [Critical task 1]
- [ ] [Critical task 2]
- [ ] [Critical task 3]

### Should Do (Priority 2)
- [ ] [Important task 1]
- [ ] [Important task 2]

### Could Do (Priority 3)
- [ ] [Nice to have task 1]
- [ ] [Nice to have task 2]

## 📝 Daily Events & Activities
### Work/Professional
- [Activity/meeting/task]
- [Activity/meeting/task]

### Personal
- [Activity/event]
- [Activity/event]

## 💡 Insights & Learning
- **What I learned today:** [New knowledge/skill]
- **Interesting observation:** [Something noteworthy]
- **Challenge faced:** [Problem encountered]
- **How I solved it:** [Solution/approach]

## 🙏 Gratitude
Three things I'm grateful for today:
1. [Gratitude 1]
2. [Gratitude 2]
3. [Gratitude 3]

## 🌙 Evening Reflection
- **Accomplishments:** [What went well]
- **Challenges:** [What was difficult]
- **Lessons learned:** [Key insights]
- **Tomorrow's priority:** [Main focus for tomorrow]

## 📊 Daily Metrics
- **Productivity:** [1-10]
- **Happiness:** [1-10]
- **Stress Level:** [1-10]
- **Health/Wellness:** [1-10]

---
*Journal entry for ${new Date().toLocaleDateString()}*`,
    tags: ['journal', 'daily', 'reflection', 'personal']
  }
];

export const getTemplateByCategory = (category: string): NoteTemplate[] => {
  return noteTemplates.filter(template => 
    template.category.toLowerCase() === category.toLowerCase()
  );
};

export const getTemplateById = (id: string): NoteTemplate | undefined => {
  return noteTemplates.find(template => template.id === id);
};

export const suggestTemplate = (title: string, content: string): NoteTemplate | null => {
  const text = (title + ' ' + content).toLowerCase();
  
  // Meeting detection
  if (text.includes('meeting') || text.includes('agenda') || text.includes('attendees')) {
    return getTemplateById('meeting') || null;
  }
  
  // Project detection
  if (text.includes('project') || text.includes('planning') || text.includes('milestone')) {
    return getTemplateById('project') || null;
  }
  
  // Research detection
  if (text.includes('research') || text.includes('study') || text.includes('analysis')) {
    return getTemplateById('research') || null;
  }
  
  // Learning detection
  if (text.includes('learn') || text.includes('course') || text.includes('tutorial')) {
    return getTemplateById('learning') || null;
  }
  
  // Daily journal detection
  if (text.includes('daily') || text.includes('journal') || text.includes('reflection')) {
    return getTemplateById('daily') || null;
  }
  
  return null;
};
