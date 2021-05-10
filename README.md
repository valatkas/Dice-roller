# Dice roller
 Dice rolling app powered by pure JS and jQuery. Randomly generated client side and server side seeds for provably fair probability calculation.
 
 
 <b>Client side seed</b>: Randomly generated 30 character long string of numbers and alphabetical characters.
 <br />
  <b>Server side seed</b>: HEX encoded randomly generated 256 character long string of numbers and alphabetical characters.
   <br />
   <b>Final hash: </b>: client side seed + server side seed + nonce(number of bets made, default: 0). SHA512 encrypted.
 <br />

Final hash is converted and stored as probability once the dice is rolled.
<br />


<p align="center">
  <img width="700" height="auto" src="https://a.pomf.cat/xiksho.jpg">
</p>
<br />
Repository can be viewed at: https://valatkas.github.io/Dice-roller/
