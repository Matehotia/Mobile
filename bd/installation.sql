# Dépendances de base React et Expo
npm install expo
npm install expo-router
npm install react-native
npm install react-dom

# Navigation et routage
npm install @react-navigation/native
npm install @react-navigation/stack
npm install react-router react-router-dom

# UI et composants
npm install react-native-calendars
npm install @expo/vector-icons
npm install react-native-chart-kit @types/react-native-chart-kit
npm install react-native-svg@15.8.0

# Gestion des dates et heures
npx expo install @react-native-community/datetimepicker

# Gestion des images et médias
npx expo install expo-image-picker
npx expo install expo-file-system
npx expo install expo-font

# Outils de développement
npm install --save-dev typescript @types/react @types/react-native
npm install --save-dev babel-plugin-module-resolver

# Autres dépendances
npx expo install expo-constants

#si on le fait on une seule commande:
npm install expo expo-router react-native react-dom @react-navigation/native @react-navigation/stack react-router react-router-dom react-native-calendars @expo/vector-icons react-native-chart-kit @types/react-native-chart-kit react-native-svg@15.8.0 && npx expo install @react-native-community/datetimepicker expo-image-picker expo-file-system expo-font expo-constants && npm install --save-dev typescript @types/react @types/react-native babel-plugin-module-resolver

-------------------------------------------------
# Stockage local
npm install @react-native-async-storage/async-storage

# Navigation
npm install @react-navigation/bottom-tabs

# Animations et interactions
npm install react-native-reanimated
npm install react-native-gesture-handler

# Utilitaires
npm install date-fns
npm install @expo/vector-icons

# Pour les graphiques
npm install react-native-chart-kit
npm install react-native-svg

# Pour le développement
npm install --save-dev @babel/core

#si on fais on une seule commande:
npm install @react-native-async-storage/async-storage @react-navigation/bottom-tabs react-native-reanimated react-native-gesture-handler date-fns @expo/vector-icons react-native-chart-kit react-native-svg && npm install --save-dev @babel/core

#
npm install expo-image-picker expo-file-system
npm install multer
npm install react-native-chart-kit react-native-svg @gorhom/bottom-sheet
npm install pg @types/pg
npm install express pg cors
npm install express cors
npm install --save-dev @types/express @types/cors typescript ts-node


-- pour la notification
npx expo install expo-notifications

-- commande pour arreter le port 3000
taskkill /F /IM node.exe

--pour tester les notif
Invoke-WebRequest -Uri 'http://172.20.10.4:3000/events' -Method Post -Headers @{'Content-Type'='application/json'} -Body '{"title":"Test Notification","description":"Ceci est un test de notification","event_date":"2025-03-17","start_time":"08:55","end_time":"09:00","event_type":"test","priority":1}'