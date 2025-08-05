
import type { Celebrity } from './types';

/**
 * An array of celebrity objects used to populate the game.
 *
 * How to define relationships:
 *
 * 1.  **Couples:** To create a couple, add a `partner` field to both celebrity objects,
 *     making sure the name in the `partner` field exactly matches the `name` of the other celebrity.
 *     Example:
 *     { name: { en: 'Justin Bieber', ... }, partner: { en: 'Hailey Bieber', ... } }
 *     { name: { en: 'Hailey Bieber', ... }, partner: { en: 'Justin Bieber', ... } }
 *
 * 2.  **Exes:** To define an ex-relationship, add the ex's name to the `exes` array. This
 *     is a one-way definition; you only need to add it to one of the celebrities.
 *     Example:
 *     { name: { en: 'Justin Bieber', ... }, exes: [{ en: 'Selena Gomez', ... }] }
 *
 * 3.  **Localization:** The `name`, `partner`, and `exes` fields can be a simple string
 *     or an object with `en` and `ru` keys for multi-language support.
 *
 * 4.  **Fillers:** Celebrities without a `partner` or `exes` field will act as fillers in the game.
 */
export const celebritiesData = [
  { id: '1', type: 'celebrity', name: { en: 'Taylor Swift', ru: 'Тейлор Свифт' }, imageUrl: '/images/celebrities/Taylor Swift.png', partner: { en: 'Travis Kelce', ru: 'Трэвис Келси' }, exes: [{ en: 'Tom Hiddleston', ru: 'Том Хиддлстон' }, { en: 'Jake Gyllenhaal', ru: 'Джейк Джилленхол' }] },
  { id: '2', type: 'celebrity', name: { en: 'Travis Kelce', ru: 'Трэвис Келси' }, imageUrl: '/images/celebrities/Travis Kelce.png', partner: { en: 'Taylor Swift', ru: 'Тейлор Свифт' }, exes: [] },
  { id: '3', type: 'celebrity', name: { en: 'Ashton Kutcher', ru: 'Эштон Кутчер' }, imageUrl: '/images/celebrities/Ashton Kutcher.png', partner: { en: 'Mila Kunis', ru: 'Мила Кунис' }, exes: [{ en: 'Demi Moore', ru: 'Деми Мур' }, { en: 'Brittany Murphy', ru: 'Бриттани Мёрфи' }] },
  { id: '4', type: 'celebrity', name: { en: 'Mila Kunis', ru: 'Мила Кунис' }, imageUrl: '/images/celebrities/Mila Kunis.png', partner: { en: 'Ashton Kutcher', ru: 'Эштон Кутчер' }, exes: [{ en: 'Macaulay Culkin', ru: 'Макаulay Калкин' }] },
  { id: '5', type: 'celebrity', name: { en: 'Priyanka Chopra', ru: 'Приянка Чопра' }, imageUrl: '/images/celebrities/Priyanka Chopra.png', partner: { en: 'Nick Jonas', ru: 'Ник Джонас' }, exes: [] },
  { id: '6', type: 'celebrity', name: { en: 'Nick Jonas', ru: 'Ник Джонас' }, imageUrl: '/images/celebrities/Nick Jonas.png', partner: { en: 'Priyanka Chopra', ru: 'Приянка Чопра' }, exes: [{ en: 'Miley Cyrus', ru: 'Майли Сайрус' }, { en: 'Selena Gomez', ru: 'Селена Гомес' }] },
  { id: '7', type: 'celebrity', name: { en: 'Beyoncé', ru: 'Бейонсе' }, imageUrl: '/images/celebrities/Beyoncé.png', partner: { en: 'Jay-Z', ru: 'Джей-Зи' }, exes: [] },
  { id: '8', type: 'celebrity', name: { en: 'Jay-Z', ru: 'Джей-Зи' }, imageUrl: '/images/celebrities/Jay-Z.png', partner: { en: 'Beyoncé', ru: 'Бейонсе' }, exes: [] },
  { id: '9', type: 'celebrity', name: { en: 'Bianca Censori', ru: 'Бьянка Цензори' }, imageUrl: '/images/celebrities/Bianca Censori.png', partner: { en: 'Kanye West', ru: 'Канье Уэст' }, exes: [{ en: 'Kim Kardashian', ru: 'Ким Кардашьян' }] },
  { id: '10', type: 'celebrity', name: { en: 'Kanye West', ru: 'Канье Уэст' }, imageUrl: '/images/celebrities/Kanye West.png', partner: { en: 'Bianca Censori', ru: 'Бьянка Цензори' }, exes: [{ en: 'Amber Rose', ru: 'Эмбер Роуз' }] },
  { id: '11', type: 'celebrity', name: { en: 'Joe Jonas', ru: 'Джо Джонас' }, imageUrl: '/images/celebrities/Joe Jonas.png', partner: { en: 'Sophie Turner', ru: 'Софи Тёрнер' }, exes: [{ en: 'Taylor Swift', ru: 'Тейлор Свифт' }, { en: 'Gigi Hadid', ru: 'Джиджи Хадид' }] },
  { id: '12', type: 'celebrity', name: { en: 'Sophie Turner', ru: 'Софи Тёрнер' }, imageUrl: '/images/celebrities/Sophie Turner.png', partner: { en: 'Joe Jonas', ru: 'Джо Джонас' }, exes: [] },
  { id: '13', type: 'celebrity', name: { en: 'Rihanna', ru: 'Рианна' }, imageUrl: '/images/celebrities/Rihanna.png', partner: { en: 'ASAP Rocky', ru: 'ASAP Рокки' }, exes: [{ en: 'Chris Brown', ru: 'Крис Браун' }, { en: 'Drake', ru: 'Дрейк' }] },
  { id: '14', type: 'celebrity', name: { en: 'ASAP Rocky', ru: 'ASAP Рокки' }, imageUrl: '/images/celebrities/ASAP Rocky.png', partner: { en: 'Rihanna', ru: 'Рианна' }, exes: [] },
  { id: '15', type: 'celebrity', name: { en: 'Brad Pitt', ru: 'Брэд Питт' }, imageUrl: '/images/celebrities/Brad Pitt.png', partner: undefined, exes: [{ en: 'Angelina Jolie', ru: 'Анджелина Джоли' }, { en: 'Gwyneth Paltrow', ru: 'Гвинет Пэлтроу' }, { en: 'Jennifer Aniston', ru: 'Дженнифер Энистон' }] },
  { id: '16', type: 'celebrity', name: { en: 'Justin Bieber', ru: 'Джастин Бибер' }, imageUrl: '/images/celebrities/Justin Bieber.png', partner: { en: 'Hailey Bieber', ru: 'Хейли Бибер' }, exes: [{ en: 'Selena Gomez', ru: 'Селена Гомес' }] },
  { id: '17', type: 'celebrity', name: { en: 'Hailey Bieber', ru: 'Хейли Бибер' }, imageUrl: '/images/celebrities/Hailey Bieber.png', partner: { en: 'Justin Bieber', ru: 'Джастин Бибер' }, exes: [] },
  { id: '18', type: 'celebrity', name: { en: 'Ariana Grande', ru: 'Ариана Гранде' }, imageUrl: '/images/celebrities/Ariana Grande.png', partner: { en: 'Dalton Gomez', ru: 'Далтон Гомес' }, exes: [{ en: 'Pete Davidson', ru: 'Пит Дэвидсон' }] },
  { id: '19', type: 'celebrity', name: { en: 'Dalton Gomez', ru: 'Далтон Гомес' }, imageUrl: '/images/celebrities/Dalton Gomez.png', partner: { en: 'Ariana Grande', ru: 'Ариана Гранде' }, exes: [] },
  { id: '20', type: 'celebrity', name: { en: 'Zendaya', ru: 'Зендея' }, imageUrl: '/images/celebrities/Zendaya.png', partner: { en: 'Tom Holland', ru: 'Том Холланд' }, exes: [] },
  { id: '21', type: 'celebrity', name: { en: 'Tom Holland', ru: 'Том Холланд' }, imageUrl: '/images/celebrities/Tom Holland.png', partner: { en: 'Zendaya', ru: 'Зендея' }, exes: [] },
  { id: '22', type: 'celebrity', name: { en: 'Jennifer Lawrence', ru: 'Дженнифер Лоуренс' }, imageUrl: '/images/celebrities/Jennifer Lawrence.png', partner: { en: 'Cooke Maroney', ru: 'Кук Марони' }, exes: [{ en: 'Nicholas Hoult', ru: 'Николас Холт' }, { en: 'Darren Aronofsky', ru: 'Даррен Аронофски' }] },
  { id: '23', type: 'celebrity', name: { en: 'Cooke Maroney', ru: 'Кук Марони' }, imageUrl: '/images/celebrities/Cooke Maroney.png', partner: { en: 'Jennifer Lawrence', ru: 'Дженнифер Лоуренс' }, exes: [] },
  { id: '24', type: 'celebrity', name: { en: 'Elon Musk', ru: 'Илон Маск' }, imageUrl: '/images/celebrities/Elon Musk.png', partner: undefined, exes: [{ en: 'Amber Heard', ru: 'Эмбер Херд' }, { en: 'Talulah Riley', ru: 'Талула Райли' }] },
  { id: '25', type: 'celebrity', name: { en: 'Machine Gun Kelly', ru: 'Машин Ган Келли' }, imageUrl: '/images/celebrities/Machine Gun Kelly.png', partner: { en: 'Megan Fox', ru: 'Меган Фокс' }, exes: [] },
  { id: '26', type: 'celebrity', name: { en: 'Megan Fox', ru: 'Меган Фокс' }, imageUrl: '/images/celebrities/Megan Fox.png', partner: { en: 'Machine Gun Kelly', ru: 'Машин Ган Келли' }, exes: [] },
  { id: '27', type: 'celebrity', name: { en: 'Blake Lively', ru: 'Блейк Лайвли' }, imageUrl: '/images/celebrities/Blake Lively.png', partner: { en: 'Ryan Reynolds', ru: 'Райан Рейнольдс' }, exes: [{ en: 'Kelly Blatz', ru: 'Келли Блатц' }] },
  { id: '28', type: 'celebrity', name: { en: 'Ryan Reynolds', ru: 'Райан Рейнольдс' }, imageUrl: '/images/celebrities/Ryan Reynolds.png', partner: { en: 'Blake Lively', ru: 'Блейк Лайвли' }, exes: [{ en: 'Scarlett Johansson', ru: 'Скарлетт Йоханссон' }] },
  { id: '29', type: 'celebrity', name: { en: 'Ksenia Sobchak', ru: 'Ксения Собчак' }, imageUrl: '/images/celebrities/Ksenia Sobchak.png', partner: { en: 'Konstantin Bogomolov', ru: 'Константин Богомолов' }, exes: [{ en: 'Maksim Vitorgan', ru: 'Максим Виторган' }] },
  { id: '30', type: 'celebrity', name: { en: 'Konstantin Bogomolov', ru: 'Константин Богомолов' }, imageUrl: '/images/celebrities/Konstantin Bogomolov.png', partner: { en: 'Ksenia Sobchak', ru: 'Ксения Собчак' }, exes: [{ en: 'Darya Moroz', ru: 'Дарья Мороз' }] },
  { id: '31', type: 'celebrity', name: { en: 'Pavel Priluchny', ru: 'Павел Прилучный' }, imageUrl: '/images/celebrities/Pavel Priluchny.png', partner: { en: 'Zepyur Brutyan', ru: 'Зепюр Брутян' }, exes: [{ en: 'Agata Muceniece', ru: 'Агата Муцениеце' }] },
  { id: '32', type: 'celebrity', name: { en: 'Zepyur Brutyan', ru: 'Зепюр Брутян' }, imageUrl: '/images/celebrities/Zepyur Brutyan.png', partner: { en: 'Pavel Priluchny', ru: 'Павел Прилучный' }, exes: [] },
  { id: '33', type: 'celebrity', name: { en: 'Alexander Petrov', ru: 'Александр Петров' }, imageUrl: '/images/celebrities/Alexander Petrov.png', partner: { en: 'Stasya Miloslavskaya', ru: 'Стася Милославская' }, exes: [{ en: 'Irina Starshenbaum', ru: 'Ирина Старшенбаум' }] },
  { id: '34', type: 'celebrity', name: { en: 'Stasya Miloslavskaya', ru: 'Стася Милославская' }, imageUrl: '/images/celebrities/Stasya Miloslavskaya.png', partner: { en: 'Alexander Petrov', ru: 'Александр Петров' }, exes: [] },
  { id: '35', type: 'celebrity', name: { en: 'Harry Styles', ru: 'Гарри Стайлс' }, imageUrl: '/images/celebrities/Harry Styles.png', partner: undefined, exes: [{ en: 'Taylor Swift', ru: 'Тейлор Свифт' }, { en: 'Camille Rowe', ru: 'Камилла Роу' }, { en: 'Olivia Wilde', ru: 'Оливия Уайлд' }] },
  { id: '36', type: 'celebrity', name: { en: 'Bella Hadid', ru: 'Белла Хадид' }, imageUrl: '/images/celebrities/Bella Hadid.png', partner: undefined, exes: [{ en: 'The Weeknd', ru: 'The Weeknd' }] },
  { id: '37', type: 'celebrity', name: { en: 'Selena Gomez', ru: 'Селена Гомес' }, imageUrl: '/images/celebrities/Selena Gomez.png', partner: { en: 'Benny Blanco', ru: 'Бенни Бланко' }, exes: [{ en: 'Justin Bieber', ru: 'Джастин Бибер' }] },
  { id: '38', type: 'celebrity', name: { en: 'Benny Blanco', ru: 'Бенни Бланко' }, imageUrl: '/images/celebrities/Benny Blanco.png', partner: { en: 'Selena Gomez', ru: 'Селена Гомес' }, exes: [] },
  { id: '39', type: 'celebrity', name: { en: 'Pete Davidson', ru: 'Пит Дэвидсон' }, imageUrl: '/images/celebrities/Pete Davidson.png', partner: undefined, exes: [{ en: 'Kim Kardashian', ru: 'Ким Кардашьян' }, { en: 'Ariana Grande', ru: 'Ариана Гранде' }] },
  { id: '40', type: 'celebrity', name: { en: 'Timothée Chalamet', ru: 'Тимоти Шаламе' }, imageUrl: '/images/celebrities/Timothée Chalamet.png', partner: { en: 'Kylie Jenner', ru: 'Кайли Дженнер' }, exes: [{ en: 'Lily-Rose Depp', ru: 'Лили-Роуз Депп' }] },
  { id: '41', type: 'celebrity', name: { en: 'Kylie Jenner', ru: 'Кайли Дженнер' }, imageUrl: '/images/celebrities/Kylie Jenner.png', partner: { en: 'Timothée Chalamet', ru: 'Тимоти Шаламе' }, exes: [{ en: 'Travis Scott', ru: 'Трэвис Скотт' }] },
  { id: '42', type: 'celebrity', name: { en: 'Robert Pattinson', ru: 'Роберт Паттинсон' }, imageUrl: '/images/celebrities/Robert Pattinson.png', partner: { en: 'Suki Waterhouse', ru: 'Сьюки Уотерхаус' }, exes: [{ en: 'Kristen Stewart', ru: 'Кристен Стюарт' }] },
  { id: '43', type: 'celebrity', name: { en: 'Suki Waterhouse', ru: 'Сьюки Уотерхаус' }, imageUrl: '/images/celebrities/Suki Waterhouse.png', partner: { en: 'Robert Pattinson', ru: 'Роберт Паттинсон' }, exes: [] },
  { id: '44', type: 'celebrity', name: { en: 'Blake Shelton', ru: 'Блейк Шелтон' }, imageUrl: '/images/celebrities/Blake Shelton.png', partner: { en: 'Gwen Stefani', ru: 'Гвен Стефани' }, exes: [] },
  { id: '45', type: 'celebrity', name: { en: 'Gwen Stefani', ru: 'Гвен Стефани' }, imageUrl: '/images/celebrities/Gwen Stefani.png', partner: { en: 'Blake Shelton', ru: 'Блейк Шелтон' }, exes: [] },
  { id: '46', type: 'celebrity', name: { en: 'Tom Cruise', ru: 'Том Круз' }, imageUrl: '/images/celebrities/Tom Cruise.png', partner: { en: 'Katie Holmes', ru: 'Кэти Холмс' }, exes: [{ en: 'Nicole Kidman', ru: 'Николь Кидман' }] },
  { id: '47', type: 'celebrity', name: { en: 'Katie Holmes', ru: 'Кэти Холмс' }, imageUrl: '/images/celebrities/Katie Holmes.png', partner: { en: 'Tom Cruise', ru: 'Том Круз' }, exes: [] },
  { id: '48', type: 'celebrity', name: { en: 'Cristiano Ronaldo', ru: 'Криштиану Роналду' }, imageUrl: '/images/celebrities/Cristiano Ronaldo.png', partner: { en: 'Georgina Rodriguez', ru: 'Джорджина Родригес' }, exes: [{ en: 'Irina Shayk', ru: 'Ирина Шейк' }] },
  { id: '49', type: 'celebrity', name: { en: 'Georgina Rodriguez', ru: 'Джорджина Родригес' }, imageUrl: '/images/celebrities/Georgina Rodriguez.png', partner: { en: 'Cristiano Ronaldo', ru: 'Криштиану Роналду' }, exes: [] },
  { id: '50', type: 'celebrity', name: { en: 'Rita Ora', ru: 'Рита Ора' }, imageUrl: '/images/celebrities/Rita Ora.png', partner: { en: 'Taika Waititi', ru: 'Тайка Вайтити' }, exes: [{ en: 'Calvin Harris', ru: 'Келвин Харрис' }] },
  { id: '51', type: 'celebrity', name: { en: 'Taika Waititi', ru: 'Тайка Вайтити' }, imageUrl: '/images/celebrities/Taika Waititi.png', partner: { en: 'Rita Ora', ru: 'Рита Ора' }, exes: [] },
  { id: '52', type: 'celebrity', name: { en: 'Ben Affleck', ru: 'Бен Аффлек' }, imageUrl: '/images/celebrities/Ben Affleck.png', partner: { en: 'Jennifer Lopez', ru: 'Дженнифер Лопес' }, exes: [{ en: 'Jennifer Garner', ru: 'Дженнифер Гарнер' }, { en: 'Ana de Armas', ru: 'Ана де Армас' }] },
  { id: '53', type: 'celebrity', name: { en: 'Jennifer Lopez', ru: 'Дженнифер Лопес' }, imageUrl: '/images/celebrities/Jennifer Lopez.png', partner: { en: 'Ben Affleck', ru: 'Бен Аффлек' }, exes: [] },
  { id: '54', type: 'celebrity', name: { en: 'Gigi Hadid', ru: 'Джиджи Хадид' }, imageUrl: '/images/celebrities/Gigi Hadid.png', partner: { en: 'Bradley Cooper', ru: 'Брэдли Купер' }, exes: [{ en: 'Zayn Malik', ru: 'Зейн Малик' }, { en: 'Leonardo DiCaprio', ru: 'Леонардо ДиКаприо' }] },
  { id: '55', type: 'celebrity', name: { en: 'Bradley Cooper', ru: 'Брэдли Купер' }, imageUrl: '/images/celebrities/Bradley Cooper.png', partner: { en: 'Gigi Hadid', ru: 'Джиджи Хадид' }, exes: [{ en: 'Irina Shayk', ru: 'Ирина Шейк' }] },
  { id: '56', type: 'celebrity', name: { en: 'Emily Blunt', ru: 'Эмили Блант' }, imageUrl: '/images/celebrities/Emily Blunt.png', partner: { en: 'John Krasinski', ru: 'Джон Красински' }, exes: [{ en: 'Michael Bublé', ru: 'Майкл Бубле' }] },
  { id: '57', type: 'celebrity', name: { en: 'John Krasinski', ru: 'Джон Красински' }, imageUrl: '/images/celebrities/John Krasinski.png', partner: { en: 'Emily Blunt', ru: 'Эмили Блант' }, exes: [] },
  { id: '58', type: 'celebrity', name: { en: 'Tom Hiddleston', ru: 'Том Хиддлстон' }, imageUrl: '/images/celebrities/Tom Hiddleston.png', partner: undefined, exes: [] },
  { id: '59', type: 'celebrity', name: { en: 'Jake Gyllenhaal', ru: 'Джейк Джилленхол' }, imageUrl: '/images/celebrities/Jake Gyllenhaal.png', partner: undefined, exes: [] },
  { id: '60', type: 'celebrity', name: { en: 'Demi Moore', ru: 'Деми Мур' }, imageUrl: '/images/celebrities/Demi Moore.png', partner: undefined, exes: [] },
  { id: '61', type: 'celebrity', name: { en: 'Brittany Murphy', ru: 'Бриттани Мёрфи' }, imageUrl: '/images/celebrities/Brittany Murphy.png', partner: undefined, exes: [] },
  { id: '62', type: 'celebrity', name: { en: 'Macaulay Culkin', ru: 'Маккалей Калкин' }, imageUrl: '/images/celebrities/Macaulay Culkin.png', partner: undefined, exes: [] },
  { id: '63', type: 'celebrity', name: { en: 'Miley Cyrus', ru: 'Майли Сайрус' }, imageUrl: '/images/celebrities/Miley Cyrus.png', partner: undefined, exes: [] },
  { id: '64', type: 'celebrity', name: { en: 'Kim Kardashian', ru: 'Ким Кардашьян' }, imageUrl: '/images/celebrities/Kim Kardashian.png', partner: undefined, exes: [] },
  { id: '65', type: 'celebrity', name: { en: 'Amber Rose', ru: 'Эмбер Роуз' }, imageUrl: '/images/celebrities/Amber Rose.png', partner: undefined, exes: [] },
  { id: '66', type: 'celebrity', name: { en: 'Chris Brown', ru: 'Крис Браун' }, imageUrl: '/images/celebrities/Chris Brown.png', partner: undefined, exes: [] },
  { id: '67', type: 'celebrity', name: { en: 'Drake', ru: 'Дрейк' }, imageUrl: '/images/celebrities/Drake.png', partner: undefined, exes: [] },
  { id: '68', type: 'celebrity', name: { en: 'Angelina Jolie', ru: 'Анджелина Джоли' }, imageUrl: '/images/celebrities/Angelina Jolie.png', partner: undefined, exes: [] },
  { id: '69', type: 'celebrity', name: { en: 'Gwyneth Paltrow', ru: 'Гвинет Пэлтроу' }, imageUrl: '/images/celebrities/Gwyneth Paltrow.png', partner: undefined, exes: [] },
  { id: '70', type: 'celebrity', name: { en: 'Jennifer Aniston', ru: 'Дженнифер Энистон' }, imageUrl: '/images/celebrities/Jennifer Aniston.png', partner: undefined, exes: [] },
  { id: '71', type: 'celebrity', name: { en: 'Nicholas Hoult', ru: 'Николас Холт' }, imageUrl: '/images/celebrities/Nicholas Hoult.png', partner: undefined, exes: [] },
  { id: '72', type: 'celebrity', name: { en: 'Darren Aronofsky', ru: 'Даррен Аронофски' }, imageUrl: '/images/celebrities/Darren Aronofsky.png', partner: undefined, exes: [] },
  { id: '73', type: 'celebrity', name: { en: 'Amber Heard', ru: 'Эмбер Херд' }, imageUrl: '/images/celebrities/Amber Heard.png', partner: undefined, exes: [] },
  { id: '74', type: 'celebrity', name: { en: 'Talulah Riley', ru: 'Талула Райли' }, imageUrl: '/images/celebrities/Talulah Riley.png', partner: undefined, exes: [] },
  { id: '75', type: 'celebrity', name: { en: 'Kelly Blatz', ru: 'Келли Блатц' }, imageUrl: '/images/celebrities/Kelly Blatz.png', partner: undefined, exes: [] },
  { id: '76', type: 'celebrity', name: { en: 'Scarlett Johansson', ru: 'Скарлетт Йоханссон' }, imageUrl: '/images/celebrities/Scarlett Johansson.png', partner: undefined, exes: [] },
  { id: '77', type: 'celebrity', name: { en: 'Maksim Vitorgan', ru: 'Максим Виторган' }, imageUrl: '/images/celebrities/Maksim Vitorgan.png', partner: undefined, exes: [] },
  { id: '78', type: 'celebrity', name: { en: 'Darya Moroz', ru: 'Дарья Мороз' }, imageUrl: '/images/celebrities/Darya Moroz.png', partner: undefined, exes: [] },
  { id: '79', type: 'celebrity', name: { en: 'Agata Muceniece', ru: 'Агата Муцениеце' }, imageUrl: '/images/celebrities/Agata Muceniece.png', partner: { en: 'Petr Dranga', ru: 'Петр Дранга' }, exes: [] },
  { id: '80', type: 'celebrity', name: { en: 'Irina Starshenbaum', ru: 'Ирина Старшенбаум' }, imageUrl: '/images/celebrities/Irina Starshenbaum.png', partner: undefined, exes: [] },
  { id: '81', type: 'celebrity', name: { en: 'Camille Rowe', ru: 'Камилла Роу' }, imageUrl: '/images/celebrities/Camille Rowe.png', partner: undefined, exes: [] },
  { id: '82', type: 'celebrity', name: { en: 'Olivia Wilde', ru: 'Оливия Уайлд' }, imageUrl: '/images/celebrities/Olivia Wilde.png', partner: undefined, exes: [] },
  { id: '83', type: 'celebrity', name: { en: 'The Weeknd', ru: 'The Weeknd' }, imageUrl: '/images/celebrities/The Weeknd.png', partner: undefined, exes: [] },
  { id: '84', type: 'celebrity', name: { en: 'Lily-Rose Depp', ru: 'Лили-Роуз Депп' }, imageUrl: '/images/celebrities/Lily-Rose Depp.png', partner: undefined, exes: [] },
  { id: '85', type: 'celebrity', name: { en: 'Travis Scott', ru: 'Трэвис Скотт' }, imageUrl: '/images/celebrities/Travis Scott.png', partner: undefined, exes: [] },
  { id: '86', type: 'celebrity', name: { en: 'Kristen Stewart', ru: 'Кристен Стюарт' }, imageUrl: '/images/celebrities/Kristen Stewart.png', partner: undefined, exes: [] },
  { id: '87', type: 'celebrity', name: { en: 'Nicole Kidman', ru: 'Николь Кидман' }, imageUrl: '/images/celebrities/Nicole Kidman.png', partner: undefined, exes: [] },
  { id: '88', type: 'celebrity', name: { en: 'Irina Shayk', ru: 'Ирина Шейк' }, imageUrl: '/images/celebrities/Irina Shayk.png', partner: undefined, exes: [] },
  { id: '89', type: 'celebrity', name: { en: 'Calvin Harris', ru: 'Келвин Харрис' }, imageUrl: '/images/celebrities/Calvin Harris.png', partner: undefined, exes: [] },
  { id: '90', type: 'celebrity', name: { en: 'Jennifer Garner', ru: 'Дженнифер Гарнер' }, imageUrl: '/images/celebrities/Jennifer Garner.png', partner: undefined, exes: [] },
  { id: '91', type: 'celebrity', name: { en: 'Ana de Armas', ru: 'Ана де Армас' }, imageUrl: '/images/celebrities/Ana de Armas.png', partner: undefined, exes: [] },
  { id: '92', type: 'celebrity', name: { en: 'Zayn Malik', ru: 'Зейн Малик' }, imageUrl: '/images/celebrities/Zayn Malik.png', partner: undefined, exes: [] },
  { id: '93', type: 'celebrity', name: { en: 'Leonardo DiCaprio', ru: 'Леонардо ДиКаприо' }, imageUrl: '/images/celebrities/Leonardo DiCaprio.png', partner: undefined, exes: [] },
  { id: '94', type: 'celebrity', name: { en: 'Michael Bublé', ru: 'Майкл Бубле' }, imageUrl: '/images/celebrities/Michael Bublé.png', partner: undefined, exes: [] },
  { id: '95', type: 'celebrity', name: { en: 'Daisy Edgar-Jones', ru: 'Дэйзи Эдгар-Джонс' }, imageUrl: '/images/celebrities/Daisy Edgar-Jones.png', partner: undefined, exes: [] },
  { id: '96', type: 'celebrity', name: { en: 'Dakota Johnson', ru: 'Дакота Джонсон' }, imageUrl: '/images/celebrities/Dakota Johnson.png', partner: undefined, exes: [] },
  { id: '97', type: 'celebrity', name: { en: 'Johnny Depp', ru: 'Джонни Депп' }, imageUrl: '/images/celebrities/Johnny Depp.png', partner: undefined, exes: [] },
  { id: '98', type: 'celebrity', name: { en: 'Kate Moss', ru: 'Кейт Мосс' }, imageUrl: '/images/celebrities/Kate Moss.png', partner: undefined, exes: [] },
  { id: '99', type: 'celebrity', name: { en: 'Paul Mescal', ru: 'Пол Мескал' }, imageUrl: '/images/celebrities/Paul Mescal.png', partner: undefined, exes: [] },
  { id: '100', type: 'celebrity', name: { en: 'Pedro Pascal', ru: 'Педро Паскаль' }, imageUrl: '/images/celebrities/Pedro Pascal.png', partner: undefined, exes: [] }
];