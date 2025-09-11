import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useState } from 'react';
import { axiosChild } from '~/configs/axios';
import { checkRole } from '~/utils/checkrole';
import { useAuth } from './AuthContext';
import { useInitData } from './InitData';
import { useNotification } from './NotificationContext';
import { useSocketContext } from './SocketContext';

interface AsignedContextType {
  assignedChange: any;
  setAssignedChange: (conversations: any) => void;
}

export const AsignedContext = createContext<AsignedContextType | undefined>(undefined);

export const AsignedProvider = ({ children }: { children: React.ReactNode }) => {
  const [assignedChange, setAssignedChange] = useState<any>(null);
  const { authChild } = useAuth();
  const { storeDomain } = useInitData();
  const { socket } = useSocketContext();
  const { showNotification, appState } = useNotification();

  useEffect(() => {
    const getAssignedConversations = async () => {
      if (!checkRole(3, authChild)) {
        const res = await (await axiosChild({ action: 'get_assigned_conversations' })).get('/get');
        await AsyncStorage.setItem('assignedConversations', JSON.stringify(res.data.data));
      } else {
        await AsyncStorage.setItem('assignedConversations', JSON.stringify([]));
      }
    };
    getAssignedConversations();
  }, [authChild]);

  useEffect(() => {
    async function socketOn() {
      if (!socket) return;
      if (!authChild) return offSocket();
      if (!storeDomain) return;
      const siteHost = storeDomain.replace('https://', '');

      socket.on(`customer-assigned-${siteHost}`, (d: any) => {
        handleCustomerAssigned(d);
      });

      socket.on(`remove-assigned-${siteHost}`, (d: any) => {
        handleRemoveAssigned(d);
      });
    }

    async function handleRemoveAssigned(d: any) {
      const { data, removeAssign } = d;
      if (!checkRole(3, authChild)) {
        const assignedConversations = JSON.parse((await AsyncStorage.getItem('assignedConversations')) || '[]');
        const temp = assignedConversations.filter((t: any) => t.conversationId != data.conversationid);
        await AsyncStorage.setItem('assignedConversations', JSON.stringify(temp));
        if (removeAssign.dataReset !== null) {
          if (
            removeAssign.dataReset.lower.includes(authChild.ID.toString()) ||
            removeAssign.dataReset.idAssigned.ID == authChild.ID
          ) {
            const a = {
              action: 'remove',
              data: { conversationid: data.conversation_id },
            };
            setAssignedChange(a);
          }
        } else {
          const a = {
            action: 'remove',
            data: { conversationid: data.conversation_id },
          };
          setAssignedChange(a);
        }
      }
    }
    async function handleCustomerAssigned(d: any) {
      const { assign, data } = d;
      const { customer, userAssignTo, userAssigned, idOld } = data;
      const { newAdd } = assign;

      const assignedConversations = JSON.parse((await AsyncStorage.getItem('assignedConversations')) || '[]');
      if (!checkRole(3, authChild)) {
        if (newAdd.includes(authChild.ID.toString()) || userAssigned.ID == authChild.ID) {
          let temp = assignedConversations;
          if (temp.some((t: any) => t.conversationId == customer.conversation_id) === false) {
            temp.push({
              conversationId: customer.conversation_id,
              isread: userAssigned.ID == authChild.ID ? false : true,
              time: Date.now(),
            });
            await AsyncStorage.setItem('assignedConversations', JSON.stringify(temp));
            const res = await (
              await axiosChild({ action: null })
            ).get('/get-conversation-by-id', {
              params: {
                conversationId: customer.conversation_id,
              },
            });
            res.data.data.isNew = userAssigned.ID == authChild.ID ? false : true;
            const a = {
              action: 'add',
              data: res.data?.data,
            };
            setAssignedChange(a);
            if (userAssigned.ID == authChild.ID && appState === 'active') {
              showNotification('Bạn được giao cuộc hội thoại mới', 'Khách hàng: ' + customer.name, {
                action: 'goto_messages',
                data: res.data?.data,
              });
            }
          }
        } else {
          let temp = assignedConversations;
          temp = temp.filter((t: any) => t.conversationId != customer.conversation_id);
          await AsyncStorage.setItem('assignedConversations', JSON.stringify(temp));
          const a = {
            action: 'remove',
            data: { conversationid: customer.conversation_id },
          };
          setAssignedChange(a);
        }
      }
    }
    socketOn();

    function offSocket() {
      const siteHost = storeDomain?.replace('https://', '');
      socket?.off('test');
      socket?.off(`customer-assigned-${siteHost}`);
      socket?.off(`remove-assigned-${siteHost}`);
    }
    return offSocket;
  }, [socket, authChild, storeDomain, appState]);

  return <AsignedContext.Provider value={{ assignedChange, setAssignedChange }}>{children}</AsignedContext.Provider>;
};

export const useAssigned = (): AsignedContextType => {
  const context = useContext(AsignedContext);
  if (context === undefined) {
    throw new Error('useAssigned must be used within an AsignedProvider');
  }
  return context;
};
