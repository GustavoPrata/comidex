import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
  Alert,
  Image,
  Dimensions,
  ActivityIndicator,
  FlatList,
  Animated,
  Platform,
  KeyboardAvoidingView,
  PanResponder,
  BackHandler,
  TouchableWithoutFeedback,
  Pressable,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { BlurView } from "expo-blur";
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Circle, Rect, LinearGradient as SvgLinearGradient, Defs, Stop } from 'react-native-svg';
import * as Brightness from 'expo-brightness';
import * as Battery from 'expo-battery';
import { useKeepAwake } from 'expo-keep-awake';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { config } from './config';

const APP_VERSION = '1.0.0';

const DEVICE_ID_KEY = '@tablet_device_id';

const generateUniqueDeviceId = (): string => {
  const timestamp = Date.now().toString(36);
  const randomPart1 = Math.random().toString(36).substring(2, 10);
  const randomPart2 = Math.random().toString(36).substring(2, 10);
  return `tablet_${timestamp}_${randomPart1}${randomPart2}`;
};

const getOrCreateDeviceId = async (): Promise<string> => {
  try {
    const existingId = await AsyncStorage.getItem(DEVICE_ID_KEY);
    if (existingId) {
      console.log('📱 Device ID carregado do armazenamento:', existingId);
      return existingId;
    }
    
    const newId = generateUniqueDeviceId();
    await AsyncStorage.setItem(DEVICE_ID_KEY, newId);
    console.log('📱 Novo Device ID gerado e salvo:', newId);
    return newId;
  } catch (error) {
    console.error('Erro ao obter/criar device ID:', error);
    return generateUniqueDeviceId();
  }
};
// Import Lucide icons para ter os mesmos ícones do admin
import {
  Crown,
  Utensils,
  BookOpen,
  Coffee,
  Pizza,
  Star,
  Home,
  ShoppingCart,
  User,
  Bell,
  X,
  Plus,
  Minus,
  MessageCircle,
  ChevronRight,
  Search,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Info,
  Trash2,
  LogOut,
  CreditCard,
  DollarSign,
  Settings,
  Loader2,
  ChevronLeft,
  Menu as MenuIcon,
  Baby,
  ArrowRight,
  Receipt,
  BarChart3,
  Wine,
  GlassWater,
  Beer,
  Martini,
  CupSoda,
  Milk,
  Soup,
  Sandwich,
  IceCream,
  Cookie,
  Beef,
  Fish,
  Egg
} from 'lucide-react-native';

// Types
interface Product {
  id: number;
  name: string;
  description: string;
  price: string;
  image_url: string | null;
  category: string;
  category_id: number;
  is_premium?: boolean;
}

interface Category {
  id: number;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  image?: string;
}

interface CartItem extends Product {
  quantity: number;
  observation?: string;
}

interface Session {
  id: number;
  table_id: number;
  table_number: string;
  status: string;
  opened_at: string;
  closed_at?: string;
  subtotal: number;
  service_fee: number;
  discount: number;
  total: number;
  orders: any[];
  payment_method?: string;
}

interface OrderHistory {
  id: number;
  numero: string;
  created_at: string;
  total?: number;
  valor_total?: number;
  items?: any[];
}

interface Promotion {
  id: number;
  title: string;
  description: string;
  image: string;
  price?: string;
  highlight?: boolean;
}

const { width, height } = Dimensions.get("window");

// Constants - Defaults (will be overridden by server settings)
const DEFAULT_IDLE_TIMEOUT = 120000; // 2 minutes
const KIOSK_PIN = "1234"; // Kiosk admin PIN
const LONG_PRESS_DURATION = 3000; // 3 seconds for admin menu

// Tablet Settings Interface
interface TabletSettings {
  brightness_enabled: boolean;
  idle_timeout_seconds: number;
  dim_brightness: number;
  default_brightness: number;
  touch_to_wake: boolean;
}

// Icon Component usando Lucide - IDÊNTICO AO ADMIN
const IconComponent = ({ name, size = 24, color = "#FFF" }: { name: string, size?: number, color?: string }) => {
  // Normaliza o nome para lowercase para comparação
  const normalizedName = (name || '').toLowerCase().trim();
  
  // Mapeamento de nomes de ícones do banco de dados para Lucide
  switch(normalizedName) {
    // Ícones de grupos do banco de dados
    case 'rodízio premium':
    case 'rodizio premium':
    case 'crown':
      return <Crown size={size} color={color} strokeWidth={2} />;
    
    case 'rodízio tradicional':
    case 'rodizio tradicional':
    case 'utensils':
      return <Utensils size={size} color={color} strokeWidth={2} />;
    
    case 'à la carte':
    case 'a la carte':
    case 'menu-book':
      return <BookOpen size={size} color={color} strokeWidth={2} />;
    
    case 'refrigerante':
    case 'cup-soda':
    case 'cup':
    case 'soda':
      return <CupSoda size={size} color={color} strokeWidth={2} />;
    
    case 'coquetel drink':
    case 'coquetel':
    case 'cocktail':
    case 'martini':
    case 'drink':
      return <Martini size={size} color={color} strokeWidth={2} />;
    
    case 'vinho sake':
    case 'vinho':
    case 'wine':
    case 'sake':
      return <Wine size={size} color={color} strokeWidth={2} />;
    
    case 'cerveja':
    case 'beer':
      return <Beer size={size} color={color} strokeWidth={2} />;
    
    case 'água':
    case 'agua':
    case 'water':
      return <GlassWater size={size} color={color} strokeWidth={2} />;
    
    case 'leite':
    case 'milk':
      return <Milk size={size} color={color} strokeWidth={2} />;
    
    case 'sopa':
    case 'soup':
      return <Soup size={size} color={color} strokeWidth={2} />;
    
    case 'sanduíche':
    case 'sanduiche':
    case 'sandwich':
      return <Sandwich size={size} color={color} strokeWidth={2} />;
    
    case 'sorvete':
    case 'ice cream':
    case 'icecream':
      return <IceCream size={size} color={color} strokeWidth={2} />;
    
    case 'biscoito':
    case 'cookie':
      return <Cookie size={size} color={color} strokeWidth={2} />;
    
    case 'carne':
    case 'beef':
      return <Beef size={size} color={color} strokeWidth={2} />;
    
    case 'peixe':
    case 'fish':
      return <Fish size={size} color={color} strokeWidth={2} />;
    
    case 'ovo':
    case 'egg':
      return <Egg size={size} color={color} strokeWidth={2} />;
    
    // Ícones gerais
    case 'fire':
      return <Crown size={size} color={color} strokeWidth={2} />;
    case 'star':
      return <Star size={size} color={color} strokeWidth={2} />;
    case 'pizza':
      return <Pizza size={size} color={color} strokeWidth={2} />;
    case 'burger':
      return <Utensils size={size} color={color} strokeWidth={2} />;
    case 'salad':
      return <Utensils size={size} color={color} strokeWidth={2} />;
    case 'coffee':
    case 'café':
    case 'cafe':
      return <Coffee size={size} color={color} strokeWidth={2} />;
    case 'cake':
    case 'dessert':
    case 'sobremesa':
      return <IceCream size={size} color={color} strokeWidth={2} />;
    case 'table':
    case 'chair':
    case 'sushi':
    case 'rice':
      return <Utensils size={size} color={color} strokeWidth={2} />;
    case 'restaurant':
      return <Utensils size={size} color={color} strokeWidth={2} />;
    case 'arrow-right':
      return <ArrowRight size={size} color={color} strokeWidth={2} />;
    case 'bill':
      return <Receipt size={size} color={color} strokeWidth={2} />;
    case 'credit-card':
      return <CreditCard size={size} color={color} strokeWidth={2} />;
    case 'money':
      return <DollarSign size={size} color={color} strokeWidth={2} />;
    case 'pix':
      return <CreditCard size={size} color={color} strokeWidth={2} />;
    case 'check':
      return <CheckCircle size={size} color={color} strokeWidth={2} />;
    case 'admin':
      return <Settings size={size} color={color} strokeWidth={2} />;
    case 'exit':
      return <LogOut size={size} color={color} strokeWidth={2} />;
    case 'refresh':
      return <RefreshCw size={size} color={color} strokeWidth={2} />;
    case 'stats':
      return <BarChart3 size={size} color={color} strokeWidth={2} />;
    case 'plus':
      return <Plus size={size} color={color} strokeWidth={2} />;
    case 'minus':
      return <Minus size={size} color={color} strokeWidth={2} />;
    case 'user':
      return <User size={size} color={color} strokeWidth={2} />;
    case 'child':
      return <Baby size={size} color={color} strokeWidth={2} />;
    case 'bebidas':
      return <CupSoda size={size} color={color} strokeWidth={2} />;
    case 'bebidas alcoólicas':
    case 'bebidas alcoolicas':
      return <Wine size={size} color={color} strokeWidth={2} />;
    case 'vinhos':
      return <Wine size={size} color={color} strokeWidth={2} />;
    default:
      return <Utensils size={size} color={color} strokeWidth={2} />; // Ícone padrão
  }
};

function MainApp() {
  // Keep screen awake to prevent battery-saving sleep mode
  useKeepAwake();
  
  // Estados principais
  const [isLocked, setIsLocked] = useState(false);
  const [password, setPassword] = useState("");
  const [tableNumber, setTableNumber] = useState("");
  const [selectedTable, setSelectedTable] = useState<any>(null);
  const [selectedMode, setSelectedMode] = useState<any>(null);
  const [serviceTypes, setServiceTypes] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<any>(null);
  const [selectedRodizioGroup, setSelectedRodizioGroup] = useState<any>(null);
  
  // Modal de Rodízio (adultos e crianças)
  const [showRodizioModal, setShowRodizioModal] = useState(false);
  const [adultCount, setAdultCount] = useState(1);
  const [childCount, setChildCount] = useState(0);
  const rodizioModalAnim = useRef(new Animated.Value(0)).current;
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [deviceId, setDeviceId] = useState<string>("");
  const [deviceIdLoaded, setDeviceIdLoaded] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  
  // Battery & Remote Command States
  const [batteryLevel, setBatteryLevel] = useState<number | null>(null);
  const [isCharging, setIsCharging] = useState(false);
  const [pendingReload, setPendingReload] = useState(false);
  const [isAppClosed, setIsAppClosed] = useState(false);
  
  // Session Management States
  const [session, setSession] = useState<Session | null>(null);
  const [sessionLoading, setSessionLoading] = useState(false);
  const [showBill, setShowBill] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<"cash" | "credit" | "debit" | "pix">("cash");
  const [sessionTotal, setSessionTotal] = useState(0);
  const [orderHistory, setOrderHistory] = useState<OrderHistory[]>([]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  
  // New states for call waiter and observations
  const [showObservationModal, setShowObservationModal] = useState(false);
  const [selectedProductForObservation, setSelectedProductForObservation] = useState<Product | null>(null);
  const [observationText, setObservationText] = useState("");
  const [showImageModal, setShowImageModal] = useState(false);
  const [imageModalProduct, setImageModalProduct] = useState<Product | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error" | "info">("info");

  // Brightness Control and Kiosk Mode States
  const [originalBrightness, setOriginalBrightness] = useState(1);
  const [isDimmed, setIsDimmed] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  
  // Tablet Settings from Server
  const [tabletSettings, setTabletSettings] = useState<TabletSettings>({
    brightness_enabled: true,
    idle_timeout_seconds: 120,
    dim_brightness: 0.1,
    default_brightness: 0.8,
    touch_to_wake: true,
  });
  const [kioskMode, setKioskMode] = useState(true);
  const [appStats, setAppStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    activeTime: 0,
    lastReset: new Date().toISOString(),
  });

  // Tables States (for proper selection)
  const [tables, setTables] = useState<any[]>([]);  // All tables
  const [availableTables, setAvailableTables] = useState<any[]>([]);  // Filtered tables
  const [tablesLoading, setTablesLoading] = useState(true);
  const [tablesError, setTablesError] = useState("");
  const [tableSearchText, setTableSearchText] = useState("");

  // POS Waiting States
  const [waitingForPOS, setWaitingForPOS] = useState(false);
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);
  const [selectedServiceType, setSelectedServiceType] = useState<any>(null);
  const [showWaitingModal, setShowWaitingModal] = useState(false);

  // Connection Check States - Stable (no flickering)
  const [showConnectionModal, setShowConnectionModal] = useState(true);
  const [appReady, setAppReady] = useState(false);
  const [connectionState, setConnectionState] = useState<'initial' | 'checking' | 'connected' | 'registering' | 'registered' | 'error'>('initial');
  const [connectionError, setConnectionError] = useState('');
  const [tabletRegistered, setTabletRegistered] = useState(false);
  const [registrationInfo, setRegistrationInfo] = useState<{ name?: string; slots_available?: boolean; current_count?: number; max_tablets?: number } | null>(null);
  const connectionCheckRef = useRef<NodeJS.Timeout | null>(null);
  const isCheckingRef = useRef(false);
  const connectionModalOpacity = useRef(new Animated.Value(1)).current;
  const connectionModalClosing = useRef(false);

  // Timers and Refs
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<number>(Date.now());
  const panResponderRef = useRef<any>(null);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const toastAnim = useRef(new Animated.Value(-100)).current;
  const waiterButtonAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(height)).current;
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const cartBounceAnim = useRef(new Animated.Value(1)).current;
  const billSlideAnim = useRef(new Animated.Value(height)).current;
  const promoSlideAnim = useRef(new Animated.Value(0)).current;

  // Sample promotions data
  const promotions: Promotion[] = [
    {
      id: 1,
      title: "🍣 Rodízio Especial",
      description: "Experimente nosso rodízio completo com mais de 50 opções de sushi e sashimi frescos!",
      image: "rodizio",
      price: "R$ 89,90",
      highlight: true,
    },
    {
      id: 2,
      title: "🍹 Happy Hour",
      description: "De segunda a sexta, das 17h às 19h, drinks com 50% de desconto!",
      image: "drinks",
      highlight: false,
    },
    {
      id: 3,
      title: "🎉 Combo Família",
      description: "4 pessoas comem pelo preço de 3 no rodízio. Válido aos domingos!",
      image: "family",
      price: "R$ 269,90",
      highlight: true,
    },
    {
      id: 4,
      title: "🍰 Sobremesa Grátis",
      description: "Peça o rodízio e ganhe uma sobremesa japonesa por conta da casa!",
      image: "dessert",
      highlight: false,
    },
    {
      id: 5,
      title: "📱 Desconto Digital",
      description: "Use nosso app e ganhe 10% de desconto em todos os pedidos!",
      image: "app",
      highlight: true,
    },
  ];

  // Connection check with tablet registration verification - STABLE (no flickering)
  const checkConnection = useCallback(async () => {
    // Prevent concurrent checks
    if (isCheckingRef.current) {
      return false;
    }
    isCheckingRef.current = true;
    
    // Clear any pending retry
    if (connectionCheckRef.current) {
      clearTimeout(connectionCheckRef.current);
      connectionCheckRef.current = null;
    }
    
    // Only show 'checking' on initial load, never during retries
    if (connectionState === 'initial') {
      setConnectionState('checking');
    }
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);
      
      const response = await fetch(`${config.API_BASE_URL}/api/pos/tables`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        console.log('✅ Conectado ao servidor!');
        
        // Only update to 'connected' if we're not already past that stage
        if (connectionState === 'initial' || connectionState === 'checking' || connectionState === 'error') {
          setConnectionState('connected');
        }
        setConnectionError('');
        
        // Now check tablet registration
        try {
          const registerCheckRes = await fetch(`${config.API_BASE_URL}/api/mobile/tablet-register?device_id=${deviceId}`);
          const registerData = await registerCheckRes.json();
          
          if (registerData.registered) {
            // Tablet is already registered
            console.log('✅ Tablet já registrado:', registerData.tablet?.name);
            setTabletRegistered(true);
            setRegistrationInfo({ name: registerData.tablet?.name });
            setConnectionState('registered');
            // appReady will be set after modal closes with animation
          } else if (registerData.slots_available) {
            // Auto-register the tablet
            console.log('📝 Registrando tablet automaticamente...');
            setConnectionState('registering');
            
            const registerRes = await fetch(`${config.API_BASE_URL}/api/mobile/tablet-register`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ device_id: deviceId }),
            });
            
            const registerResult = await registerRes.json();
            
            if (registerResult.success) {
              console.log('✅ Tablet registrado com sucesso:', registerResult.tablet?.name);
              setTabletRegistered(true);
              setRegistrationInfo({ name: registerResult.tablet?.name });
              setConnectionState('registered');
              // appReady will be set after modal closes with animation
            } else {
              setConnectionState('error');
              setConnectionError(registerResult.message || 'Erro ao registrar tablet');
              isCheckingRef.current = false;
              connectionCheckRef.current = setTimeout(() => checkConnection(), 5000);
              return false;
            }
          } else {
            // No slots available
            console.log('❌ Limite de tablets atingido');
            setConnectionState('error');
            setRegistrationInfo({
              slots_available: false,
              current_count: registerData.current_count,
              max_tablets: registerData.max_tablets,
            });
            setConnectionError(`Limite de tablets atingido (${registerData.current_count}/${registerData.max_tablets}). Contate o administrador.`);
            isCheckingRef.current = false;
            connectionCheckRef.current = setTimeout(() => checkConnection(), 10000);
            return false;
          }
        } catch (regError) {
          console.log('⚠️ Erro na verificação de registro, continuando...', regError);
          setTabletRegistered(true);
          setConnectionState('registered');
          // appReady will be set after modal closes with animation
        }
        
        // Fetch settings silently
        try {
          const settingsRes = await fetch(`${config.API_BASE_URL}/api/mobile/tablet-settings`);
          if (settingsRes.ok) {
            const data = await settingsRes.json();
            if (data.success && data.settings) {
              setTabletSettings(prev => ({ ...prev, ...data.settings }));
              if (data.settings.brightness_enabled && data.settings.default_brightness) {
                await Brightness.setBrightnessAsync(data.settings.default_brightness).catch(() => {});
              }
            }
          }
        } catch (e) {}
        
        // Close modal with smooth fade-out after brief success display
        isCheckingRef.current = false;
        
        // Wait 800ms to show success, then fade out
        setTimeout(() => {
          if (connectionModalClosing.current) return; // Prevent double animation
          connectionModalClosing.current = true;
          
          Animated.timing(connectionModalOpacity, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }).start(() => {
            setShowConnectionModal(false);
            // Only set appReady AFTER modal is fully closed to prevent flickering
            setAppReady(true);
          });
        }, 800);
        
        return true;
      } else {
        // Server responded but with error - stay in error state without flashing
        if (connectionState !== 'error') {
          setConnectionState('error');
          setConnectionError('Verifique se o sistema no computador está ligado!');
        }
      }
    } catch (e: any) {
      console.log('⏳ Aguardando servidor...');
      // Only update error state if not already in error (prevents flickering)
      if (connectionState !== 'error') {
        setConnectionState('error');
        setConnectionError('Verifique se o sistema no computador está ligado!');
      }
    }
    
    // Retry silently after 3 seconds (state stays as 'error', no flickering)
    isCheckingRef.current = false;
    connectionCheckRef.current = setTimeout(() => checkConnection(), 3000);
    return false;
  }, [connectionState, deviceId]);

  // Fetch tablet settings from server
  const fetchTabletSettings = useCallback(async () => {
    try {
      const url = `${config.API_BASE_URL}/api/mobile/tablet-settings`;
      console.log('🔧 Buscando configurações do tablet:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });
      
      console.log('🔧 Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('🔧 Dados recebidos:', JSON.stringify(data));
        
        if (data.success && data.settings) {
          setTabletSettings(prev => ({
            ...prev,
            ...data.settings
          }));
          console.log('✅ Configurações do tablet aplicadas:', data.settings);
        }
      } else {
        console.log('⚠️ Resposta não OK:', response.status);
      }
    } catch (error: any) {
      console.log('⚠️ Erro ao buscar configurações:', error?.message || error);
      console.log('⚠️ Usando configurações padrão do tablet');
    }
  }, []);

  // Battery monitoring
  const updateBatteryStatus = useCallback(async () => {
    try {
      const level = await Battery.getBatteryLevelAsync();
      const state = await Battery.getBatteryStateAsync();
      
      setBatteryLevel(Math.round(level * 100));
      setIsCharging(state === Battery.BatteryState.CHARGING || state === Battery.BatteryState.FULL);
    } catch (error) {
      console.log('⚠️ Erro ao obter bateria:', error);
    }
  }, []);

  // Send status to server and check for commands
  const sendStatusAndCheckCommands = useCallback(async () => {
    if (!deviceId || !appReady) return;
    
    try {
      const level = await Battery.getBatteryLevelAsync().catch(() => null);
      const state = await Battery.getBatteryStateAsync().catch(() => Battery.BatteryState.UNKNOWN);
      
      const batteryPercent = level ? Math.round(level * 100) : null;
      const charging = state === Battery.BatteryState.CHARGING || state === Battery.BatteryState.FULL;
      
      if (batteryPercent !== null) {
        setBatteryLevel(batteryPercent);
        setIsCharging(charging);
      }
      
      const response = await fetch(`${config.API_BASE_URL}/api/mobile/tablet-status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          device_id: deviceId,
          battery_level: batteryPercent,
          is_charging: charging,
          app_version: APP_VERSION
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        
        // Process pending commands
        if (data.commands && data.commands.length > 0) {
          for (const cmd of data.commands) {
            await executeCommand(cmd);
          }
        }
      }
    } catch (error) {
      console.log('⚠️ Erro ao enviar status:', error);
    }
  }, [deviceId, appReady]);

  // Execute remote command
  const executeCommand = useCallback(async (command: { id: number; command: string }) => {
    console.log('🎮 Executando comando:', command.command);
    
    try {
      // Mark command as executed
      await fetch(`${config.API_BASE_URL}/api/mobile/tablet-commands`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          command_id: command.id,
          status: 'executed',
          device_id: deviceId
        })
      });
      
      switch (command.command) {
        case 'reload':
          console.log('🔄 Recarregando aplicativo...');
          setPendingReload(true);
          // Reset all states to initial
          setTableNumber("");
          setSelectedTable(null);
          setSession(null);
          setCart([]);
          setSelectedMode(null);
          loadCategories();
          loadProducts();
          loadTables();
          setPendingReload(false);
          break;
          
        case 'sync_settings':
          console.log('⚙️ Sincronizando configurações...');
          fetchTabletSettings();
          break;
          
        case 'exit_app':
        case 'close_app':
          console.log('🚪 Comando de fechar app recebido - Encerrando...');
          setIsAppClosed(true);
          try {
            await Brightness.setBrightnessAsync(0);
          } catch (e) {
            console.log('Erro ao ajustar brilho:', e);
          }
          if (Platform.OS === 'android') {
            setTimeout(() => {
              BackHandler.exitApp();
            }, 500);
          }
          break;
          
        case 'lock':
          console.log('🔒 Bloqueando tablet...');
          setKioskMode(true);
          break;
          
        case 'unlock':
          console.log('🔓 Desbloqueando tablet...');
          setKioskMode(false);
          break;
          
        default:
          console.log('⚠️ Comando desconhecido:', command.command);
      }
    } catch (error) {
      console.log('⚠️ Erro ao executar comando:', error);
    }
  }, [deviceId, fetchTabletSettings]);

  // Brightness management
  const resetIdleTimer = useCallback(async () => {
    lastActivityRef.current = Date.now();
    
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
    }
    
    // If brightness control is disabled, do nothing
    if (!tabletSettings.brightness_enabled) {
      return;
    }
    
    // Restore brightness if dimmed
    if (isDimmed) {
      try {
        await Brightness.setBrightnessAsync(tabletSettings.default_brightness);
        setIsDimmed(false);
      } catch (error) {
        console.error('Error restoring brightness:', error);
      }
    }
    
    // Set timer to dim after configured time
    const timeoutMs = tabletSettings.idle_timeout_seconds * 1000;
    idleTimerRef.current = setTimeout(async () => {
      try {
        // Dim to configured brightness level
        await Brightness.setBrightnessAsync(tabletSettings.dim_brightness);
        setIsDimmed(true);
      } catch (error) {
        console.error('Error dimming screen:', error);
      }
    }, timeoutMs);
  }, [isDimmed, tabletSettings]);

  // Long press handlers for admin panel
  const handleLongPressStart = useCallback(() => {
    longPressTimerRef.current = setTimeout(() => {
      setShowAdminPanel(true);
    }, LONG_PRESS_DURATION);
  }, []);

  const handleLongPressEnd = useCallback(() => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  }, []);

  // Pan Responder for touch tracking
  useEffect(() => {
    panResponderRef.current = PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: () => false,
      onStartShouldSetPanResponderCapture: () => false,
      onMoveShouldSetPanResponderCapture: () => false,
      onPanResponderGrant: () => {
        resetIdleTimer();
      },
      onPanResponderMove: () => {
        resetIdleTimer();
      },
    });
  }, [resetIdleTimer]);

  // STEP 0: Load persistent device ID on app start
  useEffect(() => {
    const initDeviceId = async () => {
      const id = await getOrCreateDeviceId();
      setDeviceId(id);
      setDeviceIdLoaded(true);
    };
    initDeviceId();
  }, []);

  // STEP 1: Initialize connection check AFTER device ID is loaded
  useEffect(() => {
    if (!deviceIdLoaded || !deviceId) return; // Wait for device ID
    
    // Initialize brightness control
    const initBrightness = async () => {
      try {
        const { status } = await Brightness.requestPermissionsAsync();
        if (status === 'granted') {
          const current = await Brightness.getBrightnessAsync();
          setOriginalBrightness(current);
        }
      } catch (error) {}
    };
    
    initBrightness();
    checkConnection(); // Simple API check
    
    // Kiosk mode back button handler
    let backHandler: any = null;
    if (Platform.OS === 'android' && kioskMode) {
      backHandler = BackHandler.addEventListener('hardwareBackPress', () => true);
    }
    
    // Cleanup function
    return () => {
      // Clear connection check timer on unmount
      if (connectionCheckRef.current) {
        clearTimeout(connectionCheckRef.current);
        connectionCheckRef.current = null;
      }
      isCheckingRef.current = false;
      if (backHandler) {
        backHandler.remove();
      }
    };
  }, [deviceIdLoaded, deviceId]);

  // STEP 2: Only load data AFTER connections are verified
  useEffect(() => {
    if (!appReady) return; // Wait until all connections are OK
    
    console.log('🚀 App pronto! Carregando dados...');
    
    // Now load all data
    loadCategories();
    loadProducts();
    loadTables();
    loadServiceTypes();
    
    // Initialize idle timer
    resetIdleTimer();
    
    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: config.animations.slow,
      useNativeDriver: true,
    }).start();
    
    // Atualização automática silenciosa a cada 5 segundos
    const tablesInterval = setInterval(async () => {
      if (!appReady) return; // Skip if not ready
      try {
        const response = await fetch(`${config.API_BASE_URL}/api/pos/tables`);
        if (!response.ok) return; // Silent fail
        const data = await response.json();
        
        if (data.success && data.tables) {
          const currentTables = data.tables;
          setTables(currentTables);
          
          if (tableSearchText?.trim()) {
            const filtered = currentTables.filter((t: any) => 
              t.number.toString().includes(tableSearchText)
            );
            setAvailableTables(filtered);
          } else {
            setAvailableTables(currentTables);
          }
        }
      } catch (error) {
        // Silent fail
      }
    }, 5000);

    // Reload tablet settings every 30 seconds
    const settingsInterval = setInterval(() => {
      if (appReady) fetchTabletSettings();
    }, 30000);
    
    // Send status and check for commands every 10 seconds
    sendStatusAndCheckCommands(); // Initial call
    const statusInterval = setInterval(() => {
      if (appReady && deviceId) sendStatusAndCheckCommands();
    }, 10000);
    
    return () => {
      clearInterval(tablesInterval);
      clearInterval(settingsInterval);
      clearInterval(statusInterval);
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current);
      }
      Brightness.setBrightnessAsync(tabletSettings.default_brightness).catch(console.error);
    };
  }, [appReady, tableSearchText, deviceId, sendStatusAndCheckCommands]);


  // Check or create session when table is selected and mode is chosen
  useEffect(() => {
    if (tableNumber && selectedMode) {
      checkSessionFromPOS();
      // Show waiter button animation
      Animated.spring(waiterButtonAnim, {
        toValue: 1,
        friction: 5,
        tension: 40,
        useNativeDriver: true,
      }).start();
    }
  }, [tableNumber, selectedMode]);

  // Load order history when session is loaded
  useEffect(() => {
    if (session) {
      loadSessionOrders();
    }
  }, [session?.id]);

  // Log when group changes (loading is done directly in onPress for faster response)
  useEffect(() => {
    if (selectedGroup) {
      console.log(`🔄 Grupo ativo: ${selectedGroup.name} (ID: ${selectedGroup.id})`);
    }
  }, [selectedGroup?.id]);

  // Auto-reset after successful order
  const autoResetAfterOrder = useCallback(() => {
    setTimeout(() => {
      setCart([]);
      setSearchText("");
      setSelectedCategory(null);
      resetIdleTimer();
    }, 5000); // Reset after 5 seconds
  }, [resetIdleTimer]);


  // Admin panel actions
  const handleExitKioskMode = () => {
    Alert.alert(
      "Sair do Modo Kiosk",
      "Tem certeza que deseja sair do modo kiosk? O app poderá ser fechado.",
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Sair", 
          style: "destructive",
          onPress: () => {
            setKioskMode(false);
            setShowAdminPanel(false);
            Alert.alert("Modo Kiosk", "Modo kiosk desativado. Você pode fechar o app agora.");
          }
        }
      ]
    );
  };

  const handleRestartApp = () => {
    Alert.alert(
      "Reiniciar App",
      "Tem certeza que deseja reiniciar o aplicativo?",
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Reiniciar", 
          style: "destructive",
          onPress: () => {
            // Clear all data
            setTableNumber("");
            setSelectedMode(null);
            setCart([]);
            setSession(null);
            setSessionTotal(0);
            setOrderHistory([]);
            setShowAdminPanel(false);
            resetIdleTimer();
          }
        }
      ]
    );
  };

  const handleViewStats = () => {
    Alert.alert(
      "📊 Estatísticas do App",
      `Total de Pedidos: ${appStats.totalOrders}\n` +
      `Receita Total: R$ ${appStats.totalRevenue.toFixed(2)}\n` +
      `Tempo Ativo: ${Math.floor(appStats.activeTime / 60)} minutos\n` +
      `Último Reset: ${new Date(appStats.lastReset).toLocaleString('pt-BR')}`,
      [{ text: "OK" }]
    );
  };

  const checkSessionFromPOS = async () => {
    setSessionLoading(true);
    try {
      // APENAS verificar se existe sessão aberta no POS - NUNCA criar!
      const checkResponse = await fetch(`${config.POS_API.session}?table_number=${tableNumber}`);
      const checkData = await checkResponse.json();
      
      if (checkData.success && checkData.session) {
        // Sessão encontrada - mesa foi aberta pelo POS
        setSession(checkData.session);
        setSessionTotal(checkData.session.total || 0);
        console.log("✅ Mesa aberta no POS encontrada:", checkData.session);
        return true;
      } else {
        // Nenhuma sessão - mesa não foi aberta no POS ainda
        setSession(null);
        console.log("⚠️ Mesa não está aberta no POS");
        return false;
      }
    } catch (error) {
      console.error("Erro ao verificar sessão no POS:", error);
      return false;
    } finally {
      setSessionLoading(false);
    }
  };

  // Iniciar polling para aguardar POS abrir mesa
  const startPOSPolling = () => {
    console.log("🔄 Iniciando polling - aguardando POS abrir mesa...");
    
    // Limpar polling anterior se existir
    if (pollingInterval) {
      clearInterval(pollingInterval);
    }
    
    // Verificar a cada 5 segundos
    const interval = setInterval(async () => {
      console.log("🔍 Verificando se POS abriu a mesa...");
      const sessionFound = await checkSessionFromPOS();
      
      if (sessionFound) {
        console.log("✅ Mesa aberta pelo POS! Parando polling.");
        stopPOSPolling();
        setWaitingForPOS(false);
        setShowWaitingModal(false);
        
        // Se tiver tipo de serviço selecionado, processar
        if (selectedServiceType) {
          handleServiceTypeSelected(selectedServiceType);
        }
      }
    }, 5000); // 5 segundos
    
    setPollingInterval(interval);
  };

  // Parar polling
  const stopPOSPolling = () => {
    if (pollingInterval) {
      clearInterval(pollingInterval);
      setPollingInterval(null);
      console.log("⏹️ Polling parado");
    }
  };

  // Processar tipo de serviço selecionado
  const handleServiceTypeSelected = async (serviceType: any) => {
    // Se for rodízio, verificar se já existe antes de abrir modal
    if (serviceType.linked_groups?.length > 0) {
      const firstGroup = serviceType.linked_groups[0];
      if (firstGroup.type === 'rodizio' && firstGroup.price) {
        // VERIFICAR SE JÁ TEM RODÍZIO LANÇADO
        console.log("🔍 Verificando se já tem rodízio lançado...");
        const hasRodizio = await checkForExistingRodizio(tableNumber);
        
        if (hasRodizio) {
          console.log("✅ Rodízio já existe! Entrando direto no catálogo");
          // Se já tem rodízio, ir direto para o catálogo
          setSelectedMode(serviceType);
          // Carregar categorias e produtos
          await loadCategories();
          await loadProducts();
          return;
        }
        
        console.log("❌ Não tem rodízio ainda, mostrando modal");
        // Se não tem, mostrar modal
        setSelectedMode(serviceType);
        setShowRodizioModal(true);
        // Animate modal
        Animated.spring(rodizioModalAnim, {
          toValue: 1,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }).start();
        return;
      }
    }
    
    // Para outros tipos, apenas selecionar
    setSelectedMode(serviceType);
    console.log("✅ Tipo de atendimento selecionado:", serviceType.name);
  };

  const loadSessionOrders = async () => {
    if (!session?.id) return;
    
    try {
      const response = await fetch(`${config.POS_API.order}?session_id=${session.id}`);
      const data = await response.json();
      
      if (data.success) {
        setOrderHistory(data.orders || []);
        
        // Calculate total from orders
        const total = data.orders.reduce((sum: number, order: any) => 
          sum + (order.total || 0), 0
        );
        setSessionTotal(total);
      }
    } catch (error) {
      console.error("Erro ao carregar pedidos da sessão:", error);
    }
  };

  // Função para verificar se existe rodízio já lançado na mesa
  const checkForExistingRodizio = async (tableNumber: string): Promise<boolean> => {
    try {
      console.log(`🔍 Verificando rodízio para mesa ${tableNumber}...`);
      
      // Primeiro, encontrar o ID da mesa pelo número
      const table = tables.find(t => t.number.toString() === tableNumber.toString());
      if (!table) {
        console.log(`❌ Mesa ${tableNumber} não encontrada`);
        return false;
      }
      
      // Chamar API do POS para verificar pedidos da mesa usando table_id
      const response = await fetch(
        `https://0cf83c93-8147-42e6-967b-30b169de3e65-00-1uqldc8o7pfpx.spock.replit.dev/api/pos/orders-by-table?table_id=${table.id}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        console.log("❌ Erro ao buscar pedidos da mesa:", response.status);
        return false;
      }

      const data = await response.json();
      
      // Verificar se existe algum pedido de rodízio
      if (data.orders && data.orders.length > 0) {
        const hasRodizio = data.orders.some((order: any) => {
          // Verificar se o pedido tem itens de rodízio nos order_items
          return order.order_items && order.order_items.some((item: any) => {
            // Verificar em vários campos possíveis
            const checkFields = [
              item.product_name,
              item.notes,
              item.metadata?.name,
              item.metadata?.category
            ];
            
            // Log para debug
            if (item.metadata) {
              console.log(`Item ${item.id}: metadata=`, item.metadata);
            }
            
            return checkFields.some(field => 
              field && (
                field.toLowerCase().includes('rodízio') || 
                field.toLowerCase().includes('rodizio') ||
                field.toLowerCase().includes('premium') ||
                field.toLowerCase().includes('tradicional')
              )
            );
          });
        });
        
        console.log(`✅ Rodízio ${hasRodizio ? 'encontrado' : 'não encontrado'} para mesa ${tableNumber} (ID: ${table.id})`);
        return hasRodizio;
      }
      
      console.log(`❌ Nenhum pedido encontrado para mesa ${tableNumber} (ID: ${table.id})`);
      return false;
    } catch (error) {
      console.error("Erro ao verificar rodízio existente:", error);
      return false;
    }
  };

  const getGroupIdFromMode = (mode: any): number | null => {
    if (!mode) return null;
    
    // Map service types to group IDs based on linked groups
    if (mode.linked_groups && mode.linked_groups.length > 0) {
      // Use the first linked group's ID
      return mode.linked_groups[0].id;
    }
    
    // Fallback to type-based mapping
    if (mode.type === 'rodizio') {
      // Check if it's premium or traditional
      if (mode.name?.includes('Premium')) {
        return 1; // Rodízio Premium
      } else if (mode.name?.includes('Tradicional')) {
        return 2; // Rodízio Tradicional
      }
      return 1; // Default to premium
    } else if (mode.type === 'a_la_carte') {
      return 3; // À la Carte
    }
    
    return null;
  };

  const loadCategories = async (groupId?: number | null) => {
    setLoadingCategories(true);
    try {
      // Use o grupo passado, ou o selectedGroup, ou fallback para o modo
      const targetGroupId = groupId ?? selectedGroup?.id ?? getGroupIdFromMode(selectedMode);
      const url = targetGroupId 
        ? `${config.CATALOG_API.categories}?group_id=${targetGroupId}`
        : config.CATALOG_API.categories;
      
      console.log(`📦 Carregando categorias do grupo ${targetGroupId}:`, url);
      
      const response = await fetch(url);
      const data = await response.json();
      if (data.success) {
        // Add colors to categories
        const categoriesWithColors = data.categories.map((cat: Category, index: number) => ({
          ...cat,
          color: config.colors.categoryColors[index % config.colors.categoryColors.length]
        }));
        setCategories(categoriesWithColors);
        // Selecionar automaticamente a primeira categoria
        if (categoriesWithColors.length > 0) {
          setSelectedCategory(categoriesWithColors[0].id);
        }
        console.log(`✅ ${categoriesWithColors.length} categorias carregadas para grupo ${targetGroupId}`);
      }
    } catch (error) {
      console.error("Erro ao carregar categorias:", error);
      Alert.alert("Erro", "Não foi possível carregar as categorias");
    } finally {
      setLoadingCategories(false);
    }
  };

  const loadProducts = async (groupId?: number | null) => {
    setLoadingProducts(true);
    try {
      // Use o grupo passado, ou o selectedGroup, ou fallback para o modo
      const targetGroupId = groupId ?? selectedGroup?.id ?? getGroupIdFromMode(selectedMode);
      const url = targetGroupId
        ? `${config.CATALOG_API.products}?group_id=${targetGroupId}`
        : config.CATALOG_API.products;
      
      console.log(`📦 Carregando produtos do grupo ${targetGroupId}:`, url);
      
      const response = await fetch(url);
      const data = await response.json();
      if (data.success) {
        setProducts(data.products);
        console.log(`✅ ${data.products.length} produtos carregados para grupo ${targetGroupId}`);
      }
    } catch (error) {
      console.error("Erro ao carregar produtos:", error);
      Alert.alert("Erro", "Não foi possível carregar os produtos");
    } finally {
      setLoadingProducts(false);
    }
  };

  // FUNÇÃO REMOVIDA - agora usamos direto o ícone que vem do admin

  const loadGroups = async () => {
    try {
      console.log("📦 Carregando todos os grupos:", config.CATALOG_API.groups);
      const response = await fetch(config.CATALOG_API.groups);
      const data = await response.json();
      
      if (Array.isArray(data)) {
        console.log(`✅ ${data.length} grupos carregados:`, data.map((g: any) => g.name).join(', '));
        setGroups(data);
        
        // Auto-select first group if no group is selected yet
        if (data.length > 0 && !selectedGroup) {
          setSelectedGroup(data[0]);
          console.log(`📌 Grupo selecionado automaticamente: ${data[0].name}`);
        }
      }
    } catch (error) {
      console.error("❌ Erro ao carregar grupos:", error);
    }
  };

  const loadServiceTypes = async () => {
    try {
      // Carregar grupos primeiro
      await loadGroups();
      
      // Usar API do POS para buscar service types (single source of truth)
      console.log("📋 Carregando tipos de atendimento da API do POS:", config.POS_API.serviceTypes);
      const response = await fetch(config.POS_API.serviceTypes);
      const data = await response.json();
      
      if (data.success) {
        console.log("✅ Tipos de atendimento recebidos:", data.serviceTypes);
        
        // Process service types - ÍCONE JÁ VEM CORRETO DO ADMIN
        const processedTypes = data.serviceTypes.map((type: any) => {
          console.log(`🎨 Service Type: ${type.name}, Ícone recebido: ${type.icon}`);
          return {
            ...type,
            // NÃO SOBRESCREVER O ÍCONE - já vem correto do admin (crown, utensils, menu-book)
            icon: type.icon || 'restaurant', // Usa o ícone do admin ou fallback
            color: type.color || '#FF7043', // Use default orange if no color
            linked_group_id: type.linked_groups?.[0]?.id // Use first linked group ID
          };
        });
        setServiceTypes(processedTypes);
      } else {
        console.error("❌ Erro ao carregar tipos de atendimento:", data);
        // Usar tipos padrão se falhar
        setServiceTypes([
          {
            id: 1,
            name: 'Rodízio',
            description: 'Coma à vontade com valor fixo',
            icon: 'fire',
            color: '#FF7043'
          },
          {
            id: 2,
            name: 'À La Carte',
            description: 'Escolha e pague por item',
            icon: 'menu-book',
            color: '#FF7043'
          }
        ]);
      }
    } catch (error) {
      console.error("❌ Erro ao carregar tipos de atendimento:", error);
      // Usar tipos padrão se falhar
      setServiceTypes([
        {
          id: 1,
          name: 'Rodízio',
          description: 'Coma à vontade com valor fixo',
          icon: 'fire',
          color: '#FF7043'
        },
        {
          id: 2,
          name: 'À La Carte',
          description: 'Escolha e pague por item',
          icon: 'menu-book',
          color: '#FF7043'
        }
      ]);
    }
  };

  const loadTables = async () => {
    setTablesLoading(true);
    setTablesError("");
    
    // Usar API do POS para buscar mesas (single source of truth)
    const apiUrl = config.POS_API.tables;
    console.log("🔍 Carregando mesas da API do POS:", apiUrl);
    console.log("📍 URL completa:", apiUrl);
    
    try {
      console.log("🚀 Fazendo requisição...");
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log("📡 Response status:", response.status);
      console.log("📡 Response ok:", response.ok);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ Erro na resposta:", errorText);
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }
      
      const data = await response.json();
      
      if (data.success && data.tables) {
        setTables(data.tables);  // Set all tables
        setAvailableTables(data.tables);  // Initially show all tables
        console.log(`📊 Total de mesas: ${data.total}, Disponíveis: ${data.available}, Ocupadas: ${data.occupied}`);
        setTablesError("");  // Clear any previous error
      } else {
        const errorMsg = data.error || "Erro ao carregar mesas";
        setTablesError(errorMsg);
        console.error("❌ Erro na resposta da API:", data);
      }
    } catch (error: any) {
      console.error("❌ Erro ao carregar mesas:", error);
      console.error("❌ Tipo do erro:", error.constructor.name);
      console.error("❌ Stack do erro:", error.stack);
      console.error("❌ Mensagem do erro:", error.message);
      
      // Mensagem mais específica sobre o erro
      let errorMessage = "Erro ao conectar ao servidor";
      
      if (error.message.includes('Network request failed')) {
        errorMessage = "Erro de rede: Verifique sua conexão com a internet";
      } else if (error.message.includes('Failed to fetch')) {
        errorMessage = "Falha ao conectar: O servidor pode estar fora do ar";
      } else if (error.message.includes('HTTP error')) {
        errorMessage = error.message;
      } else {
        errorMessage = `Erro: ${error.message || 'Falha na conexão'}`;
      }
      
      setTablesError(errorMessage);
      console.log("🔴 Erro mostrado ao usuário:", errorMessage);
    } finally {
      setTablesLoading(false);
    }
  };

  // Check if rodízio already exists on table - DIRECT POS CHECK
  const checkRodizioExists = async (tableNumber: string): Promise<boolean> => {
    try {
      console.log("🔍 Verificando se já existe rodízio na mesa:", tableNumber);
      
      // Buscar a mesa direto no POS para pegar o table_id
      const tablesResponse = await fetch(`${config.POS_API.tables}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!tablesResponse.ok) {
        console.log("⚠️ Não conseguiu buscar mesas");
        return false;
      }
      
      const tablesData = await tablesResponse.json();
      // number é VARCHAR no banco, não INTEGER!
      const table = tablesData.tables?.find((t: any) => t.number === tableNumber || t.number === parseInt(tableNumber).toString());
      
      if (!table) {
        console.log("⚠️ Mesa não encontrada");
        return false;
      }
      
      const tableId = table.id;
      console.log("📋 Mesa encontrada com ID:", tableId, "- buscando pedidos");
      
      // Buscar TODOS os pedidos da mesa (pendentes/confirmados)
      const ordersUrl = `https://0cf83c93-8147-42e6-967b-30b169de3e65-00-1uqldc8o7pfpx.spock.replit.dev/api/pos/orders-by-table?table_id=${tableId}`;
      console.log("🔍 Buscando pedidos em:", ordersUrl);
      
      const response = await fetch(ordersUrl, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!response.ok) {
        console.log("⚠️ Não foi possível verificar pedidos (tentando API alternativa)");
        
        // Tentar API alternativa /api/orders
        const altResponse = await fetch(`${config.API_BASE_URL}/api/orders`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        });
        
        if (altResponse.ok) {
          const altData = await altResponse.json();
          // Filtrar pedidos desta mesa manualmente
          const tableOrders = altData.orders?.filter((o: any) => 
            o.table_id === tableId && 
            (o.status === 'pending' || o.status === 'confirmed' || o.status === 'preparing')
          ) || [];
          
          return checkOrdersForRodizio(tableOrders);
        }
        return false;
      }
      
      const data = await response.json();
      console.log("📦 Resposta dos pedidos:", data);
      
      return checkOrdersForRodizio(data.orders || []);
      
    } catch (error) {
      console.error("❌ Erro ao verificar rodízio:", error);
      return false;
    }
  };
  
  // Helper function to check orders for rodizio items
  const checkOrdersForRodizio = (orders: any[]): boolean => {
    if (!orders || orders.length === 0) {
      console.log("❌ Nenhum pedido encontrado");
      return false;
    }
    
    // Verificar cada pedido
    for (const order of orders) {
      // Verificar em order_items
      if (order.order_items && Array.isArray(order.order_items)) {
        const hasRodizio = order.order_items.some((item: any) => {
          // Checar notes/observation
          const notes = (item.notes || item.observation || '').toLowerCase();
          const hasInNotes = notes.includes('rodízio') || 
                             notes.includes('rodizio') ||
                             notes.includes('tradicional') ||
                             notes.includes('premium');
          
          // Checar metadata
          if (item.metadata) {
            const metadata = typeof item.metadata === 'string' ? 
              JSON.parse(item.metadata) : item.metadata;
            const hasInMetadata = metadata.type === 'rodizio' ||
                                 metadata.name?.toLowerCase().includes('rodízio') ||
                                 metadata.name?.toLowerCase().includes('rodizio');
            
            console.log(`Item ${item.id}: notes="${notes}", metadata=${JSON.stringify(metadata)}, hasRodizio=${hasInNotes || hasInMetadata}`);
            return hasInNotes || hasInMetadata;
          }
          
          console.log(`Item ${item.id}: notes="${notes}", hasRodizio=${hasInNotes}`);
          return hasInNotes;
        });
        
        if (hasRodizio) {
          console.log("✅ Rodízio já foi lançado nesta mesa!");
          return true;
        }
      }
    }
    
    console.log("❌ Nenhum rodízio encontrado nos pedidos");
    return false;
  };

  // Show toast notification
  const showToastNotification = (message: string, type: "success" | "error" | "info" = "info") => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    
    // Animate toast in
    Animated.spring(toastAnim, {
      toValue: 20,
      friction: 8,
      tension: 40,
      useNativeDriver: true,
    }).start();
    
    // Hide after 3 seconds
    setTimeout(() => {
      Animated.timing(toastAnim, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setShowToast(false);
      });
    }, 3000);
  };

  // Call waiter function
  const callWaiter = async () => {
    resetIdleTimer();
    try {
      const response = await fetch(config.CATALOG_API.callWaiter, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          table_number: tableNumber,
          session_id: session?.id,
          message: `Mesa ${tableNumber} está chamando o garçom`,
        }),
      });

      const data = await response.json();

      if (data.success) {
        showToastNotification("🔔 Garçom foi chamado! Aguarde um momento.", "success");
        // Vibration feedback if available
        if (window.navigator && window.navigator.vibrate) {
          window.navigator.vibrate(200);
        }
      } else {
        showToastNotification("Erro ao chamar garçom. Tente novamente.", "error");
      }
    } catch (error) {
      console.error("Erro ao chamar garçom:", error);
      showToastNotification("Erro ao chamar garçom. Verifique sua conexão.", "error");
    }
  };

  // Handle add to cart with observation
  const handleAddToCart = (product: Product) => {
    resetIdleTimer();
    setSelectedProductForObservation(product);
    setObservationText("");
    setShowObservationModal(true);
  };

  // Handle remove from cart (decrease quantity or remove)
  const handleRemoveFromCart = (productId: number) => {
    setCart(prev => {
      const existingItem = prev.find((item) => item.id === productId);
      if (!existingItem) return prev;
      
      if (existingItem.quantity > 1) {
        return prev.map((item) =>
          item.id === productId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        );
      } else {
        return prev.filter((item) => item.id !== productId);
      }
    });
  };

  // Handle quick add to cart (without observation modal)
  const handleQuickAddToCart = (product: Product) => {
    setCart(prev => {
      const existingItem = prev.find((item) => item.id === product.id && !item.observation);
      if (existingItem) {
        return prev.map((item) =>
          item.id === product.id && !item.observation
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prev, { ...product, quantity: 1 }];
      }
    });
  };

  // Confirm add to cart with observation
  const confirmAddToCart = () => {
    if (selectedProductForObservation) {
      const productWithObservation = {
        ...selectedProductForObservation,
        observation: observationText,
      };
      
      // Bounce animation
      Animated.sequence([
        Animated.spring(cartBounceAnim, {
          toValue: 1.2,
          useNativeDriver: true,
        }),
        Animated.spring(cartBounceAnim, {
          toValue: 1,
          useNativeDriver: true,
        }),
      ]).start();

      const existingItem = cart.find((item) => 
        item.id === selectedProductForObservation.id && 
        item.observation === observationText
      );

      if (existingItem) {
        setCart(
          cart.map((item) =>
            item.id === selectedProductForObservation.id && item.observation === observationText
              ? { ...item, quantity: item.quantity + 1 }
              : item
          )
        );
      } else {
        setCart([...cart, { ...productWithObservation, quantity: 1 }]);
      }
      
      setShowObservationModal(false);
      setSelectedProductForObservation(null);
      setObservationText("");
      
      showToastNotification(
        observationText 
          ? `${selectedProductForObservation.name} adicionado com observação` 
          : `${selectedProductForObservation.name} adicionado ao carrinho`,
        "success"
      );
    }
  };

  const getFilteredProducts = () => {
    let filtered = products;

    // Filter by search
    if (searchText) {
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(searchText.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter((p) => p.category_id === selectedCategory);
    }

    return filtered;
  };

  const updateQuantity = (productId: number, quantity: number) => {
    resetIdleTimer();
    if (quantity === 0) {
      setCart(cart.filter((item) => item.id !== productId));
    } else {
      setCart(
        cart.map((item) =>
          item.id === productId ? { ...item, quantity } : item
        )
      );
    }
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => {
      return total + parseFloat(item.price) * item.quantity;
    }, 0);
  };

  const sendOrder = async () => {
    if (cart.length === 0) return;

    setLoading(true);
    resetIdleTimer();
    
    try {
      // Preparar dados para API do POS
      const orderData = {
        session_id: session?.id, // POS API precisa do session_id
        source: 'tablet', // Identificar origem como tablet
        items: cart.map((item) => ({
          name: item.name,
          price: parseFloat(item.price),
          quantity: item.quantity,
          category: item.category,
          observation: item.observation || "",
        })),
      };

      const response = await fetch(config.POS_API.order, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      const data = await response.json();

      if (data.success) {
        // Update stats
        setAppStats(prev => ({
          ...prev,
          totalOrders: prev.totalOrders + 1,
          totalRevenue: prev.totalRevenue + getCartTotal(),
        }));
        
        // Update session total
        const orderTotal = getCartTotal();
        setSessionTotal(prevTotal => prevTotal + orderTotal);
        
        setCart([]);
        setShowCart(false);
        
        // Reload orders
        loadSessionOrders();
        
        // Auto-reset after order
        autoResetAfterOrder();
        
        // Show enhanced success message with print status
        const printStatusIcon = data.print_status === 'sent_to_kitchen' ? '✅' : '⚠️';
        const printStatusMessage = data.print_status === 'sent_to_kitchen' 
          ? 'Pedido enviado para cozinha!' 
          : 'Pedido criado (impressora não configurada)';
        
        const estimatedTime = data.order?.estimated_preparation_time 
          ? `\nTempo estimado: ${data.order.estimated_preparation_time}` 
          : '';
        
        const printJobsInfo = data.order?.print_jobs_count > 0
          ? `\n${data.order.print_jobs_count} impressora(s) notificada(s)`
          : '';

        Alert.alert(
          `${printStatusIcon} Pedido Confirmado`,
          `${printStatusMessage}\n\nPedido #${data.order.numero}\nMesa: ${tableNumber}${estimatedTime}${printJobsInfo}\n\n${data.message || 'Pedido processado com sucesso!'}`,
          [
            {
              text: "OK",
              onPress: () => {
                setShowSuccess(true);
                // Success animation
                Animated.spring(scaleAnim, {
                  toValue: 1,
                  friction: 3,
                  tension: 40,
                  useNativeDriver: true,
                }).start();

                setTimeout(() => {
                  setShowSuccess(false);
                  scaleAnim.setValue(0);
                }, 4000);
              }
            }
          ]
        );
      } else {
        Alert.alert("❌ Erro", data.error || data.message || "Erro ao enviar pedido");
      }
    } catch (error) {
      console.error("Erro ao enviar pedido:", error);
      Alert.alert("Erro", "Erro ao enviar pedido. Verifique sua conexão.");
    } finally {
      setLoading(false);
    }
  };

  const handleCloseBill = async () => {
    if (!session?.id) return;
    
    setLoading(true);
    resetIdleTimer();
    
    try {
      const response = await fetch(`${config.API_URL}/session/${session.id}/close`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          payment_method: selectedPaymentMethod,
          discount: 0,
          tip: 0,
        }),
      });

      const data = await response.json();

      if (data.success) {
        Alert.alert(
          "Conta Fechada",
          `Mesa ${tableNumber} fechada com sucesso!\nTotal: R$ ${data.session.total.toFixed(2)}`,
          [{
            text: "OK",
            onPress: () => {
              // Reset app state - full reset
              setSession(null);
              setSessionTotal(0);
              setOrderHistory([]);
              setCart([]);
              setSelectedMode(null);
              setTableNumber("");
              setShowBill(false);
              setShowPaymentModal(false);
              setSearchText("");
              setSelectedCategory(null);
              resetIdleTimer();
            }
          }]
        );
      } else {
        Alert.alert("Erro", "Erro ao fechar conta");
      }
    } catch (error) {
      console.error("Erro ao fechar conta:", error);
      Alert.alert("Erro", "Erro ao fechar conta. Verifique sua conexão.");
    } finally {
      setLoading(false);
    }
  };

  const handleUnlock = () => {
    if (password === config.ADMIN_PASSWORD) {
      setIsLocked(false);
      setPassword("");
    } else {
      Alert.alert("Erro", "Senha incorreta");
      setPassword("");
    }
  };

  const handleAdminLogin = () => {
    if (adminPassword === KIOSK_PIN) {
      setAdminPassword("");
      // Admin panel is already shown
    } else {
      Alert.alert("Erro", "PIN incorreto. Use 1234 para acessar o painel admin.");
      setAdminPassword("");
    }
  };

  const calculateBillTotals = () => {
    const subtotal = sessionTotal;
    const serviceFee = subtotal * 0.1; // 10% service fee
    const total = subtotal + serviceFee;
    
    return {
      subtotal,
      serviceFee,
      total,
    };
  };


  // Connection Modal - shows connecting/connected/registering/registered/error states (STABLE - no flickering)
  const ConnectionModal = () => (
    <Modal
      visible={showConnectionModal}
      animationType="none"
      transparent={true}
      onRequestClose={() => {}}
    >
      <Animated.View style={[styles.connectionModalOverlay, { opacity: connectionModalOpacity }]}>
        <View style={styles.connectionModalSimple}>
          <Image
            source={require('./assets/logo232.png')}
            style={{ width: 100, height: 100, borderRadius: 50, marginBottom: 24 }}
            resizeMode="contain"
          />
          
          {connectionState === 'registered' ? (
            <>
              <CheckCircle size={48} color="#4CAF50" />
              <Text style={styles.connectionTitleSimple}>Tablet Ativado!</Text>
              {registrationInfo?.name && (
                <Text style={styles.connectionSubtitle}>{registrationInfo.name}</Text>
              )}
            </>
          ) : connectionState === 'registering' ? (
            <>
              <ActivityIndicator size="large" color={config.colors.primary} />
              <Text style={styles.connectionTitleSimple}>Ativando tablet...</Text>
              <Text style={styles.connectionSubtitle}>Aguarde um momento</Text>
            </>
          ) : connectionState === 'connected' ? (
            <>
              <ActivityIndicator size="large" color={config.colors.primary} />
              <Text style={styles.connectionTitleSimple}>Verificando ativação...</Text>
            </>
          ) : connectionState === 'error' ? (
            <>
              <AlertCircle size={48} color="#FF6B6B" />
              <Text style={styles.connectionTitleSimple}>Aguardando Sistema</Text>
              <Text style={styles.connectionErrorText}>{connectionError}</Text>
              <View style={styles.connectionRetrying}>
                <ActivityIndicator size="small" color={config.colors.primary} />
                <Text style={styles.connectionRetryingText}>Reconectando automaticamente...</Text>
              </View>
            </>
          ) : (
            <>
              <ActivityIndicator size="large" color={config.colors.primary} />
              <Text style={styles.connectionTitleSimple}>Iniciando...</Text>
              <Text style={styles.connectionSubtitle}>Conectando ao sistema</Text>
            </>
          )}
        </View>
      </Animated.View>
    </Modal>
  );

  // Admin Panel Component
  const AdminPanel = () => (
    <Modal
      visible={showAdminPanel}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowAdminPanel(false)}
    >
      <View style={styles.adminModalOverlay}>
        <View style={styles.adminModalContent}>
          <View style={styles.adminHeader}>
            <IconComponent name="admin" size={40} color={config.colors.primary} />
            <Text style={styles.adminTitle}>Painel Administrativo</Text>
          </View>

          {adminPassword !== KIOSK_PIN ? (
            <View style={styles.adminLoginContainer}>
              <Text style={styles.adminLoginLabel}>Digite o PIN do administrador</Text>
              <TextInput
                style={styles.adminPasswordInput}
                value={adminPassword}
                onChangeText={setAdminPassword}
                placeholder="••••"
                placeholderTextColor={config.colors.textTertiary}
                secureTextEntry
                keyboardType="numeric"
                maxLength={4}
                autoFocus
              />
              <TouchableOpacity style={styles.adminLoginButton} onPress={handleAdminLogin}>
                <Text style={styles.adminLoginButtonText}>Entrar</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.adminCancelButton} 
                onPress={() => {
                  setShowAdminPanel(false);
                  setAdminPassword("");
                }}
              >
                <Text style={styles.adminCancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.adminOptionsContainer}>
              <TouchableOpacity style={styles.adminOption} onPress={handleViewStats}>
                <IconComponent name="stats" size={30} color={config.colors.info} />
                <Text style={styles.adminOptionTitle}>Estatísticas</Text>
                <Text style={styles.adminOptionDescription}>Ver dados do aplicativo</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.adminOption} onPress={handleRestartApp}>
                <IconComponent name="refresh" size={30} color={config.colors.warning} />
                <Text style={styles.adminOptionTitle}>Reiniciar App</Text>
                <Text style={styles.adminOptionDescription}>Limpar dados e reiniciar</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.adminOption} onPress={handleExitKioskMode}>
                <IconComponent name="exit" size={30} color={config.colors.error} />
                <Text style={styles.adminOptionTitle}>Sair do Kiosk</Text>
                <Text style={styles.adminOptionDescription}>Desativar modo kiosk</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.adminOption, styles.adminCloseButton]} 
                onPress={() => {
                  setShowAdminPanel(false);
                  setAdminPassword("");
                }}
              >
                <Text style={styles.adminCloseButtonText}>Fechar Painel</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );

  // Lock Screen
  if (isLocked) {
    return (
      <View style={styles.container}>
        <StatusBar hidden={true} />
        <ConnectionModal />
        <View style={styles.lockContainer}>
          <View style={styles.lockCard}>
            <View style={styles.lockIcon}>
              <Svg width={80} height={80} viewBox="0 0 24 24" fill="none">
                <Rect x="5" y="11" width="14" height="10" rx="2" stroke={config.colors.primary} strokeWidth="2"/>
                <Path d="M7 11V7a5 5 0 0110 0v4" stroke={config.colors.primary} strokeWidth="2" strokeLinecap="round"/>
              </Svg>
            </View>
            <Text style={styles.lockTitle}>Tablet Bloqueado</Text>
            <Text style={styles.lockSubtitle}>Digite a senha para desbloquear</Text>
            <TextInput
              style={styles.passwordInput}
              value={password}
              onChangeText={setPassword}
              placeholder="••••"
              placeholderTextColor={config.colors.textTertiary}
              secureTextEntry
              keyboardType="numeric"
              maxLength={4}
            />
            <TouchableOpacity style={styles.unlockButton} onPress={handleUnlock}>
              <Text style={styles.unlockButtonText}>Desbloquear</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  // App Closed Screen - Completely black screen that looks like app is off
  if (isAppClosed) {
    return (
      <View style={{ flex: 1, backgroundColor: '#000000' }}>
        <StatusBar hidden={true} />
        <Pressable 
          style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
          onLongPress={() => {
            Brightness.setBrightnessAsync(0.3);
          }}
          delayLongPress={3000}
        >
          <View style={{ alignItems: 'center', opacity: 0.15 }}>
            <Text style={{ color: '#222', fontSize: 10, marginBottom: 20 }}>
              Segure 3s para reativar
            </Text>
            <TextInput
              style={{
                width: 100,
                height: 40,
                backgroundColor: '#111',
                borderRadius: 8,
                color: '#333',
                fontSize: 16,
                textAlign: 'center',
                letterSpacing: 6,
              }}
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (text === config.ADMIN_PASSWORD) {
                  setIsAppClosed(false);
                  setPassword("");
                  resetIdleTimer();
                  Brightness.setBrightnessAsync(tabletSettings.default_brightness);
                }
              }}
              placeholder="••••"
              placeholderTextColor="#222"
              secureTextEntry
              keyboardType="numeric"
              maxLength={4}
            />
          </View>
        </Pressable>
      </View>
    );
  }

  // Welcome Screen - Table Selection
  if (!tableNumber) {
    return (
      <View style={styles.container} onTouchStart={resetIdleTimer}>
        <StatusBar hidden={true} />
        <ConnectionModal />
        <View style={styles.welcomeContainer}>
          <Animated.View style={[styles.welcomeContent, { opacity: fadeAnim }]}>
            <BlurView intensity={80} tint="dark" style={styles.tableSelectionCard}>
              <View style={styles.glassOverlay}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                  <Text style={[styles.tableSelectionTitle, { flex: 0, marginRight: 10 }]}>Selecione a mesa</Text>
                  
                  {/* Logo in the middle - Larger and positioned above */}
                  <View style={{ 
                    position: 'absolute', 
                    left: '50%', 
                    transform: [{ translateX: -60 }],
                    top: -70,
                  }}>
                    <Image 
                      source={require('./assets/logo232.png')}
                      style={{ 
                        width: 120, 
                        height: 120,
                        borderRadius: 60,
                      }}
                      resizeMode="cover"
                    />
                  </View>
                  
                  {/* Spacer */}
                  <View style={{ flex: 1 }} />
                  
                  {/* Search Input - Next to refresh button */}
                  <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                    borderRadius: 10,
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderWidth: 1,
                    borderColor: 'rgba(255, 112, 67, 0.2)',
                    marginRight: 10,
                  }}>
                    <IconComponent name="search" size={14} color="#999" />
                    <TextInput
                      style={{
                        color: '#FFFFFF',
                        fontSize: 14,
                        marginLeft: 6,
                        textAlign: 'center',
                        width: 120,
                      }}
                      placeholder="Número da Mesa"
                      placeholderTextColor="rgba(255, 255, 255, 0.3)"
                        value={tableSearchText}
                        onChangeText={(text) => {
                          // Limit to 4 digits
                          if (text.length <= 4) {
                            setTableSearchText(text);
                            // Filter tables by number
                            if (text.trim()) {
                              const filtered = tables.filter(t => 
                                t.number.toString().includes(text)
                              );
                              setAvailableTables(filtered);
                            } else {
                              setAvailableTables(tables);
                            }
                          }
                        }}
                        keyboardType="numeric"
                        returnKeyType="done"
                        maxLength={4}
                        onSubmitEditing={() => {
                      // If there's exactly one match, select it automatically
                      const exactMatch = tables.find(t => 
                        t.number.toString() === tableSearchText
                      );
                      if (exactMatch) {
                        setTableNumber(exactMatch.number.toString());
                        setSelectedTable(exactMatch);
                        resetIdleTimer();
                        
                        if (exactMatch.status === 'occupied') {
                          Alert.alert(
                            "Mesa Ocupada",
                            `Mesa ${exactMatch.number} possui uma conta aberta.\n${exactMatch.session_total > 0 ? `Total atual: R$ ${exactMatch.session_total.toFixed(2)}` : 'Total: R$ 0,00'}\n\nOs novos pedidos serão adicionados à conta existente.`,
                            [
                              { text: "Cancelar", style: "cancel" },
                              { 
                                text: "Continuar",
                                onPress: async () => {
                                  // VERIFICAR SE TEM RODÍZIO ANTES DE CONTINUAR
                                  const hasRodizio = await checkForExistingRodizio(exactMatch.number.toString());
                                  
                                  if (hasRodizio && serviceTypes.length > 0) {
                                    console.log("✅ Mesa com rodízio detectado! Entrando direto no catálogo");
                                    
                                    // Buscar o tipo rodízio
                                    const rodizioType = serviceTypes.find(st => 
                                      st.linked_groups?.some((g: any) => g.type === 'rodizio')
                                    );
                                    
                                    if (rodizioType) {
                                      setSelectedMode(rodizioType);
                                      await loadCategories();
                                      await loadProducts();
                                      
                                      // Ir direto para o catálogo sem mostrar tipos de atendimento
                                      Animated.timing(fadeAnim, {
                                        toValue: 0,
                                        duration: config.animations.fast,
                                        useNativeDriver: true,
                                      }).start(() => {
                                        // Após animação, já estar no catálogo
                                      });
                                    }
                                  } else {
                                    // Sem rodízio, continuar fluxo normal
                                    Animated.timing(fadeAnim, {
                                      toValue: 0,
                                      duration: config.animations.fast,
                                      useNativeDriver: true,
                                    }).start();
                                  }
                                }
                              }
                            ]
                          );
                        } else {
                          Animated.timing(fadeAnim, {
                            toValue: 0,
                            duration: config.animations.fast,
                            useNativeDriver: true,
                          }).start();
                        }
                      }
                        }}
                    />
                  </View>
                  
                  {/* Refresh button on the right */}
                  <TouchableOpacity 
                    style={{
                      backgroundColor: 'rgba(255, 112, 67, 0.1)',
                      borderRadius: 10,
                      paddingVertical: 8,
                      paddingHorizontal: 12,
                      flexDirection: 'row',
                      alignItems: 'center',
                      borderWidth: 1,
                      borderColor: 'rgba(255, 112, 67, 0.2)',
                    }}
                    onPress={() => {
                      loadTables();
                      resetIdleTimer();
                    }}
                  >
                    <IconComponent name="refresh" size={14} color={config.colors.primary} />
                    <Text style={{
                      color: config.colors.primary,
                      fontSize: 13,
                      fontWeight: '600',
                      marginLeft: 5,
                    }}>Atualizar</Text>
                  </TouchableOpacity>
                </View>
              
              {tablesLoading ? (
                <View style={styles.tablesLoadingContainer}>
                  <ActivityIndicator size="large" color={config.colors.primary} />
                  <Text style={styles.tablesLoadingText}>Carregando mesas...</Text>
                </View>
              ) : tablesError ? (
                <View style={styles.tablesErrorContainer}>
                  <Text style={styles.tablesErrorText}>{tablesError}</Text>
                  <TouchableOpacity 
                    style={styles.retryButton}
                    onPress={() => {
                      loadTables();
                      resetIdleTimer();
                    }}
                  >
                    <IconComponent name="refresh" size={20} color="#000" />
                    <Text style={styles.retryButtonText}>Tentar Novamente</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <ScrollView 
                  style={styles.tablesList}
                  showsVerticalScrollIndicator={true}
                  contentContainerStyle={{
                    flexDirection: 'row',
                    flexWrap: 'wrap',
                    paddingHorizontal: 5,
                    paddingTop: 5,
                    paddingBottom: 0,
                  }}
                  nestedScrollEnabled={true}
                  scrollEnabled={true}
                  bounces={false}
                >
                  {availableTables.map((table) => (
                    <TouchableOpacity
                      key={table.id}
                      style={{
                        width: '18%',
                        height: 88,
                        backgroundColor: table.status === 'occupied' 
                          ? 'rgba(255, 112, 67, 0.08)' 
                          : 'rgba(255, 255, 255, 0.04)',
                        borderRadius: 10,
                        padding: 4,
                        marginBottom: 5,
                        marginHorizontal: '1%',
                        borderWidth: 1,
                        borderColor: table.status === 'occupied'
                          ? 'rgba(255, 112, 67, 0.25)'
                          : 'rgba(255, 255, 255, 0.1)',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                      onPress={async () => {
                        setTableNumber(table.number.toString());
                        setSelectedTable(table);
                        resetIdleTimer();
                        
                        // VERIFICAR RODÍZIO IMEDIATAMENTE PARA QUALQUER MESA
                        console.log("🔍 Mesa selecionada! Verificando se tem rodízio lançado...");
                        setLoading(true);
                        
                        try {
                          const hasRodizio = await checkForExistingRodizio(table.number.toString());
                          
                          if (hasRodizio && serviceTypes.length > 0) {
                            console.log("✅ Mesa com rodízio ativo! Indo direto para o catálogo");
                            // Removido aviso verde conforme solicitado pelo usuário
                            
                            // Buscar o tipo rodízio dos service types
                            const rodizioType = serviceTypes.find(st => 
                              st.linked_groups?.some((g: any) => g.type === 'rodizio')
                            );
                            
                            if (rodizioType) {
                              // Configurar o modo rodízio
                              setSelectedMode(rodizioType);
                              
                              // Buscar o grupo rodízio para configurar corretamente
                              const rodizioGroup = rodizioType.linked_groups?.find((g: any) => g.type === 'rodizio');
                              if (rodizioGroup) {
                                setSelectedRodizioGroup(rodizioGroup);
                              }
                              
                              // Carregar o catálogo
                              await loadCategories();
                              await loadProducts();
                              
                              // Fazer a animação e ir DIRETO pro catálogo (pula seleção de tipo)
                              Animated.timing(fadeAnim, {
                                toValue: 0,
                                duration: config.animations.fast,
                                useNativeDriver: true,
                              }).start(() => {
                                // Com selectedMode já configurado, vai direto pro catálogo
                                setLoading(false);
                              });
                              
                              return; // Sai da função, não continua
                            }
                          }
                          
                          // Se chegou aqui, não tem rodízio ou falhou ao configurar
                          console.log("❌ Mesa sem rodízio, mostrando tipos de atendimento");
                          setLoading(false);
                          
                          // Se a mesa está ocupada mas sem rodízio, mostra aviso
                          if (table.status === 'occupied') {
                            Alert.alert(
                              "Mesa Ocupada",
                              `Mesa ${table.number} possui uma conta aberta.\n${table.session_total > 0 ? `Total atual: R$ ${table.session_total.toFixed(2)}` : 'Total: R$ 0,00'}\n\nOs novos pedidos serão adicionados à conta existente.`,
                              [
                                { text: "Cancelar", style: "cancel" },
                                { 
                                  text: "Continuar",
                                  onPress: () => {
                                    // Continuar fluxo normal - mostrar tipos de atendimento
                                    Animated.timing(fadeAnim, {
                                      toValue: 0,
                                      duration: config.animations.fast,
                                      useNativeDriver: true,
                                    }).start();
                                  }
                                }
                              ]
                            );
                          } else {
                            // Mesa disponível sem rodízio - mostrar tipos de atendimento
                            Animated.timing(fadeAnim, {
                              toValue: 0,
                              duration: config.animations.fast,
                              useNativeDriver: true,
                            }).start();
                          }
                        } catch (error) {
                          console.error("Erro ao verificar rodízio:", error);
                          setLoading(false);
                          
                          // Em caso de erro, continua o fluxo normal
                          Animated.timing(fadeAnim, {
                            toValue: 0,
                            duration: config.animations.fast,
                            useNativeDriver: true,
                          }).start();
                        }
                      }}
                      disabled={false}
                      activeOpacity={0.9}
                    >
                      {/* Table Number in Circle - BIGGER */}
                      <View style={{
                        width: 42,
                        height: 42,
                        borderRadius: 21,
                        backgroundColor: table.status === 'occupied' 
                          ? 'rgba(255, 112, 67, 0.15)' 
                          : 'rgba(255, 255, 255, 0.08)',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: 2,
                        borderWidth: 1,
                        borderColor: table.status === 'occupied' 
                          ? 'rgba(255, 112, 67, 0.3)' 
                          : 'rgba(255, 255, 255, 0.15)',
                      }}>
                        <Text style={{
                          fontSize: 22,
                          fontWeight: 'bold',
                          color: table.status === 'occupied' ? config.colors.primary : '#FFFFFF',
                        }}>
                          {table.number}
                        </Text>
                      </View>
                      
                      {/* Table Name - Smaller */}
                      <Text style={{
                        fontSize: 8,
                        color: 'rgba(255, 255, 255, 0.5)',
                        marginBottom: 2,
                        textAlign: 'center',
                      }}>
                        {table.name}
                      </Text>
                      
                      {/* Status Badge - Smaller */}
                      <View style={{
                        paddingHorizontal: 5,
                        paddingVertical: 1,
                        borderRadius: 3,
                        backgroundColor: table.status === 'occupied' 
                          ? 'rgba(255, 112, 67, 0.2)' 
                          : 'rgba(76, 175, 80, 0.2)',
                      }}>
                        <Text style={{
                          fontSize: 7,
                          fontWeight: '600',
                          color: table.status === 'occupied' 
                            ? config.colors.primary 
                            : '#4CAF50',
                        }}>
                          {table.status === 'occupied' ? 'OCUPADA' : 'LIVRE'}
                        </Text>
                      </View>
                      
                      {/* Session Total if occupied - Smaller */}
                      {table.status === 'occupied' && table.session_total > 0 && (
                        <Text style={{
                          fontSize: 8,
                          fontWeight: 'bold',
                          color: config.colors.primary,
                          marginTop: 1,
                        }}>
                          R$ {table.session_total.toFixed(2)}
                        </Text>
                      )}
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}
              </View>
            </BlurView>
          </Animated.View>
        </View>
      </View>
    );
  }

  // Mode Selection Screen - New Beautiful Design
  if (!selectedMode) {
    return (
      <View style={styles.container} onTouchStart={resetIdleTimer}>
        <StatusBar hidden={true} />
        <AdminPanel />
        
        {/* Dark Background - Same as Table Selection */}
        <View style={[StyleSheet.absoluteFillObject, { backgroundColor: '#1C1C1E' }]} />
        
        <View style={styles.modeContainer} {...panResponderRef.current?.panHandlers}>
          {/* Glass Header with Blur */}
          <BlurView intensity={80} tint="dark" style={styles.glassHeader}>
            <Pressable
              onLongPress={handleLongPressStart}
              onPressOut={handleLongPressEnd}
              delayLongPress={0}
            >
              <View style={styles.headerContentGlass}>
                <View style={styles.tableInfoGlass}>
                  <View style={styles.tableIconGlass}>
                    <IconComponent 
                      name={parseInt(tableNumber) > 100 ? 'chair' : 'table'} 
                      size={24} 
                      color="#FF7043" 
                    />
                  </View>
                  <View>
                    <Text style={styles.tableNumberGlass}>
                      {parseInt(tableNumber) > 100 ? `Balcão ${tableNumber}` : `Mesa ${tableNumber}`}
                    </Text>
                    <Text style={styles.tableSubtitleGlass}>
                      Escolha o tipo de atendimento
                    </Text>
                  </View>
                </View>
              </View>
            </Pressable>
            
            {session && sessionTotal > 0 && (
              <View style={styles.sessionBadgeGlass}>
                <IconComponent name="credit-card" size={14} color="#FF7043" />
                <Text style={styles.sessionTextGlass}>
                  R$ {sessionTotal.toFixed(2)}
                </Text>
              </View>
            )}
          </BlurView>

          {/* Service Type Cards - Apple Glass Style */}
          <ScrollView 
            style={styles.serviceTypeScroll}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.serviceTypeGridGlass}
          >
            <View style={styles.cardsGridGlass}>
              {serviceTypes.map((serviceType, index) => (
                <TouchableOpacity
                  key={serviceType.id}
                  style={styles.serviceCardWrapperGlass}
                  onPress={async () => {
                    resetIdleTimer();
                    
                    // Sempre verificar primeiro se mesa está aberta no POS
                    const sessionExists = await checkSessionFromPOS();
                    
                    if (!sessionExists) {
                      // Mesa não está aberta - abrir automaticamente
                      setLoading(true);
                      try {
                        const response = await fetch(config.POS_API.session, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            table_number: parseInt(tableNumber),
                            attendance_type: serviceType?.name || 'À La Carte',
                            number_of_people: 1,
                            service_type: serviceType,
                            source: 'tablet' // Identificar que veio do tablet
                          })
                        });
                        
                        const result = await response.json();
                        if (result.success) {
                          setSession(result.session);
                          console.log('✅ Mesa aberta automaticamente:', result.session);
                        } else {
                          Alert.alert('Erro', result.message || 'Não foi possível abrir a mesa');
                          return;
                        }
                      } catch (error) {
                        Alert.alert('Erro', 'Erro ao abrir mesa automaticamente');
                        return;
                      } finally {
                        setLoading(false);
                      }
                    }
                    
                    // Mesa está aberta - processar seleção do tipo
                    if (serviceType.linked_groups?.length > 0) {
                      const firstGroup = serviceType.linked_groups[0];
                      if (firstGroup.type === 'rodizio' && firstGroup.price) {
                        // Verificar se já existe rodízio lançado na sessão
                        const rodizioExists = await checkRodizioExists(tableNumber);
                        
                        if (rodizioExists) {
                          // Rodízio já existe - entrar direto no catálogo
                          console.log('🔄 Rodízio já lançado - entrando direto no atendimento');
                          setSelectedMode(serviceType);
                          showToastNotification('Rodízio já está lançado nesta mesa', 'info');
                        } else {
                          // Rodízio não existe - mostrar modal para selecionar adultos/crianças
                          // Pass the service type with the group's pricing info
                          const modeWithPricing = {
                            ...serviceType,
                            price: firstGroup.price || serviceType.price,
                            half_price: firstGroup.half_price || 0
                          };
                          setSelectedMode(modeWithPricing);
                          setShowRodizioModal(true);
                          // Animate modal entrance
                          Animated.spring(rodizioModalAnim, {
                            toValue: 1,
                            tension: 50,
                            friction: 8,
                            useNativeDriver: true,
                          }).start();
                        }
                      } else {
                        // Para outros tipos, apenas selecionar
                        setSelectedMode(serviceType);
                        console.log('✅ Tipo de atendimento selecionado:', serviceType.name);
                      }
                    } else {
                      // Tipo sem grupos - apenas selecionar
                      setSelectedMode(serviceType);
                      console.log('✅ Tipo de atendimento selecionado:', serviceType.name);
                    }
                  }}
                  activeOpacity={0.9}
                >
                  <BlurView intensity={60} tint="dark" style={styles.serviceCardGlass}>
                    {/* Icon Circle */}
                    <View style={[styles.iconCircleGlass, {
                      backgroundColor: '#FF704315',
                      borderColor: '#FF704330',
                    }]}>
                      <IconComponent 
                        name={serviceType.icon || 'restaurant'} 
                        size={42} 
                        color="#FF7043"
                      />
                    </View>
                    
                    {/* Card Content */}
                    <View style={styles.cardContentGlass}>
                      <Text style={styles.cardTitleGlass}>
                        {serviceType.name}
                      </Text>
                      <Text style={styles.cardDescGlass}>
                        {serviceType.description || 'Atendimento rápido'}
                      </Text>
                    </View>
                    
                    {/* Price Section - Same height for all cards */}
                    <View style={styles.priceContainerGlass}>
                      {serviceType.price && serviceType.price > 0 ? (
                        <>
                          <Text style={styles.priceLabelGlass}>Valor</Text>
                          <Text style={[styles.priceAmountGlass, { color: '#FF7043' }]}>
                            R$ {serviceType.price.toFixed(2)}
                          </Text>
                        </>
                      ) : (
                        <>
                          <Text style={styles.priceLabelGlass}>Valor</Text>
                          <Text style={[styles.priceAmountGlass, { color: '#FF7043' }]}>
                            Individual
                          </Text>
                        </>
                      )}
                    </View>
                  </BlurView>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          {/* Bottom Actions - Glass Button */}
          <View style={styles.bottomActionsGlass}>
            <TouchableOpacity 
              style={styles.changeMesaGlass}
              onPress={() => {
                setTableNumber("");
                resetIdleTimer();
              }}
              activeOpacity={0.9}
            >
              <BlurView intensity={50} tint="dark" style={styles.changeMesaBlurGlass}>
                <IconComponent name="refresh" size={16} color="#FF7043" />
                <Text style={styles.changeMesaTextGlass}>Trocar Mesa</Text>
              </BlurView>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  // Main Interface - New 3-Column Layout Goomer Style with Apple Glass Design
  return (
    <View style={styles.container} onTouchStart={resetIdleTimer}>
      <StatusBar hidden={true} />
      <AdminPanel />
      
      <View {...panResponderRef.current?.panHandlers} style={{ flex: 1 }}>
        {/* Glass Header Bar */}
        <BlurView intensity={85} tint="dark" style={styles.glassHeader}>
          <View style={styles.glassHeaderContent}>
            {/* Left Section - Table Info */}
            <View style={styles.glassHeaderLeft}>
              <Pressable
                onLongPress={handleLongPressStart}
                onPressOut={handleLongPressEnd}
                delayLongPress={0}
                style={styles.tableInfoGlass}
              >
                <View style={styles.tableIconGlass}>
                  <IconComponent name="table" size={20} color="#FF7043" />
                </View>
                <Text style={styles.tableNumberGlass}>
                  {parseInt(tableNumber) > 100 ? `Balcão ${tableNumber}` : `Mesa ${tableNumber}`}
                </Text>
              </Pressable>
              
              {selectedMode && (
                <View style={styles.modeTagGlass}>
                  <IconComponent name={selectedMode.icon || 'restaurant'} size={16} color="#FF7043" />
                  <Text style={styles.modeTagTextGlass}>{selectedMode.name}</Text>
                </View>
              )}
            </View>

            {/* Center Section - Search */}
            <View style={styles.glassHeaderCenter}>
              <View style={styles.searchBarGlass}>
                <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                  <Circle cx="11" cy="11" r="8" stroke="rgba(255, 255, 255, 0.5)" strokeWidth="2"/>
                  <Path d="M19 19l-4-4" stroke="rgba(255, 255, 255, 0.5)" strokeWidth="2" strokeLinecap="round"/>
                </Svg>
                <TextInput
                  style={styles.searchInputGlass}
                  placeholder="Buscar produtos..."
                  placeholderTextColor="rgba(255, 255, 255, 0.3)"
                  value={searchText}
                  onChangeText={setSearchText}
                />
              </View>
            </View>
            
            {/* Right Section - Actions */}
            <View style={styles.glassHeaderRight}>
              {session && sessionTotal > 0 && (
                <View style={styles.totalBadgeGlass}>
                  <Text style={styles.totalLabelGlass}>Total</Text>
                  <Text style={styles.totalValueGlass}>R$ {sessionTotal.toFixed(2)}</Text>
                </View>
              )}
              
              <TouchableOpacity
                style={styles.billButtonGlass}
                onPress={() => {
                  setShowBill(true);
                  resetIdleTimer();
                  Animated.spring(billSlideAnim, {
                    toValue: 0,
                    useNativeDriver: true,
                  }).start();
                }}
              >
                <IconComponent name="bill" size={18} color="#FFFFFF" />
                <Text style={styles.billButtonTextGlass}>Conta</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.exitButtonGlass}
                onPress={() => {
                  setSelectedMode(null);
                  setCart([]);
                  resetIdleTimer();
                }}
              >
                <IconComponent name="exit" size={18} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>
        </BlurView>

        {/* 3-Column Main Content Area - Goomer Style with Apple Glass */}
        <View style={styles.mainContentGlass}>
          {/* Left Sidebar - Groups */}
          <View style={styles.leftSidebarGlass}>
            <View style={styles.sidebarHeader}>
              <Text style={styles.sidebarTitle}>Grupos</Text>
            </View>
            <ScrollView 
              showsVerticalScrollIndicator={false}
              style={styles.groupsList}
              contentContainerStyle={{ paddingBottom: 20 }}
            >
              {groups.length > 0 ? (
                groups.map((group) => (
                  <Pressable
                    key={group.id}
                    style={[
                      styles.groupItemGlass,
                      selectedGroup?.id === group.id && styles.groupItemActiveGlass
                    ]}
                    onPress={() => {
                      console.log(`👆 Clique no grupo: ${group.name} (ID: ${group.id})`);
                      setSelectedGroup(group);
                      loadCategories(group.id);
                      loadProducts(group.id);
                      resetIdleTimer();
                    }}
                  >
                    <View style={[
                      styles.groupIconContainerGlass,
                      selectedGroup?.id === group.id && styles.groupIconActiveGlass
                    ]}>
                      <IconComponent 
                        name={group.icon || group.name || 'restaurant'} 
                        size={22} 
                        color={selectedGroup?.id === group.id ? '#FF7043' : 'rgba(255, 255, 255, 0.6)'} 
                      />
                    </View>
                    <Text 
                      style={[
                        styles.groupNameGlass,
                        selectedGroup?.id === group.id && styles.groupNameActiveGlass
                      ]}
                      numberOfLines={3}
                    >
                      {group.name}
                    </Text>
                    {selectedGroup?.id === group.id && (
                      <View style={styles.groupActiveIndicator} />
                    )}
                  </Pressable>
                ))
              ) : (
                <View style={styles.loadingCategoriesGlass}>
                  <ActivityIndicator size="small" color="#FF7043" />
                  <Text style={styles.loadingTextGlass}>Carregando grupos...</Text>
                </View>
              )}
            </ScrollView>
          </View>

          {/* Center Column - Categories List */}
          <View style={styles.centerColumnGlass}>
            <View style={styles.categoriesHeaderGlass}>
              <Text style={styles.categoriesTitle}>Categorias</Text>
            </View>
            
            <ScrollView 
              showsVerticalScrollIndicator={false}
              style={styles.categoriesListGlass}
              contentContainerStyle={styles.categoriesListContent}
            >
              {loadingCategories ? (
                <View style={styles.loadingCategoriesGlass}>
                  <ActivityIndicator size="small" color="#FF7043" />
                  <Text style={styles.loadingTextGlass}>Carregando...</Text>
                </View>
              ) : (
                <>
                  {categories.map((category) => (
                    <Pressable
                      key={category.id}
                      style={[
                        styles.categoryFullCard,
                        selectedCategory === category.id && styles.categoryFullCardActive
                      ]}
                      onPress={() => setSelectedCategory(category.id)}
                    >
                      {/* Full Background Image */}
                      {category.image ? (
                        <Image 
                          source={{ uri: category.image.startsWith('http') ? category.image : `${config.BASE_URL}${category.image}` }} 
                          style={styles.categoryFullImage}
                        />
                      ) : (
                        <View style={styles.categoryFullImagePlaceholder}>
                          <IconComponent 
                            name={category.icon || 'sushi'} 
                            size={28} 
                            color={selectedCategory === category.id ? '#FF7043' : 'rgba(255, 255, 255, 0.3)'} 
                          />
                        </View>
                      )}
                      
                      {/* Gradient Overlay */}
                      <LinearGradient
                        colors={['transparent', 'rgba(0,0,0,0.7)', 'rgba(0,0,0,0.95)']}
                        style={styles.categoryGradientOverlay}
                      />
                      
                      {/* Category Name */}
                      <View style={styles.categoryFullLabelContainer}>
                        <Text 
                          style={[
                            styles.categoryFullName,
                            selectedCategory === category.id && styles.categoryFullNameActive
                          ]}
                          numberOfLines={2}
                        >
                          {category.name}
                        </Text>
                      </View>
                      
                      {/* Active Border Glow */}
                      {selectedCategory === category.id && (
                        <View style={styles.categoryActiveGlow} />
                      )}
                    </Pressable>
                  ))}
                </>
              )}
            </ScrollView>
          </View>

          {/* Right Column - Products Grid */}
          <View style={styles.rightColumnGlass}>
            {loadingProducts ? (
              <View style={styles.loadingProductsGlass}>
                <ActivityIndicator size="large" color="#FF7043" />
                <Text style={styles.loadingTextGlass}>Carregando produtos...</Text>
              </View>
            ) : (
              <FlatList
                data={getFilteredProducts()}
                keyExtractor={(item) => item.id.toString()}
                numColumns={1}
                contentContainerStyle={styles.productsGridGlass}
                showsVerticalScrollIndicator={false}
                onScroll={() => resetIdleTimer()}
                ListEmptyComponent={
                  <View style={styles.emptyContainerGlass}>
                    <IconComponent name="restaurant" size={48} color="rgba(255, 255, 255, 0.3)" />
                    <Text style={styles.emptyTextGlass}>Nenhum produto encontrado</Text>
                    <Text style={styles.emptySubtextGlass}>Tente buscar por outro termo</Text>
                  </View>
                }
                renderItem={({ item }) => {
                  const itemInCart = cart.find(c => c.id === item.id);
                  const quantity = itemInCart ? itemInCart.quantity : 0;
                  
                  return (
                    <View style={styles.productCardGlass}>
                      {/* Product Image - Left Side 16:9 - Clickable */}
                      <Pressable 
                        onPress={() => {
                          setImageModalProduct(item);
                          setShowImageModal(true);
                        }}
                      >
                        {item.image_url ? (
                          <Image source={{ uri: item.image_url.startsWith('http') ? item.image_url : `${config.BASE_URL}${item.image_url}` }} style={styles.productImageGlass} />
                        ) : (
                          <View style={styles.productImagePlaceholderGlass}>
                            <IconComponent name="sushi" size={36} color="rgba(255, 255, 255, 0.3)" />
                          </View>
                        )}
                      </Pressable>
                      
                      {/* Product Info and Controls - Right Side */}
                      <View style={styles.productRightSection}>
                        {/* Top Row: Name and Price */}
                        <View style={styles.productTopRow}>
                          <Text style={styles.productNameGlass} numberOfLines={2}>
                            {item.name}
                          </Text>
                          {parseFloat(item.price) > 0 && (
                            <Text style={styles.productPriceRight}>
                              R$ {parseFloat(item.price).toFixed(2)}
                            </Text>
                          )}
                        </View>
                        
                        {/* Description */}
                        {item.description && (
                          <Text style={styles.productDescriptionGlass} numberOfLines={2}>
                            {item.description}
                          </Text>
                        )}
                        
                        {/* Bottom Row: Quantity Controls */}
                        <View style={styles.productBottomRow}>
                          <View style={styles.quantityControlsRow}>
                            <Pressable 
                              style={[styles.quantityButton, quantity === 0 && styles.quantityButtonDisabled]}
                              onPress={() => quantity > 0 && handleRemoveFromCart(item.id)}
                              hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
                            >
                              <IconComponent name="minus" size={18} color={quantity > 0 ? "#FF7043" : "rgba(255,255,255,0.3)"} />
                            </Pressable>
                            
                            <Text style={styles.quantityText}>{quantity}</Text>
                            
                            <Pressable 
                              style={styles.quantityButtonPlus}
                              onPress={() => handleQuickAddToCart(item)}
                              hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
                            >
                              <IconComponent name="plus" size={18} color="#FFFFFF" />
                            </Pressable>
                          </View>
                        </View>
                      </View>
                    </View>
                  );
                }}
              />
            )}
          </View>
        </View>

        {/* Cart Button */}
        {cart.length > 0 && (
          <Animated.View style={[
            styles.cartFloatingButton,
            { transform: [{ scale: cartBounceAnim }] }
          ]}>
            <TouchableOpacity
              style={styles.cartFloatingButtonInner}
              onPress={() => {
                setShowCart(true);
                resetIdleTimer();
                Animated.spring(slideAnim, {
                  toValue: 0,
                  useNativeDriver: true,
                }).start();
              }}
            >
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{cart.length}</Text>
              </View>
              <Text style={styles.cartFloatingButtonText}>Ver Carrinho</Text>
              <Text style={styles.cartFloatingButtonTotal}>
                R$ {getCartTotal().toFixed(2)}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        )}

      </View>

      {/* Rodízio Selection Modal - Apple Glass Style */}
      {showRodizioModal && (
        <Modal
          visible={showRodizioModal}
          animationType="none"
          transparent={true}
          onRequestClose={() => {
            setShowRodizioModal(false);
            setAdultCount(1);
            setChildCount(0);
          }}
        >
          <Animated.View style={[
            styles.modalOverlay,
            {
              opacity: rodizioModalAnim,
              backgroundColor: 'rgba(0, 0, 0, 0.85)',
            }
          ]}>
            <Animated.View style={[
              styles.rodizioModalContainer,
              {
                transform: [{
                  scale: rodizioModalAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.9, 1],
                  }),
                }],
              }
            ]}>
              <BlurView intensity={95} tint="dark" style={styles.rodizioModalContent}>
                {/* Modal Header */}
                <View style={styles.rodizioModalHeader}>
                  <Image 
                    source={require('./assets/logo232.png')}
                    style={{ width: 55, height: 55, marginRight: 12, borderRadius: 27.5 }}
                    resizeMode="cover"
                  />
                  <View>
                    <Text style={styles.rodizioModalTitle}>
                      {selectedMode?.name || 'Rodízio'}
                    </Text>
                    <Text style={styles.rodizioModalSubtitle}>
                      Selecione a quantidade de pessoas
                    </Text>
                  </View>
                </View>

                {/* Adults Counter */}
                <View style={styles.rodizioCounterContainer}>
                  <View style={styles.rodizioCounterLeft}>
                    <IconComponent name="user" size={20} color="#FF7043" />
                    <View style={styles.rodizioCounterInfo}>
                      <Text style={styles.rodizioCounterTitle}>Adultos</Text>
                      {selectedMode?.price && (
                        <Text style={styles.rodizioCounterPrice}>
                          R$ {selectedMode.price.toFixed(2)} por pessoa
                        </Text>
                      )}
                    </View>
                  </View>
                  
                  <View style={styles.rodizioCounterButtons}>
                    <TouchableOpacity
                      style={[styles.rodizioCounterButton, 
                        adultCount <= 1 && styles.rodizioCounterButtonDisabled
                      ]}
                      onPress={() => setAdultCount(Math.max(1, adultCount - 1))}
                      disabled={adultCount <= 1}
                    >
                      <IconComponent name="minus" size={20} color={adultCount <= 1 ? "#666" : "#FF7043"} />
                    </TouchableOpacity>
                    
                    <View style={styles.rodizioCounterValue}>
                      <Text style={styles.rodizioCounterNumber}>{adultCount}</Text>
                    </View>
                    
                    <TouchableOpacity
                      style={styles.rodizioCounterButton}
                      onPress={() => setAdultCount(adultCount + 1)}
                    >
                      <IconComponent name="plus" size={20} color="#FF7043" />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Children Counter */}
                {selectedMode?.half_price && selectedMode.half_price > 0 && (
                  <View style={styles.rodizioCounterContainer}>
                    <View style={styles.rodizioCounterLeft}>
                      <IconComponent name="child" size={20} color="#FF7043" />
                      <View style={styles.rodizioCounterInfo}>
                        <Text style={styles.rodizioCounterTitle}>Crianças</Text>
                        <Text style={styles.rodizioCounterPrice}>
                          R$ {selectedMode.half_price.toFixed(2)} por criança
                        </Text>
                      </View>
                    </View>
                    
                    <View style={styles.rodizioCounterButtons}>
                      <TouchableOpacity
                        style={[styles.rodizioCounterButton,
                          childCount <= 0 && styles.rodizioCounterButtonDisabled
                        ]}
                        onPress={() => setChildCount(Math.max(0, childCount - 1))}
                        disabled={childCount <= 0}
                      >
                        <IconComponent name="minus" size={20} color={childCount <= 0 ? "#666" : "#FF7043"} />
                      </TouchableOpacity>
                      
                      <View style={styles.rodizioCounterValue}>
                        <Text style={styles.rodizioCounterNumber}>{childCount}</Text>
                      </View>
                      
                      <TouchableOpacity
                        style={styles.rodizioCounterButton}
                        onPress={() => setChildCount(childCount + 1)}
                      >
                        <IconComponent name="plus" size={20} color="#FF7043" />
                      </TouchableOpacity>
                    </View>
                  </View>
                )}

                {/* Total */}
                <View style={styles.rodizioTotalContainer}>
                  <Text style={styles.rodizioTotalLabel}>Total</Text>
                  <Text style={styles.rodizioTotalValue}>
                    R$ {(
                      (adultCount * (selectedMode?.price || 0)) +
                      (childCount * (selectedMode?.half_price || 0))
                    ).toFixed(2)}
                  </Text>
                </View>

                {/* Action Buttons */}
                <View style={styles.rodizioModalActions}>
                  <TouchableOpacity
                    style={styles.rodizioCancelButton}
                    onPress={() => {
                      Animated.timing(rodizioModalAnim, {
                        toValue: 0,
                        duration: 200,
                        useNativeDriver: true,
                      }).start(() => {
                        setShowRodizioModal(false);
                        setAdultCount(1);
                        setChildCount(0);
                        setSelectedMode(null);
                      });
                    }}
                  >
                    <Text style={styles.rodizioCancelButtonText}>Cancelar</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.rodizioConfirmButton}
                    onPress={async () => {
                      try {
                        setLoading(true);
                        
                        // SEMPRE verificar se mesa está aberta antes de lançar rodízio
                        const sessionExists = await checkSessionFromPOS();
                        
                        if (!sessionExists) {
                          // Mesa não está aberta - mostrar mensagem e iniciar polling
                          setLoading(false);
                          setSelectedServiceType(selectedMode);
                          setWaitingForPOS(true);
                          startPOSPolling();
                          
                          Alert.alert(
                            "⏳ Mesa Aguardando Abertura",
                            "A mesa ainda não foi aberta no caixa. Por favor, chame o garçom para liberar a mesa e lançar o rodízio.",
                            [
                              {
                                text: "Chamar Garçom",
                                onPress: () => callWaiter(),
                                style: "default"
                              },
                              {
                                text: "OK",
                                style: "cancel"
                              }
                            ]
                          );
                          return;
                        }
                        
                        // Mesa está aberta - prosseguir com o lançamento do rodízio
                        console.log('✅ Mesa aberta no POS, lançando rodízio...');
                        
                        // Criar itens do rodízio para o pedido
                        const rodizioItems = [];
                        
                        // Adicionar rodízios adultos
                        if (adultCount > 0 && selectedMode?.price) {
                          rodizioItems.push({
                            id: -1 * Date.now(), // ID negativo para rodízio
                            name: selectedMode.name,
                            price: selectedMode.price,
                            quantity: adultCount,
                            is_rodizio: true,
                            group_id: selectedMode.linked_groups?.[0]?.id || null
                          });
                        }
                        
                        // Adicionar rodízios crianças (meio)
                        if (childCount > 0 && selectedMode?.half_price) {
                          rodizioItems.push({
                            id: -2 * Date.now(), // ID negativo diferente para meio rodízio
                            name: `${selectedMode.name} (Criança)`,
                            price: selectedMode.half_price,
                            quantity: childCount,
                            is_rodizio: true,
                            group_id: selectedMode.linked_groups?.[0]?.id || null
                          });
                        }
                        
                        // Enviar pedido do rodízio para o POS
                        console.log('📦 Enviando rodízio para o POS:', { session_id: session?.id, items: rodizioItems });
                        
                        if (!session?.id) {
                          throw new Error('Sessão não encontrada. Por favor, tente novamente.');
                        }
                        
                        const orderResponse = await fetch(config.POS_API.order, {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                          },
                          body: JSON.stringify({
                            session_id: session.id, // POS API precisa do session_id
                            source: 'tablet', // Identificar origem como tablet
                            items: rodizioItems.map(item => ({
                              name: item.name,
                              price: parseFloat(item.price),
                              quantity: item.quantity,
                              category: 'Rodízio',
                              observation: 'Lançado automaticamente pelo tablet'
                            }))
                          }),
                        });
                        
                        if (!orderResponse.ok) {
                          const errorData = await orderResponse.text();
                          console.error('❌ Erro na resposta do servidor:', errorData);
                          throw new Error(`Erro ao lançar rodízio: ${orderResponse.status}`);
                        }
                        
                        const orderResult = await orderResponse.json();
                        console.log('🎯 Rodízio lançado com sucesso:', orderResult);
                        
                        // Atualizar sessão local com informações do rodízio
                        setSession((prev: any) => ({
                          ...prev,
                          has_rodizio: true,
                          rodizio_type: selectedMode.name,
                          adult_count: adultCount,
                          child_count: childCount
                        }));
                        
                        // Fechar modal com animação
                        Animated.timing(rodizioModalAnim, {
                          toValue: 0,
                          duration: 200,
                          useNativeDriver: true,
                        }).start(() => {
                          setShowRodizioModal(false);
                          setAdultCount(1);
                          setChildCount(0);
                          
                          // Mostrar sucesso
                          Alert.alert(
                            '✅ Rodízio Lançado',
                            `${selectedMode?.name} para ${adultCount} ${adultCount === 1 ? 'adulto' : 'adultos'}${childCount > 0 ? ` e ${childCount} ${childCount === 1 ? 'criança' : 'crianças'}` : ''} foi lançado na mesa ${tableNumber}!`,
                            [
                              {
                                text: 'OK',
                                onPress: () => {
                                  // Continuar para o catálogo
                                  // Já com o selectedMode definido
                                }
                              }
                            ]
                          );
                        });
                        
                      } catch (error) {
                        console.error('❌ Erro ao lançar rodízio:', error);
                        Alert.alert('Erro', 'Não foi possível lançar o rodízio. Tente novamente.');
                      } finally {
                        setLoading(false);
                      }
                    }}
                  >
                    <LinearGradient
                      colors={['#FF7043', '#FF5722']}
                      style={styles.rodizioConfirmGradient}
                    >
                      {loading ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                      ) : (
                        <>
                          <Text style={styles.rodizioConfirmButtonText}>Confirmar</Text>
                          <IconComponent name="check" size={18} color="#FFFFFF" />
                        </>
                      )}
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </BlurView>
            </Animated.View>
          </Animated.View>
        </Modal>
      )}

      {/* Observation Modal */}
      <Modal
        visible={showObservationModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowObservationModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.observationModal}>
            {/* Logo in observation modal */}
            <View style={{ alignItems: 'center', marginBottom: 15 }}>
              <Image 
                source={require('./assets/logo232.png')}
                style={{ width: 60, height: 60, borderRadius: 30 }}
                resizeMode="cover"
              />
            </View>
            <Text style={styles.observationModalTitle}>
              {selectedProductForObservation?.name}
            </Text>
            <Text style={styles.observationModalSubtitle}>
              Deseja adicionar alguma observação?
            </Text>
            <TextInput
              style={styles.observationInput}
              placeholder="Ex: Sem wasabi, pouco shoyu..."
              placeholderTextColor={config.colors.textTertiary}
              value={observationText}
              onChangeText={setObservationText}
              multiline
              numberOfLines={3}
              maxLength={200}
            />
            <View style={styles.observationModalButtons}>
              <TouchableOpacity
                style={[styles.observationModalButton, styles.observationModalButtonCancel]}
                onPress={() => {
                  setShowObservationModal(false);
                  setSelectedProductForObservation(null);
                  setObservationText("");
                }}
              >
                <Text style={styles.observationModalButtonCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.observationModalButton, styles.observationModalButtonConfirm]}
                onPress={confirmAddToCart}
              >
                <Text style={styles.observationModalButtonConfirmText}>
                  Adicionar ao Carrinho
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Image Modal - Full Screen Product Image */}
      <Modal
        visible={showImageModal}
        animationType="fade"
        transparent={false}
        statusBarTranslucent={true}
        onRequestClose={() => setShowImageModal(false)}
      >
        <View style={styles.imageModalOverlay}>
          <StatusBar hidden={true} />
          <Pressable 
            style={styles.imageModalCloseButton}
            onPress={() => setShowImageModal(false)}
          >
            <View style={styles.imageModalCloseCircle}>
              <X size={28} color="#333" strokeWidth={2.5} />
            </View>
          </Pressable>
          
          {imageModalProduct && (
            <>
              {imageModalProduct.image_url ? (
                <Image 
                  source={{ uri: imageModalProduct.image_url.startsWith('http') ? imageModalProduct.image_url : `${config.BASE_URL}${imageModalProduct.image_url}` }} 
                  style={styles.imageModalImage}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.imageModalPlaceholder}>
                  <IconComponent name="sushi" size={80} color="rgba(255, 255, 255, 0.3)" />
                </View>
              )}
              <View style={styles.imageModalInfoBar}>
                <Text style={styles.imageModalTitle}>{imageModalProduct.name}</Text>
                {imageModalProduct.description && (
                  <Text style={styles.imageModalDescription}>{imageModalProduct.description}</Text>
                )}
              </View>
            </>
          )}
        </View>
      </Modal>

      {/* Cart Modal */}
      <Modal
        visible={showCart}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCart(false)}
      >
        <Animated.View 
          style={[
            styles.cartModal,
            {
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <View style={styles.cartHeader}>
            {/* Logo in cart header */}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <Image 
                source={require('./assets/logo232.png')}
                style={{ width: 45, height: 45, borderRadius: 22.5 }}
                resizeMode="cover"
              />
              <Text style={styles.cartTitle}>Carrinho</Text>
            </View>
            <TouchableOpacity onPress={() => {
              setShowCart(false);
              Animated.timing(slideAnim, {
                toValue: height,
                duration: config.animations.normal,
                useNativeDriver: true,
              }).start();
            }}>
              <Text style={styles.cartCloseButton}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.cartItems}>
            {cart.map((item) => (
              <View key={`${item.id}-${item.observation}`} style={styles.cartItem}>
                <View style={styles.cartItemInfo}>
                  <Text style={styles.cartItemName}>{item.name}</Text>
                  {item.observation && (
                    <Text style={styles.cartItemObservation}>
                      📝 {item.observation}
                    </Text>
                  )}
                  <Text style={styles.cartItemPrice}>
                    R$ {(parseFloat(item.price) * item.quantity).toFixed(2)}
                  </Text>
                </View>
                <View style={styles.cartItemQuantity}>
                  <TouchableOpacity
                    style={styles.cartQuantityButton}
                    onPress={() => updateQuantity(item.id, item.quantity - 1)}
                  >
                    <Text style={styles.cartQuantityButtonText}>-</Text>
                  </TouchableOpacity>
                  <Text style={styles.cartQuantityText}>{item.quantity}</Text>
                  <TouchableOpacity
                    style={styles.cartQuantityButton}
                    onPress={() => updateQuantity(item.id, item.quantity + 1)}
                  >
                    <Text style={styles.cartQuantityButtonText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </ScrollView>

          <View style={styles.cartFooter}>
            <View style={styles.cartTotal}>
              <Text style={styles.cartTotalLabel}>Total:</Text>
              <Text style={styles.cartTotalValue}>R$ {getCartTotal().toFixed(2)}</Text>
            </View>
            <TouchableOpacity
              style={[styles.sendOrderButton, loading && styles.sendOrderButtonDisabled]}
              onPress={sendOrder}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.sendOrderButtonText}>Enviar Pedido</Text>
              )}
            </TouchableOpacity>
          </View>
        </Animated.View>
      </Modal>

      {/* Bill Modal */}
      <Modal
        visible={showBill}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowBill(false)}
      >
        <Animated.View 
          style={[
            styles.billModal,
            {
              transform: [{ translateY: billSlideAnim }]
            }
          ]}
        >
          <View style={styles.billHeader}>
            <IconComponent name="bill" size={30} color={config.colors.primary} />
            <Text style={styles.billTitle}>
              Conta {parseInt(tableNumber) > 100 ? `Balcão ${tableNumber}` : `Mesa ${tableNumber}`}
            </Text>
            <TouchableOpacity onPress={() => {
              setShowBill(false);
              Animated.timing(billSlideAnim, {
                toValue: height,
                duration: config.animations.normal,
                useNativeDriver: true,
              }).start();
            }}>
              <Text style={styles.billCloseButton}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.billContent}>
            {orderHistory.length === 0 ? (
              <View style={styles.billEmpty}>
                <Text style={styles.billEmptyText}>Nenhum pedido realizado ainda</Text>
              </View>
            ) : (
              orderHistory.map((order) => (
                <View key={order.id} style={styles.billOrder}>
                  <View style={styles.billOrderHeader}>
                    <Text style={styles.billOrderNumber}>Pedido #{order.numero}</Text>
                    <Text style={styles.billOrderTime}>
                      {new Date(order.created_at).toLocaleTimeString('pt-BR', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </Text>
                  </View>
                  {order.items && order.items.length > 0 ? (
                    order.items.map((item: any, index: number) => (
                      <View key={index} style={styles.billItem}>
                        <Text style={styles.billItemQuantity}>{item.quantity}x</Text>
                        <Text style={styles.billItemName}>{item.product_name}</Text>
                        <Text style={styles.billItemPrice}>
                          R$ {(item.quantity * item.price).toFixed(2)}
                        </Text>
                      </View>
                    ))
                  ) : (
                    <View style={styles.billItem}>
                      <Text style={styles.billItemName}>Pedido sem detalhes</Text>
                    </View>
                  )}
                  <View style={styles.billOrderTotal}>
                    <Text style={styles.billOrderTotalLabel}>Subtotal:</Text>
                    <Text style={styles.billOrderTotalValue}>
                      R$ {(order.total || order.valor_total || 0).toFixed(2)}
                    </Text>
                  </View>
                </View>
              ))
            )}
          </ScrollView>

          <View style={styles.billFooter}>
            <View style={styles.billTotals}>
              <View style={styles.billTotalRow}>
                <Text style={styles.billTotalLabel}>Subtotal:</Text>
                <Text style={styles.billTotalValue}>
                  R$ {calculateBillTotals().subtotal.toFixed(2)}
                </Text>
              </View>
              <View style={styles.billTotalRow}>
                <Text style={styles.billTotalLabel}>Taxa de Serviço (10%):</Text>
                <Text style={styles.billTotalValue}>
                  R$ {calculateBillTotals().serviceFee.toFixed(2)}
                </Text>
              </View>
              <View style={[styles.billTotalRow, styles.billGrandTotal]}>
                <Text style={styles.billGrandTotalLabel}>Total:</Text>
                <Text style={styles.billGrandTotalValue}>
                  R$ {calculateBillTotals().total.toFixed(2)}
                </Text>
              </View>
            </View>
            
            {sessionTotal > 0 && (
              <TouchableOpacity
                style={styles.requestBillButton}
                onPress={() => {
                  setShowPaymentModal(true);
                  setShowBill(false);
                }}
              >
                <Text style={styles.requestBillButtonText}>Pagar Conta</Text>
              </TouchableOpacity>
            )}
          </View>
        </Animated.View>
      </Modal>

      {/* Payment Modal */}
      <Modal
        visible={showPaymentModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowPaymentModal(false)}
      >
        <View style={styles.paymentModal}>
          <View style={styles.paymentModalContent}>
            <Text style={styles.paymentModalTitle}>Forma de Pagamento</Text>
            <Text style={styles.paymentModalSubtitle}>
              Total: R$ {calculateBillTotals().total.toFixed(2)}
            </Text>

            <View style={styles.paymentOptions}>
              <TouchableOpacity
                style={[
                  styles.paymentOption,
                  selectedPaymentMethod === 'cash' && styles.paymentOptionSelected
                ]}
                onPress={() => setSelectedPaymentMethod('cash')}
              >
                <IconComponent 
                  name="money" 
                  size={40} 
                  color={selectedPaymentMethod === 'cash' ? config.colors.primary : config.colors.textSecondary}
                />
                <Text style={[
                  styles.paymentOptionText,
                  selectedPaymentMethod === 'cash' && styles.paymentOptionTextSelected
                ]}>
                  Dinheiro
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.paymentOption,
                  selectedPaymentMethod === 'credit' && styles.paymentOptionSelected
                ]}
                onPress={() => setSelectedPaymentMethod('credit')}
              >
                <IconComponent 
                  name="credit-card" 
                  size={40} 
                  color={selectedPaymentMethod === 'credit' ? config.colors.primary : config.colors.textSecondary}
                />
                <Text style={[
                  styles.paymentOptionText,
                  selectedPaymentMethod === 'credit' && styles.paymentOptionTextSelected
                ]}>
                  Crédito
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.paymentOption,
                  selectedPaymentMethod === 'debit' && styles.paymentOptionSelected
                ]}
                onPress={() => setSelectedPaymentMethod('debit')}
              >
                <IconComponent 
                  name="credit-card" 
                  size={40} 
                  color={selectedPaymentMethod === 'debit' ? config.colors.primary : config.colors.textSecondary}
                />
                <Text style={[
                  styles.paymentOptionText,
                  selectedPaymentMethod === 'debit' && styles.paymentOptionTextSelected
                ]}>
                  Débito
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.paymentOption,
                  selectedPaymentMethod === 'pix' && styles.paymentOptionSelected
                ]}
                onPress={() => setSelectedPaymentMethod('pix')}
              >
                <IconComponent 
                  name="pix" 
                  size={40} 
                  color={selectedPaymentMethod === 'pix' ? config.colors.primary : config.colors.textSecondary}
                />
                <Text style={[
                  styles.paymentOptionText,
                  selectedPaymentMethod === 'pix' && styles.paymentOptionTextSelected
                ]}>
                  PIX
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.paymentModalButtons}>
              <TouchableOpacity
                style={[styles.paymentModalButton, styles.paymentModalButtonCancel]}
                onPress={() => setShowPaymentModal(false)}
              >
                <Text style={styles.paymentModalButtonCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.paymentModalButton, styles.paymentModalButtonConfirm]}
                onPress={handleCloseBill}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={styles.paymentModalButtonConfirmText}>Fechar Conta</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Toast Notification */}
      {showToast && (
        <Animated.View 
          style={[
            styles.toast,
            toastType === 'success' ? styles.toastSuccess : styles.toastError,
            {
              transform: [{ translateY: toastAnim }]
            }
          ]}
        >
          <Text style={styles.toastText}>{toastMessage}</Text>
        </Animated.View>
      )}

      {/* Success Overlay */}
      {showSuccess && (
        <Animated.View style={[
          styles.successOverlay,
          {
            transform: [{ scale: scaleAnim }],
            opacity: scaleAnim,
          }
        ]}>
          <View style={styles.successContent}>
            <IconComponent name="check" size={80} color="#FFF" />
            <Text style={styles.successText}>Pedido Enviado!</Text>
            <Text style={styles.successSubtext}>Aguarde a preparação</Text>
          </View>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: config.colors.background,
  },
  glassContainer: {
    backgroundColor: 'rgba(20, 20, 20, 0.85)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 87, 34, 0.2)',
    shadowColor: '#FF5722',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 10,
  },
  glassCard: {
    backgroundColor: 'rgba(30, 30, 30, 0.75)',

    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 87, 34, 0.15)',
    padding: 16,
  },
  glassOverlay: {
    backgroundColor: 'rgba(20, 20, 20, 0.6)',
    paddingTop: 25,
    paddingHorizontal: 20,
    paddingBottom: 0,
    flex: 1,
    overflow: 'visible',
  },
  lockContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: config.colors.background,
    padding: 20,
  },
  lockCard: {
    backgroundColor: config.colors.card,
    borderRadius: 20,
    padding: 40,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  lockIcon: {
    marginBottom: 20,
  },
  lockTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: config.colors.textPrimary,
    marginBottom: 10,
  },
  lockSubtitle: {
    fontSize: 16,
    color: config.colors.textSecondary,
    marginBottom: 30,
  },
  passwordInput: {
    width: 200,
    height: 50,
    borderRadius: 10,
    backgroundColor: config.colors.surface,
    fontSize: 24,
    textAlign: "center",
    letterSpacing: 10,
    marginBottom: 20,
    color: config.colors.textPrimary,
  },
  unlockButton: {
    backgroundColor: config.colors.primary,
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 25,
  },
  unlockButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  welcomeContainer: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    paddingHorizontal: width * 0.05,
    paddingTop: height * 0.05,
    paddingBottom: 0,
    backgroundColor: config.colors.background,
  },
  welcomeContent: {
    alignItems: "center",
    width: "100%",
    maxWidth: width * 0.9,
    flex: 1,
  },
  welcomeHeader: {
    alignItems: "center",
    marginBottom: height * 0.02,
  },
  welcomeLogo: {
    fontSize: 80,
    marginBottom: 20,
  },
  logoCircleContainer: {
    width: Math.min(width * 0.2, 140),
    height: Math.min(width * 0.2, 140),
    alignItems: "center",
    justifyContent: "center",
    marginBottom: height * 0.01,
  },
  logoCircleBg: {
    width: Math.min(width * 0.2, 140),
    height: Math.min(width * 0.2, 140),
    borderRadius: Math.min(width * 0.1, 70),
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#FF7043",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
    borderWidth: 3,
    borderColor: "rgba(255, 112, 67, 0.3)",
  },
  welcomeLogoImage: {
    width: Math.min(width * 0.14, 100),
    height: Math.min(width * 0.14, 100),
  },
  welcomeTitle: {
    fontSize: 36,
    fontWeight: "bold",
    color: config.colors.textPrimary,
    marginBottom: 10,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: config.colors.textSecondary,
    letterSpacing: 3,
    fontWeight: '300',
    textTransform: 'uppercase',
  },
  tableInputCard: {
    backgroundColor: 'rgba(30, 30, 30, 0.85)',
    borderRadius: 24,
    padding: 30,
    width: "100%",
    alignItems: "center",

    borderWidth: 1,
    borderColor: 'rgba(255, 87, 34, 0.2)',
    shadowColor: '#FF5722',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 10,
  },
  tableInputLabel: {
    fontSize: 18,
    color: config.colors.textSecondary,
    marginBottom: 20,
  },
  tableInput: {
    width: 120,
    height: 80,
    fontSize: 48,
    fontWeight: "bold",
    textAlign: "center",
    borderRadius: 15,
    backgroundColor: config.colors.surface,
    color: config.colors.textPrimary,
    marginBottom: 20,
  },
  continueButton: {
    backgroundColor: 'rgba(255, 87, 34, 0.9)',
    paddingHorizontal: 60,
    paddingVertical: 18,
    borderRadius: 28,

    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#FF5722',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  continueButtonText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  adminButton: {
    marginTop: height * 0.02,
    padding: height * 0.01,
    marginBottom: height * 0.02,
  },
  adminButtonText: {
    color: config.colors.textTertiary,
    fontSize: 14,
    textDecorationLine: "underline",
  },
  // New Table Selection Styles
  tableSelectionCard: {
    borderRadius: 28,
    width: "95%",
    marginTop: height * 0.08,
    marginBottom: height * 0.02,
    overflow: 'visible',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
    height: height * 0.77,
  },
  tableSelectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: config.colors.textPrimary,
    textAlign: "center",
    marginBottom: 15,
  },
  tableSearchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: 'rgba(40, 40, 42, 0.8)',
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  tableSearchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    color: config.colors.textPrimary,
    padding: 0,
  },
  tablesLoadingContainer: {
    padding: 40,
    alignItems: "center",
  },
  tablesLoadingText: {
    marginTop: 15,
    fontSize: 16,
    color: config.colors.textSecondary,
  },
  tablesErrorContainer: {
    padding: 40,
    alignItems: "center",
  },
  tablesErrorText: {
    fontSize: 16,
    color: config.colors.error,
    textAlign: "center",
    marginBottom: 20,
  },
  retryButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: config.colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 8,
  },
  retryButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
  tablesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 15,
    justifyContent: "center",
    paddingVertical: 10,
  },
  tableCard: {
    backgroundColor: config.colors.surface,
    borderRadius: 15,
    width: 110,
    height: 110,
    padding: 12,
    borderWidth: 2,
    borderColor: config.colors.primary,
    shadowColor: config.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  tableCardOccupied: {
    backgroundColor: "#F5F5F5",
    borderColor: "#CCCCCC",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    opacity: 0.7,
  },
  tableCardContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  tableNumber: {
    fontSize: 28,
    fontWeight: "bold",
    color: config.colors.primary,
    marginBottom: 4,
  },
  tableNumberOccupied: {
    color: "#999999",
  },
  tableName: {
    fontSize: 12,
    color: config.colors.textSecondary,
    textAlign: "center",
  },
  tableNameOccupied: {
    color: "#AAAAAA",
  },
  tableCapacity: {
    position: "absolute",
    top: 0,
    right: 0,
  },
  tableCapacityText: {
    fontSize: 11,
    color: config.colors.textTertiary,
  },
  tableCapacityTextOccupied: {
    color: "#CCCCCC",
  },
  occupiedBadge: {
    position: "absolute",
    bottom: 2,
    backgroundColor: "#FF6B6B",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  occupiedBadgeText: {
    fontSize: 10,
    color: "#FFF",
    fontWeight: "bold",
  },
  refreshTablesButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 15,
    padding: 10,
  },
  refreshTablesText: {
    fontSize: 14,
    color: config.colors.primary,
  },
  // New Table List Styles (Dark Mode)
  tablesList: {
    flex: 1,
    marginTop: 0,
  },
  tablesListContent: {
    paddingBottom: height * 0.03,
  },
  tableListItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: 'rgba(40, 40, 42, 0.95)', // Uniform glass color
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    padding: 15,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tableListItemOccupied: {
    backgroundColor: 'rgba(40, 40, 42, 0.6)', // Slightly transparent for occupied
    borderColor: 'rgba(255, 112, 67, 0.2)',
  },
  tableListItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  tableNumberCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: config.colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 15,
  },
  tableNumberCircleOccupied: {
    backgroundColor: "#333333",
  },
  tableListNumber: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  tableListNumberOccupied: {
    color: "#666666",
  },
  tableInfo: {
    flex: 1,
  },
  tableListName: {
    fontSize: 16,
    fontWeight: "600",
    color: config.colors.textPrimary,
    marginBottom: 4,
  },
  tableListNameOccupied: {
    color: "#666666",
  },
  tableListCapacity: {
    fontSize: 13,
    color: config.colors.textSecondary,
  },
  tableListCapacityOccupied: {
    color: "#555555",
  },
  tableListItemRight: {
    alignItems: "flex-end",
  },
  availableIndicator: {
    backgroundColor: config.colors.success + "20",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: config.colors.success,
  },
  availableText: {
    fontSize: 12,
    fontWeight: "bold",
    color: config.colors.success,
  },
  occupiedIndicator: {
    alignItems: "flex-end",
  },
  occupiedText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#FF6B6B",
    marginBottom: 4,
  },
  occupiedTotal: {
    fontSize: 11,
    color: "#888888",
  },
  modeContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modeHeader: {
    alignItems: "center",
    marginBottom: 40,
  },
  modeTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: config.colors.textPrimary,
    marginBottom: 10,
  },
  modeSubtitle: {
    fontSize: 18,
    color: config.colors.textSecondary,
  },
  sessionStatusBadge: {
    backgroundColor: config.colors.info,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 10,
  },
  sessionStatusText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "600",
  },
  modeCards: {
    flexDirection: "row",
    gap: 20,
  },
  modeCardsContent: {
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  modeCardWrapper: {
    width: width * 0.35,
    maxWidth: 350,
    height: 300,
  },
  modeCard: {
    flex: 1,
    borderRadius: 28,
    overflow: 'hidden',
  },
  modeCardContent: {
    flex: 1,
    padding: 32,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  modeCardIcon: {
    marginBottom: 20,
  },
  modeCardTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFF",
    marginBottom: 10,
  },
  modeCardDescription: {
    fontSize: 14,
    color: "rgba(255,255,255,0.9)",
    textAlign: "center",
    marginBottom: 20,
  },
  modeCardBadge: {
    backgroundColor: "rgba(255,255,255,0.3)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  modeCardBadgeText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "bold",
  },
  modeCardPrice: {
    marginTop: 10,
    paddingHorizontal: 15,
    paddingVertical: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    alignSelf: 'center',
  },
  modeCardPriceText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "700",
  },
  changeMesaButton: {
    marginTop: 40,
    padding: 10,
  },
  changeMesaButtonText: {
    color: config.colors.textSecondary,
    fontSize: 16,
    textDecorationLine: "underline",
  },
  
  // Enhanced Mode Selection Styles
  modeHeaderEnhanced: {
    alignItems: "center",
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  modeHeaderContent: {
    alignItems: "center",
  },
  tableIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
  },
  tableIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  tableIcon: {
    fontSize: 45,
  },
  tableInfoEnhanced: {
    alignItems: "flex-start",
  },
  modeTitleEnhanced: {
    fontSize: 36,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 5,
  },
  modeSubtitleEnhanced: {
    fontSize: 16,
    color: "rgba(255,255,255,0.7)",
    marginTop: 3,
  },
  sessionBadgeEnhanced: {
    borderRadius: 25,
    marginTop: 15,
    paddingHorizontal: 20,
    paddingVertical: 10,
    shadowColor: "#22c55e",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  sessionTextEnhanced: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  serviceTypeScroll: {
    flex: 1,
  },
  serviceTypeGrid: {
    paddingVertical: 10,
  },
  cardsGridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    paddingHorizontal: 10,
    gap: 20,
  },
  serviceCardWrapper: {
    width: width * 0.28,
    minWidth: 280,
    maxWidth: 320,
    height: 340,
    marginBottom: 15,
  },
  serviceCardEnhanced: {
    flex: 1,
    borderRadius: 25,
    padding: 25,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(255,255,255,0.05)',
    position: 'relative',
    overflow: 'hidden',
  },
  popularBadgeEnhanced: {
    position: 'absolute',
    top: -2,
    right: -2,
    zIndex: 10,
  },
  popularGradientBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderBottomLeftRadius: 12,
    borderTopRightRadius: 23,
  },
  popularBadgeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  popularText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  cardGlow: {
    position: 'absolute',
    top: -50,
    left: '50%',
    marginLeft: -75,
    width: 150,
    height: 150,
    borderRadius: 75,
    opacity: 0.1,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 50,
    elevation: 10,
  },
  iconWrapper: {
    width: 90,
    height: 90,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 20,
  },
  serviceIcon: {
    fontSize: 55,
  },
  cardMainContent: {
    alignItems: 'center',
    marginBottom: 20,
  },
  cardName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  cardDesc: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
    lineHeight: 20,
  },
  priceTag: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 15,
    alignSelf: 'center',
    marginBottom: 15,
  },
  priceValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  selectBtn: {
    paddingVertical: 13,
    borderRadius: 15,
    alignItems: 'center',
  },
  selectBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  bottomActionsContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  changeMesaButtonEnhanced: {
    alignSelf: 'center',
  },
  changeMesaGradientBtn: {
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: "#ef4444",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  changeMesaBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  
  // Modern Card Styles
  serviceCardModern: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    height: 320,
  },
  popularBadgeModern: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 10,
  },
  popularGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  popularTextModern: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  iconSectionModern: {
    width: 100,
    height: 100,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 16,
  },
  cardContentModern: {
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitleModern: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  cardDescModern: {
    fontSize: 13,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 18,
  },
  priceSectionModern: {
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 12,
    marginBottom: 16,
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: 11,
    color: '#999999',
    marginBottom: 4,
  },
  priceAmount: {
    fontSize: 18,
    fontWeight: '700',
  },
  actionButtonModern: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  
  // Apple Glassmorphism Styles
  glassHeader: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  glassHeaderContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    justifyContent: 'space-between',
  },
  glassHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerContentGlass: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tableInfoGlass: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  tableIconGlass: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255,112,67,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,112,67,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tableNumberGlass: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  tableSubtitleGlass: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 2,
  },
  sessionBadgeGlass: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,112,67,0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,112,67,0.3)',
  },
  sessionTextGlass: {
    color: '#FF7043',
    fontSize: 14,
    fontWeight: '600',
  },
  serviceTypeGridGlass: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 100,
  },
  cardsGridGlass: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
  },
  serviceCardWrapperGlass: {
    width: '48%',
  },
  serviceCardGlass: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    height: 280, // Fixed height for all cards
    justifyContent: 'space-between',
  },
  popularBadgeGlass: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 10,
  },
  popularGradientGlass: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  popularTextGlass: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  iconCircleGlass: {
    width: 80,
    height: 80,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    borderWidth: 1,
  },
  cardContentGlass: {
    alignItems: 'center',
    marginTop: 12,
  },
  cardTitleGlass: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  cardDescGlass: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
    lineHeight: 16,
  },
  priceContainerGlass: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    paddingTop: 12,
    alignItems: 'center',
    minHeight: 50, // Fixed height for price section
  },
  priceLabelGlass: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.5)',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  priceAmountGlass: {
    fontSize: 16,
    fontWeight: '600',
  },
  selectButtonGlass: {
    width: '100%',
    marginTop: 12,
  },
  selectButtonGradientGlass: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
  },
  selectButtonTextGlass: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  bottomActionsGlass: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  changeMesaGlass: {
    width: 140,
  },
  changeMesaBlurGlass: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  changeMesaTextGlass: {
    color: '#FF7043',
    fontSize: 13,
    fontWeight: '600',
  },
  
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: config.colors.card,
    borderBottomWidth: 1,
    borderBottomColor: config.colors.surface,
  },
  modeTagGlass: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 112, 67, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 112, 67, 0.3)',
  },
  modeTagTextGlass: {
    fontSize: 13,
    fontWeight: '500',
    color: '#FF7043',
  },
  glassHeaderCenter: {
    flex: 1,
    marginHorizontal: 20,
  },
  searchBarGlass: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 40,
    gap: 8,
  },
  searchInputGlass: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 15,
  },
  glassHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  totalBadgeGlass: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  totalLabelGlass: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  totalValueGlass: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  billButtonGlass: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 112, 67, 0.15)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 112, 67, 0.3)',
  },
  billButtonTextGlass: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  exitButtonGlass: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // 3-Column Layout Styles
  mainContentGlass: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: config.colors.background,
  },
  // Left Sidebar Styles
  leftSidebarGlass: {
    width: 130,
    borderRightWidth: 1,
    borderRightColor: 'rgba(255, 255, 255, 0.08)',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  sidebarHeader: {
    paddingHorizontal: 10,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  sidebarTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  groupsList: {
    flex: 1,
  },
  selectedModeCompact: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 12,
  },
  compactIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 112, 67, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 112, 67, 0.25)',
  },
  compactModeName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FF7043',
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  groupItemGlass: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
    paddingVertical: 12,
    marginHorizontal: 8,
    marginVertical: 5,
    borderRadius: 14,
    position: 'relative',
    height: 90,
  },
  groupItemActiveGlass: {
    backgroundColor: 'rgba(255, 112, 67, 0.15)',
  },
  groupIconContainerGlass: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  groupIconActiveGlass: {
    backgroundColor: 'rgba(255, 112, 67, 0.25)',
  },
  groupTextContainer: {
    flex: 1,
  },
  groupNameGlass: {
    fontSize: 13,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    lineHeight: 16,
  },
  groupNameActiveGlass: {
    color: '#FF7043',
    fontWeight: '600',
  },
  groupDescGlass: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.4)',
    marginTop: 2,
  },
  groupActiveIndicator: {
    position: 'absolute',
    left: 0,
    top: '25%',
    bottom: '25%',
    width: 3,
    backgroundColor: '#FF7043',
    borderTopRightRadius: 2,
    borderBottomRightRadius: 2,
  },
  // Center Column Styles
  centerColumnGlass: {
    width: width * 0.30,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRightWidth: 1,
    borderRightColor: 'rgba(255, 255, 255, 0.08)',
  },
  categoriesHeaderGlass: {
    paddingHorizontal: 10,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  categoriesTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  categoriesCount: {
    backgroundColor: 'rgba(255, 112, 67, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  categoriesCountText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FF7043',
  },
  categoriesListGlass: {
    flex: 1,
  },
  categoriesListContent: {
    paddingHorizontal: 20,
    paddingVertical: 6,
  },
  loadingCategoriesGlass: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  loadingTextGlass: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.5)',
    marginTop: 8,
  },
  categoryFullCard: {
    height: 70,
    marginVertical: 3,
    borderRadius: 10,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  categoryFullCardActive: {
    borderColor: '#FF7043',
  },
  categoryFullImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  categoryFullImagePlaceholder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(40, 40, 40, 0.95)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryGradientOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '100%',
  },
  categoryFullLabelContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 10,
    paddingVertical: 8,
    alignItems: 'center',
  },
  categoryFullName: {
    fontSize: 15,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.95)',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
    textAlign: 'center',
  },
  categoryFullNameActive: {
    color: '#FF7043',
  },
  categoryActiveGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 112, 67, 0.15)',
  },
  // Right Column - Products Grid
  rightColumnGlass: {
    flex: 1,
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  loadingProductsGlass: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  productsGridGlass: {
    padding: 16,
    paddingBottom: 100,
    flexGrow: 1,
  },
  emptyContainerGlass: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTextGlass: {
    fontSize: 16,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: 16,
  },
  emptySubtextGlass: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.4)',
    marginTop: 4,
  },
  // Product Card Styles - Horizontal Layout
  productCardGlass: {
    width: '100%',
    marginBottom: 12,
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 10,
    overflow: 'hidden',
    minHeight: 160,
  },
  productImageGlass: {
    width: 240,
    height: 160,
    resizeMode: 'cover',
  },
  productImagePlaceholderGlass: {
    width: 240,
    height: 160,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  productRightSection: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 14,
    justifyContent: 'space-between',
  },
  productTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  productBottomRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    marginTop: 'auto',
  },
  productInfoGlass: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 14,
    justifyContent: 'flex-start',
  },
  productNameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  productNameGlass: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    flex: 1,
    marginRight: 10,
    marginBottom: 6,
  },
  productPriceRight: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FF7043',
  },
  productDescriptionGlass: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.5)',
    lineHeight: 18,
    flex: 1,
  },
  quantityControlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  quantityButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 112, 67, 0.3)',
  },
  quantityButtonDisabled: {
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  quantityButtonPlus: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FF7043',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    minWidth: 28,
    textAlign: 'center',
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: config.colors.textPrimary,
  },
  modeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  modeBadgeText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "bold",
  },
  sessionBadge: {
    backgroundColor: config.colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  sessionBadgeText: {
    color: config.colors.textPrimary,
    fontSize: 12,
    fontWeight: "600",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  headerButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: config.colors.surface,
  },
  headerButtonText: {
    color: config.colors.textSecondary,
    fontSize: 14,
    fontWeight: "600",
  },
  billButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: config.colors.primary + "15",
  },
  billButtonText: {
    color: config.colors.primary,
    fontSize: 14,
    fontWeight: "600",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: config.colors.surface,
    borderRadius: 15,
    margin: 15,
    paddingHorizontal: 15,
    height: 50,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: config.colors.textPrimary,
  },
  categoriesContainer: {
    maxHeight: 120,
    marginBottom: 10,
  },
  categoriesContent: {
    paddingHorizontal: 15,
    gap: 10,
  },
  categoryCard: {
    alignItems: "center",
    padding: 12,
    borderRadius: 20,
    backgroundColor: 'rgba(30, 30, 30, 0.75)',

    borderWidth: 1,
    borderColor: "transparent",
    marginRight: 10,
    minWidth: 100,
  },
  categoryCardActive: {
    borderColor: config.colors.primary,
    backgroundColor: config.colors.primary + "10",
  },
  categoryIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  categoryIconText: {
    fontSize: 28,
  },
  categoryName: {
    fontSize: 13,
    color: config.colors.textSecondary,
    fontWeight: "600",
  },
  categoryNameActive: {
    color: config.colors.primary,
    fontWeight: "bold",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: config.colors.textSecondary,
  },
  productsGrid: {
    paddingHorizontal: 10,
    paddingBottom: 100,
  },
  productCard: {
    flex: 1,
    backgroundColor: 'rgba(30, 30, 30, 0.75)',

    borderRadius: 20,
    margin: 5,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  productImage: {
    width: "100%",
    height: 150,
    resizeMode: "cover",
  },
  productImagePlaceholder: {
    width: "100%",
    height: 150,
    backgroundColor: config.colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  productImagePlaceholderText: {
    fontSize: 50,
  },
  premiumBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: config.colors.warning,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  premiumBadgeText: {
    color: "#FFF",
    fontSize: 10,
    fontWeight: "bold",
  },
  productInfo: {
    padding: 12,
  },
  productName: {
    fontSize: 16,
    fontWeight: "bold",
    color: config.colors.textPrimary,
    marginBottom: 5,
  },
  productDescription: {
    fontSize: 12,
    color: config.colors.textSecondary,
    marginBottom: 10,
  },
  productPriceContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  productPrice: {
    fontSize: 18,
    fontWeight: "bold",
    color: config.colors.primary,
  },
  rodizioTag: {
    backgroundColor: config.colors.rodizioColor,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  rodizioTagText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "bold",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
    marginTop: 50,
  },
  emptyText: {
    fontSize: 18,
    color: config.colors.textSecondary,
    textAlign: "center",
  },
  cartFloatingButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    left: 20,
    backgroundColor: config.colors.primary,
    borderRadius: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  cartFloatingButtonInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 18,
  },
  cartBadge: {
    backgroundColor: "#FFF",
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  cartBadgeText: {
    color: config.colors.primary,
    fontSize: 14,
    fontWeight: "bold",
  },
  cartFloatingButtonText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  cartFloatingButtonTotal: {
    color: "#FFF",
    fontSize: 20,
    fontWeight: "bold",
  },
  waiterButton: {
    position: "absolute",
    bottom: 100,
    left: 20,
    backgroundColor: config.colors.info,
    borderRadius: 35,
    width: 70,
    height: 70,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
  },
  waiterButtonInner: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  waiterButtonIcon: {
    fontSize: 24,
  },
  waiterButtonText: {
    color: "#FFF",
    fontSize: 10,
    fontWeight: "bold",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  observationModal: {
    backgroundColor: 'rgba(30, 30, 30, 0.95)',

    borderRadius: 28,
    padding: 28,
    width: width * 0.7,
    maxWidth: 500,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  observationModalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: config.colors.textPrimary,
    marginBottom: 10,
    textAlign: "center",
  },
  observationModalSubtitle: {
    fontSize: 14,
    color: config.colors.textSecondary,
    marginBottom: 20,
    textAlign: "center",
  },
  observationInput: {
    backgroundColor: config.colors.surface,
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    color: config.colors.textPrimary,
    minHeight: 80,
    textAlignVertical: "top",
    marginBottom: 20,
  },
  observationModalButtons: {
    flexDirection: "row",
    gap: 10,
  },
  observationModalButton: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: "center",
  },
  observationModalButtonCancel: {
    backgroundColor: config.colors.surface,
  },
  observationModalButtonCancelText: {
    color: config.colors.textSecondary,
    fontSize: 16,
    fontWeight: "600",
  },
  observationModalButtonConfirm: {
    backgroundColor: config.colors.primary,
  },
  observationModalButtonConfirmText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  imageModalOverlay: {
    flex: 1,
    backgroundColor: "#000000",
    justifyContent: "flex-start",
    alignItems: "flex-start",
    paddingTop: 0,
    margin: 0,
  },
  imageModalCloseButton: {
    position: 'absolute',
    top: 25,
    right: 25,
    zIndex: 10,
  },
  imageModalCloseCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#D4A574',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageModalPlaceholder: {
    width: width - 140,
    height: height * 0.68,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 20,
    marginTop: 20,
    borderRadius: 16,
  },
  imageModalImage: {
    width: width - 140,
    height: height * 0.68,
    marginLeft: 20,
    marginTop: 20,
    borderRadius: 16,
  },
  imageModalInfoBar: {
    position: 'absolute',
    bottom: 25,
    left: 20,
    right: 140,
    backgroundColor: 'transparent',
    paddingVertical: 0,
    paddingHorizontal: 0,
  },
  imageModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    letterSpacing: 1,
  },
  imageModalDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: 22,
  },
  cartModal: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(20, 20, 20, 0.95)',

    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    maxHeight: height * 0.8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 20,
  },
  cartHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: config.colors.surface,
  },
  cartTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: config.colors.textPrimary,
  },
  cartCloseButton: {
    fontSize: 30,
    color: config.colors.textSecondary,
  },
  cartItems: {
    maxHeight: height * 0.5,
  },
  cartItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: config.colors.surface,
  },
  cartItemInfo: {
    flex: 1,
  },
  cartItemName: {
    fontSize: 16,
    fontWeight: "600",
    color: config.colors.textPrimary,
    marginBottom: 5,
  },
  cartItemObservation: {
    fontSize: 12,
    color: config.colors.textSecondary,
    fontStyle: "italic",
    marginBottom: 5,
  },
  cartItemPrice: {
    fontSize: 16,
    color: config.colors.primary,
    fontWeight: "bold",
  },
  cartItemQuantity: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
  },
  cartQuantityButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: config.colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  cartQuantityButtonText: {
    fontSize: 20,
    fontWeight: "bold",
    color: config.colors.textPrimary,
  },
  cartQuantityText: {
    fontSize: 18,
    fontWeight: "bold",
    color: config.colors.textPrimary,
    minWidth: 30,
    textAlign: "center",
  },
  cartFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: config.colors.surface,
  },
  cartTotal: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  cartTotalLabel: {
    fontSize: 18,
    color: config.colors.textSecondary,
  },
  cartTotalValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: config.colors.textPrimary,
  },
  sendOrderButton: {
    backgroundColor: config.colors.primary,
    paddingVertical: 18,
    borderRadius: 25,
    alignItems: "center",
  },
  sendOrderButtonDisabled: {
    opacity: 0.5,
  },
  sendOrderButtonText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  billModal: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(20, 20, 20, 0.95)',

    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    maxHeight: height * 0.85,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 20,
  },
  billHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: config.colors.surface,
  },
  billTitle: {
    flex: 1,
    fontSize: 22,
    fontWeight: "bold",
    color: config.colors.textPrimary,
    marginLeft: 10,
  },
  billCloseButton: {
    fontSize: 30,
    color: config.colors.textSecondary,
  },
  billContent: {
    maxHeight: height * 0.55,
    padding: 20,
  },
  billEmpty: {
    alignItems: "center",
    padding: 40,
  },
  billEmptyText: {
    fontSize: 16,
    color: config.colors.textSecondary,
  },
  billOrder: {
    backgroundColor: config.colors.surface,
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
  },
  billOrderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  billOrderNumber: {
    fontSize: 16,
    fontWeight: "bold",
    color: config.colors.textPrimary,
  },
  billOrderTime: {
    fontSize: 14,
    color: config.colors.textSecondary,
  },
  billItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 5,
  },
  billItemQuantity: {
    fontSize: 14,
    color: config.colors.textSecondary,
    width: 30,
  },
  billItemName: {
    flex: 1,
    fontSize: 14,
    color: config.colors.textPrimary,
    paddingHorizontal: 10,
  },
  billItemPrice: {
    fontSize: 14,
    fontWeight: "600",
    color: config.colors.textPrimary,
  },
  billOrderTotal: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: config.colors.surface,
  },
  billOrderTotalLabel: {
    fontSize: 14,
    color: config.colors.textSecondary,
  },
  billOrderTotalValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: config.colors.textPrimary,
  },
  billFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: config.colors.surface,
  },
  billTotals: {
    marginBottom: 20,
  },
  billTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  billTotalLabel: {
    fontSize: 16,
    color: config.colors.textSecondary,
  },
  billTotalValue: {
    fontSize: 16,
    color: config.colors.textPrimary,
  },
  billGrandTotal: {
    borderTopWidth: 1,
    borderTopColor: config.colors.surface,
    marginTop: 10,
    paddingTop: 15,
  },
  billGrandTotalLabel: {
    fontSize: 20,
    fontWeight: "bold",
    color: config.colors.textPrimary,
  },
  billGrandTotalValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: config.colors.primary,
  },
  requestBillButton: {
    backgroundColor: config.colors.success,
    paddingVertical: 18,
    borderRadius: 25,
    alignItems: "center",
  },
  requestBillButtonText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  paymentModal: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  paymentModalContent: {
    backgroundColor: config.colors.card,
    borderRadius: 20,
    padding: 25,
    width: width * 0.8,
    maxWidth: 500,
  },
  paymentModalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: config.colors.textPrimary,
    textAlign: "center",
    marginBottom: 10,
  },
  paymentModalSubtitle: {
    fontSize: 18,
    color: config.colors.primary,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 25,
  },
  paymentOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 25,
  },
  paymentOption: {
    width: "48%",
    backgroundColor: config.colors.surface,
    borderRadius: 15,
    padding: 20,
    alignItems: "center",
    marginBottom: 10,
    borderWidth: 2,
    borderColor: "transparent",
  },
  paymentOptionSelected: {
    borderColor: config.colors.primary,
    backgroundColor: config.colors.primary + "10",
  },
  paymentOptionText: {
    marginTop: 10,
    fontSize: 14,
    fontWeight: "600",
    color: config.colors.textSecondary,
  },
  paymentOptionTextSelected: {
    color: config.colors.primary,
  },
  paymentModalButtons: {
    flexDirection: "row",
    gap: 10,
  },
  paymentModalButton: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: "center",
  },
  paymentModalButtonCancel: {
    backgroundColor: config.colors.surface,
  },
  paymentModalButtonCancelText: {
    color: config.colors.textSecondary,
    fontSize: 16,
    fontWeight: "600",
  },
  paymentModalButtonConfirm: {
    backgroundColor: config.colors.success,
  },
  paymentModalButtonConfirmText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  toast: {
    position: "absolute",
    top: 0,
    left: 20,
    right: 20,
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 10,
  },
  toastSuccess: {
    backgroundColor: config.colors.success,
  },
  toastError: {
    backgroundColor: config.colors.error,
  },
  toastInfo: {
    backgroundColor: config.colors.info,
  },
  toastText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  successOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
  successContent: {
    backgroundColor: config.colors.success,
    borderRadius: 30,
    padding: 40,
    alignItems: "center",
  },
  successText: {
    color: "#FFF",
    fontSize: 28,
    fontWeight: "bold",
    marginTop: 20,
  },
  successSubtext: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 16,
    marginTop: 10,
  },
  // Idle Screen Styles
  idleContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: config.colors.background,
    justifyContent: "center",
    alignItems: "center",
  },
  idleContent: {
    flex: 1,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  idleGlassBg: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.85)",
    justifyContent: "center",
    alignItems: "center",
  },
  idleLogoWrapper: {
    marginBottom: 60,
  },
  idleLogoCircle: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 15,
  },
  idleLogoImage: {
    width: 100,
    height: 100,
  },
  clockContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  clockTime: {
    fontSize: 72,
    fontWeight: "200",
    color: "#FFFFFF",
    letterSpacing: -2,
  },
  clockDate: {
    fontSize: 20,
    fontWeight: "300",
    color: "rgba(255, 255, 255, 0.7)",
    marginTop: 5,
    textTransform: "capitalize",
  },
  idleRestaurantName: {
    fontSize: 28,
    fontWeight: "600",
    color: config.colors.primary,
    marginBottom: 60,
    letterSpacing: 2,
  },
  idleHintContainer: {
    alignItems: "center",
    position: "absolute",
    bottom: 100,
  },
  idleHintDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: config.colors.primary,
    marginBottom: 10,
  },
  idleHintText: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.6)",
    fontWeight: "300",
  },
  idleHeader: {
    alignItems: "center",
    marginTop: 60,
  },
  idleLogo: {
    fontSize: 100,
  },
  idleTitle: {
    fontSize: 42,
    fontWeight: "bold",
    color: config.colors.textPrimary,
    marginTop: 20,
  },
  idleSubtitle: {
    fontSize: 18,
    color: config.colors.textSecondary,
    marginTop: 10,
  },
  promoCard: {
    backgroundColor: config.colors.card,
    borderRadius: 25,
    padding: 30,
    width: width * 0.8,
    maxWidth: 500,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  promoHighlight: {
    position: "absolute",
    top: -15,
    right: 20,
    backgroundColor: config.colors.error,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  promoHighlightText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "bold",
  },
  promoIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: config.colors.primary + "20",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  promoEmoji: {
    fontSize: 40,
  },
  promoTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: config.colors.textPrimary,
    textAlign: "center",
    marginBottom: 15,
  },
  promoDescription: {
    fontSize: 16,
    color: config.colors.textSecondary,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 20,
  },
  promoPriceContainer: {
    alignItems: "center",
  },
  promoPriceLabel: {
    fontSize: 14,
    color: config.colors.textTertiary,
  },
  promoPrice: {
    fontSize: 32,
    fontWeight: "bold",
    color: config.colors.primary,
    marginTop: 5,
  },
  carouselIndicators: {
    flexDirection: "row",
    gap: 8,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: config.colors.textTertiary,
  },
  indicatorActive: {
    backgroundColor: config.colors.primary,
    width: 20,
  },
  touchToStart: {
    backgroundColor: config.colors.primary,
    paddingHorizontal: 40,
    paddingVertical: 20,
    borderRadius: 30,
  },
  touchToStartText: {
    color: "#FFF",
    fontSize: 20,
    fontWeight: "bold",
  },
  idleFooter: {
    alignItems: "center",
  },
  idleTime: {
    fontSize: 48,
    fontWeight: "bold",
    color: config.colors.textPrimary,
  },
  idleDate: {
    fontSize: 16,
    color: config.colors.textSecondary,
    marginTop: 5,
    textTransform: "capitalize",
  },
  // Connection Modal Styles - Simplified
  connectionModalOverlay: {
    flex: 1,
    backgroundColor: "#000000",
    justifyContent: "center",
    alignItems: "center",
  },
  connectionModalSimple: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
    backgroundColor: "#000000",
    width: "100%",
  },
  connectionTitleSimple: {
    fontSize: 24,
    fontWeight: "600",
    color: "#FFF",
    marginTop: 20,
  },
  connectionSubtitle: {
    fontSize: 16,
    color: "#AAA",
    marginTop: 8,
  },
  connectionErrorText: {
    fontSize: 16,
    color: "#AAA",
    textAlign: "center",
    marginTop: 12,
    lineHeight: 22,
  },
  connectionRetrying: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 24,
    backgroundColor: "rgba(255,255,255,0.1)",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
  },
  connectionRetryingText: {
    fontSize: 14,
    color: "#888",
    marginLeft: 10,
  },
  // Admin Panel Styles
  adminModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  adminModalContent: {
    backgroundColor: config.colors.card,
    borderRadius: 25,
    padding: 30,
    width: width * 0.8,
    maxWidth: 450,
    alignItems: "center",
  },
  adminHeader: {
    alignItems: "center",
    marginBottom: 30,
  },
  adminTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: config.colors.textPrimary,
    marginTop: 15,
  },
  adminLoginContainer: {
    width: "100%",
    alignItems: "center",
  },
  adminLoginLabel: {
    fontSize: 16,
    color: config.colors.textSecondary,
    marginBottom: 20,
  },
  adminPasswordInput: {
    width: 200,
    height: 60,
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
    borderRadius: 15,
    backgroundColor: config.colors.surface,
    color: config.colors.textPrimary,
    letterSpacing: 15,
    marginBottom: 25,
  },
  adminLoginButton: {
    backgroundColor: config.colors.primary,
    paddingHorizontal: 60,
    paddingVertical: 15,
    borderRadius: 25,
    marginBottom: 15,
  },
  adminLoginButtonText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  adminCancelButton: {
    padding: 10,
  },
  adminCancelButtonText: {
    color: config.colors.textTertiary,
    fontSize: 16,
  },
  adminOptionsContainer: {
    width: "100%",
    gap: 15,
  },
  adminOption: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: config.colors.surface,
    borderRadius: 15,
    padding: 20,
  },
  adminOptionTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: "bold",
    color: config.colors.textPrimary,
    marginLeft: 15,
  },
  adminOptionDescription: {
    fontSize: 12,
    color: config.colors.textSecondary,
  },
  adminCloseButton: {
    backgroundColor: config.colors.primary,
    justifyContent: "center",
    marginTop: 10,
  },
  adminCloseButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  
  // Rodízio Modal Styles - Apple Glass Design
  rodizioModalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  rodizioModalContent: {
    width: '100%',
    maxWidth: 450,
    borderRadius: 32,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.3,
    shadowRadius: 30,
    elevation: 20,
    padding: 28,
  },
  rodizioModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
  },
  rodizioHeaderIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 112, 67, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 112, 67, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  rodizioModalTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  rodizioModalSubtitle: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.65)',
    fontWeight: '400',
  },
  rodizioCounterContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  rodizioCounterLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  rodizioCounterInfo: {
    marginLeft: 14,
  },
  rodizioCounterTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 3,
  },
  rodizioCounterPrice: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.55)',
  },
  rodizioCounterButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rodizioCounterButton: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 112, 67, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 112, 67, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rodizioCounterButtonDisabled: {
    backgroundColor: 'rgba(100, 100, 100, 0.1)',
    borderColor: 'rgba(100, 100, 100, 0.2)',
  },
  rodizioCounterValue: {
    minWidth: 60,
    alignItems: 'center',
  },
  rodizioCounterNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  rodizioTotalContainer: {
    backgroundColor: 'rgba(255, 112, 67, 0.08)',
    borderRadius: 18,
    padding: 20,
    marginTop: 8,
    marginBottom: 28,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 112, 67, 0.15)',
  },
  rodizioTotalLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.8)',
  },
  rodizioTotalValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FF7043',
  },
  rodizioModalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  rodizioCancelButton: {
    flex: 1,
    height: 56,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rodizioCancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.7)',
  },
  rodizioConfirmButton: {
    flex: 1.5,
    height: 56,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#FF5722',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  rodizioConfirmGradient: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  rodizioConfirmButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
export default function App() {
  return (
    <SafeAreaProvider>
      <MainApp />
    </SafeAreaProvider>
  );
}
