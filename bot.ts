import { Bot, InputMediaBuilder } from "grammy";
import { instagram } from "@jerrycoder/instagram-api";
import * as dotenv from 'dotenv';

dotenv.config();

type InstagramData = {
  type: "image" | "video";
  url: string;
  thumbnail: string | null;
} & Record<`media_url_${number}`, string>;

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const bot = new Bot(process.env.BOT_TOKEN); // <-- put your bot token between the ""

// Bot Command Router Example
bot.command("start", (ctx) => ctx.reply("Selamat datang di Arrijal Bot!"));

bot.on("message::url", async (ctx) => {
  ctx.reply("Memproses link...")
  try {
    const igUrl: InstagramData = await instagram(ctx.message.text);
    if (igUrl.type === "image") {
      if (!Object.keys(igUrl).includes('media_url_1')) return ctx.replyWithPhoto(igUrl.url);
      const mediaUrls: string[] = Object.entries(igUrl)
      .filter(([key]) => key.startsWith("media_url_"))
      .map(([, value]) => value as string);
      for (let i = 0; i < mediaUrls.length; i+= 10) {
        const mediaGroup = mediaUrls.slice(i, i + 10)
        .map((url, index) => InputMediaBuilder.photo(url, {caption: (index + 1).toString()}));
        await ctx.replyWithMediaGroup(mediaGroup);
        await delay(1000);
      }
      return ctx.reply(`Downloaded ${mediaUrls.length} photos`);
    } else if (igUrl.type === "video") {
      return ctx.replyWithVideo(igUrl.url);
    }
    return ctx.reply(`${igUrl.type}\n${Object.keys(igUrl)}`);
  } catch (error) {
    return ctx.reply(`Terdapat error:\n${error}`);
  }
});

bot.on("message", (ctx) => ctx.reply(`haloooo`));

bot.start();
