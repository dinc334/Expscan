// TO DO: remove to data folder
const poolsAndContracts = {
  EXP: 'EXP',
  '0X342709DE12F503A689EFA9671532A72E19A9BBC7': 'Poloniex',
  '0XC9710872D3E65EDBF7F8776829DD7B21F2085E40': 'Bittrex',
  '0X6DBFE39370ADC9E0F284ED4FD8025342E99D21D6': 'Dwarfpool',
  '0X6E4A860420E024D2F269D45F85A24DC6F586376D': 'EBS',
  '0X313C362544A92D182B3EF06C2AE786EE7692D10E': 'Cryptopia',
  '': 'expmine.pro',
  '0X00A86233F4D65F4018CA7F8626B96CE72AF05A7C': 'exp.2miners.com',
  '0X4A870254919ACE6BF7F1DC80FE6DE28299BEB6D9': 'exp.minerpool.net',
  '0XFC08A424D42B060F47F534A0B4C0233C094457E6': 'pool.expanse.tech',
  '0X77EF636EEDF371E2589EAD7631FA8FDC506DEFF8': 'exppool.mashash.org',
  '0X94C4B0F47123AD4D3DEC4C27D96EB4061AA544E0': 'exp.ethertrench.com',
  '0X100815B7130A849333B24E4472F8983563AD53F8': 'exp.mole-pool.net',
  '0X0C866505461D2302F41370C26D3BE13B04D7FAAB': 'Whalesburg',
  '0X704EE3DFD9B2AF0CFB71064E6E8EF4ED314993AC': 'clona.ru',
  '0X3021D95DF8B7E66A8FCF7F81A441DB0FA700204F': 'exp.minandoando.com',
  '0X9C3EF85668F064ED75A707A9FEF00ED55BAB01F5': 'TokenlabICO',
  '0xa9ac4dc20cfc42e7c833d328971587e76b718135': 'BadGuy',
  '0XBB94F0CEB32257275B2A7A9C094C13E469B4563E': 'DevFund',
  // '0XA887ADB722CF15BC1EFE3C6A5D879E0482E8D197': 'Tokenlab',
  '0X3B4CFCC4532EEC161860CB6544F49947544D940D': 'LAB',
  '0X4F5EC5A69DBE12C48CA1EDC9C52B1E8896AED932': 'Pex',
  '0XD1365A5AF713CDE10C6AC3FB9EDBB2BBBD4B2BA2': 'EGG',
  '0X5AB20632BAD41463680975D3AAC3320F820F1FA1': 'EGG',
  '0X56C28AA1AE5BE73FDBD73634736AE9BD1C3B78FB': 'XEGG',
  '0X331631B4BB93B9B8962FAE15860BD538A389395A': 'WEXP',
  '0X9D2761A714B5B2EFA325A8A3EEE21BE32AACEB4A': 'LOVE',
  '0X72332C512BF2DA5A7CD11752B380F7D8FCBBA847': 'T64',
  '0X9F17C654CA15D2BE76CFDF6CB806A4B8E4678EED': 'ELABLP',
  '0XC150686B8B24F0E08F1D94773D0355427C25EF0E': 'ELOVELP',
  '0XD985C19C547386D99ECA85F86C0AFCF257CE6982': 'EEGGLP',
  '0X505B2FE24AFF173291FEAD573E90DFB21C754BFD': 'ET64LP',
  '0X90390A27DBE65991CED136CA6F95FD5953C5E1B8': 'EPEXLP',
  '0X7ED2E1DAE2BE447D0153C03E1E63DD27E0F5198C': 'EWAGMILP',
  '0X2E986C6A33518915649406CAE035979249D46642': 'EPRMLP',
  '0X87EB2FDF607B46F324984771FFDF2A0396139BDF': 'PRM',
  '0X6680B66406DC1F1BCFFDBACA320F9D950E65DBA0': 'Harvest V2: Router 2',
  '0XFAF3DDCB8D17DB02E08E45F02AFB8D427669D592': 'EggSwap V2: Router 2',
  '0X0D14F385647E66283E8E5D9C567296751AC7EE7D': 'WAGMI',
  '0X54451DBE4B925AA5E312E232C6CBA2EAA0D98169': 'SVIT',
  '0XFDCDD3EE5D5D99EEDB2FCB38927378199E51A4CC': 'BRIDGE',
  '0XACFE49957B0F794455DB556B01FF5943B36B69A9': 'EggMaker',
  '0XE57F6BBC0FCF5B89B2D1AF54EA4D4A1AAEA678AD': 'EABN',
  '0XBD5870A474B7A9B112D34B24993B4F3ACF6DD874': 'VAULTZ',
}

const check = {
  checkAddress: function checkAddress(address, account) {
    const upper = address.toUpperCase()
    if (Object.keys(poolsAndContracts).includes(upper)) {
      return poolsAndContracts[upper]
    }
    if (account) {
      return address
    }
    return null
  },
}

module.exports = check
