import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Switch,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {MainTabScreenNavigationProp} from '../../types/navigation';
import {COLORS} from '../../theme/colors';
import {FONTS} from '../../theme/fonts';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {supabase} from '../../lib/supabase';
import {useAuth} from '../../contexts/AuthContext';
import {useFavorites} from '../../contexts/FavoritesContext';

interface UserProfile {
  name: string;
  email: string;
  avatar?: string;
}

interface Settings {
  pushNotifications: boolean;
  emailNotifications: boolean;
  darkMode: boolean;
}

export default function ProfileScreen() {
  const navigation = useNavigation<MainTabScreenNavigationProp>();
  const {signOut} = useAuth();
  const {favorites} = useFavorites();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [settings, setSettings] = useState<Settings>({
    pushNotifications: true,
    emailNotifications: true,
    darkMode: true,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
    loadSettings();
  }, []);

  const loadProfile = async () => {
    try {
      const userProfile = await AsyncStorage.getItem('userProfile');
      if (userProfile) {
        setProfile(JSON.parse(userProfile));
      }
    } catch (err) {
      console.error('Error loading profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadSettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem('userSettings');
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
    } catch (err) {
      console.error('Error loading settings:', err);
    }
  };

  const updateSetting = async (key: keyof Settings, value: boolean) => {
    try {
      const newSettings = {...settings, [key]: value};
      setSettings(newSettings);
      await AsyncStorage.setItem('userSettings', JSON.stringify(newSettings));
    } catch (err) {
      console.error('Error updating settings:', err);
      Alert.alert('Error', 'Failed to update settings');
    }
  };

  const handleLogout = async () => {
    const performLogout = async () => {
      try {
        await signOut();
      } catch (err) {
        console.error('Error during logout:', err);
      }
    };

    if (Platform.OS === 'ios') {
      Alert.alert(
        'Logout',
        'Are you sure you want to logout?',
        [
          {text: 'Cancel', style: 'cancel'},
          {
            text: 'Logout',
            onPress: performLogout,
            style: 'destructive',
          },
        ],
      );
    } else {
      await performLogout();
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Ionicons
            name="person-circle-outline"
            size={100}
            color={COLORS.primary}
          />
        </View>
        <Text style={styles.name}>{profile?.name || 'User Name'}</Text>
        <Text style={styles.email}>{profile?.email || 'user@email.com'}</Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{favorites.length}</Text>
          <Text style={styles.statLabel}>Favorites</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notifications</Text>
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Push Notifications</Text>
          <Switch
            value={settings.pushNotifications}
            onValueChange={value => updateSetting('pushNotifications', value)}
            trackColor={{false: COLORS.surface, true: COLORS.primary}}
            thumbColor={COLORS.white}
          />
        </View>
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Email Notifications</Text>
          <Switch
            value={settings.emailNotifications}
            onValueChange={value => updateSetting('emailNotifications', value)}
            trackColor={{false: COLORS.surface, true: COLORS.primary}}
            thumbColor={COLORS.white}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Appearance</Text>
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Dark Mode</Text>
          <Switch
            value={settings.darkMode}
            onValueChange={value => updateSetting('darkMode', value)}
            trackColor={{false: COLORS.surface, true: COLORS.primary}}
            thumbColor={COLORS.white}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuItemContent}>
            <Ionicons name="person-outline" size={24} color={COLORS.white} />
            <Text style={styles.menuItemText}>Edit Profile</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color={COLORS.gray} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuItemContent}>
            <Ionicons name="lock-closed-outline" size={24} color={COLORS.white} />
            <Text style={styles.menuItemText}>Change Password</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color={COLORS.gray} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuItemContent}>
            <Ionicons name="help-circle-outline" size={24} color={COLORS.white} />
            <Text style={styles.menuItemText}>Help & Support</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color={COLORS.gray} />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surface,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  name: {
    color: COLORS.white,
    fontSize: 24,
    fontFamily: FONTS.bold,
    marginBottom: 4,
  },
  email: {
    color: COLORS.gray,
    fontSize: 16,
    fontFamily: FONTS.regular,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surface,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    color: COLORS.white,
    fontSize: 24,
    fontFamily: FONTS.bold,
    marginBottom: 4,
  },
  statLabel: {
    color: COLORS.gray,
    fontSize: 14,
    fontFamily: FONTS.medium,
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surface,
  },
  sectionTitle: {
    color: COLORS.white,
    fontSize: 18,
    fontFamily: FONTS.bold,
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  settingLabel: {
    color: COLORS.white,
    fontSize: 16,
    fontFamily: FONTS.medium,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemText: {
    color: COLORS.white,
    fontSize: 16,
    fontFamily: FONTS.medium,
    marginLeft: 12,
  },
  logoutButton: {
    margin: 16,
    backgroundColor: COLORS.error,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontFamily: FONTS.medium,
  },
}); 