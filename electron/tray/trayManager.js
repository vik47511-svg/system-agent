const { Tray, Menu, nativeImage, app } = require('electron');
const path = require('path');
const { getMainWindow } = require('../windows/mainWindow');
const logger = require('../utils/logger');

/** @type {Tray | null} */
let tray = null;

function buildContextMenu() {
  return Menu.buildFromTemplate([
    {
      label: 'Show Atlas AI',
      click: () => {
        const win = getMainWindow();
        if (win) {
          win.show();
          win.focus();
        }
      },
    },
    { type: 'separator' },
    {
      label: 'Quit',
      click: () => app.quit(),
    },
  ]);
}

function createTray() {
  try {
    // Use a 16x16 transparent placeholder if no icon asset exists yet
    const icon = nativeImage.createEmpty();
    tray = new Tray(icon);
    tray.setToolTip('Atlas AI — Operations Assistant');
    tray.setContextMenu(buildContextMenu());

    tray.on('click', () => {
      const win = getMainWindow();
      if (win) {
        if (win.isVisible()) {
          win.focus();
        } else {
          win.show();
        }
      }
    });

    logger.info('System tray created');
  } catch (err) {
    logger.warn('Tray creation failed (expected in headless env):', err.message);
  }

  return tray;
}

function destroyTray() {
  if (tray) {
    tray.destroy();
    tray = null;
  }
}

module.exports = { createTray, destroyTray };
