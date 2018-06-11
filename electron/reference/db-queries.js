let englishWords;
let banglaWords = [];
knex
  .select('*')
  .from('eng')
  .where('word', 'like', `some%`)
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
    console.log('searching:end', { englishWords, banglaWords });
  })
  .catch(function(error) {
    console.error(error);
  });
