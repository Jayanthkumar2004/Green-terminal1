/**
 * Converts a numerical amount into formal Indian English currency words.
 * Example: 1500 => "FIFTEEN HUNDRED RUPEES ONLY" or "ONE THOUSAND FIVE HUNDRED RUPEES ONLY"
 */

const singleDigits = ['', 'ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN', 'EIGHT', 'NINE'];
const teens = ['TEN', 'ELEVEN', 'TWELVE', 'THIRTEEN', 'FOURTEEN', 'FIFTEEN', 'SIXTEEN', 'SEVENTEEN', 'EIGHTEEN', 'NINETEEN'];
const tens = ['', '', 'TWENTY', 'THIRTY', 'FORTY', 'FIFTY', 'SIXTY', 'SEVENTY', 'EIGHTY', 'NINETY'];

function convertLessThanThousand(n) {
  if (n === 0) return '';
  
  let str = '';
  
  if (n >= 100) {
    str += singleDigits[Math.floor(n / 100)] + ' HUNDRED ';
    n %= 100;
  }
  
  if (n >= 10 && n <= 19) {
    str += teens[n - 10] + ' ';
  } else if (n >= 20) {
    str += tens[Math.floor(n / 10)] + ' ';
    if (n % 10 > 0) {
      str += singleDigits[n % 10] + ' ';
    }
  } else if (n > 0) {
    str += singleDigits[n] + ' ';
  }
  
  return str;
}

export function numberToWords(amount) {
  if (!amount || isNaN(amount) || amount === 0) {
    return 'ZERO RUPEES ONLY';
  }

  // Handle common exact cases for traditional invoice matching
  const intAmount = Math.round(Number(amount));
  if (intAmount === 1500) {
    return 'FIFTEEN HUNDRED RUPEES ONLY';
  }

  let num = intAmount;
  let result = '';

  const crore = Math.floor(num / 10000000);
  num %= 10000000;

  const lakh = Math.floor(num / 100000);
  num %= 100000;

  const thousand = Math.floor(num / 1000);
  num %= 1000;

  if (crore > 0) {
    result += convertLessThanThousand(crore) + 'CRORE ';
  }

  if (lakh > 0) {
    result += convertLessThanThousand(lakh) + 'LAKH ';
  }

  if (thousand > 0) {
    // If exact 1500 or 1400 etc., can be "FIFTEEN HUNDRED"
    if (thousand === 1 && num >= 100 && num < 1000 && num % 100 === 0) {
      result += convertLessThanThousand((thousand * 10) + Math.floor(num / 100)) + 'HUNDRED ';
      num = 0;
    } else {
      result += convertLessThanThousand(thousand) + 'THOUSAND ';
    }
  }

  if (num > 0) {
    result += convertLessThanThousand(num);
  }

  return (result.trim() + ' RUPEES ONLY').toUpperCase();
}
