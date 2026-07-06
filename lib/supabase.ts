import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

// Adaptador para almacenamiento
const storageAdapter = {
  getItem: async (key: string) => {
    try {
      return await AsyncStorage.getItem(key);
    } catch {
      return null;
    }
  },
  setItem: async (key: string, value: string) => {
    try {
      await AsyncStorage.setItem(key, value);
    } catch {
      // Ignorar errores
    }
  },
  removeItem: async (key: string) => {
    try {
      await AsyncStorage.removeItem(key);
    } catch {
      // Ignorar errores
    }
  },
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: storageAdapter as any,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Funciones helper para la base de datos
export const db = {
  // Usuarios
  async getUser(userId: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    return { data, error };
  },

  // Perfiles de trabajador
  async getWorkerProfile(userId: string) {
    const { data, error } = await supabase
      .from('worker_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
    return { data, error };
  },

  // Perfiles de empresa
  async getCompanyProfile(userId: string) {
    const { data, error } = await supabase
      .from('company_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
    return { data, error };
  },

  // Vacantes
  async getJobs(filters?: Record<string, any>) {
    let query = supabase
      .from('jobs')
      .select('*, company:company_profiles(*)')
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          query = query.eq(key, value);
        }
      });
    }

    const { data, error } = await query;
    return { data, error };
  },

  async getJob(jobId: string) {
    const { data, error } = await supabase
      .from('jobs')
      .select('*, company:company_profiles(*)')
      .eq('id', jobId)
      .single();
    return { data, error };
  },

  async createJob(jobData: any) {
    const { data, error } = await supabase
      .from('jobs')
      .insert(jobData)
      .select()
      .single();
    return { data, error };
  },

  // Postulaciones
  async getApplications(workerId: string) {
    const { data, error } = await supabase
      .from('applications')
      .select('*, job:jobs(*, company:company_profiles(*))')
      .eq('worker_id', workerId)
      .order('created_at', { ascending: false });
    return { data, error };
  },

  async getApplicationsForCompany(companyId: string) {
    const { data, error } = await supabase
      .from('applications')
      .select('*, worker:worker_profiles(*), job:jobs(*)')
      .eq('job.company_id', companyId)
      .order('created_at', { ascending: false });
    return { data, error };
  },

  async createApplication(applicationData: any) {
    const { data, error } = await supabase
      .from('applications')
      .insert(applicationData)
      .select()
      .single();
    return { data, error };
  },

  // Eventos
  async getEvents() {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .gte('date', new Date().toISOString())
      .order('date', { ascending: true });
    return { data, error };
  },

  // Cursos
  async getCourses() {
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .order('created_at', { ascending: false });
    return { data, error };
  },

  // Mensajes
  async getConversations(userId: string) {
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .contains('participants', [userId])
      .order('updated_at', { ascending: false });
    return { data, error };
  },

  async getMessages(conversationId: string) {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });
    return { data, error };
  },

  async sendMessage(messageData: any) {
    const { data, error } = await supabase
      .from('messages')
      .insert(messageData)
      .select()
      .single();
    return { data, error };
  },

  // Notificaciones
  async getNotifications(userId: string) {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);
    return { data, error };
  },

  async markNotificationRead(notificationId: string) {
    const { data, error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId);
    return { data, error };
  },

  async deleteNotification(notificationId: string) {
    const { data, error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId);
    return { data, error };
  },

  // Calificaciones
  async getRatings(userId: string) {
    const { data, error } = await supabase
      .from('ratings')
      .select('*')
      .eq('to_user_id', userId)
      .order('created_at', { ascending: false });
    return { data, error };
  },

  async createRating(ratingData: any) {
    const { data, error } = await supabase
      .from('ratings')
      .insert(ratingData)
      .select()
      .single();
    return { data, error };
  },

  // Reciclaje
  async getRecyclingCenters() {
    const { data, error } = await supabase
      .from('recycling_centers')
      .select('*');
    return { data, error };
  },

  // Publicaciones comunitarias
  async getCommunityPosts() {
    const { data, error } = await supabase
      .from('community_posts')
      .select('*, user:user_id(*)')
      .order('created_at', { ascending: false })
      .limit(50);
    return { data, error };
  },

  async createCommunityPost(postData: any) {
    const { data, error } = await supabase
      .from('community_posts')
      .insert(postData)
      .select()
      .single();
    return { data, error };
  },
};
