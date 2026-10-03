# Makanopoly

A browser board game on Singapore streets. You learn the neighbourhood and its hawker food while playing the familiar money game: salary, rent, tax, mortgages, and lock-up.

It is an unofficial game. It is not the commercial property-trading board game, and it does not use that game’s name, logo, or card text.

## Play

```bash
npm install
npm run dev
```

Open the local address Vite prints. The default match is you against Auntie May. Add seats on the title screen and turn off **Computer player** for pass-and-play on one device. A refresh keeps the match in the browser.

`npm test` checks rent, tax, mortgages, lock-up, the street quiz, and a few AI decisions.

## The board

Forty squares, priced from Tampines and Bedok up to Raffles Place and Marina Boulevard. Each street deed names the neighbourhood, one dish, and the hawker centre it belongs to — soon kueh at Tampines Round Market, chicken rice at Maxwell, satay on Boon Tat Street, and the rest of the island in between.

Four MRT lines replace the railways. PUB Water and SP Group bill from the dice. The void deck does nothing. Fines are not stored there.

## Money

- Passing GO pays a S$200 salary.
- Buying a deed turns cash into an asset that can earn rent.
- Owning a full colour set doubles the base rent.
- Houses and hotels raise rent sharply and tie up cash. Build evenly. Selling a building returns half the cost.
- A mortgage lends half the printed price. Paying it off costs that amount plus 10% interest.
- Income tax is a choice: 10% of your cash, or S$200. Luxury tax is S$100.
- If you cannot pay, buildings are sold back at half price and your deeds go to the creditor.

## Bad luck

**Go to Lock-up**, a third double, and some cards send you to lock-up. You do not collect salary on the way. While you are there you do not travel the board. Each turn you pay S$50, try to roll doubles, or play a Get Out of Lock-up card. After three failed turns you must pay S$50 and leave.

Chance and Community Chest mix hawker outings with fees and payouts such as ERP, school fees, repairs, and a neighbourhood voucher.

## Street quiz

The first time you land on a street you have not mastered, you get a three-choice question about its dish or neighbourhood. A correct answer masters the street. A wrong answer shows the right place and charges **S$50** to the bank. The AI takes the same quiz and misses about one question in four.
