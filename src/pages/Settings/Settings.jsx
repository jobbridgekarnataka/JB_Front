
import React, { useEffect, useState } from 'react';
import { User, Bell, Palette, Globe, Mail, Lock } from 'lucide-react';
import CustomCard from '../../components/UI/CustomCard';
import FormInput from '../../components/UI/FormInput';
import DropdownSelect from '../../components/UI/DropdownSelect';
import ToggleSwitch from '../../components/UI/ToggleSwitch';
 import { useTheme } from '../../context/ThemeContext';
import styles from './Settings.module.scss';
import { useData } from '../../context/DataContext';

function Settings() {
     const { theme, toggleTheme } = useTheme();
     const {userContext,setUserContext} =useData();
  const [profile, setProfile] = useState("");
  useEffect(()=>{
    setProfile(userContext);
  },[userContext])
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    taskReminders: true,
    projectUpdates: true,
    weeklyReports: true,
  });

  const [preferences, setPreferences] = useState({
    language: 'english',
    timezone: 'asia-kolkata',
  });

  const languageOptions = [
    { value: 'english', label: 'English' },
    { value: 'hindi', label: 'हिंदी (Hindi)' },
    { value: 'tamil', label: 'தமிழ் (Tamil)' },
    { value: 'telugu', label: 'తెలుగు (Telugu)' },
    { value: 'bengali', label: 'বাংলা (Bengali)' },
  ];

  const timezoneOptions = [
    { value: 'asia-kolkata', label: 'India Standard Time (IST)' },
    { value: 'utc', label: 'UTC' },
    { value: 'america-new_york', label: 'Eastern Time' },
    { value: 'europe-london', label: 'Greenwich Mean Time' },
  ];


  return (
    <>
    {/* <div>
      <h1>Comming soon......</h1>
    </div> */}
    <div className={styles.settings}>
      <h2>Settings</h2>

      <div className={styles.settingsGrid}>
        {/* Profile Settings */}
        <CustomCard className={styles.settingsCard}>
          <div className={styles.cardHeader}>
            <User size={24} />
            <h3>Profile Settings</h3>
          </div>

          <div className={styles.formGrid}>
            <FormInput
              label="Full Name"
              value={profile.name}
              onChange={(value) => setProfile({ ...profile, name: value })}
              icon={<User size={16} />}
            />

            <FormInput
              label="Email Address"
              type="email"
              value={profile.personalEmail}
              onChange={(value) => setProfile({ ...profile, email: value })}
              icon={<Mail size={16} />}
            />

            <FormInput
              label="Phone Number"
              type="tel"
              value={profile.mobileNumber}
              onChange={(value) => setProfile({ ...profile, phone: value })}
            />

            <FormInput
              label="Company"
              value={profile.currentInstitutionOrCompany}
              onChange={(value) => setProfile({ ...profile, company: value })}
            />
          </div>

          <button className={styles.saveButton}>Save Profile</button>
        </CustomCard>

        {/* Notification Settings */}
        <CustomCard className={styles.settingsCard}>
          <div className={styles.cardHeader}>
            <Bell size={24} />
            <h3>Notification Settings</h3>
          </div>

          <div className={styles.toggleList}>
            <ToggleSwitch
              label="Email Notifications"
              checked={notifications.emailNotifications}
              onChange={(checked) => setNotifications({ ...notifications, emailNotifications: checked })}
            />

            <ToggleSwitch
              label="Push Notifications"
              checked={notifications.pushNotifications}
              onChange={(checked) => setNotifications({ ...notifications, pushNotifications: checked })}
            />

            <ToggleSwitch
              label="SMS Notifications"
              checked={notifications.smsNotifications}
              onChange={(checked) => setNotifications({ ...notifications, smsNotifications: checked })}
            />

            <ToggleSwitch
              label="Task Reminders"
              checked={notifications.taskReminders}
              onChange={(checked) => setNotifications({ ...notifications, taskReminders: checked })}
            />

            <ToggleSwitch
              label="Project Updates"
              checked={notifications.projectUpdates}
              onChange={(checked) => setNotifications({ ...notifications, projectUpdates: checked })}
            />

            <ToggleSwitch
              label="Weekly Reports"
              checked={notifications.weeklyReports}
              onChange={(checked) => setNotifications({ ...notifications, weeklyReports: checked })}
            />
          </div>
        </CustomCard>

        {/* Theme Settings */}
        <CustomCard className={styles.settingsCard}>
          <div className={styles.cardHeader}>
            <Palette size={24} />
            <h3>Appearance</h3>
          </div>

          <div className={styles.themeSection}>
            <ToggleSwitch
              label={`${theme === 'dark' ? 'Dark' : 'Light'} Theme`}
              checked={theme === 'dark'}
              onChange={toggleTheme}
            />

            <div className={styles.themePreview}>
              <div className={`${styles.previewCard} ${theme === 'light' ? styles.active : ''}`}>
                <div className={styles.previewHeader}></div>
                <div className={styles.previewContent}></div>
                <span>Light</span>
              </div>
              <div className={`${styles.previewCard} ${styles.dark} ${theme === 'dark' ? styles.active : ''}`}>
                <div className={styles.previewHeader}></div>
                <div className={styles.previewContent}></div>
                <span>Dark</span>
              </div>
            </div>
          </div>
        </CustomCard>

        {/* Language & Region */}
        <CustomCard className={styles.settingsCard}>
          <div className={styles.cardHeader}>
            <Globe size={24} />
            <h3>Language & Region</h3>
          </div>

          <div className={styles.formGrid}>
            <DropdownSelect
              label="Language"
              options={languageOptions}
              value={preferences.language}
              onChange={(value) => setPreferences({ ...preferences, language: value })}
            />

            <DropdownSelect
              label="Timezone"
              options={timezoneOptions}
              value={preferences.timezone}
              onChange={(value) => setPreferences({ ...preferences, timezone: value })}
              searchable
            />
          </div>
        </CustomCard>

        {/* Security Settings */}
        <CustomCard className={styles.settingsCard}>
          <div className={styles.cardHeader}>
            <Lock size={24} />
            <h3>Security</h3>
          </div>

          <div className={styles.securityActions}>
            <button className={styles.actionButton}>
              Change Password
            </button>
            <button className={styles.actionButton}>
              Enable Two-Factor Authentication
            </button>
            <button className={styles.actionButton}>
              Download Data Export
            </button>
            <button className={`${styles.actionButton} ${styles.danger}`}>
              Delete Account
            </button>
          </div>
        </CustomCard>
      </div>
    </div>
    </>
  )
}

export default Settings



