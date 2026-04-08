import { productControl } from '@/data/product-control';

/**
 * Short Code System for Danis Para Bebê
 * 
 * Generates and manages short reference codes (e.g., DPB-0042)
 * for products, replacing the long internal IDs in URLs and technical sheets.
 * 
 * The short code is deterministic based on the product's position in the
 * productControl array. New products added at the end get the next number.
 * 
 * Internal IDs are NEVER modified — this is purely a visual alias layer.
 */

const SHORT_CODE_PREFIX = 'DPB';

// Build lookup maps once on module load
let _shortToId: Map<string, string> | null = null;
let _idToShort: Map<string, string> | null = null;

function buildMaps() {
    if (_shortToId && _idToShort) return;
    
    _shortToId = new Map();
    _idToShort = new Map();
    
    productControl.forEach((product, index) => {
        // If product already has a shortCode assigned, use it
        if (product.shortCode) {
            _shortToId!.set(product.shortCode.toUpperCase(), product.id);
            _idToShort!.set(product.id, product.shortCode);
            return;
        }
        
        // Otherwise generate sequentially: DPB-0001, DPB-0002, etc.
        const code = `${SHORT_CODE_PREFIX}-${String(index + 1).padStart(4, '0')}`;
        _shortToId!.set(code.toUpperCase(), product.id);
        _idToShort!.set(product.id, code);
    });
}

/**
 * Get the real product ID from a short code
 * e.g., "DPB-0042" -> "FEM-KIT-MON-RSA-BAB-RSA-R_RSA_O2"
 */
export function getIdFromShortCode(shortCode: string): string | undefined {
    buildMaps();
    return _shortToId!.get(shortCode.toUpperCase());
}

/**
 * Get the short code from a real product ID
 * e.g., "FEM-KIT-MON-RSA-BAB-RSA-R_RSA_O2" -> "DPB-0042"
 */
export function getShortCode(productId: string): string {
    buildMaps();
    return _idToShort!.get(productId) || productId; // fallback to full ID
}

/**
 * Check if a string looks like a short code (DPB-XXXX format)
 */
export function isShortCode(value: string): boolean {
    return /^DPB-\d{4,}$/i.test(value);
}

/**
 * Resolve any product identifier (short code OR full ID) to the real ID
 */
export function resolveProductId(identifier: string): string {
    if (isShortCode(identifier)) {
        return getIdFromShortCode(identifier) || identifier;
    }
    return identifier;
}

/**
 * Generate the next available short code number
 */
export function getNextShortCode(): string {
    buildMaps();
    const nextNum = _idToShort!.size + 1;
    return `${SHORT_CODE_PREFIX}-${String(nextNum).padStart(4, '0')}`;
}
