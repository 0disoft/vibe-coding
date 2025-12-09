
const fs = require('node:fs');
const path = require('node:path');

const messagesDir = path.join(process.cwd(), 'messages');
console.log('Resolved messages directory:', messagesDir);

const translations = {
  ja: {
    font_size_change: '文字サイズ変更',
    font_size_current: '文字サイズ (現在: {value})'
  },
  zh: {
    font_size_change: '更改字体大小',
    font_size_current: '字体大小 (当前: {value})'
  },
  es: {
    font_size_change: 'Cambiar tamaño de fuente',
    font_size_current: 'Tamaño de fuente (Actual: {value})'
  },
  fr: {
    font_size_change: 'Changer la taille de la police',
    font_size_current: 'Taille de la police (Actuel : {value})'
  },
  de: {
    font_size_change: 'Schriftgröße ändern',
    font_size_current: 'Schriftgröße (Aktuell: {value})'
  },
  it: {
    font_size_change: 'Cambia dimensione carattere',
    font_size_current: 'Dimensione carattere (Attuale: {value})'
  },
  pt: {
    font_size_change: 'Alterar tamanho da fonte',
    font_size_current: 'Tamanho da fonte (Atual: {value})'
  },
  nl: {
    font_size_change: 'Lettergrootte wijzigen',
    font_size_current: 'Lettergrootte (Huidig: {value})'
  },
  pl: {
    font_size_change: 'Zmień rozmiar czcionki',
    font_size_current: 'Rozmiar czcionki (Obecny: {value})'
  },
  ru: {
    font_size_change: 'Изменить размер шрифта',
    font_size_current: 'Размер шрифта (Текущий: {value})'
  },
  sv: {
    font_size_change: 'Ändra teckenstorlek',
    font_size_current: 'Teckenstorlek (Nuvarande: {value})'
  },
  tr: {
    font_size_change: 'Yazı Boyutunu Değiştir',
    font_size_current: 'Yazı Boyutu (Mevcut: {value})'
  },
  vi: {
    font_size_change: 'Thay đổi kích thước phông chữ',
    font_size_current: 'Kích thước phông chữ (Hiện tại: {value})'
  },
  th: {
    font_size_change: 'เปลี่ยนขนาดตัวอักษร',
    font_size_current: 'ขนาดตัวอักษร (ปัจจุบัน: {value})'
  },
  id: {
    font_size_change: 'Ubah Ukuran Font',
    font_size_current: 'Ukuran Font (Saat ini: {value})'
  },
  tl: {
    font_size_change: 'Palitan ang Laki ng Font',
    font_size_current: 'Laki ng Font (Kasalukuyan: {value})'
  },
  ar: {
    font_size_change: 'تغيير حجم الخط',
    font_size_current: 'حجم الخط (الحالي: {value})'
  },
  hi: {
    font_size_change: 'फ़ॉन्ट आकार बदलें',
    font_size_current: 'फ़ॉन्ट आकार (वर्तमान: {value})'
  }
};

async function updateMessages() {
  for (const [lang, messages] of Object.entries(translations)) {
    const filePath = path.join(messagesDir, `${lang}.json`);

    if (fs.existsSync(filePath)) {
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        const json = JSON.parse(content);

        // Merge translations
        const updatedJson = { ...json, ...messages };

        fs.writeFileSync(filePath, `${JSON.stringify(updatedJson, null, '\t')}\n`, 'utf8');
        console.log(`Updated ${lang}.json`);
      } catch (error) {
        console.error(`Error updating ${lang}.json:`, error);
      }
    } else {
      console.warn(`File not found: ${lang}.json`);
    }
  }
}

updateMessages();
