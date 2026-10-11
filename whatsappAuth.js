import makeWASocket, { DisconnectReason, useMultiFileAuthState } from '@whiskeysockets/baileys';
import { isBoom } from '@hapi/boom';
import pino from 'pino';
import qrcode from 'qrcode-terminal';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const authDirectory = join(dirname(fileURLToPath(import.meta.url)), 'auth_info_baileys');
let testMessageSent = false;

async function connectToWhatsApp() {
  const { state, saveCreds } = await useMultiFileAuthState(authDirectory);
  const socket = makeWASocket({
    auth: state,
    logger: pino({ level: 'silent' }),
  });

  socket.ev.on('creds.update', saveCreds);
  socket.ev.on('connection.update', ({ connection, lastDisconnect, qr }) => {
    if (qr) {
      console.log('Scan this QR code with WhatsApp to authenticate:');
      qrcode.generate(qr, { small: true });
    }

    if (connection === 'open') {
      console.log('Connected to WhatsApp.');
      sendTestMessage(socket).catch((error) => {
        console.error('Failed to send the WhatsApp test message:', error);
        process.exitCode = 1;
      });
    } else if (connection === 'close') {
      const disconnectError = lastDisconnect?.error;
      const statusCode = isBoom(disconnectError)
        ? disconnectError.output.statusCode
        : undefined;

      if (statusCode === DisconnectReason.loggedOut) {
        console.error('WhatsApp logged out. Remove auth_info_baileys and run this script again to reauthenticate.');
        return;
      }

      console.log('WhatsApp connection closed. Reconnecting in 3 seconds...');
      setTimeout(() => {
        connectToWhatsApp().catch((error) => {
          console.error('Failed to reconnect to WhatsApp:', error);
          process.exitCode = 1;
        });
      }, 3000);
    }
  });
}

connectToWhatsApp().catch((error) => {
  console.error('Failed to connect to WhatsApp:', error);
  process.exitCode = 1;
});

async function sendTestMessage(socket) {
  if (testMessageSent) return;
  testMessageSent = true;

  await socket.sendMessage('918657599597@s.whatsapp.net', {
    text: 'Hello from DueFox Automation Engine!',
  });
  console.log('WhatsApp test message sent.');
}
