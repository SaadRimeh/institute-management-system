export interface Phone {
  number: string;
  label: string;
}

export interface User {
  id: string;
  _id?: string;
  fullName: string;
  role: 'admin' | 'teacher' | 'student';
  primaryContact: string;
  phones: Phone[];
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Course {
  id: string;
  _id?: string;
  name: string;
  code: string;
  description?: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  type: 'online' | 'offline';
  price: number;
  teacherCompensation: number;
  schedule?: string;
  durationWeeks?: number;
  teacher?: User | string;
  isActive: boolean;
  createdAt?: string;
}

export interface Enrollment {
  id: string;
  _id?: string;
  student: User | string;
  course: Course | string;
  totalAmount: number;
  paidAmount: number;
  remainingBalance: number;
  status?: string;
  createdAt?: string;
}

export interface Payment {
  id: string;
  _id?: string;
  student?: User | string;
  teacher?: User | string;
  course?: Course | string;
  amount: number;
  kind: 'student_payment' | 'teacher_salary';
  note?: string;
  createdAt?: string;
}

export interface Attendance {
  id: string;
  _id?: string;
  student: User | string;
  teacher: User | string;
  course: Course | string;
  date: string;
  status: 'present' | 'absent' | 'late' | 'excused';
}

export interface Grade {
  id: string;
  _id?: string;
  student: User | string;
  teacher: User | string;
  course: Course | string;
  title: string;
  score: number;
  maxScore: number;
  examDate?: string;
}

export interface NotificationItem {
  id: string;
  _id?: string;
  title: string;
  message: string;
  targetType: 'student' | 'teacher' | 'group' | 'all';
  targetUser?: string;
  course?: string;
  sender?: User | string;
  createdAt?: string;
}

export interface DashboardStats {
  totalUsers?: number;
  totalStudents: number;
  totalTeachers: number;
  totalCourses: number;
  totalEnrollments: number;
  studentPayments: number;
  teacherPayments: number;
  remainingBalance: number;
}

export interface DashboardData {
  stats: DashboardStats;
  recentAttendances: Attendance[];
  recentGrades: Grade[];
  recentNotifications: any[];
}
