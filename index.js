const express = require("express");
const app = express();
const fs = require('fs')
const mime = require('mime-types')
const openai = require("./middleware/openai");
require("dotenv").config();
const port = process.env.PORT || 7000;

const qrcode = require("qrcode-terminal");

const { Client, LocalAuth, MessageMedia } = require("whatsapp-web.js");
const client = new Client({
  authStrategy: new LocalAuth({
    clientId: "MY-id",
  }),
  puppeteer: {
    headless: true,
  },
});

client.on("qr", (qr) => {
  qrcode.generate(qr, { small: true });
});

client.on("message", async (message) => {
  let chat = await message.getChat();

  if (!chat.isGroup) {
    if (message.body.startsWith(".ai-pil")) {
      let msg = message.body.split(".ai-pil").join(" ");
      if (msg == "") {
        console.log("pesan kosong");
      } else {
        const responsePromise = openai(msg);

        // Set the response time limit to 3 minutes (180000 milliseconds)
        const response = await Promise.race([
          responsePromise,
          new Promise((resolve) => setTimeout(resolve, 180000, [])),
        ]);

        if (response.length === 0) {
          message.reply("sabar nunggu 3 min ini gratisan soalnya");
        } else {
          const reply = response[0].message.content;
          message.reply(reply);
        }
      }
    }
    else if(message.body === ".stiker" && message.hasMedia ){
       
            
            message.downloadMedia().then(media => {
               if(media){
                 const mediapath = "./downloaded"
                 if(!fs.existsSync(mediapath)){
                   fs.mkdirSync(mediapath)
                 }
                 const extension = mime.extension(media.mimetype)
                 const filename = new Date().getTime()
                 const fullname = mediapath + filename + "." + extension
                 try {
                   fs.writeFileSync(fullname,media.data,{encoding:"base64"})
                   console.log('file downloder success',fullname)
                   console.log(fullname)
                   MessageMedia.fromFilePath(filePath = fullname)
                   client.sendMessage(message.from,new MessageMedia(media.mimetype,media.data,fullname),{sendMediaAsSticker:true,stickerAuthor:"bot-pils",stickerName:"stiker"})
                   fs.unlinkSync(fullname)
                 } catch (error) {
                   console.log('file failed downloaded')
                   console.log('file deleted succses')
                 }
                 
               }
           })
        
    }
  }
});

client.on("ready", () => {
  console.log("Client is ready!");
});

client.initialize();

app.listen(port, () => {
  console.log("server running successfuly in http://localhost/7000");
});
