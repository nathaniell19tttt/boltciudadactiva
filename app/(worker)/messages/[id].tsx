import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Send, Image, Paperclip, Mic, MoreVertical, Phone, Video, MapPin } from 'lucide-react-native';
import { useTheme } from '@/contexts';
import { useAuth } from '@/contexts';
import { Avatar, Input } from '@/components/ui';
import { Card } from '@/components/ui';
import { Spacing } from '@/constants';
import { supabase } from '@/lib/supabase';

export default function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { theme } = useTheme();
  const { user } = useAuth();

  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [otherUser, setOtherUser] = useState<any>(null);
  const [isTyping, setIsTyping] = useState(false);

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

        // Obtener info del otro usuario
        const otherId = data[0]?.sender_id === user.id ? data[0].receiver_id : data[0]?.sender_id;
        if (otherId) {
          // Intentar obtener perfil
          const { data: worker } = await supabase
            .from('worker_profiles')
            .select('*')
            .eq('user_id', otherId)
            .single();

          if (worker) {
            setOtherUser({ type: 'worker', data: worker });
          } else {
            const { data: company } = await supabase
              .from('company_profiles')
              .select('*')
              .eq('user_id', otherId)
              .single();
            if (company) {
              setOtherUser({ type: 'company', data: company });
            }
          }
        }
      }
    } catch (err) {
      console.error('Error loading messages:', err);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !user || !id) return;

    try {
      const otherId = otherUser?.data?.user_id;

      const { error } = await supabase
        .from('messages')
        .insert({
          conversation_id: id,
          sender_id: user.id,
          receiver_id: otherId,
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

  const getOtherName = () => {
    if (!otherUser) return 'Usuario';
    return otherUser.type === 'company'
      ? otherUser.data.name
      : `${otherUser.data.first_name} ${otherUser.data.last_name}`;
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

  // Agrupar mensajes por fecha
  const groupedMessages: { date: string; messages: any[] }[] = [];
  let currentDate = '';

  messages.forEach((msg) => {
    const msgDate = formatDate(msg.created_at);
    if (msgDate !== currentDate) {
      currentDate = msgDate;
      groupedMessages.push({ date: msgDate, messages: [msg] });
    } else {
      groupedMessages[groupedMessages.length - 1].messages.push(msg);
    }
  });

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.border }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Avatar source={otherUser?.data?.photo_url || otherUser?.data?.logo_url} name={getOtherName()} size={40} online />
        <View style={styles.headerInfo}>
          <Text style={[styles.headerName, { color: theme.colors.text }]}>{getOtherName()}</Text>
          <Text style={[styles.headerStatus, { color: theme.colors.success[500] }]}>
            {isTyping ? 'Escribiendo...' : 'En línea'}
          </Text>
        </View>
        <TouchableOpacity style={styles.headerAction}>
          <Phone size={22} color={theme.colors.primary[500]} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.headerAction}>
          <Video size={22} color={theme.colors.primary[500]} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.headerAction}>
          <MoreVertical size={22} color={theme.colors.text} />
        </TouchableOpacity>
      </View>

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
              Envía un mensaje para comenzar
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
  headerInfo: { flex: 1, marginLeft: Spacing.sm },
  headerName: { fontSize: 16, fontWeight: '600' },
  headerStatus: { fontSize: 12, marginTop: 2 },
  headerAction: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  messagesList: { padding: Spacing.base, paddingBottom: Spacing.xl },
  dateContainer: { alignItems: 'center', marginVertical: Spacing.md },
  dateText: { fontSize: 12, backgroundColor: 'transparent' },
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
