function makeNotesArray() {
    return [
        {
            id: 1,
            name: 'First test note!',
            content: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Natus consequuntur deserunt commodi, nobis qui inventore corrupti iusto aliquid debitis unde non.Adipisci, pariatur.Molestiae, libero esse hic adipisci autem neque ?',
            date_created: '2029-01-22T16:28:32.615Z',
            folder: 2
        },
        {
            id: 2,
            name: 'test note!',
            content: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Natus consequuntur deserunt commodi, nobis qui inventore corrupti iusto aliquid debitis unde non.Adipisci, pariatur.Molestiae, libero esse hic adipisci autem neque ?',
            date_created: '2029-01-22T16:28:32.615Z',
            folder: 1
        },
        {
            id: 3,
            name: 'test note 3!',
            content: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Natus consequuntur deserunt commodi, nobis qui inventore corrupti iusto aliquid debitis unde non.Adipisci, pariatur.Molestiae, libero esse hic adipisci autem neque ?',
            date_created: '2029-01-22T16:28:32.615Z',
            folder: 1
        }
    ]
};
function makeMaliciousNote() {
    const maliciousNote = {
        id: 911,
        date_published: new Date().toISOString(),
        title: 'Naughty naughty very naughty <script>alert("xss");</script>',
        content: `Bad image <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">. But not <strong>all</strong> bad.`
      }
      const expectedNote = {
        ...maliciousNote,
        title: 'Naughty naughty very naughty &lt;script&gt;alert(\"xss\");&lt;/script&gt;',
        content: `Bad image <img src="https://url.to.file.which/does-not.exist">. But not <strong>all</strong> bad.`
      }
      return {
        maliciousNote,
        expectedNote,
      }

};

module.exports = { makeNotesArray, makeMaliciousNote };