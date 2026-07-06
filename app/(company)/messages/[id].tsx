import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Send, Image, Paperclip, Mic, MoreVertical, Phone, Video, MapPin, Calendar, FileText, User } from 'lucide-react-native';
import { useTheme } from '@/contexts';
import { useAuth } from '@/contexts';
import { Avatar, Input } from '@/components/ui';
import { Card } from '@/components/ui';
import { Spacing } from '@/constants';
import { supabase } from '@/lib/supabase';

export default function CompanyChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { theme } = useTheme();
  const { user, profile } = useAuth();
  const companyProfile = profile as any;

  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [otherUser, setOtherUser] = useState<any>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);

  useEffect(() => {
    loadMessages();
  }, [id]);

  const loadMessages = async () => {
    if (!id || !user) return;

    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', id)
        .order('created_at', { ascending: true });

      if (!error && data) {
        setMessages(data);
      }

      // Resolve other participant — use messages first, fall back to conversation table
      let otherId: string | null = null;
      if (data && data.length > 0) {
        otherId = data[0].sender_id === user.id ? data[0].receiver_id : data[0].sender_id;
      } else {
        // No messages yet: read participants from conversations table
        const { data: conv } = await supabase
          .from('conversations')
          .select('participant_1, participant_2')
          .eq('id', id)
          .single();
        if (conv) {
          otherId = conv.participant_1 === user.id ? conv.participant_2 : conv.participant_1;
        }
      }

      if (otherId) {
        const { data: worker } = await supabase
          .from('worker_profiles')
          .select('*')
          .eq('user_id', otherId)
          .single();

        if (worker) {
          setOtherUser(worker);
        }
      }
    } catch (err) {
      console.error('Error loading messages:', err);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !user || !id || !otherUser) return;

    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          conversation_id: id,
          sender_id: user.id,
          receiver_id: otherUser.user_id,
          content: newMessage.trim(),
          type: 'text',
        });

      if (!error) {
        setNewMessage('');
        loadMessages();
      }
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  const sendQuickAction = async (action: string) => {
    if (!user || !id || !otherUser) return;

    const messages: Record<string, string> = {
      interview: 'Te invito a programar una entrevista. ¿Qué horario te queda mejor?',
      job: 'Tu perfil encaja con una de nuestras vacantes. ¿Te interesa conocer más?',
      schedule: '¿Podemos agendar una llamada para conversar sobre la vacante?',
    };

    const { error } = await supabase
      .from('messages')
      .insert({
        conversation_id: id,
        sender_id: user.id,
        receiver_id: otherUser.user_id,
        content: messages[action],
        type: 'text',
      });

    if (!error) {
      setShowQuickActions(false);
      loadMessages();
    }
  };

  const getOtherName = () => {
    if (!otherUser) return 'Usuario';
    return `${otherUser.first_name} ${otherUser.last_name}`;
  };

  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date: string) => {
    const now = new Date();
    const msgDate = new Date(date);
    const diffDays = Math.floor((now.getTime() - msgDate.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Hoy';
    if (diffDays === 1) return 'Ayer';
    return msgDate.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'short' });
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.border }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.headerProfile} onPress={() => router.push(`/(company)/talent/${otherUser?.id}`)}>
          <Avatar source={otherUser?.photo_url} name={getOtherName()} size={42} online={otherUser?.is_online} />
          <View style={styles.headerInfo}>
            <Text style={[styles.headerName, { color: theme.colors.text }]}>{getOtherName()}</Text>
            <Text style={[styles.headerStatus, { color: otherUser?.is_online ? theme.colors.success[500] : theme.colors.textTertiary }]}>
              {isTyping ? 'Escribiendo...' : otherUser?.is_online ? 'En línea' : 'Desconectado'}
            </Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.headerAction}>
          <Phone size={22} color={theme.colors.primary[500]} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.headerAction}>
          <Video size={22} color={theme.colors.primary[500]} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.headerAction} onPress={() => setShowQuickActions(!showQuickActions)}>
          <MoreVertical size={22} color={theme.colors.text} />
        </TouchableOpacity>
      </View>

      {/* Quick Actions */}
      {showQuickActions && (
        <View style={[styles.quickActions, { backgroundColor: theme.colors.surface }]}>
          <TouchableOpacity style={styles.quickAction} onPress={() => sendQuickAction('interview')}>
            <Calendar size={20} color={theme.colors.primary[500]} />
            <Text style={[styles.quickActionText, { color: theme.colors.text }]}>Invitar a entrevista</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickAction} onPress={() => sendQuickAction('job')}>
            <FileText size={20} color={theme.colors.warning[500]} />
            <Text style={[styles.quickActionText, { color: theme.colors.text }]}>Mencionar vacante</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickAction} onPress={() => sendQuickAction('schedule')}>
            <Video size={20} color={theme.colors.success[500]} />
            <Text style={[styles.quickActionText, { color: theme.colors.text }]}>Agendar llamada</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickAction} onPress={() => router.push(`/(company)/talent/${otherUser?.id}`)}>
            <User size={20} color={theme.colors.info[500]} />
            <Text style={[styles.quickActionText, { color: theme.colors.text }]}>Ver perfil</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Messages */}
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesList}
        showsVerticalScrollIndicator={false}
        renderItem={({ item, index }) => {
          const isMe = item.sender_id === user?.id;
          const showDate = index === 0 || formatDate(item.created_at) !== formatDate(messages[index - 1].created_at);

          return (
            <>
              {showDate && (
                <View style={styles.dateContainer}>
                  <Text style={[styles.dateText, { color: theme.colors.textTertiary }]}>
                    {formatDate(item.created_at)}
                  </Text>
                </View>
              )}
              <View style={[styles.messageRow, isMe ? styles.messageRowMe : styles.messageRowOther]}>
                <View
                  style={[
                    styles.messageBubble,
                    isMe ? { backgroundColor: theme.colors.primary[500] } : { backgroundColor: theme.colors.surfaceVariant },
                    !isMe && { borderTopLeftRadius: 0 },
                    isMe && { borderTopRightRadius: 0 }
                  ]}
                >
                  <Text style={[styles.messageText, { color: isMe ? '#FFFFFF' : theme.colors.text }]}>
                    {item.content}
                  </Text>
                  <Text style={[styles.messageTime, { color: isMe ? 'rgba(255,255,255,0.7)' : theme.colors.textTertiary }]}>
                    {formatTime(item.created_at)}
                    {isMe && ' ✓✓'}
                  </Text>
                </View>
              </View>
            </>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyChat}>
            <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>Inicia una conversación</Text>
            <Text style={[styles.emptyDesc, { color: theme.colors.textSecondary }]}>
              Este candidato ha postulado a tus vacantes
            </Text>
          </View>
        }
      />

      {/* Input */}
      <View style={[styles.inputContainer, { backgroundColor: theme.colors.surface, borderTopColor: theme.colors.border }]}>
        <TouchableOpacity style={styles.attachBtn}>
          <Paperclip size={22} color={theme.colors.textSecondary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.attachBtn}>
          <Image size={22} color={theme.colors.textSecondary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.attachBtn}>
          <MapPin size={22} color={theme.colors.textSecondary} />
        </TouchableOpacity>
        <View style={[styles.inputWrapper, { backgroundColor: theme.colors.surfaceVariant }]}>
          <View style={styles.inputInner}>
            <Input
              value={newMessage}
              onChangeText={setNewMessage}
              placeholder="Escribe un mensaje..."
              placeholderTextColor={theme.colors.textTertiary}
            />
          </View>
        </View>
        {newMessage.trim() ? (
          <TouchableOpacity style={styles.sendBtn} onPress={sendMessage}>
            <Send size={22} color="#FFFFFF" fill="#FFFFFF" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.micBtn}>
            <Mic size={22} color={theme.colors.text} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', padding: Spacing.sm, borderBottomWidth: 1 },
  backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerProfile: { flex: 1, flexDirection: 'row', alignItems: 'center', marginLeft: Spacing.sm },
  headerInfo: { marginLeft: Spacing.sm, flex: 1 },
  headerName: { fontSize: 16, fontWeight: '600' },
  headerStatus: { fontSize: 12, marginTop: 2 },
  headerAction: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  quickActions: { padding: Spacing.sm, borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.1)' },
  quickAction: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingVertical: Spacing.md },
  quickActionText: { fontSize: 14 },
  messagesList: { padding: Spacing.base, paddingBottom: Spacing.xl },
  dateContainer: { alignItems: 'center', marginVertical: Spacing.md },
  dateText: { fontSize: 12 },
  messageRow: { marginVertical: 4 },
  messageRowMe: { alignItems: 'flex-end' },
  messageRowOther: { alignItems: 'flex-start' },
  messageBubble: { maxWidth: '75%', paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: Spacing.radius.lg },
  messageText: { fontSize: 15, lineHeight: 20 },
  messageTime: { fontSize: 10, marginTop: Spacing.xs, textAlign: 'right' },
  emptyChat: { alignItems: 'center', paddingVertical: Spacing['3xl'] },
  emptyTitle: { fontSize: 18, fontWeight: '600' },
  emptyDesc: { fontSize: 14, marginTop: Spacing.sm },
  inputContainer: { flexDirection: 'row', alignItems: 'center', padding: Spacing.sm, borderTopWidth: 1 },
  attachBtn: { padding: Spacing.sm },
  inputWrapper: { flex: 1, borderRadius: Spacing.radius.xl },
  inputInner: { marginBottom: 0 },
  sendBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#1976D2', justifyContent: 'center', alignItems: 'center', marginLeft: Spacing.sm },
  micBtn: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center', marginLeft: Spacing.sm },
});
