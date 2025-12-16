// Ortamı otomatik algıla
// Eğer tarayıcıda "localhost" veya "127.0.0.1" yazıyorsa Local ortamdır.
// Değilse Production (Canlı) ortamdır.

const isLocal = typeof window !== 'undefined' && 
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

export const API_BASE_URL = isLocal 
    ? 'http://localhost:3001/api' 
    : 'https://erp.zigzax.agency/api';

/**
 * API yollarını oluşturmak için yardımcı fonksiyon
 * Kullanım: getApiUrl('/products') -> http://localhost:3001/api/products (Localde)
 */
export const getApiUrl = (endpoint: string): string => {
    // Başta slash varsa temizle, çift slash olmasın
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.substring(1) : endpoint;
    return `${API_BASE_URL}/${cleanEndpoint}`;
};