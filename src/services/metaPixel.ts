/**
 * Meta Pixel (Facebook Pixel) Centralized Service
 * Pixel ID: 1421849056571633
 * 
 * Supports Single Page Application (SPA) routing, standard e-commerce events,
 * and duplicate purchase protection.
 */

declare global {
  interface Window {
    fbq?: any;
    _fbq?: any;
  }
}

export const META_PIXEL_ID =
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_META_PIXEL_ID) ||
  '1421849056571633';

const isDev = typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.DEV;

// Track processed state
let isInitialized = false;
let lastTrackedPageViewPath: string | null = null;
let lastTrackedPageViewTime = 0;
const trackedPurchases = new Set<string>();

// Load previously tracked purchase IDs from sessionStorage to prevent duplicate events on refresh
try {
  if (typeof window !== 'undefined' && window.sessionStorage) {
    const saved = window.sessionStorage.getItem('shokh_meta_tracked_purchases');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        parsed.forEach((id: string) => trackedPurchases.add(id));
      }
    }
  }
} catch {
  // ignore storage errors
}

const saveTrackedPurchases = () => {
  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      window.sessionStorage.setItem(
        'shokh_meta_tracked_purchases',
        JSON.stringify(Array.from(trackedPurchases))
      );
    }
  } catch {
    // ignore
  }
};

const devLog = (event: string, data?: any) => {
  if (isDev) {
    if (data) {
      console.log(`%c[Meta Pixel] %c${event}`, 'color: #1877F2; font-weight: bold;', 'color: #333; font-weight: 600;', data);
    } else {
      console.log(`%c[Meta Pixel] %c${event}`, 'color: #1877F2; font-weight: bold;', 'color: #333; font-weight: 600;');
    }
  }
};

/**
 * 1. Global Meta Pixel Initialization
 * Injects base script snippet if not already loaded and initializes Pixel ID once.
 */
export const initMetaPixel = (): void => {
  if (typeof window === 'undefined') return;
  if (isInitialized) return;

  // If already initialized by HTML snippet, just mark ready
  if (window.fbq && typeof window.fbq === 'function' && window._fbq) {
    isInitialized = true;
    devLog(`Detected active Meta Pixel ID: ${META_PIXEL_ID}`);
    return;
  }

  // Initialize fbq stub if not already present
  if (!window.fbq) {
    const fbq: any = function (...args: any[]) {
      if (fbq.callMethod) {
        fbq.callMethod.apply(fbq, args);
      } else {
        fbq.queue.push(args);
      }
    };
    window.fbq = fbq;
    if (!window._fbq) window._fbq = fbq;
    fbq.push = fbq;
    fbq.loaded = true;
    fbq.version = '2.0';
    fbq.queue = [];

    // Inject remote script
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://connect.facebook.net/en_US/fbevents.js';
    const firstScript = document.getElementsByTagName('script')[0];
    if (firstScript && firstScript.parentNode) {
      firstScript.parentNode.insertBefore(script, firstScript);
    } else {
      document.head.appendChild(script);
    }
  }

  // Initialize Pixel
  window.fbq('init', META_PIXEL_ID);
  isInitialized = true;
  devLog(`Initialized with ID: ${META_PIXEL_ID}`);
};

/**
 * 2. SPA PageView Tracking
 * Fires PageView event while avoiding duplicate calls for the same route view within rapid succession.
 */
export const trackPageView = (path?: string, title?: string): void => {
  if (typeof window === 'undefined') return;
  if (!isInitialized) {
    initMetaPixel();
  }

  const currentPath = path || window.location.pathname + window.location.search;
  const now = Date.now();

  // Prevent duplicate PageView firing if called multiple times within 400ms for same path
  if (lastTrackedPageViewPath === currentPath && now - lastTrackedPageViewTime < 400) {
    return;
  }

  lastTrackedPageViewPath = currentPath;
  lastTrackedPageViewTime = now;

  if (window.fbq) {
    window.fbq('track', 'PageView', {
      page_path: currentPath,
      page_title: title || document.title,
    });
    devLog('PageView', { path: currentPath, title: title || document.title });
  }
};

/**
 * 3. ViewContent Event
 * Fired when a customer views a product detail page, custom garment, or wholesale product.
 */
export const trackViewContent = (params: {
  id: string;
  name: string;
  category?: string;
  price: number;
  currency?: string;
}): void => {
  if (typeof window === 'undefined') return;
  if (!isInitialized) initMetaPixel();

  if (window.fbq) {
    const payload = {
      content_name: params.name,
      content_category: params.category || 'Apparel',
      content_ids: [String(params.id)],
      content_type: 'product',
      value: Number(params.price) || 0,
      currency: params.currency || 'BDT',
    };
    window.fbq('track', 'ViewContent', payload);
    devLog('ViewContent', payload);
  }
};

/**
 * 4. Search Event
 * Fired when customer explicitly performs/submits a search.
 */
export const trackSearch = (searchQuery: string): void => {
  if (typeof window === 'undefined' || !searchQuery || !searchQuery.trim()) return;
  if (!isInitialized) initMetaPixel();

  const query = searchQuery.trim();
  if (window.fbq) {
    const payload = {
      search_string: query,
      content_type: 'product',
    };
    window.fbq('track', 'Search', payload);
    devLog('Search', payload);
  }
};

/**
 * 5. AddToCart Event
 * Fired when a customer successfully adds an item or variant to their cart.
 */
export const trackAddToCart = (params: {
  id: string;
  name: string;
  category?: string;
  price: number;
  quantity?: number;
  currency?: string;
}): void => {
  if (typeof window === 'undefined') return;
  if (!isInitialized) initMetaPixel();

  const qty = Number(params.quantity) || 1;
  const unitPrice = Number(params.price) || 0;
  const totalValue = unitPrice * qty;

  if (window.fbq) {
    const payload = {
      content_name: params.name,
      content_category: params.category || 'Apparel',
      content_ids: [String(params.id)],
      content_type: 'product',
      value: totalValue,
      currency: params.currency || 'BDT',
      num_items: qty,
    };
    window.fbq('track', 'AddToCart', payload);
    devLog('AddToCart', payload);
  }
};

/**
 * 6. InitiateCheckout Event
 * Fired once when checkout modal/process is opened with cart items.
 */
let lastCheckoutTimestamp = 0;
export const trackInitiateCheckout = (params: {
  value: number;
  num_items: number;
  content_ids?: string[];
  currency?: string;
}): void => {
  if (typeof window === 'undefined') return;
  if (!isInitialized) initMetaPixel();

  const now = Date.now();
  // Prevent duplicate InitiateCheckout within 1.5 seconds if component re-renders
  if (now - lastCheckoutTimestamp < 1500) {
    return;
  }
  lastCheckoutTimestamp = now;

  if (window.fbq) {
    const payload = {
      value: Number(params.value) || 0,
      currency: params.currency || 'BDT',
      num_items: Number(params.num_items) || 1,
      content_ids: params.content_ids || [],
      content_type: 'product',
    };
    window.fbq('track', 'InitiateCheckout', payload);
    devLog('InitiateCheckout', payload);
  }
};

/**
 * 7. Purchase Event
 * Fired ONLY when the backend/Supabase database confirms successful order creation.
 * Prevents duplicate events for the same orderId across page refreshes or re-renders.
 */
export const trackPurchase = (params: {
  orderId: string;
  value: number;
  currency?: string;
  content_ids: string[];
  num_items: number;
  contents?: Array<{
    id: string;
    name?: string;
    quantity: number;
    item_price?: number;
  }>;
}): boolean => {
  if (typeof window === 'undefined') return false;
  if (!params.orderId) return false;
  if (!isInitialized) initMetaPixel();

  const normalizedOrderId = String(params.orderId).trim();

  // Deduplication guard
  if (trackedPurchases.has(normalizedOrderId)) {
    devLog(`Purchase skipped (Duplicate orderId: ${normalizedOrderId})`);
    return false;
  }

  trackedPurchases.add(normalizedOrderId);
  saveTrackedPurchases();

  if (window.fbq) {
    const payload = {
      value: Number(params.value) || 0,
      currency: params.currency || 'BDT',
      content_ids: params.content_ids || [],
      content_type: 'product',
      num_items: Number(params.num_items) || 1,
      order_id: normalizedOrderId,
      contents: params.contents,
    };
    window.fbq('track', 'Purchase', payload);
    devLog('Purchase (Successful Order)', payload);
    return true;
  }

  return false;
};

/**
 * 8. Lead Event
 * Fired when customer submits a custom apparel inquiry or wholesale contact form.
 */
export const trackLead = (params?: {
  content_name?: string;
  category?: string;
  value?: number;
  currency?: string;
}): void => {
  if (typeof window === 'undefined') return;
  if (!isInitialized) initMetaPixel();

  if (window.fbq) {
    const payload = {
      content_name: params?.content_name || 'Custom Order Inquiry',
      content_category: params?.category || 'Custom Studio',
      value: params?.value !== undefined ? Number(params.value) : undefined,
      currency: params?.currency || 'BDT',
    };
    window.fbq('track', 'Lead', payload);
    devLog('Lead', payload);
  }
};

/**
 * 9. AddToWishlist Event
 * Fired when customer adds an item to favorites / wishlist.
 */
export const trackAddToWishlist = (params: {
  id: string;
  name: string;
  category?: string;
  price?: number;
  currency?: string;
}): void => {
  if (typeof window === 'undefined') return;
  if (!isInitialized) initMetaPixel();

  if (window.fbq) {
    const payload = {
      content_name: params.name,
      content_category: params.category || 'Apparel',
      content_ids: [String(params.id)],
      content_type: 'product',
      value: Number(params.price) || 0,
      currency: params.currency || 'BDT',
    };
    window.fbq('track', 'AddToWishlist', payload);
    devLog('AddToWishlist', payload);
  }
};

/**
 * 10. Contact Event
 * Fired when customer clicks to contact via WhatsApp, hotline, or direct inquiry.
 */
export const trackContact = (params?: {
  channel?: string;
  content_name?: string;
}): void => {
  if (typeof window === 'undefined') return;
  if (!isInitialized) initMetaPixel();

  if (window.fbq) {
    const payload = {
      content_name: params?.content_name || 'Customer Support Contact',
      content_category: params?.channel || 'WhatsApp',
    };
    window.fbq('track', 'Contact', payload);
    devLog('Contact', payload);
  }
};

/**
 * 11. CompleteRegistration Event
 * Fired when customer completes sign up / registration.
 */
export const trackCompleteRegistration = (params?: {
  method?: string;
  status?: boolean;
}): void => {
  if (typeof window === 'undefined') return;
  if (!isInitialized) initMetaPixel();

  if (window.fbq) {
    const payload = {
      status: params?.status ?? true,
      content_name: params?.method || 'Email Registration',
    };
    window.fbq('track', 'CompleteRegistration', payload);
    devLog('CompleteRegistration', payload);
  }
};

/**
 * 12. CustomizeProduct Event
 * Fired when customer customizes a garment design or uploads an artwork file.
 */
export const trackCustomizeProduct = (params?: {
  content_name?: string;
  custom_options?: string;
}): void => {
  if (typeof window === 'undefined') return;
  if (!isInitialized) initMetaPixel();

  if (window.fbq) {
    const payload = {
      content_name: params?.content_name || 'Custom Garment Print',
      custom_options: params?.custom_options,
    };
    window.fbq('track', 'CustomizeProduct', payload);
    devLog('CustomizeProduct', payload);
  }
};

export const metaPixel = {
  init: initMetaPixel,
  trackPageView,
  trackViewContent,
  trackSearch,
  trackAddToCart,
  trackInitiateCheckout,
  trackPurchase,
  trackLead,
  trackAddToWishlist,
  trackContact,
  trackCompleteRegistration,
  trackCustomizeProduct,
};

export default metaPixel;
