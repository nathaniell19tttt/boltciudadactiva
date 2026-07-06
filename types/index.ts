// Ciudad Activa - Tipos principales

// Roles de usuario
export type UserRole = 'trabajador' | 'empresa' | 'admin' | 'moderador';

// usuario base
export interface User {
  id: string;
  email: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
  status: 'active' | 'suspended' | 'deleted';
  last_login?: string;
}

// Perfil del trabajador
export interface WorkerProfile {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  dni: string;
  birth_date: string;
  gender: 'masculino' | 'femenino' | 'otro';
  phone: string;
  photo_url?: string;

  // Ubicación
  department: string;
  province: string;
  district: string;
  address: string; // Solo visible para el usuario

  // Profesional
  profession: string;
  occupation: string;
  summary?: string;
  experience_years: number;
  education_level: 'secundaria' | 'tecnico' | 'universitario' | 'postgrado';
  availability: 'tiempo_completo' | 'medio_tiempo' | 'horas_flexibles';
  modality_preference: 'presencial' | 'remoto' | 'hibrido';
  salary_expectation?: number;

  // Adicionales
  skills: string[];
  languages: Language[];
  experiences: Experience[];
  education: Education[];
  certifications: Certification[];

  // Calificación
  rating: number;
  rating_count: number;

  created_at: string;
  updated_at: string;
}

// Perfil de empresa
export interface CompanyProfile {
  id: string;
  user_id: string;
  name: string;
  legal_name?: string;
  ruc: string;
  description?: string;
  industry: string;
  logo_url?: string;
  banner_url?: string;
  phone: string;
  website?: string;
  facebook?: string;
  instagram?: string;
  whatsapp?: string;
  employee_count: number;

  // Ubicación
  department: string;
  province: string;
  district: string;
  address: string;

  // Horario
  schedule?: string;

  // Verificación
  verified: boolean;

  // Calificación
  rating: number;
  rating_count: number;

  created_at: string;
  updated_at: string;
}

// Idioma
export interface Language {
  name: string;
  level: 'basico' | 'intermedio' | 'avanzado' | 'nativo';
}

// Experiencia laboral
export interface Experience {
  id: string;
  company: string;
  position: string;
  start_date: string;
  end_date?: string;
  current: boolean;
  description: string;
}

// Educación
export interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  start_year: number;
  end_year?: number;
}

// Certificación
export interface Certification {
  id: string;
  name: string;
  institution: string;
  date: string;
  credential_url?: string;
  status: 'completed' | 'in_progress' | 'cancelled';
}

// Vacante/Empleo
export interface Job {
  id: string;
  company_id: string;
  company: CompanyProfile;
  title: string;
  description: string;
  requirements: string[];
  benefits: string[];
  salary_min?: number;
  salary_max?: number;
  salary_type: 'hourly' | 'monthly' | 'fixed';
  contract_type: 'practicas' | 'temporal' | 'indefinido' | 'freelance';
  modality: 'presencial' | 'remoto' | 'hibrido';
  schedule: string;
  vacancies: number;
  department: string;
  province: string;
  district: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  deadline?: string;
  status: 'active' | 'paused' | 'closed' | 'expired';
  featured: boolean;
  views: number;
  applications_count: number;
  created_at: string;
  updated_at: string;
}

// Postulación
export interface Application {
  id: string;
  job_id: string;
  job: Job;
  worker_id: string;
  worker: WorkerProfile;
  status: 'received' | 'reviewing' | 'interview' | 'test' | 'waiting' | 'hired' | 'rejected';
  notes?: string;
  created_at: string;
  updated_at: string;
}

// Mensaje
export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  type: 'text' | 'image' | 'video' | 'audio' | 'document' | 'location';
  file_url?: string;
  read: boolean;
  read_at?: string;
  created_at: string;
}

// Conversación
export interface Conversation {
  id: string;
  participants: string[];
  last_message?: Message;
  unread_count: number;
  updated_at: string;
}

// Evento
export interface Event {
  id: string;
  title: string;
  description: string;
  image_url?: string;
  date: string;
  time: string;
  location: string;
  latitude?: number;
  longitude?: number;
  organizer: string;
  capacity: number;
  registered_count: number;
  category: 'feria' | 'charla' | 'taller' | 'capacitacion' | 'networking';
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  created_at: string;
}

// Curso/Capacitación
export interface Course {
  id: string;
  title: string;
  description: string;
  image_url?: string;
  instructor: string;
  duration_hours: number;
  lessons_count: number;
  category: string;
  level: 'basico' | 'intermedio' | 'avanzado';
  price: number;
  certificate: boolean;
  rating: number;
  students_count: number;
  enrolled?: boolean;
  progress?: number;
  created_at: string;
}

// Centro de reciclaje
export interface RecyclingCenter {
  id: string;
  name: string;
  type: 'reciclaje' | 'acopio' | 'ambiental';
  address: string;
  latitude: number;
  longitude: number;
  phone?: string;
  schedule: string;
  materials: string[];
  image_url?: string;
}

// Publicación comunitaria
export interface CommunityPost {
  id: string;
  user_id: string;
  user: WorkerProfile | CompanyProfile;
  content: string;
  images: string[];
  location?: string;
  likes_count: number;
  comments_count: number;
  shares_count: number;
  liked: boolean;
  saved: boolean;
  created_at: string;
}

// Calificación
export interface Rating {
  id: string;
  rating: number;
  comment?: string;
  from_user_id: string;
  to_user_id: string;
  job_id?: string;
  created_at: string;
}

// Notificación
export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'job' | 'message' | 'application' | 'event' | 'course' | 'system';
  data?: Record<string, any>;
  read: boolean;
  created_at: string;
}

// Documentos
export interface Document {
  id: string;
  user_id: string;
  type: 'cv' | 'dni' | 'certificate' | 'license' | 'other';
  name: string;
  file_url: string;
  size: number;
  created_at: string;
}
