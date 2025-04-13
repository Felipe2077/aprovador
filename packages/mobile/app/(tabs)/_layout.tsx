import { useClientOnlyValue } from '@/components/useClientOnlyValue';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs, useRouter } from 'expo-router';
import React from 'react';
import { Pressable } from 'react-native';
import { useAuthStore } from '../../store/authStore';

function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = async () => {
    await logout();
    // Navegação para login será feita pelo useEffect no _layout raiz
    // router.replace('/(auth)/login'); // Não é mais necessário aqui
    console.log('Logout action called');
  };

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.text,

        headerShown: useClientOnlyValue(false, true),
      }}
    >
      <Tabs.Screen
        name='index'
        options={{
          title: 'APs pendentes',
          tabBarIcon: ({ color }: { color: string }) => (
            <TabBarIcon name='list' color={color} />
          ),

          headerRight: () => (
            <Pressable
              onPress={handleLogout}
              style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1 })}
            >
              <FontAwesome
                name='sign-out' // Ícone de logout
                size={25}
                color={Colors.text}
                style={{ marginRight: 15 }}
              />
            </Pressable>
          ),
        }}
      />
    </Tabs>
  );
}
