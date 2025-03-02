
import { Batch, School, ApprovalStatus, Student, User, Skill } from "./types";

// Predefined skills
export const SKILLS: Skill[] = [
  { id: "s1", name: "React" },
  { id: "s2", name: "Flutter" },
  { id: "s3", name: "AWS" },
  { id: "s4", name: "Docker" },
  { id: "s5", name: "Node.js" },
  { id: "s6", name: "TypeScript" },
  { id: "s7", name: "JavaScript" },
  { id: "s8", name: "Python" },
  { id: "s9", name: "UI/UX" },
  { id: "s10", name: "Figma" },
  { id: "s11", name: "Adobe XD" },
  { id: "s12", name: "SEO" },
  { id: "s13", name: "Content Marketing" },
  { id: "s14", name: "Social Media" },
  { id: "s15", name: "SEM" },
  { id: "s16", name: "Analytics" },
];

// Mock admin user
export const USERS: User[] = [
  {
    id: "u1",
    username: "admin",
    password: "admin@1234",
    isAdmin: true,
  },
];

// Mock students
export const STUDENTS: Student[] = [
  {
    id: "1",
    name: "Alex Johnson",
    batch: Batch.C4,
    school: School.Coding,
    skills: [SKILLS[0], SKILLS[2], SKILLS[4], SKILLS[5]],
    yearsOfExperience: 3,
    linkedinUrl: "https://linkedin.com/in/alexjohnson",
    resumeUrl: "/resumes/alex_johnson_resume.pdf",
    status: ApprovalStatus.Approved,
    createdAt: new Date(2023, 5, 15),
  },
  {
    id: "2",
    name: "Sarah Williams",
    batch: Batch.C3,
    school: School.Coding,
    skills: [SKILLS[0], SKILLS[1], SKILLS[5], SKILLS[6]],
    yearsOfExperience: 2,
    linkedinUrl: "https://linkedin.com/in/sarahwilliams",
    resumeUrl: "/resumes/sarah_williams_resume.pdf",
    status: ApprovalStatus.Approved,
    createdAt: new Date(2023, 6, 20),
  },
  {
    id: "3",
    name: "Michael Chen",
    batch: Batch.M3,
    school: School.Marketing,
    skills: [SKILLS[12], SKILLS[13], SKILLS[14], SKILLS[15]],
    yearsOfExperience: 4,
    linkedinUrl: "https://linkedin.com/in/michaelchen",
    resumeUrl: "/resumes/michael_chen_resume.pdf",
    status: ApprovalStatus.Approved,
    createdAt: new Date(2023, 4, 10),
  },
  {
    id: "4",
    name: "Emily Davis",
    batch: Batch.D2,
    school: School.Design,
    skills: [SKILLS[8], SKILLS[9], SKILLS[10]],
    yearsOfExperience: 2,
    linkedinUrl: "https://linkedin.com/in/emilydavis",
    resumeUrl: "/resumes/emily_davis_resume.pdf",
    status: ApprovalStatus.Approved,
    createdAt: new Date(2023, 7, 5),
  },
  {
    id: "5",
    name: "David Wilson",
    batch: Batch.C4,
    school: School.Coding,
    skills: [SKILLS[0], SKILLS[2], SKILLS[3], SKILLS[7]],
    yearsOfExperience: 3,
    linkedinUrl: "https://linkedin.com/in/davidwilson",
    resumeUrl: "/resumes/david_wilson_resume.pdf",
    status: ApprovalStatus.Pending,
    createdAt: new Date(2023, 8, 12),
  },
  {
    id: "6",
    name: "Jessica Brown",
    batch: Batch.M2,
    school: School.Marketing,
    skills: [SKILLS[12], SKILLS[13], SKILLS[15]],
    yearsOfExperience: 1,
    linkedinUrl: "https://linkedin.com/in/jessicabrown",
    resumeUrl: "/resumes/jessica_brown_resume.pdf",
    status: ApprovalStatus.Pending,
    createdAt: new Date(2023, 8, 15),
  },
  {
    id: "7",
    name: "Ryan Taylor",
    batch: Batch.D1,
    school: School.Design,
    skills: [SKILLS[8], SKILLS[9]],
    yearsOfExperience: 2,
    linkedinUrl: "https://linkedin.com/in/ryantaylor",
    resumeUrl: "/resumes/ryan_taylor_resume.pdf",
    status: ApprovalStatus.Rejected,
    createdAt: new Date(2023, 7, 28),
  },
  {
    id: "8",
    name: "Olivia Martinez",
    batch: Batch.C3,
    school: School.Coding,
    skills: [SKILLS[0], SKILLS[4], SKILLS[5], SKILLS[6]],
    yearsOfExperience: 1,
    linkedinUrl: "https://linkedin.com/in/oliviamartinez",
    resumeUrl: "/resumes/olivia_martinez_resume.pdf",
    status: ApprovalStatus.Approved,
    createdAt: new Date(2023, 6, 10),
  },
];

// Local storage keys
export const STORAGE_KEYS = {
  STUDENTS: "haca_students",
  USERS: "haca_users",
  CURRENT_USER: "haca_current_user",
};

// Initialize local storage with mock data
export const initializeLocalStorage = () => {
  if (!localStorage.getItem(STORAGE_KEYS.STUDENTS)) {
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(STUDENTS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(USERS));
  }
};

// Helper functions to work with localStorage
export const getStudents = (): Student[] => {
  const studentsData = localStorage.getItem(STORAGE_KEYS.STUDENTS);
  return studentsData ? JSON.parse(studentsData) : [];
};

export const saveStudents = (students: Student[]) => {
  localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
};

export const getCurrentUser = (): User | null => {
  const userData = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
  return userData ? JSON.parse(userData) : null;
};

export const saveCurrentUser = (user: User | null) => {
  if (user) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
  } else {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  }
};

// Helper for authentication
export const authenticateUser = (username: string, password: string): User | null => {
  const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || "[]") as User[];
  return users.find(user => user.username === username && user.password === password) || null;
};

export const logout = () => {
  localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
};

// Helper to filter students
export const getApprovedStudents = (): Student[] => {
  return getStudents().filter(student => student.status === ApprovalStatus.Approved);
};

export const getPendingStudents = (): Student[] => {
  return getStudents().filter(student => student.status === ApprovalStatus.Pending);
};

// Simulate Gemini API natural language search
export const searchStudents = (query: string): Student[] => {
  const lowerQuery = query.toLowerCase();
  const students = getApprovedStudents();

  // Extract what might be in the query
  const hasBatch = Object.values(Batch).some(batch => lowerQuery.includes(batch.toLowerCase()));
  const hasSchool = Object.values(School).some(school => lowerQuery.includes(school.toLowerCase()));
  const hasSkills = SKILLS.filter(skill => lowerQuery.includes(skill.name.toLowerCase()));

  // Score each student based on the query
  const scoredStudents = students.map(student => {
    let score = 0;
    
    // Match batch
    if (hasBatch && lowerQuery.includes(student.batch.toLowerCase())) {
      score += 10;
    }
    
    // Match school
    if (hasSchool && lowerQuery.includes(student.school.toLowerCase())) {
      score += 10;
    }
    
    // Match skills
    const matchedSkills = student.skills.filter(skill => 
      hasSkills.some(querySkill => querySkill.name === skill.name)
    );
    score += matchedSkills.length * 5;
    
    // Experience bonus (1 point per year)
    score += student.yearsOfExperience;
    
    return { student, score };
  });
  
  // Filter students with some relevance and sort by score
  return scoredStudents
    .filter(item => item.score > 0)
    .sort((a, b) => {
      // First sort by experience
      if (a.student.yearsOfExperience !== b.student.yearsOfExperience) {
        return b.student.yearsOfExperience - a.student.yearsOfExperience;
      }
      // If experience is the same, sort by skill matches
      return b.score - a.score;
    })
    .map(item => item.student);
};

// Helper to update student status
export const updateStudentStatus = (id: string, status: ApprovalStatus): void => {
  const students = getStudents();
  const updatedStudents = students.map(student => 
    student.id === id ? { ...student, status } : student
  );
  saveStudents(updatedStudents);
};

// Helper to add a new student
export const addStudent = (student: Omit<Student, 'id' | 'createdAt' | 'status'>): Student => {
  const students = getStudents();
  const newStudent: Student = {
    ...student,
    id: `${Date.now()}`,
    createdAt: new Date(),
    status: ApprovalStatus.Pending
  };
  
  saveStudents([...students, newStudent]);
  return newStudent;
};
