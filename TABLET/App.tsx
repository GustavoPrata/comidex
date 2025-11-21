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
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Circle, Rect, LinearGradient, Defs, Stop } from 'react-native-svg';
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
  total: number;
  items: any[];
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
    case 'fire':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path d="M12 2C12 2 17 7 17 13C17 17 14.5 20 12 20C9.5 20 7 17 7 13C7 7 12 2 12 2Z" stroke={color} strokeWidth="2" fill={color} fillOpacity="0.3"/>
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
    default:
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2"/>
        </Svg>
      );
  }
};

function MainApp() {
  // Estados principais
  const [isLocked, setIsLocked] = useState(false);
  const [password, setPassword] = useState("");
  const [tableNumber, setTableNumber] = useState("");
  const [selectedTable, setSelectedTable] = useState<any>(null);
  const [selectedMode, setSelectedMode] = useState<any>(null);
  const [serviceTypes, setServiceTypes] = useState<any[]>([]);
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

  // Kiosk Mode and Idle Screen States
  const [isIdle, setIsIdle] = useState(false);
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
  const [availableTables, setAvailableTables] = useState<any[]>([]);
  const [tablesLoading, setTablesLoading] = useState(true);
  const [tablesError, setTablesError] = useState("");

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
  const idleFadeAnim = useRef(new Animated.Value(0)).current;
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

  // Reset idle timer
  const resetIdleTimer = useCallback(() => {
    lastActivityRef.current = Date.now();
    
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
    }
    
    if (isIdle) {
      setIsIdle(false);
      Animated.timing(idleFadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
    
    idleTimerRef.current = setTimeout(() => {
      setIsIdle(true);
      Animated.timing(idleFadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }, IDLE_TIMEOUT);
  }, [isIdle, idleFadeAnim]);

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
    loadCategories();
    loadProducts();
    loadTables(); // Load available tables on startup
    loadServiceTypes(); // Load service types
    
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

    // Disable back button in kiosk mode
    if (Platform.OS === 'android' && kioskMode) {
      const backHandler = BackHandler.addEventListener('hardwareBackPress', () => true);
      return () => {
        backHandler.remove();
      };
    }
  }, []);


  // Check or create session when table is selected and mode is chosen
  useEffect(() => {
    if (tableNumber && selectedMode) {
      checkOrCreateSession();
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
            setIsIdle(false);
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

  const checkOrCreateSession = async () => {
    setSessionLoading(true);
    try {
      // Check for existing session
      const checkResponse = await fetch(`${config.API_URL}/session?table_number=${tableNumber}`);
      const checkData = await checkResponse.json();
      
      if (checkData.success && checkData.session) {
        // Existing session found
        setSession(checkData.session);
        setSessionTotal(checkData.session.total || 0);
        Alert.alert(
          "Mesa Ocupada", 
          `Esta mesa já tem uma conta aberta.\nTotal atual: R$ ${checkData.session.total.toFixed(2)}`,
          [{ text: "OK" }]
        );
      } else {
        // Create new session
        const createResponse = await fetch(`${config.API_URL}/session`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ table_number: parseInt(tableNumber) }),
        });
        
        const createData = await createResponse.json();
        if (createData.success) {
          setSession(createData.session);
          setSessionTotal(0);
        }
      }
    } catch (error) {
      console.error("Erro ao verificar/criar sessão:", error);
    } finally {
      setSessionLoading(false);
    }
  };

  const loadSessionOrders = async () => {
    if (!session?.id) return;
    
    try {
      const response = await fetch(`${config.API_URL}/order?session_id=${session.id}`);
      const data = await response.json();
      
      if (data.success) {
        setOrderHistory(data.orders || []);
        
        // Calculate total from orders
        const total = data.orders.reduce((sum: number, order: any) => 
          sum + (order.valor_total || 0), 0
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
      const response = await fetch(`${config.API_URL}/categories`);
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
      const response = await fetch(`${config.API_URL}/products`);
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

  const loadServiceTypes = async () => {
    try {
      console.log("📋 Carregando tipos de atendimento da API:", config.API_URL);
      const response = await fetch(`${config.API_URL}/service-types`);
      const data = await response.json();
      
      if (data.success) {
        console.log("✅ Tipos de atendimento recebidos:", data.service_types);
        setServiceTypes(data.service_types);
      } else {
        console.error("❌ Erro ao carregar tipos de atendimento:", data);
        // Usar tipos padrão se falhar
        setServiceTypes([
          {
            id: 1,
            name: 'Rodízio',
            description: 'Coma à vontade com valor fixo',
            icon: 'fire',
            color: '#FF5722'
          },
          {
            id: 2,
            name: 'À La Carte',
            description: 'Escolha e pague por item',
            icon: 'menu-book',
            color: '#4CAF50'
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
          color: '#FF5722'
        },
        {
          id: 2,
          name: 'À La Carte',
          description: 'Escolha e pague por item',
          icon: 'menu-book',
          color: '#4CAF50'
        }
      ]);
    }
  };

  const loadTables = async () => {
    setTablesLoading(true);
    setTablesError("");
    
    console.log("🔍 Carregando mesas da API:", config.API_URL);
    
    try {
      const response = await fetch(`${config.API_URL}/tables`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log("📡 Response status:", response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("✅ Mesas recebidas:", data);
      
      if (data.success && data.tables) {
        setAvailableTables(data.tables);
        console.log(`📊 Total de mesas: ${data.total}, Disponíveis: ${data.available}, Ocupadas: ${data.occupied}`);
      } else {
        setTablesError(data.error || "Erro ao carregar mesas");
        console.error("❌ Erro na resposta da API:", data);
      }
    } catch (error: any) {
      console.error("❌ Erro ao carregar mesas:", error);
      console.error("Detalhes do erro:", error.message);
      setTablesError(`Erro de conexão: ${error.message || 'Verifique sua internet'}`);
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
      const response = await fetch(`${config.API_URL}/call-waiter`, {
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

    // Filter by mode
    if (selectedMode === "rodizio") {
      filtered = filtered.filter((p) => parseFloat(p.price) === 0);
    } else if (selectedMode === "carte") {
      filtered = filtered.filter((p) => parseFloat(p.price) > 0);
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
      const orderData = {
        table_number: parseInt(tableNumber) || 0,
        mode: selectedMode,
        device_id: deviceId,
        session_id: session?.id,
        items: cart.map((item) => ({
          product_id: item.id,
          quantity: item.quantity,
          price: item.price,
          observation: item.observation || "",
        })),
      };

      const response = await fetch(`${config.API_URL}/order`, {
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

  // Idle Screen Component - Clock Style
  const IdleScreen = () => {
    const [currentTime, setCurrentTime] = useState(new Date());
    
    // Update clock every second
    useEffect(() => {
      if (isIdle) {
        const timer = setInterval(() => {
          setCurrentTime(new Date());
        }, 1000);
        
        return () => clearInterval(timer);
      }
    }, [isIdle]);
    
    const formatTime = (date: Date) => {
      return date.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });
    };
    
    const formatDate = (date: Date) => {
      const options = { weekday: 'long' as const, day: 'numeric' as const, month: 'long' as const };
      return date.toLocaleDateString('pt-BR', options);
    };
    
    return (
      <Animated.View 
        style={[
          styles.idleContainer, 
          { 
            opacity: idleFadeAnim,
            zIndex: isIdle ? 9999 : -1,
          }
        ]}
        {...panResponderRef.current?.panHandlers}
      >
        <TouchableWithoutFeedback onPress={() => resetIdleTimer()}>
          <View style={styles.idleContent}>
            {/* Glass Background */}
            <BlurView intensity={95} tint="dark" style={styles.idleGlassBg}>
              {/* Logo */}
              <Animated.View 
                style={[
                  styles.idleLogoWrapper,
                  { 
                    transform: [{ 
                      scale: idleFadeAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.5, 1]
                      }) 
                    }] 
                  }
                ]}
              >
                <View style={styles.idleLogoCircle}>
                  <Image 
                    source={require('./assets/logo-comidex-new.png')}
                    style={styles.idleLogoImage}
                    resizeMode="contain"
                  />
                </View>
              </Animated.View>

              {/* Clock Display */}
              <Animated.View 
                style={[
                  styles.clockContainer,
                  {
                    opacity: idleFadeAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 1]
                    })
                  }
                ]}
              >
                <Text style={styles.clockTime}>{formatTime(currentTime)}</Text>
                <Text style={styles.clockDate}>{formatDate(currentTime)}</Text>
              </Animated.View>

              {/* Restaurant Name */}
              <Animated.Text 
                style={[
                  styles.idleRestaurantName,
                  {
                    opacity: idleFadeAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 0.8]
                    })
                  }
                ]}
              >
                ComideX
              </Animated.Text>

              {/* Touch Hint */}
              <Animated.View 
                style={[
                  styles.idleHintContainer,
                  {
                    transform: [{
                      translateY: idleFadeAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [50, 0]
                      })
                    }]
                  }
                ]}
              >
                <Animated.View 
                  style={[
                    styles.idleHintDot,
                    {
                      opacity: idleFadeAnim.interpolate({
                        inputRange: [0, 0.5, 1],
                        outputRange: [0, 1, 0.6]
                      })
                    }
                  ]}
                />
                <Text style={styles.idleHintText}>Toque para começar</Text>
              </Animated.View>
            </BlurView>
          </View>
        </TouchableWithoutFeedback>
      </Animated.View>
    );
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
                      source={require('./assets/logo-comidex-new.png')}
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

  // Mode Selection Screen
  if (!selectedMode) {
    return (
      <View style={styles.container}>
        <StatusBar style="light" />
        <IdleScreen />
        <AdminPanel />
        <View style={styles.modeContainer} {...panResponderRef.current?.panHandlers}>
          <View style={styles.modeHeader}>
            <Pressable
              onLongPress={handleLongPressStart}
              onPressOut={handleLongPressEnd}
              delayLongPress={0}
            >
              <Text style={styles.modeTitle}>
                {parseInt(tableNumber) > 100 ? `Balcão ${tableNumber}` : `Mesa ${tableNumber}`}
              </Text>
            </Pressable>
            <Text style={styles.modeSubtitle}>Escolha como deseja pedir</Text>
            {session && (
              <View style={styles.sessionStatusBadge}>
                <Text style={styles.sessionStatusText}>
                  Mesa com conta aberta - Total: R$ {sessionTotal.toFixed(2)}
                </Text>
              </View>
            )}
          </View>

          <ScrollView 
            horizontal 
            style={styles.modeCards}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.modeCardsContent}
          >
            {serviceTypes.map((serviceType, index) => (
              <TouchableOpacity
                key={serviceType.id}
                style={styles.modeCardWrapper}
                onPress={() => {
                  setSelectedMode(serviceType);
                  resetIdleTimer();
                }}
                activeOpacity={0.9}
              >
                <BlurView intensity={70} tint="dark" style={styles.modeCard}>
                  <View style={[styles.modeCardContent, { 
                    backgroundColor: `${serviceType.color || '#FF7043'}20`
                  }]}>
                    <View style={styles.modeCardIcon}>
                      {serviceType.icon === 'crown' && <Text style={{ fontSize: 50 }}>👑</Text>}
                      {serviceType.icon === 'fire' && <IconComponent name="fire" size={60} color="#FFF" />}
                      {serviceType.icon === 'utensils' && <Text style={{ fontSize: 50 }}>🍴</Text>}
                      {serviceType.icon === 'menu-book' && (
                        <Svg width={60} height={60} viewBox="0 0 24 24" fill="none">
                          <Path d="M4 7h16M4 12h16M4 17h16" stroke="#FFF" strokeWidth="2" strokeLinecap="round"/>
                        </Svg>
                      )}
                      {serviceType.icon === 'cup-soda' && <Text style={{ fontSize: 50 }}>🥤</Text>}
                      {serviceType.icon === 'star' && <Text style={{ fontSize: 50 }}>⭐</Text>}
                      {serviceType.icon === 'pizza' && <Text style={{ fontSize: 50 }}>🍕</Text>}
                      {serviceType.icon === 'burger' && <Text style={{ fontSize: 50 }}>🍔</Text>}
                      {serviceType.icon === 'salad' && <Text style={{ fontSize: 50 }}>🥗</Text>}
                      {serviceType.icon === 'coffee' && <Text style={{ fontSize: 50 }}>☕</Text>}
                      {serviceType.icon === 'cake' && <Text style={{ fontSize: 50 }}>🍰</Text>}
                      {!serviceType.icon && <IconComponent name="restaurant" size={60} color="#FFF" />}
                    </View>
                    <Text style={styles.modeCardTitle}>{serviceType.name}</Text>
                    <Text style={styles.modeCardDescription}>
                      {serviceType.description || 'Selecione este modo de atendimento'}
                    </Text>
                    {serviceType.price && (
                      <View style={styles.modeCardPrice}>
                        <Text style={styles.modeCardPriceText}>R$ {serviceType.price.toFixed(2)}</Text>
                      </View>
                    )}
                    {index === 0 && (
                      <View style={styles.modeCardBadge}>
                        <Text style={styles.modeCardBadgeText}>MAIS POPULAR</Text>
                      </View>
                    )}
                  </View>
                </BlurView>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <TouchableOpacity 
            style={styles.changeMesaButton}
            onPress={() => {
              setTableNumber("");
              resetIdleTimer();
            }}
          >
            <Text style={styles.changeMesaButtonText}>Trocar Mesa</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Main Interface
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <IdleScreen />
      <AdminPanel />
      
      <View {...panResponderRef.current?.panHandlers} style={{ flex: 1 }}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Pressable
              onLongPress={handleLongPressStart}
              onPressOut={handleLongPressEnd}
              delayLongPress={0}
            >
              <Text style={styles.headerTitle}>
                {parseInt(tableNumber) > 100 ? `Balcão ${tableNumber}` : `Mesa ${tableNumber}`}
              </Text>
            </Pressable>
            <View style={[
              styles.modeBadge,
              { backgroundColor: selectedMode?.color || config.colors.primary }
            ]}>
              <Text style={styles.modeBadgeText}>
                {selectedMode?.name || 'Selecione'}
              </Text>
            </View>
            {session && (
              <View style={styles.sessionBadge}>
                <Text style={styles.sessionBadgeText}>
                  Conta: R$ {sessionTotal.toFixed(2)}
                </Text>
              </View>
            )}
          </View>
          
          <View style={styles.headerRight}>
            <TouchableOpacity 
              style={[styles.headerButton, styles.billButton]}
              onPress={() => {
                setShowBill(true);
                resetIdleTimer();
                Animated.spring(billSlideAnim, {
                  toValue: 0,
                  useNativeDriver: true,
                }).start();
              }}
            >
              <IconComponent name="bill" size={20} color={config.colors.primary} />
              <Text style={styles.billButtonText}>Ver Conta</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.headerButton}
              onPress={() => {
                setSelectedMode(null);
                setCart([]);
                resetIdleTimer();
              }}
            >
              <Text style={styles.headerButtonText}>Trocar Modo</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" style={styles.searchIcon}>
            <Circle cx="11" cy="11" r="8" stroke={config.colors.textTertiary} strokeWidth="2"/>
            <Path d="M21 21l-4.35-4.35" stroke={config.colors.textTertiary} strokeWidth="2" strokeLinecap="round"/>
          </Svg>
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar produtos..."
            placeholderTextColor={config.colors.textTertiary}
            value={searchText}
            onChangeText={(text) => {
              setSearchText(text);
              resetIdleTimer();
            }}
          />
        </View>

        {/* Categories */}
        {loadingCategories ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={config.colors.primary} />
          </View>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categoriesContainer}
            contentContainerStyle={styles.categoriesContent}
            onScroll={() => resetIdleTimer()}
          >
            <TouchableOpacity
              style={[
                styles.categoryCard,
                !selectedCategory && styles.categoryCardActive,
                { borderColor: config.colors.primary }
              ]}
              onPress={() => {
                setSelectedCategory(null);
                resetIdleTimer();
              }}
            >
              <View style={[styles.categoryIcon, { backgroundColor: config.colors.primary }]}>
                <Text style={styles.categoryIconText}>🍽️</Text>
              </View>
              <Text style={[
                styles.categoryName,
                !selectedCategory && styles.categoryNameActive
              ]}>
                Todos
              </Text>
            </TouchableOpacity>

            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryCard,
                  selectedCategory === category.id && styles.categoryCardActive,
                  { borderColor: category.color || config.colors.primary }
                ]}
                onPress={() => {
                  setSelectedCategory(category.id);
                  resetIdleTimer();
                }}
              >
                <View style={[styles.categoryIcon, { backgroundColor: category.color || config.colors.primary }]}>
                  <IconComponent 
                    name={category.icon || 'sushi'} 
                    size={28} 
                    color="#FFF" 
                  />
                </View>
                <Text style={[
                  styles.categoryName,
                  selectedCategory === category.id && styles.categoryNameActive
                ]}>
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* Products Grid */}
        {loadingProducts ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={config.colors.primary} />
            <Text style={styles.loadingText}>Carregando produtos...</Text>
          </View>
        ) : (
          <FlatList
            data={getFilteredProducts()}
            keyExtractor={(item) => item.id.toString()}
            numColumns={2}
            contentContainerStyle={styles.productsGrid}
            onScroll={() => resetIdleTimer()}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Nenhum produto encontrado</Text>
              </View>
            }
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.productCard}
                onPress={() => handleAddToCart(item)}
                activeOpacity={0.9}
              >
                {item.image_url ? (
                  <Image source={{ uri: item.image_url }} style={styles.productImage} />
                ) : (
                  <View style={styles.productImagePlaceholder}>
                    <Text style={styles.productImagePlaceholderText}>🍽️</Text>
                  </View>
                )}
                {item.is_premium && (
                  <View style={styles.premiumBadge}>
                    <Text style={styles.premiumBadgeText}>⭐ PREMIUM</Text>
                  </View>
                )}
                <View style={styles.productInfo}>
                  <Text style={styles.productName} numberOfLines={2}>
                    {item.name}
                  </Text>
                  {item.description && (
                    <Text style={styles.productDescription} numberOfLines={2}>
                      {item.description}
                    </Text>
                  )}
                  <View style={styles.productPriceContainer}>
                    {parseFloat(item.price) > 0 ? (
                      <Text style={styles.productPrice}>
                        R$ {parseFloat(item.price).toFixed(2)}
                      </Text>
                    ) : (
                      <View style={styles.rodizioTag}>
                        <Text style={styles.rodizioTagText}>Rodízio</Text>
                      </View>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            )}
          />
        )}

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
                  {order.items.map((item: any, index: number) => (
                    <View key={index} style={styles.billItem}>
                      <Text style={styles.billItemQuantity}>{item.quantity}x</Text>
                      <Text style={styles.billItemName}>{item.product_name}</Text>
                      <Text style={styles.billItemPrice}>
                        R$ {(item.quantity * item.price).toFixed(2)}
                      </Text>
                    </View>
                  ))}
                  <View style={styles.billOrderTotal}>
                    <Text style={styles.billOrderTotalLabel}>Subtotal:</Text>
                    <Text style={styles.billOrderTotalValue}>
                      R$ {order.total.toFixed(2)}
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
    marginBottom: 20,
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
    backgroundColor: 'rgba(30, 30, 30, 0.75)',

    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 87, 34, 0.2)',
    padding: 15,
    marginBottom: 10,
    shadowColor: config.colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tableListItemOccupied: {
    backgroundColor: "#0A0A0A",
    borderColor: "#333333",
    opacity: 0.6,
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
});
export default function App() {
  return (
    <SafeAreaProvider>
      <MainApp />
    </SafeAreaProvider>
  );
}
