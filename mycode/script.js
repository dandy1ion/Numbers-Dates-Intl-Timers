'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

/////////////////////////////////////////////////
// Data

// DIFFERENT DATA! Contains movement dates, currency and locale

const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2020-04-01T10:17:24.185Z',
    '2020-05-08T14:11:59.604Z',
    '2023-02-01T17:01:17.194Z',
    '2023-02-05T23:36:17.929Z',
    '2023-02-08T10:51:36.790Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT', // de-DE
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2020-04-10T14:43:26.374Z',
    '2020-06-25T18:49:59.371Z',
    '2020-07-26T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2];

/////////////////////////////////////////////////
// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

/////////////////////////////////////////////////
// Functions

const formatMovementDate = function (date, locale) {
  const calcDaysPassed = (date1, date2) =>
    Math.round(Math.abs(date2 - date1) / (1000 * 60 * 60 * 24));

  const daysPassed = calcDaysPassed(new Date(), date);
  //console.log(daysPassed);

  if (daysPassed === 0) return `Today`;
  if (daysPassed === 1) return `Yesterday`;
  if (daysPassed <= 7) return `${daysPassed} days ago`;
  else {
    //looping to erase at the same time
    //const day = `${date.getDate()}`.padStart(2, 0);
    //length of 2, if date/month only one number pad with 0 at start
    //const month = `${date.getMonth() + 1}`.padStart(2, 0);
    //const year = date.getFullYear();
    //return `${day}/${month}/${year}`;

    //use Internationalizing
    return new Intl.DateTimeFormat(locale).format(date); //date from function input
  }
};

const displayMovements = function (acc, sort = false) {
  containerMovements.innerHTML = '';

  const movs = sort
    ? acc.movements.slice().sort((a, b) => a - b)
    : acc.movements;

  movs.forEach(function (mov, i) {
    const type = mov > 0 ? 'deposit' : 'withdrawal';

    //current index in the movements array
    //points to equivalent date in this movements date array
    const date = new Date(acc.movementsDates[i]);
    const displayDate = formatMovementDate(date, acc.locale);

    const formattedMov = new Intl.NumberFormat(acc.locale, {
      style: 'currency',
      currency: acc.currency, //get currency from current account
    }).format(mov);

    const html = `
      <div class="movements__row">
        <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type}</div>
      <div class="movements__date">${displayDate}</div>
      <div class="movements__value">${formattedMov}</div>
      </div>
    `; //${formattedMov} done mannually was ${mov.toFixed(2)}€

    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

const calcDisplayBalance = function (acc) {
  acc.balance = acc.movements.reduce((acc, mov) => acc + mov, 0);
  labelBalance.textContent = `${acc.balance.toFixed(2)}€`;
};

const calcDisplaySummary = function (acc) {
  const incomes = acc.movements
    .filter(mov => mov > 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumIn.textContent = `${incomes.toFixed(2)}€`;

  const out = acc.movements
    .filter(mov => mov < 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumOut.textContent = `${Math.abs(out).toFixed(2)}€`;

  const interest = acc.movements
    .filter(mov => mov > 0)
    .map(deposit => (deposit * acc.interestRate) / 100)
    .filter((int, i, arr) => {
      // console.log(arr);
      return int >= 1;
    })
    .reduce((acc, int) => acc + int, 0);
  labelSumInterest.textContent = `${interest.toFixed(2)}€`;
};

const createUsernames = function (accs) {
  accs.forEach(function (acc) {
    acc.username = acc.owner
      .toLowerCase()
      .split(' ')
      .map(name => name[0])
      .join('');
  });
};
createUsernames(accounts);

const updateUI = function (acc) {
  // Display movements
  displayMovements(acc);

  // Display balance
  calcDisplayBalance(acc);

  // Display summary
  calcDisplaySummary(acc);
};

///////////////////////////////////////
// Event handlers
let currentAccount;

//FAKE ALWAYS LOGGED IN
currentAccount = account1;
updateUI(currentAccount);
containerApp.style.opacity = 100;

//Experimenting with API
//const now = new Date();
//create object for options (pass into datetimeformat)
//const options = {
//  hour: 'numeric',
//  minute: 'numeric',
//  day: 'numeric',
//  month: 'long', //can be numeric, 2-digit, or long
//  year: 'numeric',
//  weekday: 'long', //can be long, short, narrow
//};
//get locale from person's browser rather than manually entered
//const locale = navigator.language;
//console.log(locale);
//pass in locale string (language-country)
//labelDate.textContent = new Intl.DateTimeFormat('en-US', options).format(now);
//labelDate.textContent = new Intl.DateTimeFormat(locale, options).format(now);
//creates formatter for this language-country
//then call format on date (in this case now)
//google iso language code table (lingoes.net)
//MDN Intl documentation

btnLogin.addEventListener('click', function (e) {
  // Prevent form from submitting
  e.preventDefault();

  currentAccount = accounts.find(
    acc => acc.username === inputLoginUsername.value
  );
  console.log(currentAccount);

  if (currentAccount?.pin === +inputLoginPin.value) {
    // Display UI and message
    labelWelcome.textContent = `Welcome back, ${
      currentAccount.owner.split(' ')[0]
    }`;
    containerApp.style.opacity = 100;

    const now = new Date();
    const options = {
      hour: 'numeric',
      minute: 'numeric',
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
      //weekday: 'long',
    };
    //const locale = navigator.language;//locale from browser
    //use locale from current account
    labelDate.textContent = new Intl.DateTimeFormat(
      currentAccount.locale,
      options
    ).format(now);

    //day/month/year
    //Create current date and time
    //const now = new Date();
    //const day = `${now.getDate()}`.padStart(2, 0);
    //length of 2, if date/month only one number pad with 0 at start
    //const month = `${now.getMonth() + 1}`.padStart(2, 0);
    //const year = now.getFullYear();
    //const hour = `${now.getHours()}`.padStart(2, 0);
    //const min = `${now.getMinutes()}`.padStart(2, 0);
    //labelDate.textContent = `${day}/${month}/${year}, ${hour}:${min}`;

    // Clear input fields
    inputLoginUsername.value = inputLoginPin.value = '';
    inputLoginPin.blur();

    // Update UI
    updateUI(currentAccount);
  }
});

btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();
  const amount = +inputTransferAmount.value;
  const receiverAcc = accounts.find(
    acc => acc.username === inputTransferTo.value
  );
  inputTransferAmount.value = inputTransferTo.value = '';

  if (
    amount > 0 &&
    receiverAcc &&
    currentAccount.balance >= amount &&
    receiverAcc?.username !== currentAccount.username
  ) {
    // Doing the transfer
    currentAccount.movements.push(-amount);
    receiverAcc.movements.push(amount);

    //Add transfer date
    currentAccount.movementsDates.push(new Date().toISOString());
    receiverAcc.movementsDates.push(new Date().toISOString());

    // Update UI
    updateUI(currentAccount);
  }
});

btnLoan.addEventListener('click', function (e) {
  e.preventDefault();

  const amount = Math.floor(inputLoanAmount.value);

  if (amount > 0 && currentAccount.movements.some(mov => mov >= amount * 0.1)) {
    // Add movement
    currentAccount.movements.push(amount);

    //Add loan date
    currentAccount.movementsDates.push(new Date().toISOString());

    // Update UI
    updateUI(currentAccount);
  }
  inputLoanAmount.value = '';
});

btnClose.addEventListener('click', function (e) {
  e.preventDefault();

  if (
    inputCloseUsername.value === currentAccount.username &&
    +inputClosePin.value === currentAccount.pin
  ) {
    const index = accounts.findIndex(
      acc => acc.username === currentAccount.username
    );
    console.log(index);
    // .indexOf(23)

    // Delete account
    accounts.splice(index, 1);

    // Hide UI
    containerApp.style.opacity = 0;
  }

  inputCloseUsername.value = inputClosePin.value = '';
});

//error here with sort button
//has to do with changes made to displayMovements (before changes minute 8:14)
//HINT: video 176 minute 9:14
//look at original github code
let sorted = false;
btnSort.addEventListener('click', function (e) {
  e.preventDefault();
  displayMovements(currentAccount.movements, !sorted);
  sorted = !sorted;
});

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// LECTURES

/*
////////////////////////////////////////////////
//CONVERTING & CHECKING NUMBERS
//in JS all numbers are represented internally as floating point numbers (decimals)
//numbers are also represented internally in a 64 base 2 format (binary format)

console.log(23 === 23.0); //true

//Base 10 -> 0 to 9 (1/10 = 0.1) (3/10 = 3.3333333)
//Binary base 2 -> 0&1 (can end up with long decimals)
console.log(0.1 + 0.2); //0.30000000000004)
console.log(0.1 + 0.2 === 0.3); //false because of decimal

//Convert string to number
console.log(Number('23'));
console.log(+'23'); //another way to convert to number

//Parsing
//every function is also an object
console.log(Number.parseInt('30px', 10)); //JS figures out just the number
console.log(Number.parseInt('e23', 10)); //has to start with a number (NaN)
//parse takes a second argument called the radix (base of the numeral system using)

//white space does not effect result
console.log(Number.parseFloat('  2.5rem  ')); //2.5
console.log(Number.parseInt('  2.5rem  ')); //2
//Number provides a namespace
//console.log(parseFloat('   2.5rem   '));

//is not a number (check if value is NaN)
console.log(Number.isNaN(20)); //false, because it is a number
console.log(Number.isNaN('20')); //false, because it is a number in a string
console.log(Number.isNaN(+'20X')); //true, because it is not a number
console.log(Number.isNaN(23 / 0)); //gives us infinity, false

//isFinite method
//Best way to check if value is really a number
console.log(Number.isFinite(20)); //true, is a number
console.log(Number.isFinite('20')); //false, is not a number (it's a string)
console.log(Number.isFinite(+'20X')); //false, not a number
console.log(Number.isFinite(23 / 0)); //false, infinity

console.log(Number.isInteger(23)); //true
console.log(Number.isInteger(23.0)); //true
console.log(Number.isInteger(23 / 0)); //false


//////////////////////////////////////////////////////////////////////////
//MATH & ROUNDING

//SQUARE ROOT
console.log(Math.sqrt(25));
console.log(25 ** (1 / 2)); //2 is the square root
console.log(8 ** (1 / 3)); //3 is the cubic root

//Maximum value (does type coercion but does not do parsing)
console.log(Math.max(5, 18, 23, 11, 2)); //23
console.log(Math.max(5, 18, '23', 11, 2)); //23
console.log(Math.max(5, 18, '23px', 11, 2)); //NaN

//Minimum value
console.log(Math.min(5, 18, 23, 11, 2)); //2

//Constants on the math object/namespace
//calculate the radius of a circle with 10px
console.log(Math.PI * Number.parseFloat('10px') ** 2); //square the radius value
//result = 314.1592653589793

//Random function
console.log(Math.trunc(Math.random() * 6) + 1);
//random whole number between 0 & 6 (including 6)

const randomInt = (min, max) =>
  //use .floor to make sure will work even with negative numbers
  Math.floor(Math.random() * (max - min) + 1) + min;
console.log(randomInt(10, 20));
//random gives number between 0 to 1 need to multiply to get desired number max
//0 to (max - min)
//min to (max - min + min) or in other words a range between min & max

//ROUNDING INTEGERS (does type coercion)
console.log(Math.round(23.3)); //23, rounds to closest integer
console.log(Math.round(23.9)); //24, rounds to closest integer

console.log(Math.ceil(23.3)); //23, rounds up
console.log(Math.ceil(23.9)); //23, rounds up

console.log(Math.floor(23.3)); //23, rounds down
console.log(Math.floor('23.9')); //23, rounds down (does type coercion)

console.log(Math.trunc(23.3)); //23, removes decimal

console.log(Math.trunc(-23.3)); //-23, just removes everything from decimal after
console.log(Math.floor(-23.3)); //-24, with negative numbers rounding works opposite

//ROUNDING DECIMALS
//toFixed returns a string (NOT a number) = add + before to convert to a number
//put in how many decimal positions you want
console.log((2.7).toFixed(0)); //3
console.log((2.7).toFixed(3)); //2.700
console.log((2.345).toFixed(2)); //2.35
console.log(+(2.345).toFixed(2)); //2.35 (number)


///////////////////////////////////////////////////////////////////////
//THE REMAINDER OPERATOR (good use when need to do something every Nth time)
console.log(5 % 2); //remainder of 1 (2 goes into 5 2times with a remainder of 1)
console.log(5 / 2); //2.5 (5 = 2 * 2 + 1)

console.log(8 % 3); //remainer of 2 (3 goes into 8 2times with a remainder of 2)
console.log(8 / 3); //2.6666666666665 (8 = 3 * 2 + 2)

//check if number is even (0,2,4,6...) or odd(1,3,5,7...)
//even when devide by 2 remainder = 0
console.log(6 % 2); //0
console.log(6 / 2); //3

console.log(7 % 2); //1
console.log(7 / 2); //3.5

//create function
const isEven = n => n % 2 === 0;
console.log(isEven(8)); //true
console.log(isEven(23)); //false
console.log(isEven(514)); //true

//need event handler
labelBalance.addEventListener('click', function () {
  //select all of the rows of our movements
  [...document.querySelectorAll('.movements__row')].forEach(function (row, i) {
    if (i % 2 === 0) row.style.backgroundColor = 'orangered';
    //color every second row a different color (0,2,4,6...)
    if (i % 3 === 0) row.style.backgroundColor = 'blue';
    //color every third row a different color (0,3,6,9...)
  });
});


//////////////////////////////////////////////////////////////////
//NUMERIC SEPARATORS (to help format numbers)

//usually use 287,460,000,000
//JS use underscores
const diameter = 287_460_000_000;
console.log(diameter); //numeric separators ignored (287460000000)

const priceCents = 345_99;
console.log(priceCents); //34599

const transferFee = 15_00; //1500
const transferFee2 = 1_500; //1500

//can only place _ between numbers
const PI = 3.14_15;
//const PI = 3._1415; //syntax error
console.log(PI);

//trying to convert strings with _ to numbers
console.log(Number('230000')); //230000
console.log(Number('230_000')); //NaN (can cause bugs)
console.log(parseInt('230_000')); //230 (can cause bugs)


//////////////////////////////////////////////////////////////////////
//WORKING WITH BIGINT (can be used to store numbers no matter how big)
//numbers internally = 64bits
//there are exactly 64 1's or 0's to represent any given number
//only 53 for digits themselves
//rest used for storing position of the decimal point and the sign
//means there is a limit to how big a number can be
console.log(2 ** 53 - 1); //base 2 (0's&1's) times 53 positions
console.log(Number.MAX_SAFE_INTEGER);
console.log(2 ** 53 + 1); //can't get any bigger than this
//following numbers are too big, sometimes works sometimes not (creates bugs)
console.log(2 ** 53 + 2);
console.log(2 ** 53 + 3);
console.log(2 ** 53 + 4);

//BIGINT
console.log(48387586238659163918659678976329586n); //n makes it a bigint
console.log(BigInt(483875)); //only use with smaller numbers for accuracy

//OPERATIONS
console.log(10000n + 10000n);
console.log(4875092834760982746987n * 10000000n);

//can not mix BigInt with regular numbers
const huge = 20294857928457n;
const num = 23;
//console.log(huge * num); //error: cannot mix bigint and other types
console.log(huge * BigInt(num));

//**Exceptions**
//coercion
console.log(20n > 15); //true
console.log(20n === 20); //false, BigInt vs number
console.log(20n == 20); //true, type coercion
console.log(20n == '20'); //true, type coercion
//comparison and plus operators when working with strings
console.log(huge + ' is REALLY big!!!');

//Divisions
console.log(10n / 3n);
console.log(10 / 3);
console.log(11n / 3n);
console.log(11 / 3);


/////////////////////////////////////////////////////////////////////////////////
//CREATING DATES
const now = new Date();
console.log(now);

//parse date from date string
console.log(new Date('Feb 09 2023 18:48:45'));
console.log(new Date('December 24, 2015'));
//not used alot because not reliable
console.log(new Date(account1.movementsDates[0]));
//good to use it this way because JS created the string

//month is JS is 0 based
console.log(new Date(2037, 10, 19, 15, 23, 5)); //Thu Nov 19 2037 15:23:05
//JS auto corrects the date
console.log(new Date(2037, 10, 31)); //auto corrects to the next day of the next month
console.log(new Date(2037, 10, 33)); //auto corrects to Dec 03

//pass into the date consturctor function:
//the amount of milliseconds passed since the beginning of the Unix time (Dec 31 1969)
console.log(new Date(0)); //Wed Dec 31 1969
console.log(new Date(3 * 24 * 60 * 60 * 1000)); //Sat Jan 03, 1970
//3 days 24hours 60min in one hour 60sec in one min 1000 to convert to milliseconds
//time stamp (259200000) of the date


//Working with dates
//methods to get components of a date
const future = new Date(2037, 10, 19, 15, 23);
console.log(future);
console.log(future.getFullYear()); //2037
console.log(future.getMonth()); //0 based, 10 (November)
console.log(future.getDate()); //19
console.log(future.getDay()); //4, day of the week is 0 based starting with Sunday
//time is a 24hour clock (military time)
console.log(future.getHours()); //15
console.log(future.getMinutes()); //23
console.log(future.getSeconds()); //0
console.log(future.toISOString()); //international standard for date/time

console.log(future.getTime()); //time stamp of the date
console.log(new Date(2142282180000));

//current time stamp for this moment
console.log(Date.now());

//methods to set components of a date
future.setFullYear(2040);
console.log(future);
future.setMonth(12);
console.log(future);
future.setDate(12); //will automatically change the day of the week
console.log(future);
future.setHours(6);
console.log(future);
future.setMinutes(50);
console.log(future);
future.setSeconds(3);
console.log(future);


/////////////////////////////////////////////////////////////////
//OPERATIONS WITH DATES

//use time stamp (milliseconds) to perform calculations with dates
const future = new Date(2037, 10, 19, 15, 23);
console.log(+future); //convert to a number (time stamp)

//create function that takes in two dates and returns the number of days between the two
const calcDaysPassed = (date1, date2) =>
  Math.abs(date2 - date1) / (1000 * 60 * 60 * 24); //milliseconds to min to hours to days

const days1 = calcDaysPassed(new Date(2037, 3, 14), new Date(2037, 3, 24));
console.log(days1);

const days2 = calcDaysPassed(new Date(2037, 3, 14), new Date(2037, 3, 4));
console.log(days1); //math.abs gives us the positive

const days3 = calcDaysPassed(
  new Date(2037, 3, 14),
  new Date(2037, 3, 4, 10, 8) //gets rid of extra data (if not use math.round in function)
);
console.log(days1);
*/

///////////////////////////////////////////////////////////////////////
//INTERNATIONALZIING DATES (INTL)
//formating dates and times
//(done in Bankist App in formatMovementDate & btnLogin.addEventListener)

/////////////////////////////////////////////////////////////////////
//INTERNATIONALZIING NUMBERS (INTL)

const num = 3884764.23;

//const options = {
//  style: 'unit',
//  unit: 'celsius', //miles-per-hour, celsius, etc.
//};
//const options = {
//  style: 'percent',
//  unit: 'celsius', //this is then ignored
//};
const options = {
  style: 'currency',
  unit: 'celsius', //this is then ignored
  currency: 'EUR', //have to set the currency (not defined by the locale)
  //turn off/on grouping
  //useGrouping: false, //gets rid of separators
};

//numberformat takes in locale string
//pass into format what you want to format (num in this case)
console.log('US: ', new Intl.NumberFormat('en-US', options).format(num));
console.log('Germany: ', new Intl.NumberFormat('de-DE', options).format(num));
console.log('Syria: ', new Intl.NumberFormat('ar-SY', options).format(num));
console.log(
  navigator.language,
  new Intl.NumberFormat(navigator.language, options).format(num)
); //Browser locale

//implement currencies in bankist app
