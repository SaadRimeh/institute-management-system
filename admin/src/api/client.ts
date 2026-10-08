import { Platform } from 'react-native';
import {
  Course,
  DashboardData,
  Enrollment,
  NotificationItem,
  Payment,
  User,
} from './types';

// Default backend URL: on Android emulator 10.0.2.2, on web/iOS localhost
const DEFAULT_URL = Platform.select({
  android: 'http://10.0.2.2:5000',
  default: 'http://localhost:5000',
});

let currentServerUrl = DEFAULT_URL;
let currentToken: string | null = null;

// Safe local storage helper
const getStored = (key: string): string | null => {
  if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
    return window.localStorage.getItem(key);
  }
  return null;
};

const setStored = (key: string, value: string | null) => {
  if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
    if (value === null) {
      window.localStorage.removeItem(key);
    } else {
      window.localStorage.setItem(key, value);
    }
  }
};

// Initialize from storage if available
if (typeof window !== 'undefined') {
  const savedUrl = getStored('ims_admin_server_url');
  if (savedUrl) currentServerUrl = savedUrl;
  const savedToken = getStored('ims_admin_token');
  if (savedToken) currentToken = savedToken;
}

export const getServerUrl = () => currentServerUrl;

export const setServerUrl = (url: string) => {
  currentServerUrl = url.trim().replace(/\/+$/, '');
  setStored('ims_admin_server_url', currentServerUrl);
};

export const getToken = () => currentToken;

export const setToken = (token: string | null) => {
  currentToken = token;
  setStored('ims_admin_token', token);
};

// Base request wrapper
async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ success: boolean; data?: T; message?: string; status: number }> {
  const url = `${currentServerUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (currentToken) {
    headers['Authorization'] = `Bearer ${currentToken}`;
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal,
    });
    clearTimeout(timeout);

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      return {
        success: false,
        message: data.message || `Request failed with status ${response.status}`,
        status: response.status,
      };
    }

    return {
      success: true,
      data: (data.data !== undefined ? data.data : data) as T,
      message: data.message,
      status: response.status,
    };
  } catch (err: any) {
    return {
      success: false,
      message: err.name === 'AbortError' ? 'انتهت مهلة الاتصال بالخادم' : (err.message || 'فشل الاتصال بالخادم'),
      status: 0,
    };
  }
}

// -------------------------------------------------------------
// Live API Methods
// -------------------------------------------------------------

export const api = {
  // Health & Ping
  async checkHealth(): Promise<{ ok: boolean; latency: number; data?: any; error?: string }> {
    const start = Date.now();
    try {
      const res = await request<{ status: string; environment: string }>('/health');
      const latency = Date.now() - start;
      if (res.success) {
        return { ok: true, latency, data: res.data };
      }
      return { ok: false, latency, error: res.message };
    } catch (e: any) {
      return { ok: false, latency: Date.now() - start, error: e.message };
    }
  },

  // Auth
  async login(loginCode: string, identifier?: string) {
    const res = await request<{ token: string; user: User }>('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        loginCode,
        ...(identifier ? { identifier } : {}),
      }),
    });

    if (res.success && res.data?.token) {
      setToken(res.data.token);
    }
    return res;
  },

  async getMe() {
    return request<User>('/api/v1/auth/me');
  },

  logout() {
    setToken(null);
  },

  // Dashboard
  async getDashboard() {
    return request<DashboardData>('/api/v1/admin/dashboard');
  },

  // Students
  async getStudents(search?: string) {
    const query = search ? `?search=${encodeURIComponent(search)}` : '';
    return request<User[]>(`/api/v1/admin/students${query}`);
  },

  async createStudent(payload: {
    fullName: string;
    primaryContact: string;
    phones?: { number: string; label: string }[];
    loginCode?: string;
  }) {
    return request<User>('/api/v1/admin/students', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async updateStudent(id: string, payload: Partial<User>) {
    return request<User>(`/api/v1/admin/students/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  async deleteStudent(id: string) {
    return request(`/api/v1/admin/students/${id}`, {
      method: 'DELETE',
    });
  },

  // Teachers
  async getTeachers(search?: string) {
    const query = search ? `?search=${encodeURIComponent(search)}` : '';
    return request<User[]>(`/api/v1/admin/teachers${query}`);
  },

  async createTeacher(payload: {
    fullName: string;
    primaryContact: string;
    phones?: { number: string; label: string }[];
    loginCode?: string;
  }) {
    return request<User>('/api/v1/admin/teachers', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async updateTeacher(id: string, payload: Partial<User>) {
    return request<User>(`/api/v1/admin/teachers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  async deleteTeacher(id: string) {
    return request(`/api/v1/admin/teachers/${id}`, {
      method: 'DELETE',
    });
  },

  // Courses
  async getCourses() {
    return request<Course[]>('/api/v1/admin/courses');
  },

  async createCourse(payload: {
    name: string;
    code: string;
    level: string;
    type: string;
    price: number;
    teacherCompensation: number;
    schedule?: string;
    durationWeeks?: number;
    teacher?: string;
  }) {
    return request<Course>('/api/v1/admin/courses', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async updateCourse(id: string, payload: Partial<Course>) {
    return request<Course>(`/api/v1/admin/courses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  async deleteCourse(id: string) {
    return request(`/api/v1/admin/courses/${id}`, {
      method: 'DELETE',
    });
  },

  // Enrollments
  async createEnrollment(payload: {
    studentId: string;
    courseId: string;
    totalAmount?: number;
  }) {
    return request<Enrollment>('/api/v1/admin/enrollments', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  // Payments
  async createStudentPayment(payload: {
    studentId: string;
    courseId: string;
    amount: number;
    note?: string;
  }) {
    return request<Payment>('/api/v1/admin/payments', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async getStudentPayments(studentId: string) {
    return request<Payment[]>(`/api/v1/admin/payments/${studentId}`);
  },

  async createTeacherPayment(payload: {
    teacherId: string;
    courseId: string;
    amount: number;
    note?: string;
  }) {
    return request<Payment>('/api/v1/admin/teacher-payments', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  // Attendance
  async getStudentAttendance(studentId: string) {
    return request<any[]>(`/api/v1/admin/attendance/${studentId}`);
  },

  // Notifications
  async createNotification(payload: {
    title: string;
    message: string;
    targetType: 'student' | 'teacher' | 'group' | 'all';
    targetUser?: string;
    course?: string;
  }) {
    return request<NotificationItem>('/api/v1/admin/notifications', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
};
