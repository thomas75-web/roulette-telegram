require("dotenv").config();
const express = require("express");
const path = require("path");
const { Telegraf, Markup } = require("telegraf");
const app = express();
const bot = new Telegraf(process.env.BOT_TOKEN);
app.use(express.static("public"));
app.use(express.json());
const codesPromo = {
  0: ["ROUE0-A111", "ROUE0-B222", "ROUE0-C333"],
  5: ["ROUE5-A111", "ROUE5-B222", "ROUE5-C333"],
  10: ["ROUE10-A111", "ROUE10-B222", "ROUE10-C333"],
  20: ["ROUE20-A111", "ROUE20-B222", "ROUE20-C333"],
  30: ["ROUE30-A111", "ROUE30-B222", "ROUE30-C333"],
  50: ["ROUE50-A111", "ROUE50-B222", "ROUE50-C333"]
};
const spinsPayes = {};
function choisirGain() {
  const lots = [
    { reduction: 0, chance: 60 },
    { reduction: 5, chance: 20 },
    { reduction: 10, chance: 6 },
    { reduction: 20, chance: 4 },
    { reduction: 30, chance: 3 },
    { reduction: 50, chance: 2 },
  ];
  let total = lots.reduce((sum, lot) => sum + lot.chance, 0);
  let tirage = Math.random() * total;
  for (const lot of lots) {
    if (tirage < lot.chance) return lot.reduction;
    tirage -= lot.chance;
  }
  return 0;
}
function prendreCodePromo(gain) {
  if (!codesPromo[gain] || codesPromo[gain].length === 0) {
    return "PLUS-DE-CODE";
  }
  return codesPromo[gain].shift();
}
bot.start((ctx) => {
  ctx.reply(
    "🎡 Bienvenue sur la roulette promo !\n\nPrix : 250 Stars.\nGains possibles : 0%, 5%, 10%, 20%, 30%, 50%.",
    Markup.inlineKeyboard([
      Markup.button.callback("⭐ Acheter un spin", "acheter_spin")
    ])
  );
});
bot.action("acheter_spin", async (ctx) => {
  await ctx.answerCbQuery();
  await ctx.replyWithInvoice({
    title: "Spin roulette promo",
    description: "Un tour de roulette pour gagner un code promo.",
    payload: String(ctx.from.id),
    provider_token: "",
    currency: "XTR",
    prices: [{ label: "1 spin", amount: 250 }]
  });
});
bot.on("pre_checkout_query", (ctx) => {
  ctx.answerPreCheckoutQuery(true);
});
bot.on("successful_payment", async (ctx) => {
  const userId = ctx.from.id;
  spinsPayes[userId] = true;
  await ctx.reply(
    "✅ Paiement validé ! Tu peux maintenant ouvrir la roulette.",
    Markup.inlineKeyboard([
      Markup.button.webApp("Ouvrir la roulette", "http://localhost:3000")
    ])
  );
});
app.use(express.static("public"));
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
})
  app.post("/api/spin", (req, res) => {
  const gain = choisirGain();
  const code = prendreCodePromo(gain);
  res.json({
    gain,
    code
  });
  const gain = choisirGain();
  const code = prendreCodePromo(gain);
  res.json({
    gain,
    code
  });
if (!process.env.VERCEL) {
  app.listen(3000, () => {
    console.log("Site lancé localement");
    bot.launch();
    console.log("Bot lancé !");
  });
});
module.exports = app;