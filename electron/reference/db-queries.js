//===================================================
// Database Query Example
//===================================================
// let englishWords;
// let banglaWords = [];
// knex
//   .select('*')
//   .from('eng')
//   .where('word', 'like', `some%`)
//   .limit(6)
//   .then(function(englishRows) {
//     englishWords = englishRows;
//     return englishRows;
//   })
//   .then(function(english) {
//     return Promise.all(
//       english.map(singleItem =>
//         knex
//           .select('*')
//           .from('other')
//           .where({ serial: `${singleItem.serial}` })
//           .then(function(banglaRow) {
//             banglaWords.push(...banglaRow);
//             return banglaRow;
//           })
//           .catch(function(error) {
//             console.error(error);
//           })
//       )
//     );
//   })
//   .then(() => {
//     console.log('searching:end', { englishWords, banglaWords });
//   })
//   .catch(function(error) {
//     console.error(error);
//   });

//===================================================
// Windows Build Instruction
//===================================================

// 1. Go to a window pc

// 2. set up environment for Node.js development

// 3. npm install --global --production windows-build-tools
//    For more details - https://www.npmjs.com/package/windows-build-tools

// 4. Add this to the script section of package.json
//    "postinstall": "electron-builder install-app-deps"
//    or manually run rebuild via adding this,
//    "rebuild": "electron-rebuild -f -w sqlite3",

// 5. Check node_modules/sqlite3/lib/binding folder for electron sqlite3 offline build for windows have or not

// 6. Keep the database file seperate via adding below script in the package.json build{} section
//     "extraResources": [
//       "./electron/database.db"
//     ],
//     "buildDependenciesFromSource": true,

// 7. [Mainly check you DATABASE path] you can experiment the path via,
//     => process.resourcesPath
//     => __dirname
//     => in renderer process like,
//        const app = window.require('electron').remote.app
//        console.log('=>', app.getAppPath())

//     A working example that used in this app,

//     var knex = require('knex')({
//       client: 'sqlite3',
//       connection: {
//         filename: path.join(process.resourcesPath, '/electron/database.db')
//       },
//       useNullAsDefault: true
//     });
