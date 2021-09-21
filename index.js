const Crawler = require("crawler");

const CURRENCIES = {
  ALTERATION:    { id: 1,  name: "Alteration"    },
  CHAOS:         { id: 4,  name: "Chaos"         },
  EXALTED:       { id: 6,  name: "Exalted"       },
  CHANCE:        { id: 9,  name: "Chance"        },
  TRANSMUTATION: { id: 22, name: "Transmutation" },
  SILVER:        { id: 35, name: "Silver"        },
  VAAL:          { id: 16, name: "Vaal"          }
}

const league = "Archnemesis";
const baseUrlPoeTrade = "https://currency.poe.trade/search";
const offers = {};

const addOfferFor = (data) => {
  if (data.stock === undefined || data.stock < data.sellvalue) return;

  const sellCurrency = CURRENCIES[Object.keys(CURRENCIES).find(key => CURRENCIES[key].id === data.sellcurrency)];
  const buyCurrency = CURRENCIES[Object.keys(CURRENCIES).find(key => CURRENCIES[key].id === data.buycurrency)];
  let fator;

  if (parseFloat(data.sellvalue) > parseFloat(data.buyvalue)) {
    fator = (parseFloat(data.sellvalue) / parseFloat(data.buyvalue));
  } else {
    fator = (parseFloat(data.buyvalue) / parseFloat(data.sellvalue));
  }

  if (offers[sellCurrency.id] === undefined) offers[sellCurrency.id] = [];

  offers[sellCurrency.id].push({
    user: data.ign,
    sellvalue: parseFloat(data.sellvalue),
    buyvalue: parseFloat(data.buyvalue),
    stock: data.stock,
    fator: fator,
    message: `${data.ign} sell ${parseFloat(data.sellvalue)} ${sellCurrency.name} by ${parseFloat(data.buyvalue)} ${buyCurrency.name}, stock ${data.stock} ${sellCurrency.name}, fator: ${fator}`
  });
};

const printOffersFor = (currency, url) => {
  console.log('\x1b[33m%s\x1b[0m', `Found ${offers[currency.id].length} offers of sell ${currency.name}`);
  console.log(`URL: ${url}`);

  offers[currency.id].forEach(offer => {
    console.log('\x1b[35m%s\x1b[0m', offer.message);
  });

  console.log();
};

const searchOffersFor = (offersCount, currency1, currency2) => {
  const buildCallback = (sellCurrency) => {
    return (error, res, done) => {
      if (error) {
        console.error(error);
      } else {
        const node = res.$(".displayoffer");

        offers[sellCurrency.id] = [];

        for(let i = 0; (i < node.length && offers[sellCurrency.id].length < offersCount); i++) {
          addOfferFor(node.eq(i).data());
        }
      }

      done();

      printOffersFor(sellCurrency, res.request.uri.href);
    };
  };

  new Crawler({
    maxConnections: 1,
    callback: buildCallback(currency1)
  }).queue(`${baseUrlPoeTrade}?league=${league}&online=x&want=${currency1.id}&have=${currency2.id}`);

  new Crawler({
    maxConnections: 1,
    callback: buildCallback(currency2)
  }).queue(`${baseUrlPoeTrade}?league=${league}&online=x&want=${currency2.id}&have=${currency1.id}`);
}



searchOffersFor(5, CURRENCIES.ALTERATION, CURRENCIES.CHAOS);

// searchOffersFor(5, CURRENCIES.TRANSMUTATION, CURRENCIES.CHAOS);

// searchOffersFor(5, CURRENCIES.CHANCE, CURRENCIES.CHAOS);

// searchOffersFor(5, CURRENCIES.SILVER, CURRENCIES.CHAOS);

// searchOffersFor(5, CURRENCIES.VAAL, CURRENCIES.CHAOS);
