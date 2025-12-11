/**
 * Font registration for React-PDF
 *
 * React-PDF requires fonts to be registered before use.
 * We use Google Fonts for body text and can embed custom fonts.
 */

import { Font } from '@react-pdf/renderer';

// Register fonts
export function registerFonts() {
  // Roboto Mono - Your main body font
  Font.register({
    family: 'RobotoMono',
    fonts: [
      {
        src: 'https://fonts.gstatic.com/s/robotomono/v23/L0xuDF4xlVMF-BfR8bXMIhJHg45mwgGEFl0_3vq_ROW4.ttf',
        fontWeight: 300,
      },
      {
        src: 'https://fonts.gstatic.com/s/robotomono/v23/L0xuDF4xlVMF-BfR8bXMIhJHg45mwgGEFl0_3vq_ROW4.ttf',
        fontWeight: 400,
      },
      {
        src: 'https://fonts.gstatic.com/s/robotomono/v23/L0xuDF4xlVMF-BfR8bXMIhJHg45mwgGEFl0_3vq_ROW4.ttf',
        fontWeight: 500,
      },
      {
        src: 'https://fonts.gstatic.com/s/robotomono/v23/L0xuDF4xlVMF-BfR8bXMIhJHg45mwgGEFl0_3vq_ROW4.ttf',
        fontWeight: 700,
      },
    ],
  });

  // Playfair Display - Elegant headings
  Font.register({
    family: 'Playfair',
    fonts: [
      {
        src: 'https://fonts.gstatic.com/s/playfairdisplay/v37/nuFvD-vYSZviVYUb_rj3ij__anPXJzDwcbmjWBN2PKdFvXDXbtM.ttf',
        fontWeight: 400,
      },
      {
        src: 'https://fonts.gstatic.com/s/playfairdisplay/v37/nuFvD-vYSZviVYUb_rj3ij__anPXJzDwcbmjWBN2PKebunDXbtM.ttf',
        fontWeight: 500,
      },
      {
        src: 'https://fonts.gstatic.com/s/playfairdisplay/v37/nuFvD-vYSZviVYUb_rj3ij__anPXJzDwcbmjWBN2PKd1vXDXbtM.ttf',
        fontWeight: 700,
      },
      {
        src: 'https://fonts.gstatic.com/s/playfairdisplay/v37/nuFRD-vYSZviVYUb_rj3ij__anPXDTnCjmHKM4nYO7KN_qiTbtbK-F2rA0s.ttf',
        fontWeight: 400,
        fontStyle: 'italic',
      },
    ],
  });

  // Cormorant Garamond - Alternative elegant serif
  Font.register({
    family: 'Cormorant',
    fonts: [
      {
        src: 'https://fonts.gstatic.com/s/cormorantgaramond/v16/co3YmX5slCNuHLi8bLeY9MK7whWMhyjornFLsS6V7w.ttf',
        fontWeight: 400,
      },
      {
        src: 'https://fonts.gstatic.com/s/cormorantgaramond/v16/co3WmX5slCNuHLi8bLeY9MK7whWMhyjYrEtBmQ47LjM.ttf',
        fontWeight: 700,
      },
      {
        src: 'https://fonts.gstatic.com/s/cormorantgaramond/v16/co3ZmX5slCNuHLi8bLeY9MK7whWMhyjQtl9fcwahxg.ttf',
        fontWeight: 400,
        fontStyle: 'italic',
      },
    ],
  });
}

// Font family names for use in styles
export const FONTS = {
  heading: 'Playfair',
  body: 'RobotoMono',
  accent: 'Cormorant',
} as const;
