import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
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
} from "react-native";
import { StatusBar } from "expo-status-bar";
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

const { width, height } = Dimensions.get("window");

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
    default:
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2"/>
        </Svg>
      );
  }
};

export default function App() {
  // Estados principais
  const [isLocked, setIsLocked] = useState(false);
  const [password, setPassword] = useState("");
  const [tableNumber, setTableNumber] = useState("");
  const [selectedMode, setSelectedMode] = useState<"rodizio" | "carte" | null>(null);
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

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(height)).current;
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const cartBounceAnim = useRef(new Animated.Value(1)).current;

  // Inicializar
  useEffect(() => {
    loadCategories();
    loadProducts();
    
    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: config.animations.slow,
      useNativeDriver: true,
    }).start();
  }, []);

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

  const addToCart = (product: Product) => {
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

    const existingItem = cart.find((item) => item.id === product.id);

    if (existingItem) {
      setCart(
        cart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const updateQuantity = (productId: number, quantity: number) => {
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
    try {
      const orderData = {
        table_number: parseInt(tableNumber) || 0,
        mode: selectedMode,
        device_id: deviceId,
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
        setCart([]);
        setShowCart(false);
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
        }, 3000);
      } else {
        Alert.alert("Erro", "Erro ao enviar pedido");
      }
    } catch (error) {
      console.error("Erro ao enviar pedido:", error);
      Alert.alert("Erro", "Erro ao enviar pedido. Verifique sua conexão.");
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

  // Lock Screen
  if (isLocked) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" />
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
      </SafeAreaView>
    );
  }

  // Welcome Screen - Table Selection
  if (!tableNumber) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" />
        <ScrollView contentContainerStyle={styles.welcomeContainer}>
          <Animated.View style={[styles.welcomeContent, { opacity: fadeAnim }]}>
            <View style={styles.welcomeHeader}>
              <Text style={styles.welcomeLogo}>🍱</Text>
              <Text style={styles.welcomeTitle}>ComideX</Text>
              <Text style={styles.welcomeSubtitle}>Sistema de Pedidos</Text>
            </View>
            
            <View style={styles.tableInputCard}>
              <Text style={styles.tableInputLabel}>Qual o número da sua mesa?</Text>
              <TextInput
                style={styles.tableInput}
                value={tableNumber}
                onChangeText={setTableNumber}
                placeholder="00"
                placeholderTextColor={config.colors.textTertiary}
                keyboardType="numeric"
                maxLength={3}
              />
              {tableNumber.length > 0 && (
                <TouchableOpacity
                  style={styles.continueButton}
                  onPress={() => {
                    if (tableNumber) {
                      Animated.timing(fadeAnim, {
                        toValue: 0,
                        duration: config.animations.fast,
                        useNativeDriver: true,
                      }).start();
                    }
                  }}
                >
                  <Text style={styles.continueButtonText}>Continuar</Text>
                </TouchableOpacity>
              )}
            </View>

            <TouchableOpacity style={styles.adminButton} onPress={() => setIsLocked(true)}>
              <Text style={styles.adminButtonText}>Modo Administrador</Text>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Mode Selection Screen
  if (!selectedMode) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" />
        <View style={styles.modeContainer}>
          <View style={styles.modeHeader}>
            <Text style={styles.modeTitle}>Mesa {tableNumber}</Text>
            <Text style={styles.modeSubtitle}>Escolha como deseja pedir</Text>
          </View>

          <View style={styles.modeCards}>
            <TouchableOpacity
              style={[styles.modeCard, { backgroundColor: config.colors.rodizioColor }]}
              onPress={() => setSelectedMode("rodizio")}
              activeOpacity={0.9}
            >
              <View style={styles.modeCardIcon}>
                <IconComponent name="fire" size={60} color="#FFF" />
              </View>
              <Text style={styles.modeCardTitle}>Rodízio</Text>
              <Text style={styles.modeCardDescription}>
                Coma à vontade com valor fixo
              </Text>
              <View style={styles.modeCardBadge}>
                <Text style={styles.modeCardBadgeText}>MAIS POPULAR</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modeCard, { backgroundColor: config.colors.carteColor }]}
              onPress={() => setSelectedMode("carte")}
              activeOpacity={0.9}
            >
              <View style={styles.modeCardIcon}>
                <Svg width={60} height={60} viewBox="0 0 24 24" fill="none">
                  <Path d="M4 7h16M4 12h16M4 17h16" stroke="#FFF" strokeWidth="2" strokeLinecap="round"/>
                </Svg>
              </View>
              <Text style={styles.modeCardTitle}>À La Carte</Text>
              <Text style={styles.modeCardDescription}>
                Escolha e pague por item
              </Text>
              <View style={[styles.modeCardBadge, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                <Text style={styles.modeCardBadgeText}>PERSONALIZADO</Text>
              </View>
            </TouchableOpacity>
          </View>

          <TouchableOpacity 
            style={styles.changeMesaButton}
            onPress={() => setTableNumber("")}
          >
            <Text style={styles.changeMesaButtonText}>Trocar Mesa</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Main Interface
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>Mesa {tableNumber}</Text>
          <View style={[
            styles.modeBadge,
            { backgroundColor: selectedMode === "rodizio" ? config.colors.rodizioColor : config.colors.carteColor }
          ]}>
            <Text style={styles.modeBadgeText}>
              {selectedMode === "rodizio" ? "Rodízio" : "À La Carte"}
            </Text>
          </View>
        </View>
        
        <View style={styles.headerRight}>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={() => {
              setSelectedMode(null);
              setCart([]);
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
          onChangeText={setSearchText}
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
        >
          <TouchableOpacity
            style={[
              styles.categoryCard,
              !selectedCategory && styles.categoryCardActive,
              { borderColor: config.colors.primary }
            ]}
            onPress={() => setSelectedCategory(null)}
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
              onPress={() => setSelectedCategory(category.id)}
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
          numColumns={Math.floor((width - 32) / 220)}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.productsContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>🍱</Text>
              <Text style={styles.emptyText}>Nenhum produto encontrado</Text>
              <Text style={styles.emptySubtext}>Tente buscar por outro termo ou categoria</Text>
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.productCard}
              onPress={() => addToCart(item)}
              activeOpacity={0.9}
            >
              {item.is_premium && (
                <View style={styles.premiumBadge}>
                  <Text style={styles.premiumBadgeText}>PREMIUM</Text>
                </View>
              )}
              
              <View style={styles.productImageContainer}>
                {item.image_url ? (
                  <Image
                    source={{ uri: item.image_url }}
                    style={styles.productImage}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={styles.productImagePlaceholder}>
                    <Text style={styles.productImagePlaceholderText}>
                      {item.category?.includes('Bebida') ? '🥤' : '🍱'}
                    </Text>
                  </View>
                )}
              </View>
              
              <View style={styles.productInfo}>
                <Text style={styles.productName} numberOfLines={2}>
                  {item.name}
                </Text>
                {item.description && (
                  <Text style={styles.productDescription} numberOfLines={2}>
                    {item.description}
                  </Text>
                )}
                <View style={styles.productFooter}>
                  <Text style={styles.productPrice}>
                    {parseFloat(item.price) === 0 ? (
                      <Text style={styles.productPriceIncluded}>Incluso</Text>
                    ) : (
                      <>R$ {parseFloat(item.price).toFixed(2)}</>
                    )}
                  </Text>
                  <View style={styles.addButton}>
                    <Text style={styles.addButtonText}>+</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      )}

      {/* Floating Cart Button */}
      {cart.length > 0 && (
        <Animated.View style={[
          styles.cartFloatingButton,
          { transform: [{ scale: cartBounceAnim }] }
        ]}>
          <TouchableOpacity
            style={styles.cartFloatingButtonInner}
            onPress={() => {
              setShowCart(true);
              Animated.spring(slideAnim, {
                toValue: 0,
                useNativeDriver: true,
              }).start();
            }}
          >
            <View style={styles.cartFloatingContent}>
              <View style={styles.cartFloatingIcon}>
                <Text style={styles.cartFloatingIconText}>🛒</Text>
                <View style={styles.cartBadge}>
                  <Text style={styles.cartBadgeText}>
                    {cart.reduce((sum, item) => sum + item.quantity, 0)}
                  </Text>
                </View>
              </View>
              <View style={styles.cartFloatingInfo}>
                <Text style={styles.cartFloatingLabel}>Ver Carrinho</Text>
                <Text style={styles.cartFloatingTotal}>
                  R$ {getCartTotal().toFixed(2)}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        </Animated.View>
      )}

      {/* Cart Modal */}
      <Modal
        animationType="none"
        transparent={true}
        visible={showCart}
        onRequestClose={() => {
          Animated.timing(slideAnim, {
            toValue: height,
            duration: config.animations.fast,
            useNativeDriver: true,
          }).start(() => setShowCart(false));
        }}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity 
            style={styles.modalOverlayTouch}
            activeOpacity={1}
            onPress={() => {
              Animated.timing(slideAnim, {
                toValue: height,
                duration: config.animations.fast,
                useNativeDriver: true,
              }).start(() => setShowCart(false));
            }}
          />
          
          <Animated.View style={[
            styles.modalContent,
            { transform: [{ translateY: slideAnim }] }
          ]}>
            <View style={styles.modalHandle} />
            
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Seu Pedido</Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => {
                  Animated.timing(slideAnim, {
                    toValue: height,
                    duration: config.animations.fast,
                    useNativeDriver: true,
                  }).start(() => setShowCart(false));
                }}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.cartItemsContainer}>
              {cart.map((item, index) => (
                <Animated.View
                  key={item.id}
                  style={[
                    styles.cartItem,
                    {
                      opacity: fadeAnim,
                      transform: [{
                        translateX: fadeAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [50, 0],
                        })
                      }]
                    }
                  ]}
                >
                  <View style={styles.cartItemLeft}>
                    {item.image_url ? (
                      <Image
                        source={{ uri: item.image_url }}
                        style={styles.cartItemImage}
                      />
                    ) : (
                      <View style={[styles.cartItemImage, styles.cartItemImagePlaceholder]}>
                        <Text>{item.category?.includes('Bebida') ? '🥤' : '🍱'}</Text>
                      </View>
                    )}
                    <View style={styles.cartItemInfo}>
                      <Text style={styles.cartItemName} numberOfLines={1}>
                        {item.name}
                      </Text>
                      <Text style={styles.cartItemPrice}>
                        {parseFloat(item.price) === 0 
                          ? "Incluso" 
                          : `R$ ${parseFloat(item.price).toFixed(2)}`}
                      </Text>
                    </View>
                  </View>
                  
                  <View style={styles.cartItemQuantity}>
                    <TouchableOpacity
                      style={styles.quantityButton}
                      onPress={() => updateQuantity(item.id, Math.max(0, item.quantity - 1))}
                    >
                      <Text style={styles.quantityButtonText}>−</Text>
                    </TouchableOpacity>
                    <Text style={styles.quantityText}>{item.quantity}</Text>
                    <TouchableOpacity
                      style={styles.quantityButton}
                      onPress={() => updateQuantity(item.id, item.quantity + 1)}
                    >
                      <Text style={styles.quantityButtonText}>+</Text>
                    </TouchableOpacity>
                  </View>
                </Animated.View>
              ))}
            </ScrollView>

            <View style={styles.cartFooter}>
              <View style={styles.cartSummary}>
                <Text style={styles.cartSummaryLabel}>Total do Pedido</Text>
                <Text style={styles.cartSummaryValue}>
                  R$ {getCartTotal().toFixed(2)}
                </Text>
              </View>
              
              <TouchableOpacity
                style={[styles.sendOrderButton, loading && styles.buttonDisabled]}
                onPress={sendOrder}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#FFF" size="small" />
                ) : (
                  <>
                    <Text style={styles.sendOrderButtonText}>Enviar Pedido</Text>
                    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                      <Path d="M5 12h14M12 5l7 7-7 7" stroke="#FFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </Svg>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>

      {/* Success Modal */}
      {showSuccess && (
        <View style={styles.successOverlay}>
          <Animated.View style={[
            styles.successCard,
            { transform: [{ scale: scaleAnim }] }
          ]}>
            <View style={styles.successIcon}>
              <Svg width={80} height={80} viewBox="0 0 24 24" fill="none">
                <Circle cx="12" cy="12" r="10" stroke={config.colors.success} strokeWidth="2"/>
                <Path d="M8 12l3 3 5-6" stroke={config.colors.success} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </Svg>
            </View>
            <Text style={styles.successTitle}>Pedido Enviado!</Text>
            <Text style={styles.successMessage}>
              Seu pedido foi recebido e está sendo preparado
            </Text>
          </Animated.View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: config.colors.background,
  },

  // Lock Screen
  lockContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: config.colors.surface,
  },
  lockCard: {
    backgroundColor: config.colors.card,
    padding: 40,
    borderRadius: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
    width: Math.min(400, width * 0.9),
  },
  lockIcon: {
    marginBottom: 24,
  },
  lockTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: config.colors.textPrimary,
    marginBottom: 8,
  },
  lockSubtitle: {
    fontSize: 16,
    color: config.colors.textSecondary,
    marginBottom: 32,
  },
  passwordInput: {
    width: '100%',
    height: 56,
    backgroundColor: config.colors.surface,
    borderRadius: 12,
    paddingHorizontal: 20,
    fontSize: 24,
    color: config.colors.textPrimary,
    textAlign: 'center',
    marginBottom: 24,
    letterSpacing: 8,
  },
  unlockButton: {
    width: '100%',
    height: 56,
    backgroundColor: config.colors.primary,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unlockButtonText: {
    color: config.colors.textOnPrimary,
    fontSize: 18,
    fontWeight: '600',
  },

  // Welcome Screen
  welcomeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: config.colors.surface,
  },
  welcomeContent: {
    width: '100%',
    maxWidth: 500,
    alignItems: 'center',
  },
  welcomeHeader: {
    alignItems: 'center',
    marginBottom: 48,
  },
  welcomeLogo: {
    fontSize: 80,
    marginBottom: 16,
  },
  welcomeTitle: {
    fontSize: 48,
    fontWeight: 'bold',
    color: config.colors.textPrimary,
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 18,
    color: config.colors.textSecondary,
  },
  tableInputCard: {
    width: '100%',
    backgroundColor: config.colors.card,
    padding: 32,
    borderRadius: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  tableInputLabel: {
    fontSize: 20,
    color: config.colors.textPrimary,
    marginBottom: 24,
    fontWeight: '500',
  },
  tableInput: {
    width: 150,
    height: 100,
    backgroundColor: config.colors.surface,
    borderRadius: 20,
    fontSize: 64,
    fontWeight: 'bold',
    color: config.colors.primary,
    textAlign: 'center',
    marginBottom: 32,
  },
  continueButton: {
    paddingVertical: 16,
    paddingHorizontal: 48,
    backgroundColor: config.colors.primary,
    borderRadius: 12,
  },
  continueButtonText: {
    color: config.colors.textOnPrimary,
    fontSize: 18,
    fontWeight: '600',
  },
  adminButton: {
    marginTop: 32,
    padding: 12,
  },
  adminButtonText: {
    color: config.colors.textTertiary,
    fontSize: 14,
  },

  // Mode Selection
  modeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: config.colors.surface,
  },
  modeHeader: {
    alignItems: 'center',
    marginBottom: 48,
  },
  modeTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: config.colors.textPrimary,
    marginBottom: 8,
  },
  modeSubtitle: {
    fontSize: 18,
    color: config.colors.textSecondary,
  },
  modeCards: {
    flexDirection: 'row',
    gap: 24,
    marginBottom: 32,
  },
  modeCard: {
    width: 240,
    height: 320,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 15,
  },
  modeCardIcon: {
    marginBottom: 24,
  },
  modeCardTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 12,
  },
  modeCardDescription: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    marginBottom: 20,
  },
  modeCardBadge: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  modeCardBadgeText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  changeMesaButton: {
    padding: 12,
  },
  changeMesaButtonText: {
    color: config.colors.textTertiary,
    fontSize: 16,
  },

  // Main Interface - Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: config.colors.card,
    borderBottomWidth: 1,
    borderBottomColor: config.colors.surface,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: config.colors.textPrimary,
  },
  modeBadge: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  modeBadgeText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  headerRight: {
    flexDirection: 'row',
    gap: 8,
  },
  headerButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: config.colors.surface,
  },
  headerButtonText: {
    color: config.colors.textSecondary,
    fontSize: 14,
  },

  // Search Bar
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: config.colors.surface,
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    height: 48,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: config.colors.textPrimary,
  },

  // Categories
  categoriesContainer: {
    maxHeight: 120,
    marginBottom: 8,
  },
  categoriesContent: {
    paddingHorizontal: 16,
    gap: 12,
  },
  categoryCard: {
    width: 100,
    height: 100,
    backgroundColor: config.colors.card,
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  categoryCardActive: {
    borderColor: config.colors.primary,
    backgroundColor: config.colors.surface,
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  categoryIconText: {
    fontSize: 24,
  },
  categoryName: {
    fontSize: 12,
    color: config.colors.textSecondary,
    textAlign: 'center',
  },
  categoryNameActive: {
    color: config.colors.textPrimary,
    fontWeight: '600',
  },

  // Products Grid
  productsContainer: {
    padding: 16,
    paddingBottom: 100,
  },
  productCard: {
    width: 200,
    backgroundColor: config.colors.card,
    borderRadius: 16,
    overflow: 'hidden',
    margin: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 5,
  },
  premiumBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: config.colors.warning,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    zIndex: 10,
  },
  premiumBadgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  productImageContainer: {
    width: '100%',
    height: 140,
    backgroundColor: config.colors.surface,
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  productImagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: config.colors.surface,
  },
  productImagePlaceholderText: {
    fontSize: 48,
  },
  productInfo: {
    padding: 12,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: config.colors.textPrimary,
    marginBottom: 4,
    height: 36,
  },
  productDescription: {
    fontSize: 12,
    color: config.colors.textSecondary,
    marginBottom: 12,
    height: 32,
  },
  productFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: config.colors.textPrimary,
  },
  productPriceIncluded: {
    color: config.colors.success,
  },
  addButton: {
    width: 32,
    height: 32,
    backgroundColor: config.colors.primary,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
  },

  // Loading States
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: config.colors.textSecondary,
  },

  // Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: config.colors.textPrimary,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: config.colors.textSecondary,
  },

  // Floating Cart Button
  cartFloatingButton: {
    position: 'absolute',
    bottom: 24,
    right: 24,
  },
  cartFloatingButtonInner: {
    backgroundColor: config.colors.primary,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
  },
  cartFloatingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    gap: 16,
  },
  cartFloatingIcon: {
    position: 'relative',
  },
  cartFloatingIconText: {
    fontSize: 28,
  },
  cartBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: config.colors.secondary,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadgeText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  cartFloatingInfo: {
    alignItems: 'flex-start',
  },
  cartFloatingLabel: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
  },
  cartFloatingTotal: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
  },

  // Cart Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalOverlayTouch: {
    flex: 1,
  },
  modalContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: config.colors.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: height * 0.9,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 20,
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: config.colors.textTertiary,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: config.colors.surface,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: config.colors.textPrimary,
  },
  modalCloseButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseText: {
    fontSize: 24,
    color: config.colors.textSecondary,
  },

  // Cart Items
  cartItemsContainer: {
    maxHeight: height * 0.5,
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  cartItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: config.colors.surface,
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  cartItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  cartItemImage: {
    width: 48,
    height: 48,
    borderRadius: 8,
    marginRight: 12,
  },
  cartItemImagePlaceholder: {
    backgroundColor: config.colors.card,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartItemInfo: {
    flex: 1,
  },
  cartItemName: {
    fontSize: 16,
    fontWeight: '500',
    color: config.colors.textPrimary,
    marginBottom: 4,
  },
  cartItemPrice: {
    fontSize: 14,
    color: config.colors.primary,
    fontWeight: '600',
  },
  cartItemQuantity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  quantityButton: {
    width: 32,
    height: 32,
    backgroundColor: config.colors.card,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonText: {
    fontSize: 20,
    color: config.colors.primary,
    fontWeight: 'bold',
  },
  quantityText: {
    fontSize: 16,
    fontWeight: '600',
    color: config.colors.textPrimary,
    minWidth: 24,
    textAlign: 'center',
  },

  // Cart Footer
  cartFooter: {
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: config.colors.surface,
  },
  cartSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  cartSummaryLabel: {
    fontSize: 18,
    color: config.colors.textSecondary,
  },
  cartSummaryValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: config.colors.textPrimary,
  },
  sendOrderButton: {
    backgroundColor: config.colors.primary,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 16,
    borderRadius: 12,
  },
  sendOrderButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.6,
  },

  // Success Modal
  successOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  successCard: {
    backgroundColor: config.colors.card,
    padding: 48,
    borderRadius: 24,
    alignItems: 'center',
    width: Math.min(400, width * 0.9),
  },
  successIcon: {
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: config.colors.textPrimary,
    marginBottom: 12,
  },
  successMessage: {
    fontSize: 16,
    color: config.colors.textSecondary,
    textAlign: 'center',
  },
});