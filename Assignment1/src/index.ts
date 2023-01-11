// import figlet from 'figlet';
import * as fs from 'fs';
import * as path from 'path';
import inquirer, { QuestionCollection } from 'inquirer';
import { parse } from 'csv-parse';
import { Parser } from 'json2csv';
import { Author, Book, Magazines } from './types';
import { printTable, Table } from 'console-table-printer';

let allBooksAndMag: (Magazines & {
  description: string;
})[] = [];

let newBooks: any[] = [];

async function csvToJSON(filePath: string): Promise<any[]> {
  const csvFilePath = path.resolve('src', filePath);

  const fileContent = fs.readFileSync(csvFilePath, { encoding: 'utf-8' });
  const results: any[] = [];

  return new Promise((res, rej) => {
    parse(
      fileContent,
      {
        delimiter: ';',
        columns: true,
      },
      (error, result) => {
        if (error) {
          rej(error);
        }

        res(result);
      }
    );
  });
}

async function printBooksAndMagazines() {
  if (allBooksAndMag.length === 0) {
    console.log('NO DATA');
    return;
  }
  console.log(allBooksAndMag);
}

export function mergeBookAndMagazines(books: Book[], magazines: Magazines[]) {
  // TODO handle log dis
  const booksObj = books.map((it) =>
    Object.assign(it, { publishedAt: '-', description: '-' })
  );
  const magazinesObj = magazines.map((it) =>
    Object.assign(it, { description: '-' })
  );
  const mergedObj = magazinesObj.concat(booksObj);

  // TODO handle empty
  return mergedObj.sort((a, b) => {
    var title1 = a.title ? a.title.toUpperCase() : null;
    var title2 = b.title ? b.title.toUpperCase() : null;
    if (!title1 || title1 < (title2 || !title2)) {
      return -1;
    } else if (!title2 || title1 > title2) {
      return 1;
    }
    return 0;
  });
}

async function saveDataToFile() {
  if (newBooks.length === 0) {
    console.log('no data to save');
    return;
  }
  const opts = { fields: Object.keys(newBooks[0]) };
  const CSVconverter = new Parser(opts);
  const fileName = `books_and_magazines_${new Date().getTime()}.csv`;
  fs.writeFileSync(fileName, CSVconverter.parse(newBooks));
  console.log(`file saved successfully at ${fileName}`);
  newBooks = [];
}

async function askQuestion(questions: QuestionCollection<any>) {
  const result = await new Promise((res, rej) => {
    inquirer.prompt(questions).then((answers) => {
      res(answers.value);
    });
  });

  return result as string;
}

const questions = [
  {
    type: 'input',
    name: 'value',
    message: `
    PRESS 
    [1] get book and magazine list
    [2] search book by ISBN
    [3] search book by author email
    [4] add new book
    [5] export added  book to new files
    \n
    `,
  },
];

function ask() {
  inquirer.prompt(questions).then(async (answers) => {
    switch (answers.value) {
      case '1': {
        printBooksAndMagazines();
        ask();
        break;
      }
      case '2': {
        inquirer
          .prompt([
            { type: 'input', name: 'value', message: `enter ISBN number` },
          ])
          .then((ISBN) => {
            console.log(allBooksAndMag.filter((it) => it.isbn === ISBN.value));
            ask();
          });
        break;
      }
      case '3': {
        inquirer
          .prompt([
            {
              type: 'input',
              name: 'value',
              message: `enter Authors email number`,
            },
          ])
          .then((email) => {
            console.log(
              allBooksAndMag.filter((it) =>
                it.authors.split(',').includes(email.value)
              )
            );
            ask();
          });
        break;
      }
      case '4': {
        const data: Partial<
          Magazines & {
            description: string;
          }
        > = {};

        data.title = await askQuestion({
          type: 'input',
          name: 'value',
          message: `enter title`,
        });

        data.authors = await askQuestion({
          type: 'input',
          name: 'value',
          message: `enter author`,
        });

        data.isbn = await askQuestion({
          type: 'input',
          name: 'value',
          message: `enter isbn`,
        });

        data.publishedAt = await askQuestion({
          type: 'input',
          name: 'value',
          message: `enter publishedAt`,
        });

        data.description = await askQuestion({
          type: 'input',
          name: 'value',
          message: `enter description`,
        });
        newBooks.push(data);
        ask();
        break;
      }
      case '5': {
        saveDataToFile();
        ask();
        break;
      }
      case 'q': {
        process.exit();
      }
      default: {
        console.log('Invalid response');
        ask();
      }
    }
  });
}

async function main() {
  const books: any[] = await csvToJSON('./files/books.csv');
  const authors: Author[] = await csvToJSON('./files/authors.csv');
  const magazines: Magazines[] = await csvToJSON('./files/magazines.csv');

  allBooksAndMag = mergeBookAndMagazines(books, magazines);

  ask();
}

main();
