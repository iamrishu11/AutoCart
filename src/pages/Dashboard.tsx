import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot, User, Settings, ShoppingBag, Package, MessageCircle, Send, Home, LogOut, TrendingUp, Truck, Wallet, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tables } from "@/integrations/supabase/types";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { PaymanClient } from "@paymanai/payman-ts";
import { paymanService } from '@/services/PaymanService';
import { ScrollArea } from "@/components/ui/scroll-area";

// =================================================================================
// Constants
// =================================================================================

const BANNED_KEYWORDS = [
  /hack|exploit|cheat|illegal|adult|nsfw|porn|weapon|drugs|crypto|bitcoin|ethereum|nft|gamble|casino|bet/i
];
const PAGE_SIZE = window.innerWidth < 768 ? 2 : 3; // Products per page
const CONVERSATION_PAGE_SIZE = 10; // Conversations per page
const PRODUCT_INTENTS = [
  'list_products', 'select_product', 'pagination', 'yes', 'no', 'list_categories'
];

// =================================================================================
// Helper Functions (Pure)
// =================================================================================

function levenshtein(a: string, b: string): number {
  const matrix = Array.from({ length: a.length + 1 }, (_, i) => [i]);
  for (let j = 1; j <= b.length; j++) matrix[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      if (a[i - 1] === b[j - 1]) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j - 1] + 1
        );
      }
    }
  }
  return matrix[a.length][b.length];
}

function isGreeting(message: string): boolean {
  const greetings = ["hi", "hello", "hey", "good morning", "good afternoon", "good evening"];
  const msg = message.trim().toLowerCase();
  return greetings.some(greet => {
    const maxDist = greet.length <= 5 ? 1 : 3;
    return levenshtein(msg, greet) <= maxDist || msg.startsWith(greet);
  });
}

function isProductSelection(message: string): number | null {
  const match = message.match(/(?:^|\s)(first|1st|second|2nd|third|3rd|fourth|4th|fifth|5th|sixth|6th|seventh|7th|eighth|8th|ninth|9th|tenth|10th|eleventh|11th|twelfth|12th|thirteenth|13th|fourteenth|14th|fifteenth|15th|sixteenth|16th|seventeenth|17th|eighteenth|18th|nineteenth|19th|twentieth|20th|twenty\s*first|21st|number\s*\d+|\d+|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty|twenty\s*one)(?:\s|$)/i);
  if (!match) return null;
  
  const map: { [key: string]: number } = {
    first: 1, '1st': 1, one: 1,
    second: 2, '2nd': 2, two: 2,
    third: 3, '3rd': 3, three: 3,
    fourth: 4, '4th': 4, four: 4,
    fifth: 5, '5th': 5, five: 5,
    sixth: 6, '6th': 6, six: 6,
    seventh: 7, '7th': 7, seven: 7,
    eighth: 8, '8th': 8, eight: 8,
    ninth: 9, '9th': 9, nine: 9,
    tenth: 10, '10th': 10, ten: 10,
    eleventh: 11, '11th': 11, eleven: 11,
    twelfth: 12, '12th': 12, twelve: 12,
    thirteenth: 13, '13th': 13, thirteen: 13,
    fourteenth: 14, '14th': 14, fourteen: 14,
    fifteenth: 15, '15th': 15, fifteen: 15,
    sixteenth: 16, '16th': 16, sixteen: 16,
    seventeenth: 17, '17th': 17, seventeen: 17,
    eighteenth: 18, '18th': 18, eighteen: 18,
    nineteenth: 19, '19th': 19, nineteen: 19,
    twentieth: 20, '20th': 20, twenty: 20,
    twentyfirst: 21, '21st': 21, twentyOne: 21
  };
  
  const key = match[1].toLowerCase();
  if (map[key]) return map[key] - 1;
  const num = parseInt(key.replace(/\D/g, ""), 10);
  return isNaN(num) ? null : num - 1;
}

function isReferringToLastProduct(message: string): boolean {
  return /\b(this|that|it|the one)\b/i.test(message.trim());
}

function isNo(message: string): boolean {
  return /^(no|nope|not now|don't|nah|negative|n)$/i.test(message.trim());
}

function isYes(message: string): boolean {
  return /^(yes|yeah|yep|sure|ok|okay|let's go|go ahead|confirm)$/i.test(message.trim());
}

function isAskName(message: string): boolean {
  return /what.*my name/i.test(message);
}

function isQueryAllowed(query: string): boolean {
  return !BANNED_KEYWORDS.some(re => re.test(query));
}

function isNameOnly(message: string): boolean {
  return (
    /^[a-zA-Z]{2,}$/.test(message.trim()) &&
    !isGreeting(message) &&
    isProductSelection(message) === null &&
    !isYes(message) &&
    !isNo(message) &&
    !isAskName(message) &&
    isQueryAllowed(message)
  );
}

function searchProducts(query: string, products: Tables<'products'>[]) {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  return products.filter(p => {
    const name = p.product_name.toLowerCase();
    const tags = (p.product_tags || []).map(tag => tag.toLowerCase());
    return words.some(word => name.includes(word) || tags.some(tag => tag.includes(word)));
  });
}

function fuzzyMatchProduct(query: string, products: Tables<'products'>[], threshold = 3) {
  const q = query.toLowerCase();
  return products.filter(p => {
    const name = p.product_name.toLowerCase();
    return name.includes(q) || levenshtein(q, name) <= threshold;
  });
}

function enhancedFuzzyMatchProduct(query: string, products: Tables<'products'>[], threshold = 3) {
  const normalize = (str: string) => str.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '');
  const normalizedQuery = normalize(query);
  return products.filter(p => {
    const normalizedName = normalize(p.product_name);
    return normalizedName.includes(normalizedQuery) || levenshtein(normalizedQuery, normalizedName) <= threshold;
  });
}

function refinedFuzzyMatchProduct(query: string, products: Tables<'products'>[], threshold = 3) {
  const normalize = (str: string) => str
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/[^a-z0-9 ]/g, '')
    .replace(/\b(do|you|have|can|please|find|show|me|any|a|an|the)\b/g, '')
    .trim();
  const normalizedQuery = normalize(query);
  return products.filter(p => {
    const normalizedName = normalize(p.product_name);
    const normalizedTags = (p.product_tags || []).map(tag => normalize(tag));
    return (
      normalizedName.includes(normalizedQuery) ||
      normalizedTags.some(tag => tag.includes(normalizedQuery)) ||
      levenshtein(normalizedQuery, normalizedName) <= threshold
    );
  });
}

function getProductSummaries(products: Tables<'products'>[]) {
  return products.slice(0, 5).map(p =>
    `- ${p.product_name} (${p.product_category}) - $${p.offer_price ?? p.product_price}`
  ).join('\n');
}

async function callGeminiAPI(userQuery: string, matchedProducts: Tables<'products'>[], userName: string | null, history: any[], lastSelectedProduct: Tables<'products'> | null, lastIntent: string | null) {
  const numberedList = matchedProducts.slice(0, PAGE_SIZE).map((p, i) =>
    `${i + 1}. ${p.product_name} - $${p.product_price}${p.offer_price ? ` (Offer: $${p.offer_price})` : ''} | Qty: ${p.stock_quantity} | Category: ${p.product_category} | Seller: ${p.product_seller} | Rating: ${p.product_rating}`
  ).join('\n');
  const chatHistory = history.map(m => `${m.sender === 'user' ? (userName || 'User') : 'AI'}: ${m.content}`).join('\n');
  const lastProductDetails = lastSelectedProduct ? `\nLast selected product:\n${lastSelectedProduct.product_name} - $${lastSelectedProduct.product_price}${lastSelectedProduct.offer_price ? ` (Offer: $${lastSelectedProduct.offer_price})` : ''} | Qty: ${lastSelectedProduct.stock_quantity} | Category: ${lastSelectedProduct.product_category} | Seller: ${lastSelectedProduct.product_seller} | Rating: ${lastSelectedProduct.product_rating}` : '';
  const prompt = `You are AutoCart's helpful shopping assistant. Always use the user's name if you know it.\n\nChat so far:\n${chatHistory}\n\nUser query: "${userQuery}"\n\nLast user intent: ${lastIntent || 'none'}\n\nMatched products (numbered):\n${numberedList}${lastProductDetails}\n\nSTRICT FORMAT INSTRUCTIONS:\nWhen listing products, use this exact format for each product (one block per product, no product IDs, no extra text):\n\n1. Product Name - $̶OriginalPrice̶ (Offer for today: $OfferPrice)\nQty: X\nCategory: Y\nSeller: Z\nRating: N\n\nIf there is no offer, just show the price (no strikethrough, no offer line). If no product matches, reply exactly: "No, we don’t have this product currently. Let me know if you need anything else.\"\n\nNever return a single-line or compressed product list. Always use the above block format for each product.\n`;
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY as string;
  if (!apiKey) {
    console.error("VITE_GEMINI_API_KEY is not set in your environment variables.");
    return "Sorry, I am currently unable to process your request due to a configuration issue.";
  }
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
  const result = await model.generateContent(prompt);
  const response = result.response;
  return response.text() || 'Please ask about available products.';
}

function isProductCategoryQuery(message: string): boolean {
  return /(what|which|kind|type|category|categories).*product(s)?/i.test(message);
}

function getProductCategoriesText(products: Tables<'products'>[]) {
  const categories = Array.from(new Set(products.map(p => p.product_category))).filter(Boolean);
  if (categories.length === 0) return 'Sorry, no product categories found.';
  return 'We offer products in these categories: ' + categories.join(', ') + '.';
}

function extractCategoryFromQuery(query: string, categories: string[]): string | null {
  const lower = query.toLowerCase();
  for (const cat of categories) {
    const catLower = cat.toLowerCase();
    if (
      lower === catLower ||
      lower.split(/\W+/).includes(catLower) ||
      lower.replace(/[^a-z0-9 ]/gi, '').split(' ').includes(catLower)
    ) {
      return cat;
    }
  }
  return null;
}

function getProductListText(products: Tables<'products'>[], count?: number) {
  const n = count || PAGE_SIZE;
  return products.slice(0, n).map((p, i) => {
    const hasOffer = p.offer_price && p.offer_price < p.product_price;
    const orig = hasOffer ? `$${p.product_price}` : '';
    const offer = hasOffer ? `(Offer for today: $${p.offer_price})` : '';
    const origStr = hasOffer ? orig.split('').map(c => c + '\u0336').join('') : `$${p.product_price}`;
    return `${i + 1}. ${p.product_name} - ${hasOffer ? `${origStr} ${offer}` : `$${p.product_price}`}
Qty: ${p.stock_quantity}
Category: ${p.product_category}
Seller: ${p.product_seller}
Rating: ${p.product_rating}`;
  }).join('\n\n');
}

function extractName(message: string): string | null {
  const match = message.match(/(?:my name is|i'm|i am)\s+([a-zA-Z]+)/i);
  return match ? match[1] : null;
}

function getMoreCount(message: string): number | null {
  const match = message.match(/(\d+)\s*more/i);
  if (match) return parseInt(match[1], 10);
  return null;
}

function getStatusColor(status: string) {
  switch (status) {
    case 'delivered': return 'text-green-600 bg-green-100';
    case 'shipped':
    case 'in_transit': return 'text-blue-600 bg-blue-100';
    case 'processing': return 'text-yellow-600 bg-yellow-100';
    default: return 'text-gray-600 bg-gray-100';
  }
}

function extractProductFromPurchaseIntent(message: string): string | null {
  const match = message.match(/\b(?:buy|purchase|order|checkout|pay for|want to buy|want to purchase|please purchase|purchase this|buy this|order this|confirm purchase)\b\s*(.*)/i);
  if (match && match[1]) {
    return match[1].replace(/[.?!,;:]+$/, '').trim() || null;
  }
  return null;
}

function generateConversationTitle(messages: Message[], createdAt: string): string {
  const firstUserMessage = messages.find(msg => msg.sender === 'user')?.content;
  if (firstUserMessage) {
    const trimmed = firstUserMessage.trim().slice(0, 30);
    return trimmed.length < firstUserMessage.length ? `${trimmed}...` : trimmed;
  }
  const date = new Date(createdAt);
  return `Chat: ${date.toLocaleString('en-US', { month: 'short', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })}`;
}

function detectIntent(message: string, context: { lastIntent: string | null; categories: string[] }) {
  const msg = message.trim().toLowerCase();
  if (!isQueryAllowed(msg)) return "banned";
  if (isGreeting(msg)) return "greeting";
  if (isAskName(msg)) return "ask_name";
  if (extractName(msg)) return "set_name";
  if (isNameOnly(msg)) return "set_name";
  if (context.lastIntent === "awaiting_confirmation") {
    if (isYes(msg)) return "yes";
    if (/\b(buy|purchase|order|checkout|pay|want to buy|want to purchase|please purchase|purchase this|buy this|order this|confirm purchase)\b/i.test(msg)) return "purchase";
  }
  if (isProductSelection(msg) !== null) return "select_product";
  if (isYes(msg)) return "yes";
  if (isNo(msg)) return "no";
  if (/\boffer(s)?\b|deal(s)?|discount(s)?|sale(s)?/i.test(msg)) return "offers";
  if (isProductCategoryQuery(msg) || /categor(y|ies)/i.test(msg)) return "list_categories";
  if (context.categories && extractCategoryFromQuery(msg, context.categories)) return "list_products_by_category";
  if (/\b(products?|items?|show me (products|items)|list (products|items)|what (do you|can you) (have|offer)|all (products|items)|something tech|tech products|electronics)\b/i.test(msg)) return "list_products";
  if (/\bmore\b|next|show me more|see more|\d+\s*more/i.test(msg)) return "pagination";
  if (/\b(buy|purchase|order|checkout|pay|want to buy|want to purchase|please purchase|purchase this|buy this|order this|confirm purchase)\b/i.test(msg)) return "purchase";
  return "fallback";
}

// =================================================================================
// Dashboard Component
// =================================================================================

interface OrderItem {
  product_id: string;
  quantity: number;
}

interface Conversation {
  id: string;
  title: string | null;
  created_at: string;
  updated_at: string;
}

interface Message {
  id: number;
  sender: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

const Dashboard = () => {
  const { user, signOut } = useAuth();

  // State Management
  const [orders, setOrders] = useState<Tables<'orders'>[]>([]);
  const [packages, setPackages] = useState<Tables<'packages'>[]>([]);
  const [profile, setProfile] = useState<Tables<'profiles'> | null>(null);
  const [products, setProducts] = useState<Tables<'products'>[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPayment, setShowPayment] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "processing" | "success" | "error">("idle");
  const [walletError, setWalletError] = useState<string | null>(null);
  const [showOrders, setShowOrders] = useState(false);
  const [showPackages, setShowPackages] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showWallet, setShowWallet] = useState(false);
  const [walletConnected, setWalletConnected] = useState(false);
  const [editProfile, setEditProfile] = useState({ full_name: '', company: '' });
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [isChatHistoryOpen, setIsChatHistoryOpen] = useState(false);

  // Chat State
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [conversationPage, setConversationPage] = useState(1);
  const [hasMoreConversations, setHasMoreConversations] = useState(true);
  const [renamingConversationId, setRenamingConversationId] = useState<string | null>(null);
  const [newConversationTitle, setNewConversationTitle] = useState("");

  // Refs
  const userNameRef = useRef<string | null>(null);
  const lastShownProductsRef = useRef<Tables<'products'>[]>([]);
  const lastSelectedProductRef = useRef<Tables<'products'> | null>(null);
  const lastQueryRef = useRef<string>("");
  const lastPageRef = useRef<number>(0);
  const lastIntentRef = useRef<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // Calculate total saved
  const totalSaved = orders.reduce((sum, order) => {
    const items: OrderItem[] = Array.isArray(order.items)
      ? order.items
          .filter((item) => typeof item === 'object' && item !== null)
          .map((item) => ({
            product_id: (item as any).product_id || '',
            quantity: (item as any).quantity || 0,
          }))
          .filter((item): item is OrderItem => !!item.product_id && item.quantity > 0)
      : [];
    return sum + items.reduce((itemSum, item) => {
      const product = products.find(p => p.product_id === item.product_id);
      if (product?.offer_price && product.offer_price < product.product_price) {
        return itemSum + (product.product_price - product.offer_price) * (item.quantity || 1);
      }
      return itemSum;
    }, 0);
  }, 0);


  // Save message
  const saveMessage = useCallback(async (conversationId: string, sender: 'user' | 'ai', content: string) => {
    try {
      const { error } = await supabase.from('messages').insert({
        conversation_id: conversationId,
        sender,
        content,
        timestamp: new Date().toISOString(),
      });
      if (error) throw error;
      await supabase
        .from('conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', conversationId);
    } catch (error) {
      console.error('Error saving message:', error);
      toast.error("Failed to save message.");
    }
  }, []);

  // New rename conversation function
  const renameConversation = useCallback(async (conversationId: string, newTitle: string) => {
    if (!newTitle.trim()) {
      toast.error("Conversation title cannot be empty.");
      return;
    }
    try {
      const { error } = await supabase
        .from('conversations')
        .update({ title: newTitle.trim(), updated_at: new Date().toISOString() })
        .eq('id', conversationId);
      if (error) throw error;
      setConversations(prev =>
        prev.map(conv =>
          conv.id === conversationId ? { ...conv, title: newTitle.trim() } : conv
        )
      );
      setRenamingConversationId(null);
      setNewConversationTitle("");
      toast.success("Conversation renamed successfully.");
    } catch (error) {
      console.error('Error renaming conversation:', error);
      toast.error("Failed to rename conversation.");
    }
  }, []);

  // Load user data
  const loadUserData = useCallback(async () => {
    if (!user) return;
    try {
      const [
        { data: profileData },
        { data: settingsData },
        { data: ordersData },
        { data: packagesData }
      ] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('user_settings').select('email_notifications, sms_notifications').eq('user_id', user.id).single(),
        supabase.from('orders').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('packages').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
      ]);
      if (profileData) {
        setProfile(profileData);
        setEditProfile({ full_name: profileData.full_name || '', company: profileData.company || '' });
      }
      if (settingsData) {
        setEmailNotifications(settingsData.email_notifications ?? true);
        setSmsNotifications(settingsData.sms_notifications ?? false);
      }
      if (ordersData) {
        setOrders(ordersData.map(order => ({ ...order, items: Array.isArray(order.items) ? order.items : [] })));
      }
      if (packagesData) {
        setPackages(packagesData);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      toast.error("Failed to load your data.");
    } finally {
      setLoading(false);
    }
  }, [user]);


  // Load messages
  const loadMessages = useCallback(async (conversationId: string) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('timestamp', { ascending: true });
      if (error) throw error;
      setMessages(data.map((msg, idx) => ({
        id: idx + 1,
        sender: msg.sender as 'user' | 'ai',
        content: msg.content,
        timestamp: new Date(msg.timestamp),
      })));
    } catch (error) {
      console.error('Error loading messages:', error);
      toast.error("Failed to load messages.");
    }
  }, []);

  // Start new chat
  const startNewChat = useCallback(async () => {
    if (!user) return;
    try {
      const createdAt = new Date().toISOString();
      const { data, error } = await supabase.from('conversations').insert({
        user_id: user.id,
        title: `New Chat`,
        created_at: createdAt,
        updated_at: createdAt,
      }).select().single();
      if (error) throw error;
      setConversations(prev => [data, ...prev]);
      setActiveConversationId(data.id);
      setMessages([{
        id: 1,
        sender: "ai",
        content: "👋 Welcome to AutoCart! I'm your personal shopping assistant. What can I help you find today?",
        timestamp: new Date()
      }]);
      await saveMessage(data.id, 'ai', "👋 Welcome to AutoCart! I'm your personal shopping assistant. What can I help you find today?");
      lastIntentRef.current = null;
      lastQueryRef.current = "";
      lastPageRef.current = 0;
      lastShownProductsRef.current = [];
      lastSelectedProductRef.current = null;
      setIsChatHistoryOpen(false);
    } catch (error) {
      console.error('Error creating new conversation:', error);
      toast.error("Failed to start new chat.");
    }
  }, [user, saveMessage]);

  // Load conversations
  const loadConversations = useCallback(async (page: number) => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })
        .range((page - 1) * CONVERSATION_PAGE_SIZE, page * CONVERSATION_PAGE_SIZE - 1);
      if (error) throw error;
      setConversations(prev => page === 1 ? data : [...prev, ...data]);
      setHasMoreConversations(data.length === CONVERSATION_PAGE_SIZE);
      if (page === 1 && data.length > 0 && !activeConversationId) {
        setActiveConversationId(data[0].id);
        await loadMessages(data[0].id);
      } else if (page === 1 && data.length === 0) {
        await startNewChat();
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
      toast.error("Failed to load chat history.");
    }
  }, [user, activeConversationId, startNewChat, loadMessages]);

  // Delete conversation
  const deleteConversation = useCallback(async (conversationId: string) => {
    try {
      const { error } = await supabase.from('conversations').delete().eq('id', conversationId);
      if (error) throw error;
      setConversations(prev => prev.filter(conv => conv.id !== conversationId));
      if (activeConversationId === conversationId) {
        setActiveConversationId(null);
        setMessages([]);
        if (conversations.length > 1) {
          const nextConv = conversations.find(conv => conv.id !== conversationId);
          if (nextConv) {
            setActiveConversationId(nextConv.id);
            await loadMessages(nextConv.id);
          }
        } else {
          await startNewChat();
        }
      }
      toast.success("Conversation deleted.");
      setIsChatHistoryOpen(false);
    } catch (error) {
      console.error('Error deleting conversation:', error);
      toast.error("Failed to delete conversation.");
    }
  }, [activeConversationId, conversations, loadMessages, startNewChat]);

  // Load more conversations
  const loadMoreConversations = useCallback(() => {
    setConversationPage(prev => prev + 1);
  }, []);

  // Initial data loading
  useEffect(() => {
    if (user) {
      loadUserData();
      loadConversations(1);
    }
  }, [user, loadUserData, loadConversations]);

  useEffect(() => {
    if (user && conversationPage > 1) {
      loadConversations(conversationPage);
    }
  }, [conversationPage, loadConversations, user]);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const { data: productsData } = await supabase.from('products').select('*');
        if (productsData) setProducts(productsData);
      } catch (error) {
        console.error('Error loading products:', error);
      }
    };
    loadProducts();
  }, []);

  useEffect(() => {
    if (user && profile?.full_name) {
      userNameRef.current = profile.full_name;
    }
  }, [user, profile?.full_name]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Event Handlers
  const handleSignOut = useCallback(async () => {
    await signOut();
    toast.success("Signed out successfully");
  }, [signOut]);

  const handleSaveProfile = useCallback(async () => {
    if (!profile) return;
    setSavingProfile(true);
    try {
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ full_name: editProfile.full_name, company: editProfile.company })
        .eq('id', profile.id);
      const { error: settingsError } = await supabase
        .from('user_settings')
        .upsert({
          user_id: profile.id,
          email_notifications: emailNotifications,
          sms_notifications: smsNotifications,
        }, { onConflict: 'user_id' });
      if (profileError || settingsError) throw profileError || settingsError;
      toast.success('Updated Successfully!');
      setProfile(p => p ? { ...p, full_name: editProfile.full_name } : null);
    } catch (error) {
      toast.error('Failed to update profile.');
      console.error("Profile save error:", error);
    } finally {
      setSavingProfile(false);
    }
  }, [profile, editProfile, emailNotifications, smsNotifications]);

  const handleConnectWallet = useCallback(() => {
    setShowWallet(true);
    setWalletError(null);
    console.log('Initiating Payman OAuth login');
    const redirectUri = import.meta.env.VITE_PAYMAN_REDIRECT_URI;
    if (!redirectUri) {
      console.error('Missing Payman redirect URI.');
      toast.error('Wallet connection failed: Missing configuration.');
      setWalletError('Missing configuration.');
      setShowWallet(false);
      return;
    }
    const authUrl = paymanService.getOAuthAuthorizationUrl(redirectUri);
    const popup = window.open(authUrl, 'paymanOAuth', 'width=600,height=700');
    if (!popup) {
      console.error('Failed to open Payman OAuth popup.');
      toast.error('Please allow popups and try again.');
      setWalletError('Popup blocked. Please allow popups.');
      setShowWallet(false);
      return;
    }
    const handleMessage = (event: MessageEvent) => {
      console.log('Received message event:', event.data);
      if (event.data.type === 'payman-oauth-redirect') {
        const url = new URL(event.data.redirectUri);
        const code = url.searchParams.get('code');
        const error = url.searchParams.get('error');
        if (code) {
          paymanService.exchangeCodeForToken(code)
            .then(() => {
              setWalletConnected(true);
              setShowWallet(false);
              toast.success('Wallet connected successfully!');
              popup.close();
            })
            .catch(() => {
              setWalletError('Failed to connect wallet.');
              setShowWallet(false);
              popup.close();
            });
        } else if (error) {
          console.error('OAuth error:', error);
          toast.error('Authentication failed.');
          setWalletError('Authentication failed.');
          setShowWallet(false);
          popup.close();
        }
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const handlePaymentConfirmation = useCallback(async (product: Tables<'products'>) => {
    if (!paymanService.isAuthenticated()) {
      toast.error('Wallet not connected. Please connect your Payman wallet.');
      setShowPayment(false);
      return;
    }
    setPaymentStatus('processing');
    try {
      const amount = product.offer_price ?? product.product_price;
      const sellerEmail = `${product.product_seller.replace(/\s/g, '').toLowerCase()}@autocart.com`;
      const orderId = `ORD${Date.now()}${Math.floor(Math.random() * 1000)}`;
      await paymanService.createPayee(sellerEmail, product.product_seller);
      await paymanService.sendPayment(amount, product.product_seller, product.product_id, orderId);
      const { data: orderData, error: orderError } = await supabase.from('orders').insert({
        user_id: user!.id,
        order_number: orderId,
        total_amount: amount,
        status: 'processing',
        items: [{ product_id: product.product_id, quantity: 1 }],
        created_at: new Date().toISOString(),
      }).select().single();
      if (orderError) throw orderError;
      const { error: packageError } = await supabase.from('packages').insert({
        user_id: user!.id,
        tracking_number: orderId,
        status: 'processing',
        current_location: 'Warehouse',
        estimated_delivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        carrier: 'AutoCart Logistics',
        order_id: orderData.id,
      });
      if (packageError) throw packageError;
      setOrders(prev => [
        ...prev,
        { ...orderData, items: [{ product_id: product.product_id, quantity: 1 }] },
      ]);
      setPackages(prev => [
        ...prev,
        {
          id: orderId,
          user_id: user!.id,
          tracking_number: orderId,
          status: 'processing',
          current_location: 'Warehouse',
          estimated_delivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          carrier: 'AutoCart Logistics',
          order_id: orderData.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ]);
      const successMessage = `🎉 Payment successful! Your order tracking ID is: ${orderId}\nYou will receive updates about your order via email.`;
      setMessages(prev => [
        ...prev,
        {
          id: prev.length + 1,
          sender: 'ai',
          content: successMessage,
          timestamp: new Date(),
        },
      ]);
      if (activeConversationId) {
        await saveMessage(activeConversationId, 'ai', successMessage);
      }
      setPaymentStatus('success');
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Payment failed. Please try again.');
      setPaymentStatus('error');
    } finally {
      setShowPayment(false);
      lastSelectedProductRef.current = null;
      lastIntentRef.current = null;
    }
  }, [user, activeConversationId, saveMessage]);

  const sendMessage = useCallback(async () => {
    const trimmedMessage = inputMessage.trim();
    if (!trimmedMessage || !user || !activeConversationId) return;
    const newMessage: Message = {
      id: messages.length + 1,
      sender: "user",
      content: trimmedMessage,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
    setInputMessage("");
    await saveMessage(activeConversationId, 'user', trimmedMessage);
    const isFirstUserMessage = !messages.some(msg => msg.sender === 'user');
    if (isFirstUserMessage) {
      const newTitle = trimmedMessage.slice(0, 30);
      await supabase
        .from('conversations')
        .update({ title: newTitle.length < trimmedMessage.length ? `${newTitle}...` : newTitle })
        .eq('id', activeConversationId);
      setConversations(prev =>
        prev.map(conv =>
          conv.id === activeConversationId
            ? { ...conv, title: newTitle.length < trimmedMessage.length ? `${newTitle}...` : newTitle }
            : conv
        )
      );
    }
    const allCategories = Array.from(new Set(products.map(p => p.product_category))).filter(Boolean);
    const intent = detectIntent(trimmedMessage, { lastIntent: lastIntentRef.current, categories: allCategories });
    if (isReferringToLastProduct(trimmedMessage) && lastShownProductsRef.current.length > 0) {
      const prod = lastSelectedProductRef.current || lastShownProductsRef.current[0];
      if (prod) {
        lastSelectedProductRef.current = prod;
        const aiMessage: Message = {
          id: messages.length + 2,
          sender: "ai",
          content: `Product: ${prod.product_name}\nPrice: $${prod.product_price}${prod.offer_price ? ` (Offer: $${prod.offer_price})` : ""}\nAvailable: ${prod.stock_quantity}\nCategory: ${prod.product_category}\nSeller: ${prod.product_seller}\nRating: ${prod.product_rating}\nWould you like to proceed with the purchase?`,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, aiMessage]);
        await saveMessage(activeConversationId, 'ai', aiMessage.content);
        lastIntentRef.current = "select_product";
        return;
      }
    }
    switch (intent) {
      case "banned": {
        const aiMessage: Message = {
          id: messages.length + 2,
          sender: "ai",
          content: "Please ask about available products.",
          timestamp: new Date()
        };
        setMessages(prev => [...prev, aiMessage]);
        await saveMessage(activeConversationId, 'ai', aiMessage.content);
        break;
      }
      case "greeting": {
        const aiMessage: Message = {
          id: messages.length + 2,
          sender: "ai",
          content: `Hello ${userNameRef.current || profile?.full_name || "User"}! How can I help you today?`,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, aiMessage]);
        await saveMessage(activeConversationId, 'ai', aiMessage.content);
        break;
      }
      case "ask_name": {
        const aiMessage: Message = {
          id: messages.length + 2,
          sender: "ai",
          content: `Your name is ${userNameRef.current || profile?.full_name || "User"}.`,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, aiMessage]);
        await saveMessage(activeConversationId, 'ai', aiMessage.content);
        break;
      }
      case "set_name": {
        const name = extractName(trimmedMessage) || trimmedMessage;
        userNameRef.current = name.charAt(0).toUpperCase() + name.slice(1);
        const aiMessage: Message = {
          id: messages.length + 2,
          sender: "ai",
          content: `Nice to meet you, ${userNameRef.current}! How can I help you today?`,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, aiMessage]);
        await saveMessage(activeConversationId, 'ai', aiMessage.content);
        break;
      }
      case "yes": {
        if (!walletConnected) {
          const aiMessage: Message = {
            id: messages.length + 2,
            sender: "ai",
            content: "❌ Please connect your wallet first to make purchases. Click on 'Connect Wallet' in the sidebar.",
            timestamp: new Date()
          };
          setMessages(prev => [...prev, aiMessage]);
          await saveMessage(activeConversationId, 'ai', aiMessage.content);
          return;
        }
        if (lastIntentRef.current === "awaiting_confirmation" && lastSelectedProductRef.current) {
          setShowPayment(true);
          const aiMessage: Message = {
            id: messages.length + 2,
            sender: "ai",
            content: `💳 Processing your purchase for: ${lastSelectedProductRef.current.product_name} for $${lastSelectedProductRef.current.offer_price ?? lastSelectedProductRef.current.product_price}.\nPlease confirm the payment in your wallet...`,
            timestamp: new Date()
          };
          setMessages(prev => [...prev, aiMessage]);
          await saveMessage(activeConversationId, 'ai', aiMessage.content);
          lastIntentRef.current = "awaiting_payment";
          return;
        }
        if (lastShownProductsRef.current.length > 0) {
          const prod = lastShownProductsRef.current[0];
          lastSelectedProductRef.current = prod;
          const aiMessage: Message = {
            id: messages.length + 2,
            sender: "ai",
            content: `Product: ${prod.product_name}\nPrice: $${prod.product_price}${prod.offer_price ? ` (Offer: $${prod.offer_price})` : ""}\nAvailable: ${prod.stock_quantity}\nCategory: ${prod.product_category}\nSeller: ${prod.product_seller}\nRating: ${prod.product_rating}\nWould you like to proceed with the purchase?`,
            timestamp: new Date()
          };
          setMessages(prev => [...prev, aiMessage]);
          await saveMessage(activeConversationId, 'ai', aiMessage.content);
          lastIntentRef.current = "awaiting_confirmation";
        } else {
          const aiMessage: Message = {
            id: messages.length + 2,
            sender: "ai",
            content: "No product was selected previously.",
            timestamp: new Date()
          };
          setMessages(prev => [...prev, aiMessage]);
          await saveMessage(activeConversationId, 'ai', aiMessage.content);
        }
        break;
      }
      case "no": {
        const aiMessage: Message = {
          id: messages.length + 2,
          sender: "ai",
          content: "No problem! Let me know if you want to see more products or need help with something else.",
          timestamp: new Date()
        };
        setMessages(prev => [...prev, aiMessage]);
        await saveMessage(activeConversationId, 'ai', aiMessage.content);
        break;
      }
      case "select_product": {
        const idx = isProductSelection(trimmedMessage);
        if (idx !== null && lastShownProductsRef.current.length > idx) {
          const prod = lastShownProductsRef.current[idx];
          lastSelectedProductRef.current = prod;
          const aiMessage: Message = {
            id: messages.length + 2,
            sender: "ai",
            content: `Product: ${prod.product_name}\nPrice: $${prod.product_price}${prod.offer_price ? ` (Offer: $${prod.offer_price})` : ""}\nAvailable: ${prod.stock_quantity}\nCategory: ${prod.product_category}\nSeller: ${prod.product_seller}\nRating: ${prod.product_rating}\nWould you like to proceed with the purchase?`,
            timestamp: new Date()
          };
          setMessages(prev => [...prev, aiMessage]);
          await saveMessage(activeConversationId, 'ai', aiMessage.content);
          lastIntentRef.current = "awaiting_confirmation";
        } else {
          const aiMessage: Message = {
            id: messages.length + 2,
            sender: "ai",
            content: "Sorry, I couldn't identify which product you meant.",
            timestamp: new Date()
          };
          setMessages(prev => [...prev, aiMessage]);
          await saveMessage(activeConversationId, 'ai', aiMessage.content);
        }
        break;
      }
      case "offers": {
        const offerProducts = products.filter(p => p.offer_price && p.offer_price < p.product_price);
        if (offerProducts.length === 0) {
          const aiMessage: Message = {
            id: messages.length + 2,
            sender: "ai",
            content: "Sorry, there are no special offers today.",
            timestamp: new Date()
          };
          setMessages(prev => [...prev, aiMessage]);
          await saveMessage(activeConversationId, 'ai', aiMessage.content);
          break;
        }
        const offerCategories = Array.from(new Set(offerProducts.map(p => p.product_category))).filter(Boolean);
        const aiMessage: Message = {
          id: messages.length + 2,
          sender: "ai",
          content: `We have special offers in these categories today: ${offerCategories.join(', ')}. Which category are you interested in?`,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, aiMessage]);
        await saveMessage(activeConversationId, 'ai', aiMessage.content);
        lastIntentRef.current = "offers";
        lastQueryRef.current = "__offers__";
        break;
      }
      case "list_categories": {
        const aiMessage: Message = {
          id: messages.length + 2,
          sender: "ai",
          content: getProductCategoriesText(products),
          timestamp: new Date()
        };
        setMessages(prev => [...prev, aiMessage]);
        await saveMessage(activeConversationId, 'ai', aiMessage.content);
        break;
      }
      case "list_products_by_category": {
        const cat = extractCategoryFromQuery(trimmedMessage, allCategories);
        let productsInCat = products.filter(p => p.product_category && p.product_category.toLowerCase() === (cat || '').toLowerCase());
        if (lastIntentRef.current === "offers") {
          productsInCat = productsInCat.filter(p => p.offer_price && p.offer_price < p.product_price);
        }
        if (productsInCat.length === 0) {
          const aiMessage: Message = {
            id: messages.length + 2,
            sender: "ai",
            content: "No, we don’t have this product currently. Let me know if you need anything else.",
            timestamp: new Date()
          };
          setMessages(prev => [...prev, aiMessage]);
          await saveMessage(activeConversationId, 'ai', aiMessage.content);
        } else {
          lastShownProductsRef.current = productsInCat.slice(0, PAGE_SIZE);
          lastQueryRef.current = cat || "";
          lastPageRef.current = 0;
          const aiMessage: Message = {
            id: messages.length + 2,
            sender: "ai",
            content: getProductListText(lastShownProductsRef.current),
            timestamp: new Date()
          };
          setMessages(prev => [...prev, aiMessage]);
          await saveMessage(activeConversationId, 'ai', aiMessage.content);
        }
        break;
      }
      case "list_products": {
        if (products.length === 0) {
          const aiMessage: Message = {
            id: messages.length + 2,
            sender: "ai",
            content: "No, we don’t have this product currently. Let me know if you need anything else.",
            timestamp: new Date()
          };
          setMessages(prev => [...prev, aiMessage]);
          await saveMessage(activeConversationId, 'ai', aiMessage.content);
        } else {
          lastShownProductsRef.current = products.slice(0, PAGE_SIZE);
          lastQueryRef.current = "__all__";
          lastPageRef.current = 0;
          const aiMessage: Message = {
            id: messages.length + 2,
            sender: "ai",
            content: getProductListText(lastShownProductsRef.current),
            timestamp: new Date()
          };
          setMessages(prev => [...prev, aiMessage]);
          await saveMessage(activeConversationId, 'ai', aiMessage.content);
        }
        break;
      }
      case "pagination": {
        let matched: Tables<'products'>[] = [];
        if (lastQueryRef.current === "__all__") {
          matched = products;
        } else if (allCategories.includes(lastQueryRef.current)) {
          matched = products.filter(p => p.product_category === lastQueryRef.current);
        } else {
          matched = searchProducts(lastQueryRef.current, products);
        }
        const moreCount = getMoreCount(trimmedMessage) || PAGE_SIZE;
        const nextPage = lastPageRef.current + 1;
        const start = nextPage * PAGE_SIZE;
        const pageProducts = matched.slice(start, start + moreCount);
        if (pageProducts.length === 0) {
          const aiMessage: Message = {
            id: messages.length + 2,
            sender: "ai",
            content: "No more products found for your query.",
            timestamp: new Date()
          };
          setMessages(prev => [...prev, aiMessage]);
          await saveMessage(activeConversationId, 'ai', aiMessage.content);
        } else {
          lastShownProductsRef.current = pageProducts;
          lastPageRef.current = nextPage;
          const aiMessage: Message = {
            id: messages.length + 2,
            sender: "ai",
            content: getProductListText(pageProducts, moreCount),
            timestamp: new Date()
          };
          setMessages(prev => [...prev, aiMessage]);
          await saveMessage(activeConversationId, 'ai', aiMessage.content);
        }
        break;
      }
      case "purchase": {
        if (!walletConnected) {
          const aiMessage: Message = {
            id: messages.length + 2,
            sender: "ai",
            content: "❌ Please connect your wallet first to make purchases. Click on 'Connect Wallet' in the sidebar.",
            timestamp: new Date()
          };
          setMessages(prev => [...prev, aiMessage]);
          await saveMessage(activeConversationId, 'ai', aiMessage.content);
          return;
        }
        const productQuery = extractProductFromPurchaseIntent(trimmedMessage);
        if (productQuery) {
          const matched = enhancedFuzzyMatchProduct(productQuery, products, 3);
          if (matched.length > 0) {
            lastShownProductsRef.current = matched.slice(0, PAGE_SIZE);
            lastQueryRef.current = productQuery;
            const aiMessage: Message = {
              id: messages.length + 2,
              sender: "ai",
              content: getProductListText(lastShownProductsRef.current),
              timestamp: new Date()
            };
            setMessages(prev => [...prev, aiMessage]);
            await saveMessage(activeConversationId, 'ai', aiMessage.content);
          } else {
            const aiMessage: Message = {
              id: messages.length + 2,
              sender: "ai",
              content: `Sorry, I couldn't find any products matching "${productQuery}". Please try searching for something else or browse our categories.`,
              timestamp: new Date()
            };
            setMessages(prev => [...prev, aiMessage]);
            await saveMessage(activeConversationId, 'ai', aiMessage.content);
          }
          return;
        }
        const selected = lastSelectedProductRef.current;
        if (selected) {
          setShowPayment(true);
          const aiMessage: Message = {
            id: messages.length + 2,
            sender: "ai",
            content: `Great choice! You're about to purchase: ${selected.product_name} for $${selected.offer_price ?? selected.product_price}. Please proceed with payment.`,
            timestamp: new Date()
          };
          setMessages(prev => [...prev, aiMessage]);
          await saveMessage(activeConversationId, 'ai', aiMessage.content);
          lastIntentRef.current = "purchase";
        } else {
          const aiMessage: Message = {
            id: messages.length + 2,
            sender: "ai",
            content: "Please select a product first before purchasing. You can search for products or browse our categories.",
            timestamp: new Date()
          };
          setMessages(prev => [...prev, aiMessage]);
          await saveMessage(activeConversationId, 'ai', aiMessage.content);
        }
        break;
      }
      default: {
        const matched = refinedFuzzyMatchProduct(trimmedMessage, products);
        if (matched.length === 0) {
          const aiMessage: Message = {
            id: messages.length + 2,
            sender: "ai",
            content: "No, we don’t have this product currently. Let me know if you need anything else.",
            timestamp: new Date()
          };
          setMessages(prev => [...prev, aiMessage]);
          await saveMessage(activeConversationId, 'ai', aiMessage.content);
        } else {
          lastShownProductsRef.current = matched.slice(0, PAGE_SIZE);
          lastQueryRef.current = trimmedMessage;
          lastPageRef.current = 0;
          const aiMessage: Message = {
            id: messages.length + 2,
            sender: "ai",
            content: getProductListText(lastShownProductsRef.current),
            timestamp: new Date()
          };
          setMessages(prev => [...prev, aiMessage]);
          await saveMessage(activeConversationId, 'ai', aiMessage.content);
        }
        break;
      }
    }
    if (lastIntentRef.current !== "awaiting_confirmation") {
      lastIntentRef.current = intent;
    }
  }, [inputMessage, messages, products, profile, walletConnected, user, activeConversationId, saveMessage]);

  const selectConversation = useCallback(async (conversationId: string) => {
    setActiveConversationId(conversationId);
    await loadMessages(conversationId);
    lastIntentRef.current = null;
    lastQueryRef.current = "";
    lastPageRef.current = 0;
    lastShownProductsRef.current = [];
    lastSelectedProductRef.current = null;
    setIsChatHistoryOpen(false);
  }, [loadMessages]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 relative">
        <div className="absolute inset-0 z-0">
          <div className="w-full h-full bg-[radial-gradient(circle,rgba(168,85,247,0.08)_1px,transparent_1px)] bg-[size:32px_32px] dark:bg-[radial-gradient(circle,rgba(236,72,153,0.10)_1px,transparent_1px)] transition-colors duration-500" />
        </div>
        <header className="bg-white/80 backdrop-blur-md shadow-lg border-b relative z-10">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">AutoCart Dashboard</h1>
                  <p className="text-sm text-gray-600">Welcome back, {profile?.full_name || 'User'}!</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <Link to="/">
                  <Button variant="outline" size="sm" className="border-purple-200 hover:bg-purple-50">
                    <Home className="w-4 h-4 mr-2" />
                    Home
                  </Button>
                </Link>
                <Button variant="outline" size="sm" onClick={handleSignOut} className="border-red-200 hover:bg-red-50 text-red-600">
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </header>
        <main className="container mx-auto px-6 py-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <aside className="lg:col-span-1">
              <Card className="mb-6 bg-white/80 backdrop-blur-sm border-purple-100">
                <CardHeader>
                  <CardTitle className="flex items-center text-purple-700">
                    <User className="w-5 h-5 mr-2" />
                    Profile
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <User className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="font-semibold text-gray-800">{profile?.full_name || 'User'}</h3>
                    <p className="text-sm text-gray-600">Premium Member</p>
                    <p className="text-xs text-gray-500 mt-1">{profile?.email}</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-white/80 backdrop-blur-sm border-purple-100">
                <CardHeader>
                  <CardTitle className="text-purple-700">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full justify-start bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600" variant="default" onClick={() => setShowOrders(true)}>
                    <ShoppingBag className="w-4 h-4 mr-2" />
                    My Orders ({orders.length})
                  </Button>
                  <Button className="w-full justify-start border-purple-200 hover:bg-purple-50" variant="outline" onClick={() => setShowPackages(true)}>
                    <Package className="w-4 h-4 mr-2" />
                    Track Packages ({packages.length})
                  </Button>
                  <Button className="w-full justify-start border-purple-200 hover:bg-purple-50" variant="outline" onClick={() => setShowSettings(true)}>
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </Button>
                  <Button className={`w-full justify-start border-purple-200 hover:bg-purple-50 ${walletConnected ? 'bg-green-50 text-green-700' : ''}`} variant="outline" onClick={handleConnectWallet}>
                    <Wallet className="w-4 h-4 mr-2" />
                    {walletConnected ? 'Wallet Connected' : 'Connect Wallet'}
                  </Button>
                </CardContent>
              </Card>
            </aside>
            <div className="lg:col-span-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card className="bg-white/80 backdrop-blur-sm border-purple-100">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Total Orders</p>
                        <p className="text-2xl font-bold text-gray-800">{orders.length}</p>
                      </div>
                      <ShoppingBag className="w-8 h-8 text-purple-500" />
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-white/80 backdrop-blur-sm border-purple-100">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">In Transit</p>
                        <p className="text-2xl font-bold text-gray-800">{packages.filter(p => p.status === 'in_transit').length}</p>
                      </div>
                      <Truck className="w-8 h-8 text-blue-500" />
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-white/80 backdrop-blur-sm border-purple-100">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Total Saved</p>
                        <p className="text-2xl font-bold text-gray-800">${totalSaved.toFixed(2)}</p>
                      </div>
                      <TrendingUp className="w-8 h-8 text-green-500" />
                    </div>
                  </CardContent>
                </Card>
              </div>
              {orders.length > 0 && (
                <Card className="mb-8 bg-white/80 backdrop-blur-sm border-purple-100">
                  <CardHeader>
                    <CardTitle className="text-purple-700">Recent Orders</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {orders.slice(0, 3).map((order) => (
                        <div key={order.id} className="flex items-center justify-between p-4 border border-purple-100 rounded-lg bg-white/50">
                          <div>
                            <h4 className="font-semibold text-gray-800">{order.order_number}</h4>
                            <p className="text-sm text-gray-600">${order.total_amount}</p>
                            <p className="text-xs text-gray-500">{new Date(order.created_at).toLocaleDateString()}</p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
              <Card className="bg-white/90 backdrop-blur-sm border-purple-100 rounded-xl shadow-lg overflow-hidden h-[36rem] flex flex-col">
                <CardHeader className="flex flex-row items-center justify-between px-4 py-3 border-b border-purple-100 bg-white/80 ">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsChatHistoryOpen(!isChatHistoryOpen)}
                    className="text-gray-600 hover:text-purple-700 p-2"
                    aria-label={isChatHistoryOpen ? "Close chat history" : "Open chat history"}
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d={isChatHistoryOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
                      />
                    </svg>
                  </Button>
                  <div className="flex items-center text-purple-700">
                    <MessageCircle className="w-5 h-5 mr-2" aria-hidden="true" />
                    <CardTitle className="text-base font-semibold">AutoCart AI</CardTitle>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full" />
                    <span className="text-xs text-gray-600">Online</span>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-row h-full p-0 overflow-hidden">
                  <div
                    className={`flex flex-col w-64 bg-white/95 border-r border-purple-100 transition-transform duration-300 ease-in-out z-20 h-full absolute top-0 left-0 sm:w-56 md:w-64 absolute top-0 left-0 md:absolute ${
                      isChatHistoryOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
                  >
                    <div className="flex flex-col h-full p-3 sm:p-2">
                      <div className="flex items-center justify-between mb-4 sm:mb-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setIsChatHistoryOpen(!isChatHistoryOpen)}
                          className="text-gray-600 hover:text-purple-700 p-1 sm:p-0.5"
                          aria-label={isChatHistoryOpen ? "Close chat history" : "Open chat history"}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isChatHistoryOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
                          </svg>
                        </Button>
                        <h3 className="text-base font-semibold text-purple-700 sm:text-sm">History</h3>
                        <div className="w-5 h-5"></div> {/* Spacer for alignment */}
                      </div>
                      <Button
                        onClick={startNewChat}
                        className="w-full mb-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg py-2 text-sm font-medium sm:text-xs sm:py-1.5"
                        disabled={!user}
                        aria-label="Start new chat"
                      >
                        + New Chat
                      </Button>
                      <ScrollArea className="flex-1">
                        {conversations.length === 0 ? (
                          <p className="text-sm text-gray-500 text-center py-4 sm:text-xs">No chats yet. Start a new one!</p>
                        ) : (
                          conversations.map(conv => (
                            <div
                              key={conv.id}
                              className={`flex items-center justify-between p-2 rounded-lg mb-1 transition-colors cursor-pointer sm:p-1.5 ${
                                activeConversationId === conv.id
                                  ? 'bg-purple-100 text-purple-700'
                                  : 'hover:bg-gray-50 text-gray-800'
                              }`}
                            >
                              {renamingConversationId === conv.id ? (
                                <div className="flex-1 flex items-center space-x-1.5 sm:space-x-1">
                                  <input
                                    type="text"
                                    value={newConversationTitle}
                                    onChange={(e) => setNewConversationTitle(e.target.value)}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') {
                                        renameConversation(conv.id, newConversationTitle);
                                      } else if (e.key === 'Escape') {
                                        setRenamingConversationId(null);
                                        setNewConversationTitle('');
                                      }
                                    }}
                                    className="flex-1 px-2 py-1 text-sm border border-purple-200 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white sm:text-xs sm:py-0.5"
                                    placeholder="Chat title"
                                    autoFocus
                                    aria-label="Rename chat"
                                  />
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => renameConversation(conv.id, newConversationTitle)}
                                    className="text-green-600 hover:text-green-800 p-1 sm:p-0.5"
                                    aria-label="Save new title"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      setRenamingConversationId(null);
                                      setNewConversationTitle('');
                                    }}
                                    className="text-red-600 hover:text-red-800 p-1 sm:p-0.5"
                                    aria-label="Cancel renaming"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                  </Button>
                                </div>
                              ) : (
                                <div className="flex-1 flex items-center space-x-1.5 sm:space-x-1">
                                  <div
                                    className="flex-1 truncate text-sm font-medium sm:text-xs"
                                    onClick={() => selectConversation(conv.id)}
                                    title={conv.title || generateConversationTitle(messages, conv.created_at)}
                                    aria-label={`Select chat: ${conv.title || generateConversationTitle(messages, conv.created_at)}`}
                                  >
                                    {conv.title || generateConversationTitle(messages, conv.created_at)}
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      setRenamingConversationId(conv.id);
                                      setNewConversationTitle(conv.title || generateConversationTitle(messages, conv.created_at));
                                    }}
                                    className="text-gray-500 hover:text-purple-700 p-1 sm:p-0.5"
                                    aria-label="Rename chat"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15.828H9v-2.828l8.586-8.586z"
                                      />
                                    </svg>
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => deleteConversation(conv.id)}
                                    className="text-gray-500 hover:text-red-600 p-1 sm:p-0.5"
                                    aria-label="Delete chat"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              )}
                            </div>
                          ))
                        )}
                        {hasMoreConversations && (
                          <Button
                            onClick={loadMoreConversations}
                            variant="ghost"
                            className="w-full mt-2 text-purple-600 hover:bg-purple-50 text-sm sm:text-xs"
                            aria-label="Load more chats"
                          >
                            Load More
                          </Button>
                        )}
                      </ScrollArea>
                    </div>
                  </div>
                  <div
                    className={`flex flex-col flex-1 h-full transition-all duration-300 ${
                      isChatHistoryOpen ? 'opacity-50 pointer-events-none' : ''
                    }`}
                  >
                    <ScrollArea className="flex-1 px-4 py-6 space-y-6 bg-gray-50/50 sm:px-3">
                      {messages.length === 0 && (
                        <div className="text-center text-gray-500 py-12">
                          <p className="text-sm sm:text-xs">Select a chat or start a new one to begin.</p>
                        </div>
                      )}
                      {messages.map((message, idx) => (
                        <div
                          key={message.id}
                          ref={idx === messages.length - 1 ? chatEndRef : undefined}
                          className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} mb-6`}
                        >
                          <div
                            className={`max-w-[70%] p-4 rounded-2xl shadow-sm sm:p-3 sm:text-sm ${
                              message.sender === 'user'
                                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                                : 'bg-white text-gray-800 border border-purple-100'
                            }`}
                          >
                            <p className="text-sm leading-relaxed whitespace-pre-wrap sm:text-xs">{message.content}</p>
                            <p className="text-xs opacity-60 mt-2 sm:text-[10px]">
                              {message.timestamp.toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
                          </div>
                        </div>
                      ))}
                    </ScrollArea>
                    <div className="border-t border-purple-100 p-4 bg-white/90 sm:p-3">
                      <div className="max-w-3xl mx-auto flex space-x-3 sm:space-x-2">
                        <textarea
                          value={inputMessage}
                          onChange={(e) => {
                            setInputMessage(e.target.value);
                            const textarea = e.target;
                            textarea.style.height = 'auto'; // Reset height
                            textarea.style.height = `${Math.min(Math.max(textarea.scrollHeight, 48), 156)}px`; // Set height between min (48px) and max (128px)
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              sendMessage();
                            }
                          }}
                          placeholder="Ask about products, orders, or anything else..."
                          className="flex-1 px-4 py-3 border border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white text-gray-800 text-sm sm:text-xs sm:px-3 sm:py-2 min-h-12 max-h-32 overflow-y-auto resize-none"
                          aria-label="Chat with AutoCart AI"
                          disabled={!user || !activeConversationId}
                        />
                        <Button
                          onClick={sendMessage}
                          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl p-3 sm:p-2.5"
                          disabled={!user || !activeConversationId || !inputMessage.trim()}
                          aria-label="Send message"
                        >
                          <Send className="w-5 h-5 sm:w-4 sm:h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
        <Dialog open={showOrders} onOpenChange={setShowOrders}>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>My Orders</DialogTitle></DialogHeader>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {orders.length === 0 ? (
                <p className="text-gray-500">No orders found.</p>
              ) : (
                orders.map(order => (
                  <div key={order.id} className="p-4 border rounded-lg bg-white/70 flex justify-between items-center">
                    <div>
                      <div className="font-semibold">{order.order_number}</div>
                      <div className="text-xs text-gray-500">{new Date(order.created_at).toLocaleString()}</div>
                      <div className="text-sm text-gray-700">${order.total_amount}</div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>{order.status}</span>
                  </div>
                ))
              )}
            </div>
          </DialogContent>
        </Dialog>
        <Dialog open={showPackages} onOpenChange={setShowPackages}>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Track Packages</DialogTitle></DialogHeader>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {packages.length === 0 ? (
                <p className="text-gray-500">No packages found.</p>
              ) : (
                packages.map(pkg => (
                  <div key={pkg.id} className="p-4 border rounded-lg bg-white/70 flex justify-between items-center">
                    <div>
                      <div className="font-semibold">{pkg.tracking_number}</div>
                      <div className="text-xs text-gray-500">{pkg.carrier}</div>
                      <div className="text-sm text-gray-700">{pkg.status} - {pkg.current_location}</div>
                      <div className="text-xs text-gray-400">Est. Delivery: {pkg.estimated_delivery}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </DialogContent>
        </Dialog>
        <Dialog open={showSettings} onOpenChange={setShowSettings}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Profile Settings</DialogTitle>
              <p className="text-sm text-gray-500">Manage your account details and preferences.</p>
            </DialogHeader>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                <input
                  type="text"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                  value={editProfile.full_name}
                  onChange={e => setEditProfile(p => ({ ...p, full_name: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Company</label>
                <input
                  type="text"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                  value={editProfile.company}
                  onChange={e => setEditProfile(p => ({ ...p, company: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-gray-100 cursor-not-allowed"
                  value={profile?.email || ''}
                  readOnly
                />
              </div>
              <div className="border-t pt-6 space-y-4">
                <div className="relative flex items-start">
                  <div className="flex items-center h-5">
                    <input id="email-notifications" name="email-notifications" type="checkbox" className="focus:ring-purple-500 h-4 w-4 text-purple-600 border-gray-300 rounded" checked={emailNotifications} onChange={e => setEmailNotifications(e.target.checked)} />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="email-notifications" className="font-medium text-gray-700">Email Notifications</label>
                    <p className="text-gray-500">Receive email notifications for payment updates and tenant activities.</p>
                  </div>
                </div>
                <div className="relative flex items-start">
                  <div className="flex items-center h-5">
                    <input id="sms-notifications" name="sms-notifications" type="checkbox" className="focus:ring-purple-500 h-4 w-4 text-purple-600 border-gray-300 rounded" checked={smsNotifications} onChange={e => setSmsNotifications(e.target.checked)} />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="sms-notifications" className="font-medium text-gray-700">SMS Notifications</label>
                    <p className="text-gray-500">Receive SMS notifications for critical updates.</p>
                  </div>
                </div>
              </div>
              <div className="flex justify-end space-x-3">
                <Button variant="outline" onClick={() => setShowSettings(false)} className="border-purple-200 hover:bg-purple-50">
                  Cancel
                </Button>
                <Button onClick={handleSaveProfile} className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600" disabled={savingProfile}>
                  {savingProfile ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
        <Dialog open={showWallet} onOpenChange={setShowWallet}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Connect Payman Wallet</DialogTitle>
              <DialogDescription>
                {walletError ? (
                  <p className="text-red-500">{walletError}</p>
                ) : (
                  'Connecting to your Payman wallet. Please complete the authentication in the popup window.'
                )}
              </DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>
        <Dialog open={showPayment} onOpenChange={setShowPayment}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Confirm Payment</DialogTitle>
            </DialogHeader>
            {lastSelectedProductRef.current && (
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <img src="/placeholder-product.jpg" alt="Product" className="w-16 h-16 rounded-lg" />
                  <div>
                    <h3 className="font-semibold">{lastSelectedProductRef.current.product_name}</h3>
                    <p className="text-sm text-gray-600">
                      ${lastSelectedProductRef.current.offer_price ?? lastSelectedProductRef.current.product_price}
                    </p>
                  </div>
                </div>
                <div className="border-t pt-4">
                  <p className="text-sm text-gray-700">Pay using your connected Payman wallet.</p>
                </div>
                <div className="flex justify-end space-x-3">
                  <Button variant="outline" onClick={() => setShowPayment(false)} className="border-purple-200 hover:bg-purple-50">
                    Cancel
                  </Button>
                  <Button
                    onClick={() => handlePaymentConfirmation(lastSelectedProductRef.current!)}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                    disabled={paymentStatus === 'processing'}
                  >
                    {paymentStatus === 'processing' ? 'Processing...' : 'Confirm Payment'}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </ProtectedRoute>
  );
};

export default Dashboard;