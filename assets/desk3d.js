/* SEVEN 3D — первый экран: 3D-стол услуг. Наведение — выноска, нажатие — крупный план и панель услуги; на телефоне — лента. */
(function () {
  'use strict';
  /* Презентации услуг открываются прямо на сайте, а кнопка ведёт в заявку с уже выбранной услугой */
  var PAGE = { invest: 'investicii.html', estate: 'nedvizhimost.html', industry: 'proizvodstvo.html', ads: 'reklama.html' };
  var BRIEF = { portfolio: 'invest-pack', present: 'invest-pdf', book: 'invest-model', finmodel: 'invest-model', prints: 'invest-viz', tablet: 'invest-video',
    box: 'estate-pack', prints_e: 'estate-viz', tablet_e: 'estate-video', plan3d: 'estate-pack', zhk: 'estate-unreal', site: 'estate-site', vr: 'estate-vr',
    digital: 'industry-pack', factory: 'industry-process', kiosk: 'industry-screen', vr_i: 'industry-tour', present_i: 'industry-pdf',
    subs: 'ads-pack', imagevid: 'ads-image', camera: 'ads-vfx', phone: 'ads-ai', web: 'ads-web' };
  var GOAL = { sketch: 'invest', stand: 'estate' };
  function deckHref(id) { return PAGE[id.split('-')[0]] + '#deck-' + id; }
  function slides(id) { var d = window.SEVEN_DECKS && window.SEVEN_DECKS[id]; return d && d.slides ? d.slides.length : 0; }
  function slidesWord(n) { var a = n % 10, b = n % 100; return a === 1 && b !== 11 ? 'слайд' : a >= 2 && a <= 4 && (b < 12 || b > 14) ? 'слайда' : 'слайдов'; }
  /* Услуги стола. Номер и порядок — массив ORDER: по зонам слева направо (01 инвестиции · 02 недвижимость · 03 производство · 04 реклама),
     в каждой зоне сначала пакет. Названия те же, что в секциях страницы и в брифе. */
  var DATA = {
    portfolio: { label: 'Пакет «Инвестпроект под ключ»', title: 'Пакет «Инвестпроект под ключ»', brief: 'Концепция → 3D → ролик → финмодель → презентация',
      rows: [{ n: 'Комплект для инвестора', p: 'Под состав проекта' }], deck: 'invest-pack' },
    sketch: { label: 'Эскизный проект участка', title: 'Эскизный проект участка', brief: 'Архитектурный эскиз участка: зона отдыха, курорт, глэмпинг',
      rows: [{ n: 'Эскизный проект', p: 'Расчёт под задачу' }], wa: true },
    prints: { label: '3D-визуализация', title: '3D-визуализация проекта', brief: 'Проект в картинках — до начала стройки',
      rows: [{ n: 'Для инвестпроекта', p: 'Расчёт под задачу', deck: 'invest-viz' }], deck: 'invest-viz' },
    tablet: { label: 'Инвест-ролик', title: 'Инвест-ролик', brief: 'Съёмка с дрона входит',
      rows: [{ n: 'Инвест-ролик', p: 'от $1 500', deck: 'invest-video' }], deck: 'invest-video' },
    book: { label: 'Бизнес-проект и финмодель', title: 'Бизнес-проект и финмодель', brief: 'Доходы, расходы и сценарии при заданных допущениях',
      rows: [{ n: 'Бизнес-проект и финмодель', p: 'Расчёт под задачу' }], deck: 'invest-model' },
    present: { label: 'Презентация для инвестора', title: 'Презентация для инвестора', brief: 'PDF для печати или интерактивная — слайды с анимацией',
      rows: [{ n: 'PDF или интерактивная', p: '$500', deck: 'invest-pdf' }], deck: 'invest-pdf' },
    present_i: { label: 'Презентация компании', title: 'Презентация компании', brief: 'PDF для печати или интерактивная — слайды с анимацией',
      rows: [{ n: 'PDF или интерактивная', p: '$500', deck: 'industry-pdf' }], deck: 'industry-pdf' },
    prints_e: { label: '3D-визуализация ЖК', title: '3D-визуализация ЖК', brief: 'Дом в картинках — до начала стройки',
      rows: [{ n: 'Для жилого комплекса', p: 'Расчёт под задачу', deck: 'estate-viz' }], deck: 'estate-viz' },
    tablet_e: { label: '3D-ролик о ЖК', title: '3D-ролик о ЖК', brief: '3D-анимация: пролёт над комплексом и двором',
      rows: [{ n: '3D-ролик о ЖК', p: 'от $2 000', deck: 'estate-video' }], deck: 'estate-video' },
    vr_i: { label: 'VR и 360°-туры', title: 'VR и 360°-туры', brief: 'Экскурсия по объекту без поездки',
      rows: [{ n: '360°-тур по объекту', p: 'Расчёт под задачу', deck: 'industry-tour' }], deck: 'industry-tour' },
    subs: { label: 'Пакет «Контент по подписке»', title: 'Пакет «Контент по подписке»', brief: 'Каждый месяц — ролики для Instagram',
      rows: [{ n: 'Подписка', p: 'Под объём в месяц' }] },
    imagevid: { label: 'Презентационный ролик о компании', title: 'Презентационный ролик о компании', brief: 'Съёмка с дрона входит',
      rows: [{ n: 'Ролик о компании', p: 'Расчёт под задачу' }] },
    box: { label: 'Пакет «Запуск продаж»', title: 'Пакет «Запуск продаж»', brief: 'Для застройщиков: всё для старта продаж',
      rows: [{ n: 'Пакет', p: 'Состав — под ваш бюджет' }], deck: 'estate-pack' },
    plan3d: { label: '3D-планировки', title: '3D-планировки квартир', brief: 'Входят в пакет «Запуск продаж»',
      rows: [{ n: '3D-планировки', p: 'Расчёт под задачу' }], deck: 'estate-pack' },
    zhk: { label: 'Интерактивная 3D-программа ЖК', title: 'Интерактивная 3D-программа ЖК', brief: 'Сенсорный стол в офисе продаж: покупатель сам выбирает квартиру',
      rows: [{ n: 'Программа под ваш ЖК', p: 'Расчёт под задачу' }], deck: 'estate-unreal' },
    site: { label: '3D-сайт с выбором квартир', title: '3D-сайт с выбором квартир', brief: 'Квартиру выбирают по этажам и планировкам',
      rows: [{ n: 'Сайт проекта', p: 'Расчёт под задачу' }], deck: 'estate-site' },
    vr: { label: 'VR и 360°-туры', title: 'VR и 360°-туры',
      rows: [{ n: 'VR-прогулка по квартире', p: 'от $13 за м²', deck: 'estate-vr' },
             { n: '360°-тур по шоуруму', p: 'Расчёт под задачу', deck: 'estate-tour' }] },
    stand: { label: 'Дизайн буклетов и брошюр', title: 'Дизайн буклетов и брошюр', brief: 'Буклеты, брошюры, каталоги и другая печать',
      rows: [{ n: 'Буклеты и брошюры', p: 'Расчёт под задачу' }, { n: 'Каталоги и другая печать', p: 'Расчёт под задачу' }], wa: true },
    web: { label: 'Интерактивные 3D-сайты для бизнеса', title: 'Интерактивные 3D-сайты для бизнеса', brief: 'Продукт или объект на сайте можно покрутить в 3D',
      rows: [{ n: '3D-сайт', p: 'Расчёт под задачу' }] },
    digital: { label: 'Пакет «Цифровая презентация»', title: 'Пакет «Цифровая презентация»', brief: 'Для производства и инфраструктуры: объект на выставке, на встрече и онлайн',
      rows: [{ n: 'Пакет', p: 'Состав — под задачу' }], deck: 'industry-pack' },
    factory: { label: 'Ролик об объекте', title: 'Ролик об объекте', brief: '3D-анимация и съёмка с дрона',
      rows: [{ n: '2D-ролик', p: '$800–2 000', deck: 'industry-process' }, { n: '3D-ролик', p: '$2 000–5 000', deck: 'industry-process' }] },
    kiosk: { label: 'Интерактивный экран', title: 'Интерактивный экран', brief: 'Для выставки, шоурума и офиса: гость сам нажимает и смотрит',
      rows: [{ n: 'Интерактивный экран', p: 'Расчёт под задачу' }], deck: 'industry-screen' },
    camera: { label: 'Рекламный ролик с 3D-эффектами', title: 'Рекламный ролик с 3D-эффектами', brief: 'Реальная съёмка плюс 3D-графика и спецэффекты',
      rows: [{ n: 'Рекламный ролик', p: '$1 500–4 000' }], deck: 'ads-vfx' },
    phone: { label: 'AI-ролики для соцсетей', title: 'AI-ролики для соцсетей', brief: 'Reels и TikTok, вертикальный формат 9:16',
      rows: [{ n: 'AI-ролик', p: 'Расчёт под задачу' }], deck: 'ads-ai' }
  };
  /* Четыре блока стола (квадрат 2×2): сзади 01 и 02, спереди 03 и 04. Услуги, нужные нескольким целям, стоят копией в каждом блоке
     (prints/prints_e, tablet/tablet_e, vr/vr_i, present/present_i) — у копии свои тексты и цены. Номер услуги — внутри блока. */
  var BLOCKS = {
    invest: ['sketch', 'prints', 'tablet', 'book', 'present', 'portfolio'],
    estate: ['zhk', 'site', 'vr', 'prints_e', 'tablet_e', 'plan3d', 'stand', 'box'],
    industry: ['factory', 'kiosk', 'vr_i', 'present_i', 'digital'],
    ads: ['imagevid', 'phone', 'web', 'camera', 'subs']
  };
  /* Номера — по порядку предметов на столе (слева направо, сверху вниз); пакет — без номера, в конце */
  var ORDER = [].concat(BLOCKS.invest, BLOCKS.estate, BLOCKS.industry, BLOCKS.ads), BLK = {};
  Object.keys(BLOCKS).forEach(function (k) { BLOCKS[k].forEach(function (id) { BLK[id] = k; }); });
  /* Несколько предметов — одна услуга: книга «Бизнес-проект» и планшет «Финмодель»; ролик и дрон рядом с ним (съёмка с дрона входит в ролик);
     у ролика об объекте — диорамы объектов на фоне; у имиджевого ролика — хлопушка; у рекламного — телефон с роликом; у 3D-программы ЖК — сенсорный стол.
     У части нет своего номера и подписи, нажатие открывает главную услугу, светятся вместе. */
  var PART = { finmodel: 'book', drone1: 'tablet', drone3: 'factory', drone4: 'imagevid', clap4: 'imagevid', phonev: 'camera', touch: 'zhk',
    dio1: 'factory', dio2: 'factory', dio3: 'factory', dio4: 'factory', dio5: 'factory' };
  Object.keys(PART).forEach(function (p) { BLK[p] = BLK[PART[p]]; });
  var WA = 'https://wa.me/996223775776?text=';

  /* Подробности для панели — тексты и цены с сайта SEVEN 3D. Категория — цель посетителя; у сквозных услуг — две цели. */
  var INFO = {
    portfolio: { cat: 'Пакет · Привлечь инвестиции', lead: 'Когда есть идея или участок, а для разговора с инвестором нужен полный комплект.',
      steps: ['Эскизный проект участка', '3D-визуализация', 'Инвест-ролик', 'Бизнес-проект и финмодель', 'Презентация для инвестора'], seq: true,
      price: 'Стоимость — под состав проекта, после брифа', note: 'Можно начать с презентации за $500.', pack: true },
    sketch: { cat: 'Привлечь инвестиции', lead: 'Архитектурный эскизный проект вашего участка: расстановка домиков, кафе, дорожек и зон отдыха. Зона отдыха, курорт, глэмпинг.',
      why: 'Эскизный проект — материал для решений, согласований и переговоров.', price: 'Расчёт под задачу',
      note: 'Первый шаг пакета «Инвестпроект под ключ». Рабочую документацию делает проектная организация — можем работать в связке с вашей.' },
    prints: { cat: 'Привлечь инвестиции', lead: 'Фотореалистичные виды проекта до начала стройки: территория, корпуса, зоны отдыха.',
      why: 'Инвестор видит будущий объект, пока его ещё нет. Рендеры работают в презентации, в ролике и на встрече.',
      inc: ['3D-сцена по вашим чертежам или концепции', 'Территория и благоустройство', 'Виды с высоты и с уровня глаз'],
      rows: [{ n: 'Для инвестпроекта', d: 'Курорт, зона отдыха, участок', p: 'Расчёт под задачу', deck: 'invest-viz' }],
      note: 'Зависит от площади, детализации, числа ракурсов и исходных чертежей.' },
    prints_e: { cat: 'Продать недвижимость', lead: 'Фотореалистичные виды жилого комплекса до начала стройки: фасады, двор, территория.',
      why: 'Покупатель видит дом, пока его ещё нет. Рендеры работают на сайте, в рекламе и в отделе продаж.',
      inc: ['3D-сцена по вашим чертежам', 'Фасады, двор и благоустройство', 'Виды с высоты и с уровня глаз'],
      rows: [{ n: 'Для жилого комплекса', d: 'Фасады, двор и территория комплекса', p: 'Расчёт под задачу', deck: 'estate-viz' }],
      note: 'Зависит от площади, детализации, числа ракурсов и исходных чертежей.' },
    tablet: { cat: 'Привлечь инвестиции', lead: 'Ролик, который за несколько минут объясняет инвестору проект: идея, масштаб, цифры.',
      rows: [{ n: 'Инвест-ролик', d: 'От 60 секунд до 5 минут, съёмка с дрона входит: Start $1 500, Business $2 500, Premium от $4 000', p: 'от $1 500', deck: 'invest-video' }],
      note: '2 круга правок.' },
    tablet_e: { cat: 'Продать недвижимость', lead: '3D-анимационный ролик о жилом комплексе: пролёт над комплексом, двор, инфраструктура района, виды из окон.',
      rows: [{ n: '3D-ролик о жилом комплексе', p: 'от $2 000', deck: 'estate-video' }],
      note: '2 круга правок.' },
    book: { cat: 'Привлечь инвестиции', lead: 'Дополнение к презентации или ролику: расчёт экономики проекта — доходы, расходы и сценарии при заданных допущениях.',
      why: 'Цифры, которые инвестор проверит первым, собраны в понятную модель.', inc: ['Модель доходов и расходов', 'Сценарии с допущениями', 'Выводы для презентации'],
      price: 'Расчёт под задачу', note: 'Делаем вместе с презентацией или роликом, если есть исходные цифры.' },
    present: { cat: 'Привлечь инвестиции', lead: 'Презентация на ~16 слайдов: идея, рынок, цифры и визуал. Два вида: PDF — для печати и письма; интерактивная — слайды с анимацией, которые инвестор листает сам.',
      inc: ['Структура и логика подачи', 'Тексты по вашим материалам', 'Дизайн слайдов, диаграммы и инфографика', 'PDF или интерактивная версия с анимацией'],
      rows: [{ n: 'Презентация для инвестора', p: '$500', deck: 'invest-pdf' }],
      note: '~16 слайдов, 3 круга правок. Другой объём, языки и исследования оцениваем отдельно.' },
    present_i: { cat: 'Презентовать производство или инфраструктуру', lead: 'Презентация компании на ~16 слайдов: процессы, оборудование, результаты. PDF — для печати и письма; интерактивная — слайды с анимацией для встреч и онлайн.',
      inc: ['Структура и логика подачи', 'Тексты по вашим материалам', 'Дизайн слайдов, схемы и инфографика', 'PDF или интерактивная версия с анимацией'],
      rows: [{ n: 'Презентация компании', d: 'О компании, процессах и результатах', p: '$500', deck: 'industry-pdf' }],
      note: '~16 слайдов, 3 круга правок. Другой объём и языки оцениваем отдельно.' },
    vr_i: { cat: 'Презентовать производство или инфраструктуру', lead: 'Виртуальная экскурсия по цеху, станции или объекту — без пропусков и поездок.',
      rows: [{ n: '360°-тур по объекту', d: 'Цех, склад, станция — в браузере или в VR-шлеме', p: 'Расчёт под задачу', deck: 'industry-tour' }],
      note: 'Зависит от площади объекта и числа точек съёмки.' },
    imagevid: { cat: 'Реклама для бизнеса', lead: 'Изучаем компанию, находим её сильные стороны и снимаем презентационный ролик, после которого о вас думают по-другому.',
      why: 'Клиенты, партнёры и будущие сотрудники видят компанию с лучшей стороны.', inc: ['Изучение компании и сценарий', 'Съёмка, в том числе с дрона', 'Монтаж, цвет и музыка'],
      price: 'Расчёт под задачу', note: 'Срок и стоимость — после брифа.' },
    subs: { cat: 'Пакет · Реклама для бизнеса', lead: 'Каждый месяц снимаем и создаём ролики для вашего Instagram — по плану и в одном стиле.',
      steps: ['План контента на месяц', 'Съёмка и монтаж роликов', 'AI-ролики для соцсетей'], price: 'Подписка — цена зависит от числа роликов в месяц', note: 'Объём на месяц — под ваш аккаунт и задачи.', pack: true },
    box: { cat: 'Пакет · Продать недвижимость', lead: 'Все материалы для старта продаж — в одном стиле.',
      steps: ['3D-визуализация ЖК', '3D-ролик о ЖК', '3D-планировки', 'Дизайн буклетов и брошюр', '3D-сайт с выбором квартир или интерактивная 3D-программа ЖК'], price: 'Состав — под ваш бюджет', pack: true },
    plan3d: { cat: 'Продать недвижимость', lead: 'Планировка квартиры в объёме: стены, мебель и отделка.', price: 'Расчёт под задачу', note: 'Входят в пакет «Запуск продаж».' },
    zhk: { cat: 'Продать недвижимость', lead: 'Программа на Unreal Engine для сенсорного стола или экрана в офисе продаж: покупатель выбирает корпус, этаж и квартиру, ходит по ней, меняет отделку и время суток.',
      why: 'Покупатель сам изучает квартиры в отделе продаж, на выставке или на встрече. У нас готовый шаблон, поэтому это не разработка с нуля.',
      inc: ['Адаптация шаблона под ваш ЖК', '3D-модель комплекса', 'Данные о квартирах', 'Проверка на вашем оборудовании'],
      price: 'Расчёт под задачу', note: 'Зависит от объёма модели, числа квартир и интеграций. Сенсорный стол или экран — ваш или под ключ, оборудование считается отдельно.' },
    web: { cat: 'Реклама для бизнеса', lead: 'Сайт, где продукт, объект или производство можно покрутить в 3D и рассмотреть со всех сторон.',
      why: 'Посетитель разбирается сам, дольше остаётся на сайте и оставляет заявку.', inc: ['Структура и дизайн сайта', '3D-модель и интерактив', 'Заявка с сайта'],
      price: 'Расчёт под задачу', note: 'Состав и стоимость — после брифа.' },
    site: { cat: 'Продать недвижимость', lead: 'Сайт комплекса, где квартиру выбирают по этажам и планировкам.',
      why: 'Покупатель выбирает квартиру сам и оставляет заявку на конкретный вариант.',
      inc: ['Страницы о проекте', 'Подбор квартиры по этажам и планировкам', 'Заявка на выбранную квартиру'],
      price: 'Расчёт под задачу', note: 'Состав и стоимость согласуем после брифа.' },
    vr: { cat: 'Продать недвижимость', lead: 'Покупатель гуляет по будущей квартире или шоуруму, не приезжая на место.',
      rows: [{ n: 'VR-прогулка по квартире', d: 'Свободная прогулка по будущей квартире или дому, в том числе в VR-шлеме', p: 'от $13 за м²', deck: 'estate-vr' },
             { n: '360°-тур по шоуруму', d: 'Панорамный тур по шоуруму, офису продаж или готовому дому', p: 'Расчёт под задачу', deck: 'estate-tour' }],
      note: 'Подготовка интерьера из готовых 3D-моделей — ещё $5 за м². Например, квартира 100 м² — $1 800. Это показ для покупателя, а не дизайн-проект интерьера.' },
    stand: { cat: 'Продать недвижимость', lead: 'Дизайн буклетов, брошюр, каталогов и другой печати для отдела продаж, выставок и встреч.',
      rows: [{ n: 'Буклеты и брошюры', d: 'Для отдела продаж, выставок и встреч', p: 'Расчёт под задачу' },
             { n: 'Каталоги и другая печать', d: 'Листовки, плакаты, баннеры', p: 'Расчёт под задачу' }],
      note: 'Услуга — дизайн. Изготовление и печать обсуждаем отдельно.' },
    digital: { cat: 'Пакет · Презентовать производство или инфраструктуру', lead: 'Завод, станция или другой объект в цифре — для выставки, встречи и разговора онлайн.',
      steps: ['Ролик об объекте — 3D-анимация и съёмка с дрона', 'Интерактивный экран — каталог продукции', 'VR и 360°-туры', 'Презентация компании — PDF или интерактивная'], price: 'Состав — под задачу', note: 'Состав пакета уточняем по вашей задаче.', pack: true },
    factory: { cat: 'Презентовать производство или инфраструктуру', lead: 'Ролик с 3D-анимацией и съёмкой с дрона: как устроен завод, ГЭС, солнечная или ветровая станция, система орошения — и как идёт процесс.',
      why: 'Партнёры, заказчики и инвесторы понимают сложное за несколько минут, без поездки на объект.',
      rows: [{ n: '2D-ролик', d: 'Сценарий, графика, схемы, инфографика, озвучка', p: '$800–2 000' }, { n: '3D-ролик', d: 'Анимация объекта и процессов, сценарий, озвучка', p: '$2 000–5 000' }],
      note: 'Длительность — под задачу. Съёмка с дрона входит. 2 круга правок.' },
    kiosk: { cat: 'Презентовать производство или инфраструктуру', lead: 'Программа для экрана на выставке, в шоуруме или в офисе: гость сам нажимает и смотрит процессы, оборудование и продукцию.',
      why: 'Стенд рассказывает о компании, даже когда менеджер занят.',
      inc: ['Сценарий и структура разделов', 'Дизайн и 3D-графика', 'Программа для сенсорного экрана'],
      price: 'Расчёт под задачу', note: 'Программа, программа с экраном или под ключ. Оборудование, доставка и монтаж считаются отдельно.' },
    camera: { cat: 'Реклама для бизнеса', lead: 'Реальная съёмка плюс 3D-графика и сложные визуальные эффекты.',
      why: 'Для рекламы, где обычной съёмки мало: продукт в необычной среде, сложные сцены.', inc: ['Съёмка', '3D-графика и спецэффекты', 'Монтаж и цвет'],
      price: '$1 500–4 000', note: 'Состав команды и сцен — в предложении.' },
    phone: { cat: 'Реклама для бизнеса', lead: 'Ролики на 15–60 секунд для Reels и TikTok: виртуальные персонажи, анимация фото, кинематографичные сцены, показ продукта.',
      why: 'Регулярный контент для соцсетей без съёмочной команды.', inc: ['Идея и сценарий', 'Генерация и монтаж', 'Музыка или озвучка'],
      price: 'Расчёт под задачу', note: 'Формат 9:16. Стоимость зависит от длительности, сюжета и объёма генераций — считаем после брифа.' }
  };
  Object.keys(PART).forEach(function (p) { DATA[p] = DATA[PART[p]]; INFO[p] = INFO[PART[p]]; });
  function sid(id) { return PART[id] || id; }
  /* Состав пакетов на столе — внутри своего блока. Вложенный массив — «на выбор»: сайт или выбор квартиры в 3D.
     У пакета «Контент по подписке» нет предметов-шагов — состав в панели обычным списком. */
  var PACK = {
    portfolio: { items: ['sketch', 'prints', 'tablet', 'book', 'present'], seq: true },
    box: { items: ['prints_e', 'tablet_e', 'plan3d', 'stand', ['site', 'zhk']] },
    digital: { items: ['factory', 'kiosk', 'vr_i', 'present_i'] }
  };
  function packFlat(p) { return PACK[p].items.reduce(function (a, x) { return a.concat(x); }, []); }
  /* Пакет, из которого посетитель перешёл к услуге: в панели услуги — «Назад к пакету», листание идёт по составу */
  var packCtx = null, packHover = null;
  function packList(id) {
    var P = PACK[id];
    return '<p class="dk-p-sub">' + (P.seq ? 'Как собираем — нажмите на шаг' : 'Что входит — нажмите на услугу') + '</p><ol class="dk-p-pack">' + P.items.map(function (x, i) {
      var alt = Array.isArray(x) ? x : [x];
      return '<li><span class="dk-p-pack-i">' + (i + 1) + '</span><span class="dk-p-pack-row">' + alt.map(function (a) {
        return '<button type="button" class="dk-p-go" data-goto="' + a + '"><b>' + num(a) + '</b>' + esc(DATA[a].label) + '</button>';
      }).join('<span class="dk-p-or">или</span>') + '</span></li>';
    }).join('') + '</ol>';
  }
  function backHTML() { return '<button type="button" class="dk-p-back" data-goto="' + packCtx + '"><span aria-hidden="true">←</span> Назад к пакету «' + esc(DATA[packCtx].label.replace(/^Пакет «|»$/g, '')) + '»</button>'; }

  var stage = document.getElementById('dk-stage'), canvas = document.getElementById('dk-c');
  var tip = document.getElementById('dk-tip'), tipSvg = document.getElementById('dk-tipline'), chipsEl = document.getElementById('dk-chips');
  var tipLine = tipSvg.querySelector('line'), tipDot = tipSvg.querySelector('circle');
  var resetBtn = document.getElementById('dk-reset');
  var tapEl = document.getElementById('dk-tap'), prevBtn = document.getElementById('dk-prev'), nextBtn = document.getElementById('dk-next');
  var heroEl = stage.closest ? stage.closest('.dk-hero') : null, headEl = document.querySelector('.dk-head');
  /* Подсказки на телефоне (палец и стрелка) показываем, пока посетитель сам не нажал и не полистал — один раз за сеанс */
  var SS = null; try { SS = window.sessionStorage; } catch (e) { SS = null; }
  function seen(k) { try { return !!SS && SS.getItem('dk-' + k) === '1'; } catch (e) { return false; } }
  function markSeen(k) { try { if (SS) SS.setItem('dk-' + k, '1'); } catch (e) { /* хранилище недоступно — просто не запоминаем */ } }
  var tapSeen = seen('tap'), swipeSeen = seen('swipe');
  /* подсказка на сцене компьютера «Наведите — увидите цену…» — пока посетитель ни разу не открыл услугу */
  if (tapSeen) stage.classList.add('is-tapped');
  var panel = document.getElementById('dk-panel'), pCat = document.getElementById('dk-p-cat'), pH = document.getElementById('dk-p-h'), pBody = document.getElementById('dk-p-body');
  /* Уровень 0: вопрос «Что вам нужно?» над столом. Уровень 1: полоса «← Все направления» и название блока. */
  var askEl = document.createElement('div'), lvEl = document.createElement('div'), lvT;
  askEl.className = 'dk-ask';
  /* подсказку «Выберите направление…» не повторяем: она уже есть в подзаголовке над столом */
  askEl.innerHTML = '<p class="dk-ask-h">Что вам нужно?</p>';
  lvEl.className = 'dk-lv';
  lvEl.innerHTML = '<button type="button" class="dk-lv-back"><span aria-hidden="true">←</span> Все направления</button><p class="dk-lv-t" aria-live="polite"></p>' +
    '<button type="button" class="dk-lv-x" aria-label="Закрыть блок" title="Закрыть блок"><svg viewBox="0 0 20 20" aria-hidden="true"><path d="M5 5l10 10M15 5L5 15"/></svg></button>';
  stage.appendChild(askEl); stage.appendChild(lvEl); lvT = lvEl.querySelector('.dk-lv-t');
  stage.classList.add('is-l0');
  var REDUCE = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  function railMode() { return stage.clientWidth < 720; }

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function txt(p) { return /\d/.test(p) ? '' : ' is-text'; }
  function isPack(id) { return !!(INFO[id] && INFO[id].pack); }
  function num(id) { id = sid(id); if (isPack(id)) return ''; var L = (BLOCKS[BLK[id]] || ORDER).filter(function (x) { return !isPack(x); }), i = L.indexOf(id) + 1; return (i < 10 ? '0' : '') + i; }
  /* вместо строки «Нажмите на предмет» — анимированный палец на самом предмете */
  var GO = '';
  function tipHTML(id) {
    var d = DATA[id], h = '<p class="dk-tip-h">' + esc(d.title) + '</p>';
    /* На телефоне — выноска на линии от предмета: «Наши услуги», номер и название, без цены */
    if (MODE === 'rail') return '<p class="dk-tip-cat">Наши услуги</p><p class="dk-tip-h"><b class="dk-tip-n">' + num(id) + '</b>' + esc(d.title) + '</p>';
    if (d.brief) h += '<p class="dk-tip-b">' + esc(d.brief) + '</p>';
    if (d.rows.length > 1) h += '<ul class="dk-tip-rows">' + d.rows.map(function (r) { return '<li><span>' + esc(r.n) + '</span><b class="' + txt(r.p).trim() + '">' + esc(r.p) + '</b></li>'; }).join('') + '</ul>';
    else h += '<p class="dk-tip-p' + txt(d.rows[0].p) + '">' + esc(d.rows[0].p) + '</p>';
    return h + GO;
  }
  function panelBody(id) {
    var d = DATA[id], f = INFO[id], h = '';
    if (packCtx && packCtx !== id) h += backHTML();
    if (f.lead) h += '<p class="dk-p-lead">' + esc(f.lead) + '</p>';
    if (f.why) h += '<p class="dk-p-why">' + esc(f.why) + '</p>';
    if (PACK[id] && HAS3D) h += packList(id);
    else if (f.steps) h +='<p class="dk-p-sub">' + (f.seq ? 'Как собираем' : 'Что входит') + '</p><' + (f.seq ? 'ol class="dk-p-steps"' : 'ul class="dk-p-inc"') + '>' + f.steps.map(function (s) { return '<li>' + esc(s) + '</li>'; }).join('') + (f.seq ? '</ol>' : '</ul>');
    if (f.inc) h += '<p class="dk-p-sub">Что входит</p><ul class="dk-p-inc">' + f.inc.map(function (s) { return '<li>' + esc(s) + '</li>'; }).join('') + '</ul>';
    if (f.rows) h += '<p class="dk-p-sub">Варианты и цены</p><ul class="dk-p-rows">' + f.rows.map(function (r) {
      var inner = '<span class="dk-n">' + esc(r.n) + '</span><span class="dk-pr' + txt(r.p) + '">' + esc(r.p) + '</span>' + (r.d ? '<span class="dk-d">' + esc(r.d) + '</span>' : '');
      return '<li>' + (r.deck ? '<a class="dk-p-row" href="' + deckHref(r.deck) + '" data-deck="' + r.deck + '">' + inner + '</a>' : '<div class="dk-p-row">' + inner + '</div>') + '</li>';
    }).join('') + '</ul>';
    if (f.price) h += '<p class="dk-p-price' + txt(f.price) + '">' + esc(f.price) + '</p>';
    if (f.note) h += '<p class="dk-p-note">' + esc(f.note) + '</p>';
    var num = /\d/.test(f.price || '') || (f.rows || []).some(function (r) { return /\d/.test(r.p); }), calc = f.pack || !num;
    var msg = (calc ? 'Здравствуйте. Хочу рассчитать стоимость: ' : 'Здравствуйте. Интересует: ') + d.title;
    var pick = BRIEF[id] ? ' data-pick-svc="' + BRIEF[id] + '"' : GOAL[id] ? ' data-pick="' + GOAL[id] + '"' : '', n = d.deck ? slides(d.deck) : 0;
    h += '<div class="dk-p-cta"><a class="dk-btn" href="#brief"' + pick + '>' + (calc ? 'Узнать стоимость' : 'Обсудить эту услугу') + '</a>' +
      (d.deck ? '<a class="dk-p-link" href="' + deckHref(d.deck) + '" data-deck="' + d.deck + '">Что это?</a>' : '') +
      '<p class="dk-p-contact">Или напишите в <a href="' + WA + encodeURIComponent(msg) + '" target="_blank" rel="noopener">WhatsApp</a> — ответим с 10:00 до 19:00</p></div>';
    return h;
  }
  /* Телефон: короткая карточка-путеводитель — пара строк о услуге и кнопки, которые ведут вниз по странице */
  var DOWN = '<svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 2v10M3 8l4 4 4-4"/></svg>';
  function deckOf(id) { var d = DATA[id]; return d.deck || BRIEF[id] || (d.rows[0] && d.rows[0].deck) || null; }
  function shown(el) { return !!(el && el.getClientRects().length); }
  function moreTarget(id) {
    var k = deckOf(id) || BRIEF[id], g;
    /* пакет — плашка в начале секции цели (она стоит раньше своей ссылки на презентацию); новые услуги без презентации — карточка data-card */
    if (k) { var c = Array.prototype.slice.call(document.querySelectorAll('.dzone [data-pack="' + k + '"], .dzone [data-deck="' + k + '"], .dzone [data-card="' + k + '"]')).filter(shown)[0]; if (c) return c; }
    g = BLK[sid(id)] || GOAL[id] || (k && k.split('-')[0]);
    return g ? document.getElementById('d-' + g) : null;
  }
  function worksFor(id) {
    var keys = {}, k = deckOf(id);
    if (k) keys[k] = 1;
    (DATA[id].rows || []).concat(INFO[id].rows || []).forEach(function (r) { if (r.deck) keys[r.deck] = 1; });
    return Array.prototype.slice.call(document.querySelectorAll('#works [data-svc]')).filter(function (el) { return keys[el.getAttribute('data-svc')] && shown(el); });
  }
  function guideBody(id) {
    var f = INFO[id], h = '', nump = /\d/.test(f.price || '') || (f.rows || []).some(function (r) { return /\d/.test(r.p); }), calc = f.pack || !nump;
    var pick = BRIEF[id] ? ' data-pick-svc="' + BRIEF[id] + '"' : GOAL[id] ? ' data-pick="' + GOAL[id] + '"' : '';
    if (f.lead) h += '<p class="dk-g-lead">' + esc(f.lead) + '</p>';
    /* Пакет: состав — ряд нажимаемых чипов; тап подвозит стол к предмету. У услуги из пакета первым идёт «Назад к пакету». */
    var chips = PACK[id] ? packFlat(id) : null;
    if (chips || (packCtx && packCtx !== id)) {
      h += '<div class="dk-g-pack" role="list">' + (chips ? '' : '<button type="button" class="dk-g-chip is-back" data-goto="' + packCtx + '" role="listitem"><span aria-hidden="true">←</span> Назад к пакету</button>') +
        (chips || packFlat(packCtx).filter(function (x) { return x !== id; })).map(function (x) { return '<button type="button" class="dk-g-chip" data-goto="' + x + '" role="listitem"><b>' + num(x) + '</b>' + esc(DATA[x].label) + '</button>'; }).join('') + '</div>';
    }
    /* две кнопки в одну строку: «Подробнее» (к карточке услуги с ценами и презентацией) и главное действие */
    return h + '<div class="dk-g-acts">' + (moreTarget(id) ? '<a class="dk-g-btn" href="#" data-go="more">Подробнее' + DOWN + '</a>' : '') +
      '<a class="dk-btn dk-g-cta" href="#brief"' + pick + '>' + (calc ? 'Узнать стоимость' : 'Обсудить эту услугу') + '</a></div>';
  }
  /* Кнопки карточки прокручивают страницу к карточке услуги или к работам и коротко подсвечивают их */
  function goTo(kind, id) {
    var list = [], el, sm = REDUCE ? 'auto' : 'smooth';
    if (kind === 'works') { list = worksFor(id); el = list[0] || document.getElementById('works'); }
    else { el = moreTarget(id); if (el && !el.classList.contains('anc')) list = [el]; }
    if (!el) return;
    if (list.length) el.scrollIntoView({ behavior: sm, block: 'center', inline: 'center' });
    else el.scrollIntoView({ behavior: sm, block: 'start' });
    list.forEach(function (c) { c.classList.remove('is-pointed'); void c.offsetWidth; c.classList.add('is-pointed'); setTimeout(function () { c.classList.remove('is-pointed'); }, 3400); });
  }
  var panelId = null, panelT = 0;
  function openPanel(id) {
    if (MODE === 'rail') { pCat.textContent = 'Наши услуги'; pH.innerHTML = '<b class="dk-tip-n">' + num(id) + '</b>' + esc(DATA[id].title); pBody.innerHTML = guideBody(id); }
    else { pCat.textContent = INFO[id].cat; pH.textContent = DATA[id].title; pBody.innerHTML = panelBody(id); }
    panel.scrollTop = 0; panelId = id;
    clearTimeout(panelT);
    if (panel.hidden) { panel.hidden = false; void panel.offsetWidth; }
    panel.classList.add('is-open');
  }
  function closePanel() {
    panelId = null; panel.classList.remove('is-open'); clearTimeout(panelT);
    panelT = setTimeout(function () { if (!panelId) panel.hidden = true; }, REDUCE ? 0 : 450);
  }

  /* Цели посетителя = блоки стола. COLS — колонки легенды под столом: услуги блока по порядку номеров. */
  var GKEYS = ['invest', 'estate', 'industry', 'ads'];
  var GNAME = { invest: 'Привлечь инвестиции', estate: 'Продать недвижимость', industry: 'Презентовать производство или инфраструктуру', ads: 'Реклама для бизнеса' };
  var GSHORT = { invest: 'Привлечь инвестиции', estate: 'Продать недвижимость', industry: 'Презентовать производство', ads: 'Реклама для бизнеса' };
  var ZNAME = ['Инвестиции', 'Недвижимость', 'Презентация', 'Реклама'];
  var COLS = BLOCKS;
  function svcWord(n) { var a = n % 10, b = n % 100; return a === 1 && b !== 11 ? 'услуга' : a >= 2 && a <= 4 && (b < 12 || b > 14) ? 'услуги' : 'услуг'; }
  var chipGroups = GKEYS.map(function (k, i) {
    var g = document.createElement('div');
    g.className = 'dk-chips-z'; g.setAttribute('data-zone', k); g.setAttribute('role', 'group'); g.setAttribute('aria-label', '0' + (i + 1) + ' ' + ZNAME[i]);
    g.innerHTML = '<p class="dk-chips-h" aria-hidden="true"><b>0' + (i + 1) + '</b>' + ZNAME[i] + '</p>';
    COLS[k].forEach(function (id) {
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'dk-chip'; b.setAttribute('data-o', id);
      b.innerHTML = '<i aria-hidden="true"></i><span class="dk-chip-n" aria-hidden="true">' + num(id) + '</span>' + esc(DATA[id].label);
      g.appendChild(b);
    });
    chipsEl.appendChild(g);
    return g;
  });
  var chips = Array.prototype.slice.call(chipsEl.querySelectorAll('.dk-chip'));
  /* Ленточка услуг в одну строку. Края гаснут, когда за ними есть ещё. На компьютере лента листается вслед за мышью:
     у левого края — начало, у правого — конец. Телефон листает пальцем, как обычно. */
  var chipGoal = null, chipPos = 0, chipRaf = 0, chipT = 0;
  function chipEdges() {
    var m = chipsEl.scrollWidth - chipsEl.clientWidth;
    chipsEl.classList.toggle('is-more-l', m > 2 && chipsEl.scrollLeft > 2);
    chipsEl.classList.toggle('is-more-r', m > 2 && chipsEl.scrollLeft < m - 2);
  }
  function chipStep(t) {   // плавно, по времени, а не по кадрам: скорость одинаковая на любом экране
    chipRaf = 0; if (chipGoal === null) { chipT = 0; return; }
    var dt = chipT ? Math.min(0.25, (t - chipT) / 1000) : 0.016; chipT = t;
    var d = chipGoal - chipPos;
    chipPos = Math.abs(d) < 0.5 || REDUCE ? chipGoal : chipPos + d * (1 - Math.exp(-dt * 12));
    chipsEl.scrollLeft = chipPos;
    if (chipPos !== chipGoal) chipRaf = requestAnimationFrame(chipStep); else chipT = 0;
  }
  chipsEl.addEventListener('scroll', chipEdges, { passive: true });
  window.addEventListener('resize', chipEdges);
  if (window.matchMedia && matchMedia('(hover: hover) and (pointer: fine)').matches) {
    chipsEl.addEventListener('mouseenter', function () { chipPos = chipsEl.scrollLeft; });
    chipsEl.addEventListener('mousemove', function (e) {
      var m = chipsEl.scrollWidth - chipsEl.clientWidth; if (m < 4) return;
      var r = chipsEl.getBoundingClientRect(), pad = Math.min(140, r.width * 0.14);
      chipGoal = Math.round(Math.max(0, Math.min(1, (e.clientX - r.left - pad) / Math.max(1, r.width - 2 * pad))) * m);
      if (!chipRaf) chipRaf = requestAnimationFrame(chipStep);
    });
    chipsEl.addEventListener('mouseleave', function () { chipGoal = null; });
  }
  chipEdges();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(chipEdges);

  function webgl() { try { var c = document.createElement('canvas'); return !!(window.WebGLRenderingContext && (c.getContext('webgl') || c.getContext('experimental-webgl'))); } catch (e) { return false; } }
  var HAS3D = !!window.THREE && webgl();

  /* ---------------- 3D-сцена ---------------- */
  var T = window.THREE, renderer, scene, camera, objects = {}, pickables = [], cards = {};
  var view = { tx: 0, ty: 0.1, tz: 0, dist: 2.6, az: 0, el: 0.62, fov: 28 }, goal = {}, home = {};
  var hovered = null, pinned = null, dragging = false, needs = true, raf = 0, last = 0, visible = true, tipId = null;
  var LIFT = 0.032;

  var NIGHT = { body: 0x1e2126, edge: 0xdbdbdb };
  function seeded(a) { return function () { a = (a * 1664525 + 1013904223) % 4294967296; return a / 4294967296; }; }
  function mat(kind, color, opts) {
    var m; opts = Object.assign({}, opts || {});
    var keep = opts.keep || opts.map || opts.emissiveMap; delete opts.keep;
    if (kind !== 'basic' && !keep) { color = NIGHT.body; opts.roughness = 0.7; opts.metalness = 0.2; opts.envMapIntensity = 0.6; }
    if (kind === 'basic') m = new T.MeshBasicMaterial(Object.assign({ color: color, toneMapped: false }, opts));
    else m = new T.MeshStandardMaterial(Object.assign({ color: color, roughness: 0.8, metalness: 0 }, opts));
    m.color.convertSRGBToLinear();
    m.userData.base = m.color.clone();
    if (m.emissive) m.userData.emis = m.emissiveIntensity;
    if (m.envMapIntensity !== undefined) m.userData.env = m.envMapIntensity;
    return m;
  }
  function rrShape(w, d, cr) {
    var s = new T.Shape(), x0 = -w / 2, x1 = w / 2, y0 = -d / 2, y1 = d / 2;
    cr = Math.max(0.0005, Math.min(cr, w / 2 - 0.0001, d / 2 - 0.0001));
    s.moveTo(x0 + cr, y0); s.lineTo(x1 - cr, y0); s.absarc(x1 - cr, y0 + cr, cr, -Math.PI / 2, 0, false);
    s.lineTo(x1, y1 - cr); s.absarc(x1 - cr, y1 - cr, cr, 0, Math.PI / 2, false);
    s.lineTo(x0 + cr, y1); s.absarc(x0 + cr, y1 - cr, cr, Math.PI / 2, Math.PI, false);
    s.lineTo(x0, y0 + cr); s.absarc(x0 + cr, y0 + cr, cr, Math.PI, 1.5 * Math.PI, false);
    return s;
  }
  function rbox(w, h, d, r, cr) {
    r = Math.min(r, h / 2 - 0.0002, w / 2 - 0.001, d / 2 - 0.001);
    var g = new T.ExtrudeGeometry(rrShape(w - 2 * r, d - 2 * r, cr || 0.001), { depth: Math.max(h - 2 * r, 0.0002), bevelEnabled: true, bevelThickness: r, bevelSize: r, bevelSegments: 3, curveSegments: 8 });
    g.rotateX(-Math.PI / 2); g.translate(0, r, 0);
    return g;
  }
  function mesh(geo, m, parent, x, y, z) {
    var o = new T.Mesh(geo, m); o.position.set(x || 0, y || 0, z || 0); o.castShadow = true; o.receiveShadow = true;
    if (parent) parent.add(o);
    return o;
  }
  function canvasTex(w, h, draw) {
    var c = document.createElement('canvas'); c.width = w; c.height = h;
    var g = c.getContext('2d'); draw(g, w, h);
    var t = new T.CanvasTexture(c); t.encoding = T.sRGBEncoding; t.anisotropy = renderer.capabilities.getMaxAnisotropy();
    t.userData = { canvas: c, draw: draw };
    return t;
  }
  function redraw(t) { var c = t.userData.canvas; t.userData.draw(c.getContext('2d'), c.width, c.height); t.needsUpdate = true; invalidate(); }
  var IMGS = {};
  function img(src, cb) {
    if (IMGS[src]) { if (IMGS[src].complete && IMGS[src].naturalWidth) cb(IMGS[src]); else IMGS[src].addEventListener('load', function () { cb(IMGS[src]); }); return; }
    var im = new Image(); IMGS[src] = im; im.onload = function () { cb(im); }; im.src = src;
  }
  function cover(g, im, x, y, w, h) {
    var r = Math.max(w / im.naturalWidth, h / im.naturalHeight), sw = w / r, sh = h / r;
    g.drawImage(im, (im.naturalWidth - sw) / 2, (im.naturalHeight - sh) / 2, sw, sh, x, y, w, h);
  }
  function rr(g, x, y, w, h, r) { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }
  function photoTex(src, w, h, border) {
    var t = canvasTex(w, h, function (g, W, H) {
      g.fillStyle = border ? '#f4f4f2' : '#202226'; g.fillRect(0, 0, W, H);
      var im = IMGS[src]; var b = border ? Math.round(W * 0.035) : 0;
      if (im && im.naturalWidth) cover(g, im, b, b, W - 2 * b, H - 2 * b);
    });
    img(src, function () { redraw(t); });
    return t;
  }
  function contact(parent, w, d, x, z, op) {
    var t = canvasTex(128, 128, function (g, W, H) {
      var gr = g.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, W / 2);
      gr.addColorStop(0, 'rgba(0,0,0,1)'); gr.addColorStop(0.55, 'rgba(0,0,0,.55)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = gr; g.fillRect(0, 0, W, H);
    });
    t.encoding = T.LinearEncoding;
    var m = new T.MeshBasicMaterial({ map: t, transparent: true, opacity: op || 0.5, depthWrite: false, toneMapped: false });
    var p = new T.Mesh(new T.PlaneGeometry(w, d), m); p.rotation.x = -Math.PI / 2; p.position.set(x || 0, 0.0012, z || 0); p.renderOrder = 1;
    p.userData.contact = true; p.userData.op = m.opacity;
    parent.add(p); return p;
  }

  /* Четыре блока — плиты 2×2: сзади 01 Инвестиции и 02 Недвижимость, спереди 03 Производство и 04 Реклама.
     Надпись блока — на полу за краем плиты (у задних — над ней, у передних — под ней). */
  var PLATES = {
    invest: { x0: -2.36, x1: -0.1, z0: -1.56, z1: -0.13 },
    estate: { x0: 0.1, x1: 2.36, z0: -1.56, z1: -0.13 },
    industry: { x0: -2.36, x1: -0.1, z0: 0.09, z1: 1.52 },
    ads: { x0: 0.1, x1: 2.36, z0: 0.09, z1: 1.52 }
  };
  /* Место предмета: x, z, поворот. Плиты широкие, предметы в 1,2 раза крупнее (OBJ_S), под каждым — надпись на столе (TXT),
     в правом нижнем углу — кнопка пакета. В блоке 03 сзади — диорамы объектов, перед ними планшет с роликом и дрон. */
  var LAY = {
    sketch: [-1.92, -1.27, 0], prints: [-1.3, -1.28, 0], tablet: [-0.84, -1.28, 0.04], drone1: [-0.51, -1.26, 1.95],
    book: [-2.02, -0.68, -0.06], finmodel: [-1.6, -0.68, 0.04], present: [-0.8, -0.7, -0.03], portfolio: [-0.48, -0.24, 0],
    zhk: [0.55, -1.3, 0], touch: [1.2, -1.26, 0], site: [1.95, -1.36, 0],
    vr: [0.5, -0.72, 0.06], prints_e: [1.15, -0.72, 0], tablet_e: [1.62, -0.72, -0.06], plan3d: [2.07, -0.72, -0.1],
    stand: [0.42, -0.25, 0], box: [1.94, -0.25, 0],
    dio1: [-2.08, 0.3, 0], dio2: [-1.64, 0.3, 0], dio3: [-1.2, 0.3, 0], dio4: [-0.76, 0.3, 0], dio5: [-0.33, 0.3, 0],
    factory: [-1.38, 0.76, 0], drone3: [-1.0, 0.74, 1.95],
    kiosk: [-2.05, 1.17, 0.14], vr_i: [-1.48, 1.18, 0.06], present_i: [-0.94, 1.16, -0.03], digital: [-0.4, 1.4, 0],
    imagevid: [0.5, 0.38, 0.04], drone4: [0.86, 0.36, 1.95], clap4: [1.24, 0.4, -0.25], phone: [1.85, 0.36, -0.15],
    web: [0.6, 1.08, 0.12], camera: [1.3, 1.08, -0.4], phonev: [1.74, 1.12, 0.25], subs: [2.05, 1.4, 0]
  };
  /* Телефон: блоки не квадратом 2×2, а в один ряд слева направо — на экране один блок, соседние листаются пальцем или стрелками.
     Сдвигаем плиты, предметы и надписи блока целиком (до постройки сцены); над каждой плитой — её надпись. */
  var COLUMN = false, railIdx = 0, COL_D = { invest: [1.78, -2.05], estate: [-0.68, -0.12], industry: [1.78, 0.16], ads: [-0.68, 2.09] }, COL_T = { invest: 'l', estate: 'l', industry: 'l', ads: 'l' };
  function columnLayout() {
    COLUMN = true;
    GKEYS.forEach(function (k) { var P = PLATES[k], d = COL_D[k]; P.x0 += d[0]; P.x1 += d[0]; P.z0 += d[1]; P.z1 += d[1]; P.tside = COL_T[k]; });
    [LAY, TXT].forEach(function (T0) { Object.keys(T0).forEach(function (id) { var d = COL_D[BLK[id]]; if (d) { T0[id][0] += d[0]; T0[id][1] += d[1]; } }); });
  }
  var OBJ_S = 1.2, OBJ_X ={ phone: 1.55, camera: 1.3, phonev: 1.25, clap4: 1.25 };   // в блоке рекламы мелкие предметы ещё крупнее
  function newObject(id, x, z, ry, flat) {
    var L = LAY[id]; if (L) { x = L[0]; z = L[1]; ry = L[2]; }
    var g = new T.Group(); g.position.set(x, 0, z); g.rotation.y = ry || 0; g.userData.id = id;
    if (!flat) g.scale.setScalar(OBJ_S * (OBJ_X[id] || 1));
    var o = { id: id, group: g, mats: [], lift: 0, dim: 1, contacts: [] };
    objects[id] = o; scene.add(g); return o;
  }
  /* Контуры и силуэт: по одному объекту линий и одному силуэту на предмет — так меньше вызовов отрисовки. */
  function outline(meshes, edge, hull, root) {
    root.updateMatrixWorld(true);
    var inv = new T.Matrix4().copy(root.matrixWorld).invert(), rel = new T.Matrix4(), sc = new T.Matrix4(), mm = new T.Matrix4(), v = new T.Vector3(), ep = [], hp = [];
    meshes.forEach(function (m) {
      if (m.userData.noEdge) return;
      var g = m.geometry, i;
      rel.multiplyMatrices(inv, m.matrixWorld);
      if (!/Torus|Sphere/.test(g.type)) {
        var e = new T.EdgesGeometry(g, 35).attributes.position;
        for (i = 0; i < e.count; i++) { v.fromBufferAttribute(e, i).applyMatrix4(rel); ep.push(v.x, v.y, v.z); }
      }
      if (/Sphere|Torus|Cylinder|Cone|Extrude|Lathe/.test(g.type)) {
        g.computeBoundingSphere();
        var c = g.boundingSphere.center, k = 1 + 0.0022 / Math.max(0.004, g.boundingSphere.radius);
        sc.makeScale(k, k, k).setPosition(c.x * (1 - k), c.y * (1 - k), c.z * (1 - k));
        mm.multiplyMatrices(rel, sc);
        var pa = (g.index ? g.toNonIndexed() : g).attributes.position;
        for (i = 0; i < pa.count; i++) { v.fromBufferAttribute(pa, i).applyMatrix4(mm); hp.push(v.x, v.y, v.z); }
      }
    });
    if (ep.length) { var eg = new T.BufferGeometry(); eg.setAttribute('position', new T.Float32BufferAttribute(ep, 3)); var ls = new T.LineSegments(eg, edge); ls.raycast = function () {}; root.add(ls); }
    if (hp.length) { var hg = new T.BufferGeometry(); hg.setAttribute('position', new T.Float32BufferAttribute(hp, 3)); var hm = new T.Mesh(hg, hull); hm.raycast = function () {}; hm.userData.hull = true; root.add(hm); }
  }
  function lineMats(op) {
    var e = new T.LineBasicMaterial({ color: NIGHT.edge, transparent: true, opacity: op, depthWrite: false, toneMapped: false });
    var h = new T.MeshBasicMaterial({ color: NIGHT.edge, side: T.BackSide, transparent: true, opacity: op, depthWrite: false, toneMapped: false });
    e.color.convertSRGBToLinear(); h.color.convertSRGBToLinear(); e.userData.op = h.userData.op = op;
    return [e, h];
  }
  function finish(o) {
    var meshes = [];
    o.group.traverse(function (m) {
      if (!m.isMesh) return;
      if (m.userData.contact) { o.contacts.push(m); return; }
      meshes.push(m);
      m.userData.oid = sid(o.id); pickables.push(m);
      if (m.castShadow) { m.geometry.computeBoundingSphere(); var ws = m.getWorldScale(new T.Vector3()); if (m.geometry.boundingSphere.radius * Math.max(ws.x, ws.y, ws.z) < 0.022) m.castShadow = false; }
      var arr = Array.isArray(m.material) ? m.material : [m.material];
      arr.forEach(function (mm) { if (o.mats.indexOf(mm) < 0) o.mats.push(mm); });
    });
    o.meshes = meshes;
    var lm = lineMats(0.5); o.edge = lm[0]; o.hull = lm[1];
    outline(meshes.filter(function (m) { return !m.userData.rotor; }), o.edge, o.hull, o.group);
    (o.rotors || []).forEach(function (r) { var rm = []; r.traverse(function (m) { if (m.isMesh && m.userData.rotor) rm.push(m); }); outline(rm, o.edge, o.hull, r); });
    o.group.updateMatrixWorld(true);
    o.box = new T.Box3(); o.pts = [];
    meshes.forEach(function (m) { o.box.expandByObject(m); boxPts(new T.Box3().setFromObject(m), o.pts); });
  }

  function buildZhk() {
    var o = newObject('zhk', 0.45, -0.43, 0), g = o.group;
    var clay = mat('std', 0xf4f4f2, { roughness: 0.85 }), board = mat('std', 0xcfd0d3, { roughness: 0.9 }), path = mat('basic', 0x5d636c);
    mesh(rbox(0.58, 0.022, 0.42, 0.004, 0.006), board, g);
    mesh(new T.BoxGeometry(0.5, 0.003, 0.05), path, g, 0, 0.0235, 0.165);
    mesh(new T.BoxGeometry(0.05, 0.003, 0.3), path, g, -0.24, 0.0235, 0.0);
    function facade(cols, rows, seed) {
      return canvasTex(224, Math.round(224 * rows / cols * 0.62), function (c, W, H) {
        var rnd = seeded(seed), cw = W / cols, rh = H / rows;
        c.fillStyle = '#121417'; c.fillRect(0, 0, W, H);
        c.fillStyle = '#2a2d32'; for (var j = 0; j <= rows; j++) c.fillRect(0, Math.round(j * rh), W, 1);
        for (var r = 0; r < rows; r++) for (var k = 0; k < cols; k++) {
          var on = rnd() < 0.4;
          c.fillStyle = on ? 'rgba(255,255,255,' + (0.35 + rnd() * 0.6).toFixed(2) + ')' : '#1d2024';
          c.fillRect(Math.round(k * cw) + 2, Math.round(r * rh) + 3, Math.round(cw) - 3, Math.round(rh) - 5);
        }
      });
    }
    var towers = [[-0.15, -0.07, 0.1, 0.4, 0.1, 14], [-0.005, -0.1, 0.1, 0.33, 0.1, 12], [0.14, -0.06, 0.1, 0.27, 0.1, 10]];
    towers.forEach(function (t, ti) {
      var fx = facade(7, t[5] * 2, 7 + ti * 31), side = mat('std', 0xffffff, { roughness: 0.7, map: fx, emissive: 0xffffff, emissiveMap: fx, emissiveIntensity: 0.75 });
      var top = clay;
      var m = mesh(new T.BoxGeometry(t[2], t[3], t[4]), [side, side, top, top, side, side], g, t[0], 0.022 + t[3] / 2, t[1]);
      mesh(new T.BoxGeometry(t[2] * 0.7, 0.018, t[4] * 0.7), clay, g, t[0], 0.022 + t[3] + 0.009, t[1]);
    });
    mesh(rbox(0.44, 0.055, 0.12, 0.002), clay, g, 0, 0.022, 0.07);
    var glass = mat('basic', 0xe9e5dc);
    mesh(new T.BoxGeometry(0.4, 0.02, 0.002), glass, g, 0, 0.042, 0.1305);
    mesh(new T.SphereGeometry(0.0055, 12, 8), mat('basic', 0xff0009), g, -0.15, 0.022 + 0.4 + 0.024, -0.07).castShadow = false;
    var treeMat = mat('basic', 0x8a9099);
    for (var i = 0; i < 8; i++) {
      var tr = mesh(new T.TorusGeometry(0.013, 0.0011, 4, 24), treeMat, g, -0.21 + i * 0.06, 0.0235, 0.19); tr.rotation.x = Math.PI / 2; tr.castShadow = false; tr.userData.noEdge = true;
    }
    o.anchor = new T.Vector3(-0.15, 0.022 + 0.4 + 0.02, -0.07);
    contact(g, 0.72, 0.56, 0, 0, 0.55);
    finish(o);
  }

  /* Экран 3D-сайта ЖК (монитор): шапка, фото дома, список этажей, планировки */
  function siteDraw(c, W, H) {
    c.fillStyle = '#0f1012'; c.fillRect(0, 0, W, H);
    c.fillStyle = '#1b1d21'; c.fillRect(0, 0, W, 54);
    c.fillStyle = '#dbdbdb'; c.fillRect(28, 20, 64, 14);
    c.fillStyle = '#6f747b'; for (var i = 0; i < 4; i++) c.fillRect(W - 360 + i * 80, 24, 54, 6);
    var im = IMGS['assets/img/desk3d/zhk-1.jpg'];
    if (im && im.naturalWidth) cover(c, im, 28, 76, 620, 360); else { c.fillStyle = '#25282d'; c.fillRect(28, 76, 620, 360); }
    c.fillStyle = 'rgba(255,255,255,.9)'; c.fillRect(250, 210, 140, 12);
    c.font = '600 22px Manrope, sans-serif'; c.fillStyle = '#dbdbdb'; c.fillText('Выбор квартиры', 676, 98);
    for (var k = 0; k < 8; k++) {
      c.fillStyle = k === 3 ? '#ffffff' : '#25282d'; rr(c, 676, 120 + k * 40, 318, 30, 6); c.fill();
      c.fillStyle = k === 3 ? '#0f1012' : '#8a8f96'; c.font = '16px Manrope, sans-serif'; c.fillText('Этаж ' + (9 - k), 692, 141 + k * 40);
    }
    for (var p = 0; p < 4; p++) {
      var x = 28 + p * 160; c.fillStyle = '#1b1d21'; rr(c, x, 460, 148, 150, 8); c.fill();
      c.strokeStyle = '#5c6066'; c.lineWidth = 2; c.strokeRect(x + 22, 482, 104, 104);
      c.beginPath(); c.moveTo(x + 74, 482); c.lineTo(x + 74, 540); c.moveTo(x + 22, 540); c.lineTo(x + 126, 540); c.stroke();
    }
    c.fillStyle = '#1b1d21'; rr(c, 676, 460, 318, 150, 8); c.fill();
    c.fillStyle = '#dbdbdb'; c.fillRect(700, 490, 160, 12); c.fillStyle = '#6f747b'; c.fillRect(700, 516, 230, 8); c.fillRect(700, 534, 190, 8);
    c.fillStyle = '#ffffff'; rr(c, 700, 560, 130, 34, 17); c.fill();
  }
  /* Экран 3D-сайта для бизнеса (ноутбук): заголовок и кнопка слева, справа — объект в окне 3D-просмотра с кольцом «360°» */
  function bizDraw(c, W, H) {
    var src = 'assets/img/desk3d/resort.jpg';
    c.fillStyle = '#0f1012'; c.fillRect(0, 0, W, H);
    c.fillStyle = '#1b1d21'; c.fillRect(0, 0, W, 54);
    c.fillStyle = '#dbdbdb'; c.fillRect(28, 20, 64, 14);
    c.fillStyle = '#6f747b'; for (var i = 0; i < 4; i++) c.fillRect(W - 360 + i * 80, 24, 54, 6);
    c.fillStyle = '#ffffff'; c.fillRect(40, 120, 330, 26); c.fillRect(40, 160, 250, 26);
    c.fillStyle = 'rgba(219,219,219,.5)'; c.fillRect(40, 214, 320, 10); c.fillRect(40, 236, 270, 10);
    c.fillStyle = '#ffffff'; rr(c, 40, 280, 180, 46, 23); c.fill();
    c.save(); rr(c, 420, 84, 570, 390, 16); c.clip(); pic(c, src, 420, 84, 570, 390); c.fillStyle = 'rgba(14,15,17,.25)'; c.fillRect(420, 84, 570, 390); c.restore();
    c.strokeStyle = 'rgba(255,255,255,.9)'; c.lineWidth = 4; c.beginPath(); c.ellipse(705, 400, 190, 38, 0, 0.25, Math.PI * 2 - 0.25); c.stroke();
    c.fillStyle = '#ffffff'; c.beginPath(); c.moveTo(888, 384); c.lineTo(906, 404); c.lineTo(880, 410); c.closePath(); c.fill();
    c.font = '700 30px Manrope, sans-serif'; c.fillText('360°', 670, 140);
    for (var k = 0; k < 4; k++) { c.fillStyle = k === 1 ? '#2a2d32' : '#1b1d21'; rr(c, 40 + k * 240, 500, 222, 110, 10); c.fill(); c.fillStyle = 'rgba(219,219,219,.6)'; c.fillRect(60 + k * 240, 530, 120, 10); c.fillRect(60 + k * 240, 552, 80, 8); }
  }
  function buildLaptop(id, draw, src) {
    var o = newObject(id, 0, 0, 0), g = o.group;
    g.scale.setScalar(OBJ_S * 0.8);
    var alu = mat('std', 0xc8cacd, { roughness: 0.35, metalness: 0.7 }), dark = mat('std', 0x121316, { roughness: 0.4, metalness: 0.1 });
    mesh(rbox(0.33, 0.012, 0.23, 0.003, 0.01), alu, g);
    var keys = canvasTex(512, 200, function (c, W, H) {
      c.fillStyle = '#1e2126'; c.fillRect(0, 0, W, H);
      var rows = 5, cols = 14, gw = W / cols, gh = H / rows;
      c.fillStyle = '#121417'; c.strokeStyle = 'rgba(219,219,219,.3)'; c.lineWidth = 1.5;
      for (var r = 0; r < rows; r++) for (var k = 0; k < cols; k++) { rr(c, k * gw + 3, r * gh + 3, gw - 6, gh - 6, 4); c.fill(); c.stroke(); }
    });
    var kb = mesh(new T.PlaneGeometry(0.29, 0.105), mat('std', 0xffffff, { map: keys, roughness: 0.6 }), g, 0, 0.0122, -0.035); kb.rotation.x = -Math.PI / 2; kb.castShadow = false;
    var tp = mesh(new T.PlaneGeometry(0.12, 0.07), mat('std', 0xb4b6ba, { roughness: 0.3, metalness: 0.6 }), g, 0, 0.0122, 0.068); tp.rotation.x = -Math.PI / 2; tp.castShadow = false;
    var lid = new T.Group(); lid.position.set(0, 0.012, -0.112); lid.rotation.x = -0.3; g.add(lid);
    var lg = new T.BoxGeometry(0.33, 0.22, 0.006); lg.translate(0, 0.11, -0.003);
    mesh(lg, [alu, alu, alu, alu, dark, alu], lid);
    var site = canvasTex(1024, 640, draw); fontTex.push(site);
    img(src, function () { redraw(site); });
    mesh(new T.PlaneGeometry(0.305, 0.19), mat('basic', 0xffffff, { map: site }), lid, 0, 0.115, 0.0004).castShadow = false;
    contact(g, 0.46, 0.38, 0, -0.01, 0.5);
    finish(o);
  }

  /* Плита со скруглённым прямоугольником спереди (плоскость XY), выдавлена назад по Z. k — изгиб: края уходят назад на k·x². */
  function bentSlab(w, h, d, cr, bev, k) {
    var geo = new T.ExtrudeGeometry(rrShape(w - 2 * bev, h - 2 * bev, cr), { depth: Math.max(d - 2 * bev, 0.0002), bevelEnabled: true, bevelThickness: bev, bevelSize: bev, bevelSegments: 3, curveSegments: 12 });
    geo.translate(0, 0, bev - d / 2);
    if (k) { var p = geo.attributes.position; for (var i = 0; i < p.count; i++) p.setZ(i, p.getZ(i) - k * p.getX(i) * p.getX(i)); geo.computeVertexNormals(); }
    return geo;
  }
  /* VR: свой современный шлем, не копия чьей-то модели. Изогнутый визор с глянцевой передней панелью, двумя камерами
     и индикатором; мягкая накладка для лица; ремень с задней накладкой и колёсиком. По бокам — два контроллера с кольцом. */
  var VR_RY = -0.45;   // шлем повёрнут на три четверти — видно бок и ремень
  function buildVR(id) {
    var o = newObject(id || 'vr', 0.55, 0.0, 0.06), g = o.group;
    var body = mat('std', 0x1e2126), glass = mat('std', 0x0a1420, { roughness: 0.05, metalness: 0.85, keep: true }), lensM = mat('std', 0x040506, { roughness: 0.12, metalness: 0.6, keep: true }), red = mat('basic', 0xff0009);
    var K = 1.6, hs = grp(g, 0, 0, 0.01, VR_RY);
    function front(x) { return 0.046 - K * x * x; }   // передняя поверхность глянцевой панели
    mesh(bentSlab(0.19, 0.098, 0.072, 0.034, 0.012, K), body, hs, 0, 0.049, 0.004);
    mesh(bentSlab(0.168, 0.074, 0.01, 0.026, 0.004, K), glass, hs, 0, 0.051, 0.041).castShadow = false;
    mesh(bentSlab(0.172, 0.078, 0.026, 0.028, 0.008, K), body, hs, 0, 0.047, -0.043);
    [-1, 1].forEach(function (s) {
      var x = s * 0.062, cg = grp(hs, x, 0.027, front(x) + 0.0008, s * Math.atan(2 * K * 0.062));
      var lg = new T.CylinderGeometry(0.0068, 0.0068, 0.004, 24); lg.rotateX(Math.PI / 2);
      mesh(lg, lensM, cg).castShadow = false;
      mesh(new T.TorusGeometry(0.0078, 0.0013, 6, 28), body, cg, 0, 0, 0.0008).castShadow = false;
    });
    mesh(new T.SphereGeometry(0.0024, 10, 8), red, hs, 0.064, 0.078, front(0.064) + 0.0006).castShadow = false;
    // ремень: от боков визора назад и вниз; сзади — накладка с колёсиком регулировки
    var st = mesh(new T.TorusGeometry(0.094, 0.0055, 8, 48, Math.PI), body, hs, 0, 0.052, -0.03);
    st.rotation.x = -Math.PI / 2 - 0.24; st.scale.set(1, 1.4, 2.4);
    var back = grp(hs, 0, 0.021, -0.158, 0, -0.24);
    mesh(bentSlab(0.078, 0.05, 0.016, 0.02, 0.005, -2.2), body, back, 0, 0, -0.002);
    var dg = new T.CylinderGeometry(0.015, 0.015, 0.009, 28); dg.rotateX(Math.PI / 2);
    mesh(dg, body, back, 0, 0, -0.0145);
    // контроллеры: рукоять, круглая площадка с джойстиком и кнопками, кольцо вокруг площадки; лежат на боку
    var circ = new T.Shape(); circ.absarc(0, 0, 0.0185, 0, Math.PI * 2, false);
    var prof = [[0, -0.004], [0.0085, -0.003], [0.0118, 0.004], [0.0138, 0.022], [0.0146, 0.048], [0.0136, 0.07], [0.012, 0.084], [0, 0.089]].map(function (p) { return new T.Vector2(p[0], p[1]); });
    [[-0.235, 0.06, 0.55, -1], [0.255, 0.105, -0.6, 1]].forEach(function (p) {
      var s = p[3], hold = grp(g, p[0], 0, p[1], p[2]), c = new T.Group(); hold.add(c);
      mesh(new T.LatheGeometry(prof, 28), body, c, 0, 0, 0).rotation.x = 0.16;
      var head = grp(c, 0, 0.088, 0.016, 0, 0.3);
      var pk = new T.ExtrudeGeometry(circ, { depth: 0.005, bevelEnabled: true, bevelThickness: 0.004, bevelSize: 0.004, bevelSegments: 3, curveSegments: 28 }); pk.rotateX(-Math.PI / 2);
      mesh(pk, body, head, 0, 0, 0);
      cyl(head, 0.004, 0.004, 0.006, s * 0.005, 0.009, -0.002, body, 16);
      cyl(head, 0.0066, 0.0066, 0.0026, s * 0.005, 0.0145, -0.002, body, 20);
      [[-0.009, 0.006], [-0.003, 0.0125]].forEach(function (b) { cyl(head, 0.0028, 0.0028, 0.0016, s * b[0], 0.009, b[1], body, 12); });
      var ring = mesh(new T.TorusGeometry(0.036, 0.0052, 10, 56), body, c, 0, 0.1, 0.034); ring.rotation.x = Math.PI / 2 - 0.5;
      c.rotation.z = s * 1.25;   // лежит на боку: кольцо стоит, рукоять на столе
      hold.updateMatrixWorld(true); var bb = new T.Box3().setFromObject(c); c.position.y = -bb.min.y;
    });
    o.anchor = new T.Vector3(0, 0.104, 0.012);
    contact(g, 0.56, 0.42, 0, -0.04, 0.5);
    finish(o);
  }

  function buildCamera() {
    var o = newObject('camera', 1.5, 0.06, -0.54), g = o.group;
    var black = mat('std', 0x1a1b1e, { roughness: 0.45, metalness: 0.25 }), black2 = mat('std', 0x0f1012, { roughness: 0.6, metalness: 0.2 }), grey = mat('std', 0x55585e, { roughness: 0.5, metalness: 0.5 });
    var glass = mat('std', 0x0a1420, { roughness: 0.04, metalness: 0.85, keep: true }), red = mat('basic', 0xff0009);
    mesh(rbox(0.17, 0.02, 0.075, 0.003), black2, g, -0.01, 0, 0);
    mesh(rbox(0.13, 0.1, 0.1, 0.008, 0.006), black, g, 0, 0.02, 0);
    var lensG = new T.CylinderGeometry(0.036, 0.038, 0.11, 32); lensG.rotateZ(Math.PI / 2);
    mesh(lensG, black, g, 0.12, 0.07, 0);
    [0.1, 0.14].forEach(function (x) { var r = mesh(new T.TorusGeometry(0.0375, 0.003, 8, 32), grey, g, x, 0.07, 0); r.rotation.y = Math.PI / 2; });
    var mb = new T.CylinderGeometry(0.068, 0.046, 0.06, 4, 1, true); mb.rotateY(Math.PI / 4); mb.rotateZ(-Math.PI / 2);
    var mbm = mesh(mb, black, g, 0.205, 0.07, 0); mbm.material = black.clone(); mbm.material.side = T.DoubleSide; mbm.material.userData.base = mbm.material.color.clone();
    var gl = new T.CircleGeometry(0.03, 32); gl.rotateY(Math.PI / 2);
    mesh(gl, glass, g, 0.1755, 0.07, 0).castShadow = false;
    mesh(new T.BoxGeometry(0.11, 0.012, 0.022), black2, g, -0.005, 0.166, 0);
    [-0.045, 0.035].forEach(function (x) { mesh(new T.BoxGeometry(0.012, 0.046, 0.018), black2, g, x, 0.143, 0); });
    var vf = new T.CylinderGeometry(0.016, 0.018, 0.05, 20); vf.rotateZ(Math.PI / 2);
    mesh(vf, black2, g, -0.09, 0.09, 0.02);
    mesh(new T.SphereGeometry(0.0055, 12, 8), red, g, 0.066, 0.108, -0.03).castShadow = false;
    var arm = new T.Group(); arm.position.set(-0.005, 0.1, -0.06); arm.rotation.y = 0.25; g.add(arm);
    mesh(new T.BoxGeometry(0.012, 0.012, 0.03), black2, arm, 0, 0, 0.012);
    var mon = mesh(new T.BoxGeometry(0.085, 0.056, 0.012), black, arm, 0, 0.012, -0.012);
    var shot = photoTex('assets/img/desk3d/resort.jpg', 320, 200, false);
    var scr = mesh(new T.PlaneGeometry(0.075, 0.046), mat('basic', 0xffffff, { map: shot }), arm, 0, 0.012, -0.0182); scr.rotation.y = Math.PI; scr.castShadow = false;
    contact(g, 0.36, 0.22, 0.04, 0, 0.55);
    o.anchor = new T.Vector3(-0.005, 0.175, 0);
    finish(o);
  }
  /* Дрон — часть ролика: стоит рядом с планшетом (инвест-ролик, имиджевый ролик) и с диорамой (ролик об объекте) */
  function buildDrone(id) {
    var o = newObject(id, 0, 0, 0), dr = o.group;
    var black = mat('std', 0x1a1b1e, { roughness: 0.45, metalness: 0.25 }), black2 = mat('std', 0x0f1012, { roughness: 0.6, metalness: 0.2 }), grey = mat('std', 0x55585e, { roughness: 0.5, metalness: 0.5 });
    var glass = mat('std', 0x0a1420, { roughness: 0.04, metalness: 0.85, keep: true }), red = mat('basic', 0xff0009);
    var blur = mat('basic', 0xffffff, { transparent: true, opacity: 0.07, depthWrite: false });
    o.rotors = [];
    [[-0.02, 0.032], [0.02, 0.032], [-0.02, -0.036], [0.02, -0.036]].forEach(function (p) { mesh(new T.BoxGeometry(0.004, 0.02, 0.006), black2, dr, p[0], 0.01, p[1]); });
    mesh(rbox(0.058, 0.03, 0.104, 0.009, 0.016), black, dr, 0, 0.018, 0);
    mesh(rbox(0.042, 0.007, 0.066, 0.003, 0.012), black2, dr, 0, 0.046, -0.01);
    [[0.088, 0.07, 1], [-0.088, 0.07, 1], [0.082, -0.068, 0], [-0.082, -0.068, 0]].forEach(function (p, i) {
      var sx = p[0] > 0 ? 0.024 : -0.024, sz = p[1] > 0 ? 0.03 : -0.03, dx = p[0] - sx, dz = p[1] - sz, len = Math.hypot(dx, dz);
      var arm = mesh(new T.BoxGeometry(len, 0.007, 0.011), black2, dr, sx + dx / 2, 0.033, sz + dz / 2); arm.rotation.y = Math.atan2(-dz, dx);
      mesh(new T.CylinderGeometry(0.0105, 0.012, 0.014, 20), black, dr, p[0], 0.036, p[1]);
      mesh(new T.CylinderGeometry(0.005, 0.005, 0.004, 14), grey, dr, p[0], 0.045, p[1]);
      var pg = grp(dr, p[0], 0.0468, p[1], 0.5 + i * 1.1);
      mesh(new T.BoxGeometry(0.094, 0.0016, 0.0095), black2, pg, 0, 0, 0).userData.rotor = true;
      var disc = noEdge(mesh(new T.CircleGeometry(0.047, 32), blur, pg, 0, -0.0005, 0)); disc.rotation.x = -Math.PI / 2;
      o.rotors.push(pg); spinners.push({ g: pg, ax: 'y', v: i % 2 ? 11 : -11 });
      mesh(new T.SphereGeometry(0.0026, 8, 6), p[2] ? mat('basic', 0xffffff) : red, dr, p[0], 0.0272, p[1]).castShadow = false;
    });
    mesh(new T.BoxGeometry(0.026, 0.018, 0.018), black2, dr, 0, 0.012, 0.056);
    var dl = new T.CylinderGeometry(0.0072, 0.0072, 0.006, 20); dl.rotateX(Math.PI / 2);
    mesh(dl, glass, dr, 0, 0.012, 0.0665).castShadow = false;
    contact(dr, 0.26, 0.24, 0, 0, 0.42);
    finish(o);
  }

  function buildTablet(id, src) {
    src = src || 'assets/img/desk3d/zhk-2.jpg';
    var o = newObject(id || 'tablet', -0.56, -0.43, 0.04), g = o.group;
    var body = mat('std', 0x2a2c30, { roughness: 0.4, metalness: 0.5 });
    mesh(rbox(0.25, 0.007, 0.175, 0.0025, 0.012), body, g);
    var vid = canvasTex(800, 520, function (c, W, H) {
      c.fillStyle = '#16181b'; c.fillRect(0, 0, W, H);
      var im = IMGS[src]; if (im && im.naturalWidth) cover(c, im, 0, 0, W, H);
      var gr = c.createLinearGradient(0, H * 0.55, 0, H); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(0,0,0,.6)'); c.fillStyle = gr; c.fillRect(0, 0, W, H);
      c.fillStyle = 'rgba(255,255,255,.95)'; c.beginPath(); c.arc(W / 2, H / 2, 58, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#0e0f11'; c.beginPath(); c.moveTo(W / 2 - 16, H / 2 - 26); c.lineTo(W / 2 - 16, H / 2 + 26); c.lineTo(W / 2 + 28, H / 2); c.closePath(); c.fill();
      c.fillStyle = 'rgba(255,255,255,.35)'; c.fillRect(40, H - 40, W - 80, 6); c.fillStyle = '#ffffff'; c.fillRect(40, H - 40, (W - 80) * 0.36, 6);
    });
    img(src, function () { redraw(vid); });
    var s = mesh(new T.PlaneGeometry(0.234, 0.16), mat('basic', 0xffffff, { map: vid }), g, 0, 0.0072, 0); s.rotation.x = -Math.PI / 2; s.castShadow = false;
    contact(g, 0.34, 0.26, 0, 0, 0.5);
    finish(o);
  }

  /* Фотографии рендеров. Для инвестпроекта сверху — курорт, для жилого комплекса — дома */
  function buildPrints(id) {
    var o = newObject(id || 'prints', -0.47, 0.43, 0), g = o.group;
    var paper = mat('std', 0xd9dadc, { roughness: 0.6, keep: true });
    var A = 'assets/img/desk3d/', P = id === 'prints_e' ? [A + 'resort.jpg', A + 'zhk-2.jpg', A + 'zhk-1.jpg'] : [A + 'zhk-1.jpg', A + 'zhk-2.jpg', A + 'resort.jpg'];
    [[P[0], -0.08, -0.02, 0.3], [P[1], 0.085, 0.015, -0.24], [P[2], 0.0, 0.0, 0.05]].forEach(function (p, i) {
      var pg = new T.Group(); pg.position.set(p[1], 0.0011 * (i + 1), p[2]); pg.rotation.y = p[3]; g.add(pg);
      mesh(new T.BoxGeometry(0.16, 0.001, 0.107), paper, pg, 0, 0.0005, 0);
      var ph = mesh(new T.PlaneGeometry(0.16, 0.107), mat('std', 0xffffff, { map: photoTex(p[0], 480, 320, true), roughness: 0.35 }), pg, 0, 0.00105, 0);
      ph.rotation.x = -Math.PI / 2; ph.castShadow = false;
    });
    contact(g, 0.42, 0.26, 0, 0.005, 0.4);
    finish(o);
  }

  /* ---------- помощники для новых предметов ---------- */
  function bx(p, w, h, d, x, y, z, m) { return mesh(new T.BoxGeometry(w, h, d), m, p, x, y + h / 2, z); }
  function cyl(p, rt, rb, h, x, y, z, m, seg) { return mesh(new T.CylinderGeometry(rt, rb, h, seg || 24), m, p, x, y + h / 2, z); }
  function lay(p, w, d, x, y, z, m) { var o = mesh(new T.PlaneGeometry(w, d), m, p, x, y, z); o.rotation.x = -Math.PI / 2; o.castShadow = false; return o; }
  function grp(p, x, y, z, ry, rx) { var q = new T.Group(); q.position.set(x, y || 0, z); q.rotation.set(rx || 0, ry || 0, 0); p.add(q); return q; }
  function bodyM() { return mat('std', 0); }
  function paperM() { return mat('std', 0xdedfe1, { roughness: 0.75, keep: true }); }
  function litM(c) { return mat('basic', c || 0xe9e5dc); }
  function texM(t, rough) { return mat('std', 0xffffff, { map: t, roughness: rough || 0.7 }); }
  function scrM(t) { return mat('basic', 0xffffff, { map: t }); }
  function imgTex(src, w, h, draw) { var t = canvasTex(w, h, draw); img(src, function () { redraw(t); }); return t; }
  function pic(c, src, x, y, w, h) { var im = IMGS[src]; if (im && im.naturalWidth) cover(c, im, x, y, w, h); else { c.fillStyle = '#25282d'; c.fillRect(x, y, w, h); } }
  function lines(c, x, y, w, n, col, gap, hh) { c.fillStyle = col; for (var i = 0; i < n; i++) c.fillRect(x, y + i * (gap || 18), i === n - 1 && n > 1 ? w * 0.6 : w, hh || 6); }
  function bars(c, x, y, w, h, n, col, seed) { var rnd = seeded(seed || 3), bw = w / n; c.fillStyle = col; for (var i = 0; i < n; i++) { var bh = h * (0.3 + 0.7 * ((i + 1) / n) * (0.75 + rnd() * 0.3)); c.fillRect(x + i * bw + bw * 0.18, y + h - bh, bw * 0.64, bh); } }
  function noEdge(m) { m.castShadow = false; m.userData.noEdge = true; return m; }
  function facadeTex(cols, rows, seed) {
    return canvasTex(224, Math.round(224 * rows / cols * 0.62), function (c, W, H) {
      var rnd = seeded(seed), cw = W / cols, rh = H / rows;
      c.fillStyle = '#121417'; c.fillRect(0, 0, W, H);
      c.fillStyle = '#2a2d32'; for (var j = 0; j <= rows; j++) c.fillRect(0, Math.round(j * rh), W, 1);
      for (var r = 0; r < rows; r++) for (var k = 0; k < cols; k++) {
        var on = rnd() < 0.42;
        c.fillStyle = on ? 'rgba(255,255,255,' + (0.35 + rnd() * 0.6).toFixed(2) + ')' : '#1d2024';
        c.fillRect(Math.round(k * cw) + 2, Math.round(r * rh) + 3, Math.round(cw) - 3, Math.round(rh) - 5);
      }
    });
  }
  function ringTrees(g, pts, y) {
    var m = litM(0x8a9099);
    pts.forEach(function (p) { var tr = mesh(new T.TorusGeometry(0.011, 0.001, 4, 22), m, g, p[0], y, p[1]); tr.rotation.x = Math.PI / 2; noEdge(tr); });
  }

  /* 3D-сайт с выбором квартир — монитор с сайтом ЖК */
  function buildMonitor() {
    var o = newObject('site', 0, 0, 0), g = o.group, b = bodyM();
    mesh(rbox(0.17, 0.01, 0.11, 0.003, 0.012), b, g);
    bx(g, 0.03, 0.14, 0.016, 0, 0.01, -0.026, b);
    var sg = grp(g, 0, 0.115, -0.014, 0, -0.08);
    bx(sg, 0.5, 0.29, 0.014, 0, 0, 0, b);
    var ui = canvasTex(1024, 640, siteDraw); fontTex.push(ui);
    img('assets/img/desk3d/zhk-1.jpg', function () { redraw(ui); });
    mesh(new T.PlaneGeometry(0.484, 0.274), scrM(ui), sg, 0, 0.145, 0.0072).castShadow = false;
    contact(g, 0.56, 0.24, 0, -0.01, 0.45);
    o.anchor = new T.Vector3(0, 0.4, -0.02);
    finish(o);
  }
  /* Сенсорный стол офиса продаж у макета ЖК: тумба и наклонная панель с генпланом — часть 3D-программы */
  function buildTouch() {
    var o = newObject('touch', 0, 0, 0), g = o.group, b = bodyM();
    mesh(rbox(0.2, 0.01, 0.13, 0.003, 0.01), b, g);
    bx(g, 0.13, 0.09, 0.07, 0, 0.01, 0, b);
    var top = grp(g, 0, 0.112, 0, 0, 0.42);
    mesh(rbox(0.34, 0.016, 0.22, 0.004, 0.014), b, top, 0, -0.008, 0);
    var plan = canvasTex(900, 580, function (c, W, H) {
      c.fillStyle = '#c3c8cc'; c.fillRect(0, 0, W, H);
      c.fillStyle = '#a7b1a2'; [[70, 330, 230, 200], [640, 70, 210, 150], [400, 400, 190, 150], [80, 70, 150, 120]].forEach(function (r) { rr(c, r[0], r[1], r[2], r[3], 18); c.fill(); });
      c.fillStyle = '#eceeef'; c.fillRect(0, 270, W, 28); c.fillRect(330, 0, 28, H); c.fillRect(610, 270, 24, H);
      var rnd = seeded(17);
      for (var r = 0; r < 2; r++) for (var k = 0; k < 4; k++) {
        if (r === 0 && k > 1) continue;
        var x = 380 + k * 66, y = 50 + r * 110; if (r === 0) x = 400 + k * 90;
        c.fillStyle = '#8c939b'; c.fillRect(x + 6, y + 8, 50, 74); c.fillStyle = '#e4e6e8'; c.fillRect(x, y, 50, 74);
      }
      for (var q = 0; q < 5; q++) { var bx0 = 660 + (q % 3) * 72, by0 = 330 + Math.floor(q / 3) * 120; c.fillStyle = '#8c939b'; c.fillRect(bx0 + 6, by0 + 8, 54, 86); c.fillStyle = q === 1 ? '#2a2d32' : '#e4e6e8'; c.fillRect(bx0, by0, 54, 86); }
      c.strokeStyle = '#ffffff'; c.lineWidth = 4; c.strokeRect(732, 330, 54, 86);
      for (var t = 0; t < 26; t++) { c.fillStyle = 'rgba(96,110,92,.65)'; c.beginPath(); c.arc(30 + rnd() * 300, 320 + rnd() * 240, 7 + rnd() * 6, 0, 7); c.fill(); }
      c.fillStyle = 'rgba(14,15,17,.86)'; rr(c, 18, 18, 52, H - 36, 12); c.fill();
      c.fillStyle = 'rgba(219,219,219,.7)'; for (var i = 0; i < 6; i++) { rr(c, 30, 40 + i * 62, 28, 28, 6); c.fill(); }
      c.fillStyle = 'rgba(14,15,17,.86)'; rr(c, W / 2 - 150, 18, 300, 44, 22); c.fill(); c.fillStyle = '#dbdbdb'; c.fillRect(W / 2 - 110, 36, 140, 8);
      c.fillStyle = 'rgba(14,15,17,.86)'; rr(c, W - 250, H - 150, 220, 124, 12); c.fill(); c.fillStyle = '#ffffff'; c.fillRect(W - 228, H - 126, 120, 10); c.fillStyle = 'rgba(219,219,219,.6)'; c.fillRect(W - 228, H - 104, 160, 7); c.fillRect(W - 228, H - 88, 130, 7);
      c.fillStyle = '#ffffff'; rr(c, W - 228, H - 66, 100, 28, 14); c.fill();
    });
    lay(top, 0.316, 0.196, 0, 0.0085, 0, scrM(plan));
    contact(g, 0.42, 0.3, 0, 0.02, 0.5);
    finish(o);
  }

  /* Диорамы объектов на фоне ролика об объекте: завод, ГЭС, ветровая и солнечная станции, орошение. Каждая — на своей подставке. */
  var DIO = [['dio1', 'factory', 'Завод'], ['dio2', 'hpp', 'ГЭС'], ['dio3', 'wind', 'Ветровая станция'], ['dio4', 'solar', 'Солнечная станция'], ['dio5', 'irrig', 'Орошение']];
  function buildDio(d) {
    var o = newObject(d[0], 0, 0, 0), g = o.group, b = bodyM(), L = litM(), kind = d[1], y0 = 0.012;
    var water = mat('basic', 0x56687a);
    mesh(rbox(0.26, y0, 0.2, 0.003, 0.012), b, g);
    o.rotors = [];
    if (kind === 'factory') { var s = grp(g, 0, y0, 0.0); s.scale.setScalar(0.6); factoryBody(s); }
    else if (kind === 'hpp') {
      /* плотина между двумя склонами, водохранилище сзади, здание ГЭС и река спереди */
      [[-0.125, -0.048, 1], [0.048, 0.125, -1]].forEach(function (q) {
        var sh = new T.Shape(), x0 = q[0], x1 = q[1], hi = 0.078, lo = 0.045;
        if (q[2] > 0) { sh.moveTo(x0, 0); sh.lineTo(x1, 0); sh.lineTo(x1, hi); sh.lineTo((x0 + x1) / 2, hi + 0.008); sh.lineTo(x0, lo); }
        else { sh.moveTo(x0, 0); sh.lineTo(x1, 0); sh.lineTo(x1, lo); sh.lineTo((x0 + x1) / 2, hi + 0.008); sh.lineTo(x0, hi); }
        sh.closePath();
        var hg = new T.ExtrudeGeometry(sh, { depth: 0.17, bevelEnabled: false }); hg.translate(0, y0, -0.09);
        mesh(hg, b, g);
      });
      bx(g, 0.096, 0.07, 0.022, 0, y0, -0.012, b);
      noEdge(lay(g, 0.096, 0.074, 0, y0 + 0.062, -0.06, water));
      [-0.03, 0, 0.03].forEach(function (x) { noEdge(mesh(new T.PlaneGeometry(0.008, 0.05), L, g, x, y0 + 0.032, -0.0005)); });
      bx(g, 0.07, 0.022, 0.03, 0, y0, 0.017, b);
      noEdge(mesh(new T.PlaneGeometry(0.056, 0.006), L, g, 0, y0 + 0.012, 0.0325));
      noEdge(lay(g, 0.05, 0.058, 0, y0 + 0.0008, 0.066, water));
    } else if (kind === 'wind') {
      [[-0.07, -0.03, 0.15, 0.4], [0.02, 0.03, 0.18, 1.9], [0.085, -0.045, 0.14, 3.1]].forEach(function (q) { addTurbine(o, q[0], q[1], q[2], q[3], g, y0); });
      bx(g, 0.04, 0.018, 0.03, -0.08, y0, 0.06, b);
      noEdge(mesh(new T.PlaneGeometry(0.03, 0.004), L, g, -0.08, y0 + 0.012, 0.0752));
    } else if (kind === 'solar') {
      var solar = mat('std', 0x1c2633, { roughness: 0.25, metalness: 0.6 });
      for (var r = 0; r < 3; r++) for (var k = 0; k < 4; k++) {
        var x = -0.087 + k * 0.058, z = -0.058 + r * 0.05, sp = grp(g, x, y0 + 0.012, z, 0, -0.55);
        bx(sp, 0.05, 0.0025, 0.03, 0, 0, 0, solar);
        cyl(g, 0.0016, 0.0016, 0.012, x, y0, z, b, 6);
      }
      bx(g, 0.03, 0.022, 0.022, 0.095, y0, 0.075, b);
    } else if (kind === 'irrig') {
      /* круговое поле с поливальной установкой и канал вдоль края */
      var field = canvasTex(256, 256, function (c, W, H) {
        c.fillStyle = '#353a33'; c.fillRect(0, 0, W, H);
        c.fillStyle = '#566050'; c.beginPath(); c.arc(W / 2, H / 2, W * 0.47, 0, 7); c.fill();
        c.fillStyle = '#6c7563'; c.beginPath(); c.moveTo(W / 2, H / 2); c.arc(W / 2, H / 2, W * 0.47, -0.4, 1.3); c.closePath(); c.fill();
        c.strokeStyle = 'rgba(20,22,20,.35)'; c.lineWidth = 2; for (var i = 1; i < 7; i++) { c.beginPath(); c.arc(W / 2, H / 2, W * 0.067 * i, 0, 7); c.stroke(); }
      });
      noEdge(lay(g, 0.17, 0.17, -0.02, y0 + 0.0008, -0.01, texM(field, 0.9)));
      cyl(g, 0.006, 0.008, 0.024, -0.02, y0, -0.01, b, 14);
      var arm = grp(g, -0.02, y0, -0.01, 0.55);
      bx(arm, 0.08, 0.003, 0.003, 0.04, 0.02, 0, b);
      [0.03, 0.058, 0.08].forEach(function (x) { cyl(arm, 0.0014, 0.0014, 0.02, x, 0, 0, b, 6); bx(arm, 0.004, 0.004, 0.012, x, 0, 0, b); });
      noEdge(lay(g, 0.022, 0.19, 0.105, y0 + 0.0009, 0, water));
    }
    contact(g, 0.34, 0.28, 0, 0, 0.45);
    if (!o.rotors.length) delete o.rotors;
    finish(o);
  }
  /* Завод (для диорамы): цех с пилообразной крышей, корпус с окнами, силосы, труба, дорога и деревья */
  function factoryBody(g) {
    var b = bodyM(), L = litM();
    var y0 = 0, hx0 = -0.19, hw = 0.24, hd = 0.17, ht = 0.07, n = 3, td = hd / n, hz = -0.01;
    bx(g, hw, ht, hd, hx0 + hw / 2, y0, hz, b);
    noEdge(mesh(new T.PlaneGeometry(hw - 0.02, 0.012), L, g, hx0 + hw / 2 + 0.01, y0 + 0.048, hz + hd / 2 + 0.0006));
    noEdge(mesh(new T.PlaneGeometry(0.032, 0.03), litM(0xcfd2d6), g, hx0 + 0.04, y0 + 0.015, hz + hd / 2 + 0.0006));
    for (var i = 0; i < n; i++) {
      var sh = new T.Shape(); sh.moveTo(0, 0); sh.lineTo(td, 0); sh.lineTo(0, 0.03); sh.closePath();
      var tg = new T.ExtrudeGeometry(sh, { depth: hw, bevelEnabled: false }); tg.rotateY(Math.PI / 2);
      var fz = hz + hd / 2 - i * td;
      tg.translate(hx0, y0 + ht, fz);
      mesh(tg, b, g);
      noEdge(mesh(new T.PlaneGeometry(hw - 0.008, 0.022), L, g, hx0 + hw / 2, y0 + ht + 0.013, fz + 0.0006));
    }
    var fx = facadeTex(5, 7, 91), side = mat('std', 0xffffff, { roughness: 0.7, map: fx, emissive: 0xffffff, emissiveMap: fx, emissiveIntensity: 0.75 });
    mesh(new T.BoxGeometry(0.09, 0.12, 0.1), [side, side, b, b, side, side], g, 0.115, y0 + 0.06, 0.02);
    bx(g, 0.06, 0.012, 0.07, 0.115, y0 + 0.12, 0.02, b);
    [0.1, 0.165].forEach(function (x) { cyl(g, 0.026, 0.026, 0.07, x, y0, -0.1, b, 28); mesh(new T.ConeGeometry(0.026, 0.014, 28), b, g, x, y0 + 0.077, -0.1); });
    cyl(g, 0.01, 0.013, 0.27, -0.165, y0, -0.1, b, 20);
    mesh(new T.SphereGeometry(0.0055, 12, 8), mat('basic', 0xff0009), g, -0.165, y0 + 0.276, -0.1).castShadow = false;
    bx(g, 0.42, 0.0015, 0.024, 0, y0, 0.11, litM(0x5d636c));
    ringTrees(g, [[-0.18, 0.137], [-0.12, 0.137], [-0.06, 0.137]], y0 + 0.0005);
  }
  var bladeGeo = null, spinners = [];
  function addTurbine(o, x, z, h, phase, parent, y) {
    var b = bodyM(), t = grp(parent || o.group, x, y || 0, z, -0.3);
    if (!bladeGeo) {
      var bs = new T.Shape(), L = 0.066;
      bs.moveTo(-0.0028, 0.004); bs.lineTo(0.0042, 0.004); bs.lineTo(0.0036, 0.018); bs.lineTo(0.0011, L); bs.lineTo(-0.0007, L); bs.lineTo(-0.0026, 0.018); bs.closePath();
      bladeGeo = new T.ExtrudeGeometry(bs, { depth: 0.0014, bevelEnabled: false }); bladeGeo.translate(0, 0, -0.0007);
    }
    cyl(t, 0.012, 0.014, 0.004, 0, 0, 0, b, 20);
    cyl(t, 0.0034, 0.0062, h, 0, 0.004, 0, b, 16);
    mesh(rbox(0.012, 0.011, 0.028, 0.003, 0.003), b, t, 0, 0.002 + h, -0.004);
    var rotor = grp(t, 0, 0.0075 + h, 0.012);
    var hub = mesh(new T.SphereGeometry(0.0055, 14, 10), b, rotor, 0, 0, 0.003); hub.scale.set(1, 1, 1.5); hub.userData.rotor = true;
    for (var i = 0; i < 3; i++) { var bl = mesh(bladeGeo, b, rotor); bl.rotation.z = i * Math.PI * 2 / 3; bl.userData.rotor = true; }
    rotor.rotation.z = phase;
    spinners.push({ g: rotor, ax: 'z', v: -(1 + o.rotors.length * 0.17) }); o.rotors.push(rotor);
    contact(t, 0.07, 0.07, 0, 0, 0.35);
  }

  function buildKiosk() {
    var o = newObject('kiosk', 1.2, 0.43, -0.12), g = o.group, b = bodyM();
    mesh(rbox(0.12, 0.01, 0.09, 0.003, 0.012), b, g);
    mesh(rbox(0.032, 0.17, 0.022, 0.004, 0.006), b, g, 0, 0.01, -0.004);
    var sg = grp(g, 0, 0.165, 0.002, 0, -0.42);
    bx(sg, 0.15, 0.21, 0.012, 0, -0.02, 0, b);
    var ui = imgTex('assets/img/desk3d/resort.jpg', 420, 590, function (c, W, H) {
      c.fillStyle = '#0f1012'; c.fillRect(0, 0, W, H);
      pic(c, 'assets/img/desk3d/resort.jpg', 0, 0, W, 330);
      c.fillStyle = 'rgba(14,15,17,.18)'; c.fillRect(0, 0, W, 330);
      [[110, 150], [240, 110], [320, 215]].forEach(function (q, i) {
        c.fillStyle = 'rgba(255,255,255,.32)'; c.beginPath(); c.arc(q[0], q[1], 22, 0, 7); c.fill();
        c.fillStyle = i === 1 ? '#ff0009' : '#ffffff'; c.beginPath(); c.arc(q[0], q[1], 9, 0, 7); c.fill();
      });
      c.fillStyle = '#dbdbdb'; c.fillRect(24, 356, 200, 12);
      c.fillStyle = 'rgba(219,219,219,.5)'; c.fillRect(24, 382, 300, 8);
      for (var k = 0; k < 2; k++) for (var j = 0; j < 2; j++) { c.fillStyle = (k + j) ? '#1d1f23' : '#2a2d32'; rr(c, 24 + j * 190, 410 + k * 80, 176, 66, 8); c.fill(); c.fillStyle = 'rgba(219,219,219,.6)'; c.fillRect(40 + j * 190, 438 + k * 80, 90, 8); }
    });
    mesh(new T.PlaneGeometry(0.138, 0.196), scrM(ui), sg, 0, 0.085, 0.0063).castShadow = false;
    contact(g, 0.22, 0.2, 0, 0, 0.45);
    finish(o);
  }

  /* Дизайн буклетов и брошюр: раскрытый буклет-гармошка стоит зигзагом, рядом — две брошюры */
  function buildBooklets() {
    var o = newObject('stand', 0, 0, 0), g = o.group, pM = paperM(), A = 'assets/img/desk3d/';
    function page(src, dark) {
      return texM(imgTex(src, 300, 420, function (c, W, H) {
        c.fillStyle = dark ? '#1e2126' : '#ececea'; c.fillRect(0, 0, W, H);
        pic(c, src, 0, 0, W, H * 0.55);
        c.fillStyle = dark ? '#ffffff' : '#1e2126'; c.fillRect(22, H * 0.63, W * 0.62, 16);
        lines(c, 22, H * 0.71, W - 44, 4, dark ? 'rgba(219,219,219,.5)' : '#9a9da2', 20, 6);
      }), 0.6);
    }
    var pw = 0.078, ph = 0.11, ang = 0.5, P = new T.Vector3(-0.15, 0, 0.02), srcs = [A + 'zhk-1.jpg', A + 'resort.jpg', A + 'zhk-2.jpg'];
    for (var i = 0; i < 3; i++) {
      var a = i % 2 ? -ang : ang, dx = Math.cos(a) * pw, dz = -Math.sin(a) * pw;
      var pg = grp(g, P.x + dx / 2, 0, P.z + dz / 2, a);
      mesh(new T.BoxGeometry(pw, ph, 0.0016), [pM, pM, pM, pM, page(srcs[i], i === 1), pM], pg, 0, ph / 2, 0);
      P.x += dx; P.z += dz;
    }
    [[0.115, -0.01, -0.2, A + 'zhk-2.jpg'], [0.13, 0.02, 0.14, A + 'zhk-1.jpg']].forEach(function (q, i) {
      var bg = grp(g, q[0], i * 0.0046, q[1], q[2]);
      bx(bg, 0.105, 0.0045, 0.148, 0, 0, 0, pM);
      lay(bg, 0.105, 0.148, 0, 0.0046, 0, page(q[3], true));
    });
    contact(g, 0.46, 0.28, -0.01, 0, 0.45);
    o.anchor = new T.Vector3(-0.07, ph + 0.004, 0.0);
    finish(o);
  }

  function buildPhone() {
    var o = newObject('phone', 1.5, 0.45, -0.2), g = o.group, b = bodyM();
    mesh(rbox(0.074, 0.008, 0.06, 0.003, 0.01), b, g);
    bx(g, 0.062, 0.012, 0.008, 0, 0.008, 0.016, b);
    var sp = grp(g, 0, 0.008, 0.002, 0, -0.27); bx(sp, 0.05, 0.09, 0.005, 0, 0, -0.0026, b);
    var pg = grp(g, 0, 0.008, 0.006, 0, -0.27);
    var pgeo = rbox(0.066, 0.0085, 0.134, 0.003, 0.01); pgeo.rotateX(Math.PI / 2); pgeo.translate(0, 0.067, 0);
    mesh(pgeo, b, pg);
    var ui = imgTex('assets/img/desk3d/resort.jpg', 300, 620, function (c, W, H) {
      c.fillStyle = '#16181b'; c.fillRect(0, 0, W, H);
      pic(c, 'assets/img/desk3d/resort.jpg', 0, 0, W, H);
      var gr = c.createLinearGradient(0, H * 0.55, 0, H); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(0,0,0,.72)'); c.fillStyle = gr; c.fillRect(0, 0, W, H);
      c.fillStyle = 'rgba(255,255,255,.95)'; c.fillRect(14, 14, 84, 4); c.fillRect(104, 14, 84, 4); c.fillStyle = 'rgba(255,255,255,.4)'; c.fillRect(194, 14, 92, 4);
      [330, 392, 454].forEach(function (y) { c.fillStyle = '#ffffff'; c.beginPath(); c.arc(W - 30, y, 15, 0, 7); c.fill(); });
      c.fillStyle = '#ffffff'; c.fillRect(18, H - 74, 170, 11); c.fillStyle = 'rgba(255,255,255,.6)'; c.fillRect(18, H - 50, 120, 8);
    });
    mesh(new T.PlaneGeometry(0.058, 0.124), scrM(ui), pg, 0, 0.067, 0.0088).castShadow = false;
    contact(g, 0.13, 0.13, 0, -0.01, 0.45);
    finish(o);
  }

  /* Пакет — не предмет, а одна белая кнопка, которая лежит на столе в правом нижнем углу блока: «Заказать весь пакет со скидкой →»
     (у подписки — «Оформить подписку →»). Название пакета — в выноске при наведении и в панели. */
  var PBTN_W = { portfolio: 0.62, box: 0.62, digital: 0.56, subs: 0.44 }, PBTN_D = 0.1, fontTex = [];
  function wrapText(c, s, maxPx) {
    var out = [], cur = '';
    s.split(' ').forEach(function (w) { var t = cur ? cur + ' ' + w : w; if (cur && c.measureText(t).width > maxPx) { out.push(cur); cur = w; } else cur = t; });
    if (cur) out.push(cur);
    return out;
  }
  function buildPackBtn(id) {
    var o = newObject(id, 0, 0, 0, true), g = o.group, W = PBTN_W[id], D = PBTN_D, sub = id === 'subs';
    mesh(rbox(W, 0.008, D, 0.003, D / 2 - 0.004), mat('std', 0xe9e9e7, { roughness: 0.5, keep: true }), g);
    var t = canvasTex(Math.round(W * 2000), Math.round(D * 2000), function (c, CW, CH) {
      c.clearRect(0, 0, CW, CH);
      c.fillStyle = '#ffffff'; rr(c, 2, 2, CW - 4, CH - 4, CH / 2 - 2); c.fill();
      var s = (sub ? 'Оформить подписку' : 'Заказать весь пакет со скидкой') + '  →', fs = 72;
      c.fillStyle = '#0e0f11'; c.textAlign = 'center';
      do { c.font = '700 ' + fs + 'px Manrope, sans-serif'; fs -= 2; } while (fs > 30 && c.measureText(s).width > CW - 90);
      c.fillText(s, CW / 2, CH / 2 + fs * 0.36);
    });
    fontTex.push(t);
    noEdge(lay(g, W, D, 0, 0.0082, 0, mat('basic', 0xffffff, { map: t, transparent: true })));   // без контура: иначе вокруг кнопки видна прямоугольная рамка
    contact(g, W + 0.1, D + 0.08, 0, 0, 0.4);
    o.anchor = new T.Vector3(0, 0.009, 0);
    finish(o);
  }

  function buildPresentation(id) {
    var o = newObject(id || 'present', -0.88, 0.45, -0.05), g = o.group;
    var pL = imgTex('assets/img/desk3d/zhk-1.jpg', 480, 680, function (c, W, H) {
      c.fillStyle = '#ececea'; c.fillRect(0, 0, W, H);
      pic(c, 'assets/img/desk3d/zhk-1.jpg', 0, 0, W, H * 0.62);
      c.fillStyle = '#1e2126'; c.fillRect(32, H * 0.68, W * 0.62, 20);
      lines(c, 32, H * 0.75, W - 64, 4, '#9a9da2', 22, 7);
    });
    var pR = canvasTex(480, 680, function (c, W, H) {
      c.fillStyle = '#ececea'; c.fillRect(0, 0, W, H);
      c.fillStyle = '#1e2126'; c.fillRect(32, 40, W * 0.5, 18);
      lines(c, 32, 76, W * 0.6, 2, '#9a9da2', 16, 6);
      bars(c, 32, 130, W - 64, 200, 7, '#2a2d32', 5);
      c.fillStyle = '#c9cbce'; c.fillRect(32, 332, W - 64, 2);
      c.fillStyle = '#2a2d32'; c.beginPath(); c.moveTo(130, 465); c.arc(130, 465, 80, -1.57, 2.2); c.closePath(); c.fill();
      c.fillStyle = '#9a9da2'; c.beginPath(); c.moveTo(130, 465); c.arc(130, 465, 80, 2.2, 4.71); c.closePath(); c.fill();
      lines(c, 250, 420, 190, 4, '#a4a7ac', 24, 7);
      lines(c, 32, 590, W - 64, 3, '#b4b7bb', 20, 6);
    });
    [[-1, pL], [1, pR]].forEach(function (s) {
      var pg = grp(g, s[0] * 0.0865, 0, 0, 0);
      bx(pg, 0.17, 0.004, 0.24, 0, 0, 0, paperM());
      lay(pg, 0.17, 0.24, 0, 0.0041, 0, texM(s[1], 0.65));
    });
    var bc = imgTex('assets/img/desk3d/zhk-2.jpg', 300, 600, function (c, W, H) {
      c.fillStyle = '#1e2126'; c.fillRect(0, 0, W, H);
      pic(c, 'assets/img/desk3d/zhk-2.jpg', 0, 0, W, H * 0.6);
      c.fillStyle = '#ffffff'; c.fillRect(22, H * 0.68, W * 0.62, 16);
      lines(c, 22, H * 0.76, W * 0.7, 3, 'rgba(219,219,219,.5)', 20, 6);
    });
    [[-0.13, 0.03, 0.32], [-0.105, 0.045, 0.08]].forEach(function (p, i) {
      var bg = grp(g, p[0], 0.004 + i * 0.0032, p[1], p[2]);
      bx(bg, 0.09, 0.003, 0.18, 0, 0, 0, paperM());
      lay(bg, 0.09, 0.18, 0, 0.0031, 0, texM(bc, 0.6));
    });
    contact(g, 0.5, 0.36, -0.02, 0, 0.45);
    finish(o);
  }

  function buildBook() {
    var o = newObject('book', -1.12, 0.0, -0.1), g = o.group, b = bodyM();
    var cov = canvasTex(560, 400, function (c, W, H) {
      c.fillStyle = '#1e2126'; c.fillRect(0, 0, W, H);
      c.strokeStyle = 'rgba(219,219,219,.35)'; c.lineWidth = 3; c.strokeRect(26, 26, W - 52, H - 52);
      c.fillStyle = '#e9e9e7'; c.fillRect(60, 70, 250, 22);
      c.fillStyle = 'rgba(219,219,219,.55)'; c.fillRect(60, 110, 180, 10);
      bars(c, 60, 230, 190, 100, 5, 'rgba(219,219,219,.45)', 7);
      c.strokeStyle = '#e9e9e7'; c.lineWidth = 5; c.beginPath(); c.moveTo(320, 320); c.lineTo(370, 280); c.lineTo(410, 298); c.lineTo(490, 210); c.stroke();
    });
    bx(g, 0.28, 0.003, 0.2, 0, 0, 0, b);
    bx(g, 0.268, 0.021, 0.19, 0.004, 0.003, 0, paperM());
    mesh(new T.BoxGeometry(0.28, 0.003, 0.2), [b, b, texM(cov, 0.6), b, b, b], g, 0, 0.0255, 0);
    bx(g, 0.01, 0.027, 0.2, -0.137, 0, 0, b);
    [-0.055, 0.0, 0.055].forEach(function (z, i) { bx(g, 0.014, 0.0016, 0.024, 0.141, 0.012 + i * 0.002, z, paperM()); });
    contact(g, 0.38, 0.3, 0, 0, 0.5);
    finish(o);
  }

  function buildFinmodel() {
    var o = newObject('finmodel', -0.8, 0.0, 0.06), g = o.group, b = bodyM();
    mesh(rbox(0.21, 0.006, 0.29, 0.002, 0.012), b, g);
    bx(g, 0.19, 0.0015, 0.25, 0, 0.006, 0.012, paperM());
    var sheet = canvasTex(500, 660, function (c, W, H) {
      c.fillStyle = '#ececea'; c.fillRect(0, 0, W, H);
      c.fillStyle = '#1e2126'; c.fillRect(28, 28, 210, 16);
      c.fillStyle = '#d3d5d8'; c.fillRect(28, 66, W - 56, 26);
      c.strokeStyle = '#b9bbbe'; c.lineWidth = 1.5;
      for (var r = 0; r <= 8; r++) { c.beginPath(); c.moveTo(28, 92 + r * 26); c.lineTo(W - 28, 92 + r * 26); c.stroke(); }
      [28, 170, 270, 370, W - 28].forEach(function (x) { c.beginPath(); c.moveTo(x, 66); c.lineTo(x, 300); c.stroke(); });
      c.fillStyle = '#6f7379';
      for (var q = 0; q < 8; q++) {
        c.fillRect(40, 102 + q * 26, 50 + (q * 13) % 50, 6);
        for (var k = 0; k < 4; k++) { var ww = 30 + ((q * 7 + k * 5) % 34); c.fillRect([160, 260, 360, W - 38][k] - ww, 102 + q * 26, ww, 6); }
      }
      bars(c, 36, 330, W - 72, 200, 8, '#2a2d32', 11);
      c.strokeStyle = '#1e2126'; c.lineWidth = 3; c.beginPath(); c.moveTo(50, 490); c.lineTo(140, 460); c.lineTo(230, 478); c.lineTo(320, 410); c.lineTo(400, 390); c.lineTo(456, 350); c.stroke();
      lines(c, 36, 575, W - 72, 3, '#a4a7ac', 20, 6);
    });
    lay(g, 0.19, 0.25, 0, 0.0076, 0.012, texM(sheet));
    bx(g, 0.08, 0.012, 0.026, 0, 0.006, -0.128, b);
    cyl(g, 0.006, 0.006, 0.004, 0, 0.018, -0.128, b, 16);
    var calc = grp(g, 0.155, 0, 0.07, -0.22);
    mesh(rbox(0.07, 0.01, 0.1, 0.003, 0.008), b, calc);
    var keys = canvasTex(256, 370, function (c, W, H) {
      c.fillStyle = '#1e2126'; c.fillRect(0, 0, W, H);
      c.fillStyle = '#0f1012'; rr(c, 16, 16, W - 32, 74, 8); c.fill();
      c.fillStyle = 'rgba(255,255,255,.8)'; c.fillRect(W - 130, 44, 98, 20);
      c.strokeStyle = 'rgba(219,219,219,.35)'; c.lineWidth = 2;
      for (var r = 0; r < 5; r++) for (var k = 0; k < 4; k++) { rr(c, 16 + k * 57, 108 + r * 51, 48, 40, 6); c.fillStyle = k === 3 ? '#2a2d32' : '#121417'; c.fill(); c.stroke(); }
    });
    lay(calc, 0.062, 0.09, 0, 0.0102, 0.002, texM(keys, 0.6));
    var pen = new T.CylinderGeometry(0.0038, 0.0038, 0.12, 12); pen.rotateZ(Math.PI / 2);
    var pp = grp(g, 0.02, 0.0076, 0.05, 0.9); mesh(pen, b, pp, 0, 0.0038, 0);
    var tipg = new T.ConeGeometry(0.0038, 0.012, 12); tipg.rotateZ(-Math.PI / 2); mesh(tipg, b, pp, 0.066, 0.0038, 0);
    contact(g, 0.38, 0.4, 0.04, 0, 0.45);
    finish(o);
  }

  function buildSketch() {
    var o = newObject('sketch', -1.1, -0.45, 0), g = o.group, b = bodyM(), L = litM();
    bx(g, 0.36, 0.0015, 0.25, 0, 0, 0, paperM());
    var sk = canvasTex(900, 625, function (c, W, H) {
      c.fillStyle = '#d5d5d2'; c.fillRect(0, 0, W, H);
      c.lineCap = 'round'; c.lineJoin = 'round';
      c.strokeStyle = 'rgba(62,67,74,.4)'; c.lineWidth = 3;
      for (var k = 0; k < 4; k++) { c.beginPath(); c.moveTo(0, 30 + k * 24); c.bezierCurveTo(W * 0.3, 6 + k * 28, W * 0.6, 80 + k * 20, W, 24 + k * 26); c.stroke(); }
      c.fillStyle = '#aab3bd'; c.strokeStyle = '#3e434a'; c.lineWidth = 6;
      c.beginPath(); c.moveTo(W * 0.42, H * 0.62); c.bezierCurveTo(W * 0.48, H * 0.5, W * 0.66, H * 0.52, W * 0.7, H * 0.66); c.bezierCurveTo(W * 0.74, H * 0.8, W * 0.62, H * 0.95, W * 0.52, H * 0.9); c.bezierCurveTo(W * 0.42, H * 0.86, W * 0.38, H * 0.72, W * 0.42, H * 0.62); c.closePath(); c.fill(); c.stroke();
      c.lineWidth = 6;
      c.beginPath(); c.moveTo(W * 0.02, H * 0.97); c.bezierCurveTo(W * 0.2, H * 0.7, W * 0.3, H * 0.55, W * 0.36, H * 0.46); c.bezierCurveTo(W * 0.5, H * 0.4, W * 0.62, H * 0.42, W * 0.78, H * 0.56); c.stroke();
      c.beginPath(); c.moveTo(W * 0.2, H * 0.44); c.lineTo(W * 0.2, H * 0.39); c.moveTo(W * 0.39, H * 0.44); c.lineTo(W * 0.39, H * 0.37); c.moveTo(W * 0.57, H * 0.43); c.lineTo(W * 0.57, H * 0.41); c.stroke();
      c.setLineDash([14, 10]); c.lineWidth = 4;
      [[0.11, 0.08], [0.31, 0.06], [0.49, 0.1]].forEach(function (p) { c.strokeRect(W * p[0], H * p[1], W * 0.17, H * 0.3); });
      c.setLineDash([]);
      [[0.06, 0.6], [0.12, 0.7], [0.22, 0.86], [0.85, 0.15], [0.94, 0.3], [0.92, 0.8], [0.8, 0.92], [0.3, 0.93]].forEach(function (q) { c.lineWidth = 4; c.beginPath(); c.arc(W * q[0], H * q[1], 16, 0, 7); c.stroke(); });
      c.beginPath(); c.arc(W * 0.93, H * 0.11, 24, 0, 7); c.stroke();
      c.fillStyle = '#3e434a'; c.beginPath(); c.moveTo(W * 0.93, H * 0.11 - 30); c.lineTo(W * 0.93 - 9, H * 0.11 + 6); c.lineTo(W * 0.93 + 9, H * 0.11 + 6); c.closePath(); c.fill();
      lines(c, W * 0.75, H * 0.64, 100, 2, 'rgba(62,67,74,.75)', 16, 6);
      lines(c, W * 0.03, H * 0.03, 130, 2, 'rgba(62,67,74,.75)', 16, 6);
    });
    lay(g, 0.36, 0.25, 0, 0.0016, 0, texM(sk, 0.85));
    var tg = new T.CylinderGeometry(0.016, 0.016, 0.26, 22); tg.rotateX(Math.PI / 2); mesh(tg, paperM(), g, 0.2, 0.016, 0);
    [[-0.11, -0.06, 0.3], [-0.045, -0.072, 0.1], [0.02, -0.058, -0.12]].forEach(function (p) {
      var ag = grp(g, p[0], 0.0016, p[1], p[2]);
      var sh = new T.Shape(); sh.moveTo(-0.026, 0); sh.lineTo(0.026, 0); sh.lineTo(0, 0.046); sh.closePath();
      var geo = new T.ExtrudeGeometry(sh, { depth: 0.046, bevelEnabled: false }); geo.translate(0, 0, -0.023);
      mesh(geo, b, ag);
      var w = new T.Shape(); w.moveTo(-0.014, 0.003); w.lineTo(0.014, 0.003); w.lineTo(0, 0.027); w.closePath();
      noEdge(mesh(new T.ShapeGeometry(w), L, ag, 0, 0, 0.0236));
      bx(ag, 0.05, 0.003, 0.014, 0, 0, 0.03, b);
    });
    /* юрта рядом с A-фреймами: стены, купол с тюндюком, дверь и пояс-орнамент */
    var yg = grp(g, 0.09, 0.0016, -0.05, -0.15);
    cyl(yg, 0.026, 0.026, 0.017, 0, 0, 0, b, 32);
    cyl(yg, 0.0068, 0.0285, 0.015, 0, 0.017, 0, b, 32);
    cyl(yg, 0.0074, 0.0074, 0.0028, 0, 0.032, 0, L, 20);
    noEdge(mesh(new T.PlaneGeometry(0.0085, 0.012), L, yg, 0, 0.0062, 0.0262));
    var band = mesh(new T.TorusGeometry(0.0262, 0.0008, 4, 40), litM(0x8a9099), yg, 0, 0.0145, 0); band.rotation.x = Math.PI / 2; noEdge(band);
    var cg = grp(g, 0.122, 0.0016, 0.062, 0.2);
    bx(cg, 0.056, 0.024, 0.04, 0, 0, 0, litM(0xd9d6cf));
    bx(cg, 0.068, 0.005, 0.052, 0, 0.024, 0, b);
    [[-0.155, 0.06], [-0.12, 0.09], [-0.06, 0.1], [0.075, -0.1], [0.135, -0.08], [0.152, 0.108]].forEach(function (q) { mesh(new T.ConeGeometry(0.009, 0.03, 12), b, g, q[0], 0.0016 + 0.015, q[1]); });
    contact(g, 0.5, 0.36, 0.02, 0, 0.4);
    finish(o);
  }

  /* Кинохлопушка у имиджевого ролика: доска лежит на столе, планка с полосами приоткрыта */
  function buildClapper() {
    var o = newObject('clap4', 0, 0, 0), g = o.group, b = bodyM();
    var slate = canvasTex(440, 300, function (c, W, H) {
      c.fillStyle = '#16181b'; c.fillRect(0, 0, W, H);
      c.strokeStyle = 'rgba(236,235,232,.7)'; c.lineWidth = 3; c.strokeRect(14, 14, W - 28, H - 28);
      c.beginPath(); c.moveTo(14, H * 0.46); c.lineTo(W - 14, H * 0.46); c.moveTo(W / 2, H * 0.46); c.lineTo(W / 2, H - 14); c.moveTo(14, H * 0.74); c.lineTo(W - 14, H * 0.74); c.stroke();
      c.font = '700 40px Manrope, sans-serif'; c.fillStyle = '#ecebe8'; c.fillText('SEVEN 3D', 34, H * 0.34);
      c.font = '500 22px "JetBrains Mono", monospace'; c.fillStyle = 'rgba(236,235,232,.75)';
      c.fillText('СЦЕНА 01', 34, H * 0.64); c.fillText('ДУБЛЬ 03', W / 2 + 20, H * 0.64);
    });
    var stripes = canvasTex(440, 56, function (c, W, H) {
      c.fillStyle = '#ecebe8'; c.fillRect(0, 0, W, H); c.fillStyle = '#16181b';
      for (var i = -2; i < 12; i++) { c.beginPath(); c.moveTo(i * 44, H); c.lineTo(i * 44 + 22, H); c.lineTo(i * 44 + 44, 0); c.lineTo(i * 44 + 22, 0); c.closePath(); c.fill(); }
    });
    fontTex.push(slate);
    bx(g, 0.124, 0.006, 0.09, 0, 0, 0, b);
    lay(g, 0.12, 0.068, 0, 0.0062, 0.009, texM(slate, 0.6));
    lay(g, 0.12, 0.012, 0, 0.0062, -0.034, texM(stripes, 0.6));
    var hinge = grp(g, -0.062, 0.006, -0.051, 0); hinge.rotation.z = 0.32;
    bx(hinge, 0.124, 0.006, 0.016, 0.062, 0, 0, b);
    lay(hinge, 0.12, 0.013, 0.062, 0.0062, 0, texM(stripes, 0.6));
    contact(g, 0.2, 0.16, 0, 0, 0.45);
    finish(o);
  }
  /* Телефон с рекламным роликом рядом с камерой */
  function buildPhoneVid() {
    var o = newObject('phonev', 0, 0, 0), g = o.group, b = bodyM(), src = 'assets/img/desk3d/zhk-1.jpg';
    mesh(rbox(0.07, 0.008, 0.14, 0.003, 0.012), b, g);
    var ui = imgTex(src, 300, 600, function (c, W, H) {
      c.fillStyle = '#16181b'; c.fillRect(0, 0, W, H);
      pic(c, src, 0, 0, W, H);
      var gr = c.createLinearGradient(0, H * 0.5, 0, H); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(0,0,0,.7)'); c.fillStyle = gr; c.fillRect(0, 0, W, H);
      c.fillStyle = 'rgba(255,255,255,.95)'; c.beginPath(); c.arc(W / 2, H / 2, 46, 0, 7); c.fill();
      c.fillStyle = '#0e0f11'; c.beginPath(); c.moveTo(W / 2 - 13, H / 2 - 21); c.lineTo(W / 2 - 13, H / 2 + 21); c.lineTo(W / 2 + 23, H / 2); c.closePath(); c.fill();
      c.fillStyle = 'rgba(255,255,255,.35)'; c.fillRect(24, H - 44, W - 48, 6); c.fillStyle = '#ffffff'; c.fillRect(24, H - 44, (W - 48) * 0.42, 6);
    });
    lay(g, 0.062, 0.13, 0, 0.0082, 0, scrM(ui));
    contact(g, 0.13, 0.2, 0, 0, 0.45);
    finish(o);
  }

  /* ---------- надписи на столе ----------
     На компьютере у открытого блока название услуги лежит на плите рядом с предметом: номер и название, как печать на столе.
     Надпись нажимается так же, как предмет. На телефоне вместо них — подписи-кнопки над предметами (dk-tag). */
  var TXT = {
    sketch: [-1.92, -0.99, 0.62], prints: [-1.3, -0.99, 0.52], tablet: [-0.68, -0.99, 0.62],
    book: [-1.8, -0.37, 0.72], present: [-0.8, -0.42, 0.6],
    zhk: [0.85, -0.97, 0.8], site: [1.95, -0.99, 0.62],
    vr: [0.5, -0.44, 0.5], prints_e: [1.15, -0.44, 0.44], tablet_e: [1.62, -0.44, 0.4], plan3d: [2.07, -0.44, 0.36],
    stand: [0.78, -0.25, 0.56, 'l'],
    factory: [-0.8, 0.76, 0.62, 'l'], kiosk: [-2.05, 1.43, 0.46], vr_i: [-1.48, 1.43, 0.46], present_i: [-0.98, 1.43, 0.42],
    imagevid: [0.85, 0.67, 0.75], phone: [1.85, 0.67, 0.52], web: [0.6, 1.42, 0.62], camera: [1.42, 1.42, 0.56]
  };
  /* Надписи крупные: 900 точек текстуры на единицу стола. Номер стоит в начале первой строки, серым моноширинным. */
  var texts = [], titles = [], TPX = 900;
  function textMesh(oid, s, x, z, maxw, opt) {
    opt = opt || {};
    /* Номер — крупный, тем же шрифтом, высотой в две строки; название — слева от края, рядом с номером */
    var fs = Math.round((opt.small ? 38 : 46) * (COLUMN ? 0.78 : 1)), lh = Math.round(fs * 1.2), nfs = Math.round(fs * 2.6), pad = 10, al = opt.align || 'c', ns = opt.n || '';
    var mc = document.createElement('canvas').getContext('2d'), nw = 0;
    if (ns) { mc.font = '600 ' + nfs + 'px Manrope, sans-serif'; nw = mc.measureText(ns).width + fs * 0.4; }
    mc.font = '600 ' + fs + 'px Manrope, sans-serif';
    var maxPx = maxw * TPX - 2 * pad - nw * 0.35, words = s.split(' '), L = [], cur = '';
    words.forEach(function (w) { var tt = cur ? cur + ' ' + w : w; if (cur && mc.measureText(tt).width > maxPx) { L.push(cur); cur = w; } else cur = tt; });
    if (cur) L.push(cur);
    var tw = Math.max.apply(null, L.map(function (l) { return mc.measureText(l).width; })), rows = ns ? Math.max(2, L.length) : L.length;
    var W = Math.ceil(nw + tw + 2 * pad + 4), H = Math.ceil(rows * lh + 2 * pad);
    var t = canvasTex(W, H, function (c, W2, H2) {
      c.clearRect(0, 0, W2, H2); c.textAlign = 'left';
      var base = pad + fs * 0.95, y0 = ns && L.length === 1 ? base + lh / 2 : base;
      if (ns) { c.font = '600 ' + nfs + 'px Manrope, sans-serif'; c.fillStyle = '#9aa0a7'; c.fillText(ns, pad, base + lh); }
      c.font = '600 ' + fs + 'px Manrope, sans-serif'; c.fillStyle = opt.small ? '#a4aab1' : '#f2f1ee';
      L.forEach(function (l, i) {
        var x0 = ns ? pad + nw : al === 'l' ? pad : (W2 - c.measureText(l).width) / 2;
        c.fillText(l, x0, y0 + i * lh);
      });
    });
    var m = new T.MeshBasicMaterial({ map: t, transparent: true, opacity: 0, depthWrite: false, toneMapped: false, fog: false });
    var w = W / TPX, h = H / TPX, pl = new T.Mesh(new T.PlaneGeometry(w, h), m);
    pl.rotation.x = -Math.PI / 2; pl.position.set(al === 'l' ? x + w / 2 : x, 0.0018, z); pl.renderOrder = 1;
    pl.userData.oid = oid; pl.userData.txt = true; pl.visible = false;
    scene.add(pl); pickables.push(pl);
    texts.push({ id: oid, mesh: pl, mat: m });
  }
  /* Крупный номер и название открытого блока лежат на полу сбоку от плиты, с внешней стороны, — в перспективе, как надписи на столе */
  var TITLE_W = 1.0;
  function titleMesh(k) {
    var P = PLATES[k], left = P.tside ? P.tside === 'l' : P.x0 < 0, PX = COLUMN ? 1650 : 1300, CW = Math.round((COLUMN ? 0.7 : TITLE_W) * PX), nf = 330, tf = 92, tl = 108;
    var mc = document.createElement('canvas').getContext('2d'); mc.font = '400 ' + tf + 'px Unbounded, sans-serif';
    var L = wrapText(mc, GNAME[k], CW - 20), CH = Math.round(nf * 0.82 + 46 + L.length * tl + 20);
    var t = canvasTex(CW, CH, function (c, W, H) {
      c.clearRect(0, 0, W, H); c.textAlign = left ? 'right' : 'left';
      var x = left ? W - 6 : 6;
      c.font = '400 ' + nf + 'px Unbounded, sans-serif'; c.fillStyle = '#ffffff'; c.fillText('0' + BL[k].n, x, nf * 0.8);
      c.font = '400 ' + tf + 'px Unbounded, sans-serif'; c.fillStyle = '#dbdbdb';
      L.forEach(function (l, i) { c.fillText(l, x, nf * 0.82 + 46 + tf * 0.8 + i * tl); });
    });
    var m = new T.MeshBasicMaterial({ map: t, transparent: true, opacity: 0, depthWrite: false, toneMapped: false, fog: false });
    var w = CW / PX, h = CH / PX, cx = left ? P.x0 - 0.07 - w / 2 : P.x1 + 0.07 + w / 2, cz = (P.z0 + P.z1) / 2;
    var pl = new T.Mesh(new T.PlaneGeometry(w, h), m);
    pl.rotation.x = -Math.PI / 2; pl.position.set(cx, 0.001, cz); pl.renderOrder = 1; pl.visible = false; pl.raycast = function () {};
    scene.add(pl);
    titles.push({ k: k, mesh: pl, mat: m, pts: [[-1, -1], [1, -1], [-1, 1], [1, 1]].map(function (q) { return new T.Vector3(cx + q[0] * w / 2, 0, cz + q[1] * h / 2); }) });
  }
  /* строим заново, когда загрузятся шрифты: меняется ширина строк */
  function buildTexts() {
    texts.concat(titles).forEach(function (q) { scene.remove(q.mesh); q.mesh.geometry.dispose(); q.mat.map.dispose(); q.mat.dispose(); });
    pickables = pickables.filter(function (m) { return !m.userData.txt; });
    texts = []; titles = [];
    Object.keys(TXT).forEach(function (id) { var a = TXT[id]; textMesh(id, DATA[id].label, a[0], a[1], a[2], { n: num(id), align: a[3] }); });
    DIO.forEach(function (d) { var p = objects[d[0]].group.position; textMesh('factory', d[2], p.x, p.z + 0.19, 0.36, { small: true }); });
    GKEYS.forEach(titleMesh);
  }
  function titleOf(k) { for (var i = 0; i < titles.length; i++) if (titles[i].k === k) return titles[i]; return null; }
  function buildPlan3d() {
    var o = newObject('plan3d', 0.27, 0.43, -0.14), g = o.group, b = bodyM(), wh = paperM();
    var wood = canvasTex(256, 192, function (c, W, H) {
      c.fillStyle = '#cbc6be'; c.fillRect(0, 0, W, H);
      c.fillStyle = '#b6b0a6';
      for (var i = 0; i <= 12; i++) c.fillRect(0, i * 16, W, 1.5);
      for (var j = 0; j < 12; j++) for (var k = 0; k < 3; k++) c.fillRect((j * 53 + k * 97) % W, j * 16, 1.5, 16);
    });
    bx(g, 0.272, 0.008, 0.202, 0, 0, 0, b);
    lay(g, 0.26, 0.19, 0, 0.0082, 0, texM(wood, 0.8));
    var y = 0.008, H = 0.036, t = 0.006;
    function wall(x0, z0, x1, z1) { var w = Math.max(Math.abs(x1 - x0), t), d = Math.max(Math.abs(z1 - z0), t); bx(g, w, H, d, (x0 + x1) / 2, y, (z0 + z1) / 2, b); }
    wall(-0.136, -0.098, 0.136, -0.098);
    wall(-0.133, -0.095, -0.133, 0.095); wall(0.133, -0.095, 0.133, 0.095);
    wall(-0.136, 0.098, -0.07, 0.098); wall(-0.02, 0.098, 0.05, 0.098); wall(0.1, 0.098, 0.136, 0.098);
    [[-0.045, 0.05], [0.075, 0.05]].forEach(function (p) { bx(g, p[1], 0.012, t, p[0], y, 0.098, b); bx(g, p[1], 0.024, 0.0016, p[0], y + 0.012, 0.098, litM(0xaab4c0)); });
    wall(-0.02, -0.095, -0.02, -0.03); wall(-0.13, 0.0, -0.017, 0.0);
    wall(0.06, -0.095, 0.06, -0.024); wall(0.09, -0.024, 0.13, -0.024);
    bx(g, 0.058, 0.008, 0.07, -0.076, y, -0.058, b);
    bx(g, 0.054, 0.006, 0.046, -0.076, y + 0.008, -0.046, wh);
    bx(g, 0.022, 0.006, 0.012, -0.088, y + 0.008, -0.083, wh); bx(g, 0.022, 0.006, 0.012, -0.064, y + 0.008, -0.083, wh);
    bx(g, 0.016, 0.014, 0.014, -0.118, y, -0.084, b); bx(g, 0.016, 0.014, 0.014, -0.034, y, -0.084, b);
    mesh(new T.SphereGeometry(0.0036, 10, 8), litM(0xfff4e0), g, -0.118, y + 0.0176, -0.084).castShadow = false;
    bx(g, 0.072, 0.011, 0.026, -0.076, y, 0.024, b);
    bx(g, 0.072, 0.024, 0.007, -0.076, y, 0.0075, b);
    bx(g, 0.008, 0.017, 0.026, -0.1155, y, 0.024, b); bx(g, 0.008, 0.017, 0.026, -0.0365, y, 0.024, b);
    lay(g, 0.07, 0.04, -0.076, y + 0.0006, 0.062, mat('std', 0));
    bx(g, 0.034, 0.008, 0.02, -0.076, y, 0.062, b);
    bx(g, 0.05, 0.008, 0.01, -0.076, y, 0.088, b);
    cyl(g, 0.0012, 0.0012, 0.03, -0.122, y, 0.085, b, 8);
    mesh(new T.SphereGeometry(0.0045, 10, 8), litM(0xfff4e0), g, -0.122, y + 0.033, 0.085).castShadow = false;
    bx(g, 0.074, 0.016, 0.016, 0.02, y, -0.086, b);
    bx(g, 0.046, 0.011, 0.03, 0.03, y, 0.035, b);
    [[0.012, 0.012], [0.048, 0.012], [0.012, 0.058], [0.048, 0.058]].forEach(function (p) { bx(g, 0.01, 0.009, 0.01, p[0], y, p[1], b); });
    mesh(new T.ConeGeometry(0.008, 0.026, 10), b, g, 0.118, y + 0.013, 0.08);
    bx(g, 0.028, 0.012, 0.058, 0.113, y, -0.062, wh);
    bx(g, 0.016, 0.012, 0.012, 0.072, y, -0.085, wh);
    contact(g, 0.38, 0.3, 0, 0, 0.5);
    finish(o);
  }

  var siteTex = null, gridMat = null;
  var labels = {};
  /* Подпись-выноска: точка на предмете, тонкая линия вверх и название. Точку ищем лучом сверху по центру предмета. */
  function buildLabel(id) {
    var o = objects[id], el = document.createElement('span'), a;
    el.className = 'dk-tag'; el.innerHTML = '<b class="dk-tip-n">' + num(id) + '</b>' + esc(DATA[id].label); el.setAttribute('aria-hidden', 'true'); el.setAttribute('data-o', id); el.hidden = true;
    stage.insertBefore(el, tipSvg);
    if (o.anchor) a = o.anchor.clone();
    else {
      var b = o.box, c = b.getCenter(new T.Vector3()), rc = new T.Raycaster(new T.Vector3(c.x, b.max.y + 0.2, c.z), new T.Vector3(0, -1, 0));
      var hit = rc.intersectObjects(o.meshes, false)[0];
      a = o.group.worldToLocal(hit ? hit.point.clone() : new T.Vector3(c.x, b.max.y, c.z));
    }
    labels[id] = { el: el, anchor: a };
  }
  var pv = T ? new T.Vector3() : null, tagSize = {}, tagsOn = true;
  var tagSvg = document.getElementById('dk-tagsvg'), tagLine = tagSvg.querySelector('.tl'), tagDot = tagSvg.querySelector('.td');
  /* Подписи над предметами. Ближние — в приоритете; если подпись налезает на соседнюю, поднимаем её выше, а если некуда — прячем.
     У предмета под курсором подпись прячется: его название уже в выноске. */
  function placeTags(f, S) {
    /* подписи — только у предметов открытого блока (уровень 1); на уровне 0 надписи у самих блоков */
    var w = stage.clientWidth, h = stage.clientHeight, list = [], dl = '', dd = '', rail = MODE === 'rail', show = !focused;
    /* на компьютере названия лежат на столе — подписи-кнопки не нужны */
    if (!rail || COLUMN) { if (tagsOn) { tagsOn = false; ORDER.forEach(function (id) { if (labels[id]) labels[id].el.hidden = true; }); tagLine.setAttribute('d', ''); tagDot.setAttribute('d', ''); } return; }
    tagsOn = true;
    /* в наборе пакета у подписей — номер шага; на компьютере подписи состава видны и при открытом пакете */
    var steps = {};
    if (S && !rail) PACK[f].items.forEach(function (x, i) { [].concat(x).forEach(function (a) { steps[a] = String(i + 1); }); });
    ORDER.forEach(function (id) {
      var L = labels[id]; if (!L) return;
      if (!COLUMN && (!blk || BLK[id] !== blk)) { if (!L.el.hidden) L.el.hidden = true; return; }
      var st = steps[id] || null;
      if (L.el.getAttribute('data-step') !== st) { if (st) L.el.setAttribute('data-step', st); else L.el.removeAttribute('data-step'); tagSize[id] = null; }
      if ((!show && !st) || id === f) { L.el.hidden = true; return; }
      pv.copy(L.anchor); objects[id].group.localToWorld(pv); pv.y += objects[id].lift; pv.project(camera);
      if (pv.z > 1 || Math.abs(pv.x) > (COLUMN ? 0.9 : 1.05) || Math.abs(pv.y) > 1.05) { L.el.hidden = true; return; }
      list.push({ id: id, el: L.el, ax: (pv.x + 1) / 2 * w, ay: (1 - pv.y) / 2 * h, d: pv.z });
    });
    list.sort(function (a, b) { return a.d - b.d; });
    var placed = [], top = rail ? 56 : 52;
    if (tip.classList.contains('is-on')) placed.push({ x0: tip.offsetLeft - 4, y0: tip.offsetTop - 4, x1: tip.offsetLeft + tip.offsetWidth + 4, y1: tip.offsetTop + tip.offsetHeight + 4 });
    list.forEach(function (it) {
      var el = it.el;
      if (el.hidden) el.hidden = false;
      var sz = tagSize[it.id] || (tagSize[it.id] = [el.offsetWidth, el.offsetHeight]);
      var gap = rail ? 18 : 22, x0 = clamp(it.ax - sz[0] / 2, 6, w - sz[0] - 6), ok = null, offs = [0, -14, -28, -42, 14];
      for (var k = 0; k < offs.length && !ok; k++) {
        var cy = it.ay - gap - sz[1] / 2 + offs[k];
        var r = { x0: x0 - 3, x1: x0 + sz[0] + 3, y0: cy - sz[1] / 2 - 2, y1: cy + sz[1] / 2 + 2 }, hit = r.y0 < top;
        for (var i = 0; i < placed.length && !hit; i++) { var q = placed[i]; hit = r.x0 < q.x1 && r.x1 > q.x0 && r.y0 < q.y1 && r.y1 > q.y0; }
        if (!hit) ok = { r: r, cy: cy };
      }
      if (!ok) { el.hidden = true; return; }
      placed.push(ok.r);
      el.style.transform = 'translate(' + x0.toFixed(1) + 'px,' + (ok.cy - sz[1] / 2).toFixed(1) + 'px)';
      el.style.opacity = f && !(S && S[it.id]) ? '0.35' : '0.95';
      if (it.ay < ok.cy + sz[1] / 2 + 4) return;
      dl += 'M' + it.ax.toFixed(1) + ' ' + (ok.cy + sz[1] / 2).toFixed(1) + 'V' + (it.ay - 2.5).toFixed(1);
      dd += 'M' + (it.ax - 2.2).toFixed(1) + ' ' + it.ay.toFixed(1) + 'a2.2 2.2 0 1 0 4.4 0a2.2 2.2 0 1 0 -4.4 0';
    });
    tagLine.setAttribute('d', dl); tagDot.setAttribute('d', dd);
    tagSvg.style.opacity = f && !rail && !S ? '0.35' : '1';
  }

  function studioEnv() {
    var pm = new T.PMREMGenerator(renderer), s = new T.Scene();
    s.add(new T.Mesh(new T.BoxGeometry(12, 12, 12), new T.MeshBasicMaterial({ color: 0x15171a, side: T.BackSide })));
    function panelLight(w, h, x, y, z, rx, ry, v) { var m = new T.Mesh(new T.PlaneGeometry(w, h), new T.MeshBasicMaterial({ color: new T.Color(v, v, v), side: T.DoubleSide })); m.position.set(x, y, z); m.rotation.set(rx, ry, 0); s.add(m); }
    panelLight(5, 3, -1.5, 5.8, 1.2, Math.PI / 2, 0, 2.6);
    panelLight(3, 4, 5.9, 1.5, 0.5, 0, -Math.PI / 2, 0.9);
    panelLight(4, 2.5, -5.9, 1.8, -1, 0, Math.PI / 2, 0.55);
    panelLight(6, 2, 0, 1.4, -5.9, 0, 0, 0.35);
    var env = pm.fromScene(s, 0.04).texture; pm.dispose();
    return env;
  }

  var HOME_EL = 0.48, FOV_DESK = 30, FOV_RAIL = 30, FOV_FOCUS = 34, CALLOUT = 58, railTop = 0;
  var PARAMS = ['tx', 'ty', 'tz', 'dist', 'az', 'el', 'fov'];
  /* Ракурс крупного плана: чуть сбоку и ниже, чем общий вид. Плоские предметы смотрим выше, чтобы их было видно. */
  var FOCUS = {
    zhk: { az: 0.16, el: 0.42 }, site: { az: 0.1, el: 0.32 }, web: { az: 0.1, el: 0.36 }, vr: { az: 0.35, el: 0.34 }, camera: { az: 0.4, el: 0.5 },
    tablet: { az: -0.22, el: 0.62 }, prints: { az: -0.22, el: 0.64 }, factory: { az: -0.1, el: 0.52 }, kiosk: { az: -0.32, el: 0.28 },
    stand: { az: -0.1, el: 0.46 }, phone: { az: -0.26, el: 0.2 }, box: { az: 0, el: 0.9 }, plan3d: { az: -0.26, el: 0.84 },
    portfolio: { az: 0, el: 0.9 }, present: { az: -0.2, el: 0.64 }, book: { az: -0.2, el: 0.6 }, finmodel: { az: -0.2, el: 0.66 }, sketch: { az: -0.36, el: 0.48 },
    digital: { az: 0, el: 0.9 }, subs: { az: 0, el: 0.9 },
    prints_e: { az: -0.22, el: 0.64 }, tablet_e: { az: -0.22, el: 0.62 }, imagevid: { az: -0.22, el: 0.6 }, vr_i: { az: 0.35, el: 0.34 }, present_i: { az: -0.2, el: 0.64 }
  };
  /* ---------------- блоки: плиты, надписи, уровни ----------------
     Уровень 0 — весь стол: четыре плиты с надписями «01 Привлечь инвестиции…», предметы мелкие и не нажимаются по одному.
     Наведение на плиту (или надпись) — плита с предметами приподнимается и светится; нажатие — уровень 1.
     Уровень 1 — камера у блока, предметы выбираются по одному (выноска с ценой). Нажатие — уровень 2: крупный план и панель. */
  var BL = {}, plateMeshes = [], packLines = {}, blk = null, hovBlk = null, LIFT_B = 0.045;
  function buildBlocks() {
    GKEYS.forEach(function (k, i) {
      var P = PLATES[k], w = P.x1 - P.x0, d = P.z1 - P.z0, cx = (P.x0 + P.x1) / 2, cz = (P.z0 + P.z1) / 2, sh = rrShape(w, d, 0.06);
      var fill = new T.MeshBasicMaterial({ color: 0x16181b, transparent: true, opacity: 0.94, depthWrite: false, toneMapped: false, fog: false });
      fill.color.convertSRGBToLinear(); fill.userData.c0 = fill.color.clone(); fill.userData.c1 = new T.Color(0x2a2d32).convertSRGBToLinear();
      var pl = new T.Mesh(new T.ShapeGeometry(sh, 6), fill); pl.rotation.x = -Math.PI / 2; pl.position.set(cx, -0.0003, cz); pl.renderOrder = -1; pl.userData.blk = k;
      var lm = new T.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.28, depthWrite: false, toneMapped: false, fog: false });
      var ln = new T.LineLoop(new T.BufferGeometry().setFromPoints(sh.getPoints(6)), lm); ln.rotation.x = -Math.PI / 2; ln.position.set(cx, -0.0002, cz); ln.renderOrder = -1; ln.raycast = function () {};
      scene.add(pl); scene.add(ln); plateMeshes.push(pl);
      /* надпись блока — кнопка поверх сцены, привязана к середине передней полосы плиты */
      var el = document.createElement('button'), n = BLOCKS[k].length;
      el.type = 'button'; el.className = 'dk-blk'; el.setAttribute('data-blk', k); el.hidden = true;
      el.innerHTML = '<b>0' + (i + 1) + '</b><span class="dk-blk-f">' + esc(GNAME[k]) + '</span><span class="dk-blk-s">' + esc(GSHORT[k]) + '</span><i>' + n + ' ' + svcWord(n) + '</i>';
      stage.insertBefore(el, tipSvg);
      /* надпись — кнопка: наведение подсвечивает блок, нажатие — к блоку */
      el.addEventListener('click', function () { enterBlock(k); });
      el.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse') setHovBlk(k); });
      el.addEventListener('pointerleave', function (e) { if (e.pointerType === 'mouse' && hovBlk === k) setHovBlk(null); });
      el.addEventListener('focus', function () { try { if (el.matches(':focus-visible')) setHovBlk(k); } catch (er) { /* старый браузер */ } });
      el.addEventListener('blur', function () { if (hovBlk === k) setHovBlk(null); });
      var box = new T.Box3(new T.Vector3(P.x0, 0, P.z0), new T.Vector3(P.x1, 0.02, P.z1));
      /* надпись на полу за краем плиты: у задних блоков — над плитой (у дальнего края), у передних — под ней (у ближнего) */
      var back = COLUMN || P.z0 < 0, ez = back ? P.z0 : P.z1;
      BL[k] = { k: k, n: i + 1, pl: pl, ln: ln, fill: fill, line: lm, lift: 0, el: el, box: box, pts: [], back: back,
        anchor: new T.Vector3(cx, 0, ez), left: P.x0 < 0, sa: new T.Vector3(P.x0 < 0 ? P.x0 : P.x1, 0, cz) };
    });
  }
  /* после постройки предметов: рамка блока = плита + все его предметы */
  function finishBlocks() {
    GKEYS.forEach(function (k) {
      var B = BL[k]; B.pts = boxPts(B.box);
      Object.keys(objects).forEach(function (oid) { if (BLK[oid] === k) { B.box.union(objects[oid].box); B.pts = B.pts.concat(objects[oid].pts); } });
    });
  }
  /* надписи блоков видны только на уровне 0 */
  /* Надписи блоков. Компьютер (широкий экран): сбоку от плит — у левых блоков слева, у правых справа; высоту сцены они не отнимают.
     Телефон: над задними плитами и под передними. Ширина надписи постоянная — от камеры не зависит, поэтому стол не «сжимается». */
  var LBL_W = 250, lblUsed = 0, lblFix = 0;
  function lblW() { var w = stage.clientWidth; return MODE === 'rail' || railMode() ? Math.floor(w / 2) - 12 : Math.round(clamp(w * 0.13, 170, LBL_W)); }
  function placeBlocks() {
    var w = stage.clientWidth, h = stage.clientHeight, side = MODE !== 'rail', mw = lblW() + 'px';
    GKEYS.forEach(function (k) {
      var B = BL[k], el = B.el, out = !!blk || focused;
      if (!out) { pv.copy(side ? B.sa : B.anchor); pv.y = B.lift; pv.project(camera); out = pv.z > 1; }
      if (el.hidden !== !!out) el.hidden = !!out;
      if (out) return;
      var x = (pv.x + 1) / 2 * w, y = (1 - pv.y) / 2 * h;
      if (side && el.style.maxWidth !== mw) el.style.maxWidth = mw;
      el.classList.toggle('is-l', side && B.left); el.classList.toggle('is-r', side && !B.left);
      if (side) {
        /* по горизонтали — снаружи от самой крайней точки блока */
        B.pts.forEach(function (p) { pv.copy(p); pv.y += B.lift; pv.project(camera); var px = (pv.x + 1) / 2 * w; x = B.left ? Math.min(x, px) : Math.max(x, px); });
        el.style.transform = 'translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px) translate(' + (B.left ? 'calc(-100% - 14px)' : '14px') + ',-50%)';
      } else {
        /* задний блок: надпись выше самого высокого предмета (макет ЖК); передний — ниже переднего края.
           Ширина надписи — не шире своей плиты на экране, чтобы надписи соседних блоков не наезжали друг на друга */
        var qx0 = 1e9, qx1 = -1e9;
        B.pts.forEach(function (p) { pv.copy(p); pv.y += B.lift; pv.project(camera); var py = (1 - pv.y) / 2 * h, px = (pv.x + 1) / 2 * w; qx0 = Math.min(qx0, px); qx1 = Math.max(qx1, px); y = B.back ? Math.min(y, py) : Math.max(y, py); });
        var pw = Math.round(clamp(qx1 - qx0 - 8, 120, lblW())) + 'px';
        if (el.style.maxWidth !== pw) el.style.maxWidth = pw;
        el.style.transform = 'translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px) translate(-50%,' + (B.back ? 'calc(-100% - 4px)' : '4px') + ')';
      }
      el.classList.toggle('is-on', hovBlk === k);
    });
    /* телефон: высота надписей стала известна (шрифт) — один раз пересчитываем общий вид, чтобы они влезли */
    if (!side && !blk && !focused && lblFix < 3) { var lh = lblH(); if (Math.abs(lh - lblUsed) > 3) { lblUsed = lh; lblFix++; setTimeout(resize, 0); } }
  }
  function init3D() {
    renderer = new T.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputEncoding = T.sRGBEncoding;
    renderer.toneMapping = T.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
    renderer.shadowMap.enabled = true; renderer.shadowMap.type = T.PCFSoftShadowMap;
    renderer.setClearColor(0x000000, 0);
    scene = new T.Scene();
    scene.fog = new T.Fog(0x0e0f11, 2.9, 5.2);
    scene.environment = studioEnv();
    camera = new T.PerspectiveCamera(FOV_DESK, 1, 0.03, 30);

    scene.add(new T.HemisphereLight(0x5a616b, 0x0e0f11, 1.2));
    var key = new T.DirectionalLight(0xffffff, 1.25);
    key.position.set(-1.4, 2.6, 1.3); key.castShadow = true;
    var sm = railMode() ? 1024 : 2048; key.shadow.mapSize.set(sm, sm);
    var sc = key.shadow.camera; sc.left = -2.8; sc.right = 2.8; sc.top = 2.2; sc.bottom = -2.2; sc.near = 0.5; sc.far = 8;
    if (railMode()) { columnLayout(); sc.left = -2.8; sc.right = 2.8; sc.top = 4.2; sc.bottom = -4.2; sc.far = 10; }
    key.shadow.bias = -0.0004; key.shadow.normalBias = 0.012;
    scene.add(key);
    var rim = new T.DirectionalLight(0xdfe6ff, 0.55); rim.position.set(1.2, 1.2, -2.2); scene.add(rim);

    gridMat = new T.ShaderMaterial({
      transparent: true, depthWrite: false, extensions: { derivatives: true },
      uniforms: { uColor: { value: new T.Color(0x737a84) }, uCenter: { value: new T.Vector2(0, 0) }, uNear: { value: 2.6 }, uFar: { value: 5.6 } },
      vertexShader: 'varying vec3 vW; void main(){ vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }',
      fragmentShader: 'varying vec3 vW; uniform vec3 uColor; uniform vec2 uCenter; uniform float uNear; uniform float uFar;' +
        'float line(vec2 p, float s){ vec2 q = p / s; vec2 g = abs(fract(q - 0.5) - 0.5) / fwidth(q); return 1.0 - min(min(g.x, g.y), 1.0); }' +
        'void main(){ vec2 p = vW.xz; float a = max(line(p, 0.1) * 0.2, line(p, 0.5) * 0.42);' +
        'a *= 1.0 - smoothstep(uNear, uFar, length(p - uCenter)); gl_FragColor = vec4(uColor, a); }'
    });
    var grid = new T.Mesh(new T.PlaneGeometry(16, 16), gridMat); grid.rotation.x = -Math.PI / 2; grid.position.y = -0.0005; grid.renderOrder = -2; scene.add(grid);
    var floorSh = new T.Mesh(new T.PlaneGeometry(16, 16), new T.ShadowMaterial({ opacity: 0.5 })); floorSh.rotation.x = -Math.PI / 2; floorSh.receiveShadow = true; scene.add(floorSh);

    buildBlocks();
    /* 01 Инвестиции */
    buildPackBtn('portfolio'); buildSketch(); buildPrints('prints'); buildTablet('tablet', 'assets/img/desk3d/resort.jpg'); buildDrone('drone1'); buildBook(); buildFinmodel(); buildPresentation('present');
    /* 02 Недвижимость */
    buildPackBtn('box'); buildPrints('prints_e'); buildTablet('tablet_e', 'assets/img/desk3d/zhk-2.jpg'); buildPlan3d(); buildZhk(); buildTouch(); buildMonitor(); buildVR('vr'); buildBooklets();
    /* 03 Презентовать производство или инфраструктуру: диорамы сзади, перед ними планшет с роликом и дрон, спереди — презентация, VR, экран */
    buildPackBtn('digital'); DIO.forEach(buildDio); buildTablet('factory', 'assets/img/desk3d/resort.jpg'); buildDrone('drone3'); buildKiosk(); buildVR('vr_i'); buildPresentation('present_i');
    /* 04 Реклама */
    buildPackBtn('subs'); buildTablet('imagevid', 'assets/img/desk3d/zhk-1.jpg'); buildDrone('drone4'); buildClapper(); buildCamera(); buildPhoneVid(); buildPhone();
    buildLaptop('web', bizDraw, 'assets/img/desk3d/resort.jpg');
    /* предметы-части (финмодель при книге, дрон при ролике): рамка и точки услуги — общие, камера и выноска видят их вместе */
    Object.keys(PART).forEach(function (id) { var a = objects[PART[id]], b = objects[id]; a.box.union(b.box); a.pts = a.pts.concat(b.pts); });
    finishBlocks();
    /* Линии по полу от пакета к каждому предмету его состава — видны, когда пакет под курсором или открыт */
    Object.keys(PACK).forEach(function (p) {
      /* тонкие ленты на полу, а не линии в 1 пиксель: так их видно при любом масштабе */
      var c0 = objects[p].box.getCenter(new T.Vector3()), gr = new T.Group();
      var lm = new T.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, depthWrite: false, toneMapped: false, fog: false });
      packFlat(p).forEach(function (x) {
        var c = objects[x].box.getCenter(new T.Vector3()), dx = c.x - c0.x, dz = c.z - c0.z, len = Math.hypot(dx, dz);
        var rb = new T.Mesh(new T.PlaneGeometry(len, 0.005), lm); rb.rotation.set(-Math.PI / 2, 0, Math.atan2(-dz, dx)); rb.position.set(c0.x + dx / 2, 0.004, c0.z + dz / 2); rb.raycast = function () {}; gr.add(rb);
      });
      gr.visible = false; gr.renderOrder = 2; gr.material = lm; scene.add(gr); packLines[p] = gr;
    });
    ORDER.forEach(buildLabel);
    /* общий вид — все четыре плиты целиком */
    var all = new T.Box3(); home.pts = [];
    GKEYS.forEach(function (k) { all.union(BL[k].box); home.pts = home.pts.concat(BL[k].pts); });
    home.box = all;
    var c = all.getCenter(new T.Vector3());
    gridMat.uniforms.uCenter.value.set(c.x, c.z);
    if (COLUMN) { gridMat.uniforms.uNear.value = 4.5; gridMat.uniforms.uFar.value = 7.5; }
    Object.assign(home, { tx: c.x, ty: 0.02, tz: c.z, dist: 5, az: 0, el: homeEl(), fov: FOV_DESK });
    colHeight();
    resize();
    if (MODE === 'desk') {
      Object.assign(view, home); Object.assign(goal, home);
      if (!REDUCE) { view.dist = home.dist * 1.16; view.el = home.el + 0.12; view.az = -0.16; }
    }
    buildTexts();
    if (COLUMN) { Object.assign(goal, restView()); Object.assign(view, goal); syncArrows(); }
    if (document.fonts && document.fonts.load) Promise.all([document.fonts.load('600 22px Manrope'), document.fonts.load('400 16px Manrope'), document.fonts.load('700 22px Manrope'), document.fonts.load('500 22px "JetBrains Mono"'), document.fonts.load('400 40px Unbounded')]).then(function () { tagSize = {}; fontTex.forEach(redraw); buildTexts(); invalidate(); }).catch(function () {});
    stage.classList.add('is-ready');
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { resize(); });
    maybeHint();
    invalidate();
  }

  function camPos(v) {
    var ce = Math.cos(v.el);
    return new T.Vector3(v.tx + v.dist * Math.sin(v.az) * ce, v.ty + v.dist * Math.sin(v.el), v.tz + v.dist * Math.cos(v.az) * ce);
  }
  function applyCam(v) {
    if (v.fov && Math.abs(camera.fov - v.fov) > 1e-4) { camera.fov = v.fov; camera.updateProjectionMatrix(); }
    camera.position.copy(camPos(v)); camera.lookAt(v.tx, v.ty, v.tz);
  }
  /* Подгоняем камеру так, чтобы рамка предмета легла в заданный прямоугольник кадра (координаты от −1 до 1). */
  function boxPts(b, out) { out = out || []; for (var i = 0; i < 8; i++) out.push(new T.Vector3(i & 1 ? b.max.x : b.min.x, i & 2 ? b.max.y : b.min.y, i & 4 ? b.max.z : b.min.z)); return out; }
  function fitView(box, v, rect) {
    var corners = Array.isArray(box) ? box : boxPts(box), q = new T.Vector3(), cur = Object.assign({}, v);
    cur.dist = Math.max(v.dist || 1, new T.Box3().setFromPoints(corners).getSize(new T.Vector3()).length() * 1.2);
    var rcx = (rect.x0 + rect.x1) / 2, rcy = (rect.y0 + rect.y1) / 2, rw = (rect.x1 - rect.x0) / 2, rh = (rect.y1 - rect.y0) / 2;
    for (var it = 0; it < 9; it++) {
      applyCam(cur); camera.updateMatrixWorld();
      var x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
      corners.forEach(function (p) { q.copy(p).project(camera); x0 = Math.min(x0, q.x); x1 = Math.max(x1, q.x); y0 = Math.min(y0, q.y); y1 = Math.max(y1, q.y); });
      var hh = cur.dist * Math.tan(camera.fov * Math.PI / 360), hw = hh * camera.aspect;
      var right = new T.Vector3().setFromMatrixColumn(camera.matrixWorld, 0), up = new T.Vector3().setFromMatrixColumn(camera.matrixWorld, 1);
      var off = right.multiplyScalar(((x0 + x1) / 2 - rcx) * hw).add(up.multiplyScalar(((y0 + y1) / 2 - rcy) * hh));
      cur.tx += off.x; cur.ty += off.y; cur.tz += off.z;
      cur.dist *= Math.max((x1 - x0) / 2 / rw, (y1 - y0) / 2 / rh);
    }
    return cur;
  }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  var MODE = null, RAIL = { x: 0, gx: 0 }, userMoved = false, lastW = 0, lastH = 0;
  var focused = null, flyK = 7;
  /* Телефон: заголовок лежит поверх верха сцены — на уровне 0 стол ставим ниже него */
  function headZone() {
    if (!headEl || !railMode()) return 0;
    var s = stage.getBoundingClientRect(), b = headEl.getBoundingClientRect();
    return clamp(Math.round(b.bottom - s.top), 0, Math.round(stage.clientHeight * 0.45));
  }
  /* наклон камеры: на телефоне стол смотрим сверху круче, чтобы квадрат 2×2 влез в узкий экран */
  function homeEl() { return COLUMN ? 0.95 : railMode() ? 1.02 : 0.5; }
  function blockEl() { return railMode() ? 0.98 : 1.0; }
  /* верх сцены, занятый надписями: «Что вам нужно?» на уровне 0, полоса «← Все направления» на уровне 1 */
  /* на уровне 0 сверху — вопрос и надписи задних блоков, снизу — надписи передних */
  function lblH() { var m = 0; GKEYS.forEach(function (k) { if (BL[k] && BL[k].el) m = Math.max(m, BL[k].el.offsetHeight || 0); }); return m || (railMode() ? 58 : 70); }
  function topPad(level) {
    var hz = headZone();
    if (level === 0) { if (askEl) askEl.style.top = (hz + (railMode() ? 4 : 10)) + 'px'; return railMode() ? hz + 54 + lblH() + 6 : 78; }
    return railMode() ? 60 : 64;
  }
  function botPad() { return railMode() ? lblH() + 18 : 14; }
  function sidePad() { return railMode() ? 0 : lblW() + 22; }
  function blockView(k) {
    var h = stage.clientHeight || 500, B = BL[k], c = B.box.getCenter(new T.Vector3());
    var r = railMode() ? { x0: -0.95, x1: 0.95, y0: -0.95, y1: 1 - 2 * topPad(1) / h } : { x0: -0.97, x1: 0.97, y0: -0.95, y1: 1 - 2 * topPad(1) / h };
    /* компьютер: в кадр входит и крупное название блока на полу сбоку */
    var T0 = !railMode() && titleOf(k), pts = T0 ? B.pts.concat(T0.pts) : B.pts;
    if (T0) c = new T.Box3().setFromPoints(pts).getCenter(new T.Vector3());
    return fitView(pts, { tx: c.x, ty: 0.03, tz: c.z, dist: 2.4, az: 0, el: blockEl(), fov: FOV_DESK }, r);
  }
  function rowView(i) {
    var h = stage.clientHeight || 500, B = BL[GKEYS[i]], c = B.box.getCenter(new T.Vector3());
    return fitView(B.pts, { tx: c.x, ty: 0.03, tz: c.z, dist: 3, az: 0, el: homeEl(), fov: FOV_RAIL }, { x0: -0.84, x1: 0.84, y0: -1 + 2 * botPad() / h, y1: 1 - 2 * topPad(0) / h });
  }
  /* Телефон: как на ноутбуке внутри блока, только блоки идут столбцом вниз (название и плита меняются сторонами через раз).
     Камера близко — предметы и названия на столе крупные; стол можно повести пальцем влево-вправо, свайп вниз — следующий блок,
     после четвёртого — обычная прокрутка страницы. */
  var CI = 0, SI = 0;
  /* Остановки камеры в блоке слева направо: название блока и три участка плиты. Свайп или стрелка — к соседней остановке. */
  function colSteps(i) {
    var k = GKEYS[i], P = PLATES[k], T0 = titleOf(k), xs = [P.x0 + 0.5, (P.x0 + P.x1) / 2, P.x1 - 0.5];
    var tx = T0 ? (T0.pts[0].x + T0.pts[1].x) / 2 : (P.tside === 'l' ? P.x0 - 0.6 : P.x1 + 0.6);
    /* на остановке «название» видны и название, и край плиты с первыми предметами */
    return P.tside === 'l' ? [tx + 0.3].concat(xs) : xs.concat([tx - 0.3]);
  }
  function titleStep(i) { return PLATES[GKEYS[i]].tside === 'l' ? 0 : 3; }
  /* Кадр: плита по высоте заполняет место под заголовком страницы, камера низко — предметы крупные, в перспективе */
  function colView(i, x) {
    var P = PLATES[GKEYS[i]], h = stage.clientHeight || 500, top = headZone() + 34;
    var pts = [new T.Vector3(x, 0, P.z0 - 0.03), new T.Vector3(x, 0.22, P.z0 + 0.25), new T.Vector3(x - 0.3, 0, P.z1 + 0.03), new T.Vector3(x + 0.3, 0, P.z1 + 0.03)];
    var v = fitView(pts, { tx: x, ty: 0.03, tz: (P.z0 + P.z1) / 2, dist: 2.4, az: 0, el: 0.62, fov: FOV_RAIL }, { x0: -0.98, x1: 0.98, y0: -0.95, y1: 1 - 2 * top / h });
    v.tx = x; return v;
  }
  function curView() { return colView(CI, colSteps(CI)[SI]); }
  function homeView() { return COLUMN ? curView() : home; }
  function restView() { return COLUMN ? curView() : blk ? blockView(blk) : homeView(); }
  function goBlockCol(i) {
    CI = clamp(i, 0, GKEYS.length - 1); SI = titleStep(CI);
    if (blk !== GKEYS[CI]) setBlk(GKEYS[CI]);
    Object.assign(goal, curView()); flyK = 3; syncArrows(); stopHint(); invalidate();
  }
  function goStep(s) { SI = clamp(s, 0, 3); Object.assign(goal, curView()); flyK = 5; syncArrows(); stopHint(); invalidate(); }
  function stepRow(dir) { goStep(SI + dir); }
  var colHint = document.createElement('p'); colHint.className = 'dk-colhint'; colHint.hidden = true; stage.appendChild(colHint);
  var COL_ASK = { invest: 'Хотите привлечь инвестиции?', estate: 'Хотите продать недвижимость?', industry: 'Хотите презентовать производство или инфраструктуру?', ads: 'Нужна реклама для бизнеса?' };
  function syncArrows() {
    if (!COLUMN) return;
    var hh = !(SI === 0 && !focused);
    if (!hh) colHint.innerHTML = '<b>' + COL_ASK[GKEYS[CI]] + '</b><span>Листайте вправо →</span>' + (CI < GKEYS.length - 1 ? '<span class="dk-colhint-d">Вниз — другие направления ↓</span>' : '');
    if (colHint.hidden !== hh) colHint.hidden = hh;
    var on = !focused, hp = !on || SI <= 0, hn = !on || SI >= 3;
    if (prevBtn.hidden !== hp) prevBtn.hidden = hp; if (nextBtn.hidden !== hn) nextBtn.hidden = hn;
  }
  function resize() {
    var w = stage.clientWidth, h = stage.clientHeight; if (!w || !h) return;
    if (w !== lastW || h !== lastH) { lastW = w; lastH = h; lblFix = 0; }
    renderer.setSize(w, h, false);
    camera.aspect = w / h; camera.updateProjectionMatrix();
    var fv = fitView(home.pts, { tx: home.tx, ty: home.ty, tz: home.tz, dist: home.dist, az: 0, el: homeEl(), fov: FOV_DESK }, { x0: -1 + 2 * Math.max(12, sidePad()) / w, x1: 1 - 2 * Math.max(12, sidePad()) / w, y0: -1 + 2 * botPad() / h, y1: 1 - 2 * topPad(0) / h });
    Object.assign(home, { tx: fv.tx, ty: fv.ty, tz: fv.tz, dist: fv.dist, az: 0, el: homeEl(), fov: FOV_DESK });
    stage.style.setProperty('--dk-headh', (headZone() + 34) + 'px');
    var mode = railMode() ? 'rail' : 'desk';
    if (mode !== MODE) { MODE = mode; enterMode(); }
    else if (focused) Object.assign(goal, focusView(focused));
    else if (!userMoved) Object.assign(goal, restView());
    invalidate();
  }
  function enterMode() {
    hovered = null; pinned = null; hideTip(); userMoved = false; tagSize = {};
    if (COLUMN) { canvas.style.touchAction = 'none'; askEl.style.display = 'none'; SI = titleStep(CI); }
    if (focused) { focused = null; closePanel(); stage.classList.remove('is-focus'); if (heroEl) heroEl.classList.remove('dk-focus'); }
    stage.classList.toggle('is-rail', MODE === 'rail'); stage.classList.remove('is-moved');
    Object.assign(goal, restView());
    if (MODE === 'rail') Object.assign(view, goal);
    syncArrows();
    if (COLUMN && !blk) setBlk(GKEYS[CI]);
  }
  function focusId() {
    if (focused) return focused;
    if (MODE === 'rail' || !blk) return null;
    return hovered;
  }
  /* ---------------- уровни: блоки ---------------- */
  /* Телефон, общий вид: столбец из четырёх блоков во всю ширину — сцена выше экрана и листается вместе со страницей.
     В открытом блоке сцена снова обычной высоты. */
  function colHeight() {
    if (!COLUMN || true) return;   // ряд блоков помещается в обычную высоту сцены
    var hgt = blk || focused ? '' : Math.round(stage.clientWidth * 3.3 + headZone() + 90) + 'px';
    if (stage.style.height !== hgt) stage.style.height = hgt;
  }
  function setBlk(k) {
    if (COLUMN) {
      blk = k; hovBlk = null;
      askEl.innerHTML = '<p class="dk-ask-h">' + (k ? '<b class="dk-ask-n">0' + BL[k].n + '</b>' + esc(GSHORT[k]) : 'Что вам нужно?') + '</p>';
      syncArrows(); return;
    }
    blk = k; hovBlk = null;
    stage.classList.toggle('is-blk', !!k); stage.classList.toggle('is-l0', !k);
    if (heroEl) heroEl.classList.toggle('dk-inblk', !!k);
    if (k && lvT) lvT.innerHTML = '<b>0' + BL[k].n + '</b>' + esc(GNAME[k]);
    if (k) markSeen('blk');
  }
  function enterBlock(k) {
    if (!HAS3D || !BL[k]) return;
    if (COLUMN) { goBlockCol(GKEYS.indexOf(k)); return; }
    if (focused) { focused = null; packCtx = null; packHover = null; closePanel(); stage.classList.remove('is-focus'); if (heroEl) heroEl.classList.remove('dk-focus'); }
    hovered = null; hideTip(); setBlk(k);
    stage.classList.add('is-used'); userMoved = false; stage.classList.remove('is-moved');
    Object.assign(goal, blockView(k)); flyK = 3.2;
    if (MODE === 'rail') {
      var r = stage.getBoundingClientRect(), tb = document.querySelector('.top[data-top]'), th = tb ? tb.offsetHeight : 0;
      if (r.top < th - 4 || r.bottom > window.innerHeight + 4) window.scrollBy({ top: r.top - th, behavior: REDUCE ? 'auto' : 'smooth' });
    }
    invalidate();
  }
  function exitBlock() {
    if (focused) { focused = null; packCtx = null; packHover = null; closePanel(); stage.classList.remove('is-focus'); if (heroEl) heroEl.classList.remove('dk-focus'); }
    if (COLUMN) { if (focused) exitFocus(); return; }
    var was = blk; hovered = null; hideTip(); setBlk(null);
    userMoved = false; stage.classList.remove('is-moved');
    Object.assign(goal, homeView()); flyK = 3.2; invalidate();
  }
  function setHovBlk(k) {
    if (blk || focused || hovBlk === k) return;
    hovBlk = k; stage.classList.toggle('is-over', !!k); invalidate();
  }


  /* ---------------- крупный план и панель ---------------- */
  function focusRect() {
    var w = stage.clientWidth, h = stage.clientHeight;
    if (MODE === 'rail') { var ph = panel.offsetHeight || 230; return { x0: -0.92, x1: 0.92, y0: -1 + 2 * (ph + 26) / h, y1: 1 - 2 * 70 / h }; }
    var pw = panel.offsetWidth || clamp(innerWidth * 0.27, 330, 420), pr = clamp(innerWidth * 0.026, 16, 40);
    return { x0: -1 + 2 * 40 / w, x1: -1 + 2 * (w - pw - pr - 28) / w, y0: -1 + 2 * 84 / h, y1: 1 - 2 * 60 / h };
  }
  function focusView(id) {
    var b = objects[id].box, c = b.getCenter(new T.Vector3()), f = FOCUS[id] || {}, r = focusRect(), s = MODE === 'rail' ? 0.98 : 1.0;   // камера ближе: предмет занимает всё место слева от панели
    var cx = (r.x0 + r.x1) / 2, cy = (r.y0 + r.y1) / 2;
    r = { x0: cx - (cx - r.x0) * s, x1: cx + (r.x1 - cx) * s, y0: cy - (cy - r.y0) * s, y1: cy + (r.y1 - cy) * s };
    /* Пакет на компьютере: камера не утыкается в коробку, а показывает пакет и весь его состав слева от панели */
    if (PACK[id] && MODE !== 'rail') {
      var pts = objects[id].pts.slice(), bb = new T.Box3();
      packFlat(id).forEach(function (x) { pts = pts.concat(objects[x].pts); });
      bb.setFromPoints(pts); bb.getCenter(c);
      return fitView(pts, { tx: c.x, ty: c.y, tz: c.z, dist: 2, az: 0, el: 0.62, fov: FOV_DESK }, r);
    }
    return fitView(objects[id].pts, { tx: c.x, ty: c.y, tz: c.z, dist: 1, az: f.az || 0, el: MODE === 'rail' ? Math.max(f.el || 0.34, 0.5) : f.el || 0.34, fov: MODE === 'rail' ? 38 : FOV_FOCUS }, r);
  }
  var fCount = document.getElementById('dk-f-count'), fPrev = document.getElementById('dk-f-prev'), fNext = document.getElementById('dk-f-next');
  /* Порядок листания: обычно все услуги стола; если пришли из пакета — пакет и его состав */
  function stepList() { return packCtx ? [packCtx].concat(packFlat(packCtx)) : BLOCKS[BLK[sid(focused)]] || ORDER; }
  function updateFbar(id) {
    var L = stepList(), n = L.length, i = Math.max(0, L.indexOf(id)), a = DATA[L[(i - 1 + n) % n]].label, b = DATA[L[(i + 1) % n]].label;
    fCount.textContent = (i < 9 ? '0' : '') + (i + 1) + ' / ' + n;
    fPrev.setAttribute('aria-label', 'Предыдущая услуга: ' + a); fPrev.title = a;
    fNext.setAttribute('aria-label', 'Следующая услуга: ' + b); fNext.title = b;
  }
  function enterFocus(id, byKey, keepPack) {
    if (!keepPack) packCtx = null;
    if (BLK[sid(id)] !== blk) setBlk(BLK[sid(id)]);
    focused = id; packHover = null; hovBlk = null; syncArrows();
    if (!tapSeen) { tapSeen = true; markSeen('tap'); }
    stage.classList.add('is-tapped');
    stopHint();
    if (heroEl) heroEl.classList.add('dk-focus');
    chipOn = null;   // на телефоне лента зоны только что показалась — пусть подкрутится к этой услуге
    openPanel(id); updateFbar(id);
    if (!HAS3D) { stage.classList.add('is-focus'); syncChips(id); return; }
    hovered = null; pinned = null; hideTip(); clearTimeout(leaveT); clearTimeout(hideT); leaveT = 0;
    stage.classList.add('is-focus', 'is-used'); stage.classList.remove('is-over');
    if (MODE === 'rail') {
      /* шапка закреплена — верх сцены подвозим под неё, а не под край экрана */
      var r = stage.getBoundingClientRect(), tb = document.querySelector('.top[data-top]'), th = tb ? tb.offsetHeight : 0;
      if (r.top < th - 4 || r.bottom > window.innerHeight + 4) window.scrollBy({ top: r.top - th, behavior: REDUCE ? 'auto' : 'smooth' });
    }
    Object.assign(goal, focusView(id)); flyK = 3.4;
    if (byKey) panel.focus({ preventScroll: true });
    invalidate();
  }
  function exitFocus() {
    if (!focused) return;
    focused = null; packCtx = null; packHover = null; closePanel(); syncArrows();
    if (heroEl) heroEl.classList.remove('dk-focus');
    if (!HAS3D) { stage.classList.remove('is-focus'); syncChips(null); return; }
    stage.classList.remove('is-focus'); flyK = 3.4;
    /* из крупного плана — назад к своему блоку */
    userMoved = false; stage.classList.remove('is-moved'); Object.assign(goal, restView());
    invalidate();
  }
  function stepFocus(dir) {
    var L = stepList(), n = L.length, i = L.indexOf(focused);
    enterFocus(L[(i + dir + n) % n], false, !!packCtx);
  }
  /* Из пакета — к услуге его состава и обратно */
  function goPack(t) {
    if (PACK[t] && t === packCtx) { enterFocus(t, false, true); return; }
    if (PACK[focused]) packCtx = focused;
    enterFocus(t, false, !!packCtx);
  }

  /* ---------------- выноска ---------------- */
  function showTip(id) {
    if (!id) { hideTip(); return; }
    if (tipId !== id) { tip.innerHTML = tipHTML(id); tipId = id; }
    tip.classList.add('is-on'); tipSvg.classList.add('is-on'); placeTip();
  }
  function hideTip() { tip.classList.remove('is-on'); tipSvg.classList.remove('is-on'); tapEl.classList.remove('is-on'); tipId = null; }
  function screenRect(id) {
    var o = objects[id]; if (!o) return null;
    var b = o.box.clone(); b.min.y += o.lift; b.max.y += o.lift;
    var r = { x0: 1e9, y0: 1e9, x1: -1e9, y1: -1e9 }, w = stage.clientWidth, h = stage.clientHeight;
    for (var i = 0; i < 8; i++) {
      var p = new T.Vector3(i & 1 ? b.max.x : b.min.x, i & 2 ? b.max.y : b.min.y, i & 4 ? b.max.z : b.min.z).project(camera);
      var x = (p.x + 1) / 2 * w, y = (1 - p.y) / 2 * h;
      r.x0 = Math.min(r.x0, x); r.x1 = Math.max(r.x1, x); r.y0 = Math.min(r.y0, y); r.y1 = Math.max(r.y1, y);
    }
    return r;
  }
  function placeTip() {
    if (!tipId || !tip.classList.contains('is-on')) return;
    var r = screenRect(tipId); if (!r) return;
    var w = stage.clientWidth, h = stage.clientHeight, hx = 16;
    if (tip.style.width) tip.style.width = '';
    var tw = tip.offsetWidth, th = tip.offsetHeight, gap = 26;
    var cx = (r.x0 + r.x1) / 2, oh = r.y1 - r.y0, ax, ay, x, y, dir = 'down';
    if (MODE === 'rail') { x = cx - tw / 2; y = Math.max(railTop + 6, r.y0 - gap - th); ax = clamp(cx, 12, w - 12); ay = Math.max(r.y0 + Math.min(12, oh * 0.18), y + th + 10); }
    else if (r.y0 - gap - th >= 12) { x = cx - tw / 2; y = r.y0 - gap - th; ax = cx; ay = r.y0 + Math.min(12, oh * 0.18); }
    else if (r.x1 + gap + tw <= w - 6) { x = r.x1 + gap; ay = r.y0 + oh * 0.3; y = ay - th / 2; ax = r.x1 - (r.x1 - r.x0) * 0.22; dir = 'left'; }
    else if (r.x0 - gap - tw >= 6) { x = r.x0 - gap - tw; ay = r.y0 + oh * 0.3; y = ay - th / 2; ax = r.x0 + (r.x1 - r.x0) * 0.22; dir = 'right'; }
    else { x = cx - tw / 2; y = r.y1 + gap; ax = cx; ay = r.y1 - Math.min(12, oh * 0.18); dir = 'up'; }
    if (tip.getAttribute('data-dir') !== dir) tip.setAttribute('data-dir', dir);
    x = clamp(x, 6, w - tw - 6); y = clamp(y, 6, h - th - 6);
    var o = objects[tipId], c3 = o.box.getCenter(new T.Vector3()), tp = o.anchor ? o.group.localToWorld(o.anchor.clone()).project(camera) : new T.Vector3(c3.x, o.box.max.y + o.lift, c3.z).project(camera);
    var tx = (tp.x + 1) / 2 * w, ty = (1 - tp.y) / 2 * h;
    if (tx > r.x0 && tx < r.x1 && ty > r.y0 - 2 && ty < r.y1) { ax = tx; ay = ty + 3; }
    if (MODE === 'rail') ay = Math.max(ay, y + th + 10);
    tip.style.left = x.toFixed(1) + 'px'; tip.style.top = y.toFixed(1) + 'px';
    var px, py;
    if (ax >= x + 6 && ax <= x + tw - 6) { px = ax; py = ay < y ? y : y + th; }
    else { px = ax < x ? x : x + tw; py = clamp(ay, y + 8, y + th - 8); }
    tipLine.setAttribute('x1', px.toFixed(1)); tipLine.setAttribute('y1', py.toFixed(1));
    tipLine.setAttribute('x2', ax.toFixed(1)); tipLine.setAttribute('y2', ay.toFixed(1));
    tipDot.setAttribute('cx', ax.toFixed(1)); tipDot.setAttribute('cy', ay.toFixed(1));
    /* компьютер: палец «нажимает» на сам предмет — подсказка, что его можно открыть */
    if (MODE !== 'rail' && !focused) {
      tapEl.style.transform = 'translate(' + ((r.x0 + r.x1) / 2 - 13).toFixed(1) + 'px,' + (r.y0 + (r.y1 - r.y0) * 0.55 - 2).toFixed(1) + 'px)';
      if (!tapEl.classList.contains('is-on')) tapEl.classList.add('is-on');
    } else if (tapEl.classList.contains('is-on')) tapEl.classList.remove('is-on');
  }
  /* Листания стола вбок больше нет (на телефоне те же три уровня, что и на компьютере): стрелки и палец-подсказка спрятаны */
  prevBtn.hidden = true; nextBtn.hidden = true; tapEl.classList.remove('is-on');
  prevBtn.addEventListener('click', function () { stepRow(-1); });
  nextBtn.addEventListener('click', function () { stepRow(1); });
  function stopHint() { if (!swipeSeen) { swipeSeen = true; markSeen('swipe'); } }
  function maybeHint() {}
  var chipOn = null;
  function syncChips(f) {
    var key = (f || '') + '|' + (blk || '');
    if (key === chipOn) return; chipOn = key;
    return;   // список услуг больше не следит за столом
    /* под сценой подсвечена колонка текущего блока; на телефоне — только услуги этого блока */
    var cg = blk ? chipsEl.querySelector('[data-zone="' + blk + '"]') : null;
    chipGroups.forEach(function (g) { g.classList.toggle('is-cur', g === cg); g.classList.toggle('is-zone', g === cg); });
    chips.forEach(function (c) {
      var on = c.getAttribute('data-o') === f; c.classList.toggle('is-on', on);
      if (on && (MODE === 'rail' || (f === focused && chipGoal === null))) { var box = chipsEl.getBoundingClientRect(), cb = c.getBoundingClientRect(); chipsEl.scrollBy({ left: cb.left - box.left - (box.width - cb.width) / 2, behavior: REDUCE ? 'auto' : 'smooth' }); }
    });
  }

  /* ---------------- управление ---------------- */
  var ray = T ? new T.Raycaster() : null, ndc = T ? new T.Vector2() : null;
  function aim(ev) {
    var r = canvas.getBoundingClientRect();
    ndc.set((ev.clientX - r.left) / r.width * 2 - 1, -((ev.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ndc, camera);
  }
  /* Уровень 0: какой блок под курсором — по плите или по любому предмету на ней */
  function pickBlock(ev) {
    aim(ev);
    var hit = ray.intersectObjects(pickables.concat(plateMeshes), false).filter(function (h) { return h.object.visible && h.object.parent.visible; })[0];
    if (!hit) return null;
    return hit.object.userData.blk || BLK[hit.object.userData.oid] || null;
  }
  /* Уровни 1–2: предмет текущего блока. Попадание считаем по предметам в покое: приподнятый предмет не уходит из-под курсора.
     Текущий предмет держим и по его приподнятому виду, чтобы выноска не мигала на краях. */
  function pick(ev) {
    aim(ev);
    var up = [];
    Object.keys(objects).forEach(function (id) { var o = objects[id]; if (o.lift) { up.push(o); o.group.position.y = 0; o.group.updateMatrixWorld(true); } });
    var hit = ray.intersectObjects(pickables, false).filter(function (h) { return h.object.visible && h.object.parent.visible && (COLUMN || BLK[h.object.userData.oid] === blk); })[0];
    up.forEach(function (o) { o.group.position.y = o.lift; o.group.updateMatrixWorld(true); });
    var id = hit ? hit.object.userData.oid : null, keep = hovered;
    if (id !== keep && keep && objects[keep]) {
      var h2 = ray.intersectObjects(objects[keep].meshes, false)[0];
      if (h2 && (!hit || h2.distance <= hit.distance + 0.02)) id = keep;
    }
    return id;
  }
  var down = null, hideT = 0, leaveT = 0;
  function laterHide() { clearTimeout(hideT); hideT = setTimeout(function () { if (!hovered && !focused) hideTip(); }, 160); }
  function overTip(e) { if (!tip.classList.contains('is-on')) return false; var r = tip.getBoundingClientRect(); return e.clientX >= r.left - 3 && e.clientX <= r.right + 3 && e.clientY >= r.top - 3 && e.clientY <= r.bottom + 3; }
  stage.addEventListener('pointerdown', function (e) {
    if (e.target !== canvas && !(MODE === 'rail' && e.target.closest && e.target.closest('.dk-tag'))) return;
    down = { x: e.clientX, y: e.clientY, az: goal.az, el: goal.el, tx: goal.tx, tz: goal.tz, px: COLUMN ? colSteps(CI)[SI] : 0, id: e.pointerId, type: e.pointerType, pan: MODE === 'desk' && !!blk && !focused };
  });
  /* Уровень 1 на компьютере: стол не крутится, а сдвигается за мышью; отпустили — камера «примагничивается» к ближайшему блоку */
  function nearestBlk(x, z) {
    var best = null, bd = 1e9;
    GKEYS.forEach(function (k) { var v = blockView(k), d = (v.tx - x) * (v.tx - x) + (v.tz - z) * (v.tz - z); if (d < bd) { bd = d; best = k; } });
    return best;
  }
  window.addEventListener('pointermove', function (e) {
    if (down && e.pointerId === down.id) {
      var dx = e.clientX - down.x, dy = e.clientY - down.y;
      if (!dragging && down.pan && Math.abs(dx) + Math.abs(dy) > 6) {
        dragging = true; stage.classList.add('is-drag', 'is-used'); hideTip(); hovered = null;
        try { canvas.setPointerCapture(e.pointerId); } catch (er) {}
      }
      if (dragging && down.pan) {
        var upx = 2 * view.dist * Math.tan(view.fov * Math.PI / 360) / (stage.clientHeight || 500);
        goal.tx = view.tx = clamp(down.tx - dx * upx, -2.4, 2.4);
        goal.tz = view.tz = clamp(down.tz - dy * upx / Math.max(0.5, Math.sin(view.el)), -1.7, 1.7);
        flyK = 7; invalidate(); return;
      }
      if (!dragging && COLUMN && MODE === 'rail' && !focused && Math.abs(dy) > 8 && Math.abs(dy) > Math.abs(dx)) {
        dragging = true; down.vert = true; down.ly = e.clientY; stage.classList.add('is-drag', 'is-used');
        try { canvas.setPointerCapture(e.pointerId); } catch (er) {}
      }
      if (!dragging && Math.abs(dx) > 6 && Math.abs(dx) > Math.abs(dy) * 0.8) {
        dragging = true; stage.classList.add('is-drag', 'is-used');
        try { canvas.setPointerCapture(e.pointerId); } catch (er) {}
        if (MODE === 'desk' && !focused) hideTip();
      }
      if (dragging) {
        flyK = 7;
        if (MODE === 'rail' && COLUMN && !focused) {
          if (down.vert) {
            /* у первого блока вверх и у последнего вниз палец листает саму страницу */
            if ((CI === GKEYS.length - 1 && dy < 0) || (CI === 0 && dy > 0)) window.scrollTo({ top: window.pageYOffset + down.ly - e.clientY, behavior: 'instant' });   // сразу, без плавной прокрутки страницы
            down.ly = e.clientY;
          } else {
            var upr = 2 * view.dist * Math.tan(view.fov * Math.PI / 360) / (stage.clientHeight || 500);
            var st = colSteps(CI), cv = colView(CI, clamp(down.px - dx * upr * 1.3, st[0] - 0.15, st[st.length - 1] + 0.15));
            goal.tx = view.tx = cv.tx; goal.tz = view.tz = cv.tz; goal.dist = view.dist = cv.dist;
          }
        } else if (MODE === 'rail') {
          /* телефон: стол вращается чуть-чуть, вертикальная прокрутка страницы остаётся пальцу */
          var ra = focused ? (FOCUS[focused] || {}).az || 0 : 0;
          goal.az = view.az = clamp(down.az - dx * 0.0025, ra - 0.6, ra + 0.6);
        } else {
          var fa = focused ? (FOCUS[focused] || {}).az || 0 : 0, span = focused ? 0.95 : 0.75;
          goal.az = clamp(down.az - dx * 0.006, fa - span, fa + span);
          if (down.type === 'mouse') goal.el = clamp(down.el + dy * 0.004, focused ? 0.1 : 0.3, 1.2);
          view.az += (goal.az - view.az) * 0.6; view.el += (goal.el - view.el) * 0.6;
          if (!focused) { userMoved = true; stage.classList.add('is-moved'); }
        }
        invalidate();
      }
      return;
    }
    if (MODE !== 'desk' || e.pointerType !== 'mouse' || e.target !== canvas) return;
    if (focused) { stage.classList.toggle('is-over', !!pick(e)); return; }
    /* уровень 0: подсвечиваем блок целиком */
    if (!blk) { setHovBlk(pickBlock(e)); return; }
    var id = pick(e);
    stage.classList.toggle('is-over', !!id || !!pickBlock(e));
    if (id) {
      clearTimeout(hideT); clearTimeout(leaveT); leaveT = 0; stage.classList.add('is-used');
      if (hovered !== id) { hovered = id; invalidate(); }
      showTip(id);
      if (overTip(e)) hideTip();
    } else {
      /* курсор ушёл с предмета — выноска исчезает сразу */
      clearTimeout(leaveT); clearTimeout(hideT); leaveT = 0;
      if (hovered) { hovered = null; invalidate(); }
      hideTip();
    }
  });
  window.addEventListener('pointerup', function (e) {
    if (!down || e.pointerId !== down.id) return;
    var was = dragging, dx = e.clientX - down.x, dy = e.clientY - down.y, vert = down.vert, pan = down.pan, d0 = down; dragging = false; stage.classList.remove('is-drag'); down = null;
    if (was && pan) {
      /* магнит: достаточно сдвинуть стол примерно на треть пути — камера сама доедет до соседнего блока */
      var nk = nearestBlk(d0.tx + (goal.tx - d0.tx) * 2.6, d0.tz + (goal.tz - d0.tz) * 2.6);
      if (nk && nk !== blk) enterBlock(nk); else { Object.assign(goal, blockView(blk)); flyK = 4; invalidate(); }
      return;
    }
    if (was) {
      if (MODE === 'rail' && focused) { if (Math.abs(dx) > 40) stepFocus(dx < 0 ? 1 : -1); else { Object.assign(goal, focusView(focused)); flyK = 5; } }
      else if (MODE === 'rail' && COLUMN) {
        if (vert) { if (dy < -40 && CI < GKEYS.length - 1) goBlockCol(CI + 1); else if (dy > 40 && CI > 0) goBlockCol(CI - 1); }
        /* влево-вправо: короткого свайпа хватает, чтобы перейти к соседней остановке; иначе — к ближайшей */
        else if (Math.abs(dx) > 24) goStep(SI + (dx < 0 ? 1 : -1));
        else { var st2 = colSteps(CI), b = 0; st2.forEach(function (x, j) { if (Math.abs(x - goal.tx) < Math.abs(st2[b] - goal.tx)) b = j; }); goStep(b); }
      }
      else if (MODE === 'rail') { Object.assign(goal, restView()); flyK = 5; }
      invalidate(); return;
    }
    if (e.target !== canvas) return;
    /* уровень 0: нажали на плиту или предмет — камера подлетает к блоку */
    if (!blk) { var k0 = pickBlock(e); if (k0) enterBlock(k0); return; }
    var id = pick(e);
    if (id) { if (id !== focused) enterFocus(id); return; }
    /* мимо предметов блока: соседний блок — перейти к нему; пустое место — из крупного плана назад к блоку */
    var k = pickBlock(e);
    if (k && k !== blk) enterBlock(k);
    else if (focused) exitFocus();
  });
  window.addEventListener('pointercancel', function () { dragging = false; down = null; stage.classList.remove('is-drag'); invalidate(); });
  canvas.addEventListener('pointerleave', function (e) {
    if (e.pointerType !== 'mouse' || MODE !== 'desk') return;
    stage.classList.remove('is-over');
    setHovBlk(null);
    if (focused) return;
    clearTimeout(leaveT); leaveT = 0;
    if (hovered) { hovered = null; invalidate(); }
    hideTip();
  });
  lvEl.querySelector('.dk-lv-back').addEventListener('click', function () { exitBlock(); });
  lvEl.querySelector('.dk-lv-x').addEventListener('click', function () { exitBlock(); });
  /* на телефоне подпись предмета тоже нажимается — открывает услугу */
  stage.addEventListener('click', function (e) {
    var t = MODE === 'rail' && !focused && e.target.closest ? e.target.closest('.dk-tag') : null;
    if (t) enterFocus(t.getAttribute('data-o'));
  });
  chipsEl.addEventListener('click', function (e) {
    var b = e.target.closest('.dk-chip'); if (!b) return;
    /* «Наши услуги» под столом со столом не связаны: кнопка ведёт к карточке услуги ниже на странице */
    goTo('more', b.getAttribute('data-o'));
  });
  panel.addEventListener('click', function (e) {
    var g = e.target.closest('[data-goto]');
    if (g && focused) { e.preventDefault(); goPack(g.getAttribute('data-goto')); if (e.detail === 0) panel.focus({ preventScroll: true }); return; }
    var a = e.target.closest('[data-go]'); if (!a || !focused) return;
    e.preventDefault(); goTo(a.getAttribute('data-go'), focused);
  });
  /* Наведение на строку состава — предмет на столе вспыхивает контуром */
  panel.addEventListener('pointerover', function (e) {
    var g = e.target.closest ? e.target.closest('.dk-p-go') : null, id = g ? g.getAttribute('data-goto') : null;
    if (id !== packHover) { packHover = id; invalidate(); }
  });
  panel.addEventListener('pointerleave', function () { if (packHover) { packHover = null; invalidate(); } });
  fPrev.addEventListener('click', function () { stepFocus(-1); });
  fNext.addEventListener('click', function () { stepFocus(1); });
  document.getElementById('dk-f-back').addEventListener('click', function () { exitFocus(); });
  /* крестик в панели — тоже выход к блоку; с клавиатуры фокус переходит на кнопку этой услуги под сценой */
  document.getElementById('dk-p-x').addEventListener('click', function (e) {
    var id = focused; exitFocus();
    if (e.detail === 0 && id) { var c = chipsEl.querySelector('[data-o="' + id + '"]'); if (c) c.focus({ preventScroll: true }); }
  });
  resetBtn.addEventListener('click', function () { userMoved = false; stage.classList.remove('is-moved'); hovered = null; hideTip(); Object.assign(goal, restView()); flyK = 5; invalidate(); });
  document.addEventListener('keydown', function (e) {
    if (document.documentElement.classList.contains('deck-on')) return;
    var tg = (e.target && e.target.tagName || '').toLowerCase(); if (tg === 'input' || tg === 'textarea' || tg === 'select') return;
    if (e.key === 'Escape') { if (focused) exitFocus(); else if (blk && (stage.contains(document.activeElement) || chipsEl.contains(document.activeElement) || document.activeElement === document.body)) exitBlock(); else if (MODE === 'desk') { hovered = null; hideTip(); invalidate(); } return; }
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    var dir = e.key === 'ArrowRight' ? 1 : -1;
    if (focused && (panel.contains(document.activeElement) || stage.contains(document.activeElement) || document.activeElement === document.body)) stepFocus(dir);
  });

  /* ---------------- кадр ---------------- */
  function damp(cur, to, k, dt) { return cur + (to - cur) * (1 - Math.exp(-k * dt)); }
  function invalidate() { needs = true; if (!HAS3D) return; if (!raf && visible) raf = requestAnimationFrame(tick); }
  var SPIN = !REDUCE, spinOnly = false;
  function tick(t) {
    raf = 0;
    if (spinOnly && !needs && !dragging && last && t - last < 31) { raf = requestAnimationFrame(tick); return; }
    var dt = Math.min(0.05, last ? (t - last) / 1000 : 0.016); last = t;
    var moving = false, k = REDUCE ? 60 : flyK, R = REDUCE ? 60 : 0;
    if (goal.tx === undefined) Object.assign(goal, view);   // кадр до первой расстановки камеры
    PARAMS.forEach(function (p) {
      var nv = damp(view[p], goal[p], k, dt); if (Math.abs(nv - goal[p]) > 1e-4) moving = true; else nv = goal[p]; view[p] = nv;
    });
    if (!moving) flyK = 7;
    var f = focusId();
    var spun = SPIN && visible && spinners.length > 0;
    if (spun) spinners.forEach(function (sp) { sp.g.rotation[sp.ax] += dt * sp.v; });
    /* Пакет под курсором или в фокусе: яркий не один предмет, а весь набор — пакет и его состав */
    var S = null;
    if (f && PACK[f]) { S = {}; S[f] = 1; packFlat(f).forEach(function (x) { S[x] = 1; }); }
    var pulse = packHover && objects[packHover] ? 0.5 + 0.5 * Math.sin(t * 0.009) : 0;
    if (packHover) moving = true;
    Object.keys(packLines).forEach(function (p) {
      var L = packLines[p], to = S && f === p && MODE !== 'rail' ? 0.6 : 0, op = damp(L.material.opacity, to, R || 8, dt);
      if (Math.abs(op - to) < 0.005) op = to; else moving = true;
      L.material.opacity = op; L.visible = op > 0.001;
    });
    /* Надписи на столе: видны у открытого блока на компьютере; при наведении на предмет остальные приглушены */
    var tOn = (MODE === 'desk' && !!blk) || COLUMN;
    texts.forEach(function (q) {
      /* у открытого пакета видны названия его состава */
      var to = tOn && (COLUMN || BLK[q.id] === blk) && (!focused || (S && S[q.id])) ? (f && f !== q.id && !(S && S[q.id]) ? 0.4 : 1) : 0, op = damp(q.mat.opacity, to, R || 9, dt);
      if (Math.abs(op - to) < 0.01) op = to; else moving = true;
      q.mat.opacity = op; q.mesh.visible = op > 0.01;
    });
    titles.forEach(function (q) {
      var to = (MODE === 'desk' && blk === q.k || COLUMN) && !focused ? 1 : 0, op = damp(q.mat.opacity, to, R || 7, dt);
      if (Math.abs(op - to) < 0.01) op = to; else moving = true;
      q.mat.opacity = op; q.mesh.visible = op > 0.01;
    });
    /* Плиты: на уровне 0 блок под курсором приподнимается и светится; на уровне 1 свой блок яркий, соседние гаснут */
    GKEYS.forEach(function (bk) {
      var B = BL[bk], tl = !blk && hovBlk === bk ? LIFT_B : 0, nl = damp(B.lift, tl, R || 12, dt);
      if (Math.abs(nl - tl) < 1e-4) nl = tl; else moving = true;
      if (nl !== B.lift) { B.lift = nl; B.pl.position.y = nl - 0.0003; B.ln.position.y = nl - 0.0002; }
      var lo = blk ? (bk === blk ? (focused ? 0.12 : 0.4) : 0.08) : hovBlk === bk ? 1 : hovBlk ? 0.18 : 0.32, ol = damp(B.line.opacity, lo, R || 10, dt);
      if (Math.abs(ol - lo) < 0.004) ol = lo; else moving = true;
      B.line.opacity = ol;
      var gl = !blk && hovBlk === bk ? 1 : 0; B.glow = damp(B.glow || 0, gl, R || 10, dt); if (Math.abs(B.glow - gl) < 0.004) B.glow = gl; else moving = true;
      B.fill.color.copy(B.fill.userData.c0).lerp(B.fill.userData.c1, B.glow);
      B.fill.opacity = blk && bk !== blk ? 0.6 : 0.94;
    });
    Object.keys(objects).forEach(function (oid) {
      var o = objects[oid], id = sid(oid), bk = BLK[id], inS = S ? !!S[id] : id === f;
      var lt, dm;
      if (!blk) { lt = hovBlk === bk ? LIFT_B : 0; dm = hovBlk && hovBlk !== bk ? 0.45 : 1; }
      else if (bk !== blk) { lt = 0; dm = focused ? 0.05 : 0.2; }
      else { lt = id === f && !focused && MODE !== 'rail' ? LIFT : 0; dm = f && !inS ? (focused ? 0.07 : 0.4) : 1; }
      var nl = damp(o.lift, lt, R || 12, dt), nd = damp(o.dim, dm, R || 10, dt);
      if (Math.abs(nl - lt) < 1e-4) nl = lt; else moving = true;
      if (Math.abs(nd - dm) < 1e-3) nd = dm; else moving = true;
      if (nl !== o.lift) { o.lift = nl; o.group.position.y = nl; var cf = Math.max(0.3, 1 - nl / LIFT * 0.55); o.contacts.forEach(function (c) { c.position.y = 0.0012 - nl; c.material.opacity = c.userData.op * cf; }); }
      if (nd !== o.dim) { o.dim = nd; o.mats.forEach(function (m) { m.color.copy(m.userData.base).multiplyScalar(nd); if (m.userData.emis !== undefined && m.emissive) m.emissiveIntensity = m.userData.emis * nd; if (m.userData.env !== undefined) m.envMapIntensity = m.userData.env * Math.min(1, nd * 1.4); }); }
      var ef;
      if (!blk) ef = hovBlk === bk ? 1.5 : hovBlk ? 0.3 : 0.75;
      else if (bk !== blk) ef = 0.08;
      else ef = id === f ? (focused ? 1.7 : 1 + 0.9 * (o.lift / LIFT)) : inS ? 1.3 : (focused ? 0.05 : f ? Math.max(0.12, 0.22 + 0.78 * ((o.dim - 0.4) / 0.6)) : 1);
      if (id === packHover) ef = 1.3 + 1.2 * pulse;
      o.edge.opacity = o.hull.opacity = Math.min(1, o.edge.userData.op * ef);
    });
    applyCam(view);
    scene.fog.near = view.dist * 0.95; scene.fog.far = view.dist * 1.9;
    camera.updateMatrixWorld();
    if (MODE === 'rail' && tip.classList.contains('is-on')) hideTip();
    if (focused && tip.classList.contains('is-on')) hideTip();
    placeTags(f, S); placeBlocks();
    if (tip.classList.contains('is-on')) placeTip();
    syncChips(f);
    if (visible) renderer.render(scene, camera);
    needs = false;
    spinOnly = spun && !moving && !dragging;
    if (moving || dragging || spun) raf = requestAnimationFrame(tick); else last = 0;
  }

  if (HAS3D) {
    try { init3D(); } catch (err) { HAS3D = false; console.error(err); }
  }
  if (!HAS3D) {
    stage.classList.remove('is-ready');
    stage.querySelector('.dk-loading p').textContent = 'Не удалось запустить 3D в этом браузере. Услуги — в списке ниже.';
    panel.classList.add('is-static');
    return;
  }
  if ('ResizeObserver' in window) { var ro = new ResizeObserver(function () { resize(); }); ro.observe(stage); if (headEl) ro.observe(headEl); } else window.addEventListener('resize', function () { resize(); });
  if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { visible = es[0].isIntersecting; if (visible) invalidate(); }).observe(stage);
  window.__desk = { hov: function () { return hovered; }, objects: objects, view: view, goal: goal, camera: camera, screenRect: screenRect, idle: function () { return !raf; }, mode: function () { return MODE; }, labels: labels, home: home, invalidate: invalidate, info: function () { return renderer.info.render; },
    focus: enterFocus, unfocus: exitFocus, focused: function () { return focused; }, order: ORDER, blocks: BL, block: function () { return blk; }, enterBlock: enterBlock, exitBlock: exitBlock, hoverBlock: setHovBlk, goTo: goTo,
    targets: function (id) { var m = moreTarget(id); return { more: m ? m.className + (m.id ? '#' + m.id : '') + (m.getAttribute('data-deck') ? ' [' + m.getAttribute('data-deck') + ']' : '') : null, works: worksFor(id).map(function (e) { return e.getAttribute('data-svc'); }) }; },
    probe: function (id) { var o = objects[id], r = canvas.getBoundingClientRect(), v = new T.Vector3(), bb = new T.Box3(); for (var i = 0; i < o.meshes.length; i++) { bb.setFromObject(o.meshes[i]); bb.getCenter(v); v.project(camera); if (Math.abs(v.x) > 0.98 || Math.abs(v.y) > 0.98) continue; ndc.set(v.x, v.y); ray.setFromCamera(ndc, camera); var hit = ray.intersectObjects(pickables, false)[0]; if (hit && hit.object.userData.oid === id) return { x: r.left + (v.x + 1) / 2 * r.width, y: r.top + (1 - v.y) / 2 * r.height }; } return null; } };
})();
