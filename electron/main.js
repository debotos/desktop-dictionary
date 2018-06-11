const { app, BrowserWindow, ipcMain, Menu } = require('electron');
const path = require('path');
const url = require('url');

var knex = require('knex')({
  client: 'sqlite3',
  connection: {
    filename: path.resolve(__dirname, 'db', 'database.db')
  },
  useNullAsDefault: true
});

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win;

function createWindow() {
  // Create the browser window.
  win = new BrowserWindow({
    width: 1200,
    height: 850,
    title: 'Desktop Dictionary'
  });

  const startUrl =
    process.env.ELECTRON_START_URL ||
    url.format({
      pathname: path.join(__dirname, '/../build/index.html'),
      protocol: 'file:',
      slashes: true
    });
  win.loadURL(startUrl);

  // Emitted when the window is closed.
  win.on('closed', () => {
    win = null;
  });

  const mainMenu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(mainMenu);
}

app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (win === null) {
    createWindow();
  }
});

ipcMain.on('allEnToBnsearching:start', (event, word) => {
  const wordToSearch = word.toUpperCase();
  let englishWords;
  let banglaWords = [];
  knex
    .select('*')
    .from('eng')
    .where('word', 'like', `${wordToSearch}%`)
    .limit(6)
    .then(function(englishRows) {
      englishWords = englishRows;
      return englishRows;
    })
    .then(function(english) {
      return Promise.all(
        english.map(singleItem =>
          knex
            .select('*')
            .from('other')
            .where({ serial: `${singleItem.serial}` })
            .then(function(banglaRow) {
              banglaWords.push(...banglaRow);
              return banglaRow;
            })
            .catch(function(error) {
              console.error(error);
            })
        )
      );
    })
    .then(() => {
      win.webContents.send('searching:end', {
        english: englishWords,
        other: banglaWords
      });
    })
    .catch(function(error) {
      console.error(error);
    });
});

ipcMain.on('exactEnToBnsearching:start', (event, word) => {
  const wordToSearch = word.toUpperCase();
  let englishWords;
  let banglaWords = [];
  knex
    .select('*')
    .from('eng')
    .where({ word: `${wordToSearch}` })
    .limit(6)
    .then(function(englishRows) {
      englishWords = englishRows;
      return englishRows;
    })
    .then(function(english) {
      return Promise.all(
        english.map(singleItem =>
          knex
            .select('*')
            .from('other')
            .where({ serial: `${singleItem.serial}` })
            .then(function(banglaRow) {
              banglaWords.push(...banglaRow);
              return banglaRow;
            })
            .catch(function(error) {
              console.error(error);
            })
        )
      );
    })
    .then(() => {
      win.webContents.send('searching:end', {
        english: englishWords,
        other: banglaWords
      });
    })
    .catch(function(error) {
      console.error(error);
    });
});

ipcMain.on('allBnToEnsearching:start', (event, word) => {
  let englishWords = [];
  let banglaWords;
  knex
    .select('*')
    .from('other')
    .where('word', 'like', `${word}%`)
    .limit(6)
    .then(function(banglaRows) {
      banglaWords = banglaRows;
      return banglaRows;
    })
    .then(function(bangla) {
      return Promise.all(
        bangla.map(singleItem =>
          knex
            .select('*')
            .from('eng')
            .where({ serial: `${singleItem.serial}` })
            .then(function(englishRow) {
              englishWords.push(...englishRow);
              return englishRow;
            })
            .catch(function(error) {
              console.error(error);
            })
        )
      );
    })
    .then(() => {
      win.webContents.send('searching:end', {
        english: englishWords,
        other: banglaWords
      });
    })
    .catch(function(error) {
      console.error(error);
    });
});

ipcMain.on('exactBnToEnsearching:start', (event, word) => {
  let englishWords = [];
  let banglaWords;
  knex
    .select('*')
    .from('other')
    .where({ word: `${word}` })
    .limit(6)
    .then(function(banglaRows) {
      banglaWords = banglaRows;
      return banglaRows;
    })
    .then(function(bangla) {
      return Promise.all(
        bangla.map(singleItem =>
          knex
            .select('*')
            .from('eng')
            .where({ serial: `${singleItem.serial}` })
            .then(function(englishRow) {
              englishWords.push(...englishRow);
              return englishRow;
            })
            .catch(function(error) {
              console.error(error);
            })
        )
      );
    })
    .then(() => {
      win.webContents.send('searching:end', {
        english: englishWords,
        other: banglaWords
      });
    })
    .catch(function(error) {
      console.error(error);
    });
});

// Menu Options
const menuTemplate = [
  {
    label: 'Options',

    submenu: [
      { role: 'reload' },
      { role: 'resetzoom' },
      { role: 'zoomin' },
      { role: 'zoomout' },
      {
        label: 'Toggle Developer Tools',
        accelerator:
          process.platform === 'darwin' ? 'Command+Alt+I' : 'Ctrl+Shift+I',
        click(item, focusedWindow) {
          focusedWindow.toggleDevTools();
        }
      },
      {
        label: 'Quit',
        accelerator: process.platform === 'darwin' ? 'Command+Q' : 'Ctrl+Q',
        click() {
          app.quit();
        }
      }
    ]
  }
];
