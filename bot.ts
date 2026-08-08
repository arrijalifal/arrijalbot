import { Bot, InputFile, InputMediaBuilder } from "grammy";
import { instagram } from "@jerrycoder/instagram-api";
import { vidSave } from "vid-yt";
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
  const messagetext = ctx.message.text as string;
  const isInstagramLink = messagetext?.includes("instagram.com");
  const isYoutubeLink = messagetext?.includes("youtube.com") || messagetext?.includes("youtu.be");
  if (isInstagramLink) {
    ctx.reply("Memproses link Instagram...");
    try {
      const igUrl: InstagramData = await instagram(ctx.message.text);
      if (igUrl.type === "image") {
        if (!Object.keys(igUrl).includes('media_url_1')) {
          await ctx.replyWithChatAction("upload_photo");;
          return await ctx.replyWithPhoto(igUrl.url);
        }
        const mediaUrls: string[] = Object.entries(igUrl)
          .filter(([key]) => key.startsWith("media_url_"))
          .map(([, value]) => value as string);
        for (let i = 0; i < mediaUrls.length; i += 10) {
          await ctx.replyWithChatAction("upload_photo");
          const mediaGroup = mediaUrls.slice(i, i + 10)
            .map((url, index) => InputMediaBuilder.photo(url, { caption: (i + index + 1).toString() }));
          await ctx.replyWithMediaGroup(mediaGroup);
          await delay(1000);
        }
        return await ctx.reply(`Downloaded ${mediaUrls.length} photos`);
      } else if (igUrl.type === "video") {
        await ctx.replyWithChatAction("upload_video");
        return await ctx.replyWithVideo(new InputFile(new URL(igUrl.url)));
      }
      return ctx.reply(`${igUrl.type}\n${Object.keys(igUrl)}`);
    } catch (error) {
      return ctx.reply(`Terdapat error:\n${error}`);
    }
  } else if (isYoutubeLink) {
    ctx.reply("Memproses link Youtube...");
    const videoData = await vidSave.getBestVideo(messagetext);
    await ctx.replyWithChatAction("upload_video");
    if (videoData) return await ctx.replyWithVideo(
      new InputFile(
        new URL(videoData.directUrl as string)
      )
    );
    return ctx.reply("Youtube link returns nothing. Sorry!");
  } else {
    ctx.reply("This link is neither Instagram nor Youtube");
  }
});

bot.on("message", (ctx) => ctx.reply(`haloooo`));
bot.catch((err) => {
  const error = err.error;
  const ctx = err.ctx;
  ctx.reply(`Bot error: ${error}`);
})

bot.start();
