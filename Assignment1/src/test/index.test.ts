import {mergeBookAndMagazines} from '..'
test('mergeBookAndMagazines', () => {
  const books = [
    { isbn: '123213', title: 'Book 1', authors: 'Author 1',description: ""  },
    { isbn: '123214', title: 'Book 2', authors: 'Author 2',description: "" },
  ];
  const magazines = [
    { isbn: '123215', title: 'Mag 1', publishedAt: 'January' ,authors: 'Author 1'},
    { isbn: '123216', title: 'Mag 2', publishedAt: 'February',authors: 'Author 2' },
  ];

  const expectedResult = [
    { isbn: '123213', title: 'Book 2', authors: 'Author 2', publishedAt: '-', description: '-' },
    { isbn: '123214', title: 'Book 1', authors: 'Author 1', publishedAt: '-', description: '-' },
    { isbn: '123215', title: 'Mag 2', publishedAt: 'February', description: '-' },
    { isbn: '123216', title: 'Mag 1', publishedAt: 'January', description: '-' },
  ];

  expect(mergeBookAndMagazines(books, magazines)).toEqual(expectedResult);
});

