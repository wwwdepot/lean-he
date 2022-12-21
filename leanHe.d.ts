interface EncodeOptions {
  /** default `false` */
  decimal?: boolean;
  /** default `false` */
  useNamedReferences?: boolean;
  /** default `false` */
  encodeEverything?: boolean;
  /** default `false` */
  strict?: boolean;
  /** default `false` */
  allowUnsafeSymbols?: boolean;
}

interface DecodeOptions {
  /** default `false` */
  isAttributeValue?: boolean;
  /** default `false` */
  strict?: boolean;
}

export function escape(text: string): string;
export function encode(text: string, options?: EncodeOptions): string;
export function decode(html: string, options?: DecodeOptions): string;
export function unescape(html: string, options?: DecodeOptions): string;
