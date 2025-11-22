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
import { useKeepAwake } from 'expo-keep-awake';
import { config } from './config';

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

// Constants
const IDLE_TIMEOUT = 120000; // 2 minutes
const KIOSK_PIN = "1234"; // Kiosk admin PIN
const LONG_PRESS_DURATION = 3000; // 3 seconds for admin menu

// Icon Components
const IconComponent = ({ name, size = 24, color = "#FFF" }: { name: string, size?: number, color?: string }) => {
  switch(name) {
    case 'crown':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path d="M5 16L3 7l4.5 3L12 4l4.5 6L21 7l-2 9H5z" stroke={color} strokeWidth="2" fill={color} fillOpacity="0.2" strokeLinejoin="round"/>
          <Circle cx="12" cy="15" r="2" fill={color}/>
        </Svg>
      );
    case 'fire':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path d="M12 2C12 2 17 7 17 13C17 17 14.5 20 12 20C9.5 20 7 17 7 13C7 7 12 2 12 2Z" stroke={color} strokeWidth="2" fill={color} fillOpacity="0.3"/>
        </Svg>
      );
    case 'utensils':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path d="M9 2v8l-3 3v8M9 10h3m0-8v19M15 2v5c0 1.5 2 3 3 3V2" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </Svg>
      );
    case 'menu-book':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path d="M4 19V5a2 2 0 012-2h12a2 2 0 012 2v14M4 19l8-1 8 1M4 19a2 2 0 002 2h12a2 2 0 002-2" stroke={color} strokeWidth="2"/>
          <Path d="M8 7h8M8 11h8M8 15h5" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
        </Svg>
      );
    case 'cup-soda':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path d="M5 12V8a1 1 0 011-1h12a1 1 0 011 1v4M5 12l2 8h10l2-8M5 12h14" stroke={color} strokeWidth="2"/>
          <Path d="M7 2v5M12 2v5M17 2v5" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
        </Svg>
      );
    case 'star':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
          <Path d="M12 2l3 7h7l-5.5 4 2 7L12 15l-6.5 5 2-7L2 9h7z"/>
        </Svg>
      );
    case 'pizza':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path d="M12 2L3 13h18L12 2z" stroke={color} strokeWidth="2" fill={color} fillOpacity="0.2"/>
          <Path d="M3 13l9 8 9-8" stroke={color} strokeWidth="2"/>
          <Circle cx="12" cy="9" r="1" fill={color}/>
          <Circle cx="9" cy="14" r="1" fill={color}/>
          <Circle cx="15" cy="14" r="1" fill={color}/>
        </Svg>
      );
    case 'burger':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path d="M4 9h16M4 15h16" stroke={color} strokeWidth="2" strokeLinecap="round"/>
          <Path d="M5 9a7 7 0 0114 0M5 15v2a2 2 0 002 2h10a2 2 0 002-2v-2" stroke={color} strokeWidth="2"/>
        </Svg>
      );
    case 'salad':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path d="M7 10h10l-1 8H8l-1-8z" stroke={color} strokeWidth="2" fill={color} fillOpacity="0.2"/>
          <Path d="M12 3v7M8 6l4 4M16 6l-4 4" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
        </Svg>
      );
    case 'coffee':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path d="M6 8h10v8a2 2 0 01-2 2H8a2 2 0 01-2-2V8zM16 10h2a2 2 0 110 4h-2" stroke={color} strokeWidth="2"/>
          <Path d="M10 3v2M12 3v2M14 3v2" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
        </Svg>
      );
    case 'cake':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path d="M3 20h18v-8H3v8zM3 12h18V9a1 1 0 00-1-1H4a1 1 0 00-1 1v3z" stroke={color} strokeWidth="2" fill={color} fillOpacity="0.2"/>
          <Path d="M12 8V5M12 5a1 1 0 100-2 1 1 0 000 2z" stroke={color} strokeWidth="2"/>
        </Svg>
      );
    case 'crown':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path d="M5 16L3 7l5.5 5L12 4l3.5 8L21 7l-2 9H5z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill={color} fillOpacity="0.2"/>
          <Path d="M5 20h14" stroke={color} strokeWidth="2" strokeLinecap="round"/>
        </Svg>
      );
    case 'fire':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path d="M12 2c1 3 5 6 5 10a5 5 0 01-10 0c0-1.5.5-2.5 1-3.5.5 1.5 2 2.5 3.5 2.5 1.5 0 2.5-2 .5-5z" stroke={color} strokeWidth="2" fill={color} fillOpacity="0.2"/>
        </Svg>
      );
    case 'menu-book':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path d="M4 19V5a2 2 0 012-2h12a2 2 0 012 2v14M4 19l8-2 8 2M4 19a2 2 0 002 2h12a2 2 0 002-2M12 17V5" stroke={color} strokeWidth="2" strokeLinecap="round"/>
        </Svg>
      );
    case 'table':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Rect x="4" y="4" width="16" height="16" rx="2" stroke={color} strokeWidth="2" fill={color} fillOpacity="0.15"/>
        </Svg>
      );
    case 'chair':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path d="M5 10V6a2 2 0 012-2h10a2 2 0 012 2v4M5 10v10M19 10v10M5 14h14" stroke={color} strokeWidth="2" strokeLinecap="round"/>
        </Svg>
      );
    case 'restaurant':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" fill={color} fillOpacity="0.1"/>
          <Path d="M8 12h8M12 8v8" stroke={color} strokeWidth="2" strokeLinecap="round"/>
        </Svg>
      );
    case 'sushi':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth="2"/>
          <Circle cx="12" cy="12" r="4" fill={color}/>
        </Svg>
      );
    case 'drink':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path d="M5 12V7a1 1 0 011-1h12a1 1 0 011 1v5M5 12l2 7h10l2-7M5 12h14M12 6v7" stroke={color} strokeWidth="2" strokeLinecap="round"/>
        </Svg>
      );
    case 'rice':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Rect x="6" y="10" width="12" height="8" rx="2" stroke={color} strokeWidth="2"/>
          <Path d="M8 10V8a4 4 0 018 0v2" stroke={color} strokeWidth="2"/>
        </Svg>
      );
    case 'fish':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path d="M12 5C16 5 19 8 19 12C19 16 16 19 12 19C8 19 5 16 5 12C5 8 8 5 12 5Z" stroke={color} strokeWidth="2"/>
          <Circle cx="10" cy="11" r="1" fill={color}/>
        </Svg>
      );
    case 'dessert':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path d="M12 2L15 10H9L12 2Z" fill={color}/>
          <Rect x="8" y="12" width="8" height="8" rx="1" stroke={color} strokeWidth="2"/>
        </Svg>
      );
    case 'arrow-right':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path d="M5 12h14M12 5l7 7-7 7" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </Svg>
      );
    case 'bill':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Rect x="5" y="4" width="14" height="16" rx="2" stroke={color} strokeWidth="2"/>
          <Path d="M9 8h6M9 12h6M9 16h4" stroke={color} strokeWidth="2" strokeLinecap="round"/>
        </Svg>
      );
    case 'credit-card':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Rect x="3" y="5" width="18" height="14" rx="2" stroke={color} strokeWidth="2"/>
          <Path d="M3 9h18" stroke={color} strokeWidth="2"/>
          <Path d="M7 14h4" stroke={color} strokeWidth="2" strokeLinecap="round"/>
        </Svg>
      );
    case 'money':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth="2"/>
          <Path d="M12 7v10M9 10h6" stroke={color} strokeWidth="2" strokeLinecap="round"/>
        </Svg>
      );
    case 'pix':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path d="M4 4L20 20M20 4L4 20" stroke={color} strokeWidth="2" strokeLinecap="round"/>
        </Svg>
      );
    case 'check':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
          <Path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
        </Svg>
      );
    case 'admin':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path d="M12 2L2 7L12 12L22 7L12 2Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <Path d="M2 17L12 22L22 17" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <Path d="M2 12L12 17L22 12" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </Svg>
      );
    case 'exit':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <Path d="M16 17l5-5-5-5" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <Path d="M21 12H9" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </Svg>
      );
    case 'refresh':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path d="M1 4v6h6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <Path d="M23 20v-6h-6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <Path d="M20.49 9A9 9 0 005.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 013.51 15" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </Svg>
      );
    case 'stats':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path d="M18 20V10" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <Path d="M12 20V4" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <Path d="M6 20v-6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </Svg>
      );
    case 'plus':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path d="M12 5v14M5 12h14" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        </Svg>
      );
    case 'minus':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path d="M5 12h14" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        </Svg>
      );
    case 'user':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Circle cx="12" cy="8" r="4" stroke={color} strokeWidth="2"/>
          <Path d="M6 21v-2a4 4 0 014-4h4a4 4 0 014 4v2" stroke={color} strokeWidth="2" strokeLinecap="round"/>
        </Svg>
      );
    case 'child':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Circle cx="12" cy="7" r="3" stroke={color} strokeWidth="2"/>
          <Path d="M7 14c0-2.5 2-4 5-4s5 1.5 5 4v5a1 1 0 01-1 1H8a1 1 0 01-1-1v-5z" stroke={color} strokeWidth="2"/>
          <Path d="M10 5l-2-2M14 5l2-2" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
        </Svg>
      );
    default:
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2"/>
        </Svg>
      );
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
  const [deviceId] = useState<string>(
    "tablet_" + Math.random().toString(36).substring(7)
  );
  const [searchText, setSearchText] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  
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
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error" | "info">("info");

  // Brightness Control and Kiosk Mode States
  const [originalBrightness, setOriginalBrightness] = useState(1);
  const [isDimmed, setIsDimmed] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
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

  // Timers and Refs
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<number>(Date.now());
  const panResponderRef = useRef<any>(null);

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

  // Brightness management
  const resetIdleTimer = useCallback(async () => {
    lastActivityRef.current = Date.now();
    
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
    }
    
    // Restore brightness if dimmed
    if (isDimmed) {
      try {
        await Brightness.setBrightnessAsync(originalBrightness);
        setIsDimmed(false);
      } catch (error) {
        console.error('Error restoring brightness:', error);
      }
    }
    
    // Set timer to dim after 2 minutes of inactivity
    idleTimerRef.current = setTimeout(async () => {
      try {
        // Save current brightness before dimming
        const currentBrightness = await Brightness.getBrightnessAsync();
        setOriginalBrightness(currentBrightness);
        
        // Dim to 10% brightness to save battery
        await Brightness.setBrightnessAsync(0.1);
        setIsDimmed(true);
      } catch (error) {
        console.error('Error dimming screen:', error);
      }
    }, IDLE_TIMEOUT);
  }, [isDimmed, originalBrightness]);

  // Pan Responder for touch tracking
  useEffect(() => {
    panResponderRef.current = PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        resetIdleTimer();
      },
      onPanResponderMove: () => {
        resetIdleTimer();
      },
    });
  }, [resetIdleTimer]);

  // Initialize and setup
  useEffect(() => {
    // Initialize brightness control
    const initBrightness = async () => {
      try {
        // Request permission to control brightness if needed
        const { status } = await Brightness.requestPermissionsAsync();
        if (status === 'granted') {
          // Get current brightness to store as original
          const current = await Brightness.getBrightnessAsync();
          setOriginalBrightness(current);
          console.log('Brightness control initialized. Current brightness:', current);
        } else {
          console.log('Brightness permission not granted');
        }
      } catch (error) {
        console.error('Error initializing brightness:', error);
      }
    };
    
    initBrightness();
    loadCategories();
    loadProducts();
    loadTables(); // Load available tables on startup
    loadServiceTypes(); // Load service types and groups
    
    // Atualiza as mesas a cada 30 segundos para manter sincronizado com o POS
    const tablesInterval = setInterval(() => {
      loadTables();
    }, 30000);
    
    // Initialize idle timer
    resetIdleTimer();
    
    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: config.animations.slow,
      useNativeDriver: true,
    }).start();

    // Cleanup and disable back button in kiosk mode
    const cleanup = () => {
      clearInterval(tablesInterval);
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current);
      }
      // Restore original brightness when app closes
      Brightness.setBrightnessAsync(originalBrightness).catch(console.error);
    };
    
    if (Platform.OS === 'android' && kioskMode) {
      const backHandler = BackHandler.addEventListener('hardwareBackPress', () => true);
      return () => {
        backHandler.remove();
        cleanup();
      };
    }
    
    return cleanup;
  }, []);


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

  // Auto-reset after successful order
  const autoResetAfterOrder = useCallback(() => {
    setTimeout(() => {
      setCart([]);
      setSearchText("");
      setSelectedCategory(null);
      resetIdleTimer();
    }, 5000); // Reset after 5 seconds
  }, [resetIdleTimer]);

  // Handle long press for admin menu
  const handleLongPressStart = () => {
    longPressTimerRef.current = setTimeout(() => {
      setShowAdminPanel(true);
      // Vibration feedback if available
      if (window.navigator && window.navigator.vibrate) {
        window.navigator.vibrate(200);
      }
    }, LONG_PRESS_DURATION);
  };

  const handleLongPressEnd = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
    }
  };

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
  const handleServiceTypeSelected = (serviceType: any) => {
    // Se for rodízio, abrir modal de quantidade
    if (serviceType.linked_groups?.length > 0) {
      const firstGroup = serviceType.linked_groups[0];
      if (firstGroup.type === 'rodizio' && firstGroup.price) {
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

  const loadCategories = async () => {
    setLoadingCategories(true);
    try {
      const response = await fetch(config.CATALOG_API.categories);
      const data = await response.json();
      if (data.success) {
        // Add colors to categories
        const categoriesWithColors = data.categories.map((cat: Category, index: number) => ({
          ...cat,
          color: config.colors.categoryColors[index % config.colors.categoryColors.length]
        }));
        setCategories(categoriesWithColors);
      }
    } catch (error) {
      console.error("Erro ao carregar categorias:", error);
      Alert.alert("Erro", "Não foi possível carregar as categorias");
    } finally {
      setLoadingCategories(false);
    }
  };

  const loadProducts = async () => {
    setLoadingProducts(true);
    try {
      const response = await fetch(config.CATALOG_API.products);
      const data = await response.json();
      if (data.success) {
        setProducts(data.products);
      }
    } catch (error) {
      console.error("Erro ao carregar produtos:", error);
      Alert.alert("Erro", "Não foi possível carregar os produtos");
    } finally {
      setLoadingProducts(false);
    }
  };

  // Get icon based on linked groups
  const getIconForServiceType = (type: any) => {
    // Map icons based on linked groups, same logic as admin
    if (type.linked_groups && type.linked_groups.length > 0) {
      const groupName = type.linked_groups[0].name?.toLowerCase() || '';
      
      if (groupName.includes('premium') || groupName.includes('rodízio premium')) {
        return 'crown';
      } else if (groupName.includes('tradicional') || groupName.includes('rodízio tradicional')) {
        return 'utensils';
      } else if (groupName.includes('bebida')) {
        return 'coffee';
      } else if (groupName.includes('carte')) {
        return 'menu-book';
      } else if (groupName.includes('sushi') || groupName.includes('japonês')) {
        return 'sushi';
      } else if (groupName.includes('drink') || groupName.includes('coquetel')) {
        return 'drink';
      }
    }
    
    // Check type name as fallback
    const typeName = type.name?.toLowerCase() || '';
    if (typeName.includes('rodízio')) {
      return 'fire';
    } else if (typeName.includes('carte')) {
      return 'menu-book';
    } else if (typeName.includes('bebida')) {
      return 'cup';
    }
    
    // Default icon
    return 'restaurant';
  };

  const loadServiceTypes = async () => {
    try {
      // Usar API do POS para buscar service types (single source of truth)
      console.log("📋 Carregando tipos de atendimento da API do POS:", config.POS_API.serviceTypes);
      const response = await fetch(config.POS_API.serviceTypes);
      const data = await response.json();
      
      if (data.success) {
        console.log("✅ Tipos de atendimento recebidos:", data.serviceTypes);
        
        // Extract all groups from service types
        const allGroups: any[] = [];
        data.serviceTypes.forEach((type: any) => {
          if (type.linked_groups && type.linked_groups.length > 0) {
            allGroups.push(...type.linked_groups);
          }
        });
        setGroups(allGroups);
        
        // Process service types with proper icon mapping
        const processedTypes = data.serviceTypes.map((type: any) => ({
          ...type,
          icon: getIconForServiceType(type),
          color: type.color || '#FF7043', // Use default orange if no color
          linked_group_id: type.linked_groups?.[0]?.id // Use first linked group ID
        }));
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

    // Filter by selected service type/mode
    if (selectedMode) {
      // Check if it's a rodízio service type
      const linkedGroup = selectedMode.linked_group_id && groups ? 
        groups.find(g => g.id === selectedMode.linked_group_id) : null;
      
      if (linkedGroup?.type === 'rodizio') {
        // Show only rodízio items (price = 0)
        filtered = filtered.filter((p) => parseFloat(p.price) === 0);
      } else if (selectedMode.name?.toLowerCase().includes('carte') || 
                 selectedMode.name?.toLowerCase().includes('à la carte')) {
        // Show only à la carte items (price > 0)
        filtered = filtered.filter((p) => parseFloat(p.price) > 0);
      }
      // For other service types, show all products
    }

    // Filter by category
    if (selectedCategory) {
      if (selectedCategory === 999) {
        // Bebidas
        filtered = filtered.filter(
          (p) =>
            p.category?.toLowerCase().includes("bebida") ||
            p.category?.toLowerCase().includes("drink") ||
            p.name.toLowerCase().includes("suco") ||
            p.name.toLowerCase().includes("refrigerante") ||
            p.name.toLowerCase().includes("água")
        );
      } else {
        filtered = filtered.filter((p) => p.category_id === selectedCategory);
      }
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
        <StatusBar style="light" />
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

  // Welcome Screen - Table Selection
  if (!tableNumber) {
    return (
      <View style={styles.container}>
        <StatusBar style="light" />
        <View style={styles.welcomeContainer}>
          <Animated.View style={[styles.welcomeContent, { opacity: fadeAnim }]}>
            <View style={styles.welcomeHeader}>
              <Pressable
                onLongPress={handleLongPressStart}
                onPressOut={handleLongPressEnd}
                delayLongPress={0}
              >
                <View style={styles.logoCircleContainer}>
                  <View style={styles.logoCircleBg}>
                    <Image 
                      source={require('./assets/logo23.png')}
                      style={styles.welcomeLogoImage}
                      resizeMode="contain"
                    />
                  </View>
                </View>
              </Pressable>
            </View>
            
            <BlurView intensity={80} tint="dark" style={styles.tableSelectionCard}>
              <View style={styles.glassOverlay}>
                <Text style={styles.tableSelectionTitle}>Selecione sua mesa</Text>
                
                {/* Search Input for Direct Table Number */}
                <View style={styles.tableSearchContainer}>
                  <IconComponent name="search" size={16} color="#999" />
                  <TextInput
                    style={styles.tableSearchInput}
                    placeholder="Digite o número da mesa..."
                    placeholderTextColor="#999"
                    value={tableSearchText}
                    onChangeText={(text) => {
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
                    }}
                    keyboardType="numeric"
                    returnKeyType="done"
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
                                onPress: () => {
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
                  contentContainerStyle={styles.tablesListContent}
                  nestedScrollEnabled={true}
                  scrollEnabled={true}
                  bounces={true}
                >
                  {availableTables.map((table) => (
                    <TouchableOpacity
                      key={table.id}
                      style={[
                        styles.tableListItem,
                        table.status === 'occupied' && styles.tableListItemOccupied,
                      ]}
                      onPress={() => {
                        setTableNumber(table.number.toString());
                        setSelectedTable(table);
                        resetIdleTimer();
                        
                        // Se a mesa está ocupada, mostra informação da conta existente
                        if (table.status === 'occupied') {
                          Alert.alert(
                            "Mesa Ocupada",
                            `Mesa ${table.number} possui uma conta aberta.\n${table.session_total > 0 ? `Total atual: R$ ${table.session_total.toFixed(2)}` : 'Total: R$ 0,00'}\n\nOs novos pedidos serão adicionados à conta existente.`,
                            [
                              { text: "Cancelar", style: "cancel" },
                              { 
                                text: "Continuar",
                                onPress: () => {
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
                          // Mesa disponível, entra direto
                          Animated.timing(fadeAnim, {
                            toValue: 0,
                            duration: config.animations.fast,
                            useNativeDriver: true,
                          }).start();
                        }
                      }}
                      disabled={false}
                      activeOpacity={0.7}
                    >
                      <View style={styles.tableListItemLeft}>
                        <View style={[
                          styles.tableNumberCircle,
                          table.status === 'occupied' && styles.tableNumberCircleOccupied
                        ]}>
                          <Text style={[
                            styles.tableListNumber,
                            table.status === 'occupied' && styles.tableListNumberOccupied
                          ]}>
                            {table.number}
                          </Text>
                        </View>
                        <View style={styles.tableInfo}>
                          <Text style={[
                            styles.tableListName,
                            table.status === 'occupied' && styles.tableListNameOccupied
                          ]}>
                            {table.name}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.tableListItemRight}>
                        {table.status === 'occupied' ? (
                          <View style={styles.occupiedIndicator}>
                            <Text style={styles.occupiedText}>OCUPADA</Text>
                            {table.session_total > 0 && (
                              <Text style={styles.occupiedTotal}>
                                R$ {table.session_total.toFixed(2)}
                              </Text>
                            )}
                          </View>
                        ) : (
                          <View style={styles.availableIndicator}>
                            <Text style={styles.availableText}>DISPONÍVEL</Text>
                          </View>
                        )}
                      </View>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}

              {/* Refresh button */}
              {!tablesLoading && !tablesError && (
                <TouchableOpacity 
                  style={styles.refreshTablesButton}
                  onPress={() => {
                    loadTables();
                    resetIdleTimer();
                  }}
                >
                  <IconComponent name="refresh" size={16} color={config.colors.primary} />
                  <Text style={styles.refreshTablesText}>Atualizar mesas</Text>
                </TouchableOpacity>
              )}
              </View>
            </BlurView>

            <TouchableOpacity style={styles.adminButton} onPress={() => setIsLocked(true)}>
              <Text style={styles.adminButtonText}>Modo Administrador</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </View>
    );
  }

  // Mode Selection Screen - New Beautiful Design
  if (!selectedMode) {
    return (
      <View style={styles.container}>
        <StatusBar style="light" />
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
                        // Show rodízio modal for selecting adults and children
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
                  activeOpacity={0.7}
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
              activeOpacity={0.7}
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
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
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
          {/* Left Sidebar - Groups/Modes */}
          <BlurView intensity={75} tint="dark" style={styles.leftSidebarGlass}>
            <View style={styles.sidebarHeader}>
              <Text style={styles.sidebarTitle}>Cardápio</Text>
            </View>
            <ScrollView 
              showsVerticalScrollIndicator={false}
              style={styles.groupsList}
            >
              {serviceTypes.map((type) => (
                <TouchableOpacity
                  key={type.id}
                  style={[
                    styles.groupItemGlass,
                    selectedMode?.id === type.id && styles.groupItemActiveGlass
                  ]}
                  onPress={async () => {
                    setSelectedMode(type);
                    setSelectedCategory(null);
                    resetIdleTimer();
                    
                    // If service type has linked rodízio group, show modal
                    if (type.linked_group_id && groups && groups.length > 0) {
                      const linkedGroup = groups.find(g => g.id === type.linked_group_id);
                      if (linkedGroup?.type === 'rodizio') {
                        setSelectedRodizioGroup(linkedGroup);
                        setShowRodizioModal(true);
                        Animated.spring(rodizioModalAnim, {
                          toValue: 1,
                          useNativeDriver: true,
                          tension: 50,
                          friction: 9,
                        }).start();
                      }
                    }
                  }}
                  activeOpacity={0.7}
                >
                  <View style={[
                    styles.groupIconContainerGlass,
                    selectedMode?.id === type.id && styles.groupIconActiveGlass
                  ]}>
                    <IconComponent 
                      name={type.icon || 'restaurant'} 
                      size={24} 
                      color={selectedMode?.id === type.id ? '#FF7043' : 'rgba(255, 255, 255, 0.7)'} 
                    />
                  </View>
                  <View style={styles.groupTextContainer}>
                    <Text style={[
                      styles.groupNameGlass,
                      selectedMode?.id === type.id && styles.groupNameActiveGlass
                    ]}>
                      {type.name}
                    </Text>
                    {type.description && (
                      <Text style={styles.groupDescGlass} numberOfLines={1}>
                        {type.description}
                      </Text>
                    )}
                  </View>
                  {selectedMode?.id === type.id && (
                    <View style={styles.groupActiveIndicator} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </BlurView>

          {/* Center Column - Categories */}
          <View style={styles.centerColumnGlass}>
            <BlurView intensity={70} tint="dark" style={styles.categoriesHeaderGlass}>
              <Text style={styles.categoriesTitle}>Categorias</Text>
              <View style={styles.categoriesCount}>
                <Text style={styles.categoriesCountText}>{categories.length}</Text>
              </View>
            </BlurView>
            
            <ScrollView 
              showsVerticalScrollIndicator={false}
              style={styles.categoriesListGlass}
            >
              {loadingCategories ? (
                <View style={styles.loadingCategoriesGlass}>
                  <ActivityIndicator size="small" color="#FF7043" />
                  <Text style={styles.loadingTextGlass}>Carregando...</Text>
                </View>
              ) : (
                <>
                  {/* All Categories Option */}
                  <TouchableOpacity
                    style={[
                      styles.categoryItemGlass,
                      !selectedCategory && styles.categoryItemActiveGlass
                    ]}
                    onPress={() => {
                      setSelectedCategory(null);
                      resetIdleTimer();
                    }}
                  >
                    <View style={[
                      styles.categoryIconGlass,
                      !selectedCategory && styles.categoryIconActiveGlass
                    ]}>
                      <IconComponent name="restaurant" size={20} color={!selectedCategory ? '#FF7043' : 'rgba(255, 255, 255, 0.6)'} />
                    </View>
                    <Text style={[
                      styles.categoryNameGlass,
                      !selectedCategory && styles.categoryNameActiveGlass
                    ]}>
                      Todos os Pratos
                    </Text>
                    {!selectedCategory && (
                      <View style={styles.categoryActiveBar} />
                    )}
                  </TouchableOpacity>

                  {/* Category List */}
                  {categories.map((category) => (
                    <TouchableOpacity
                      key={category.id}
                      style={[
                        styles.categoryItemGlass,
                        selectedCategory === category.id && styles.categoryItemActiveGlass
                      ]}
                      onPress={() => {
                        setSelectedCategory(category.id);
                        resetIdleTimer();
                      }}
                    >
                      <View style={[
                        styles.categoryIconGlass,
                        selectedCategory === category.id && styles.categoryIconActiveGlass
                      ]}>
                        <IconComponent 
                          name={category.icon || 'sushi'} 
                          size={20} 
                          color={selectedCategory === category.id ? '#FF7043' : 'rgba(255, 255, 255, 0.6)'} 
                        />
                      </View>
                      <Text style={[
                        styles.categoryNameGlass,
                        selectedCategory === category.id && styles.categoryNameActiveGlass
                      ]}>
                        {category.name}
                      </Text>
                      {selectedCategory === category.id && (
                        <View style={styles.categoryActiveBar} />
                      )}
                    </TouchableOpacity>
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
                numColumns={2}
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
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.productCardGlass}
                    onPress={() => handleAddToCart(item)}
                    activeOpacity={0.85}
                  >
                    <BlurView intensity={80} tint="dark" style={styles.productCardInnerGlass}>
                      {/* Product Image */}
                      {item.image_url ? (
                        <Image source={{ uri: item.image_url }} style={styles.productImageGlass} />
                      ) : (
                        <View style={styles.productImagePlaceholderGlass}>
                          <IconComponent name="sushi" size={36} color="rgba(255, 255, 255, 0.3)" />
                        </View>
                      )}
                      
                      {/* Premium Badge */}
                      {item.is_premium && (
                        <LinearGradient
                          colors={['#FFD700', '#FFA000']}
                          style={styles.premiumBadgeGlass}
                        >
                          <IconComponent name="star" size={12} color="#FFFFFF" />
                          <Text style={styles.premiumTextGlass}>PREMIUM</Text>
                        </LinearGradient>
                      )}
                      
                      {/* Product Info */}
                      <View style={styles.productInfoGlass}>
                        <Text style={styles.productNameGlass} numberOfLines={2}>
                          {item.name}
                        </Text>
                        
                        {item.description && (
                          <Text style={styles.productDescriptionGlass} numberOfLines={2}>
                            {item.description}
                          </Text>
                        )}
                        
                        {/* Price Section */}
                        <View style={styles.productFooterGlass}>
                          {parseFloat(item.price) > 0 ? (
                            <View style={styles.priceContainerGlass}>
                              <Text style={styles.currencyGlass}>R$</Text>
                              <Text style={styles.priceValueGlass}>
                                {parseFloat(item.price).toFixed(2)}
                              </Text>
                            </View>
                          ) : (
                            <View style={styles.rodizioTagGlass}>
                              <IconComponent name="fire" size={14} color="#FF7043" />
                              <Text style={styles.rodizioTextGlass}>Rodízio</Text>
                            </View>
                          )}
                          
                          {/* Add Button */}
                          <TouchableOpacity 
                            style={styles.addButtonGlass}
                            activeOpacity={0.7}
                          >
                            <LinearGradient
                              colors={['#FF7043', '#FF5722']}
                              style={styles.addButtonGradientGlass}
                            >
                              <IconComponent name="plus" size={20} color="#FFFFFF" />
                            </LinearGradient>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </BlurView>
                  </TouchableOpacity>
                )}
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

        {/* Waiter Button */}
        <Animated.View style={[
          styles.waiterButton,
          {
            transform: [{ scale: waiterButtonAnim }],
            opacity: waiterButtonAnim,
          }
        ]}>
          <TouchableOpacity
            style={styles.waiterButtonInner}
            onPress={callWaiter}
          >
            <Text style={styles.waiterButtonIcon}>🔔</Text>
            <Text style={styles.waiterButtonText}>Chamar</Text>
            <Text style={styles.waiterButtonText}>Garçom</Text>
          </TouchableOpacity>
        </Animated.View>
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
                  <View style={styles.rodizioHeaderIcon}>
                    <IconComponent name={selectedMode?.icon || 'fire'} size={28} color="#FF7043" />
                  </View>
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
            <Text style={styles.cartTitle}>Carrinho</Text>
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
                    style={styles.quantityButton}
                    onPress={() => updateQuantity(item.id, item.quantity - 1)}
                  >
                    <Text style={styles.quantityButtonText}>-</Text>
                  </TouchableOpacity>
                  <Text style={styles.quantityText}>{item.quantity}</Text>
                  <TouchableOpacity
                    style={styles.quantityButton}
                    onPress={() => updateQuantity(item.id, item.quantity + 1)}
                  >
                    <Text style={styles.quantityButtonText}>+</Text>
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
    </SafeAreaView>
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
    padding: 20,
    flex: 1,
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
    paddingBottom: height * 0.02,
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
    marginTop: height * 0.01,
    marginBottom: height * 0.01,
    overflow: 'hidden',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
    height: height * 0.6,
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
    maxHeight: height * 0.35,
    marginTop: height * 0.01,
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
    width: width * 0.22,
    borderRightWidth: 1,
    borderRightColor: 'rgba(255, 255, 255, 0.08)',
  },
  sidebarHeader: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  sidebarTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  groupsList: {
    flex: 1,
  },
  groupItemGlass: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginHorizontal: 12,
    marginVertical: 4,
    borderRadius: 12,
    position: 'relative',
  },
  groupItemActiveGlass: {
    backgroundColor: 'rgba(255, 112, 67, 0.12)',
  },
  groupIconContainerGlass: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  groupIconActiveGlass: {
    backgroundColor: 'rgba(255, 112, 67, 0.2)',
  },
  groupTextContainer: {
    flex: 1,
  },
  groupNameGlass: {
    fontSize: 15,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.8)',
  },
  groupNameActiveGlass: {
    color: '#FFFFFF',
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
    width: width * 0.25,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRightWidth: 1,
    borderRightColor: 'rgba(255, 255, 255, 0.08)',
  },
  categoriesHeaderGlass: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  categoriesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
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
  loadingCategoriesGlass: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  loadingTextGlass: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.5)',
    marginTop: 8,
  },
  categoryItemGlass: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 12,
    marginVertical: 3,
    borderRadius: 10,
    position: 'relative',
  },
  categoryItemActiveGlass: {
    backgroundColor: 'rgba(255, 112, 67, 0.1)',
  },
  categoryIconGlass: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  categoryIconActiveGlass: {
    backgroundColor: 'rgba(255, 112, 67, 0.2)',
  },
  categoryNameGlass: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.7)',
    flex: 1,
  },
  categoryNameActiveGlass: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  categoryActiveBar: {
    position: 'absolute',
    right: 0,
    top: '30%',
    bottom: '30%',
    width: 3,
    backgroundColor: '#FF7043',
    borderTopLeftRadius: 2,
    borderBottomLeftRadius: 2,
  },
  // Right Column - Products Grid
  rightColumnGlass: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  loadingProductsGlass: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  productsGridGlass: {
    padding: 16,
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
  // Product Card Styles
  productCardGlass: {
    flex: 1,
    margin: 8,
    maxWidth: '45%',
  },
  productCardInnerGlass: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  productImageGlass: {
    width: '100%',
    height: 140,
    resizeMode: 'cover',
  },
  productImagePlaceholderGlass: {
    width: '100%',
    height: 140,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  premiumBadgeGlass: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  premiumTextGlass: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  productInfoGlass: {
    padding: 12,
  },
  productNameGlass: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  productDescriptionGlass: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.5)',
    marginBottom: 8,
    lineHeight: 14,
  },
  productFooterGlass: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  currencyGlass: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.6)',
    marginRight: 2,
  },
  priceValueGlass: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  rodizioTagGlass: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 112, 67, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  rodizioTextGlass: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FF7043',
  },
  addButtonGlass: {
    width: 32,
    height: 32,
  },
  addButtonGradientGlass: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
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
  quantityButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: config.colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  quantityButtonText: {
    fontSize: 20,
    fontWeight: "bold",
    color: config.colors.textPrimary,
  },
  quantityText: {
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
